// JollyRoger.AI — Desktop Activity Daemon v3.0 (Rust)
// Replaces: backend/activity_logger.py
//
// Features:
//   - Windows API: Tracks foreground window title + process name every 5s
//   - Classification: productive | passive | distracted | idle
//   - Batched HTTP POST to FastAPI /activity/ingest every 60s
//   - Native Windows Toast Notification on distraction spike
//   - Mobile Push: TODO (Phase 4 — PWA Web Push Notifications)

use chrono::Local;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::time;

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const BACKEND_URL: &str = "http://localhost:8000";
const POLL_INTERVAL_SECS: u64 = 5;
const PUSH_INTERVAL_SECS: u64 = 60;
const DISTRACTION_SPIKE_THRESHOLD_SECS: u64 = 300; // 5 minutes
const NTFY_TOPIC: &str = "jarvis-study-tracker";

// ─── CLASSIFICATION LISTS ────────────────────────────────────────────────────

fn productive_exes() -> &'static [&'static str] {
    &[
        "code.exe", "cursor.exe", "windsurf.exe", "pycharm64.exe", "idea64.exe",
        "webstorm64.exe", "datagrip64.exe", "rider64.exe",
        "python.exe", "python3.exe", "py.exe", "node.exe",
        "cmd.exe", "powershell.exe", "wt.exe", "bash.exe", "wsl.exe",
        "postman.exe", "git-bash.exe", "docker desktop.exe",
        "obsidian.exe", "notion.exe", "antigravity ide.exe", "antigravity-ide.exe",
    ]
}

fn distraction_keywords() -> &'static [&'static str] {
    &[
        "youtube shorts", "shorts", "reels", "instagram", "facebook", "twitter",
        "x.com", "reddit", "twitch", "netflix", "hotstar", "prime video",
        "steam", "epic games", "valorant", "fortnite", "pubg",
        "whatsapp web", "telegram web", "snapchat",
        "cricbuzz", "espncricinfo",
    ]
}

fn passive_keywords() -> &'static [&'static str] {
    &[
        "youtube.com/watch", "youtube - ", " - youtube",
        "udemy", "coursera", "edx", "pluralsight", "linkedin learning",
        "tutorial", "how to", "explained", "crash course", "full course",
    ]
}

fn productive_browser_keywords() -> &'static [&'static str] {
    &[
        "github.com", "github -", "stackoverflow", "stack overflow",
        "localhost", "127.0.0.1", "docs.", "devdocs",
        "leetcode", "hackerrank", "codeforces",
        "fastapi", "nextjs", "react", "supabase", "vercel", "groq",
        "medium.com", "dev.to", "hashnode",
        "study-tracker", "study tracker",
    ]
}

fn browsers() -> &'static [&'static str] {
    &["chrome.exe", "msedge.exe", "firefox.exe", "brave.exe", "opera.exe"]
}

fn youtube_study_keywords() -> &'static [&'static str] {
    &[
        "dp-700", "dp 700", "system design", "tutorial", "course", "learn",
        "programming", "coding", "developer", "dsa", "data structures", "algorithms",
        "database", "sql", "python", "javascript", "rust", "react", "next.js",
        "aws", "docker", "kubernetes", "mlops", "machine learning", "deep learning",
        "backend", "frontend", "git", "github", "how to build",
        "crash course", "lecture", "bootcamp",
    ]
}

// ─── CLASSIFICATION ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum Category {
    Productive,
    Passive,
    Distracted,
    Idle,
}

impl std::fmt::Display for Category {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Category::Productive => write!(f, "productive"),
            Category::Passive => write!(f, "passive"),
            Category::Distracted => write!(f, "distracted"),
            Category::Idle => write!(f, "idle"),
        }
    }
}

fn classify_window(app: &str, title: &str) -> Category {
    let app_l = app.to_lowercase();
    let title_l = title.to_lowercase();

    // Known productive IDEs/terminals
    if productive_exes().iter().any(|e| app_l.contains(e)) {
        return Category::Productive;
    }

    // Browser content classification
    if browsers().iter().any(|b| app_l == *b) {
        // Check distraction first (highest signal)
        if distraction_keywords().iter().any(|kw| title_l.contains(kw)) {
            return Category::Distracted;
        }
        // Smart YouTube check
        if title_l.contains("youtube") {
            if youtube_study_keywords().iter().any(|kw| title_l.contains(kw)) {
                return Category::Passive;
            } else {
                return Category::Distracted;
            }
        }
        // Passive learning
        if passive_keywords().iter().any(|kw| title_l.contains(kw)) {
            return Category::Passive;
        }
        // Productive browser use
        if productive_browser_keywords().iter().any(|kw| title_l.contains(kw)) {
            return Category::Productive;
        }
        return Category::Passive;
    }

    // Distraction-only apps
    if ["spotify.exe", "vlc.exe"].iter().any(|e| app_l.contains(e)) {
        return Category::Distracted;
    }

    Category::Idle
}

