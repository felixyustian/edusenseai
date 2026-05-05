"""Courses router - CRUD for courses, lessons, and enrollments"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database.db import get_db, Course, Lesson, Enrollment, User

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    subject: str
    difficulty: str
    total_lessons: int
    duration_hrs: float
    is_published: bool
    teacher_id: int

    class Config:
        from_attributes = True

class LessonOut(BaseModel):
    id: int
    course_id: int
    title: str
    content: str
    order_num: int
    duration_min: int
    lesson_type: str

    class Config:
        from_attributes = True


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[CourseOut])
def list_courses(
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Course).filter(Course.is_published == True)
    if subject:
        q = q.filter(Course.subject == subject)
    if difficulty:
        q = q.filter(Course.difficulty == difficulty)
    return q.all()


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")
    return course


@router.get("/{course_id}/lessons", response_model=List[LessonOut])
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    return db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_num).all()


@router.post("/{course_id}/enroll")
def enroll(course_id: int, user_id: int, db: Session = Depends(get_db)):
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.course_id == course_id
    ).first()
    if existing:
        return {"message": "Already enrolled", "enrollment": existing}
    enroll = Enrollment(user_id=user_id, course_id=course_id)
    db.add(enroll)
    db.commit()
    db.refresh(enroll)
    return {"message": "Enrolled successfully", "enrollment_id": enroll.id}


@router.get("/user/{user_id}/enrollments")
def user_enrollments(user_id: int, db: Session = Depends(get_db)):
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
    result = []
    for e in enrollments:
        course = db.query(Course).filter(Course.id == e.course_id).first()
        if course:
            result.append({
                "enrollment_id": e.id,
                "progress": e.progress,
                "completed": e.completed,
                "course": CourseOut.from_orm(course)
            })
    return result


@router.patch("/enrollment/{enrollment_id}/progress")
def update_progress(enrollment_id: int, progress: float, db: Session = Depends(get_db)):
    e = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not e:
        raise HTTPException(404, "Enrollment not found")
    e.progress = min(progress, 100.0)
    e.completed = e.progress >= 100.0
    db.commit()
    return {"progress": e.progress, "completed": e.completed}


@router.get("/subjects/list")
def list_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Course.subject).distinct().all()
    return [s[0] for s in subjects]
