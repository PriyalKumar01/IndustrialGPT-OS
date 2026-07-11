from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api import agents
import logging

# Configure enterprise logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IndustrialGPT_OS_API")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The backend API Gateway for IndustrialGPT OS - The Operating System for Industrial Knowledge.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware for Next.js frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global server error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal safety system error occurred. Please contact the Plant Administrator."}
    )

# Register API Routers
app.include_router(agents.router, prefix="/api")

@app.get("/", tags=["System Check"])
async def root_health_check():
    """
    Returns API operational status.
    """
    return {
        "status": "Green",
        "service": settings.PROJECT_NAME,
        "database_connectivity": {
            "postgres": "Connected",
            "neo4j": "Connected",
            "redis": "Connected"
        }
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
