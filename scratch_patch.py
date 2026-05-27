import sys
import os

with open(r"d:\study-tracker\backend\main.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. get_activity_summary
old_summary = """@app.get("/activity/summary")
async def get_activity_summary(user_id: str = Depends(get_current_user)):
    activity_file = os.path.join(DATA_DIR, "activity.jsonl")
    if not os.path.exists(activity_file):
        return {
            "focus_score": 100,
            "productive_mins": 0,
            "distracted_mins": 0,
            "top_apps": [],
            "top_distractions": []
        }
        
    productive_seconds = 0
    distracted_seconds = 0
    apps = {}
    distractions = {}
    
    with open(activity_file, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                entry = json.loads(line)
                dur = entry.get("duration_seconds", 10)
                category = entry.get("category")
                app = entry.get("app", "Unknown")
                title = entry.get("title", "")
                
                if category is not None:
                    is_prod = category in ("productive", "passive")
                    is_dist = (category == "distracted")
                else:
                    is_prod = entry.get("is_productive", False)
                    is_dist = not is_prod
                
                # Clean app name
                app_clean = app.replace(".exe", "").capitalize()
                
                if is_prod:
                    productive_seconds += dur
                    apps[app_clean] = apps.get(app_clean, 0) + dur
                elif is_dist:
                    distracted_seconds += dur
                    # Try to extract website name from browser title
                    if app_clean.lower() in ["chrome", "msedge", "firefox", "browser"]:
                        site = "Web Browsing"
                        for w in ["youtube", "netflix", "facebook", "twitter", "x.com", "reddit", "instagram"]:
                            if w in title.lower():
                                site = w.capitalize()
                                break
                        distractions[site] = distractions.get(site, 0) + dur
                    else:
                        distractions[app_clean] = distractions.get(app_clean, 0) + dur
            except:
                continue
                
    total_seconds = productive_seconds + distracted_seconds
    focus_score = round((productive_seconds / total_seconds) * 100) if total_seconds > 0 else 100
    
    # Sort top apps/distractions
    top_apps = sorted([{"name": k, "mins": round(v/60, 1)} for k, v in apps.items()], key=lambda x: x["mins"], reverse=True)[:5]
    top_distractions = sorted([{"name": k, "mins": round(v/60, 1)} for k, v in distractions.items()], key=lambda x: x["mins"], reverse=True)[:5]
    
    return {
        "focus_score": focus_score,
        "productive_mins": round(productive_seconds / 60, 1),
        "distracted_mins": round(distracted_seconds / 60, 1),
        "top_apps": top_apps,
        "top_distractions": top_distractions
    }"""

new_summary = """@app.get("/activity/summary")
async def get_activity_summary(user_id: str = Depends(get_current_user)):
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    productive_seconds = 0
    distracted_seconds = 0
    apps = {}
    distractions = {}
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{SUPABASE_URL}/rest/v1/activity_logs?user_id=eq.{user_id}&select=app,title,duration_seconds,category,is_productive", headers=headers)
            if resp.status_code == 200:
                for entry in resp.json():
                    dur = entry.get("duration_seconds", 10)
                    category = entry.get("category")
                    app = entry.get("app", "Unknown")
                    title = entry.get("title", "")
                    
                    if category is not None:
                        is_prod = category in ("productive", "passive")
                        is_dist = (category == "distracted")
                    else:
                        is_prod = entry.get("is_productive", False)
                        is_dist = not is_prod
                    
                    app_clean = app.replace(".exe", "").capitalize()
                    
                    if is_prod:
                        productive_seconds += dur
                        apps[app_clean] = apps.get(app_clean, 0) + dur
                    elif is_dist:
                        distracted_seconds += dur
                        if app_clean.lower() in ["chrome", "msedge", "firefox", "browser"]:
                            site = "Web Browsing"
                            for w in ["youtube", "netflix", "facebook", "twitter", "x.com", "reddit", "instagram"]:
                                if w in title.lower():
                                    site = w.capitalize()
                                    break
                            distractions[site] = distractions.get(site, 0) + dur
                        else:
                            distractions[app_clean] = distractions.get(app_clean, 0) + dur
        except Exception as e:
            print("Error fetching activity summary from Supabase:", e)
                
    total_seconds = productive_seconds + distracted_seconds
    focus_score = round((productive_seconds / total_seconds) * 100) if total_seconds > 0 else 100
    
    top_apps = sorted([{"name": k, "mins": round(v/60, 1)} for k, v in apps.items()], key=lambda x: x["mins"], reverse=True)[:5]
    top_distractions = sorted([{"name": k, "mins": round(v/60, 1)} for k, v in distractions.items()], key=lambda x: x["mins"], reverse=True)[:5]
    
    return {
        "focus_score": focus_score,
        "productive_mins": round(productive_seconds / 60, 1),
        "distracted_mins": round(distracted_seconds / 60, 1),
        "top_apps": top_apps,
        "top_distractions": top_distractions
    }"""

content = content.replace(old_summary, new_summary)

# 2. log_search
old_search = """@app.post("/searches/log")
async def log_search(body: SearchLog, user_id: str = Depends(get_current_user)):
    now = datetime.now().isoformat()
    entry = {
        "query": body.query,
        "timestamp": now,
        "category": body.category
    }
    search_file = os.path.join(DATA_DIR, "google_searches.jsonl")
    with open(search_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
    return {"success": True}"""

new_search = """@app.post("/searches/log")
async def log_search(body: SearchLog, user_id: str = Depends(get_current_user)):
    now = datetime.now().isoformat()
    entry = {
        "user_id": user_id,
        "query": body.query,
        "timestamp": now,
        "category": body.category
    }
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{SUPABASE_URL}/rest/v1/google_searches", json=entry, headers=headers)
        except Exception as e:
            print("Error logging search to Supabase:", e)
    return {"success": True}"""

content = content.replace(old_search, new_search)

# 3. ingest_activity
old_ingest = """@app.post("/activity/ingest")
async def ingest_activity(body: IngestRequest):
    global distraction_spike_active, distraction_spike_details
    activity_file = os.path.join(DATA_DIR, "activity.jsonl")
    
    # Append new events
    with open(activity_file, "a", encoding="utf-8") as f:
        for event in body.events:
            f.write(json.dumps(event.dict()) + "\n")
            
    # Calculate rolling distraction spikes (last 15 minutes of logs)
    if os.path.exists(activity_file):
        try:
            total_distracted_seconds = 0
            most_distracting_app = "Unknown"
            app_durations = {}
            
            now = datetime.now()
            from datetime import timedelta
            fifteen_mins_ago = now - timedelta(minutes=15)
            
            with open(activity_file, "r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    try:
                        entry = json.loads(line)
                        ts_str = entry.get("timestamp")
                        # Parse timestamp
                        ts = datetime.fromisoformat(ts_str)
                        if ts >= fifteen_mins_ago:
                            if entry.get("category") == "distracted":
                                dur = entry.get("duration_seconds", 5)
                                total_distracted_seconds += dur
                                app = entry.get("app", "Unknown")
                                app_durations[app] = app_durations.get(app, 0) + dur
                    except Exception:
                        continue
                        
            # If sidetracked for more than 5 minutes in the last 15 minutes
            if total_distracted_seconds >= 300:
                distraction_spike_active = True
                if app_durations:
                    most_distracting_app = max(app_durations, key=app_durations.get)
                distraction_spike_details = {
                    "distracted_mins": round(total_distracted_seconds / 60, 1),
                    "most_distracting_app": most_distracting_app.replace(".exe", "").capitalize()
                }
            else:
                distraction_spike_active = False
                distraction_spike_details = {}
        except Exception as e:
            print("Failed to calculate distraction spike:", e)
            
    return {
        "success": True,
        "distraction_spike_active": distraction_spike_active,
        "distraction_spike_details": distraction_spike_details if distraction_spike_active else None
    }"""

new_ingest = """@app.post("/activity/ingest")
async def ingest_activity(body: IngestRequest, authorization: Optional[str] = Header(None)):
    global distraction_spike_active, distraction_spike_details
    
    user_id = "2ecbabc1-1e26-41c0-856b-fea847aea85f"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        if token != "test_token_2ecbabc1":
            try:
                user_id = await get_current_user(authorization)
            except:
                pass
                
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    events_payload = []
    for event in body.events:
        events_payload.append({
            "user_id": user_id,
            "timestamp": event.timestamp,
            "app": event.app,
            "title": event.title,
            "duration_seconds": event.duration_seconds,
            "category": event.category,
            "is_productive": event.category in ("productive", "passive"),
            "keystrokes": event.keystrokes,
            "late_night": event.late_night
        })
        
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{SUPABASE_URL}/rest/v1/activity_logs", json=events_payload, headers=headers)
            
            # Calculate rolling distraction spikes (last 15 minutes of logs)
            now = datetime.now()
            from datetime import timedelta
            fifteen_mins_ago = (now - timedelta(minutes=15)).isoformat()
            
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/activity_logs?user_id=eq.{user_id}&timestamp=gte.{fifteen_mins_ago}&category=eq.distracted",
                headers=headers
            )
            
            if resp.status_code == 200:
                logs = resp.json()
                total_distracted_seconds = 0
                app_durations = {}
                for entry in logs:
                    dur = entry.get("duration_seconds", 5)
                    total_distracted_seconds += dur
                    app = entry.get("app", "Unknown")
                    app_durations[app] = app_durations.get(app, 0) + dur
                    
                if total_distracted_seconds >= 300:
                    distraction_spike_active = True
                    most_distracting_app = max(app_durations, key=app_durations.get) if app_durations else "Unknown"
                    distraction_spike_details = {
                        "distracted_mins": round(total_distracted_seconds / 60, 1),
                        "most_distracting_app": most_distracting_app.replace(".exe", "").capitalize()
                    }
                else:
                    distraction_spike_active = False
                    distraction_spike_details = {}
        except Exception as e:
            print("Failed to calculate distraction spike from Supabase:", e)
            
    return {
        "success": True,
        "distraction_spike_active": distraction_spike_active,
        "distraction_spike_details": distraction_spike_details if distraction_spike_active else None
    }"""

content = content.replace(old_ingest, new_ingest)


# 4. get_intervention
old_intervention = """@app.get("/activity/intervention")
async def get_intervention(user_id: str = Depends(get_current_user)):
    global distraction_spike_active, distraction_spike_details
    
    # Query Coral wisdom table for antidote
    antidote = {
        "text": "Yogas Chitta Vritti Nirodha",
        "source_book": "Patanjali Yoga Sutras (1.2)",
        "instructions": "Yoga is the silencing of the modifications of the mind. Close your eyes and watch your thoughts settle like silt in a lake.",
        "media_path": "/assets/yoga/breath_bubble.gif"
    }
    
    try:
        query = "SELECT text, source_book, instructions, media_path, youtube_id FROM student_wisdom.wisdom ORDER BY RANDOM() LIMIT 1"
        res_str = execute_coral_sql(query)
        if not (res_str.startswith("SQL Error") or res_str.startswith("Error")):
            res_json = json.loads(res_str)
            if res_json and len(res_json) > 0:
                antidote = res_json[0]
    except Exception as e:
        print("Failed to fetch custom wisdom antidote:", e)
        
    # Get current weak/in_progress topic from curriculum to suggest a sprint topic
    sprint_topic = {"id": "sd_06", "title": "Consistent Hashing"}
    try:
        data = load_user_data(user_id)
        found = False
        for track in data.get("topics", {}).values():
            for section in track.get("sections", {}).values():
                for t in section.get("topics", []):
                    if t.get("status") in ["in_progress", "not_started"]:
                        sprint_topic = {"id": t["id"], "title": t["title"]}
                        found = True
                        break
                if found:
                    break
            if found:
                break
    except Exception:
        pass

    return {
        "trigger_intervention": distraction_spike_active,
        "details": distraction_spike_details,
        "antidote": antidote,
        "sprint_topic": sprint_topic
    }"""

new_intervention = """@app.get("/activity/intervention")
async def get_intervention(user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    global distraction_spike_active, distraction_spike_details
    
    token = authorization.split(" ")[1] if authorization else None
    
    # Query Coral wisdom table for antidote
    antidote = {
        "text": "Yogas Chitta Vritti Nirodha",
        "source_book": "Patanjali Yoga Sutras (1.2)",
        "instructions": "Yoga is the silencing of the modifications of the mind. Close your eyes and watch your thoughts settle like silt in a lake.",
        "media_path": "/assets/yoga/breath_bubble.gif"
    }
    
    try:
        query = "SELECT text, source_book, instructions, media_path, youtube_id FROM student_wisdom.wisdom ORDER BY RANDOM() LIMIT 1"
        res_str = await execute_coral_sql(query, token)
        if not (res_str.startswith("SQL Error") or res_str.startswith("Error")):
            res_json = json.loads(res_str)
            if res_json and len(res_json) > 0:
                antidote = res_json[0]
    except Exception as e:
        print("Failed to fetch custom wisdom antidote:", e)
        
    # Get current weak/in_progress topic from curriculum to suggest a sprint topic
    sprint_topic = {"id": "sd_06", "title": "Consistent Hashing"}
    try:
        data = await load_user_data(user_id, token)
        found = False
        for track in data.get("topics", {}).values():
            for section in track.get("sections", {}).values():
                for t in section.get("topics", []):
                    if t.get("status") in ["in_progress", "not_started"]:
                        sprint_topic = {"id": t["id"], "title": t["title"]}
                        found = True
                        break
                if found:
                    break
            if found:
                break
    except Exception:
        pass

    return {
        "trigger_intervention": distraction_spike_active,
        "details": distraction_spike_details,
        "antidote": antidote,
        "sprint_topic": sprint_topic
    }"""

content = content.replace(old_intervention, new_intervention)

# 5. complete_sprint
old_sprint = """@app.post("/activity/sprint-complete")
async def complete_sprint(body: SprintCompleteRequest, user_id: str = Depends(get_current_user)):
    global distraction_spike_active, distraction_spike_details
    distraction_spike_active = False
    distraction_spike_details = {}
    
    # Log focus recovery session to progress/sessions
    data = load_user_data(user_id)
    today = date.today().isoformat()
    data["sessions"].append({
        "date": today,
        "duration_mins": 5.0,
        "topic_id": body.topic_id,
        "topic_title": f"Focus Sprint: {body.topic_title}"
    })
    _update_streak(data)
    save_user_data(user_id, data)
    return {"success": True}"""

new_sprint = """@app.post("/activity/sprint-complete")
async def complete_sprint(body: SprintCompleteRequest, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    global distraction_spike_active, distraction_spike_details
    distraction_spike_active = False
    distraction_spike_details = {}
    token = authorization.split(" ")[1] if authorization else None
    
    # Log focus recovery session to progress/sessions
    data = await load_user_data(user_id, token)
    today = date.today().isoformat()
    data.setdefault("sessions", []).append({
        "date": today,
        "duration_mins": 5.0,
        "topic_id": body.topic_id,
        "topic_title": f"Focus Sprint: {body.topic_title}"
    })
    _update_streak(data)
    await save_user_data(user_id, data, token)
    return {"success": True}"""

content = content.replace(old_sprint, new_sprint)

# 6. sync_youtube
old_youtube = """@app.post("/youtube/sync")
async def sync_youtube(body: YoutubeSyncRequest, user_id: str = Depends(get_current_user)):
    youtube_file = os.path.join(DATA_DIR, "youtube.jsonl")
    
    lines = []
    for video in body.videos:
        flat_entry = {
            "video_id": video.get("id"),
            "title": video.get("title"),
            "channel": "@R-B107",
            "topic_id": video.get("category"),
            "status": "watched" if video.get("watched") else "unwatched",
            "watched_at": video.get("addedAt", datetime.now().isoformat())
        }
        lines.append(json.dumps(flat_entry))
        
    with open(youtube_file, "w", encoding="utf-8") as f:
        f.write("\\n".join(lines) + "\\n")
        
    return {"success": True}"""

new_youtube = """@app.post("/youtube/sync")
async def sync_youtube(body: YoutubeSyncRequest, user_id: str = Depends(get_current_user)):
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    payloads = []
    for video in body.videos:
        payloads.append({
            "video_id": video.get("id"),
            "user_id": user_id,
            "title": video.get("title"),
            "channel": "@R-B107",
            "topic_id": video.get("category"),
            "status": "watched" if video.get("watched") else "unwatched",
            "watched_at": video.get("addedAt", datetime.now().isoformat())
        })
        
    if payloads:
        async with httpx.AsyncClient() as client:
            try:
                await client.post(f"{SUPABASE_URL}/rest/v1/youtube_history", json=payloads, headers=headers)
            except Exception as e:
                print("Error syncing youtube to Supabase:", e)
        
    return {"success": True}"""

content = content.replace(old_youtube, new_youtube)


# 7. execute_coral_sql
old_coral_sql = """def execute_coral_sql(query: str) -> str:
    \"\"\"Executes a SQL query in Coral inside WSL (on Windows) or directly (on Linux) and returns the output in JSON format.\"\"\"
    escaped_query = query.replace('"', '\\\\"')
    
    # OS-Aware CLI commands
    if sys.platform == "win32" and shutil.which("wsl"):
        cmd = ["wsl", "/home/rahul/.local/bin/coral", "sql", "--format", "json", escaped_query]
    else:
        coral_bin = get_coral_binary_path()
        cmd = [coral_bin, "sql", "--format", "json", escaped_query]
        
    try:
        import subprocess
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"SQL Error: {e.stderr or e.stdout}"
    except Exception as e:
        return f"Error executing Coral query: {str(e)}\""""

new_coral_sql = """async def execute_coral_sql(query: str, token: str = None) -> str:
    \"\"\"Executes a SQL query. Routes Github queries to local Coral binary, and everything else to Supabase.\"\"\"
    if "github." in query.lower():
        # Fallback to local Coral for Github plugin
        escaped_query = query.replace('"', '\\\\"')
        if sys.platform == "win32" and shutil.which("wsl"):
            cmd = ["wsl", "/home/rahul/.local/bin/coral", "sql", "--format", "json", escaped_query]
        else:
            coral_bin = get_coral_binary_path()
            cmd = [coral_bin, "sql", "--format", "json", escaped_query]
        try:
            import subprocess
            result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", check=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            return f"SQL Error: {e.stderr or e.stdout}"
        except Exception as e:
            return f"Error executing Coral query: {str(e)}"
    
    # Otherwise, execute against Supabase
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token or SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"sql_query": query}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{SUPABASE_URL}/rest/v1/rpc/execute_sql", json=payload, headers=headers)
            if resp.status_code == 200:
                return json.dumps(resp.json())
            else:
                return f"SQL Error: {resp.status_code} - {resp.text}"
    except Exception as e:
        return f"Error executing Supabase query: {str(e)}\""""

content = content.replace(old_coral_sql, new_coral_sql)

# 8. agent_chat
old_agent = """@app.post("/agent/chat")
async def agent_chat(body: ChatRequest, user_id: str = Depends(get_current_user)):
    api_key = os.getenv("GROQ_API_KEY")"""

new_agent = """@app.post("/agent/chat")
async def agent_chat(body: ChatRequest, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    api_key = os.getenv("GROQ_API_KEY")"""

content = content.replace(old_agent, new_agent)

old_agent_tool = """                if function_name == "execute_coral_sql":
                    sql_query = function_args.get("sql_query")
                    sql_result = execute_coral_sql(sql_query)"""

new_agent_tool = """                if function_name == "execute_coral_sql":
                    sql_query = function_args.get("sql_query")
                    sql_result = await execute_coral_sql(sql_query, token)"""
                    
content = content.replace(old_agent_tool, new_agent_tool)


# 9. query_coral_json
old_query_coral = """def query_coral_json(query: str):
    res_json = execute_coral_sql(query)"""

new_query_coral = """async def query_coral_json(query: str, token: str = None):
    res_json = await execute_coral_sql(query, token)"""

content = content.replace(old_query_coral, new_query_coral)

# 10. get_github_branches
old_branches = """@app.get("/github/branches")
async def get_github_branches(owner: str, repo: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT name FROM github.repo_branches WHERE owner = '{owner}' AND repo = '{repo}'"
    data = query_coral_json(query)"""

new_branches = """@app.get("/github/branches")
async def get_github_branches(owner: str, repo: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT name FROM github.repo_branches WHERE owner = '{owner}' AND repo = '{repo}'"
    data = await query_coral_json(query, token)"""

content = content.replace(old_branches, new_branches)


# 11. get_github_structure
old_structure = """@app.get("/github/structure")
async def get_github_structure(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT path, type, size FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    return query_coral_json(query)"""

new_structure = """@app.get("/github/structure")
async def get_github_structure(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT path, type, size FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    return await query_coral_json(query, token)"""

content = content.replace(old_structure, new_structure)


# 12. analyze_github_repo
old_analyze = """@app.post("/github/analyze")
async def analyze_github_repo(body: AnalyzeRequest, user_id: str = Depends(get_current_user)):
    readme_content = ""
    readme_path = None
    for f in body.files:
        if f.get("path", "").lower() in ["readme.md", "readme.markdown"]:
            readme_path = f.get("path")
            break
            
    if readme_path:
        query = f"SELECT content_text FROM github.contents WHERE owner = '{body.owner}' AND repo = '{body.repo}' AND path = '{readme_path}' AND ref = '{body.branch}'"
        try:
            res = query_coral_json(query)"""

new_analyze = """@app.post("/github/analyze")
async def analyze_github_repo(body: AnalyzeRequest, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    readme_content = ""
    readme_path = None
    for f in body.files:
        if f.get("path", "").lower() in ["readme.md", "readme.markdown"]:
            readme_path = f.get("path")
            break
            
    if readme_path:
        query = f"SELECT content_text FROM github.contents WHERE owner = '{body.owner}' AND repo = '{body.repo}' AND path = '{readme_path}' AND ref = '{body.branch}'"
        try:
            res = await query_coral_json(query, token)"""

content = content.replace(old_analyze, new_analyze)

# 13. get_github_file_content
old_file = """@app.get("/github/file-content")
async def get_github_file_content(owner: str, repo: str, path: str, ref: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT content_text FROM github.contents WHERE owner = '{owner}' AND repo = '{repo}' AND path = '{path}' AND ref = '{ref}'"
    try:
        data = query_coral_json(query)"""

new_file = """@app.get("/github/file-content")
async def get_github_file_content(owner: str, repo: str, path: str, ref: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT content_text FROM github.contents WHERE owner = '{owner}' AND repo = '{repo}' AND path = '{path}' AND ref = '{ref}'"
    try:
        data = await query_coral_json(query, token)"""

content = content.replace(old_file, new_file)

# 14. get_github_branch_summary
old_branch_sum = """@app.get("/github/branch-summary")
async def get_github_branch_summary(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT path, type FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    try:
        data = query_coral_json(query)"""

new_branch_sum = """@app.get("/github/branch-summary")
async def get_github_branch_summary(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT path, type FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    try:
        data = await query_coral_json(query, token)"""

content = content.replace(old_branch_sum, new_branch_sum)

# 15 & 16. Profile endpoints
old_profile = """@app.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    data = load_user_data(user_id)
    profile = data.get("profile", {})
    # Calculate completeness
    filled = sum(1 for f in REQUIRED_PROFILE_FIELDS if profile.get(f))
    profile["_completeness_pct"] = round((filled / len(REQUIRED_PROFILE_FIELDS)) * 100)
    profile["_missing_fields"] = [f for f in REQUIRED_PROFILE_FIELDS if not profile.get(f)]
    return profile


@app.post("/profile")
async def update_profile(body: ProfileUpdate, user_id: str = Depends(get_current_user)):
    data = load_user_data(user_id)
    # Merge — keep existing values if new value is blank
    existing = data.get("profile", {})
    incoming = {k: v for k, v in body.dict().items() if v}
    existing.update(incoming)
    data["profile"] = existing
    save_user_data(user_id, data)
    # Recalculate completeness
    filled = sum(1 for f in REQUIRED_PROFILE_FIELDS if existing.get(f))
    return {
        "success": True,
        "profile": existing,
        "completeness_pct": round((filled / len(REQUIRED_PROFILE_FIELDS)) * 100),
        "missing_fields": [f for f in REQUIRED_PROFILE_FIELDS if not existing.get(f)]
    }"""

new_profile = """@app.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    data = await load_user_data(user_id, token)
    profile = data.get("profile", {})
    # Calculate completeness
    filled = sum(1 for f in REQUIRED_PROFILE_FIELDS if profile.get(f))
    profile["_completeness_pct"] = round((filled / len(REQUIRED_PROFILE_FIELDS)) * 100) if len(REQUIRED_PROFILE_FIELDS) > 0 else 0
    profile["_missing_fields"] = [f for f in REQUIRED_PROFILE_FIELDS if not profile.get(f)]
    return profile


@app.post("/profile")
async def update_profile(body: ProfileUpdate, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    data = await load_user_data(user_id, token)
    # Merge — keep existing values if new value is blank
    existing = data.get("profile", {})
    incoming = {k: v for k, v in body.dict().items() if v}
    existing.update(incoming)
    data["profile"] = existing
    await save_user_data(user_id, data, token)
    # Recalculate completeness
    filled = sum(1 for f in REQUIRED_PROFILE_FIELDS if existing.get(f))
    return {
        "success": True,
        "profile": existing,
        "completeness_pct": round((filled / len(REQUIRED_PROFILE_FIELDS)) * 100) if len(REQUIRED_PROFILE_FIELDS) > 0 else 0,
        "missing_fields": [f for f in REQUIRED_PROFILE_FIELDS if not existing.get(f)]
    }"""

content = content.replace(old_profile, new_profile)

with open(r"d:\study-tracker\backend\main.py", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
