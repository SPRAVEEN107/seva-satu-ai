# SAVASETU AI 🇮🇳

> **One AI platform connecting every citizen to every government service.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/NeonDB-PostgreSQL-4169E1?style=flat&logo=postgresql)](https://neon.tech)

## 📌 What is Savasetu?

Savasetu AI is a production-grade, AI-powered citizen-to-government bridge designed for Rural India. Citizens can discover 1000+ government schemes, check eligibility in seconds, apply for benefits, file and track grievances — all in their native language.

**Tagline:** *Sarkar Ko Aapke Paas Laate Hain* (Bringing the Government to You)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TailwindCSS + GSAP |
| Backend | Python FastAPI + Uvicorn |
| Database | NeonDB (PostgreSQL via asyncpg) |
| AI | Antigravity AI (NLP + Recommendation Engine) |
| Deploy FE | Vercel |
| Deploy BE | Render |

---

## 📁 Project Structure

```
savasetu-ai/
├── frontend/          # Next.js 14 frontend
│   ├── app/           # App Router pages
│   ├── components/    # Reusable UI components
│   └── lib/           # GSAP + API utilities
└── backend/           # FastAPI backend
    ├── routers/       # API route handlers
    ├── services/      # AI, DB, Recommendation services
    ├── models/        # Pydantic models
    └── database/      # SQL schema
```

---

## ⚙️ Setup — Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Fill in API URL
npm run dev
# Opens at http://localhost:3000
```

**Environment Variables (`frontend/.env.local`):**
```
NEXT_PUBLIC_API_URL=https://seva-satu-ai.onrender.com
NEXT_PUBLIC_APP_NAME=Savasetu AI
```

---

## ⚙️ Setup — Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env          # Fill in your values
uvicorn main:app --reload
# API at https://seva-satu-ai.onrender.com
# Docs at https://seva-satu-ai.onrender.com/docs
```

**Environment Variables (`backend/.env`):**
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/savasetu?sslmode=require
ANTIGRAVITY_API_KEY=your_key_here
SECRET_KEY=your_random_secret
ENVIRONMENT=production
PORT=8000
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/ai-chat/message` | AI chat with schemes |
| `POST` | `/eligibility/check` | Eligibility checker |
| `GET` | `/schemes/list` | List schemes (filterable) |
| `GET` | `/schemes/{id}` | Scheme details |
| `POST` | `/grievance/submit` | Submit grievance |
| `GET` | `/grievance/track/{id}` | Track grievance |
| `POST` | `/applications/apply` | Apply for scheme |
| `GET` | `/applications/status/{citizen_id}` | Application status |

---

## 🗄️ Database Setup

Run the schema on your NeonDB instance:

```bash
psql $DATABASE_URL < backend/database/schema.sql
```

This creates 6 tables: `citizens`, `schemes`, `applications`, `grievances`, `chat_history`, `grievance_timeline` — and seeds 10 real Indian government schemes.

---

## 🚢 Deployment

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend/`
3. Add environment variables
4. Deploy — `vercel.json` handles the rest

### Backend → Render
1. Connect GitHub repo to Render
2. Set root directory to `backend/`
3. `render.yaml` auto-configures build + start commands
4. Add environment variables in Render dashboard

---

## 🎨 Design System

- **Primary:** `#FF6B00` (Saffron)
- **Secondary:** `#0047AB` (Government Cobalt)
- **Accent:** `#138808` (India Green)
- **Display Font:** Yatra One (Indian cultural identity)
- **Body Font:** DM Sans

---

## 📸 Screenshots

<!-- Add screenshots here after deployment -->

---

## 🤝 Contributing

Made with ❤️ for Bharat 🇮🇳. Open to contributions from developers who care about digital inclusion.

---

*© 2025 Savasetu AI — Making government accessible for every Indian citizen.*
