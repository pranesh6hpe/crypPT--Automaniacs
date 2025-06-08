from sqlalchemy import create_engine, Column, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = "sqlite:///./crypto_snapshot.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Coin(Base):
    __tablename__ = "snapshot"
    name = Column(String, primary_key=True)
    symbol = Column(String)
    current_price = Column(Float)
    market_cap = Column(Float)
    total_volume = Column(Float)
    price_change_24h = Column(Float)
    price_change_pct_24h = Column(Float)
    image = Column(String)
    last_updated = Column(String)
    recorded_at = Column(String)

def get_db():
    Base.metadata.create_all(bind=engine)
    return SessionLocal()
