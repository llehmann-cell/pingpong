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

    # Relationships
    clubs_owned = relationship("Club", back_populates="owner")
    club_memberships = relationship("ClubMember", back_populates="player")

    @property
    def club_id(self):
        for membership in self.club_memberships:
            if membership.status == "accepted":
                return membership.club_id
        return None

    @property
    def club_name(self):
        for membership in self.club_memberships:
            if membership.status == "accepted":
                if membership.club:
                    return membership.club.name
        return None

    @property
    def club_role(self):
        for membership in self.club_memberships:
            if membership.status == "accepted":
                return membership.role
        return None

    @property
    def pending_club_id(self):
        for membership in self.club_memberships:
            if membership.status == "pending":
                return membership.club_id
        return None

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

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("Player", back_populates="clubs_owned")
    members = relationship("ClubMember", back_populates="club")

class ClubMember(Base):
    __tablename__ = "club_members"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    role = Column(String, default="member") # owner, admin, member
    status = Column(String, default="pending") # pending, accepted
    joined_at = Column(DateTime, default=datetime.utcnow)

    club = relationship("Club", back_populates="members")
    player = relationship("Player", back_populates="club_memberships")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)

