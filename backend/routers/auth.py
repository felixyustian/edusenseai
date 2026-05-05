"""Authentication router - login, register, profile"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional

from database.db import get_db, User

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "edusenseai-secret-key-change-in-production"
ALGORITHM  = "HS256"
TOKEN_EXP_HOURS = 24 * 7   # 7 days


def create_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXP_HOURS)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    xp: int
    level: int
    streak: int
    avatar: str

    class Config:
        from_attributes = True


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        name=body.name,
        email=body.email,
        password_hash=pwd_ctx.hash(body.password),
        role=body.role or "student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {"token": token, "user": UserOut.from_orm(user)}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd_ctx.verify(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    # Update last_active and streak
    user.last_active = datetime.utcnow()
    db.commit()
    token = create_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {"token": token, "user": UserOut.from_orm(user)}


@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    payload = verify_token(token)
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(404, "User not found")
    return UserOut.from_orm(user)


@router.get("/demo-login")
def demo_login(db: Session = Depends(get_db)):
    """Quick demo login — returns a token for the demo student account."""
    user = db.query(User).filter(User.email == "student@edusenseai.com").first()
    if not user:
        raise HTTPException(404, "Demo account not found")
    token = create_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {"token": token, "user": UserOut.from_orm(user)}
