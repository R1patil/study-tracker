# from fastapi import FastAPI, HTTPException, Depends, Header
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import Optional
# import json, os, httpx
# from datetime import date, datetime
# from dotenv import load_dotenv

# load_dotenv()

# app = FastAPI(title="Study Tracker API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "https://study-tracker-patil.vercel.app",
#         os.getenv("FRONTEND_URL", ""),
#         "*",
#     ],
#     allow_origin_regex=r"https://.*\.vercel\.app",
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
# DATA_DIR = "user_data"
# os.makedirs(DATA_DIR, exist_ok=True)


# # ── Auth ──────────────────────────────────────────────────────────────────────


# async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
#     """Verify Supabase JWT and return user_id."""
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(401, "Missing or invalid Authorization header")

#     token = authorization.split(" ", 1)[1]

#     # Verify token with Supabase
#     async with httpx.AsyncClient() as client:
#         resp = await client.get(
#             f"{SUPABASE_URL}/auth/v1/user",
#             headers={
#                 "Authorization": f"Bearer {token}",
#                 "apikey": SUPABASE_ANON_KEY,
#             },
#         )

#     if resp.status_code != 200:
#         raise HTTPException(401, "Invalid or expired token")

#     user_data = resp.json()
#     return user_data["id"]


# # ── Per-user JSON storage ─────────────────────────────────────────────────────


# def user_file(user_id: str) -> str:
#     return os.path.join(DATA_DIR, f"{user_id}.json")


# def load_user_data(user_id: str) -> dict:
#     path = user_file(user_id)
#     if not os.path.exists(path):
#         data = get_initial_data()
#         save_user_data(user_id, data)
#         return data
#     with open(path, "r") as f:
#         return json.load(f)


# def save_user_data(user_id: str, data: dict):
#     with open(user_file(user_id), "w") as f:
#         json.dump(data, f, indent=2)


# # ── Curriculum ────────────────────────────────────────────────────────────────


# def get_initial_data() -> dict:
#     return {
#         "topics": get_curriculum(),
#         "streaks": {"current": 0, "longest": 0, "last_study_date": None, "history": []},
#         "sessions": [],
#         "active_timer": None,
#     }


