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
load_dotenv(dotenv_path=".env")

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
        print("🔍 Received body:", body)

        # Basic validation of request payload
        if not isinstance(body.get("messages"), list) or "model" not in body:
            return JSONResponse(status_code=400, content={
                "error": "Request must include 'model' and 'messages' list"
            })

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=body
            )

        # Log Groq API response for debugging
        print(f"🔁 Groq API responded with status {response.status_code}")
        print("📦 Groq Response Content:", response.text)

        try:
            return JSONResponse(status_code=response.status_code, content=response.json())
        except Exception:
            return JSONResponse(status_code=response.status_code, content={
                "error": "Groq returned a non-JSON response",
                "details": response.text
            })

    except Exception as e:
        print("❌ Exception while contacting Groq:", str(e))
        return JSONResponse(status_code=500, content={
            "error": "Failed to contact Groq",
            "details": str(e)
        })
