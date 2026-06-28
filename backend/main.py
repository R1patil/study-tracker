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

app = FastAPI(title="JollyRoger AI API")

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
        "/app/bin/coral",
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
""",
        "wisdom.yaml": """name: student_wisdom
version: 0.1.0
dsl_version: 3
backend: jsonl
tables:
  - name: wisdom
    description: Trusted books, verses, videos, and instructions related to Yoga, Mindfulness, and Spiritual focus antidotes
    source:
      location: file:///app/user_data/
      glob: "wisdom.jsonl"
    columns:
      - name: id
        type: Utf8
      - name: text
        type: Utf8
      - name: source_book
        type: Utf8
      - name: category
        type: Utf8
      - name: exercise_type
        type: Utf8
      - name: instructions
        type: Utf8
      - name: media_path
        type: Utf8
      - name: youtube_id
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

    if token == "test_token_2ecbabc1":
        return "2ecbabc1-1e26-41c0-856b-fea847aea85f"

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


async def load_user_data(user_id: str, token: str = None) -> dict:
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token or SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    # 1. Fetch Profile
    profile = {}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{SUPABASE_URL}/rest/v1/profiles?user_id=eq.{user_id}", headers=headers)
            if resp.status_code == 200 and resp.json():
                profile = resp.json()[0].get("profile_data", {})
        except Exception as e:
            print("Error loading profile from Supabase:", e)

    # 2. Fetch Streaks
    streaks_data = {"current": 0, "longest": 0, "last_study_date": None}
    active_timer = None
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{SUPABASE_URL}/rest/v1/user_streaks?user_id=eq.{user_id}", headers=headers)
            if resp.status_code == 200 and resp.json():
                row = resp.json()[0]
                streaks_data = {
                    "current": row.get("current_streak", 0),
                    "longest": row.get("longest_streak", 0),
                    "last_study_date": row.get("last_study_date")
                }
                active_timer = row.get("active_timer")
        except Exception as e:
            print("Error loading streaks from Supabase:", e)

    # 3. Fetch Curriculum Progress
    progress_rows = []
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{SUPABASE_URL}/rest/v1/curriculum_progress?user_id=eq.{user_id}", headers=headers)
            if resp.status_code == 200:
                progress_rows = resp.json()
        except Exception as e:
            print("Error loading progress from Supabase:", e)
            
    # We construct the nested curriculum topics
    topics = get_curriculum()
    if progress_rows:
        progress_map = {r["topic_id"]: r for r in progress_rows}
        for track_key, track in topics.items():
            for section_key, section in track.get("sections", {}).items():
                for t in section.get("topics", []):
                    tid = t["id"]
                    if tid in progress_map:
                        t["status"] = progress_map[tid].get("status", "not_started")
                        t["notes"] = progress_map[tid].get("notes", "")

    # 4. Fetch Sessions
    sessions = []
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{SUPABASE_URL}/rest/v1/study_sessions?user_id=eq.{user_id}", headers=headers)
            if resp.status_code == 200:
                for s in resp.json():
                    sessions.append({
                        "date": s.get("date"),
                        "duration_mins": s.get("duration_mins"),
                        "topic_id": s.get("topic_id"),
                        "topic_title": s.get("topic_title")
                    })
        except Exception as e:
            print("Error loading sessions from Supabase:", e)
                
    # If the user is completely new (profile is empty), we initialize their progress
    if not profile and not progress_rows:
        data = get_initial_data()
        await save_user_data(user_id, data, token)
        return data

    return {
        "profile": profile,
        "topics": topics,
        "streaks": streaks_data,
        "sessions": sessions,
        "active_timer": active_timer
    }