# def get_curriculum() -> dict:
#     return {
#         "system_design": {
#             "title": "System Design",
#             "color": "#6366f1",
#             "icon": "🏗️",
#             "source": "https://github.com/ashishps1/awesome-system-design-resources",
#             "sections": {
#                 "core_concepts": {
#                     "title": "Core Concepts",
#                     "topics": [
#                         {
#                             "id": "sd_01",
#                             "title": "Scalability",
#                             "url": "https://algomaster.io/learn/system-design/scalability",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_02",
#                             "title": "Availability",
#                             "url": "https://algomaster.io/learn/system-design/availability",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_03",
#                             "title": "Reliability",
#                             "url": "https://algomaster.io/learn/system-design/reliability",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_04",
#                             "title": "SPOF",
#                             "url": "https://algomaster.io/learn/system-design/single-point-of-failure-spof",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_05",
#                             "title": "Latency vs Throughput vs Bandwidth",
#                             "url": "https://algomaster.io/learn/system-design/latency-vs-throughput",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_06",
#                             "title": "Consistent Hashing",
#                             "url": "https://algomaster.io/learn/system-design/consistent-hashing",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_07",
#                             "title": "CAP Theorem",
#                             "url": "https://algomaster.io/learn/system-design/cap-theorem",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_08",
#                             "title": "Failover",
#                             "url": "https://www.druva.com/glossary/what-is-a-failover-definition-and-related-faqs",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_09",
#                             "title": "Fault Tolerance",
#                             "url": "https://www.cockroachlabs.com/blog/what-is-fault-tolerance/",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "networking": {
#                     "title": "Networking Fundamentals",
#                     "topics": [
#                         {
#                             "id": "sd_10",
#                             "title": "OSI Model",
#                             "url": "https://algomaster.io/learn/system-design/osi",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_11",
#                             "title": "IP Addresses",
#                             "url": "https://algomaster.io/learn/system-design/ip-address",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_12",
#                             "title": "DNS",
#                             "url": "https://blog.algomaster.io/p/how-dns-actually-works",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_13",
#                             "title": "Proxy vs Reverse Proxy",
#                             "url": "https://blog.algomaster.io/p/proxy-vs-reverse-proxy-explained",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_14",
#                             "title": "HTTP/HTTPS",
#                             "url": "https://algomaster.io/learn/system-design/http-https",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_15",
#                             "title": "TCP vs UDP",
#                             "url": "https://algomaster.io/learn/system-design/tcp-vs-udp",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_16",
#                             "title": "Load Balancing",
#                             "url": "https://blog.algomaster.io/p/load-balancing-algorithms-explained-with-code",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_17",
#                             "title": "Checksums",
#                             "url": "https://algomaster.io/learn/system-design/checksums",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "api": {
#                     "title": "API Fundamentals",
#                     "topics": [
#                         {
#                             "id": "sd_18",
#                             "title": "APIs",
#                             "url": "https://algomaster.io/learn/system-design/what-is-an-api",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_19",
#                             "title": "API Gateway",
#                             "url": "https://blog.algomaster.io/p/what-is-an-api-gateway",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_20",
#                             "title": "REST vs GraphQL",
#                             "url": "https://blog.algomaster.io/p/rest-vs-graphql",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_21",
#                             "title": "WebSockets",
#                             "url": "https://blog.algomaster.io/p/websockets",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_22",
#                             "title": "Webhooks",
#                             "url": "https://algomaster.io/learn/system-design/webhooks",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_23",
#                             "title": "Idempotency",
#                             "url": "https://algomaster.io/learn/system-design/idempotency",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_24",
#                             "title": "Rate Limiting",
#                             "url": "https://blog.algomaster.io/p/rate-limiting-algorithms-explained-with-code",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "database": {
#                     "title": "Database Fundamentals",
#                     "topics": [
#                         {
#                             "id": "sd_25",
#                             "title": "ACID Transactions",
#                             "url": "https://algomaster.io/learn/system-design/acid-transactions",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_26",
#                             "title": "SQL vs NoSQL",
#                             "url": "https://algomaster.io/learn/system-design/sql-vs-nosql",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_27",
#                             "title": "Database Indexes",
#                             "url": "https://algomaster.io/learn/system-design/indexing",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_28",
#                             "title": "Database Sharding",
#                             "url": "https://algomaster.io/learn/system-design/sharding",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_29",
#                             "title": "Data Replication",
#                             "url": "https://redis.com/blog/what-is-data-replication/",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_30",
#                             "title": "Database Scaling",
#                             "url": "https://blog.algomaster.io/p/system-design-how-to-scale-a-database",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_31",
#                             "title": "Bloom Filters",
#                             "url": "https://algomaster.io/learn/system-design/bloom-filters",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "caching": {
#                     "title": "Caching Fundamentals",
#                     "topics": [
#                         {
#                             "id": "sd_32",
#                             "title": "Caching 101",
#                             "url": "https://algomaster.io/learn/system-design/what-is-caching",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_33",
#                             "title": "Caching Strategies",
#                             "url": "https://algomaster.io/learn/system-design/caching-strategies",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_34",
#                             "title": "Cache Eviction Policies",
#                             "url": "https://blog.algomaster.io/p/7-cache-eviction-strategies",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_35",
#                             "title": "Distributed Caching",
#                             "url": "https://blog.algomaster.io/p/distributed-caching",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_36",
#                             "title": "CDN",
#                             "url": "https://algomaster.io/learn/system-design/content-delivery-network-cdn",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "distributed": {
#                     "title": "Distributed Systems & Microservices",
#                     "topics": [
#                         {
#                             "id": "sd_37",
#                             "title": "HeartBeats",
#                             "url": "https://blog.algomaster.io/p/heartbeats-in-distributed-systems",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_38",
#                             "title": "Service Discovery",
#                             "url": "https://blog.algomaster.io/p/service-discovery-in-distributed-systems",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_39",
#                             "title": "Consensus Algorithms",
#                             "url": "https://medium.com/@sourabhatta1819/consensus-in-distributed-system-ac79f8ba2b8c",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_40",
#                             "title": "Distributed Locking",
#                             "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_41",
#                             "title": "Gossip Protocol",
#                             "url": "http://highscalability.com/blog/2023/7/16/gossip-protocol-explained.html",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_42",
#                             "title": "Circuit Breaker",
#                             "url": "https://medium.com/geekculture/design-patterns-for-microservices-circuit-breaker-pattern-276249ffab33",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "sd_43",
#                             "title": "Distributed Tracing",
#                             "url": "https://www.dynatrace.com/news/blog/what-is-distributed-tracing/",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "interview_problems": {
#                     "title": "Interview Problems",
#                     "topics": [
#                         {
#                             "id": "sd_44",
#                             "title": "Design URL Shortener",
#                             "url": "https://algomaster.io/learn/system-design-interviews/design-url-shortener",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "easy",
#                         },
#                         {
#                             "id": "sd_45",
#                             "title": "Design Load Balancer",
#                             "url": "https://algomaster.io/learn/system-design-interviews/design-load-balancer",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "easy",
#                         },
#                         {
#                             "id": "sd_46",
#                             "title": "Design WhatsApp",
#                             "url": "https://algomaster.io/learn/system-design-interviews/design-whatsapp",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "medium",
#                         },
#                         {
#                             "id": "sd_47",
#                             "title": "Design Spotify",
#                             "url": "https://algomaster.io/learn/system-design-interviews/design-spotify",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "medium",
#                         },
#                         {
#                             "id": "sd_48",
#                             "title": "Design Instagram",
#                             "url": "https://algomaster.io/learn/system-design-interviews/design-instagram",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "medium",
#                         },
#                         {
#                             "id": "sd_49",
#                             "title": "Design Uber",
#                             "url": "https://www.youtube.com/watch?v=umWABit-wbk",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "hard",
#                         },
#                         {
#                             "id": "sd_50",
#                             "title": "Design Google Maps",
#                             "url": "https://www.youtube.com/watch?v=jk3yvVfNvds",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "hard",
#                         },
#                         {
#                             "id": "sd_51",
#                             "title": "Design Distributed Web Crawler",
#                             "url": "https://www.youtube.com/watch?v=BKZxZwUgL3Y",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "hard",
#                         },
#                         {
#                             "id": "sd_52",
#                             "title": "Design Zoom",
#                             "url": "https://www.youtube.com/watch?v=G32ThJakeHk",
#                             "status": "not_started",
#                             "notes": "",
#                             "difficulty": "hard",
#                         },
#                     ],
#                 },
#             },
#         },
#         "machine_learning": {
#             "title": "Machine Learning",
#             "color": "#10b981",
#             "icon": "🤖",
#             "source": "https://github.com/khangich/machine-learning-interview",
#             "sections": {
#                 "ml_fundamentals": {
#                     "title": "ML Fundamentals",
#                     "topics": [
#                         {
#                             "id": "ml_01",
#                             "title": "Linear Regression",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_02",
#                             "title": "Logistic Regression",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_03",
#                             "title": "Decision Trees",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_04",
#                             "title": "Random Forests",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_05",
#                             "title": "SVM",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_06",
#                             "title": "Gradient Boosting / XGBoost",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_07",
#                             "title": "K-Means Clustering",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_08",
#                             "title": "PCA & Dimensionality Reduction",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "deep_learning": {
#                     "title": "Deep Learning",
#                     "topics": [
#                         {
#                             "id": "ml_09",
#                             "title": "Neural Networks Basics",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_10",
#                             "title": "Backpropagation",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_11",
#                             "title": "CNNs",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_12",
#                             "title": "RNNs & LSTMs",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_13",
#                             "title": "Transformers & Attention",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_14",
#                             "title": "Regularization (Dropout, BatchNorm)",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_15",
#                             "title": "Optimizers (Adam, SGD)",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "ml_system_design": {
#                     "title": "ML System Design",
#                     "topics": [
#                         {
#                             "id": "ml_16",
#                             "title": "Recommendation Systems",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_17",
#                             "title": "Search Ranking",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_18",
#                             "title": "Fraud Detection",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_19",
#                             "title": "Ad Click Prediction",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_20",
#                             "title": "NLP Pipeline Design",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_21",
#                             "title": "Model Evaluation & Metrics",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "ml_coding": {
#                     "title": "ML Coding Questions",
#                     "topics": [
#                         {
#                             "id": "ml_22",
#                             "title": "Implement Linear Regression from scratch",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_23",
#                             "title": "Implement Softmax",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_24",
#                             "title": "Implement K-Means",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_25",
#                             "title": "Implement Cross-Entropy Loss",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "ml_26",
#                             "title": "Implement Batch Norm",
#                             "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#             },
#         },
#         "mlops": {
#             "title": "MLOps Zero to Hero",
#             "color": "#f59e0b",
#             "icon": "⚙️",
#             "source": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#             "sections": {
#                 "containerization": {
#                     "title": "Containerization",
#                     "topics": [
#                         {
#                             "id": "mo_01",
#                             "title": "Docker Basics",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_02",
#                             "title": "Writing Dockerfiles",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_03",
#                             "title": "Docker Compose",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_04",
#                             "title": "Container Registries",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "orchestration": {
#                     "title": "Orchestration",
#                     "topics": [
#                         {
#                             "id": "mo_05",
#                             "title": "Kubernetes Basics",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_06",
#                             "title": "Pods, Deployments, Services",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_07",
#                             "title": "Helm Charts",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_08",
#                             "title": "Kubeflow Pipelines",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "cicd": {
#                     "title": "CI/CD for ML",
#                     "topics": [
#                         {
#                             "id": "mo_09",
#                             "title": "GitHub Actions for ML",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_10",
#                             "title": "Jenkins Pipelines",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_11",
#                             "title": "Automated Testing for ML",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "experiment_tracking": {
#                     "title": "Experiment Tracking",
#                     "topics": [
#                         {
#                             "id": "mo_12",
#                             "title": "MLflow Basics",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_13",
#                             "title": "MLflow Model Registry",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_14",
#                             "title": "DVC (Data Version Control)",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_15",
#                             "title": "Weights & Biases",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#                 "model_serving": {
#                     "title": "Model Serving & Monitoring",
#                     "topics": [
#                         {
#                             "id": "mo_16",
#                             "title": "FastAPI Model Serving",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_17",
#                             "title": "BentoML",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_18",
#                             "title": "Model Monitoring (Evidently)",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_19",
#                             "title": "Data Drift Detection",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                         {
#                             "id": "mo_20",
#                             "title": "Prometheus + Grafana for ML",
#                             "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
#                             "status": "not_started",
#                             "notes": "",
#                         },
#                     ],
#                 },
#             },
#         },
#     }


