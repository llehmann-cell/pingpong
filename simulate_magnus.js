import { computeGlicko2 } from './server/src/rating.js';

// Custom compute function with the proposed damping formula
function computeWithDamping({ rating, ratingDeviation, volatility, opponentRating, opponentRatingDeviation, score }) {
  const SCALE_FACTOR = 173.7178;
  const TAU = 1;
  const mu = (rating - 1500) / SCALE_FACTOR;
  const phi = ratingDeviation / SCALE_FACTOR;
  const opponentMu = (opponentRating - 1500) / SCALE_FACTOR;
  const opponentPhi = opponentRatingDeviation / SCALE_FACTOR;
  
  const g = (p) => 1 / Math.sqrt(1 + (3 * p ** 2) / Math.PI ** 2);
  const expected = (m, om, op) => 1 / (1 + Math.exp(-g(op) * (m - om)));
  
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
    while (f(a - k * TAU) < 0) { k += 1; }
    B = a - k * TAU;
  }

  let fa = f(A), fb = f(B);
  while (Math.abs(B - A) > 0.000001) {
    const C = A + ((A - B) * fa) / (fb - fa);
    const fc = f(C);
    if (fc * fb <= 0) { A = B; fa = fb; } else { fa /= 2; }
    B = C; fb = fc;
  }

  const newVolatility = Math.exp(A / 2);
  const phiStar = Math.sqrt(phi ** 2 + newVolatility ** 2);
  const newPhi = 1 / Math.sqrt(1 / phiStar ** 2 + 1 / variance);
  const newMu = mu + newPhi ** 2 * g(opponentPhi) * (score - expectation);

  const rawNewRating = newMu * SCALE_FACTOR + 1500;
  const oldRating = rating;
  let ratingDelta = rawNewRating - oldRating;

  // New Damping Formula:
  // f(R) = 1.0 - 0.58 * (R - 2500) / 500
  if (ratingDelta > 0 && oldRating > 2500) {
    const compression = Math.max(0.01, 1 - 0.58 * (oldRating - 2500) / (3000 - 2500));
    ratingDelta = ratingDelta * compression;
  }

  return {
    rating: Math.round(oldRating + ratingDelta),
    ratingDeviation: Math.round(newPhi * SCALE_FACTOR),
    volatility: newVolatility,
  };
}

let magnus = { rating: 2800, ratingDeviation: 30, volatility: 0.06 };
const opponentRating = 2800;
const opponentRD = 30;

console.log(`Début de la simulation: Joueur à ${magnus.rating} Elo`);
console.log("On simule des matchs avec 90% de victoires contre des adversaires à 2800.");

let totalMatches = 0;
let reached3000 = false;

// Simulate up to a huge number of matches to find the crossing point
for (let cycle = 1; cycle <= 1000; cycle++) {
  // 9 Wins
  for (let i = 0; i < 9; i++) {
    magnus = computeWithDamping({
      rating: magnus.rating,
      ratingDeviation: magnus.ratingDeviation,
      volatility: magnus.volatility,
      opponentRating: opponentRating,
      opponentRatingDeviation: opponentRD,
      score: 1
    });
    if (magnus.ratingDeviation < 30) magnus.ratingDeviation = 30;
    totalMatches++;
    
    if (magnus.rating >= 3000 && !reached3000) {
      console.log(`\n🎉 Palier franchi ! Il a fallu exactement ${totalMatches} matchs (avec 90% de victoires) pour passer de 2800 à ${magnus.rating} Elo.`);
      reached3000 = true;
      break;
    }
  }
  
  if (reached3000) break;

  // 1 Loss
  magnus = computeWithDamping({
    rating: magnus.rating,
    ratingDeviation: magnus.ratingDeviation,
    volatility: magnus.volatility,
    opponentRating: opponentRating,
    opponentRatingDeviation: opponentRD,
    score: 0
  });
  if (magnus.ratingDeviation < 30) magnus.ratingDeviation = 30;
  totalMatches++;

  if (cycle % 20 === 0) {
    console.log(`Après ${totalMatches} matchs : Joueur à ${magnus.rating} Elo`);
  }
}



