import os
import shutil
import subprocess

SRC_DIR = r"d:\study-tracker"
DEST_DIR = r"d:\jollyroger-ai"

EXCLUDE_DIRS = {
    ".git", "node_modules", ".next", "target", "chrome-extension", "__pycache__", ".venv", ".dist", "profile"
}
EXCLUDE_FILES = {
    "fresh_launch.py", "scratch_patch.py", "yc_startup_blueprint.md", "implementation_plan_25"
}

def copy_project():
    print("=============================================================")
    print("           JollyRoger.AI Fresh Launch Setup                  ")
    print("=============================================================")
    
    if os.path.exists(DEST_DIR):
        print(f"Destination directory '{DEST_DIR}' already exists.")
        confirm = input("Do you want to overwrite it? (y/n): ").strip().lower()
        if confirm == 'y':
            print(f"Removing existing directory '{DEST_DIR}'...")
            shutil.rmtree(DEST_DIR)
        else:
            print("Aborted.")
            return False
            
    os.makedirs(DEST_DIR, exist_ok=True)
    
    print(f"Copying files from '{SRC_DIR}' to '{DEST_DIR}'...")
    
    # Custom walking that respects exclusions
    for root, dirs, files in os.walk(SRC_DIR):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        # Calculate relative destination path
        rel_path = os.path.relpath(root, SRC_DIR)
        dest_root = DEST_DIR if rel_path == "." else os.path.join(DEST_DIR, rel_path)
        
        os.makedirs(dest_root, exist_ok=True)
        
        for file in files:
            if file in EXCLUDE_FILES:
                continue
            src_file = os.path.join(root, file)
            dest_file = os.path.join(dest_root, file)
            shutil.copy2(src_file, dest_file)
            
    print("[OK] Files copied successfully (excluding old git history, chrome-extension, and cache).")
    return True

def create_rebranded_readme():
    readme_path = os.path.join(DEST_DIR, "README.md")
    readme_content = """# 🧭 JollyRoger.AI — The High-Seas AI Career Co-Pilot

<div align="center">

![JollyRoger.AI](https://img.shields.io/badge/JollyRoger.AI-Full_Stack_OS-2aa198?style=for-the-badge&logo=compass&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

<br/>

> **A full-stack cognitive learning operating system to systematically sail the CS oceans and prepare for ML, System Design & MLOps voyages.**
> Built specifically for the **WeMakeDevs Pirates of the Coral-bean Hackathon**.

<br/>

⭐ **Star this repository to support our crew!**

🏆 **Proudly submitted to the [Coral Hackathon](https://www.wemakedevs.org/hackathons/coral)**

</div>

---

## ✨ System Features

| Feature | Description |
|---|---|
| 🧭 **Captain Jarvis** | A high-EQ, spiritual sea-captain AI agent who monitors your voyage logs, calendar, and screen distraction levels using **Coral SQL**, offering yogic breathing intervals and code sprints to refocus. |
| 🧠 **Spaced Repetition & Reminders** | Systematically flag challenging topics to review at optimal intervals (1 → 3 → 7 → 14 → 30 days) and schedule them natively into your calendar. |
| 🕵️ **JollyRoger Desktop Daemon** | A local Windows Rust background service that captures active window processes and alerts you of dynamic distraction spikes. |
| 📊 **Voyage Logs Dashboard** | Live progress metrics across ML, System Design, and MLOps learning tracks, complete with daily recommendation cards and focus metrics. |
| 🎮 **YouTube Video Challenges** | Paste educational challenges, watch inline, and track completion history automatically. |

---

## 🐚 Powered by Coral SQL Engine

This project was engineered to showcase the massive potential of the **Coral SQL engine** for complex cognitive AI agents. 

Instead of writing custom API adapters and ETL scripts to query window logs, search histories, progress schemas, and spiritual wisdom libraries, **Captain Jarvis** utilizes a single tool: `execute_coral_sql`.

With Coral, the AI agent can:
1. **Query GitHub Repos Natively**: Analyze directory structures and readme documentation using `SELECT * FROM github.trees WHERE owner = '...'`.
2. **Monitor Cognitive Distractions**: Run daily aggregates against `student_activity.activity`, `student_calendar.events`, and `student_searches.searches` to immediately know if Rajasic distraction states (like YouTube Shorts or Instagram) have interrupted study blocks.
3. **Yoga Wisdom Retrieval**: Instantly pick random meditative mantras from `student_wisdom.wisdom` to present when focus spikes are triggered.
4. **Zero ETL overhead**: Coral runs queries directly over static files and public APIs in real-time, delivering structured JSON results directly to our Groq LLaMA-3.3-70B model.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** — App Router & server-side rendering
- **TypeScript** — Fully typed components
- **Vanilla CSS & Tailwind** — Glassmorphic maritime UI
- **Supabase SSR** — Auth & session states

### Backend
- **FastAPI** — High-performance REST Gateway
- **Coral CLI** — Direct SQL Engine for GitHub & JSONL integrations
- **Groq API** — LLaMA-3.3-70B inference for Captain Jarvis's brain
- **Python 3.11** — Core business logic

### Local Agent
- **Rust (Tokio)** — High-performance desktop daemon tracking window titles and process handles

---

## 🚀 Getting Started Natively

### 1. Initialize the Databases in Supabase
Run the schema setup in your Supabase SQL Editor:
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

create policy "Users own their progress" on user_progress for all using (auth.uid() = user_id);
create policy "Users own their sessions" on study_sessions for all using (auth.uid() = user_id);
```

### 2. Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Run Rust Desktop Daemon
```bash
cd jarvis-daemon
cargo run --release
```

---

<div align="center">

Made with ❤️ for the WeMakeDevs Coral Hackathon by **Rahul Patil**

</div>
"""
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(readme_content)
    print("[OK] Rebranded README.md created.")

def init_git():
    print("Initializing brand-new Git repository in destination folder...")
    try:
        # Run Git commands in the destination directory
        subprocess.run(["git", "init"], cwd=DEST_DIR, check=True)
        subprocess.run(["git", "add", "."], cwd=DEST_DIR, check=True)
        subprocess.run(["git", "commit", "-m", "Hoist the sails! Initial commit for JollyRoger.AI"], cwd=DEST_DIR, check=True)
        print("=============================================================")
        print("[SUCCESS] Rebranded project JollyRoger.AI is live at 'd:\\jollyroger-ai'")
        print("[OK] Git repository successfully initialized with a CLEAN history.")
        print("[OK] You can now push this fresh repo directly to GitHub for submission!")
        print("=============================================================")
    except Exception as e:
        print(f"Warning: Failed to initialize git repository: {e}")

if __name__ == "__main__":
    if copy_project():
        create_rebranded_readme()
        init_git()
