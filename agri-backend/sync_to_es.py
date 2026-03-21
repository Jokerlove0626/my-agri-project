import time
from neo4j import GraphDatabase
from elasticsearch import Elasticsearch, helpers

# 1. 基础配置
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "test1234"  # 记得改这里！

ES_URL = "http://localhost:9200"
INDEX_NAME = "agri_knowledge"

# 2. 初始化连接
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
es = Elasticsearch(ES_URL)

def fetch_and_sync():
    print("🚀 启动全量数据搬运流水线...")
    start_time = time.time()

    with driver.session() as session:
        # 从 Neo4j 提取所有百科条目
        # 我们只取有内容的条目，并限制数量（可选）
        result = session.run("MATCH (n:HudongItem) RETURN n.title as title, n.detail as detail")
        
        actions = []
        count = 0
        
        for record in result:
            # 构造 ES 批量操作格式
            action = {
                "_index": INDEX_NAME,
                "_source": {
                    "title": record["title"],
                    "content": record["detail"],
                    "category": "encyclopedia",
                    "timestamp": time.time()
                }
            }
            actions.append(action)
            count += 1

            # 每 2000 条执行一次批量写入
            if len(actions) >= 2000:
                helpers.bulk(es, actions)
                actions = []
                print(f"📦 已搬运 {count} 条数据...")

        # 处理剩余的尾数
        if actions:
            helpers.bulk(es, actions)

    end_time = time.time()
    print(f"✨ 搬运完成！总计: {count} 条 | 耗时: {round(end_time - start_time, 2)} 秒")

if __name__ == "__main__":
    try:
        fetch_and_sync()
    except Exception as e:
        print(f"❌ 搬运中断: {e}")
    finally:
        driver.close()