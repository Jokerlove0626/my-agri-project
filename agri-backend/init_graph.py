from neo4j import GraphDatabase

# 1. 配置连接信息 (如果你刚才设置的密码不是 test1234，请记得替换！)
URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "test1234") 

def build_agri_graph():
    try:
        # 建立连接
        driver = GraphDatabase.driver(URI, auth=AUTH)
        driver.verify_connectivity()
        print("✅ 成功连接到 Neo4j 数据库！")

        with driver.session() as session:
            # 清空旧数据（方便咱们反复测试不报错）
            session.run("MATCH (n) DETACH DELETE n")
            
            # 核心：使用 Cypher 查询语言创建图谱
            query = """
            // 1. 创建三个实体节点 (Nodes)
            CREATE (bug:昆虫 {name: '松墨天牛', trait: '黑褐色，有长须'})
            CREATE (disease:病害 {name: '松材线虫病', symptom: '松针发黄，全株枯死'})
            CREATE (tree:作物 {name: '马尾松', value: '经济林木'})
            
            // 2. 将它们用关系连起来 (Relationships)
            CREATE (bug)-[:传播 {method: '咬食树皮'}]->(disease)
            CREATE (disease)-[:感染 {result: '致死'}]->(tree)
            """
            session.run(query)
            print("✅ 知识图谱已生成：松墨天牛 -> 传播 -> 松材线虫病 -> 感染 -> 马尾松")
            
        driver.close()
    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == "__main__":
    build_agri_graph()