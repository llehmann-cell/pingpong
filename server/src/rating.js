const SCALE_FACTOR = 173.7178;
const TAU = 1;
const EPSILON = 0.000001;

function g(phi) {
  return 1 / Math.sqrt(1 + (3 * phi ** 2) / Math.PI ** 2);
}

function expected(mu, opponentMu, opponentPhi) {
  return 1 / (1 + Math.exp(-g(opponentPhi) * (mu - opponentMu)));
}

export function computeGlicko2({
  rating,
  ratingDeviation,
  volatility,
  opponentRating,
  opponentRatingDeviation = 350,
  score,
}) {
  const mu = (rating - 1500) / SCALE_FACTOR;
  const phi = ratingDeviation / SCALE_FACTOR;
  const opponentMu = (opponentRating - 1500) / SCALE_FACTOR;
  const opponentPhi = opponentRatingDeviation / SCALE_FACTOR;
  const expectation = expected(mu, opponentMu, opponentPhi);
  const variance = 1 / (g(opponentPhi) ** 2 * expectation * (1 - expectation));
  const delta = variance * g(opponentPhi) * (score - expectation);
  const a = Math.log(volatility ** 2);

  function f(x) {
    const ex = Math.exp(x);
    return (
      (ex * (delta ** 2 - phi ** 2 - variance - ex)) / (2 * (phi ** 2 + variance + ex) ** 2) -
      (x - a) / TAU ** 2
    );
  }

  let A = a;
  let B;

  if (delta ** 2 > phi ** 2 + variance) {
    B = Math.log(delta ** 2 - phi ** 2 - variance);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) {
      k += 1;
    }
    B = a - k * TAU;
  }

  let fa = f(A);
  let fb = f(B);

  while (Math.abs(B - A) > EPSILON) {
    const C = A + ((A - B) * fa) / (fb - fa);
    const fc = f(C);

    if (fc * fb <= 0) {
      A = B;
      fa = fb;
    } else {
      fa /= 2;
    }

    B = C;
    fb = fc;
  }

  const newVolatility = Math.exp(A / 2);
  const phiStar = Math.sqrt(phi ** 2 + newVolatility ** 2);
  const newPhi = 1 / Math.sqrt(1 / phiStar ** 2 + 1 / variance);
  const newMu = mu + newPhi ** 2 * g(opponentPhi) * (score - expectation);

  let newRating = Math.round(newMu * SCALE_FACTOR + 1500);
  const oldRating = rating;
  let ratingDelta = newRating - oldRating;

  // Progressive damping above 2500 Elo.
  // Tuned so that a player with a 90% win rate against top 10 players (2800 Elo)
  // can reach and stabilize just above the 3000 Elo mark (at 3015 Elo).
  if (ratingDelta > 0 && oldRating > 2500) {
    const compression = Math.max(0.01, 1 - 0.58 * (oldRating - 2500) / (3000 - 2500));
    ratingDelta = Math.round(ratingDelta * compression);
    newRating = oldRating + ratingDelta;
  }

  return {
    rating: newRating,
    ratingDeviation: Math.round(newPhi * SCALE_FACTOR),
    volatility: newVolatility,
  };
}
