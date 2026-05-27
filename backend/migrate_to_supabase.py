import os
import json
import glob
import httpx
from datetime import datetime
from dotenv import load_dotenv

# Load env variables from backend/.env or root .env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
# Use service key if available to bypass RLS, fallback to anon key
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_SERVICE_KEY", SUPABASE_ANON_KEY))

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in your environment/.env")
    exit(1)

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates" # Merge / Upsert duplicate keys
}

DATA_DIR = os.path.join(os.path.dirname(__file__), "user_data")

def format_timestamp(ts_str):
    """Ensure timestamps are in ISO format for PostgreSQL."""
    if not ts_str:
        return None
    try:
        # If it's just a date, append time
        if len(ts_str) == 10:
            return f"{ts_str}T00:00:00Z"
        return ts_str
    except Exception:
        return None

def supabase_upsert(table, data):
    """POST data to Supabase table (supports list of dicts or single dict)."""
    if not data:
        return
    
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    try:
        resp = httpx.post(url, json=data, headers=HEADERS, timeout=30.0)
        if resp.status_code in [200, 201]:
            print(f"  Successfully uploaded {len(data) if isinstance(data, list) else 1} rows to {table} [OK]")
        else:
            print(f"  Failed to upload to {table}: Status {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"  Error uploading to {table}: {e}")

def migrate():
    print("=" * 60)
    print("  Jarvis OS Database Migration Script (JSON -> Supabase)")
    print(f"  Target URL: {SUPABASE_URL}")
    print("=" * 60)

    # 1. Find all user profiles (UUID.json files)
    profile_paths = glob.glob(os.path.join(DATA_DIR, "*-*-*-*-*.json"))
    user_ids = []
    
    for path in profile_paths:
        filename = os.path.basename(path)
        user_id = filename.replace(".json", "")
        user_ids.append(user_id)
        
        print(f"\nProcessing user file: {filename} (User ID: {user_id})")
        with open(path, "r", encoding="utf-8") as f:
            user_data = json.load(f)
            
        # A. Migrate Profile data
        profile = user_data.get("profile", {})
        if profile:
            print(f"Migrating profile for {user_id}...")
            profile_payload = {
                "user_id": user_id,
                "profile_data": profile,
                "updated_at": datetime.now().isoformat()
            }
            supabase_upsert("profiles", profile_payload)
            
        # B. Migrate Study Sessions
        sessions = user_data.get("sessions", [])
        if sessions:
            print(f"Migrating {len(sessions)} study sessions for {user_id}...")
            session_payloads = []
            for s in sessions:
                session_payloads.append({
                    "user_id": user_id,
                    "date": s.get("date", datetime.now().date().isoformat()),
                    "duration_mins": float(s.get("duration_mins", 0)),
                    "topic_id": s.get("topic_id"),
                    "topic_title": s.get("topic_title", "General Study")
                })
            supabase_upsert("study_sessions", session_payloads)
            
        # C. Migrate Streaks & Active Timer
        streaks = user_data.get("streaks", {})
        active_timer = user_data.get("active_timer")
        if streaks or active_timer:
            print(f"Migrating streaks and active timer for {user_id}...")
            streak_payload = {
                "user_id": user_id,
                "current_streak": int(streaks.get("current", 0)),
                "longest_streak": int(streaks.get("longest", 0)),
                "last_study_date": streaks.get("last_study_date"),
                "active_timer": active_timer
            }
            supabase_upsert("user_streaks", streak_payload)

    # Use first user_id for shared files, default fallback if none found
    default_user_id = user_ids[0] if user_ids else "2ecbabc1-1e26-41c0-856b-fea847aea85f"
    print(f"\nDefault User ID for shared logs: {default_user_id}")

    # 2. Migrate activity.jsonl -> activity_logs
    activity_file = os.path.join(DATA_DIR, "activity.jsonl")
    if os.path.exists(activity_file):
        print(f"\nProcessing activity.jsonl...")
        activity_logs = []
        with open(activity_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    activity_logs.append({
                        "user_id": default_user_id,
                        "timestamp": format_timestamp(entry.get("timestamp")),
                        "app": entry.get("app", "Unknown"),
                        "title": entry.get("title", ""),
                        "duration_seconds": int(entry.get("duration_seconds", 5)),
                        "category": entry.get("category", "passive"),
                        "is_productive": bool(entry.get("is_productive", False)),
                        "keystrokes": int(entry.get("keystrokes", 0)),
                        "late_night": bool(entry.get("late_night", False))
                    })
                except Exception as e:
                    continue
        if activity_logs:
            # Upload in batches of 500
            for i in range(0, len(activity_logs), 500):
                batch = activity_logs[i:i+500]
                supabase_upsert("activity_logs", batch)

    # 3. Migrate progress.jsonl -> curriculum_progress
    progress_file = os.path.join(DATA_DIR, "progress.jsonl")
    if os.path.exists(progress_file):
        print(f"\nProcessing progress.jsonl...")
        progress_rows = []
        with open(progress_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    progress_rows.append({
                        "user_id": default_user_id,
                        "topic_id": entry.get("topic_id"),
                        "title": entry.get("title"),
                        "track": entry.get("track"),
                        "section": entry.get("section"),
                        "status": entry.get("status", "not_started"),
                        "notes": entry.get("notes", ""),
                        "updated_at": format_timestamp(entry.get("updated_at"))
                    })
                except Exception:
                    continue
        if progress_rows:
            supabase_upsert("curriculum_progress", progress_rows)

    # 4. Migrate calendar.jsonl -> calendar_events
    calendar_file = os.path.join(DATA_DIR, "calendar.jsonl")
    if os.path.exists(calendar_file):
        print(f"\nProcessing calendar.jsonl...")
        events = []
        with open(calendar_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    events.append({
                        "event_id": entry.get("event_id"),
                        "user_id": default_user_id,
                        "title": entry.get("title"),
                        "start_time": format_timestamp(entry.get("start_time")),
                        "end_time": format_timestamp(entry.get("end_time")),
                        "category": entry.get("category", "study")
                    })
                except Exception:
                    continue
        if events:
            supabase_upsert("calendar_events", events)

    # 5. Migrate youtube.jsonl -> youtube_history
    youtube_file = os.path.join(DATA_DIR, "youtube.jsonl")
    if os.path.exists(youtube_file):
        print(f"\nProcessing youtube.jsonl...")
        videos = []
        with open(youtube_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    videos.append({
                        "video_id": entry.get("video_id"),
                        "user_id": default_user_id,
                        "title": entry.get("title"),
                        "channel": entry.get("channel", ""),
                        "topic_id": entry.get("topic_id"),
                        "status": entry.get("status", "unwatched"),
                        "watched_at": format_timestamp(entry.get("watched_at"))
                    })
                except Exception:
                    continue
        if videos:
            supabase_upsert("youtube_history", videos)

    # 6. Migrate wisdom.jsonl -> wisdom_antidotes
    wisdom_file = os.path.join(DATA_DIR, "wisdom.jsonl")
    if os.path.exists(wisdom_file):
        print(f"\nProcessing wisdom.jsonl...")
        wisdom = []
        with open(wisdom_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    wisdom.append({
                        "id": entry.get("id"),
                        "text": entry.get("text"),
                        "source_book": entry.get("source_book"),
                        "category": entry.get("category"),
                        "exercise_type": entry.get("exercise_type"),
                        "instructions": entry.get("instructions"),
                        "media_path": entry.get("media_path"),
                        "youtube_id": entry.get("youtube_id")
                    })
                except Exception:
                    continue
        if wisdom:
            supabase_upsert("wisdom_antidotes", wisdom)

    # 7. Migrate google_searches.jsonl -> google_searches
    searches_file = os.path.join(DATA_DIR, "google_searches.jsonl")
    if os.path.exists(searches_file):
        print(f"\nProcessing google_searches.jsonl...")
        searches = []
        with open(searches_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    searches.append({
                        "user_id": default_user_id,
                        "query": entry.get("query"),
                        "timestamp": format_timestamp(entry.get("timestamp")),
                        "category": entry.get("category", "General")
                    })
                except Exception:
                    continue
        if searches:
            supabase_upsert("google_searches", searches)

    print("\n" + "=" * 60)
    print("  Migration completed! Please verify your tables in Supabase.")
    print("=" * 60)

if __name__ == "__main__":
    migrate()
