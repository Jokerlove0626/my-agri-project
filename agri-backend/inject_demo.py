import requests
import time

# 你的后端 API 地址
API_URL = "http://localhost:8000/api/knowledge"

# 专门为答辩定制的 10 条高质量关联数据
demo_data = [
    {
        "title": "草地贪夜蛾",
        "category": "农业虫害",
        "content": "草地贪夜蛾是一种跨国界迁飞性重大农业害虫，具有繁殖能力强、迁飞距离远、暴食危害重等特点。幼虫取食叶片可造成落叶，其老熟幼虫可蛀食果实。主要危害玉米、水稻、高粱、甘蔗等作物。",
        "hosts": [
            {"id": "h1", "hostNameCn": "玉米", "plantParts": "叶片、果穗", "infectionIntensity": "严重暴发"},
            {"id": "h2", "hostNameCn": "水稻", "plantParts": "茎叶", "infectionIntensity": "中度迁移危害"}
        ]
    },
    {
        "title": "稻瘟病",
        "category": "农业病害",
        "content": "稻瘟病是水稻重要病害之一，可引起大幅度减产，严重时减产40%～50%，甚至颗粒无收。主要分为苗瘟、叶瘟、节瘟、穗颈瘟、谷粒瘟。在连续阴雨、湿度大、光照不足的环境下极易诱发。",
        "hosts": [
            {"id": "h3", "hostNameCn": "水稻", "plantParts": "穗颈、叶片", "infectionIntensity": "毁灭性"}
        ]
    },
    {
        "title": "玉米螟",
        "category": "农业虫害",
        "content": "玉米螟俗称钻心虫，是玉米的主要害虫。幼虫孵化后先群集于玉米心叶，蛀食叶片，抽出后呈现一排排横孔。之后蛀入茎秆，导致玉米受风易折断，严重影响产量。",
        "hosts": [
            {"id": "h4", "hostNameCn": "玉米", "plantParts": "心叶、茎秆", "infectionIntensity": "重度蛀食"},
            {"id": "h5", "hostNameCn": "高粱", "plantParts": "茎秆", "infectionIntensity": "中度危害"}
        ]
    },
    {
        "title": "小麦条锈病",
        "category": "农业病害",
        "content": "小麦条锈病是气流传播的流行性重大病害。主要发生在叶片上，其次是叶鞘和茎秆。病部产生黄色至鲜黄色粉疱，排列成条状。被称作小麦的“癌症”。",
        "hosts": [
            {"id": "h6", "hostNameCn": "小麦", "plantParts": "叶片、叶鞘", "infectionIntensity": "重度气流传播"}
        ]
    },
    {
        "title": "稻飞虱",
        "category": "农业虫害",
        "content": "稻飞虱主要栖息在水稻基部，吸取汁液，使水稻植株变黄，影响抽穗，严重时导致稻株干枯倒伏，俗称“冒穿”。同时它还是传播多种水稻病毒病的媒介。",
        "hosts": [
            {"id": "h7", "hostNameCn": "水稻", "plantParts": "植株基部", "infectionIntensity": "群集吸汁危害"}
        ]
    },
    {
        "title": "柑橘黄龙病",
        "category": "农业病害",
        "content": "柑橘黄龙病是柑橘类植物的毁灭性病害，一旦感染无法治愈，被称为柑橘的“绝症”。病树初期表现为斑驳黄化，果实畸形，最终整株枯死。",
        "hosts": [
            {"id": "h8", "hostNameCn": "柑橘", "plantParts": "全株、果实", "infectionIntensity": "毁灭性系统病害"}
        ]
    },
    {
        "title": "柑橘木虱",
        "category": "农业虫害",
        "content": "柑橘木虱不仅通过吸食柑橘嫩梢汁液造成危害，更严重的是，它是传播柑橘黄龙病的唯一自然媒介昆虫。防治木虱是防控黄龙病的核心关键。",
        "hosts": [
            {"id": "h9", "hostNameCn": "柑橘", "plantParts": "嫩梢、嫩叶", "infectionIntensity": "传病媒介"}
        ]
    },
    {
        "title": "麦蚜",
        "category": "农业虫害",
        "content": "麦蚜是小麦主要害虫之一，不仅直接吸食小麦汁液导致减产，还能传播小麦黄矮病等病毒病。春季气温回升后繁殖极快。",
        "hosts": [
            {"id": "h10", "hostNameCn": "小麦", "plantParts": "叶片、麦穗", "infectionIntensity": "重度吸食及传病"}
        ]
    },
    {
        "title": "纹枯病",
        "category": "农业病害",
        "content": "纹枯病是一种典型的土传病害，主要危害水稻和小麦。高温高湿条件下极易爆发，在植株基部形成云纹状病斑，导致植株倒伏或枯死。",
        "hosts": [
            {"id": "h11", "hostNameCn": "水稻", "plantParts": "叶鞘、茎秆", "infectionIntensity": "中重度腐烂倒伏"},
            {"id": "h12", "hostNameCn": "小麦", "plantParts": "茎基部", "infectionIntensity": "中度危害"}
        ]
    },
    {
        "title": "赤眼蜂",
        "category": "农业益虫",
        "content": "赤眼蜂是一种微小的卵寄生蜂，是农业上应用最广泛的生物防治天敌。它能将卵产在玉米螟、草地贪夜蛾等害虫的卵内，从而消灭害虫。",
        "hosts": [
            {"id": "h13", "hostNameCn": "玉米螟", "plantParts": "虫卵", "infectionIntensity": "寄生消灭"},
            {"id": "h14", "hostNameCn": "草地贪夜蛾", "plantParts": "虫卵", "infectionIntensity": "寄生消灭"}
        ]
    }
]

print("🚀 开始向数据库注入高质量答辩演示数据...")

success_count = 0
for i, item in enumerate(demo_data):
    try:
        response = requests.post(API_URL, json=item)
        if response.status_code == 200:
            print(f"✅ [{i+1}/10] 成功注入: {item['title']} (并建立图谱连线)")
            success_count += 1
        else:
            print(f"❌ [{i+1}/10] 注入失败: {item['title']}, 状态码: {response.status_code}")
    except Exception as e:
        print(f"⚠️ 网络请求错误: {e}")
    time.sleep(0.5) # 稍微停顿一下，防止并发过高

print(f"\n🎉 注入完成！共成功录入 {success_count} 条核心知识。")
print("👉 现在去前台大屏搜索框输入：'玉米' 或者 '水稻'，看看绝美的图谱吧！")