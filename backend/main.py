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

# Custom middleware to log requests for debugging CORS/Path issues
@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin")
    print(f"[DEBUG] Incoming {request.method} {request.url.path} from {origin}")
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Temporarily allow all for debugging CORS issues
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
    return {
        "status": "Savasetu AI is live",
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
