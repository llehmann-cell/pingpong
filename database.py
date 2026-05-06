from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "postgresql://postgres:mon_mot_de_passe@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True, index=True)

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    pseudo = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True)
    
    # Glicko stats
    r = Column(Float, default=1000.0)
    rd = Column(Float, default=350.0)
    vol = Column(Float, default=0.06)

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    player1_id = Column(Integer, ForeignKey("players.id"))
    player2_id = Column(Integer, ForeignKey("players.id"))
    score_p1 = Column(Float, nullable=False) # 1.0, 0.5, 0.0
    status = Column(String, default="pending") # pending, accepted, rejected
    winner_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)

class Friendship(Base):
    __tablename__ = "friendships"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("players.id"))
    friend_id = Column(Integer, ForeignKey("players.id"))
    status = Column(String, default="pending") # pending, accepted

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