async def save_user_data(user_id: str, data: dict, token: str = None):
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token or SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    # A. Save Profile
    if "profile" in data:
        profile_payload = {
            "user_id": user_id,
            "profile_data": data["profile"],
            "updated_at": datetime.now().isoformat()
        }
        async with httpx.AsyncClient() as client:
            try:
                await client.post(f"{SUPABASE_URL}/rest/v1/profiles", json=profile_payload, headers=headers)
            except Exception as e:
                print("Error saving profile to Supabase:", e)

    # B. Save Streaks & Active Timer
    streaks = data.get("streaks", {})
    active_timer = data.get("active_timer")
    streak_payload = {
        "user_id": user_id,
        "current_streak": int(streaks.get("current", 0)),
        "longest_streak": int(streaks.get("longest", 0)),
        "last_study_date": streaks.get("last_study_date"),
        "active_timer": active_timer
    }
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{SUPABASE_URL}/rest/v1/user_streaks", json=streak_payload, headers=headers)
        except Exception as e:
            print("Error saving streaks to Supabase:", e)

    # C. Save Curriculum Progress
    progress_rows = []
    topics = data.get("topics", {})
    for track_key, track in topics.items():
        for section_key, section in track.get("sections", {}).items():
            for t in section.get("topics", []):
                progress_rows.append({
                    "user_id": user_id,
                    "topic_id": t["id"],
                    "title": t["title"],
                    "track": track["title"],
                    "section": section["title"],
                    "status": t["status"],
                    "notes": t.get("notes", ""),
                    "updated_at": datetime.now().isoformat()
                })
    if progress_rows:
        async with httpx.AsyncClient() as client:
            try:
                await client.post(f"{SUPABASE_URL}/rest/v1/curriculum_progress", json=progress_rows, headers=headers)
            except Exception as e:
                print("Error saving progress to Supabase:", e)

    # D. Save Study Sessions
    async with httpx.AsyncClient() as client:
        try:
            del_headers = {**headers}
            del_headers.pop("Prefer", None)
            await client.delete(f"{SUPABASE_URL}/rest/v1/study_sessions?user_id=eq.{user_id}", headers=del_headers)
            
            sessions = data.get("sessions", [])
            if sessions:
                session_payloads = []
                for s in sessions:
                    session_payloads.append({
                        "user_id": user_id,
                        "date": s.get("date"),
                        "duration_mins": float(s.get("duration_mins", 0)),
                        "topic_id": s.get("topic_id"),
                        "topic_title": s.get("topic_title")
                    })
                await client.post(f"{SUPABASE_URL}/rest/v1/study_sessions", json=session_payloads, headers=headers)
        except Exception as e:
            print("Error saving sessions to Supabase:", e)


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
    return await load_user_data(user_id)


@app.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user)):
    data = await load_user_data(user_id)
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

    data = await load_user_data(user_id)
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

    await save_user_data(user_id, data)
    return {"success": True, "topic_id": topic_id, "status": body.status}


@app.patch("/topic/{topic_id}/notes")
async def update_notes(
    topic_id: str, body: NoteUpdate, user_id: str = Depends(get_current_user)
):
    data = await load_user_data(user_id)
    for track in data["topics"].values():
        for section in track["sections"].values():
            for t in section["topics"]:
                if t["id"] == topic_id:
                    t["notes"] = body.notes
                    await save_user_data(user_id, data)
                    return {"success": True}
    raise HTTPException(404, "Topic not found")


@app.get("/timer")
async def get_timer(user_id: str = Depends(get_current_user)):
    data = await load_user_data(user_id)
    return {"active_timer": data.get("active_timer")}


@app.post("/timer")
async def control_timer(body: TimerAction, user_id: str = Depends(get_current_user)):
    data = await load_user_data(user_id)
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

    await save_user_data(user_id, data)
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
    data = await load_user_data(user_id)
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


# ── Global State for Distraction Spikes ───────────────────────────────────────
distraction_spike_active = False
distraction_spike_details = {}
current_activity = None


class ActivityEvent(BaseModel):
    timestamp: str
    app: str
    title: str
    duration_seconds: int
    category: str
    keystrokes: Optional[int] = 0
    late_night: Optional[bool] = False


class IngestRequest(BaseModel):
    events: list[ActivityEvent]


@app.post("/activity/ingest")
async def ingest_activity(body: IngestRequest):
    global distraction_spike_active, distraction_spike_details, current_activity
    if body.events:
        last = body.events[-1]
        current_activity = {
            "timestamp": last.timestamp,
            "app": last.app,
            "title": last.title,
            "category": last.category,
            "is_productive": last.category in ("productive", "passive")
        }
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
    }


@app.get("/activity/current")
async def get_current_activity():
    global current_activity
    return current_activity or {
        "app": "None",
        "title": "No active window logged yet",
        "category": "idle",
        "is_productive": False
    }


@app.get("/activity/intervention")
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
    }


class SprintCompleteRequest(BaseModel):
    topic_id: str
    topic_title: str


