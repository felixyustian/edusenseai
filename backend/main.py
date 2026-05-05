"""
EduSense AI - Backend API
Powered by FastAPI + Anthropic Claude
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from routers import courses, quiz, tutor, analytics, auth, progress
from database.db import init_db

app = FastAPI(
    title="EduSense AI API",
    description="AI-powered adaptive learning platform backend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router,       prefix="/api/auth",      tags=["Authentication"])
app.include_router(courses.router,    prefix="/api/courses",   tags=["Courses"])
app.include_router(quiz.router,       prefix="/api/quiz",      tags=["Quiz"])
app.include_router(tutor.router,      prefix="/api/tutor",     tags=["AI Tutor"])
app.include_router(analytics.router,  prefix="/api/analytics", tags=["Analytics"])
app.include_router(progress.router,   prefix="/api/progress",  tags=["Progress"])


@app.on_event("startup")
async def startup_event():
    """Initialize the database on startup."""
    init_db()
    print("✅ EduSense AI Backend started successfully!")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "EduSense AI", "version": "1.0.0"}


@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
