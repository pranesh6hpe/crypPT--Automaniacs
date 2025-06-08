from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_db, Coin
from sqlalchemy.orm import Session
from app.fetcher import fetch_and_store_data
from fastapi.responses import JSONResponse

app = FastAPI()

# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    fetch_and_store_data()

@app.get("/coins")
def get_coins():
    db = get_db()
    coins = db.query(Coin).all()
    return coins