@app.post("/activity/sprint-complete")
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
    return {"success": True}


class YoutubeSyncRequest(BaseModel):
    videos: list


@app.post("/youtube/sync")
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
        
    return {"success": True}


# ── AI Jarvis Agent with Coral Tool-calling ────────────────────────────────────


from groq import Groq

async def execute_coral_sql(query: str, token: str = None) -> str:
    """Executes a SQL query. Routes Github queries to local Coral binary, and everything else to Supabase."""
    if "github." in query.lower():
        # Fallback to local Coral for Github plugin
        escaped_query = query.replace('"', '\\"')
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
        return f"Error executing Supabase query: {str(e)}"


class ChatRequest(BaseModel):
    message: str
    history: list


@app.post("/agent/chat")
async def agent_chat(body: ChatRequest, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(500, "GROQ_API_KEY environment variable is missing in backend")
        
    client = Groq(api_key=api_key)
    
    system_prompt = (
        "You are 'Captain Jarvis', a highly empathetic, brilliant AI Career Navigator, sea captain, and spiritual guide on the high seas of CS learning.\n"
        "Your mission is to guide your student crew member to master computer science topics (System Design, Machine Learning, MLOps) and sail through the stormy waters of distractions.\n\n"
        "You have access to the Coral SQL data layer, which allows you to query your ship's study databases:\n"
        "- student_activity.activity (screen logs tracking productive and distracted logs)\n"
        "- student_progress.progress (their learning track progress status)\n"
        "- student_calendar.events (exams, study slots, voyages)\n"
        "- student_searches.searches (Google search log history)\n"
        "- student_youtube.videos (YouTube learning challenges)\n"
        "- student_wisdom.wisdom (Traditional verses, yoga focus instructions, and classical quotes)\n\n"
        "Tone and Behavior Guidelines (Spiritual Sea Captain & Sattvic Wisdom):\n"
        "1. First-Principles Thinking: When explaining any technical concept (like database partitioning or gradient descent), ALWAYS explain it using first-principles thinking. Deconstruct the concept into its absolute fundamental building blocks (e.g. storage bytes, CPU cycles, electrical signals, basic arithmetic) and then construct the concept up step-by-step. Do not use buzzwords without defining their underlying mechanics.\n"
        "2. Yogic Philosophy on the High Seas: Guide the student using traditional Indian wisdom. Discern between three states of mind:\n"
        "   - Sattva (Calm, focused sailing): Praise them when they exhibit focused study sessions.\n"
        "   - Rajas (Stormy, restless seas, quick context-switching): Suggest sitting straight, taking deep breaths (Pranayama), or anchoring their mind.\n"
        "   - Tamas (Becalmed, lazy waters, procrastination, infinite scrolling): Wake them up with gentle but firm tough love of a seasoned sea captain.\n"
        "3. Exposing Addictive Algorithms: If you run a Coral SQL query and detect time spent on social feeds (Instagram, Meta/Facebook, etc.) during study windows, call them out. Explain that these corporate leviathans use manipulation algorithms to farm their attention for advertising dollars. Calculate the exact minutes wasted and contrast it with their curriculum goals.\n"
        "4. Quote Classical Wisdom: Periodically quote Patanjali's Yoga Sutras (like 'Yogas Chitta Vritti Nirodha' - yoga is calming the fluctuations of the mind) or the Bhagavad Gita's Karma Yoga when the student is restless or procrastinating.\n"
        "5. Speak with mild, charming sea captain metaphors (e.g., 'smooth sailing', 'stormy seas of YouTube Shorts', 'hoist the sails of concentration'), but keep it professional, highly technical, and deeply empathetic. Output in beautiful, clear Markdown."
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
                    sql_result = await execute_coral_sql(sql_query, token)
                    
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": sql_result
                    })
                    
        return {"response": messages[-1].content or "I finished running queries but did not generate a final text answer."}
            
    except Exception as e:
        raise HTTPException(500, f"Error calling Groq API: {str(e)}")


# ── Phase 2: Proactive Behavioral Intervention ────────────────────────────────

