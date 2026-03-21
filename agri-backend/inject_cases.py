from elasticsearch import Elasticsearch

es = Elasticsearch("http://127.0.0.1:9200")

cases = [
    {
        "title": "草地贪夜蛾",
        "category": "害虫",
        "content": "草地贪夜蛾是跨国界迁飞性害虫，具有极强的多食性。其寄主植物广泛，图谱关联显示其可危害包括玉米、水稻、高粱在内的350多种植物。在玉米收割后，该害虫极易向周边作物迁移，需建立全区域监控网。"
    },
    {
        "title": "稻瘟病",
        "category": "病害",
        "content": "稻瘟病俗称‘火烧瘟’，其爆发与气象条件高度相关。当环境处于连续阴雨、日平均气温在20-25℃时，病原菌孢子萌发率最高。防治应坚持‘预防为主’，在此气候窗口期应提前喷施三环唑或春雷霉素。"
    },
    {
        "title": "柑橘黄龙病",
        "category": "病害",
        "content": "柑橘黄龙病被称为‘柑橘癌症’，目前无药可治。该病唯一的自然传播媒介是柑橘木虱。图谱逻辑强调：防控黄龙病必须首先斩断传播链，即通过统防统治杀灭木虱，发现病株需立即砍除并进行无害化处理。"
    }
]

for case in cases:
    es.index(index="agri_knowledge", document=case)
    print(f"✅ 已成功录入案例知识: {case['title']}")