# # ── Pydantic Models ───────────────────────────────────────────────────────────


# class StatusUpdate(BaseModel):
#     status: str


# class NoteUpdate(BaseModel):
#     notes: str


# class TimerAction(BaseModel):
#     action: str
#     topic_id: Optional[str] = None
#     topic_title: Optional[str] = None


# # ── Routes ────────────────────────────────────────────────────────────────────


# @app.get("/")
# def root():
#     return {"status": "Study Tracker API running ✅"}


# @app.get("/progress")
# async def get_progress(user_id: str = Depends(get_current_user)):
#     return load_user_data(user_id)


# @app.get("/stats")
# async def get_stats(user_id: str = Depends(get_current_user)):
#     data = load_user_data(user_id)
#     topics = data["topics"]
#     stats = {}

#     for track_key, track in topics.items():
#         total = done = in_progress = 0
#         for section in track["sections"].values():
#             for t in section["topics"]:
#                 total += 1
#                 if t["status"] == "done":
#                     done += 1
#                 elif t["status"] == "in_progress":
#                     in_progress += 1
#         stats[track_key] = {
#             "title": track["title"],
#             "color": track["color"],
#             "icon": track["icon"],
#             "total": total,
#             "done": done,
#             "in_progress": in_progress,
#             "not_started": total - done - in_progress,
#             "percent": round((done / total) * 100, 1) if total > 0 else 0,
#         }

#     all_total = sum(s["total"] for s in stats.values())
#     all_done = sum(s["done"] for s in stats.values())

#     return {
#         "tracks": stats,
#         "overall": {
#             "total": all_total,
#             "done": all_done,
#             "percent": round((all_done / all_total) * 100, 1) if all_total > 0 else 0,
#         },
#         "streaks": data["streaks"],
#         "sessions": data["sessions"][-10:],
#     }


# @app.patch("/topic/{topic_id}/status")
# async def update_status(
#     topic_id: str, body: StatusUpdate, user_id: str = Depends(get_current_user)
# ):
#     if body.status not in ["not_started", "in_progress", "done"]:
#         raise HTTPException(400, "Invalid status")

#     data = load_user_data(user_id)
#     found = False
#     for track in data["topics"].values():
#         for section in track["sections"].values():
#             for t in section["topics"]:
#                 if t["id"] == topic_id:
#                     t["status"] = body.status
#                     found = True
#                     break

#     if not found:
#         raise HTTPException(404, "Topic not found")

#     if body.status == "done":
#         _update_streak(data)

#     save_user_data(user_id, data)
#     return {"success": True, "topic_id": topic_id, "status": body.status}


# @app.patch("/topic/{topic_id}/notes")
# async def update_notes(
#     topic_id: str, body: NoteUpdate, user_id: str = Depends(get_current_user)
# ):
#     data = load_user_data(user_id)
#     for track in data["topics"].values():
#         for section in track["sections"].values():
#             for t in section["topics"]:
#                 if t["id"] == topic_id:
#                     t["notes"] = body.notes
#                     save_user_data(user_id, data)
#                     return {"success": True}
#     raise HTTPException(404, "Topic not found")


# @app.get("/timer")
# async def get_timer(user_id: str = Depends(get_current_user)):
#     data = load_user_data(user_id)
#     return {"active_timer": data.get("active_timer")}


# @app.post("/timer")
# async def control_timer(body: TimerAction, user_id: str = Depends(get_current_user)):
#     data = load_user_data(user_id)
#     today = date.today().isoformat()
#     now = datetime.now().isoformat()

#     if body.action == "start":
#         data["active_timer"] = {
#             "started_at": now,
#             "topic_id": body.topic_id,
#             "topic_title": body.topic_title,
#         }
#     elif body.action == "stop":
#         timer = data.get("active_timer")
#         if timer:
#             started = datetime.fromisoformat(timer["started_at"])
#             duration_mins = round((datetime.now() - started).total_seconds() / 60, 1)
#             data["sessions"].append(
#                 {
#                     "date": today,
#                     "duration_mins": duration_mins,
#                     "topic_id": timer.get("topic_id"),
#                     "topic_title": timer.get("topic_title", "General Study"),
#                 }
#             )
#             data["active_timer"] = None
#             _update_streak(data)

#     save_user_data(user_id, data)
#     return {"success": True, "timer": data.get("active_timer")}


# def _update_streak(data: dict):
#     today = date.today().isoformat()
#     streaks = data["streaks"]
#     history = streaks.get("history", [])

#     if today not in history:
#         history.append(today)
#         streaks["history"] = history

#     last = streaks.get("last_study_date")
#     if last is None:
#         streaks["current"] = 1
#     else:
#         from datetime import timedelta

#         diff = (date.today() - date.fromisoformat(last)).days
#         if diff == 1:
#             streaks["current"] += 1
#         elif diff > 1:
#             streaks["current"] = 1

#     streaks["last_study_date"] = today
#     streaks["longest"] = max(streaks.get("longest", 0), streaks["current"])


from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json, os, httpx
import sys
import shutil
from datetime import date, datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Study Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "")],
    allow_origin_regex=r"(https://.*\.vercel\.app|chrome-extension://.*)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
DATA_DIR = "user_data"
os.makedirs(DATA_DIR, exist_ok=True)


def get_coral_binary_path() -> str:
    """Finds the absolute path of the Coral binary in production."""
    paths = [
        "/app/coral",
        "/usr/local/bin/coral",
        "/root/.local/bin/coral",
    ]
    for p in paths:
        if os.path.exists(p):
            return p
            
    system_path = shutil.which("coral")
    if system_path:
        return system_path
        
    return "coral"


