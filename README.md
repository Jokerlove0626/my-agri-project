# 🌾 智慧农业病虫害问答系统 (Agri-Intelligence System)

本项目是一个集“数据爬取、知识存储、智能检索、问答输出”为一体的农业病虫害系统。



## 📂 项目模块说明

| 文件夹 | 角色 | 技术栈 |
| :--- | :--- | :--- |
| **`agri-backend`** | 核心大脑 | FastAPI + ElasticSearch + RAG |
| **`deep-agriculture-web`** | 用户界面 | Next.js + Tailwind CSS |
| **`agri-crawler`** | 数据来源 | Python Spider |

---

## 🛠️ 快速启动指南

### 1. 启动搜索引擎 (ElasticSearch)
系统依赖 ElasticSearch 8.12.0。
- 确保 ES 运行在 `http://localhost:9200`
- 需关闭 SSL 验证（仅限开发环境）。

### 2. 后端部署 (agri-backend)
```bash
cd agri-backend
python3 -m venv .venv
source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
pip install -r requirements.txt
# 在 .env 中配置 DEEPSEEK_API_KEY
python3 main.py
3. 前端部署 (deep-agriculture-web)
Bash
cd deep-agriculture-web
npm install
npm run dev
访问地址：http://localhost:3000

4. 数据更新 (agri-crawler)
如果需要补充新数据，请运行：

Bash
cd agri-crawler
# 运行对应的爬虫脚本
🛰️ 协作规范
环境变量：请勿上传任何 .env 文件。

分支管理：建议使用 feature/功能名 分支开发，通过 PR 合并到 main。


---

### 第三步：生成依赖清单

为了让队友一行命令装好环境，你需要为两个 Python 文件夹生成 `requirements.txt`。

在 `agri-backend` 下运行：
```bash
cd ~/my-agri-project/agri-backend
./.venv/bin/pip freeze > requirements.txt