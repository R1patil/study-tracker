import ctypes
import os
import time
import json
from datetime import datetime

# Windows API declarations
user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

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
    
    # Open process to get name
    PROCESS_QUERY_INFORMATION = 0x0400
    PROCESS_VM_READ = 0x0010
    h_process = kernel32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid)
    if not h_process:
        return "Unknown"
        
    # Get executable path
    buf = ctypes.create_unicode_buffer(260)
    size = ctypes.c_ulong(260)
    if kernel32.QueryFullProcessImageNameW(h_process, 0, buf, ctypes.byref(size)):
        exe_path = buf.value
        exe_name = os.path.basename(exe_path)
    else:
        exe_name = "Unknown"
    kernel32.CloseHandle(h_process)
    return exe_name

def is_productive_app(app_name: str, title: str) -> bool:
    app_lower = app_name.lower()
    title_lower = title.lower()
    
    # Distraction list
    distractions = ["netflix", "youtube", "facebook", "twitter", "x.com", "instagram", "reddit", "twitch", "gaming", "steam"]
    for dist in distractions:
        if dist in title_lower or dist in app_lower:
            # YouTube can be productive if it's a study video, but by default we tag it as distraction
            # We let the user override or tag it later. For now, tag as distraction.
            return False
            
    # Productive apps
    productive_exes = [
        "code.exe", "cursor.exe", "py.exe", "python.exe", "node.exe", 
        "cmd.exe", "powershell.exe", "wt.exe", "bash.exe", "wsl.exe",
        "postman.exe", "git-bash.exe"
    ]
    if app_lower in productive_exes:
        return True
        
    # Web browser content check
    browsers = ["chrome.exe", "msedge.exe", "firefox.exe", "opera.exe", "brave.exe"]
    if app_lower in browsers:
        productive_keywords = [
            "github", "stackoverflow", "docs", "localhost", "127.0.0.1", 
            "leetcode", "hackerrank", "medium.com", "dev.to", "study-tracker",
            "supabase", "fastapi", "nextjs", "react", "groq", "openai", "claude"
        ]
        for kw in productive_keywords:
            if kw in title_lower:
                return True
        # If browser but not matching productive list, default to false (or neutral)
        return False
        
    return False

def main():
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "user_data")
    os.makedirs(data_dir, exist_ok=True)
    log_file = os.path.join(data_dir, "activity.jsonl")
    
    print("Student OS Activity Logger started. Press Ctrl+C to stop.")
    
    last_app = ""
    last_title = ""
    start_time = time.time()
    
    while True:
        try:
            time.sleep(10) # Log/poll interval: 10 seconds
            
            app = get_active_window_process()
            title = get_active_window_title()
            
            # Skip empty or default system titles
            if not title or title in ["Task Switching", "Unknown"]:
                continue
                
            is_productive = is_productive_app(app, title)
            now = datetime.now().isoformat()
            
            log_entry = {
                "timestamp": now,
                "app": app,
                "title": title,
                "duration_seconds": 10,
                "is_productive": is_productive
            }
            
            # Append entry to activity.jsonl
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
                
        except KeyboardInterrupt:
            print("\nStopping Activity Logger...")
            break
        except Exception as e:
            # Silent fail for transient window changes
            time.sleep(2)

if __name__ == "__main__":
    main()
