import psycopg2
import redis
from fastapi import FastAPI

# --- CONFIGURATION DES CONNEXIONS ---

# Connexion à PostgreSQL (ton stockage permanent)
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        port="5432",
        database="postgres",
        user="postgres",
        password="mon_mot_de_passe"  # <--- METS TON MOT DE PASSE ICI (j'ai mis ton_mdp)
    )

# Connexion à Redis (ton système anti-farming et cache)
redis_client = redis.Redis(host='localhost', port=6379, db=0)

app = FastAPI()

# --- FONCTION POUR RÉCUPÉRER UN JOUEUR ---

def fetch_player_stats(player_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # On récupère les colonnes Glicko-2 qu'on a créées dans DBeaver
    cur.execute("SELECT rating, rd, volatility FROM players WHERE id = %s", (player_id,))
    stats = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if stats:
        return {"rating": stats[0], "rd": stats[1], "vol": stats[2]}
    return None

# --- EXEMPLE D'ENDPOINT POUR TESTER ---

@app.get("/joueur/{player_id}")
async def get_player(player_id: int):
    stats = fetch_player_stats(player_id)
    if stats:
        return {"id": player_id, "stats": stats}
    return {"error": "Joueur non trouvé"}
