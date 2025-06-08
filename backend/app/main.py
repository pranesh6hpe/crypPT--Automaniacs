from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import get_db, Coin
from sqlalchemy.orm import Session
from app.fetcher import fetch_and_store_data
import httpx
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv(dotenv_path="./backend/.env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("⚠️ Error: GROQ_API_KEY not found. Check .env file!")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with React domain in production
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

@app.post("/api/chat")
async def proxy_groq_chat(request: Request):
    try:
        body = await request.json()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=body
            )

        try:
            return JSONResponse(status_code=response.status_code, content=response.json())
        except Exception:
            return JSONResponse(status_code=response.status_code, content={"error": "Non-JSON response from Groq"})

    except Exception as e:
        return JSONResponse(status_code=500, content={
            "error": "Failed to contact Groq",
            "details": str(e)
        })
print("Loaded GROQ_API_KEY:", GROQ_API_KEY)
