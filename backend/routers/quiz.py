"""Quiz router - AI-generated adaptive quizzes"""

import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import anthropic
from datetime import datetime

from database.db import get_db, Quiz, QuizAttempt, User

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


# ── Schemas ───────────────────────────────────────────────────────────────────

class GenerateQuizRequest(BaseModel):
    subject: str
    topic: str
    difficulty: Optional[str] = "medium"     # easy | medium | hard
    num_questions: Optional[int] = 5
    question_types: Optional[List[str]] = ["multiple_choice"]


class SubmitAnswersRequest(BaseModel):
    quiz_id: int
    user_id: int
    answers: Dict[str, Any]          # {question_index: selected_answer}
    time_taken: Optional[int] = 0    # seconds


class QuizOut(BaseModel):
    id: int
    title: str
    subject: str
    difficulty: str
    questions: str
    ai_generated: bool

    class Config:
        from_attributes = True


# ── AI Quiz Generation ────────────────────────────────────────────────────────

QUIZ_GEN_PROMPT = """You are an expert educational quiz creator.
Generate a quiz in valid JSON format only. No explanation, no markdown, just raw JSON.

Return exactly this structure:
{
  "title": "Quiz title",
  "questions": [
    {
      "id": 0,
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct_answer": "A) option1",
      "explanation": "Why this is correct",
      "points": 10
    }
  ]
}

For true_false type, options should be ["True", "False"].
For short_answer type, omit options and set correct_answer to expected keyword(s).
"""


def generate_quiz_with_ai(subject: str, topic: str, difficulty: str, num_questions: int, question_types: List[str]) -> dict:
    if not client.api_key:
        raise HTTPException(500, "ANTHROPIC_API_KEY not configured")

    types_str = ", ".join(question_types)
    prompt = (
        f"Create a {difficulty} difficulty quiz about '{topic}' in {subject}.\n"
        f"Number of questions: {num_questions}\n"
        f"Question types to use (mix them): {types_str}\n"
        f"Make questions progressively challenging. Include clear, unambiguous questions with educational explanations."
    )

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        system=QUIZ_GEN_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.content[0].text.strip()
    # Clean any accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/generate")
def generate_quiz(body: GenerateQuizRequest, db: Session = Depends(get_db)):
    """AI-generated quiz based on subject and topic."""
    quiz_data = generate_quiz_with_ai(
        body.subject, body.topic, body.difficulty,
        body.num_questions, body.question_types
    )
    quiz = Quiz(
        title=quiz_data.get("title", f"{body.topic} Quiz"),
        subject=body.subject,
        difficulty=body.difficulty,
        questions=json.dumps(quiz_data.get("questions", [])),
        ai_generated=True
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return {
        "quiz_id": quiz.id,
        "title": quiz.title,
        "subject": quiz.subject,
        "difficulty": quiz.difficulty,
        "questions": quiz_data.get("questions", []),
        "ai_generated": True
    }


@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    return {
        "quiz_id": quiz.id,
        "title": quiz.title,
        "subject": quiz.subject,
        "difficulty": quiz.difficulty,
        "questions": json.loads(quiz.questions),
        "ai_generated": quiz.ai_generated
    }


@router.get("/")
def list_quizzes(subject: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Quiz)
    if subject:
        q = q.filter(Quiz.subject == subject)
    quizzes = q.order_by(Quiz.created_at.desc()).all()
    return [
        {
            "quiz_id": qz.id,
            "title": qz.title,
            "subject": qz.subject,
            "difficulty": qz.difficulty,
            "question_count": len(json.loads(qz.questions)),
            "ai_generated": qz.ai_generated
        }
        for qz in quizzes
    ]


@router.post("/submit")
def submit_answers(body: SubmitAnswersRequest, db: Session = Depends(get_db)):
    """Grade a quiz submission and return results."""
    quiz = db.query(Quiz).filter(Quiz.id == body.quiz_id).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")

    questions = json.loads(quiz.questions)
    total_points = sum(q.get("points", 10) for q in questions)
    earned_points = 0
    results = []

    for i, q in enumerate(questions):
        user_answer = body.answers.get(str(i)) or body.answers.get(i)
        correct = q.get("correct_answer", "")
        is_correct = str(user_answer).strip().lower() == str(correct).strip().lower()
        if is_correct:
            earned_points += q.get("points", 10)
        results.append({
            "question_index": i,
            "question": q.get("question"),
            "user_answer": user_answer,
            "correct_answer": correct,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
            "points_earned": q.get("points", 10) if is_correct else 0
        })

    score_pct = round((earned_points / total_points) * 100, 1) if total_points > 0 else 0
    xp_earned = int(score_pct)

    # Save attempt
    attempt = QuizAttempt(
        quiz_id=body.quiz_id,
        user_id=body.user_id,
        score=score_pct,
        answers=json.dumps(body.answers),
        time_taken=body.time_taken,
        xp_earned=xp_earned
    )
    db.add(attempt)

    # Award XP to user
    user = db.query(User).filter(User.id == body.user_id).first()
    if user:
        user.xp += xp_earned
        user.level = max(1, user.xp // 500 + 1)

    db.commit()

    return {
        "score": score_pct,
        "earned_points": earned_points,
        "total_points": total_points,
        "xp_earned": xp_earned,
        "grade": _get_grade(score_pct),
        "results": results,
        "attempt_id": attempt.id
    }


def _get_grade(score: float) -> str:
    if score >= 90: return "A"
    if score >= 80: return "B"
    if score >= 70: return "C"
    if score >= 60: return "D"
    return "F"


@router.get("/attempts/{user_id}")
def get_user_attempts(user_id: int, db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).order_by(QuizAttempt.completed_at.desc()).all()
    result = []
    for a in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == a.quiz_id).first()
        result.append({
            "attempt_id": a.id,
            "quiz_title": quiz.title if quiz else "Unknown",
            "subject": quiz.subject if quiz else "",
            "score": a.score,
            "xp_earned": a.xp_earned,
            "time_taken": a.time_taken,
            "completed_at": a.completed_at.isoformat()
        })
    return result