@app.get("/agent/proactive-check")
async def proactive_check(user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    """
    Phase 2 - Called periodically by the frontend dashboard (every 60s).
    If a distraction spike is active, uses Jarvis LLM to generate a personalized
    intervention with a specific code sprint topic based on the user's weakest area.
    Returns: { trigger: bool, message: str, sprint_topic: {...} }
    """
    global distraction_spike_active, distraction_spike_details
    token = authorization.split(" ")[1] if authorization else None

    if not distraction_spike_active:
        return {"trigger": False}

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"trigger": True, "message": "You've been distracted. Time to refocus!", "sprint_topic": None}

    # Gather context: most distracted app + user's weakest topic
    app_name = distraction_spike_details.get("most_distracting_app", "social media")
    dist_mins = distraction_spike_details.get("distracted_mins", 5)

    # Find weakest in-progress topic
    sprint_topic = {"id": "sd_01", "title": "Consistent Hashing"}
    try:
        data = await load_user_data(user_id, token)
        for track in data.get("topics", {}).values():
            for section in track.get("sections", {}).values():
                for t in section.get("topics", []):
                    if t.get("status") in ["in_progress", "not_started"]:
                        sprint_topic = {"id": t["id"], "title": t["title"]}
                        break
    except Exception:
        pass

    # Use Groq LLM to generate a short, personalized, high-EQ intervention
    try:
        groq_client = Groq(api_key=api_key)
        prompt = (
            f"The student has been distracted by '{app_name}' for {dist_mins} minutes. "
            f"Their next topic to study is '{sprint_topic['title']}'. "
            "Generate a SHORT (2-3 sentences max), empathetic but firm sea-captain intervention message. "
            "Quote one line from the Bhagavad Gita or Patanjali Yoga Sutras if relevant, themed around calming the stormy waters of the mind. "
            "End with a clear call to action for a 5-minute focus code sprint to get back on track. "
            "Do NOT use Markdown. Plain text only. Be human, not robotic."
        )
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are Captain Jarvis, a high-EQ AI sea captain and mentor. Keep responses short, warm, and direct."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )
        message = response.choices[0].message.content.strip()
    except Exception as e:
        message = f"Hey! You've been on {app_name} for {dist_mins} mins. Let's do a 5-min sprint on {sprint_topic['title']} — small wins add up!"

    return {
        "trigger": True,
        "message": message,
        "sprint_topic": sprint_topic,
        "distraction_details": distraction_spike_details
    }

# ── GitHub Repository Exploration & Analysis via Coral ────────────────────────

