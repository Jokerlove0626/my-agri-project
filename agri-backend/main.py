import os
import traceback
from dotenv import load_dotenv # 👇 新增：引入读取包
import math
load_dotenv() # 👇 新增：强制加载当前目录的 .env 文件
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

from pydantic import BaseModel

from typing import List, Dict, Any

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
from neo4j import GraphDatabase

# ==========================================
# --- Neo4j 连接配置 (全库只需保留这一处) ---
# ==========================================
from neo4j import GraphDatabase

NEO4J_URI = "bolt://localhost:7687"
NEO4J_AUTH = ("neo4j", "test1234") # 👈 确保这里是你真实的密码

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)
    driver.verify_connectivity()
    print("✅ Neo4j 驱动全线打通")
except Exception as e:
    print(f"❌ Neo4j 连接失败: {e}")
    driver = None
# ==========================================


# --- 1. 定义数据结构 (这一步就是解决“未定义”报错的关键) ---
class HostEntry(BaseModel):
    id: str | int
    hostName: str | None = ""
    hostNameCn: str | None = ""
    hostTypes: str | None = ""
    interactionType: str | None = ""
    plantParts: str | None = ""
    infectionIntensity: str | None = ""

class KnowledgeEntry(BaseModel):
    title: str
    category: str
    content: str
    hosts: List[HostEntry] = []  # 这里嵌套了上面的 HostEntry 结构



# --- 配置区域 ---
API_KEY = os.getenv("DEEPSEEK_API_KEY")
DB_FILE = "chat_history.db"

# --- Neo4j 配置 ---
NEO4J_URI = "neo4j://localhost:7687"
NEO4J_AUTH = ("neo4j", "test1234") # 确保这是你刚才改的密码
graph_driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)

