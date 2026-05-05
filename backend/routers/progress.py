"""Progress tracking router"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import get_db, User, QuizAttempt, Enrollment, UserBadge, Badge

router = APIRouter()


@router.get("/{user_id}")
def get_progress(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()

    # XP progress to next level
    xp_for_next = (user.level) * 500
    xp_current_level = (user.level - 1) * 500
    xp_progress = user.xp - xp_current_level
    xp_needed = xp_for_next - xp_current_level
    level_pct = round((xp_progress / xp_needed) * 100, 1) if xp_needed > 0 else 100

    return {
        "user_id": user_id,
        "name": user.name,
        "xp": user.xp,
        "level": user.level,
        "level_progress_pct": level_pct,
        "xp_to_next_level": max(0, xp_for_next - user.xp),
        "streak": user.streak,
        "badges_earned": len(user_badges),
        "courses_enrolled": len(enrollments),
        "courses_completed": sum(1 for e in enrollments if e.completed),
        "quizzes_taken": len(attempts),
        "best_score": max((a.score for a in attempts), default=0),
        "total_xp_from_quizzes": sum(a.xp_earned for a in attempts)
    }


@router.get("/badges/{user_id}")
def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    result = []
    for ub in user_badges:
        b = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        if b:
            result.append({
                "id": b.id,
                "name": b.name,
                "description": b.description,
                "icon": b.icon,
                "rarity": b.rarity,
                "earned_at": ub.earned_at.isoformat()
            })
    return result
