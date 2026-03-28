# 📚 Study Tracker — ML, System Design & MLOps

<div align="center">

![Study Tracker](https://img.shields.io/badge/Study_Tracker-Full_Stack-6366f1?style=for-the-badge&logo=bookstack&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![gitcgr](https://gitcgr.com/badge/R1patil/study-tracker.svg)](https://gitcgr.com/R1patil/study-tracker)

<br/>

> **A full-stack study tracker to systematically prepare for ML & System Design interviews.**
> Built by [@R1patil](https://github.com/R1patil) · Intern @ Raysoft.ai

<br/>

🌐 **[Live Demo](https://study-tracker-patil.vercel.app)** &nbsp;|&nbsp; 📺 **[YouTube Channel](https://www.youtube.com/@R-B107)** &nbsp;|&nbsp; ⭐ **Star this repo if you find it useful!**

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Email + Password signup/login via Supabase |
| 👤 **Per-user data** | Every user has their own private progress |
| ✅ **Topic tracking** | Mark topics as Not Started / In Progress / Done |
| 📝 **Notes** | Add personal notes and key takeaways per topic |
| ⏱️ **Study Timer** | Per-topic and global session timer |
| 🔥 **Streaks** | Daily study streak tracking |
| 📊 **Dashboard** | Live progress % across all tracks |
| 📺 **YouTube Challenges** | Add, embed, and track your own YouTube videos |
| 🔗 **Direct links** | Every topic links directly to its resource |

---

## 🗺️ Learning Tracks

The curriculum is sourced from 3 of the most popular GitHub repos in the community:

### 🏗️ System Design
> **Source:** [awesome-system-design-resources](https://github.com/ashishps1/awesome-system-design-resources)

- Core Concepts (Scalability, CAP Theorem, Consistent Hashing...)
- Networking Fundamentals (OSI, DNS, Load Balancing...)
- API Fundamentals (REST, GraphQL, WebSockets...)
- Database Fundamentals (ACID, Sharding, Indexing...)
- Caching (Strategies, CDN, Eviction Policies...)
- Distributed Systems & Microservices
- Interview Problems (Easy → Medium → Hard)

### 🤖 Machine Learning
> **Source:** [machine-learning-interview](https://github.com/khangich/machine-learning-interview)

- ML Fundamentals (Linear Regression, SVM, XGBoost...)
- Deep Learning (CNNs, Transformers, Backpropagation...)
- ML System Design (Recommendation Systems, Fraud Detection...)
- ML Coding Questions (Implement from scratch)

### ⚙️ MLOps Zero to Hero
> **Source:** [mlops-zero-to-hero](https://github.com/iam-veeramalla/mlops-zero-to-hero)

- Containerization (Docker, Dockerfile, Docker Compose)
- Orchestration (Kubernetes, Helm, Kubeflow)
- CI/CD for ML (GitHub Actions, Jenkins)
- Experiment Tracking (MLflow, DVC, W&B)
- Model Serving & Monitoring (FastAPI, BentoML, Evidently)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** — App Router, Server Components
- **TypeScript** — Type-safe code
- **Tailwind CSS** — Styling
- **Supabase SSR** — Auth & session management

### Backend
- **FastAPI** — REST API
- **Python 3.11** — Core language
- **httpx** — Async HTTP for Supabase JWT verification
- **JSON file storage** — Per-user progress

### Infrastructure
- **Supabase** — Authentication + Row Level Security
- **Vercel** — Frontend hosting (free)
- **Render** — Backend hosting (free)
- **GitHub** — Source control + CI/CD

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) account (free)

### 1. Clone the repo
```bash
git clone https://github.com/R1patil/study-tracker.git
cd study-tracker
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

Run:
```bash
uvicorn main:app --reload
# API → http://localhost:8000
# Docs → http://localhost:8000/docs
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run:
```bash
npm run dev
# App → http://localhost:3000
```

### 4. Setup Supabase Database

Run this in your Supabase **SQL Editor**:

```sql
create extension if not exists "uuid-ossp";

create table user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic_id text not null,
  status text default 'not_started',
  notes text default '',
  updated_at timestamptz default now(),
  unique(user_id, topic_id)
);

create table study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic_id text,
  topic_title text,
  duration_mins float default 0,
  date date default current_date,
  created_at timestamptz default now()
);

alter table user_progress enable row level security;
alter table study_sessions enable row level security;

create policy "Users own their progress" on user_progress
  for all using (auth.uid() = user_id);

create policy "Users own their sessions" on study_sessions
  for all using (auth.uid() = user_id);
```

---

## 📁 Project Structure

```
study-tracker/
├── backend/
│   ├── main.py              ← FastAPI app + JWT auth + all routes
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                 ← (not committed)
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              → Redirects to /login
    │   │   ├── login/page.tsx        → Login page
    │   │   ├── signup/page.tsx       → Signup page
    │   │   ├── dashboard/page.tsx    → Main dashboard
    │   │   ├── youtube/page.tsx      → YouTube challenges
    │   │   └── auth/callback/        → OAuth callback handler
    │   ├── components/
    │   │   ├── Sidebar.tsx
    │   │   ├── StatsHeader.tsx
    │   │   ├── TimerWidget.tsx
    │   │   ├── TrackView.tsx
    │   │   ├── TopicCard.tsx
    │   │   └── auth/UserMenu.tsx
    │   └── lib/
    │       ├── api.ts                ← API calls with JWT
    │       └── supabase/             ← Supabase client/server
    ├── .env.local            ← (not committed)
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/progress` | Get full user progress |
| `GET` | `/stats` | Get stats + streaks |
| `PATCH` | `/topic/{id}/status` | Update topic status |
| `PATCH` | `/topic/{id}/notes` | Update topic notes |
| `GET` | `/timer` | Get active timer |
| `POST` | `/timer` | Start / stop timer |

> All endpoints require `Authorization: Bearer <supabase_jwt>` header

---

## ☁️ Deployment — Free Forever

| Service | Platform | Cost |
|---|---|---|
| Frontend | Vercel | ✅ Free |
| Backend | Render | ✅ Free |
| Auth + DB | Supabase | ✅ Free |

### Deploy Backend → Render
1. Connect GitHub repo on [render.com](https://render.com)
2. Root Directory: `backend`
3. Add env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
4. Click Deploy

### Deploy Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Root Directory: `frontend`
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
4. Click Deploy

---

## 📖 How to Use

1. **Sign up** with your email → confirm via the email link
2. **Pick a track** from the sidebar — System Design, ML, or MLOps
3. **Click the dot** next to any topic to cycle status: `Not Started → In Progress → Done`
4. **Click ⏱** to start a per-topic timer
5. **Click 📝** to add personal notes and key takeaways
6. **Hit ▶ Start Session** at the top to log your study time
7. **YouTube Challenges** → paste any video URL → watch inline → mark as watched
8. Study every day to build your 🔥 streak!

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE) — free to use and modify!

---

<div align="center">

Made with ❤️ by **Rahul Patil** · Intern @ Raysoft.ai

[![GitHub](https://img.shields.io/badge/GitHub-R1patil-181717?style=flat&logo=github)](https://github.com/R1patil)
[![YouTube](https://img.shields.io/badge/YouTube-@R--B107-FF0000?style=flat&logo=youtube)](https://www.youtube.com/@R-B107)

**⭐ Star this repo if it helped you prepare!**

</div>