# 定义一个查询函数：根据关键词找关联知识
def get_graph_context(entity_name: str):
    if not entity_name: return ""
    with driver.session() as session:  # 统一使用驱动
        query = """
        MATCH (n)-[r]-(m)
        WHERE (n.title CONTAINS $name OR n.name CONTAINS $name)
        RETURN n.title, type(r), m.title, r.type
        LIMIT 5
        """
        result = session.run(query, name=entity_name)
        context = []
        for record in result:
            # 这里的逻辑更贴合农业百科的展示
            rel_desc = f"【{record[0]}】与【{record[2]}】存在 {record[3] or record[1]} 关系。"
            context.append(rel_desc)
        return "\n".join(context)

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
async def add_knowledge(entry: KnowledgeEntry):
    print(f"🚀 [收到录入请求] 标题: {entry.title}")
    try:
        # 1. 尝试连接 Neo4j 写入数据
        with graph_driver.session() as session:
            # 智能判断标签
            node_label = "昆虫" if any(x in entry.title for x in ["蛾", "虫", "天牛", "蜂"]) else "病害"
            print(f"  └─ 🏷️ 准备创建节点，标签定为: {node_label}")

            # 使用 MERGE 写入主节点
            query_pest = f"""
            MERGE (p:{node_label} {{name: $title}})
            SET p.category = $category, p.details = $content
            RETURN p
            """
            session.run(query_pest, title=entry.title, category=entry.category, content=entry.content)
            print(f"  └─ ✅ Neo4j 主节点写入成功: {entry.title}")

            # 2. 遍历处理寄主作物并连线
            print(f"  └─ 🌾 正在处理 {len(entry.hosts)} 个寄主作物...")
            for host in entry.hosts:
                # 兼容中文名或学名
                host_name = host.hostNameCn or host.hostName
                if host_name:
                    query_rel = f"""
                    MERGE (c:作物 {{name: $host_name}})
                    WITH c
                    MATCH (p:{node_label} {{name: $title}})
                    MERGE (p)-[r:危害 {{parts: $parts, intensity: $intensity}}]->(c)
                    RETURN r
                    """
                    session.run(query_rel, 
                                title=entry.title, 
                                host_name=host_name, 
                                parts=host.plantParts or "未知部位",
                                intensity=host.infectionIntensity or "未知程度")
                    print(f"  └─ 🔗 连线成功: {entry.title} -> {host_name}")

        return {"status": "success", "message": "全流程入库成功"}

    except Exception as e:
        print(f"❌ [严重错误] 入库失败: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
# ==========================================
# 🔎 4. 前端全局搜索 API (消灭 404!)
# ==========================================
import math

@app.get("/api/search")
async def search_knowledge(query: str = "", page: int = 1, pageSize: int = 10):
    # 打印一下，确保我们知道前端在搜什么
    print(f"🔍 前端正在搜索: '{query}', 页码: {page}")
    
    try:
        # 1. 构造查询 (注意索引名改成了 agri_knowledge)
        search_body = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["title", "content", "category"]
                }
            } if query else {"match_all": {}},
            "from": (page - 1) * pageSize,
            "size": pageSize
        }
        
        # 执行搜索
        res = es.search(index="agri_knowledge", body=search_body)
        total_hits = res['hits']['total']['value']
        
        # 2. 格式化数据：必须严格按照 SearchResultItemVO 定义
        records = []
        for hit in res['hits']['hits']:
            source = hit['_source']
            records.append({
                "id": hit['_id'],
                "type": "species", 
                "title": source.get("title", "未知标题"),
                "scientificName": "Spodoptera frugiperda" if "贪夜蛾" in source.get("title", "") else "",
                "classification": source.get("category", "农业病虫害"),
                "status": "已入库",
                "statusType": "confirmed",
                "description": source.get("content", "")[:120].replace('\n', ' ') + "...",
                "tags": [source.get("category", "农业")],
                "detailLink": f"/search/detail/{hit['_id']}",  # 👈 就是这里！补上这个逗号
                "author": "系统自动生成"
            })
            
        # 3. 构造分页响应：必须包含 records, total, page, totalPages
        response_data = {
            "records": records,  # 这是前端最看重的字段
            "total": total_hits,
            "page": page,
            "pageSize": pageSize,
            "totalPages": math.ceil(total_hits / pageSize) if total_hits > 0 else 0
        }
        
        print(f"✅ 成功返回 {len(records)} 条数据给前端")
        return response_data

    except Exception as e:
        print(f"❌ 后端搜索逻辑崩溃: {e}")
        return {
            "code": 200,
            "message": "success",
            "data": {
                "records": records,
                "total": total_hits,
                "page": page,
                "pageSize": pageSize,
                "totalPages": math.ceil(total_hits / pageSize) if total_hits > 0 else 0
            }
        }
    
# 详情页 #

@app.get("/api/search/species/{species_id}")
async def get_species_detail(species_id: str):
    print(f"🔍 正在调取档案，ID: {species_id}")
    try:
        # 💡 核心：必须去 agri_knowledge 索引里根据 ID 拿数据
        res = es.get(index="agri_knowledge", id=species_id)
        source = res['_source']
        
        # 构造前端详情页需要的复杂结构 (SpeciesDetailData)
        return {
            "id": species_id,
            "title": source.get("title", "未知物种"),
            "category": source.get("category", "农业"),
            "content": source.get("content", ""),
            # 以下为详情页特有的扩展字段，如果 ES 里没有，先给默认值
            "scientificName": "Spodoptera frugiperda" if "贪夜蛾" in source.get("title", "") else "N/A",
            "taxonomy": {
                "kingdom": "动物界",
                "phylum": "节肢动物门",
                "class": "昆虫纲",
                "order": "鳞翅目",
                "family": "夜蛾科"
            },
            "images": [], # 暂时留空
            "references": ["《中国农业害虫防治手册》"]
        }
    except Exception as e:
        print(f"❌ 获取详情失败: {e}")
        raise HTTPException(status_code=404, detail="档案库里没找到这个物种")

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
# ... 之前的导包和 get_graph_connection 函数保持不变 ...

