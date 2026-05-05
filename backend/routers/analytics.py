"""Analytics router - learning analytics and insights"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from database.db import get_db, User, QuizAttempt, Enrollment, ChatMessage, Course, UserBadge, Badge

router = APIRouter()


@router.get("/dashboard/{user_id}")
def dashboard(user_id: int, db: Session = Depends(get_db)):
    """Full analytics dashboard for a student."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    # Enrollments & progress
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
    enrolled_count = len(enrollments)
    completed_count = sum(1 for e in enrollments if e.completed)
    avg_progress = round(sum(e.progress for e in enrollments) / enrolled_count, 1) if enrolled_count else 0

    # Quiz stats
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
    quiz_count = len(attempts)
    avg_score = round(sum(a.score for a in attempts) / quiz_count, 1) if quiz_count else 0
    total_xp_from_quizzes = sum(a.xp_earned for a in attempts)

    # Recent quiz performance (last 7)
    recent_attempts = sorted(attempts, key=lambda a: a.completed_at, reverse=True)[:7]
    score_trend = [{"date": a.completed_at.strftime("%b %d"), "score": a.score} for a in reversed(recent_attempts)]

    # Activity (quizzes per day last 14 days)
    fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
    recent_all = [a for a in attempts if a.completed_at >= fourteen_days_ago]
    activity_map = {}
    for a in recent_all:
        day = a.completed_at.strftime("%b %d")
        activity_map[day] = activity_map.get(day, 0) + 1

    # Tutor interactions
    chat_count = db.query(ChatMessage).filter(
        ChatMessage.user_id == user_id,
        ChatMessage.role == "user"
    ).count()

    # Badges
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    badges = []
    for ub in user_badges:
        b = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        if b:
            badges.append({"name": b.name, "icon": b.icon, "rarity": b.rarity, "earned_at": ub.earned_at.isoformat()})

    # Subject breakdown
    subject_scores = {}
    for a in attempts:
        from database.db import Quiz
        quiz = db.query(Quiz).filter(Quiz.id == a.quiz_id).first()
        if quiz:
            if quiz.subject not in subject_scores:
                subject_scores[quiz.subject] = []
            subject_scores[quiz.subject].append(a.score)
    subject_avg = {s: round(sum(v)/len(v), 1) for s, v in subject_scores.items()}

    return {
        "user": {"name": user.name, "xp": user.xp, "level": user.level, "streak": user.streak},
        "courses": {"enrolled": enrolled_count, "completed": completed_count, "avg_progress": avg_progress},
        "quizzes": {"total": quiz_count, "avg_score": avg_score, "total_xp": total_xp_from_quizzes},
        "tutor": {"total_chats": chat_count},
        "score_trend": score_trend,
        "activity_map": activity_map,
        "subject_performance": subject_avg,
        "badges": badges,
        "recent_enrollments": [
            {
                "course_id": e.course_id,
                "progress": e.progress,
                "completed": e.completed
            }
            for e in enrollments[:5]
        ]
    }


@router.get("/leaderboard")
def leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    """Top students by XP."""
    students = db.query(User).filter(User.role == "student").order_by(User.xp.desc()).limit(limit).all()
    return [
        {"rank": i+1, "name": s.name, "xp": s.xp, "level": s.level, "streak": s.streak}
        for i, s in enumerate(students)
    ]


@router.get("/summary/{user_id}")
def summary(user_id: int, db: Session = Depends(get_db)):
    """Quick stats summary."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
    return {
        "xp": user.xp,
        "level": user.level,
        "streak": user.streak,
        "courses_enrolled": len(enrollments),
        "quizzes_taken": len(attempts),
        "avg_quiz_score": round(sum(a.score for a in attempts) / len(attempts), 1) if attempts else 0,
    }
