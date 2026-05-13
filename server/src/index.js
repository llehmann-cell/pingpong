import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { requireAuth, signToken } from './auth.js';
import { pool, query } from './db.js';
import { computeGlicko2 } from './rating.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET;
const configuredOrigins = String(process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

function isLocalDevOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) {
    return true;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
    origin
  );
}

app.use(
  cors({
    origin(origin, callback) {
      if (isLocalDevOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '64kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

function userSelect() {
  return 'id, email, name, rating, rating_deviation as "ratingDeviation", volatility';
}

function scoreFromResult(result) {
  if (result === 'draw') {
    return 0.5;
  }
  return result === 'loss' ? 0 : 1;
}

function winnerIdFromResult(result, player1Id, player2Id) {
  if (result === 'draw') {
    return null;
  }
  return result === 'win' ? player1Id : player2Id;
}

app.post('/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const name = String(req.body.name || '').trim() || email.split('@')[0] || 'Player';
  const password = String(req.body.password || '');

  if (!email.includes('@') || password.length < 8) {
    return res.status(400).json({ error: 'Use a valid email and an 8+ character password' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await query(
      `insert into users (email, password_hash, name)
       values ($1, $2, $3)
       returning ${userSelect()}`,
      [email, passwordHash, name]
    );
    const user = result.rows[0];
    return res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account already exists for this email' });
    }
    throw error;
  }
});

app.post('/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const result = await query(
    `select ${userSelect()}, password_hash from users where email = $1`,
    [email]
  );

  if (!result.rowCount) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  delete user.password_hash;
  return res.json({ token: signToken(user), user });
});

app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/tables', requireAuth, async (_req, res) => {
  const result = await query(
    `select name, area, address, legend, visits, format, crowd, pin_x as x, pin_y as y
     from table_spots
     order by name`
  );
  res.json({ tables: result.rows });
});

app.get('/opponents/notes', requireAuth, async (req, res) => {
  const result = await query(
    `select opponent_name as "opponentName", feeling, feedback, note, updated_at as "updatedAt"
     from opponent_notes
     where user_id = $1
     order by updated_at desc`,
    [req.user.id]
  );
  res.json({ notes: result.rows });
});

app.get('/players', requireAuth, async (req, res) => {
  const q = String(req.query.q || '').trim();
  const result = await query(
    `select id, name, rating, rating_deviation as "ratingDeviation", volatility
     from users
     where id <> $1 and ($2 = '' or name ilike '%' || $2 || '%' or email ilike '%' || $2 || '%')
     order by rating desc
     limit 20`,
    [req.user.id, q]
  );
  res.json({ players: result.rows });
});

app.get('/matches/pending', requireAuth, async (req, res) => {
  const result = await query(
    `select
       m.id,
       m.user_id as "player1Id",
       u.name as "player1Name",
       m.opponent_name as "opponentName",
       m.result,
       m.score_p1 as "scoreP1",
       m.sets,
       m.score,
       m.feeling,
       m.feedback,
       m.created_at as "createdAt"
     from matches m
     join users u on u.id = m.user_id
     where m.opponent_user_id = $1 and m.status = 'pending'
     order by m.created_at desc`,
    [req.user.id]
  );
  res.json({ matches: result.rows });
});

app.post('/matches', requireAuth, async (req, res) => {
  const opponentName = String(req.body.opponentName || '').trim();
  const opponentUserId = req.body.opponentUserId || null;
  const result = ['win', 'loss', 'draw'].includes(req.body.result) ? req.body.result : 'win';
  const feeling = String(req.body.feeling || '').trim();
  const feedback = String(req.body.feedback || '').trim();
  const note = String(req.body.note || '').trim();
  const sets = req.body.sets || {};
  const score = req.body.score || {};
  const scoreP1 = scoreFromResult(result);

  if (!opponentName) {
    return res.status(400).json({ error: 'Opponent name is required' });
  }

  let opponent = null;
  if (opponentUserId) {
    const opponentResult = await query(`select ${userSelect()} from users where id = $1`, [opponentUserId]);
    if (!opponentResult.rowCount) {
      return res.status(404).json({ error: 'Opponent user not found' });
    }
    opponent = opponentResult.rows[0];

    if (opponent.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot report a match against yourself' });
    }
  }

  const status = opponent ? 'pending' : 'logged';
  const winnerId = opponent ? winnerIdFromResult(result, req.user.id, opponent.id) : null;

  const match = await query(
    `insert into matches (
       user_id,
       opponent_user_id,
       opponent_name,
       opponent_rating,
       result,
       score_p1,
       status,
       winner_id,
       rating_delta,
       rating_update_status,
       sets,
       score,
       feeling,
       feedback
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11, $12, $13)
     returning
       id,
       opponent_user_id as "opponentUserId",
       opponent_name as "opponentName",
       result,
       score_p1 as "scoreP1",
       status,
       rating_delta as "ratingDelta",
       rating_update_status as "ratingUpdateStatus",
       created_at as "createdAt"`,
    [
      req.user.id,
      opponent?.id || null,
      opponent?.name || opponentName,
      opponent?.rating || Number(req.body.opponentRating || 1500),
      result,
      scoreP1,
      status,
      winnerId,
      opponent ? 'pending_confirmation' : 'not_applicable',
      JSON.stringify(sets),
      JSON.stringify(score),
      feeling,
      feedback,
    ]
  );

  if (feeling || feedback || note) {
    await query(
      `insert into opponent_notes (user_id, opponent_name, feeling, feedback, note)
       values ($1, $2, $3, $4, $5)
       on conflict (user_id, opponent_name)
       do update set
         feeling = excluded.feeling,
         feedback = excluded.feedback,
         note = excluded.note,
         updated_at = now()`,
      [req.user.id, opponentName, feeling, feedback, note]
    );
  }

  res.status(201).json({ match: match.rows[0] });
});

app.patch('/matches/:id/confirm', requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('begin');

    const matchResult = await client.query(
      `select *
       from matches
       where id = $1 and opponent_user_id = $2
       for update`,
      [req.params.id, req.user.id]
    );

    if (!matchResult.rowCount) {
      await client.query('rollback');
      return res.status(404).json({ error: 'Pending match not found for this user' });
    }

    const match = matchResult.rows[0];
    if (match.status !== 'pending') {
      await client.query('rollback');
      return res.status(400).json({ error: 'This match has already been handled' });
    }

    const antiFarmResult = await client.query(
      `select count(*)::int as count
       from matches
       where status = 'accepted'
         and created_at >= date_trunc('day', now())
         and (
           (user_id = $1 and opponent_user_id = $2) or
           (user_id = $2 and opponent_user_id = $1)
         )`,
      [match.user_id, match.opponent_user_id]
    );

    if (antiFarmResult.rows[0].count >= 3) {
      await client.query('rollback');
      return res.status(429).json({
        error: 'Anti-farming limit reached: these players already have 3 ranked matches today',
      });
    }

    const players = await client.query(
      `select ${userSelect()}
       from users
       where id in ($1, $2)
       for update`,
      [match.user_id, match.opponent_user_id]
    );
    const player1 = players.rows.find((player) => player.id === match.user_id);
    const player2 = players.rows.find((player) => player.id === match.opponent_user_id);

    if (!player1 || !player2) {
      await client.query('rollback');
      return res.status(404).json({ error: 'One of the match players no longer exists' });
    }

    const scoreP1 = Number(match.score_p1);
    const nextP1 = computeGlicko2({
      rating: Number(player1.rating),
      ratingDeviation: Number(player1.ratingDeviation),
      volatility: Number(player1.volatility),
      opponentRating: Number(player2.rating),
      opponentRatingDeviation: Number(player2.ratingDeviation),
      score: scoreP1,
    });
    const nextP2 = computeGlicko2({
      rating: Number(player2.rating),
      ratingDeviation: Number(player2.ratingDeviation),
      volatility: Number(player2.volatility),
      opponentRating: Number(player1.rating),
      opponentRatingDeviation: Number(player1.ratingDeviation),
      score: 1 - scoreP1,
    });
    const ratingDelta = nextP1.rating - Number(player1.rating);

    await client.query(
      `update users
       set rating = $1, rating_deviation = $2, volatility = $3
       where id = $4`,
      [nextP1.rating, nextP1.ratingDeviation, nextP1.volatility, player1.id]
    );
    await client.query(
      `update users
       set rating = $1, rating_deviation = $2, volatility = $3
       where id = $4`,
      [nextP2.rating, nextP2.ratingDeviation, nextP2.volatility, player2.id]
    );

    const updatedMatch = await client.query(
      `update matches
       set status = 'accepted',
           rating_delta = $1,
           rating_update_status = 'applied',
           accepted_at = now(),
           resolved_at = now()
       where id = $2
       returning
         id,
         opponent_name as "opponentName",
         result,
         score_p1 as "scoreP1",
         status,
         rating_delta as "ratingDelta",
         rating_update_status as "ratingUpdateStatus",
         accepted_at as "acceptedAt"`,
      [ratingDelta, match.id]
    );

    const currentUserResult = await client.query(`select ${userSelect()} from users where id = $1`, [req.user.id]);

    await client.query('commit');
    return res.json({
      match: updatedMatch.rows[0],
      user: currentUserResult.rows[0],
      rating: {
        player1: nextP1,
        player2: nextP2,
      },
    });
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
});

app.patch('/matches/:id/contest', requireAuth, async (req, res) => {
  const result = await query(
    `update matches
     set status = 'contested',
         rating_update_status = 'not_applicable',
         resolved_at = now()
     where id = $1 and opponent_user_id = $2 and status = 'pending'
     returning id, status, resolved_at as "resolvedAt"`,
    [req.params.id, req.user.id]
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: 'Pending match not found for this user' });
  }

  res.json({ match: result.rows[0] });
});

app.patch('/matches/:id/reject', requireAuth, async (req, res) => {
  const result = await query(
    `update matches
     set status = 'rejected',
         rating_update_status = 'not_applicable',
         resolved_at = now()
     where id = $1 and opponent_user_id = $2 and status = 'pending'
     returning id, status, resolved_at as "resolvedAt"`,
    [req.params.id, req.user.id]
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: 'Pending match not found for this user' });
  }

  res.json({ match: result.rows[0] });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Server error' });
});

app.listen(port, () => {
  console.log(`PingPang API listening on http://localhost:${port}`);
});