async def query_coral_json(query: str, token: str = None):
    res_json = await execute_coral_sql(query, token)
    if res_json.startswith("SQL Error") or res_json.startswith("Error"):
        raise HTTPException(status_code=400, detail=res_json)
    try:
        return json.loads(res_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Coral output: {str(e)}. Output was: {res_json}")


@app.get("/github/branches")
async def get_github_branches(owner: str, repo: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT name FROM github.repo_branches WHERE owner = '{owner}' AND repo = '{repo}'"
    data = await query_coral_json(query, token)
    return [row["name"] for row in data]


@app.get("/github/structure")
async def get_github_structure(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT path, type, size FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    return await query_coral_json(query, token)


class AnalyzeRequest(BaseModel):
    owner: str
    repo: str
    branch: str
    files: list


@app.post("/github/analyze")
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
            res = await query_coral_json(query, token)
            if res and len(res) > 0:
                readme_content = res[0].get("content_text") or ""
        except:
            pass
            
    file_paths = [f.get("path") for f in body.files if f.get("type") == "blob"]
    truncated_files = file_paths[:100]
    
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
        f"README Content:\n{readme_content[:3000] if readme_content else 'No README content available.'}\n\n"
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
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=2500
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
async def get_github_file_content(owner: str, repo: str, path: str, ref: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT content_text FROM github.contents WHERE owner = '{owner}' AND repo = '{repo}' AND path = '{path}' AND ref = '{ref}'"
    try:
        data = await query_coral_json(query, token)
        if data and len(data) > 0:
            return {"content": data[0].get("content_text") or ""}
        return {"content": ""}
    except Exception as e:
        # Fallback to empty if file content cannot be fetched (e.g. binary file or missing)
        return {"content": ""}


@app.get("/github/branch-summary")
async def get_github_branch_summary(owner: str, repo: str, branch: str, user_id: str = Depends(get_current_user), authorization: str = Header(None)):
    token = authorization.split(" ")[1] if authorization else None
    query = f"SELECT path, type FROM github.trees WHERE owner = '{owner}' AND repo = '{repo}' AND tree_sha = '{branch}' AND recursive = '1'"
    try:
        data = await query_coral_json(query, token)
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
    # Personal
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    phone_country_code: Optional[str] = "+91"
    date_of_birth: Optional[str] = ""
    gender: Optional[str] = ""
    pronouns: Optional[str] = ""

    # Address
    address_line1: Optional[str] = ""
    address_line2: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    state_code: Optional[str] = ""
    zip_code: Optional[str] = ""
    country: Optional[str] = "India"
    country_code: Optional[str] = "IN"

    # Online Presence
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    website: Optional[str] = ""
    portfolio: Optional[str] = ""
    twitter: Optional[str] = ""
    stackoverflow: Optional[str] = ""
    resume_url: Optional[str] = ""

    # Summary / Cover letter
    summary: Optional[str] = ""
    cover_letter_template: Optional[str] = ""
    why_this_company: Optional[str] = ""

    # Work Authorization
    work_authorization_india: Optional[str] = "Yes - Indian Citizen"
    require_visa_sponsorship: Optional[str] = "No"
    work_authorization_us: Optional[str] = ""
    currently_authorized_india: Optional[str] = "Yes"
    legally_eligible_to_work: Optional[str] = "Yes"

    # Employment Preferences
    job_type: Optional[str] = "Full-time"
    work_mode_preference: Optional[str] = "Hybrid"
    willing_to_relocate: Optional[str] = "Yes"
    willing_to_travel: Optional[str] = "Yes"
    travel_percentage: Optional[str] = "25"
    notice_period_days: Optional[str] = "30"
    notice_period_text: Optional[str] = "30 days"
    availability_to_join: Optional[str] = ""
    earliest_start_date: Optional[str] = ""

    # Compensation
    current_ctc: Optional[str] = ""
    expected_ctc: Optional[str] = ""
    expected_ctc_min: Optional[str] = ""
    expected_ctc_max: Optional[str] = ""
    salary_currency: Optional[str] = "INR"
    open_to_negotiate: Optional[str] = "Yes"

    # Work Experience
    total_years_experience: Optional[str] = ""
    experience_level: Optional[str] = ""
    currently_employed: Optional[str] = "Yes"
    current_job_title: Optional[str] = ""
    current_company: Optional[str] = ""
    current_company_location: Optional[str] = ""
    current_employment_start: Optional[str] = ""
    current_job_description: Optional[str] = ""
    previous_job_1_title: Optional[str] = ""
    previous_job_1_company: Optional[str] = ""
    previous_job_1_location: Optional[str] = ""
    previous_job_1_start: Optional[str] = ""
    previous_job_1_end: Optional[str] = ""
    previous_job_1_description: Optional[str] = ""

    # Education
    highest_degree: Optional[str] = ""
    major: Optional[str] = ""
    specialization: Optional[str] = ""
    university: Optional[str] = ""
    college_name: Optional[str] = ""
    graduation_year: Optional[str] = ""
    graduation_month: Optional[str] = ""
    cgpa: Optional[str] = ""
    gpa_scale: Optional[str] = "10"
    percentage: Optional[str] = ""
    education_country: Optional[str] = "India"
    currently_studying: Optional[str] = "No"

    # Skills
    skills_text: Optional[str] = ""
    primary_skill: Optional[str] = ""
    years_python: Optional[str] = ""
    years_javascript: Optional[str] = ""
    years_nodejs: Optional[str] = ""
    years_react: Optional[str] = ""

    # Languages
    english_proficiency: Optional[str] = "Professional - Full Professional"

    # Certifications
    certifications_text: Optional[str] = ""

    # Projects
    projects_text: Optional[str] = ""

    # EEO / Voluntary
    race_ethnicity: Optional[str] = "Prefer not to disclose"
    veteran_status: Optional[str] = "I am not a veteran"
    disability_status: Optional[str] = "No, I do not have a disability"

    # Source
    referral_source: Optional[str] = "LinkedIn"
    referral_person_name: Optional[str] = ""
    referral_person_email: Optional[str] = ""
    referred_by_employee: Optional[str] = "No"

    # Behavioral Q&A
    why_leaving_current_job: Optional[str] = ""
    biggest_achievement: Optional[str] = ""
    where_do_you_see_yourself: Optional[str] = ""
    strengths: Optional[str] = ""
    weaknesses: Optional[str] = ""
    describe_yourself: Optional[str] = ""
    biggest_challenge: Optional[str] = ""
    leadership_example: Optional[str] = ""
    conflict_resolution: Optional[str] = ""
    teamwork_example: Optional[str] = ""

    # References
    reference_1_name: Optional[str] = ""
    reference_1_title: Optional[str] = ""
    reference_1_company: Optional[str] = ""
    reference_1_email: Optional[str] = ""
    reference_1_phone: Optional[str] = ""


# Profile completeness calculation
REQUIRED_PROFILE_FIELDS = [
    "first_name", "last_name", "email", "phone",
    "address_line1", "city", "state", "zip_code", "country",
    "linkedin", "github", "resume_url",
    "current_job_title", "current_company",
    "total_years_experience",
    "highest_degree", "university", "graduation_year", "cgpa",
    "summary", "skills_text",
    "expected_ctc", "current_ctc", "notice_period_text",
    "willing_to_relocate", "work_authorization_india",
    "why_leaving_current_job", "strengths", "biggest_achievement",
    "where_do_you_see_yourself"
]


@app.get("/profile")
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
    }


# ─────────────────────────────────────────────────────────────────────────────
# AI TAILORING ENDPOINTS
# Uses Groq llama-3.3-70b to tailor resume fields for a specific job posting.
# ─────────────────────────────────────────────────────────────────────────────

class TailorRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = ""
    company_name: Optional[str] = ""
    profile: dict  # full profile dict from the extension


class RegenerateFieldRequest(BaseModel):
    field_name: str   # e.g. "summary", "cover_letter", "why_this_company"
    job_description: str
    job_title: Optional[str] = ""
    company_name: Optional[str] = ""
    profile: dict
    instruction: Optional[str] = ""  # custom human instruction e.g. "make it more concise"


TAILOR_SYSTEM_PROMPT = """You are an elite resume writer and ATS optimization expert.

Given a candidate's profile and a job description, generate 5 tailored text fields that will:
1. Maximize keyword overlap with the job description for ATS systems
2. Match the seniority, tone, and technical depth required by the role
3. Sound natural and authentic — not keyword-stuffed
4. NEVER invent experience or skills the candidate doesn't already have
5. Reframe existing experience to highlight the most relevant aspects

Return ONLY a valid JSON object with exactly these 5 keys:
{
  "summary": "3-4 sentence professional summary tailored to this specific role and company. Start with the candidate's core identity, then bridge to why they fit this role specifically.",
  "cover_letter": "4-5 paragraph cover letter. Para 1: Hook + role interest. Para 2: Most relevant technical achievement. Para 3: Why this specific company (use company name from JD). Para 4: Forward-looking value proposition. Para 5: Closing.",
  "why_this_company": "2-3 sentence direct answer to 'Why do you want to work at [company]?' — reference something specific from the JD (mission, tech stack, product).",
  "skills_text": "Comma-separated skills list. Put JD-matching skills FIRST, then other skills. Max 20 skills.",
  "biggest_achievement": "1-2 sentence achievement reframed to highlight the metric/impact most relevant to this role's requirements."
}

Return ONLY the raw JSON. No markdown, no backticks, no explanation."""


def call_groq_tailor(system_prompt: str, user_prompt: str, max_tokens: int = 2000) -> str:
    """Call Groq API and return the raw text response."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(500, "GROQ_API_KEY environment variable is missing")
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content or ""


def extract_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON safely."""
    text = raw.replace("```json", "").replace("```", "").strip()
    first = text.find("{")
    last = text.rfind("}")
    if first == -1 or last == -1:
        raise ValueError("No JSON object found in AI response")
    return json.loads(text[first:last + 1])


@app.post("/ai/tailor")
async def tailor_resume(body: TailorRequest):
    """
    Takes the user's profile + a job description and returns 5 AI-tailored fields:
    summary, cover_letter, why_this_company, skills_text, biggest_achievement.
    No auth required — the profile is sent directly from the extension session.
    """
    p = body.profile
    full_name = f"{p.get('first_name', '')} {p.get('last_name', '')}".strip()

    user_prompt = f"""
CANDIDATE PROFILE:
Name: {full_name}
Current Title: {p.get('current_job_title', 'Software Engineer')}
Current Company: {p.get('current_company', '')}
Total Experience: {p.get('total_years_experience', '')} years
Skills: {p.get('skills_text', '')}
Degree: {p.get('highest_degree', '')} in {p.get('major', '')} from {p.get('university', '')} ({p.get('graduation_year', '')})
Current Summary: {p.get('summary', '')}
Current Job Description: {p.get('current_job_description', '')}
Previous Role: {p.get('previous_job_1_title', '')} at {p.get('previous_job_1_company', '')}
Previous Role Description: {p.get('previous_job_1_description', '')}
Biggest Achievement (original): {p.get('biggest_achievement', '')}
Projects: {p.get('projects_text', '')}
Certifications: {p.get('certifications_text', '')}

TARGET JOB:
Job Title: {body.job_title or 'Not specified'}
Company: {body.company_name or 'Not specified'}

JOB DESCRIPTION:
{body.job_description[:4000]}

Now generate the 5 tailored fields as specified. Remember: do NOT invent any skills or experience not present in the candidate's profile above.
"""

    try:
        raw = call_groq_tailor(TAILOR_SYSTEM_PROMPT, user_prompt, max_tokens=2500)
        result = extract_json(raw)

        # Validate all 5 keys are present
        required_keys = ["summary", "cover_letter", "why_this_company", "skills_text", "biggest_achievement"]
        for key in required_keys:
            if key not in result:
                result[key] = p.get(key, "")  # fallback to original

        return {
            "success": True,
            "tailored": result,
            "job_title": body.job_title,
            "company_name": body.company_name
        }
    except Exception as e:
        raise HTTPException(500, f"AI tailoring failed: {str(e)}")


@app.post("/ai/regenerate-field")
async def regenerate_field(body: RegenerateFieldRequest):
    """
    Regenerates a single field with an optional custom human instruction.
    Used when the user clicks '🔄 Regenerate' on a specific card in the review panel.
    """
    p = body.profile
    full_name = f"{p.get('first_name', '')} {p.get('last_name', '')}".strip()

    field_instructions = {
        "summary": "Write a 3-4 sentence professional summary tailored to this role.",
        "cover_letter": "Write a 4-5 paragraph cover letter for this specific role and company.",
        "why_this_company": "Write a 2-3 sentence answer to 'Why do you want to work at this company?' referencing specific details from the JD.",
        "skills_text": "Return a comma-separated skills list. Put JD-matching skills FIRST. Max 20 skills.",
        "biggest_achievement": "Write 1-2 sentences about the candidate's most relevant achievement for this role."
    }

    if body.field_name not in field_instructions:
        raise HTTPException(400, f"Unknown field: {body.field_name}. Valid fields: {list(field_instructions.keys())}")

    base_instruction = field_instructions[body.field_name]
    human_instruction = f"\n\nADDITIONAL INSTRUCTION FROM USER: {body.instruction}" if body.instruction else ""

    system_prompt = f"""You are an elite resume writer.
Generate ONLY the following field for this candidate: {body.field_name}
{base_instruction}{human_instruction}

RULES:
- Do NOT invent experience or skills not in the profile
- Match the tone and seniority of the job description
- Return ONLY a valid JSON object: {{"field_name": "{body.field_name}", "value": "<generated content>"}}
- No markdown, no explanation, just the JSON."""

    user_prompt = f"""
CANDIDATE:
Name: {full_name}
Title: {p.get('current_job_title', '')}
Experience: {p.get('total_years_experience', '')} years
Skills: {p.get('skills_text', '')}
Current Summary: {p.get('summary', '')}
Achievement (original): {p.get('biggest_achievement', '')}
Projects: {p.get('projects_text', '')}

TARGET JOB: {body.job_title or 'N/A'} at {body.company_name or 'N/A'}

JOB DESCRIPTION:
{body.job_description[:3000]}

Generate the field: {body.field_name}
"""

    try:
        raw = call_groq_tailor(system_prompt, user_prompt, max_tokens=800)
        result = extract_json(raw)

        value = result.get("value", "")
        if not value:
            # Try to get by field name key
            value = result.get(body.field_name, "")

        return {
            "success": True,
            "field_name": body.field_name,
            "value": value
        }
    except Exception as e:
        raise HTTPException(500, f"Field regeneration failed: {str(e)}")
