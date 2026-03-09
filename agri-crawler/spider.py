import requests
from bs4 import BeautifulSoup
import json
import time
import os

def crawl_agri_data():
    # --- 配置区域 ---
    # 目标：直接把数据写进隔壁的后端文件夹里
    OUTPUT_PATH = "../agri-backend/agri_training_data.jsonl"
    
    BASE_URL = "https://www.agri.cn/sc/zxjc/zwbch/"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    results = []
    MAX_PAGES = 3  # 这里可以改大，比如 5 或 10
    
    print(f"🚀 [DeepAgriculture Crawler] 启动！")
    print(f"📂 目标存储路径: {os.path.abspath(OUTPUT_PATH)}")

    for page_idx in range(MAX_PAGES):
        # 构造翻页 URL
        url = f"{BASE_URL}index.htm" if page_idx == 0 else f"{BASE_URL}index_{page_idx}.htm"
        print(f"\n--- 正在扫描第 {page_idx + 1} 页: {url} ---")
        
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            resp.encoding = 'utf-8'
            
            if resp.status_code != 200:
                print(f"⚠️ 跳过: 状态码 {resp.status_code}")
                continue

            soup = BeautifulSoup(resp.text, 'html.parser')
            items = soup.select('li.nxw_list_li')
            
            if not items:
                print("⚠️ 本页未发现文章列表")
                continue

            for item in items:
                # 提取标题和链接
                title_tag = item.select_one('.con_tit a')
                if not title_tag: continue
                
                title = title_tag.get_text(strip=True)
                full_link = BASE_URL + title_tag['href'].strip('./')
                
                # 提取摘要
                summary_tag = item.select_one('.con_text.zwnr')
                summary = summary_tag.get_text(strip=True) if summary_tag else ""
                
                print(f"  -> 正在抓取: {title[:20]}...")
                
                # 进入详情页
                try:
                    detail_resp = requests.get(full_link, headers=HEADERS, timeout=5)
                    detail_resp.encoding = 'utf-8'
                    detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')
                    
                    # 提取正文
                    content_box = (detail_soup.select_one('.content_main') or 
                                   detail_soup.select_one('.TRS_Editor') or
                                   detail_soup.select_one('#content'))
                    
                    if content_box:
                        # 清洗数据：移除脚本和样式
                        for s in content_box(['script', 'style']):
                            s.decompose()
                        content = content_box.get_text(separator='\n', strip=True)
                    else:
                        content = summary # 降级策略
                    
                    results.append({
                        "title": title,
                        "url": full_link,
                        "content": content,
                        "summary": summary
                    })
                    
                except Exception as e:
                    print(f"     ❌ 抓取失败: {e}")
                
                time.sleep(0.5) # 稍微慢点，防止被封

        except Exception as e:
            print(f"❌ 页面错误: {e}")

    # --- 关键步骤：写入后端目录 ---
    # 确保目标目录存在
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for entry in results:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            
    print(f"\n✅ 任务完成！已将 {len(results)} 条权威数据注入后端系统。")

if __name__ == "__main__":
    crawl_agri_data()