// ─── WINDOWS API ─────────────────────────────────────────────────────────────

#[cfg(target_os = "windows")]
fn get_active_window_info() -> (String, String) {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::System::Threading::{OpenProcess, QueryFullProcessImageNameW, PROCESS_QUERY_LIMITED_INFORMATION};
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId};
    use windows::core::PWSTR;

    unsafe {
        let hwnd = GetForegroundWindow();

        // Get window title
        let len = GetWindowTextLengthW(hwnd);
        let mut title_buf = vec![0u16; (len + 1) as usize];
        GetWindowTextW(hwnd, &mut title_buf);
        let title = String::from_utf16_lossy(&title_buf).trim_end_matches('\0').to_string();

        // Get process name
        let mut pid = 0u32;
        GetWindowThreadProcessId(hwnd, Some(&mut pid));
        let h_process = OpenProcess(
            PROCESS_QUERY_LIMITED_INFORMATION,
            false,
            pid,
        );
        
        let app = match h_process {
            Ok(handle) => {
                let mut buf = vec![0u16; 260];
                let mut size = buf.len() as u32;
                let pwstr = PWSTR(buf.as_mut_ptr());
                if QueryFullProcessImageNameW(handle, Default::default(), pwstr, &mut size).is_ok() {
                    let full_path = String::from_utf16_lossy(&buf[..size as usize]);
                    full_path.split('\\').last().unwrap_or("Unknown").to_string()
                } else {
                    "Unknown".to_string()
                }
            }
            Err(_) => "Unknown".to_string(),
        };

        (app, title)
    }
}

#[cfg(not(target_os = "windows"))]
fn get_active_window_info() -> (String, String) {
    ("Unknown".to_string(), "Non-Windows Platform".to_string())
}

// ─── WINDOWS TOAST NOTIFICATION ──────────────────────────────────────────────

#[cfg(target_os = "windows")]
fn show_windows_toast(title: &str, message: &str) {
    // Use PowerShell as a reliable fallback for toast notifications
    let ps_script = format!(
        r#"
        [void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')
        $n = New-Object System.Windows.Forms.NotifyIcon
        $n.Icon = [System.Drawing.SystemIcons]::Information
        $n.BalloonTipIcon = 'Warning'
        $n.BalloonTipTitle = '{}'
        $n.BalloonTipText = '{}'
        $n.Visible = $True
        $n.ShowBalloonTip(6000)
        Start-Sleep -Seconds 7
        $n.Dispose()
        "#,
        title, message
    );
    let _ = std::process::Command::new("powershell")
        .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps_script])
        .spawn();
}

#[cfg(not(target_os = "windows"))]
fn show_windows_toast(_title: &str, _message: &str) {}

// ─── MOBILE PUSH — PHASE 4 ───────────────────────────────────────────────────
// TODO (Phase 4): Implement PWA Web Push Notifications.
// The React frontend will register a Service Worker and subscribe to push events.
// The backend will use the Web Push API to deliver notifications directly to the
// user's phone/browser without any 3rd party app.
async fn send_mobile_push(_client: &Client, _title: &str, _message: &str) {
    // Phase 4 implementation here
}

// ─── DATA MODELS ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize)]
struct ActivityEvent {
    timestamp: String,
    app: String,
    title: String,
    duration_seconds: u64,
    category: String,
    is_productive: bool,
    keystrokes: u32,
    late_night: bool,
}

#[derive(Debug, Serialize)]
struct IngestRequest {
    events: Vec<ActivityEvent>,
}

#[derive(Debug, Deserialize)]
struct IngestResponse {
    success: bool,
    distraction_spike_active: Option<bool>,
    distraction_spike_details: Option<DistractionDetails>,
}