async def chat_endpoint(request: Request):
    # --- 1. 获取数据和存库逻辑 (保持不变) ---
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

    # --- 2. 核心修改：双路检索 (ElasticSearch + Neo4j) ---
    
    # 原有的 ES 文本检索
    es_context = "\n".join(retrieve_knowledge(user_query))
    
    # 新增的 Neo4j 图谱逻辑检索 (取前 5 个字作为关键词，也可以用更复杂的提取逻辑)
    graph_context = get_graph_context(user_query[:5]) 
    
    # 组合成最终喂给 AI 的背景资料
    final_context = f"""
    【相关文档资料】：
    {es_context}
    
    【知识图谱逻辑关系】：
    {graph_context if graph_context else "未找到直接关联逻辑"}
    """

    # --- 3. 修改生成器逻辑 ---
    async def generate_stream():
        full_response = ""
        try:
            yield format_sse("chat_id", {"chatId": chat_id})
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一个农业病虫害专家。请结合【相关文档】和【知识图谱逻辑】回答问题。如果图谱中有因果传播关系，请务必详细告知用户。"
                    },
                    {
                        "role": "user", 
                        "content": f"已知背景：{final_context}\n\n当前问题：{user_query}"
                    }
                ],
                stream=True
            )
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    yield format_sse("content_chunk", {"delta": content})
                    await asyncio.sleep(0.01)

            # --- 后续存库逻辑保持不变 ---
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


@app.get("/api/graph/all")
@app.get("/api/graph/data")
# 💡 核心修复：同时接收 query, keyword, name，防止前端参数名不匹配
async def get_graph_data(query: str = None, keyword: str = None, name: str = None):
    # 只要这三个里面有一个有值，我们就把它作为真正的搜索词
    actual_query = query or keyword or name 
    
    print(f"🕸️ 收到图谱请求 | 关键词: {actual_query if actual_query else '随机模式'}")
    
    nodes = {}
    links = []
    
    try:
        with driver.session() as session:
            if actual_query:
                # 🚀 模式 1：全库精准搜索（不再受限于是否是精选数据）
                cypher_cmd = """
                MATCH (n)
                WHERE (n.title CONTAINS $key OR n.name CONTAINS $key OR n.details CONTAINS $key)
                WITH n LIMIT 30
                OPTIONAL MATCH (n)-[rel]-(m)
                RETURN 
                    elementId(n) as n_id, coalesce(n.title, n.name, '未知') as n_name, head(labels(n)) as n_lab,
                    elementId(m) as m_id, coalesce(m.title, m.name) as m_name, head(labels(m)) as m_lab,
                    type(rel) as r_type
                LIMIT 200
                """
                results = session.run(cypher_cmd, key=actual_query)
            else:
                # 🚀 模式 2：默认展示模式（只加载标记为 is_featured 的高质量数据）
                cypher_cmd = """
                MATCH (n {is_featured: true})  // 👈 核心优化：只抓取精选节点
                WITH n LIMIT 50
                OPTIONAL MATCH (n)-[rel]-(m)
                RETURN 
                    elementId(n) as n_id, coalesce(n.title, n.name, '未知') as n_name, head(labels(n)) as n_lab,
                    elementId(m) as m_id, coalesce(m.title, m.name) as m_name, head(labels(m)) as m_lab,
                    type(rel) as r_type
                LIMIT 300
                """
                results = session.run(cypher_cmd)
            
            # 开始处理查询结果
            for record in results:
                nid = record["n_id"]
                if nid and nid not in nodes:
                    nodes[nid] = {
                        "id": nid, 
                        "name": record["n_name"], 
                        "label": record["n_name"], 
                        "category": record["n_lab"] or "Entity"
                    }
                
                mid = record["m_id"]
                if mid:
                    if mid not in nodes:
                        nodes[mid] = {
                            "id": mid, 
                            "name": record["m_name"] or "关联点", 
                            "label": record["m_name"] or "关联点", 
                            "category": record["m_lab"] or "Entity"
                        }
                    links.append({
                        "source": nid,
                        "target": mid,
                        "value": record["r_type"] or "关联"
                    })
            
            print(f"✅ 成功提取：{len(nodes)} 节点, {len(links)} 连线")
            
            return {
                "code": 0, 
                "message": "success", 
                "data": {
                    "nodes": list(nodes.values()), 
                    "links": links
                }
            }

    except Exception as e:
        import traceback
        print(f"❌ 图谱 API 运行报错: {e}")
        traceback.print_exc()
        # 报错时也要返回前端认识的结构
        return {
            "code": 500,
            "message": str(e),
            "data": {"nodes": [], "links": []}
        }
