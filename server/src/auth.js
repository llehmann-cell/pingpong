import jwt from 'jsonwebtoken';
import { query } from './db.js';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '14d' }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing auth token' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'select id, email, name, rating, rating_deviation as "ratingDeviation", volatility from users where id = $1',
      [payload.sub]
    );

    if (!result.rowCount) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid auth token' });
  }
}
