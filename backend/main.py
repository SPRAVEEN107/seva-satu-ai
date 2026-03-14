from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from services.db_service import get_pool, close_pool
from routers import auth, ai_chat, schemes, eligibility, grievance, applications


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB pool
    try:
        await get_pool()
        print("[DB] Database pool initialized")
    except Exception as e:
        print(f"[DB] Database unavailable (running in mock mode): {e}")
    yield
    # Shutdown: close DB pool
    await close_pool()
    print("[DB] Database pool closed")


app = FastAPI(
    title="Savasetu AI",
    description="AI-powered Citizen–Government Bridge for Rural India",
    version="1.0.1",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://savasetu.vercel.app",
        "https://savasetu-ai.vercel.app",
        "https://seva-satu-ai.vercel.app",
        "https://sevasetu-ai.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,         prefix="/auth",         tags=["Authentication"])
app.include_router(ai_chat.router,      prefix="/ai-chat",      tags=["AI Chat"])
app.include_router(schemes.router,      prefix="/schemes",      tags=["Schemes"])
app.include_router(eligibility.router,  prefix="/eligibility",  tags=["Eligibility"])
app.include_router(grievance.router,    prefix="/grievance",    tags=["Grievance"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])


@app.get("/health", tags=["Health"])
async def health_check():
    db_status = "Connected"
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
    except Exception as e:
        db_status = f"Disconnected: {str(e)}"

    return {
        "status": "Savasetu AI is live",
        "database": db_status,
        "version": "1.0.1",
        "tagline": "One AI platform connecting every citizen to every government service",
    }


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Welcome to Savasetu AI API",
        "docs": "/docs",
        "health": "/health",
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
