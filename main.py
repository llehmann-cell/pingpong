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

    class Config:
        from_attributes = True

class MatchCreate(BaseModel):
    player2_id: int
    score_p1: float # 1.0 = win, 0.5 = draw, 0.0 = loss

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

@app.post("/match")
def report_match(match: MatchCreate, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    # Vérifier que le joueur 2 existe
    player2 = db.query(Player).filter(Player.id == match.player2_id).first()
    if not player2:
        raise HTTPException(status_code=404, detail="Adversaire introuvable")

    # Enregistrer le match en BDD
    winner_id = current_user.id if match.score_p1 > 0.5 else player2.id
    if match.score_p1 == 0.5:
        winner_id = None # Draw
        
    new_match = Match(player1_id=current_user.id, player2_id=player2.id, winner_id=winner_id)
    db.add(new_match)
    db.commit()

    # Déclencher le calcul Glicko
    task_update_ranking.delay(current_user.id, player2.id, match.score_p1)
    
    return {"status": "queued", "message": "Match enregistré, calcul Glicko en cours"}

# --- FRIENDS ---

@app.post("/friends/{friend_id}")
def add_friend(friend_id: int, current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    if friend_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous ajouter en ami")
    
    friend = db.query(Player).filter(Player.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Joueur introuvable")
        
    existing = db.query(Friendship).filter(Friendship.user_id == current_user.id, Friendship.friend_id == friend_id).first()
    if existing:
        return {"message": "Déjà amis"}
        
    new_friendship = Friendship(user_id=current_user.id, friend_id=friend_id)
    db.add(new_friendship)
    db.commit()
    return {"status": "success", "message": "Ami ajouté"}

@app.get("/friends", response_model=List[UserResponse])
def get_friends(current_user: Player = Depends(get_current_user), db: Session = Depends(get_db)):
    friendships = db.query(Friendship).filter(Friendship.user_id == current_user.id).all()
    friend_ids = [f.friend_id for f in friendships]
    friends = db.query(Player).filter(Player.id.in_(friend_ids)).all()
    return friends

@app.get("/players", response_model=List[UserResponse])
def search_players(q: str = "", db: Session = Depends(get_db)):
    players = db.query(Player).filter(Player.pseudo.ilike(f"%{q}%")).limit(20).all()
    return players
