from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
import bcrypt

from database import SessionLocal, Player, Match, Friendship, engine, Base
import redis
from main_backup import task_update_ranking

REDIS_URL = "redis://localhost:6379/0"
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

# Constants for Auth
SECRET_KEY = "votre_cle_secrete_super_securisee" # En production, utiliser une variable d'environnement
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 semaine

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ping Pang Paris API")

# Setup CORS for web preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

# Setup Admin account if not exists
def init_db():
    db = SessionLocal()
    admin = db.query(Player).filter(Player.pseudo == "admin").first()
    if not admin:
        hashed_password = get_password_hash("2cb")
        admin = Player(email="admin@pingpang.paris", pseudo="admin", hashed_password=hashed_password, is_admin=True)
        db.add(admin)
        db.commit()
    db.close()

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    pseudo: str
    password: str

class UserResponse(BaseModel):
    id: int
    pseudo: str
    r: float
    rd: float
    vol: float
    is_admin: bool
    country_id: Optional[int] = None

    class Config:
        from_attributes = True

class RankingEntry(BaseModel):
    rank: int
    id: int
    pseudo: str
    r: float
    rd: float
    country_id: Optional[int] = None

    class Config:
        from_attributes = True

class CountryResponse(BaseModel):
    id: int
    name: str
    code: Optional[str] = None

    class Config:
        from_attributes = True

class MatchCreate(BaseModel):
    player2_id: int
    score_p1: float # 1.0 = win, 0.5 = draw, 0.0 = loss

class MatchResponse(BaseModel):
    id: int
    player1_id: int
    player2_id: int
    score_p1: float
    status: str
    winner_id: Optional[int]
    date: datetime

    class Config:
        from_attributes = True

