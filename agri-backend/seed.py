from elasticsearch import Elasticsearch
import sqlite3
import time

# 确保连接地址正确
es = Elasticsearch("http://127.0.0.1:9200")
DB_FILE = "chat_history.db"

# 准备 5 条测试数据
test_data = [
    ("松材线虫病", "林业病害", "松树的毁灭性病害，由松墨天牛传播，会导致松树快速枯死。"),
    ("小麦赤霉病", "农作物病害", "主要危害穗部，导致产量下降。防治需在扬花期喷洒多菌灵。"),
    ("玉米大斑病", "农作物病害", "叶片出现长菱形大斑，影响光合作用。建议选用抗病品种。"),
    ("柑橘黄龙病", "果树病害", "由木虱传播的毁灭性细菌病害，患病后果实变小变酸，转色不匀。"),
    ("水稻纵卷叶螟", "农作物虫害", "幼虫吐丝将叶片纵卷成筒，躲在其中取食叶肉，留下白色条斑。")
]

def seed():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    for title, cat, content in test_data:
        # 1. 存入 SQLite
        current_time = int(time.time())
        cursor.execute("INSERT INTO knowledge (title, category, content, created_at) VALUES (?,?,?,?)",
                       (title, cat, content, current_time))
        new_id = cursor.lastrowid
        
        # 2. 存入 ElasticSearch
        es.index(index="agri_knowledge", id=str(new_id), document={
            "title": title, "category": cat, "content": content
        })
        print(f"已录入: {title}")
    
    conn.commit()
    conn.close()
    print("✨ 测试数据灌溉完成！")

if __name__ == "__main__":
    seed()