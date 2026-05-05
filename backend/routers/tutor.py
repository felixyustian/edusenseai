"""AI Tutor router - Powered by Anthropic Claude"""

import os
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import anthropic

from database.db import get_db, ChatMessage, User

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


SYSTEM_PROMPT = """You are EduSense AI Tutor — an expert, patient, and encouraging educational assistant.
You help students understand complex topics across subjects: Math, Science, Programming, AI/ML, Computer Vision, Robotics, and more.

Your teaching philosophy:
- Break down complex concepts into simple, digestible steps
- Use analogies, real-world examples, and visual descriptions
- Ask Socratic questions to guide discovery rather than just giving answers
- Provide encouragement and celebrate progress
- Adapt your language to the student's level
- Offer practice problems when appropriate
- Always be supportive, never condescending

Format your responses with clear structure using markdown when helpful.
Keep responses focused and appropriately concise for the question complexity.
"""


class Message(BaseModel):
    role: str
    content: str


class TutorRequest(BaseModel):
    messages: List[Message]
    user_id: Optional[int] = None
    session_id: Optional[str] = "default"
    subject: Optional[str] = "general"


class SessionRequest(BaseModel):
    user_id: int


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/chat")
async def chat(body: TutorRequest, db: Session = Depends(get_db)):
    """Send a message to the AI tutor and get a response."""
    if not client.api_key:
        raise HTTPException(500, "ANTHROPIC_API_KEY not configured")

    try:
        messages = [{"role": m.role, "content": m.content} for m in body.messages]

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages
        )
        reply = response.content[0].text

        # Persist messages to DB if user_id provided
        if body.user_id:
            user_msg = body.messages[-1] if body.messages else None
            if user_msg:
                db.add(ChatMessage(
                    user_id=body.user_id,
                    session_id=body.session_id,
                    role="user",
                    content=user_msg.content,
                    subject=body.subject
                ))
            db.add(ChatMessage(
                user_id=body.user_id,
                session_id=body.session_id,
                role="assistant",
                content=reply,
                subject=body.subject
            ))
            db.commit()

        return {
            "reply": reply,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens
            }
        }

    except anthropic.APIError as e:
        raise HTTPException(500, f"AI API error: {str(e)}")


@router.get("/history/{user_id}")
def get_history(user_id: int, session_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Get chat history for a user."""
    q = db.query(ChatMessage).filter(ChatMessage.user_id == user_id)
    if session_id:
        q = q.filter(ChatMessage.session_id == session_id)
    messages = q.order_by(ChatMessage.created_at).all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "subject": m.subject,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]


@router.get("/sessions/{user_id}")
def get_sessions(user_id: int, db: Session = Depends(get_db)):
    """Get distinct chat sessions for a user."""
    sessions = db.query(
        ChatMessage.session_id,
        ChatMessage.subject,
        ChatMessage.created_at
    ).filter(ChatMessage.user_id == user_id).distinct(ChatMessage.session_id).all()
    return [{"session_id": s[0], "subject": s[1], "created_at": s[2]} for s in sessions]


@router.post("/explain")
async def explain_concept(concept: str, level: Optional[str] = "beginner"):
    """Quick concept explanation endpoint."""
    if not client.api_key:
        raise HTTPException(500, "ANTHROPIC_API_KEY not configured")
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"Explain '{concept}' for a {level} student in a clear, engaging way with an example."
        }],
        system=SYSTEM_PROMPT
    )
    return {"explanation": response.content[0].text}


@router.post("/hint")
async def get_hint(question: str, context: Optional[str] = ""):
    """Get a Socratic hint for a question without revealing the answer."""
    if not client.api_key:
        raise HTTPException(500, "ANTHROPIC_API_KEY not configured")
    prompt = f"Student question: {question}"
    if context:
        prompt += f"\nContext: {context}"
    prompt += "\n\nGive a helpful Socratic hint that guides them toward the answer without revealing it directly."

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
        system=SYSTEM_PROMPT
    )
    return {"hint": response.content[0].text}