class FriendshipResponse(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- AUTHENTICATION ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        pseudo: str = payload.get("sub")
        if pseudo is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(Player).filter(Player.pseudo == pseudo).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(Player).filter((Player.email == user.email) | (Player.pseudo == user.pseudo)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email ou pseudo déjà utilisé")
    
    hashed_password = get_password_hash(user.password)
    new_user = Player(email=user.email, pseudo=user.pseudo, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Player).filter(Player.pseudo == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.pseudo}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
def read_users_me(current_user: Player = Depends(get_current_user)):
    return current_user

# --- MATCHES ---

@app.post("/match", response_model=MatchResponse)
def report_match(match: MatchCreate, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Étape 1 du workflow : Le joueur A déclare le résultat.
    Le match est créé en status 'pending'. Aucun calcul Elo n'est fait à ce stade.
    Le joueur B doit valider via PATCH /match/{id}/confirm.
    """
    if match.score_p1 not in [0.0, 0.5, 1.0]:
        raise HTTPException(status_code=400, detail="score_p1 doit être 0.0 (défaite), 0.5 (nul) ou 1.0 (victoire)")

    player2 = db.query(Player).filter(Player.id == match.player2_id).first()
    if not player2:
        raise HTTPException(status_code=404, detail="Adversaire introuvable")

    if player2.id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas jouer contre vous-même")

    # Déterminer le gagnant provisoire (sera confirmé après validation)
    if match.score_p1 == 1.0:
        winner_id = current_user.id
    elif match.score_p1 == 0.0:
        winner_id = player2.id
    else:
        winner_id = None  # Nul

    new_match = Match(
        player1_id=current_user.id,
        player2_id=player2.id,
        score_p1=match.score_p1,
        winner_id=winner_id,
        status="pending"  # ← En attente de confirmation par le joueur B
    )
    db.add(new_match)
    db.commit()
    db.refresh(new_match)

    # PAS de calcul Elo ici — uniquement après validation du joueur B
    return new_match


@app.patch("/match/{match_id}/confirm", response_model=MatchResponse)
def confirm_match(match_id: int, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Étape 2a du workflow : Le joueur B valide le score déclaré par le joueur A.
    C'est ici que le calcul Glicko-2 est déclenché.
    Inclut une protection anti-farming via Redis (max 3 matchs/jour entre deux joueurs).
    """
    match = db.query(Match).filter(Match.id == match_id, Match.player2_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match introuvable ou vous n'êtes pas le joueur 2")
    if match.status != "pending":
        raise HTTPException(status_code=400, detail="Ce match a déjà été traité")

    # --- Protection anti-farming (Redis) ---
    try:
        import datetime as dt
        today = dt.date.today().isoformat()
        pair = f"{min(match.player1_id, match.player2_id)}:{max(match.player1_id, match.player2_id)}"
        key = f"farm:{today}:{pair}"
        count = redis_client.incr(key)
        if count == 1:
            redis_client.expire(key, 86400)  # Expire en fin de journée
        if count > 3:
            raise HTTPException(
                status_code=429,
                detail=f"Anti-farming : ces deux joueurs ont déjà joué {count - 1} matchs classés aujourd'hui (max 3)."
            )
    except HTTPException:
        raise
    except Exception:
        pass  # Redis indisponible : on laisse passer sans bloquer

    # --- Mise à jour du statut ---
    match.status = "accepted"
    db.commit()
    db.refresh(match)

    # --- Déclencher le calcul Glicko-2 UNIQUEMENT après validation ---
    task_update_ranking.delay(match.player1_id, match.player2_id, match.score_p1)

    return match


@app.patch("/match/{match_id}/contest")
def contest_match(match_id: int, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Étape 2b du workflow : Le joueur B conteste le score déclaré.
    Le match passe en status 'contested'. Aucun Elo n'est calculé.
    Un admin peut résoudre les matchs contestés.
    """
    match = db.query(Match).filter(Match.id == match_id, Match.player2_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match introuvable ou vous n'êtes pas le joueur 2")
    if match.status != "pending":
        raise HTTPException(status_code=400, detail="Ce match a déjà été traité")
    match.status = "contested"
    db.commit()
    return {"status": "contested", "message": "Score contesté. Un admin peut résoudre ce litige.", "match_id": match_id}


@app.patch("/match/{match_id}/reject")
def reject_match(match_id: int, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Alternative : Le joueur B rejette complètement un match (erreur de déclaration).
    Le match passe en status 'rejected'. Aucun Elo n'est calculé.
    """
    match = db.query(Match).filter(Match.id == match_id, Match.player2_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match introuvable ou vous n'êtes pas le joueur 2")
    if match.status != "pending":
        raise HTTPException(status_code=400, detail="Ce match a déjà été traité")
    match.status = "rejected"
    db.commit()
    return {"status": "rejected", "message": "Match rejeté. Aucune modification Elo.", "match_id": match_id}


@app.get("/match/pending", response_model=List[MatchResponse])
def get_pending_matches(current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retourne les matchs en attente de votre validation (vous êtes le joueur 2)."""
    matches = db.query(Match).filter(
        Match.player2_id == current_user.id,
        Match.status == "pending"
    ).all()
    return matches


@app.get("/match/contested", response_model=List[MatchResponse])
def get_contested_matches(current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """[Admin] Retourne tous les matchs contestés en attente de résolution."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    matches = db.query(Match).filter(Match.status == "contested").all()
    return matches


@app.patch("/match/{match_id}/resolve", response_model=MatchResponse)
def resolve_contested_match(
    match_id: int,
    score_p1: float,
    current_user: Player = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[Admin] Résout un match contesté en définissant le score final."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    if score_p1 not in [0.0, 0.5, 1.0]:
        raise HTTPException(status_code=400, detail="score_p1 invalide")

    match = db.query(Match).filter(Match.id == match_id, Match.status == "contested").first()
    if not match:
        raise HTTPException(status_code=404, detail="Match contesté introuvable")

    match.score_p1 = score_p1
    match.winner_id = match.player1_id if score_p1 == 1.0 else (match.player2_id if score_p1 == 0.0 else None)
    match.status = "accepted"
    db.commit()
    db.refresh(match)

    # Déclencher le calcul Glicko après résolution admin
    task_update_ranking.delay(match.player1_id, match.player2_id, score_p1)

    return match

# --- FRIENDS ---

@app.post("/friends/{friend_id}", response_model=FriendshipResponse)
def send_friend_request(friend_id: int, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """Envoie une demande d'ami (status = pending)."""
    if friend_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous ajouter en ami")

    friend = db.query(Player).filter(Player.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Joueur introuvable")

    # Vérifier s'il existe déjà une demande dans un sens ou dans l'autre
    existing = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == current_user.id))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Relation déjà existante (status: {existing.status})")

    new_friendship = Friendship(user_id=current_user.id, friend_id=friend_id, status="pending")
    db.add(new_friendship)
    db.commit()
    db.refresh(new_friendship)
    return new_friendship

@app.patch("/friends/{friendship_id}/accept", response_model=FriendshipResponse)
def accept_friend_request(friendship_id: int, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """Accepte une demande d'ami reçue."""
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        Friendship.friend_id == current_user.id,  # Seul le destinataire peut accepter
        Friendship.status == "pending"
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Demande introuvable ou déjà traitée")
    friendship.status = "accepted"
    db.commit()
    db.refresh(friendship)
    return friendship

@app.delete("/friends/{friendship_id}")
def reject_or_remove_friend(friendship_id: int, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """Refuse une demande d'ami ou supprime une amitié existante."""
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        (Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id)
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Relation introuvable")
    db.delete(friendship)
    db.commit()
    return {"status": "success", "message": "Relation supprimée"}

@app.get("/friends", response_model=List[UserResponse])
def get_friends(current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retourne la liste des amis acceptés."""
    friendships = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id)),
        Friendship.status == "accepted"
    ).all()
    # Récupérer l'ID de l'autre joueur dans chaque relation
    friend_ids = [
        f.friend_id if f.user_id == current_user.id else f.user_id
        for f in friendships
    ]
    friends = db.query(Player).filter(Player.id.in_(friend_ids)).all()
    return friends

@app.get("/friends/requests", response_model=List[FriendshipResponse])
def get_friend_requests(current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retourne les demandes d'amis reçues et en attente."""
    requests = db.query(Friendship).filter(
        Friendship.friend_id == current_user.id,
        Friendship.status == "pending"
    ).all()
    return requests

@app.get("/players", response_model=List[UserResponse])
def search_players(q: str = "", db: Session = Depends(get_db)):
    players = db.query(Player).filter(Player.pseudo.ilike(f"%{q}%")).limit(20).all()
    return players


# --- RANKING ---

from database import Country

@app.get("/ranking", response_model=List[RankingEntry])
def get_world_ranking(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Classement mondial trié par rating Glicko-2 (r) décroissant.
    Retourne le rang de chaque joueur.
    """
    players = (
        db.query(Player)
        .order_by(Player.r.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        RankingEntry(rank=offset + i + 1, id=p.id, pseudo=p.pseudo, r=p.r, rd=p.rd, country_id=p.country_id)
        for i, p in enumerate(players)
    ]


@app.get("/ranking/country/{country_id}", response_model=List[RankingEntry])
def get_country_ranking(
    country_id: int,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Classement national pour un pays donné."""
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Pays introuvable")
    players = (
        db.query(Player)
        .filter(Player.country_id == country_id)
        .order_by(Player.r.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        RankingEntry(rank=offset + i + 1, id=p.id, pseudo=p.pseudo, r=p.r, rd=p.rd, country_id=p.country_id)
        for i, p in enumerate(players)
    ]


@app.get("/ranking/me", response_model=RankingEntry)
def get_my_rank(current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retourne le rang mondial du joueur connecté."""
    better_count = db.query(Player).filter(Player.r > current_user.r).count()
    rank = better_count + 1
    return RankingEntry(
        rank=rank,
        id=current_user.id,
        pseudo=current_user.pseudo,
        r=current_user.r,
        rd=current_user.rd,
        country_id=current_user.country_id
    )


@app.get("/countries", response_model=List[CountryResponse])
def get_countries(q: str = "", db: Session = Depends(get_db)):
    """Liste des pays (avec recherche optionnelle par nom)."""
    query = db.query(Country)
    if q:
        query = query.filter(Country.name.ilike(f"%{q}%"))
    return query.order_by(Country.name).all()


@app.get("/countries/{country_id}", response_model=CountryResponse)
def get_country(country_id: int, db: Session = Depends(get_db)):
    """Retourne un pays par son ID."""
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Pays introuvable")
    return country
