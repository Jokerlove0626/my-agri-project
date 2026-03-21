import json
from elasticsearch import Elasticsearch
from neo4j import GraphDatabase

# 1. 初始化连接
es = Elasticsearch("http://localhost:9200")
neo4j_driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "test1234"))

def sync_jsonl_to_db(file_path):
    print(f"🔄 开始同步数据: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        count = 0
        for line in f:
            item = json.loads(line)
            title = item['title']
            content = item['content']
            
            # --- A. 注入 Elasticsearch (驱动搜索页和详情页) ---
            es.index(index="agri_knowledge", document={
                "title": title,
                "content": content,
                "summary": item.get('summary', ''),
                "url": item.get('url', ''),
                "status": "confirmed" # 标记为权威来源
            })

            # --- B. 注入 Neo4j (驱动知识图谱和大屏) ---
            # 这里我们做一个简单的实体提取逻辑：
            # 如果标题里含有“防治”，我们尝试把前几个字当作害虫名
            pest_name = title.split('的')[0] if '的' in title else title[:5]
            
            with neo4j_driver.session() as session:
                session.run("""
                    MERGE (p:Pest {name: $name})
                    SET p.source = '中国农村农业信息网'
                """, name=pest_name)
            
            count += 1
            if count % 10 == 0:
                print(f"已处理 {count} 条...")

    print(f"✅ 同步完成！共处理 {count} 条数据。")

if __name__ == "__main__":
    sync_jsonl_to_db("agri_training_data.jsonl")