def setup_coral_sources_prod():
    """Generates the Coral source YAMLs and adds them to Coral CLI in production (Linux/Docker)."""
    import subprocess
    
    # Only run in production Linux/Docker environment where wsl is not used/present
    if sys.platform == "win32" and shutil.which("wsl"):
        print("Running in local Windows environment with WSL. Skipping auto source registration.")
        return
        
    coral_bin = get_coral_binary_path()
    print(f"Resolved Coral binary path: {coral_bin} (Exists: {os.path.exists(coral_bin)})")
    print("Initializing Coral sources in production Linux/Docker container...")
    
    sources_dir = "/app/coral_sources"
    os.makedirs(sources_dir, exist_ok=True)
    
    sources = {
        "activity.yaml": """name: student_activity
version: 0.1.0
dsl_version: 3
backend: jsonl
tables:
  - name: activity
    description: Tracked screen-time activity of the student
    source:
      location: file:///app/user_data/
      glob: "activity.jsonl"
    columns:
      - name: timestamp
        type: Utf8
      - name: app
        type: Utf8
      - name: title
        type: Utf8
      - name: duration_seconds
        type: Int64
      - name: is_productive
        type: Boolean
""",
        "calendar.yaml": """name: student_calendar
version: 0.1.0
dsl_version: 3
backend: jsonl
tables:
  - name: events
    description: Calendar events including exams, lectures, and planned study sessions
    source:
      location: file:///app/user_data/
      glob: "calendar.jsonl"
    columns:
      - name: event_id
        type: Utf8
      - name: title
        type: Utf8
      - name: start_time
        type: Utf8
      - name: end_time
        type: Utf8
      - name: category
        type: Utf8
""",
        "google_searches.yaml": """name: student_searches
version: 0.1.0
dsl_version: 3
backend: jsonl
tables:
  - name: searches
    description: Google searches conducted by the student for study help
    source:
      location: file:///app/user_data/
      glob: "google_searches.jsonl"
    columns:
      - name: query
        type: Utf8
      - name: timestamp
        type: Utf8
      - name: category
        type: Utf8
""",
        "progress.yaml": """name: student_progress
version: 0.1.0
dsl_version: 3
backend: jsonl
tables:
  - name: progress
    description: Learning and study progress for curriculum topics
    source:
      location: file:///app/user_data/
      glob: "progress.jsonl"
    columns:
      - name: topic_id
        type: Utf8
      - name: title
        type: Utf8
      - name: track
        type: Utf8
      - name: section
        type: Utf8
      - name: status
        type: Utf8
      - name: notes
        type: Utf8
      - name: updated_at
        type: Utf8
""",
        "youtube.yaml": """name: student_youtube
version: 0.1.0
dsl_version: 3
backend: jsonl
tables:
  - name: videos
    description: YouTube video challenges and watched history for learning topics
    source:
      location: file:///app/user_data/
      glob: "youtube.jsonl"
    columns:
      - name: video_id
        type: Utf8
      - name: title
        type: Utf8
      - name: channel
        type: Utf8
      - name: topic_id
        type: Utf8
      - name: status
        type: Utf8
      - name: watched_at
        type: Utf8
"""
    }
    
    for filename, content in sources.items():
        filepath = os.path.join(sources_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Adding Coral source spec: {filename}")
        cmd = [coral_bin, "source", "add", "--file", filepath]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"Successfully added source: {filename}. Output: {res.stdout.strip()}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to add source {filename}: {e.stderr or e.stdout}")
        except Exception as e:
            print(f"Error executing coral source add for {filename}: {str(e)}")

    # 2. Add the built-in github source
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        print("WARNING: GITHUB_TOKEN environment variable is not set! Coral github queries might fail.")
    else:
        print("Adding Coral built-in github source with GITHUB_TOKEN...")
        
    env = os.environ.copy()
    if github_token:
        env["GITHUB_TOKEN"] = github_token
        
    cmd = [coral_bin, "source", "add", "github"]
    try:
        res = subprocess.run(cmd, env=env, capture_output=True, text=True, check=True)
        print(f"Successfully added github source. Output: {res.stdout.strip()}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to add github source: {e.stderr or e.stdout}")
    except Exception as e:
        print(f"Error executing coral source add github: {str(e)}")


@app.on_event("startup")
def startup_event():
    setup_coral_sources_prod()


# ── Auth ──────────────────────────────────────────────────────────────────────


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Verify Supabase JWT and return user_id."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]

    # Verify token with Supabase
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(401, "Invalid or expired token")

    user_data = resp.json()
    return user_data["id"]


# ── Per-user JSON storage ─────────────────────────────────────────────────────


def user_file(user_id: str) -> str:
    return os.path.join(DATA_DIR, f"{user_id}.json")


def load_user_data(user_id: str) -> dict:
    path = user_file(user_id)
    if not os.path.exists(path):
        data = get_initial_data()
        save_user_data(user_id, data)
        return data
    with open(path, "r") as f:
        return json.load(f)