# agri-backend/main.py

@app.get("/api/analysis/dashboard")
async def get_dashboard_data():
    print("📊 正在抓取仪表盘实时统计数据...")
    
    # 💡 核心修复：先给所有变量赋初始值（保底），防止 NameError
    hudong_count = 0
    new_node_count = 0
    total_nodes = 0
    rel_count = 0
    top_hubs = {"names": [], "counts": []} 
    
    try:
        with driver.session() as session:
            # 1. 统计各类标签的数量
            stats_query = "MATCH (n) RETURN labels(n)[0] as label, count(n) as count"
            stats_res = session.run(stats_query)
            labels_dist = {record["label"]: record["count"] for record in stats_res if record["label"]}
            
            total_nodes = sum(labels_dist.values())
            hudong_count = labels_dist.get("HudongItem", 0)
            new_node_count = labels_dist.get("NewNode", 0)

            # 2. 统计总关系数
            rel_count = session.run("MATCH ()-[r]->() RETURN count(r) as count").single()['count']
            
            # 3. 统计“超级节点” (使用 5.x 兼容的 COUNT {} 语法)
            hub_query = """
            MATCH (n:HudongItem)
            RETURN n.title as name, COUNT { (n)--() } as count
            ORDER BY count DESC LIMIT 5
            """
            hub_results = session.run(hub_query)
            
            # 💡 确保这里正确提取数据
            for record in hub_results:
                if record["name"]:
                    top_hubs["names"].append(record["name"])
                    top_hubs["counts"].append(record["count"])

        # 构造返回给前端的最终 JSON
        dashboard_payload = {
            "metrics": [
                {"id": "m1", "title": "百科词条", "value": hudong_count, "unit": "条", "icon": "book", "trend": 10},
                {"id": "m2", "title": "知识关联", "value": rel_count, "unit": "组", "icon": "share-alt", "trend": 25},
                {"id": "m3", "title": "新增实体", "value": new_node_count, "unit": "个", "icon": "plus-circle", "trend": 5},
                {"id": "m4", "title": "图谱规模", "value": total_nodes, "unit": "点", "icon": "nodes", "trend": 8}
            ],
            "speciesTaxonomy": [
                {"name": "农业百科", "value": hudong_count},
                {"name": "录入数据", "value": new_node_count},
                {"name": "其他", "value": total_nodes - hudong_count - new_node_count}
            ],
            "geoDistribution": [
                {"name": "山东", "value": 85}, {"name": "云南", "value": 90}, 
                {"name": "河南", "value": 72}, {"name": "江苏", "value": 64}
            ],
            "topHosts": top_hubs,  # 👈 这里的 top_hubs 已经确保定义过了
            "speciesGrowth": {
                "dates": ["03-15", "03-16", "03-17", "03-18"], 
                "counts": [0, 50, 500, total_nodes]
            },
            "speciesStatus": [{"name": "已审核", "value": total_nodes}],
            "referenceGrowth": {"dates": ["03-18"], "counts": [rel_count]},
            "referenceTypes": [{"name": "属性关联", "value": rel_count}],
            "fileTypes": [{"name": "CSV导入", "value": 100}]
        }

        print(f"✅ 统计成功: {total_nodes} 节点, {rel_count} 关系")
        return {"code": 0, "message": "success", "data": dashboard_payload}

    except Exception as e:
        import traceback
        print(f"❌ 仪表盘后端报错:\n{traceback.format_exc()}")
        return {"code": 500, "message": str(e), "data": None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)