import os
import traceback

# ==========================================
# 🛑 终极代理杀手 V2.0：寸草不生
# ==========================================
# 1. 遍历删除所有带 proxy 字眼的系统变量（防不胜防的各种大小写）
for key in list(os.environ.keys()):
    if 'proxy' in key.lower():
        del os.environ[key]

# 2. 强制注入白名单（必须要有小写，urllib3 就吃这一套）
os.environ["no_proxy"] = "127.0.0.1,localhost"
os.environ["NO_PROXY"] = "127.0.0.1,localhost"
# ==========================================



from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from openai import OpenAI
import json
import time
import asyncio
import sqlite3
from elasticsearch import Elasticsearch

# --- 配置区域 ---
API_KEY = os.getenv("DEEPSEEK_API_KEY")
DB_FILE = "chat_history.db"

app = FastAPI(title="农业病虫害问答系统 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=API_KEY, base_url="https://api.deepseek.com")
# 强制使用 127.0.0.1，防止 localhost 被映射到了其他地方
es = Elasticsearch("http://127.0.0.1:9200") 

# ==========================================
# 🧱 1. 数据库初始化 (SQLite)
# ==========================================
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS sessions (chat_id TEXT PRIMARY KEY, title TEXT, updated_at INTEGER)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, chat_id TEXT, role TEXT, type TEXT, content TEXT, timestamp INTEGER, FOREIGN KEY(chat_id) REFERENCES sessions(chat_id))''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS knowledge (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, category TEXT, created_at INTEGER)''')
    conn.commit()
    conn.close()

init_db()

def get_db_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# ==========================================
# 🚀 2. ES 启动同步模块
# ==========================================
def sync_db_to_es():
    try:
        if not es.indices.exists(index="agri_knowledge"):
            es.indices.create(index="agri_knowledge")
            print("🌟 创建 ElasticSearch 索引: agri_knowledge")
            
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge")
        rows = cursor.fetchall()
        conn.close()
        
        count = 0
        for row in rows:
            es.index(index="agri_knowledge", id=str(row["id"]), document={
                "title": row["title"],
                "content": row["content"],
                "category": row["category"]
            })
            count += 1
        print(f"✅ 成功同步 {count} 条知识到 ElasticSearch!")
    except Exception as e:
        print(f"⚠️ ElasticSearch 同步失败:\n{traceback.format_exc()}")

# 调用同步
sync_db_to_es()

# ==========================================
# 📥 3. 数据录入 API (双写)
# ==========================================
class KnowledgeCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "未分类"

@app.post("/api/knowledge")
async def add_knowledge(item: KnowledgeCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    current_time = int(time.time())
    
    cursor.execute('''INSERT INTO knowledge (title, content, category, created_at) VALUES (?, ?, ?, ?)''', 
                   (item.title, item.content, item.category, current_time))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    try:
        es.index(index="agri_knowledge", id=str(new_id), document={
            "title": item.title, "content": item.content, "category": item.category
        })
    except Exception as e:
        print(f"⚠️ ES 写入失败: {e}")
        
    return {"message": "知识录入成功", "id": new_id, "title": item.title}

# ==========================================
# 🔎 4. 前端全局搜索 API (消灭 404!)
# ==========================================
@app.get("/api/search")
async def search_knowledge(query: str = "", page: int = 1, pageSize: int = 10):
    print(f"🔎 前端调用搜索: 关键词='{query}', 页码={page}")
    try:
        if not query:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM knowledge ORDER BY created_at DESC LIMIT ? OFFSET ?", (pageSize, (page - 1) * pageSize))
            rows = cursor.fetchall()
            cursor.execute("SELECT COUNT(*) FROM knowledge")
            total = cursor.fetchone()[0]
            conn.close()
            items = [dict(row) for row in rows]
            return {"code": 200, "data": items, "list": items, "total": total}

        # 触发 ES 检索
        res = es.search(
            index="agri_knowledge",
            query={
                "multi_match": {
                    "query": query,
                    "fields": ["title^3", "content", "category"],
                    "fuzziness": "AUTO"
                }
            },
            from_=(page - 1) * pageSize,
            size=pageSize
        )
        
        items = []
        for hit in res['hits']['hits']:
            source = hit['_source']
            source['id'] = hit['_id']
            source['score'] = hit['_score']
            items.append(source)
            
        total = res['hits']['total']['value']
        print(f"✅ ES 搜索完毕，找到 {total} 条结果")
        
        return {"code": 200, "data": items, "list": items, "total": total, "page": page, "pageSize": pageSize}
    except Exception as e:
        print(f"❌ ES 搜索失败: {e}")
        return {"code": 500, "data": [], "list": [], "total": 0, "message": str(e)}

# ==========================================
# 🧠 5. RAG 知识检索 (配合对话模块)
# ==========================================
def retrieve_knowledge(query):
    if not query: return []
    try:
        res = es.search(
            index="agri_knowledge",
            query={"multi_match": {"query": query, "fields": ["title^3", "content"], "fuzziness": "AUTO"}},
            size=3
        )
        results = []
        for hit in res['hits']['hits']:
            print(f"🎯 对话命中知识: {hit['_source']['title']} (得分:{hit['_score']:.2f})")
            results.append(hit['_source']['content'])
        return results
    except Exception as e:
        print(f"❌ ES 检索失败: {e}")
        return []

# ==========================================
# 💬 6. 聊天对话模块 (保持不变)
# ==========================================
def format_sse(event_type: str, payload: dict):
    return f"event: {event_type}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"

@app.get("/api/chat/history")
async def get_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    sessions = [{"id": r["chat_id"], "title": r["title"], "timestamp": r["updated_at"]} for r in rows]
    if not sessions: return []
    return [{"dateLabel": "所有记录", "items": sessions}]

@app.get("/api/chat/{chat_id}/messages")
async def get_chat_messages(chat_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC", (chat_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r["id"], "role": r["role"], "type": r["type"], "content": r["content"], "timestamp": r["timestamp"]} for r in rows]

@app.post("/chat")
@app.post("/api/chat")
@app.post("/api/chat/message")
async def chat_endpoint(request: Request):
    data = {}
    try: data = await request.json()
    except: pass
    if not data:
        try: 
            form = await request.form()
            data = {k: v for k, v in form.items()}
        except: pass

    user_query = ""
    if data.get("prompt"): user_query = data["prompt"]
    elif "messages" in data and isinstance(data["messages"], list):
        user_query = data["messages"][-1].get('content', '')
    
    chat_id = data.get("chatId") or f"chat-{int(time.time())}"
    current_time = int(time.time())
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO sessions (chat_id, title, updated_at) VALUES (?, ?, ?) ON CONFLICT(chat_id) DO UPDATE SET updated_at = excluded.updated_at''', (chat_id, user_query[:10] if user_query else "新对话", current_time))
    
    if user_query:
        cursor.execute('''INSERT INTO messages (id, chat_id, role, type, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)''', (f"msg-{current_time}", chat_id, "user", "user", user_query, current_time))
    conn.commit()
    conn.close()

    context = "\n".join(retrieve_knowledge(user_query))

    async def generate_stream():
        full_response = ""
        try:
            yield format_sse("chat_id", {"chatId": chat_id})
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "你是一个农业病虫害专家。请根据提供的资料回答。如果资料不足，请根据你的专业知识补充。"},
                    {"role": "user", "content": f"资料：{context}\n问题：{user_query}"}
                ],
                stream=True
            )
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    yield format_sse("content_chunk", {"delta": content})
                    await asyncio.sleep(0.01)

            ai_time = int(time.time())
            db_conn = get_db_connection()
            db_cursor = db_conn.cursor()
            db_cursor.execute('''INSERT INTO messages (id, chat_id, role, type, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)''', (f"ai-{ai_time}", chat_id, "assistant", "ai", full_response, ai_time))
            db_conn.commit()
            db_conn.close()

            yield format_sse("final_message", {"content": full_response, "timestamp": int(time.time() * 1000), "attachments": [], "thinkingSteps": []})
        except Exception as e:
            yield format_sse("error", {"message": str(e)})

    return StreamingResponse(generate_stream(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)