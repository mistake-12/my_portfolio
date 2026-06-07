# 小鸟 RAG 知识库问答（方案 B：全栈 RAG）

## 目标
HR/访客点击 Stage4 小鸟 → 弹出输入框 → 输入问题 → 向量检索个人资料库 → LLM 合成回答 → 气泡流式显示回复。

## 技术方案
**方案 B：全栈 RAG — 向量数据库 + Next.js API Route + LLM**

### 架构
```
用户输入 → Next.js API Route
           ├── Embedding（OpenAI text-embedding-3-small）
           ├── 向量检索（Supabase pgvector / Pinecone）
           ├── 上下文拼接 + System Prompt
           └── LLM 流式输出（gpt-4o-mini / DeepSeek / Claude）
                    ↓
              小鸟气泡 SSE 流式显示
```

### 技术选型

| 层 | 候选 | 推荐 |
|---|------|------|
| Embedding | OpenAI / Cohere / all-MiniLM | OpenAI text-embedding-3-small（便宜） |
| 向量库 | Pinecone / Supabase pgvector / Qdrant | Supabase pgvector（已有 Supabase 经验） |
| LLM | GPT-4o-mini / DeepSeek / Claude | GPT-4o-mini（性价比最高） |
| 框架 | LangChain / 纯代码 | 纯代码（轻量，可控） |

### 为什么选 Supabase pgvector
- 你的 WooJob 项目已用 Supabase，有经验
- pgvector 与 PostgreSQL 原生集成，无需额外服务
- 免费额度够用

## 资料准备
- 简历信息（教育、技能、经历）
- 项目详情（PolarArk、无忧萌环、Reso-Mate、JAKA、WooJob、多模态数据监视平台）
- 个人介绍与设计理念
- 联系方式

## 交互设计
- 右键小鸟 → 弹出对话面板（保留单击随机语录）
- 输入问题 → loading 动画（小鸟思考）
- 流式输出回答（SSE typewriter 效果）
- 支持多轮追问，保持对话上下文

## 决策记录

### 回答人格
第一人称，以马子航本人身份回答。不说"我是AI助手"，直接说"我的工业设计功底……"

### 回答模式
混合模式：
- 资料库内问题 → 严格检索 RAG
- 高频预设问题 → 你写死回答（薪资、入职时间、联系方式等）
- 超出范围 → 统一兜底："这个问题你可以联系我本人了解"
- system prompt 硬指令：绝对不要编造资料中没有的信息

### LLM
DeepSeek V4 Flash

## 待确认
- [x] 回答人格
- [x] 回答模式 → 混合模式
- [x] LLM 选型 → DeepSeek V4 Flash
- [x] 对话历史保留 → 7 轮，超出后滑动窗口自动丢弃最早记录
- [x] 引用来源 → 不展示

## 参考
- dev.to: "Stop Sending Static Resumes" — Next.js + RAG
- github.com/labwhatever/surajgpt — FastAPI + FAISS 个人助手
- github.com/mcpugmire1/llm_portfolio_assistant — MattGPT 角色感知
