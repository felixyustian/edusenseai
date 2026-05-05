# 🎓 EduSense AI

> **An adaptive, AI-powered learning platform** — combining an intelligent tutor, dynamic quiz generation, real-time analytics, and gamified progress tracking.

![EduSense AI Banner](https://img.shields.io/badge/EduSense-AI%20Platform-6C63FF?style=for-the-badge&logo=graduation-cap&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude-AI-D97706?style=flat-square&logo=anthropic&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-00D4AA?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Tutor** | Real-time chat with Claude AI — explains concepts, solves problems, gives Socratic hints |
| ⚡ **Adaptive Quiz Generator** | Instantly generate quizzes on any topic using Claude — multiple choice, true/false, short answer |
| 📚 **Course Library** | Browse and enroll in structured courses across AI/ML, Programming, Robotics, and more |
| 📊 **Learning Analytics** | Score trends, subject mastery radar, daily activity charts, and leaderboard |
| 🏆 **Gamification** | XP system, levelling, streaks, badges (common → legendary), and a global leaderboard |
| 🔐 **Auth System** | JWT-based registration/login with role support (student / teacher / admin) |
| 🎨 **Dark UI** | Sleek dark-mode interface with animated transitions and gradient accents |

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11** + **FastAPI** — async REST API
- **SQLAlchemy** + **SQLite** — ORM with auto-seeded demo data
- **Anthropic Claude API** — AI tutor chat + quiz generation
- **Passlib / bcrypt** + **python-jose** — password hashing and JWT auth

### Frontend
- **React 18** + **Vite** — fast SPA with HMR
- **React Router v6** — client-side routing with protected routes
- **Tailwind CSS** — utility-first styling with custom dark theme
- **Recharts** — responsive charts (line, bar, radar)
- **React Markdown** — renders AI tutor responses as formatted markdown
- **Axios** — API client with auth interceptors
- **Lucide React** — icon library

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/edusenseai.git
cd edusenseai
```

### 2. Configure environment

```bash
cp .env.example .env
# Open .env and set your ANTHROPIC_API_KEY
```

### 3. One-command startup

```bash
chmod +x start.sh
./start.sh
```

This script will:
- Create a Python virtual environment and install backend dependencies
- Seed the database with demo courses, badges, and users
- Start the FastAPI backend on `http://localhost:8000`
- Install frontend npm packages and start Vite on `http://localhost:5173`

### 4. Open in browser

```
http://localhost:5173
```

**Demo account:** `student@edusenseai.com` / `demo123`

---

## 🐳 Docker

```bash
cp .env.example .env
# Set ANTHROPIC_API_KEY in .env

docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`

---

## 📁 Project Structure

```
edusenseai/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # App entry point + CORS + router registration
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── database/
│   │   └── db.py               # SQLAlchemy models + DB init + seeding
│   ├── routers/
│   │   ├── auth.py             # Register, login, JWT, demo login
│   │   ├── courses.py          # Course CRUD, enrollments, progress
│   │   ├── tutor.py            # AI tutor chat (Claude), history, hints
│   │   ├── quiz.py             # AI quiz generation, submission, grading
│   │   ├── analytics.py        # Dashboard data, leaderboard, summary
│   │   └── progress.py         # XP, badges, level tracking
│   ├── models/                 # (extensible Pydantic schemas)
│   └── services/               # (extensible service layer)
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Router + protected routes
│   │   ├── main.jsx            # React DOM entry
│   │   ├── index.css           # Global styles + custom utilities
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state + JWT management
│   │   ├── services/
│   │   │   └── api.js          # Axios API client (auth, courses, tutor, quiz…)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx # Navigation sidebar with user card
│   │   │   │   └── AppLayout.jsx
│   │   │   └── ui/
│   │   │       └── index.jsx   # Shared: Card, Button, Input, ProgressBar, Badge…
│   │   └── pages/
│   │       ├── LoginPage.jsx   # Sign in / sign up / demo login
│   │       ├── DashboardPage.jsx # Overview: stats, charts, quick actions
│   │       ├── CoursesPage.jsx   # Browse & enroll in courses
│   │       ├── TutorPage.jsx     # AI chat tutor with session management
│   │       ├── QuizPage.jsx      # AI quiz generator + interactive quiz + results
│   │       ├── AnalyticsPage.jsx # Charts: trend, activity, radar, leaderboard
│   │       ├── ProgressPage.jsx  # XP level, badges, quiz history
│   │       └── SettingsPage.jsx  # Profile, notifications, appearance, security
│   ├── Dockerfile
│   └── vite.config.js
│
├── .env.example                # Environment variable template
├── .gitignore
├── docker-compose.yml
├── start.sh                    # One-command dev startup
└── README.md
```

---

## 🔌 API Reference

All endpoints are available via interactive Swagger docs at `http://localhost:8000/api/docs`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login and get JWT token |
| GET  | `/api/auth/me?token=` | Get current user profile |
| GET  | `/api/auth/demo-login` | Instant demo account login |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET  | `/api/courses/` | List all published courses |
| GET  | `/api/courses/{id}` | Get a specific course |
| GET  | `/api/courses/{id}/lessons` | Get lessons for a course |
| POST | `/api/courses/{id}/enroll?user_id=` | Enroll in a course |
| GET  | `/api/courses/user/{id}/enrollments` | Get user enrollments |

### AI Tutor
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tutor/chat` | Send message, get Claude AI reply |
| GET  | `/api/tutor/history/{user_id}` | Retrieve chat history |
| POST | `/api/tutor/explain` | Explain a concept in simple terms |
| POST | `/api/tutor/hint` | Get a Socratic hint for a question |

### Quiz
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/quiz/generate` | AI-generate a quiz on any topic |
| GET  | `/api/quiz/{id}` | Get a specific quiz |
| GET  | `/api/quiz/` | List all quizzes |
| POST | `/api/quiz/submit` | Submit answers and get scored results |
| GET  | `/api/quiz/attempts/{user_id}` | Get quiz attempt history |

### Analytics & Progress
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard/{user_id}` | Full dashboard data |
| GET | `/api/analytics/leaderboard` | Top students by XP |
| GET | `/api/progress/{user_id}` | XP, level, badges, stats |
| GET | `/api/progress/badges/{user_id}` | Earned badges |

---

## 🌱 Demo Data

When the backend starts for the first time it auto-seeds:

- **2 demo users** — a student and a teacher
- **6 courses** — ML, Python, Deep Learning, Computer Vision, NLP, Robotics
- **6 badge types** — across common, rare, epic, and legendary rarities
- **3 enrollments** for the demo student with realistic progress

---

## 🔧 Manual Setup (without start.sh)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🙋 FAQ

**Q: The AI Tutor says "API key not configured"**  
A: Set `ANTHROPIC_API_KEY` in your `.env` file and restart the backend.

**Q: Quiz generation fails**  
A: Check your Anthropic API key and ensure you have API credits. The quiz endpoint calls `claude-opus-4-5`.

**Q: How do I reset the database?**  
A: Delete `backend/edusenseai.db` and restart — it will auto-reseed.

**Q: Can I use a PostgreSQL database instead of SQLite?**  
A: Yes — change `DATABASE_URL` in `.env` to a PostgreSQL URI (e.g., `postgresql://user:pass@localhost/edusense`). SQLAlchemy handles the switch automatically.

---

## 📄 License

MIT © 2025 EduSense AI

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ using <strong>Claude AI</strong> + <strong>React</strong> + <strong>FastAPI</strong>
</p>
