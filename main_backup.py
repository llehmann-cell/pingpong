import math
import datetime
from typing import Tuple
from numba import njit
from fastapi import FastAPI
from celery import Celery
import redis
from sqlalchemy.orm import Session

from database import SessionLocal, Player

SCALE_FACTOR = 250.0
TAU = 1.0
EPSILON = 0.000001
REDIS_URL = "redis://localhost:6379/0"

app = FastAPI()
celery_app = Celery('glicko_tasks', broker=REDIS_URL)
redis_client = redis.Redis.from_url(REDIS_URL)


@njit
def g_phi(phi: float) -> float:
    return 1.0 / math.sqrt(1.0 + 3.0 * phi**2 / math.pi**2)

@njit
def E_mu(mu: float, mu_j: float, phi_j: float) -> float:
    return 1.0 / (1.0 + math.exp(-g_phi(phi_j) * (mu - mu_j)))

@njit
def compute_glicko2_core(r: float, rd: float, vol: float, r_opp: float, rd_opp: float, score: float) -> Tuple[float, float, float]:
    mu = (r - 1500.0) / SCALE_FACTOR
    phi = rd / SCALE_FACTOR
    mu_j = (r_opp - 1500.0) / SCALE_FACTOR
    phi_j = rd_opp / SCALE_FACTOR

    v = 1.0 / (g_phi(phi_j)**2 * E_mu(mu, mu_j, phi_j) * (1.0 - E_mu(mu, mu_j, phi_j)))
    delta = v * g_phi(phi_j) * (score - E_mu(mu, mu_j, phi_j))

    a = math.log(vol**2)
    
    def f(x):
        ex = math.exp(x)
        return (ex * (delta**2 - phi**2 - v - ex) / (2.0 * (phi**2 + v + ex)**2)) - (x - a) / (TAU**2)

    A = a
    if delta**2 > phi**2 + v:
        B = math.log(delta**2 - phi**2 - v)
    else:
        k = 1
        while f(a - k * TAU) < 0:
            k += 1
        B = a - k * TAU

    fa, fb = f(A), f(B)
    while abs(B - A) > EPSILON:
        C = A + (A - B) * fa / (fb - fa)
        fc = f(C)
        if fc * fb <= 0:
            A, fa = B, fb
        else:
            fa /= 2.0
        B, fb = C, fc
    
    new_vol = math.exp(A / 2.0)

    phi_star = math.sqrt(phi**2 + new_vol**2)
    new_phi = 1.0 / math.sqrt(1.0 / phi_star**2 + 1.0 / v)
    new_mu = mu + new_phi**2 * g_phi(phi_j) * (score - E_mu(mu, mu_j, phi_j))

    new_rating = new_mu * SCALE_FACTOR + 1500.0
    rating_delta = new_rating - r

    # Progressive damping above 2500 Elo.
    # Tuned so that a player with a 90% win rate against top 10 players (2800 Elo)
    # can reach and stabilize just above the 3000 Elo mark (at 3015 Elo).
    if rating_delta > 0.0 and r > 2500.0:
        compression = max(0.01, 1.0 - 0.58 * (r - 2500.0) / (3000.0 - 2500.0))
        rating_delta *= compression
        new_rating = r + rating_delta

    return new_rating, (new_phi * SCALE_FACTOR), new_vol


@celery_app.task
def task_update_ranking(p1_id: int, p2_id: int, score_p1: float):
    db = SessionLocal()
    try:
        player1 = db.query(Player).filter(Player.id == p1_id).first()
        player2 = db.query(Player).filter(Player.id == p2_id).first()

        if not player1:
            player1 = Player(id=p1_id)
            db.add(player1)
        if not player2:
            player2 = Player(id=p2_id)
            db.add(player2)
            
        if not player1 or not player2:
            db.commit()

        res1 = compute_glicko2_core(player1.r, player1.rd, player1.vol, player2.r, player2.rd, score_p1)
        res2 = compute_glicko2_core(player2.r, player2.rd, player2.vol, player1.r, player1.rd, 1.0 - score_p1)

        player1.r, player1.rd, player1.vol = res1
        player2.r, player2.rd, player2.vol = res2

        db.commit()

        return f"Match traité : P1({res1[0]:.0f}) vs P2({res2[0]:.0f})"
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


@app.post("/report-match")
async def report_match(p1: int, p2: int, score_p1: float):
    today = datetime.date.today().isoformat()
    pair = f"{min(p1, p2)}:{max(p1, p2)}"
    key = f"farm:{today}:{pair}"
    
    try:
        count = redis_client.incr(key)
        if count == 1:
            redis_client.expire(key, 86400)
            
        if count > 3:
            return {"status": "rejected", "reason": "Anti-farming limit reached"}
    except Exception as e:
        pass

    task_update_ranking.delay(p1, p2, score_p1)
    return {"status": "queued", "match_count_today": count if 'count' in locals() else 0}