def sync_progress_to_jsonl(user_id: str, data: dict):
    """Flattens the nested topics database and dumps it into progress.jsonl for Coral queries."""
    progress_file = os.path.join(DATA_DIR, "progress.jsonl")
    lines = []
    
    topics = data.get("topics", {})
    for track_key, track in topics.items():
        for section_key, section in track.get("sections", {}).items():
            for t in section.get("topics", []):
                flat_entry = {
                    "topic_id": t["id"],
                    "title": t["title"],
                    "track": track["title"],
                    "section": section["title"],
                    "status": t["status"],
                    "notes": t.get("notes", ""),
                    "updated_at": datetime.now().isoformat()
                }
                lines.append(json.dumps(flat_entry))
                
    with open(progress_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def save_user_data(user_id: str, data: dict):
    with open(user_file(user_id), "w") as f:
        json.dump(data, f, indent=2)
    try:
        sync_progress_to_jsonl(user_id, data)
    except Exception as e:
        print("Failed to sync progress to JSONL:", e)


# ── Curriculum ────────────────────────────────────────────────────────────────


def get_initial_data() -> dict:
    return {
        "topics": get_curriculum(),
        "streaks": {"current": 0, "longest": 0, "last_study_date": None, "history": []},
        "sessions": [],
        "active_timer": None,
    }


def get_curriculum() -> dict:
    return {
        "system_design": {
            "title": "System Design",
            "color": "#6366f1",
            "icon": "🏗️",
            "source": "https://github.com/ashishps1/awesome-system-design-resources",
            "sections": {
                "core_concepts": {
                    "title": "Core Concepts",
                    "topics": [
                        {
                            "id": "sd_01",
                            "title": "Scalability",
                            "url": "https://algomaster.io/learn/system-design/scalability",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_02",
                            "title": "Availability",
                            "url": "https://algomaster.io/learn/system-design/availability",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_03",
                            "title": "Reliability",
                            "url": "https://algomaster.io/learn/system-design/reliability",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_04",
                            "title": "SPOF",
                            "url": "https://algomaster.io/learn/system-design/single-point-of-failure-spof",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_05",
                            "title": "Latency vs Throughput vs Bandwidth",
                            "url": "https://algomaster.io/learn/system-design/latency-vs-throughput",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_06",
                            "title": "Consistent Hashing",
                            "url": "https://algomaster.io/learn/system-design/consistent-hashing",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_07",
                            "title": "CAP Theorem",
                            "url": "https://algomaster.io/learn/system-design/cap-theorem",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_08",
                            "title": "Failover",
                            "url": "https://www.druva.com/glossary/what-is-a-failover-definition-and-related-faqs",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_09",
                            "title": "Fault Tolerance",
                            "url": "https://www.cockroachlabs.com/blog/what-is-fault-tolerance/",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "networking": {
                    "title": "Networking Fundamentals",
                    "topics": [
                        {
                            "id": "sd_10",
                            "title": "OSI Model",
                            "url": "https://algomaster.io/learn/system-design/osi",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_11",
                            "title": "IP Addresses",
                            "url": "https://algomaster.io/learn/system-design/ip-address",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_12",
                            "title": "DNS",
                            "url": "https://blog.algomaster.io/p/how-dns-actually-works",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_13",
                            "title": "Proxy vs Reverse Proxy",
                            "url": "https://blog.algomaster.io/p/proxy-vs-reverse-proxy-explained",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_14",
                            "title": "HTTP/HTTPS",
                            "url": "https://algomaster.io/learn/system-design/http-https",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_15",
                            "title": "TCP vs UDP",
                            "url": "https://algomaster.io/learn/system-design/tcp-vs-udp",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_16",
                            "title": "Load Balancing",
                            "url": "https://blog.algomaster.io/p/load-balancing-algorithms-explained-with-code",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_17",
                            "title": "Checksums",
                            "url": "https://algomaster.io/learn/system-design/checksums",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "api": {
                    "title": "API Fundamentals",
                    "topics": [
                        {
                            "id": "sd_18",
                            "title": "APIs",
                            "url": "https://algomaster.io/learn/system-design/what-is-an-api",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_19",
                            "title": "API Gateway",
                            "url": "https://blog.algomaster.io/p/what-is-an-api-gateway",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_20",
                            "title": "REST vs GraphQL",
                            "url": "https://blog.algomaster.io/p/rest-vs-graphql",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_21",
                            "title": "WebSockets",
                            "url": "https://blog.algomaster.io/p/websockets",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_22",
                            "title": "Webhooks",
                            "url": "https://algomaster.io/learn/system-design/webhooks",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_23",
                            "title": "Idempotency",
                            "url": "https://algomaster.io/learn/system-design/idempotency",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_24",
                            "title": "Rate Limiting",
                            "url": "https://blog.algomaster.io/p/rate-limiting-algorithms-explained-with-code",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "database": {
                    "title": "Database Fundamentals",
                    "topics": [
                        {
                            "id": "sd_25",
                            "title": "ACID Transactions",
                            "url": "https://algomaster.io/learn/system-design/acid-transactions",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_26",
                            "title": "SQL vs NoSQL",
                            "url": "https://algomaster.io/learn/system-design/sql-vs-nosql",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_27",
                            "title": "Database Indexes",
                            "url": "https://algomaster.io/learn/system-design/indexing",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_28",
                            "title": "Database Sharding",
                            "url": "https://algomaster.io/learn/system-design/sharding",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_29",
                            "title": "Data Replication",
                            "url": "https://redis.com/blog/what-is-data-replication/",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_30",
                            "title": "Database Scaling",
                            "url": "https://blog.algomaster.io/p/system-design-how-to-scale-a-database",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_31",
                            "title": "Bloom Filters",
                            "url": "https://algomaster.io/learn/system-design/bloom-filters",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "caching": {
                    "title": "Caching Fundamentals",
                    "topics": [
                        {
                            "id": "sd_32",
                            "title": "Caching 101",
                            "url": "https://algomaster.io/learn/system-design/what-is-caching",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_33",
                            "title": "Caching Strategies",
                            "url": "https://algomaster.io/learn/system-design/caching-strategies",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_34",
                            "title": "Cache Eviction Policies",
                            "url": "https://blog.algomaster.io/p/7-cache-eviction-strategies",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_35",
                            "title": "Distributed Caching",
                            "url": "https://blog.algomaster.io/p/distributed-caching",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_36",
                            "title": "CDN",
                            "url": "https://algomaster.io/learn/system-design/content-delivery-network-cdn",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "distributed": {
                    "title": "Distributed Systems & Microservices",
                    "topics": [
                        {
                            "id": "sd_37",
                            "title": "HeartBeats",
                            "url": "https://blog.algomaster.io/p/heartbeats-in-distributed-systems",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_38",
                            "title": "Service Discovery",
                            "url": "https://blog.algomaster.io/p/service-discovery-in-distributed-systems",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_39",
                            "title": "Consensus Algorithms",
                            "url": "https://medium.com/@sourabhatta1819/consensus-in-distributed-system-ac79f8ba2b8c",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_40",
                            "title": "Distributed Locking",
                            "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_41",
                            "title": "Gossip Protocol",
                            "url": "http://highscalability.com/blog/2023/7/16/gossip-protocol-explained.html",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_42",
                            "title": "Circuit Breaker",
                            "url": "https://medium.com/geekculture/design-patterns-for-microservices-circuit-breaker-pattern-276249ffab33",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "sd_43",
                            "title": "Distributed Tracing",
                            "url": "https://www.dynatrace.com/news/blog/what-is-distributed-tracing/",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "interview_problems": {
                    "title": "Interview Problems",
                    "topics": [
                        {
                            "id": "sd_44",
                            "title": "Design URL Shortener",
                            "url": "https://algomaster.io/learn/system-design-interviews/design-url-shortener",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "easy",
                        },
                        {
                            "id": "sd_45",
                            "title": "Design Load Balancer",
                            "url": "https://algomaster.io/learn/system-design-interviews/design-load-balancer",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "easy",
                        },
                        {
                            "id": "sd_46",
                            "title": "Design WhatsApp",
                            "url": "https://algomaster.io/learn/system-design-interviews/design-whatsapp",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "medium",
                        },
                        {
                            "id": "sd_47",
                            "title": "Design Spotify",
                            "url": "https://algomaster.io/learn/system-design-interviews/design-spotify",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "medium",
                        },
                        {
                            "id": "sd_48",
                            "title": "Design Instagram",
                            "url": "https://algomaster.io/learn/system-design-interviews/design-instagram",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "medium",
                        },
                        {
                            "id": "sd_49",
                            "title": "Design Uber",
                            "url": "https://www.youtube.com/watch?v=umWABit-wbk",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "hard",
                        },
                        {
                            "id": "sd_50",
                            "title": "Design Google Maps",
                            "url": "https://www.youtube.com/watch?v=jk3yvVfNvds",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "hard",
                        },
                        {
                            "id": "sd_51",
                            "title": "Design Distributed Web Crawler",
                            "url": "https://www.youtube.com/watch?v=BKZxZwUgL3Y",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "hard",
                        },
                        {
                            "id": "sd_52",
                            "title": "Design Zoom",
                            "url": "https://www.youtube.com/watch?v=G32ThJakeHk",
                            "status": "not_started",
                            "notes": "",
                            "difficulty": "hard",
                        },
                    ],
                },
            },
        },
        "machine_learning": {
            "title": "Machine Learning",
            "color": "#10b981",
            "icon": "🤖",
            "source": "https://github.com/khangich/machine-learning-interview",
            "sections": {
                "ml_fundamentals": {
                    "title": "ML Fundamentals",
                    "topics": [
                        {
                            "id": "ml_01",
                            "title": "Linear Regression",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_02",
                            "title": "Logistic Regression",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_03",
                            "title": "Decision Trees",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_04",
                            "title": "Random Forests",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_05",
                            "title": "SVM",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_06",
                            "title": "Gradient Boosting / XGBoost",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_07",
                            "title": "K-Means Clustering",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_08",
                            "title": "PCA & Dimensionality Reduction",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/fundamentals.md",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "deep_learning": {
                    "title": "Deep Learning",
                    "topics": [
                        {
                            "id": "ml_09",
                            "title": "Neural Networks Basics",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_10",
                            "title": "Backpropagation",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_11",
                            "title": "CNNs",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_12",
                            "title": "RNNs & LSTMs",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_13",
                            "title": "Transformers & Attention",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_14",
                            "title": "Regularization (Dropout, BatchNorm)",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_15",
                            "title": "Optimizers (Adam, SGD)",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/deep_learning.md",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "ml_system_design": {
                    "title": "ML System Design",
                    "topics": [
                        {
                            "id": "ml_16",
                            "title": "Recommendation Systems",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_17",
                            "title": "Search Ranking",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_18",
                            "title": "Fraud Detection",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_19",
                            "title": "Ad Click Prediction",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_20",
                            "title": "NLP Pipeline Design",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_21",
                            "title": "Model Evaluation & Metrics",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/ml-system-design.md",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "ml_coding": {
                    "title": "ML Coding Questions",
                    "topics": [
                        {
                            "id": "ml_22",
                            "title": "Implement Linear Regression from scratch",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_23",
                            "title": "Implement Softmax",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_24",
                            "title": "Implement K-Means",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_25",
                            "title": "Implement Cross-Entropy Loss",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "ml_26",
                            "title": "Implement Batch Norm",
                            "url": "https://github.com/khangich/machine-learning-interview/blob/master/coding.md",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
            },
        },
        "mlops": {
            "title": "MLOps Zero to Hero",
            "color": "#f59e0b",
            "icon": "⚙️",
            "source": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
            "sections": {
                "containerization": {
                    "title": "Containerization",
                    "topics": [
                        {
                            "id": "mo_01",
                            "title": "Docker Basics",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_02",
                            "title": "Writing Dockerfiles",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_03",
                            "title": "Docker Compose",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_04",
                            "title": "Container Registries",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "orchestration": {
                    "title": "Orchestration",
                    "topics": [
                        {
                            "id": "mo_05",
                            "title": "Kubernetes Basics",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_06",
                            "title": "Pods, Deployments, Services",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_07",
                            "title": "Helm Charts",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_08",
                            "title": "Kubeflow Pipelines",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "cicd": {
                    "title": "CI/CD for ML",
                    "topics": [
                        {
                            "id": "mo_09",
                            "title": "GitHub Actions for ML",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_10",
                            "title": "Jenkins Pipelines",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_11",
                            "title": "Automated Testing for ML",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "experiment_tracking": {
                    "title": "Experiment Tracking",
                    "topics": [
                        {
                            "id": "mo_12",
                            "title": "MLflow Basics",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_13",
                            "title": "MLflow Model Registry",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_14",
                            "title": "DVC (Data Version Control)",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_15",
                            "title": "Weights & Biases",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
                "model_serving": {
                    "title": "Model Serving & Monitoring",
                    "topics": [
                        {
                            "id": "mo_16",
                            "title": "FastAPI Model Serving",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_17",
                            "title": "BentoML",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_18",
                            "title": "Model Monitoring (Evidently)",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_19",
                            "title": "Data Drift Detection",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                        {
                            "id": "mo_20",
                            "title": "Prometheus + Grafana for ML",
                            "url": "https://github.com/iam-veeramalla/mlops-zero-to-hero",
                            "status": "not_started",
                            "notes": "",
                        },
                    ],
                },
            },
        },
    }


# ── Pydantic Models ───────────────────────────────────────────────────────────


class StatusUpdate(BaseModel):
    status: str


class NoteUpdate(BaseModel):
    notes: str


class TimerAction(BaseModel):
    action: str
    topic_id: Optional[str] = None
    topic_title: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────


@app.get("/")
def root():
    return {"status": "Study Tracker API running ✅"}


@app.get("/progress")
async def get_progress(user_id: str = Depends(get_current_user)):
    return load_user_data(user_id)


@app.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user)):
    data = load_user_data(user_id)
    topics = data["topics"]
    stats = {}

    for track_key, track in topics.items():
        total = done = in_progress = 0
        for section in track["sections"].values():
            for t in section["topics"]:
                total += 1
                if t["status"] == "done":
                    done += 1
                elif t["status"] == "in_progress":
                    in_progress += 1
        stats[track_key] = {
            "title": track["title"],
            "color": track["color"],
            "icon": track["icon"],
            "total": total,
            "done": done,
            "in_progress": in_progress,
            "not_started": total - done - in_progress,
            "percent": round((done / total) * 100, 1) if total > 0 else 0,
        }

    all_total = sum(s["total"] for s in stats.values())
    all_done = sum(s["done"] for s in stats.values())

    return {
        "tracks": stats,
        "overall": {
            "total": all_total,
            "done": all_done,
            "percent": round((all_done / all_total) * 100, 1) if all_total > 0 else 0,
        },
        "streaks": data["streaks"],
        "sessions": data["sessions"][-10:],
    }


@app.patch("/topic/{topic_id}/status")
async def update_status(
    topic_id: str, body: StatusUpdate, user_id: str = Depends(get_current_user)
):
    if body.status not in ["not_started", "in_progress", "done"]:
        raise HTTPException(400, "Invalid status")

    data = load_user_data(user_id)
    found = False
    for track in data["topics"].values():
        for section in track["sections"].values():
            for t in section["topics"]:
                if t["id"] == topic_id:
                    t["status"] = body.status
                    found = True
                    break

    if not found:
        raise HTTPException(404, "Topic not found")

    if body.status == "done":
        _update_streak(data)

    save_user_data(user_id, data)
    return {"success": True, "topic_id": topic_id, "status": body.status}


@app.patch("/topic/{topic_id}/notes")
async def update_notes(
    topic_id: str, body: NoteUpdate, user_id: str = Depends(get_current_user)
):
    data = load_user_data(user_id)
    for track in data["topics"].values():
        for section in track["sections"].values():
            for t in section["topics"]:
                if t["id"] == topic_id:
                    t["notes"] = body.notes
                    save_user_data(user_id, data)
                    return {"success": True}
    raise HTTPException(404, "Topic not found")


@app.get("/timer")
async def get_timer(user_id: str = Depends(get_current_user)):
    data = load_user_data(user_id)
    return {"active_timer": data.get("active_timer")}


@app.post("/timer")
async def control_timer(body: TimerAction, user_id: str = Depends(get_current_user)):
    data = load_user_data(user_id)
    today = date.today().isoformat()
    now = datetime.now().isoformat()

    if body.action == "start":
        data["active_timer"] = {
            "started_at": now,
            "topic_id": body.topic_id,
            "topic_title": body.topic_title,
        }
    elif body.action == "stop":
        timer = data.get("active_timer")
        if timer:
            started = datetime.fromisoformat(timer["started_at"])
            duration_mins = round((datetime.now() - started).total_seconds() / 60, 1)
            data["sessions"].append(
                {
                    "date": today,
                    "duration_mins": duration_mins,
                    "topic_id": timer.get("topic_id"),
                    "topic_title": timer.get("topic_title", "General Study"),
                }
            )
            data["active_timer"] = None
            _update_streak(data)

    save_user_data(user_id, data)
    return {"success": True, "timer": data.get("active_timer")}


def _update_streak(data: dict):
    today = date.today().isoformat()
    streaks = data["streaks"]
    history = streaks.get("history", [])

    if today not in history:
        history.append(today)
        streaks["history"] = history

    last = streaks.get("last_study_date")
    if last is None:
        streaks["current"] = 1
    else:
        from datetime import timedelta

        diff = (date.today() - date.fromisoformat(last)).days
        if diff == 1:
            streaks["current"] += 1
        elif diff > 1:
            streaks["current"] = 1

    streaks["last_study_date"] = today
    streaks["longest"] = max(streaks.get("longest", 0), streaks["current"])


# ── Recommendations endpoint ──────────────────────────────────────────────────


@app.get("/recommendations")
async def get_recommendations(user_id: str = Depends(get_current_user)):
    """Return raw user activity data for the frontend to send to Groq AI."""
    data = load_user_data(user_id)
    topics = data["topics"]
    sessions = data.get("sessions", [])
    streaks = data.get("streaks", {})
    today = date.today().isoformat()

    # ── Per-track stats ───────────────────────────────────────
    track_stats = {}
    in_progress_topics = []
    recently_done = []
    not_started_by_track = {}

    for track_key, track in topics.items():
        total = done = in_prog = 0
        track_not_started = []

        for section_key, section in track["sections"].items():
            for t in section["topics"]:
                total += 1
                if t["status"] == "done":
                    done += 1
                    recently_done.append(
                        {
                            "id": t["id"],
                            "title": t["title"],
                            "track": track["title"],
                        }
                    )
                elif t["status"] == "in_progress":
                    in_prog += 1
                    in_progress_topics.append(
                        {
                            "id": t["id"],
                            "title": t["title"],
                            "track": track["title"],
                            "section": section["title"],
                        }
                    )
                else:
                    track_not_started.append(
                        {
                            "id": t["id"],
                            "title": t["title"],
                            "section": section["title"],
                        }
                    )

        track_stats[track_key] = {
            "title": track["title"],
            "total": total,
            "done": done,
            "in_progress": in_prog,
            "percent": round((done / total) * 100, 1) if total > 0 else 0,
        }
        not_started_by_track[track["title"]] = track_not_started[
            :5
        ]  # first 5 not started

    # ── Last 7 days sessions ──────────────────────────────────
    from datetime import timedelta

    week_ago = (date.today() - timedelta(days=7)).isoformat()
    recent_sessions = [s for s in sessions if s.get("date", "") >= week_ago]

    # ── Study time per day (last 7 days) ──────────────────────
    daily_time: dict = {}
    for s in recent_sessions:
        d = s.get("date", "")
        daily_time[d] = daily_time.get(d, 0) + s.get("duration_mins", 0)

    # ── Most studied topic ────────────────────────────────────
    topic_time: dict = {}
    for s in sessions[-30:]:  # last 30 sessions
        tid = s.get("topic_title", "General Study")
        topic_time[tid] = topic_time.get(tid, 0) + s.get("duration_mins", 0)
    most_studied = sorted(topic_time.items(), key=lambda x: x[1], reverse=True)[:3]

    return {
        "today": today,
        "streak": {
            "current": streaks.get("current", 0),
            "longest": streaks.get("longest", 0),
            "last_study_date": streaks.get("last_study_date"),
        },
        "track_stats": track_stats,
        "in_progress_topics": in_progress_topics[:10],
        "recently_done": recently_done[-5:],
        "not_started_by_track": not_started_by_track,
        "recent_sessions": recent_sessions[-7:],
        "daily_study_time": daily_time,
        "most_studied_topics": most_studied,
        "total_study_mins": sum(s.get("duration_mins", 0) for s in sessions),
    }


# ── Activity Summary Route ────────────────────────────────────────────────────


@app.get("/activity/summary")
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
                is_prod = entry.get("is_productive", False)
                app = entry.get("app", "Unknown")
                title = entry.get("title", "")
                
                # Clean app name
                app_clean = app.replace(".exe", "").capitalize()
                
                if is_prod:
                    productive_seconds += dur
                    apps[app_clean] = apps.get(app_clean, 0) + dur
                else:
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
    }


# ── searches logging Route ────────────────────────────────────────────────────


class SearchLog(BaseModel):
    query: str
    category: Optional[str] = "General"


@app.post("/searches/log")
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
    return {"success": True}


# ── AI Jarvis Agent with Coral Tool-calling ────────────────────────────────────


from groq import Groq

def execute_coral_sql(query: str) -> str:
    """Executes a SQL query in Coral inside WSL (on Windows) or directly (on Linux) and returns the output in JSON format."""
    escaped_query = query.replace('"', '\\"')
    
    # OS-Aware CLI commands
    if sys.platform == "win32" and shutil.which("wsl"):
        cmd = ["wsl", "/home/rahul/.local/bin/coral", "sql", "--format", "json", escaped_query]
    else:
        cmd = ["coral", "sql", "--format", "json", escaped_query]
        
    try:
        import subprocess
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"SQL Error: {e.stderr or e.stdout}"
    except Exception as e:
        return f"Error executing Coral query: {str(e)}"


class ChatRequest(BaseModel):
    message: str
    history: list


@app.post("/agent/chat")
async def agent_chat(body: ChatRequest, user_id: str = Depends(get_current_user)):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(500, "GROQ_API_KEY environment variable is missing in backend")
        
    client = Groq(api_key=api_key)
    
    system_prompt = (
        "You are 'Jarvis', a highly empathetic, brilliant AI Student Operating System mentor, parent, coach, planner, and friend.\n"
        "Your mission is to guide the student to master computer science topics (System Design, Machine Learning, MLOps) and prepare for top-tier interviews.\n\n"
        "You have access to a Coral SQL data layer, which allows you to query the student's study databases:\n"
        "- student_activity.activity (screen logs tracking apps & websites)\n"
        "- student_progress.progress (their topic curriculum progress status)\n"
        "- student_calendar.events (exams, study slots, lectures)\n"
        "- student_searches.searches (Google search history log)\n"
        "- student_youtube.videos (YouTube challenge statuses)\n\n"
        "Tone and Behavior Guidelines (High EQ):\n"
        "1. Be conversational, supportive, and emotionally intelligent. Celebrate their progress.\n"
        "2. If you check their logs and see they are distracted (e.g. browsing Netflix during study windows, or having low focus scores), show caring tough love. Call them out gently but firmly, and immediately recommend a concrete study plan (e.g. 'You were on Netflix during your System Design block. Let's do a 20-min sprint on Consistent Hashing right now!').\n"
        "3. Use their recent search queries to contextually recommend relevant topics. (e.g., if they searched for 'consistent hashing', you know they are working on it).\n"
        "4. Always fetch active logs or progress via SQL if needed to answer how they are doing. Do not make up metrics.\n"
        "5. Output your messages in clear, beautiful Markdown."
    )
    
    tools = [
        {
            "type": "function",
            "function": {
                "name": "execute_coral_sql",
                "description": "Executes a SQL query against the student databases to gather real-time data on their study progress, calendar events, screen time activity, and Google searches. Use standard ANSI SQL syntax.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sql_query": {
                            "type": "string",
                            "description": "The exact SQL query to execute."
                        }
                    },
                    "required": ["sql_query"]
                }
            }
        }
    ]
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in body.history:
        messages.append(msg)
    messages.append({"role": "user", "content": body.message})
    
    try:
        for _ in range(5):
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                tools=tools,
                tool_choice="auto"
            )
            
            response_message = response.choices[0].message
            # Groq returns tool calls in choices[0].message
            # We must convert/append it to messages array
            messages.append(response_message)
            
            if not response_message.tool_calls:
                return {"response": response_message.content}
                
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                if function_name == "execute_coral_sql":
                    sql_query = function_args.get("sql_query")
                    sql_result = execute_coral_sql(sql_query)
                    
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": sql_result
                    })
                    
        return {"response": messages[-1].content or "I finished running queries but did not generate a final text answer."}
            
    except Exception as e:
        raise HTTPException(500, f"Error calling Groq API: {str(e)}")


# ── GitHub Repository Exploration & Analysis via Coral ────────────────────────

def query_coral_json(query: str):
    res_json = execute_coral_sql(query)
    if res_json.startswith("SQL Error") or res_json.startswith("Error"):
        raise HTTPException(status_code=400, detail=res_json)
    try:
        return json.loads(res_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Coral output: {str(e)}. Output was: {res_json}")


@app.get("/github/branches")
async def get_github_branches(owner: str, repo: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT name FROM github.repo_branches WHERE owner = '{owner}' AND repo = '{repo}'"
    data = query_coral_json(query)
    return [row["name"] for row in data]


@app.get("/github/structure")
async def get_github_structure(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT path, type, size FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    return query_coral_json(query)


class AnalyzeRequest(BaseModel):
    owner: str
    repo: str
    branch: str
    files: list


@app.post("/github/analyze")
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
            res = query_coral_json(query)
            if res and len(res) > 0:
                readme_content = res[0].get("content_text") or ""
        except:
            pass
            
    file_paths = [f.get("path") for f in body.files if f.get("type") == "blob"]
    truncated_files = file_paths[:250]
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(500, "GROQ_API_KEY environment variable is missing in backend")
    
    client = Groq(api_key=api_key)
    
    system_prompt = (
        "You are a JSON extractor for GitHub repos. Your goal is to analyze the repository's file structure and README "
        "to construct a step-by-step learning path / curriculum of study topics.\n\n"
        "RULES:\n"
        "1. ALWAYS return valid JSON — never fail, never return empty\n"
        "2. Group study topics into sections. Each topic MUST map to a specific resource file in the repository (e.g. a markdown guide, a source file, or a documentation file) if relevant.\n"
        "3. For each topic, construct the URL pointing directly to that file on GitHub: https://github.com/{owner}/{repo}/blob/{branch}/{file_path} (replace placeholder owner, repo, branch, file_path with actual parameters).\n"
        "4. If a topic is general and doesn't map to a specific file, use the main repository/branch URL as fallback.\n"
        "5. IDs must be unique strings like 't001', 't002'\n"
        "6. Return ONLY the raw JSON object — no markdown, no backticks, no explanation.\n\n"
        "FORMAT:\n"
        '{"sections":{"key":{"title":"name","topics":[{"id":"t001","title":"name","url":"https://...","status":"not_started","notes":""}]}}}'
    )
    
    user_prompt = (
        f"Repo: {body.repo} (Branch: {body.branch})\n"
        f"Owner: {body.owner}\n"
        f"Total Files found: {len(file_paths)}\n"
        f"Sample File list:\n{json.dumps(truncated_files, indent=2)}\n\n"
        f"README Content:\n{readme_content[:6000] if readme_content else 'No README content available.'}\n\n"
        f"Please extract all learning topics, folders, and key files, and organize them into a step-by-step study path. "
        f"Generate the exact URL for each file under the branch '{body.branch}' for the repo '{body.owner}/{body.repo}'."
    )
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            max_tokens=4000
        )
        text = response.choices[0].message.content or ""
        text = text.replace("```json", "").replace("```", "").strip()
        first = text.find("{")
        last = text.rfind("}")
        if first != -1 and last != -1:
            text = text[first:last+1]
            
        try:
            parsed = json.loads(text)
            return parsed
        except json.JSONDecodeError as de:
            if "Extra data" in str(de):
                try:
                    parsed = json.loads(text[:de.pos].strip())
                    return parsed
                except:
                    pass
            raise de
    except Exception as e:
        raise HTTPException(500, f"Error calling AI to analyze repository: {str(e)}")


@app.get("/github/file-content")
async def get_github_file_content(owner: str, repo: str, path: str, ref: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT content_text FROM github.contents WHERE owner = '{owner}' AND repo = '{repo}' AND path = '{path}' AND ref = '{ref}'"
    try:
        data = query_coral_json(query)
        if data and len(data) > 0:
            return {"content": data[0].get("content_text") or ""}
        return {"content": ""}
    except Exception as e:
        # Fallback to empty if file content cannot be fetched (e.g. binary file or missing)
        return {"content": ""}


@app.get("/github/branch-summary")
async def get_github_branch_summary(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user)):
    query = f"SELECT path, type FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    try:
        data = query_coral_json(query)
        blobs = [row for row in data if row.get("type") == "blob"]
        total = len(blobs)
        
        md_count = 0
        code_count = 0
        pdf_count = 0
        other_count = 0
        
        code_extensions = [
            ".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java", 
            ".cpp", ".c", ".h", ".cs", ".php", ".rb", ".swift", ".kt", ".sh"
        ]
        
        for b in blobs:
            path = b.get("path", "").lower()
            if path.endswith(".md") or path.endswith(".markdown"):
                md_count += 1
            elif any(path.endswith(ext) for ext in code_extensions):
                code_count += 1
            elif path.endswith(".pdf"):
                pdf_count += 1
            else:
                other_count += 1
                
        return {
            "total": total,
            "markdown": md_count,
            "code": code_count,
            "pdf": pdf_count,
            "other": other_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch branch summary: {str(e)}")


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    website: Optional[str] = ""
    resume_url: Optional[str] = ""
    summary: Optional[str] = ""


@app.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    data = load_user_data(user_id)
    return data.get("profile", {
        "first_name": "",
        "last_name": "",
        "email": "",
        "phone": "",
        "github": "",
        "linkedin": "",
        "website": "",
        "resume_url": "",
        "summary": ""
    })


@app.post("/profile")
async def update_profile(body: ProfileUpdate, user_id: str = Depends(get_current_user)):
    data = load_user_data(user_id)
    data["profile"] = body.dict()
    save_user_data(user_id, data)
    return {"success": True, "profile": data["profile"]}



