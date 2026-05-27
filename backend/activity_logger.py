"""
Jarvis OS — Desktop Activity Daemon v2.0
Windows-native background activity tracker.

Tracks:
- Active window title + process name (every 5 seconds)
- Classifies: productive | passive | distracted | idle
- Detects late-night sessions (after 10 PM)
- Posts batched events to FastAPI backend every 60 seconds
- Writes local backup to user_data/activity.jsonl
"""

import ctypes
import os
import time
import json
import httpx
import threading
import sys
from datetime import datetime, time as dtime

sys.stdout.reconfigure(encoding='utf-8')

# ─── Windows API ────────────────────────────────────────────────
user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
POLL_INTERVAL = 5        # seconds between window checks
PUSH_INTERVAL = 60       # seconds between backend pushes
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "user_data")
os.makedirs(DATA_DIR, exist_ok=True)
LOG_FILE = os.path.join(DATA_DIR, "activity.jsonl")

# ─── CLASSIFICATION LISTS ───────────────────────────────────────

PRODUCTIVE_EXES = {
    "code.exe", "cursor.exe", "windsurf.exe", "pycharm64.exe", "idea64.exe",
    "webstorm64.exe", "datagrip64.exe", "rider64.exe",
    "python.exe", "python3.exe", "py.exe", "node.exe",
    "cmd.exe", "powershell.exe", "wt.exe", "bash.exe", "wsl.exe", "sh.exe",
    "postman.exe", "git-bash.exe", "docker desktop.exe", "gitextensions.exe",
    "obsidian.exe", "notion.exe", "antigravity ide.exe", "antigravity-ide.exe",
}

DISTRACTION_KEYWORDS = [
    "youtube shorts", "shorts", "reels", "instagram", "facebook", "twitter",
    "x.com", "reddit", "twitch", "netflix", "hotstar", "prime video",
    "steam", "epic games", "valorant", "fortnite", "pubg",
    "whatsapp web", "telegram web", "snapchat",
    "cricbuzz", "espncricinfo", "livescore",
]

PASSIVE_KEYWORDS = [
    # Tutorial hell — watching without doing
    "youtube.com/watch", "youtube - ", " - youtube",
    "udemy", "coursera", "edx", "pluralsight", "linkedin learning",
    "tutorial", "how to", "explained", "crash course", "full course",
    "watch", "video",
]

PRODUCTIVE_BROWSER_KEYWORDS = [
    "github.com", "github -", "stackoverflow", "stack overflow",
    "localhost", "127.0.0.1", "docs.", ".readthedocs", "devdocs",
    "leetcode", "hackerrank", "hackerearth", "codeforces", "codechef",
    "fastapi", "nextjs", "react", "supabase", "vercel", "groq", "openai",
    "claude", "anthropic", "huggingface", "langchain",
    "medium.com", "dev.to", "hashnode", "substack",
    "aws.amazon.com/docs", "cloud.google.com/docs",
    "study-tracker", "study tracker",
    "postman", "insomnia",
]

BROWSERS = {"chrome.exe", "msedge.exe", "firefox.exe", "brave.exe", "opera.exe", "vivaldi.exe"}

YOUTUBE_STUDY_KEYWORDS = [
    "dp-700", "dp 700", "system design", "tutorial", "course", "learn",
    "programming", "coding", "developer", "dsa", "data structures", "algorithms",
    "database", "sql", "python", "javascript", "rust", "react", "next.js", "nextjs",
    "aws", "docker", "kubernetes", "mlops", "machine learning", "deep learning",
    "neural network", "backend", "frontend", "git", "github", "how to build",
    "explained", "crash course", "lecture", "hacks", "study with me", "focus session",
    "bootcamp"
]


def classify_window(app: str, title: str) -> str:
    """Returns: 'productive' | 'passive' | 'distracted' | 'idle'"""
    app_l = app.lower()
    title_l = title.lower()

    # Known productive IDEs/terminals
    if app_l in PRODUCTIVE_EXES:
        return "productive"

    # Browser content classification
    if app_l in BROWSERS:
        # Check distraction first (highest signal)
        if any(kw in title_l for kw in DISTRACTION_KEYWORDS):
            return "distracted"
        # Smart YouTube check - intercept before passive check
        if "youtube" in title_l:
            if any(study_kw in title_l for study_kw in YOUTUBE_STUDY_KEYWORDS):
                return "passive"
            else:
                return "distracted"
        # Passive learning — tutorial videos, courses
        if any(kw in title_l for kw in PASSIVE_KEYWORDS):
            return "passive"
        # Productive browser use
        if any(kw in title_l for kw in PRODUCTIVE_BROWSER_KEYWORDS):
            return "productive"
        # Unclassified browser = passive by default
        return "passive"

    # Fallback: distraction apps by exe name
    distraction_exes = {"spotify.exe", "vlc.exe", "winamp.exe"}
    if app_l in distraction_exes:
        return "distracted"

    return "idle"


def get_active_window_title() -> str:
    hwnd = user32.GetForegroundWindow()
    length = user32.GetWindowTextLengthW(hwnd)
    buf = ctypes.create_unicode_buffer(length + 1)
    user32.GetWindowTextW(hwnd, buf, length + 1)
    return buf.value or "Unknown"


def get_active_window_process() -> str:
    hwnd = user32.GetForegroundWindow()
    pid = ctypes.c_ulong()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    PROCESS_QUERY_INFORMATION = 0x0400
    PROCESS_VM_READ = 0x0010
    h_process = kernel32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid)
    if not h_process:
        return "Unknown"
    buf = ctypes.create_unicode_buffer(260)
    size = ctypes.c_ulong(260)
    exe_name = "Unknown"
    if kernel32.QueryFullProcessImageNameW(h_process, 0, buf, ctypes.byref(size)):
        exe_name = os.path.basename(buf.value)
    kernel32.CloseHandle(h_process)
    return exe_name


