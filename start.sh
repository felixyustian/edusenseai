#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
#  EduSense AI — Local Development Startup Script
#  Usage:  chmod +x start.sh && ./start.sh
# ──────────────────────────────────────────────────────────────────────────────

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  ╔═══════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}  ║      EduSense AI — Startup         ║${RESET}"
echo -e "${CYAN}${BOLD}  ╚═══════════════════════════════════╝${RESET}"
echo ""

# ── Check .env ────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠  No .env found — copying from .env.example${RESET}"
  cp .env.example .env
  echo -e "${RED}   ➜  Set your ANTHROPIC_API_KEY in .env before continuing!${RESET}"
  echo ""
fi

source .env 2>/dev/null || true

if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "your_anthropic_api_key_here" ]; then
  echo -e "${RED}❌  ANTHROPIC_API_KEY is not set in .env${RESET}"
  echo -e "   Get your key at: ${CYAN}https://console.anthropic.com${RESET}"
  exit 1
fi

# ── Backend ───────────────────────────────────────────────────────────────────
echo -e "${GREEN}${BOLD}[1/3] Setting up Python backend...${RESET}"
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q

export ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
export SECRET_KEY=${SECRET_KEY:-edusenseai-dev-secret}

echo -e "${GREEN}✅ Backend dependencies installed${RESET}"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend running on ${CYAN}http://localhost:8000${RESET}  (PID: $BACKEND_PID)"

cd ..

# ── Frontend ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}[2/3] Setting up React frontend...${RESET}"
cd frontend

if [ ! -d "node_modules" ]; then
  echo "Installing npm packages..."
  npm install -q
fi

echo -e "${GREEN}✅ Frontend dependencies ready${RESET}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend running on ${CYAN}http://localhost:5173${RESET}  (PID: $FRONTEND_PID)"

cd ..

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}[3/3] EduSense AI is ready! 🎓${RESET}"
echo ""
echo -e "  📡 API:      ${CYAN}http://localhost:8000/api/docs${RESET}"
echo -e "  🌐 Frontend: ${CYAN}http://localhost:5173${RESET}"
echo -e "  🔑 Demo:     student@edusenseai.com / demo123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers.${RESET}"
echo ""

# Keep running and trap Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
