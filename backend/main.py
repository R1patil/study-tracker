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
from datetime import date, datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Study Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "")],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
DATA_DIR = "user_data"
os.makedirs(DATA_DIR, exist_ok=True)


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


def save_user_data(user_id: str, data: dict):
    with open(user_file(user_id), "w") as f:
        json.dump(data, f, indent=2)


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