def is_late_night() -> bool:
    """Returns True if current time is between 10 PM and 4 AM."""
    now = datetime.now().time()
    return now >= dtime(22, 0) or now < dtime(4, 0)


# ─── KEYSTROKE SPEED TRACKER (optional — uses pynput) ────────────
_keystroke_count = 0
_keystroke_lock = threading.Lock()

def _start_keystroke_monitor():
    try:
        from pynput import keyboard
        def on_press(key):
            global _keystroke_count
            with _keystroke_lock:
                _keystroke_count += 1
        listener = keyboard.Listener(on_press=on_press)
        listener.daemon = True
        listener.start()
        print("[Daemon] Keystroke monitor active.")
    except ImportError:
        print("[Daemon] pynput not installed — keystroke tracking disabled. Run: pip install pynput")
    except Exception as e:
        print(f"[Daemon] Keystroke monitor failed: {e}")

def get_and_reset_keystrokes() -> int:
    global _keystroke_count
    with _keystroke_lock:
        count = _keystroke_count
        _keystroke_count = 0
    return count


# ─── BATCH PUSH TO BACKEND ──────────────────────────────────────
_event_batch: list[dict] = []
_batch_lock = threading.Lock()


def show_desktop_toast(title: str, message: str):
    """Triggers a native Windows balloon tip notification using PowerShell."""
    import subprocess
    ps_script = f"""
    [void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')
    $objNotification = New-Object System.Windows.Forms.NotifyIcon
    $objNotification.Icon = [System.Drawing.SystemIcons]::Information
    $objNotification.BalloonTipIcon = 'Warning'
    $objNotification.BalloonTipText = "{message}"
    $objNotification.BalloonTipTitle = "{title}"
    $objNotification.Visible = $True
    $objNotification.ShowBalloonTip(5000)
    """
    try:
        subprocess.run(["powershell", "-NoProfile", "-Command", ps_script], capture_output=True)
    except Exception as e:
        print(f"[Daemon] Failed to trigger notification: {e}")


def push_batch_to_backend():
    """POST accumulated events to backend, then clear the batch."""
    global _event_batch
    with _batch_lock:
        if not _event_batch:
            return
        batch = list(_event_batch)
        _event_batch.clear()

    try:
        resp = httpx.post(
            f"{BACKEND_URL}/activity/ingest",
            json={"events": batch},
            timeout=10.0
        )
        if resp.status_code == 200:
            print(f"[Daemon] Pushed {len(batch)} events to backend ✓")
            data = resp.json()
            if data.get("distraction_spike_active"):
                details = data.get("distraction_spike_details") or {}
                app_name = details.get("most_distracting_app", "distractions")
                mins = details.get("distracted_mins", 5)
                show_desktop_toast(
                    "Jarvis Focus Alert ⚠️",
                    f"You have been distracted by {app_name} for {mins} mins. Time to reset!"
                )
        else:
            print(f"[Daemon] Backend push failed: {resp.status_code}")
    except Exception as e:
        print(f"[Daemon] Backend unreachable: {e} — events saved locally only.")


def schedule_push():
    """Runs in background thread — pushes every PUSH_INTERVAL seconds."""
    while True:
        time.sleep(PUSH_INTERVAL)
        push_batch_to_backend()


# ─── MAIN LOOP ──────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  Jarvis OS Activity Daemon v2.0")
    print(f"  Polling every {POLL_INTERVAL}s | Pushing every {PUSH_INTERVAL}s")
    print(f"  Log: {LOG_FILE}")
    print("  Press Ctrl+C to stop.")
    print("=" * 60)

    # Start keystroke monitor in background thread
    threading.Thread(target=_start_keystroke_monitor, daemon=True).start()

    # Start batch push scheduler in background thread
    push_thread = threading.Thread(target=schedule_push, daemon=True)
    push_thread.start()

    while True:
        try:
            time.sleep(POLL_INTERVAL)

            app = get_active_window_process()
            title = get_active_window_title()

            if not title or title in ("Task Switching", "Unknown", ""):
                continue

            category = classify_window(app, title)
            keystrokes = get_and_reset_keystrokes()
            late_night = is_late_night()
            now_str = datetime.now().isoformat()

            entry = {
                "timestamp": now_str,
                "app": app,
                "title": title[:120],  # truncate long titles
                "duration_seconds": POLL_INTERVAL,
                "category": category,
                "is_productive": category in ("productive", "passive"),
                "keystrokes": keystrokes,
                "late_night": late_night,
            }

            # Local backup
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")

            # Add to batch for backend push
            with _batch_lock:
                _event_batch.append(entry)

            # Console output
            cat_icon = {"productive": "🟢", "passive": "🟡", "distracted": "🔴", "idle": "⚪"}.get(category, "⚪")
            ln_tag = " 🌙" if late_night else ""
            print(f"[{now_str[11:19]}] {cat_icon} {category.upper():<12} | {app:<25} | {title[:50]}{ln_tag}")

        except KeyboardInterrupt:
            print("\n[Daemon] Stopping — pushing remaining events...")
            push_batch_to_backend()
            print("[Daemon] Done. Goodbye.")
            break
        except Exception as e:
            print(f"[Daemon] Error: {e}")
            time.sleep(2)


if __name__ == "__main__":
    main()