#[derive(Debug, Deserialize)]
struct DistractionDetails {
    distracted_mins: f32,
    most_distracting_app: String,
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

fn is_late_night() -> bool {
    let hour = Local::now().hour();
    hour >= 22 || hour < 4
}

fn category_icon(cat: &Category) -> &'static str {
    match cat {
        Category::Productive => "🟢",
        Category::Passive => "🟡",
        Category::Distracted => "🔴",
        Category::Idle => "⚪",
    }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    println!("============================================================");
    println!("  JollyRoger.AI Activity Daemon v3.0 (Rust)");
    println!("  Polling every {}s | Pushing every {}s", POLL_INTERVAL_SECS, PUSH_INTERVAL_SECS);
    println!("  Backend: {}", BACKEND_URL);
    println!("  Ntfy Topic: ntfy.sh/{}", NTFY_TOPIC);
    println!("  Press Ctrl+C to stop.");
    println!("============================================================");

    let client = Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .expect("Failed to build HTTP client");

    let event_batch: Arc<Mutex<Vec<ActivityEvent>>> = Arc::new(Mutex::new(Vec::new()));
    
    // ── Background pusher task ──
    let batch_clone = Arc::clone(&event_batch);
    let client_clone = client.clone();
    tokio::spawn(async move {
        let mut interval = time::interval(Duration::from_secs(PUSH_INTERVAL_SECS));
        interval.tick().await; // skip first immediate tick
        loop {
            interval.tick().await;
            push_batch(&client_clone, &batch_clone).await;
        }
    });

    // ── Main polling loop ──
    let mut poll_interval = time::interval(Duration::from_secs(POLL_INTERVAL_SECS));
    loop {
        poll_interval.tick().await;
        
        let (app, title) = get_active_window_info();

        if title.is_empty() || title == "Task Switching" || title == "Unknown" {
            continue;
        }

        let category = classify_window(&app, &title);
        let now = Local::now().format("%Y-%m-%dT%H:%M:%S%.3f").to_string();
        let late = is_late_night();

        let event = ActivityEvent {
            timestamp: now.clone(),
            app: app.clone(),
            title: title.chars().take(120).collect(),
            duration_seconds: POLL_INTERVAL_SECS,
            is_productive: category == Category::Productive || category == Category::Passive,
            category: category.to_string(),
            keystrokes: 0,
            late_night: late,
        };

        // Console output
        let icon = category_icon(&category);
        let night_tag = if late { " 🌙" } else { "" };
        println!(
            "[{}] {} {:<12} | {:<25} | {}{}",
            &now[11..19],
            icon,
            category.to_string().to_uppercase(),
            app,
            &title.chars().take(50).collect::<String>(),
            night_tag
        );

        // Add to batch
        if let Ok(mut batch) = event_batch.lock() {
            batch.push(event);
        }
    }
}

// ─── PUSH BATCH ──────────────────────────────────────────────────────────────

async fn push_batch(client: &Client, batch: &Arc<Mutex<Vec<ActivityEvent>>>) {
    let events = {
        let mut b = batch.lock().unwrap();
        if b.is_empty() {
            return;
        }
        let taken = b.clone();
        b.clear();
        taken
    };

    let count = events.len();
    let payload = IngestRequest { events };

    match client
        .post(format!("{}/activity/ingest", BACKEND_URL))
        .json(&payload)
        .send()
        .await
    {
        Ok(resp) if resp.status().is_success() => {
            if let Ok(data) = resp.json::<IngestResponse>().await {
                println!("[Daemon] ✓ Pushed {} events to backend.", count);

                if data.distraction_spike_active.unwrap_or(false) {
                    if let Some(details) = data.distraction_spike_details {
                        let title = "JollyRoger Focus Alert ⚠️";
                        let msg = format!(
                            "You've been distracted by {} for {:.0} mins. Time to focus!",
                            details.most_distracting_app, details.distracted_mins
                        );
                        println!("[Daemon] 🔔 Distraction spike! Sending notifications...");

                        // Desktop toast (Windows)
                        show_windows_toast(title, &msg);

                        // Phase 4: Mobile PWA push notification
                        send_mobile_push(client, title, &msg).await;
                    }
                }
            }
        }
        Ok(resp) => {
            println!("[Daemon] ✗ Backend returned: {}", resp.status());
        }
        Err(e) => {
            println!("[Daemon] ✗ Backend unreachable: {}", e);
        }
    }
}

// Add chrono's hour() method
trait HourExt {
    fn hour(&self) -> u32;
}

impl HourExt for chrono::DateTime<chrono::Local> {
    fn hour(&self) -> u32 {
        use chrono::Timelike;
        chrono::Timelike::hour(self)
    }
}
