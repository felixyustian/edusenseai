"""
Database configuration and initialization using SQLite + SQLAlchemy
"""

import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, '../edusenseai.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role          = Column(String, default="student")          # student | teacher | admin
    avatar        = Column(String, default="")
    created_at    = Column(DateTime, default=datetime.utcnow)
    xp            = Column(Integer, default=0)
    level         = Column(Integer, default=1)
    streak        = Column(Integer, default=0)
    last_active   = Column(DateTime, default=datetime.utcnow)

    enrollments   = relationship("Enrollment", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    messages      = relationship("ChatMessage", back_populates="user")


class Course(Base):
    __tablename__ = "courses"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(Text, default="")
    subject     = Column(String, nullable=False)
    difficulty  = Column(String, default="beginner")   # beginner | intermediate | advanced
    thumbnail   = Column(String, default="")
    teacher_id  = Column(Integer, ForeignKey("users.id"))
    created_at  = Column(DateTime, default=datetime.utcnow)
    is_published = Column(Boolean, default=True)
    total_lessons = Column(Integer, default=0)
    duration_hrs  = Column(Float, default=0.0)

    lessons     = relationship("Lesson", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")


class Lesson(Base):
    __tablename__ = "lessons"
    id         = Column(Integer, primary_key=True, index=True)
    course_id  = Column(Integer, ForeignKey("courses.id"))
    title      = Column(String, nullable=False)
    content    = Column(Text, default="")
    order_num  = Column(Integer, default=0)
    duration_min = Column(Integer, default=15)
    lesson_type  = Column(String, default="text")    # text | video | quiz

    course     = relationship("Course", back_populates="lessons")
    quizzes    = relationship("Quiz", back_populates="lesson")


class Quiz(Base):
    __tablename__ = "quizzes"
    id          = Column(Integer, primary_key=True, index=True)
    lesson_id   = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    title       = Column(String, nullable=False)
    subject     = Column(String, nullable=False)
    difficulty  = Column(String, default="medium")
    questions   = Column(Text, default="[]")    # JSON string
    created_at  = Column(DateTime, default=datetime.utcnow)
    ai_generated = Column(Boolean, default=False)

    lesson      = relationship("Lesson", back_populates="quizzes")
    attempts    = relationship("QuizAttempt", back_populates="quiz")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id          = Column(Integer, primary_key=True, index=True)
    quiz_id     = Column(Integer, ForeignKey("quizzes.id"))
    user_id     = Column(Integer, ForeignKey("users.id"))
    score       = Column(Float, default=0.0)
    answers     = Column(Text, default="[]")    # JSON string
    time_taken  = Column(Integer, default=0)    # seconds
    completed_at = Column(DateTime, default=datetime.utcnow)
    xp_earned   = Column(Integer, default=0)

    quiz        = relationship("Quiz", back_populates="attempts")
    user        = relationship("User", back_populates="quiz_attempts")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    course_id   = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    progress    = Column(Float, default=0.0)    # 0-100%
    completed   = Column(Boolean, default=False)
    last_lesson = Column(Integer, default=0)

    user        = relationship("User", back_populates="enrollments")
    course      = relationship("Course", back_populates="enrollments")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String, nullable=False)
    role       = Column(String, nullable=False)    # user | assistant
    content    = Column(Text, nullable=False)
    subject    = Column(String, default="general")
    created_at = Column(DateTime, default=datetime.utcnow)

    user       = relationship("User", back_populates="messages")


class Badge(Base):
    __tablename__ = "badges"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    description = Column(Text, default="")
    icon        = Column(String, default="🏆")
    condition   = Column(String, default="")    # e.g. "xp>=100"
    rarity      = Column(String, default="common")  # common | rare | epic | legendary


class UserBadge(Base):
    __tablename__ = "user_badges"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    badge_id   = Column(Integer, ForeignKey("badges.id"))
    earned_at  = Column(DateTime, default=datetime.utcnow)


# ── DB Helpers ────────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and seed initial data."""
    Base.metadata.create_all(bind=engine)
    _seed_initial_data()


def _seed_initial_data():
    """Seed demo courses, badges, and a demo user."""
    from passlib.context import CryptContext
    import json

    pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            return

        # Demo users
        demo_student = User(
            name="Alex Johnson",
            email="student@edusenseai.com",
            password_hash=pwd_ctx.hash("demo123"),
            role="student",
            xp=1250, level=5, streak=7
        )
        demo_teacher = User(
            name="Dr. Maria Chen",
            email="teacher@edusenseai.com",
            password_hash=pwd_ctx.hash("demo123"),
            role="teacher",
            xp=5000, level=12, streak=21
        )
        db.add_all([demo_student, demo_teacher])
        db.flush()

        # Demo courses
        courses_data = [
            {"title": "Introduction to Machine Learning",   "subject": "AI & ML",       "difficulty": "beginner",     "duration_hrs": 12.5, "total_lessons": 8,  "description": "Learn the fundamentals of ML including supervised, unsupervised learning, and key algorithms."},
            {"title": "Python for Data Science",            "subject": "Programming",   "difficulty": "beginner",     "duration_hrs": 10.0, "total_lessons": 10, "description": "Master Python libraries like NumPy, Pandas, and Matplotlib for data analysis."},
            {"title": "Deep Learning with PyTorch",         "subject": "AI & ML",       "difficulty": "intermediate", "duration_hrs": 18.0, "total_lessons": 12, "description": "Build neural networks from scratch using PyTorch and solve real-world problems."},
            {"title": "Computer Vision Fundamentals",       "subject": "Computer Vision","difficulty": "intermediate", "duration_hrs": 15.0, "total_lessons": 9,  "description": "Explore image processing, CNNs, object detection and segmentation techniques."},
            {"title": "Natural Language Processing",        "subject": "AI & ML",       "difficulty": "advanced",     "duration_hrs": 20.0, "total_lessons": 11, "description": "Dive into transformers, BERT, GPT, and state-of-the-art NLP methods."},
            {"title": "Robotics & IoT with Python",         "subject": "Robotics",      "difficulty": "intermediate", "duration_hrs": 14.0, "total_lessons": 10, "description": "Program robots and IoT devices using Python, ROS, and sensor integration."},
        ]
        course_objs = []
        for c in courses_data:
            obj = Course(teacher_id=demo_teacher.id, is_published=True, **c)
            db.add(obj)
            course_objs.append(obj)
        db.flush()

        # Enroll demo student
        for i, co in enumerate(course_objs[:3]):
            enroll = Enrollment(
                user_id=demo_student.id,
                course_id=co.id,
                progress=round([65.0, 30.0, 10.0][i], 1)
            )
            db.add(enroll)

        # Demo badges
        badges = [
            Badge(name="First Steps",     icon="👶", rarity="common",    description="Complete your first lesson",   condition="lessons>=1"),
            Badge(name="Quiz Master",     icon="🧠", rarity="rare",      description="Score 100% on any quiz",       condition="perfect_quiz"),
            Badge(name="Streak Warrior",  icon="🔥", rarity="epic",      description="Maintain a 7-day streak",      condition="streak>=7"),
            Badge(name="Course Champion", icon="🏆", rarity="legendary", description="Complete an entire course",     condition="course_complete"),
            Badge(name="AI Apprentice",   icon="🤖", rarity="rare",      description="Chat with AI Tutor 10 times",  condition="tutor_chats>=10"),
            Badge(name="Speed Learner",   icon="⚡", rarity="common",    description="Finish a quiz in under 2 min", condition="quiz_speed"),
        ]
        for b in badges:
            db.add(b)

        # Give student some badges
        db.flush()
        badge_objs = db.query(Badge).all()
        for b in badge_objs[:3]:
            db.add(UserBadge(user_id=demo_student.id, badge_id=b.id))

        db.commit()
        print("✅ Database seeded with demo data.")
    except Exception as e:
        print(f"⚠️  Seed skipped or failed: {e}")
        db.rollback()
    finally:
        db.close()
