# RAG 知识库问答 —— 搭建与运维指南

本文档介绍个人网站 Stage4 小鸟 RAG 知识库问答系统的搭建、索引构建、资料更新、架构流程、常见问题及边界情况处理。

---

## 环境变量配置

在项目根目录 `.env.local` 中配置以下环境变量：

```bash
# --- Embedding ---
# OpenAI Embedding API（生成查询向量、构建索引时使用）
EMBEDDING_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# 可选：自定义 OpenAI-compatible API Base（使用第三方代理时设置）
# EMBEDDING_API_BASE=https://api.your-proxy.com/v1
# 可选：模型名称，默认 text-embedding-3-small
# EMBEDDING_MODEL=text-embedding-3-small

# --- LLM（流式回答） ---
# DeepSeek V4 Flash
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# DeepSeek API Base URL
LLM_API_BASE=https://api.deepseek.com
# 模型名称
LLM_MODEL=deepseek-v4-flash
# 可选：max_tokens 上限，默认 512
# LLM_MAX_TOKENS=512
```

> **注意**：`.env.local` 已加入 `.gitignore`，不会提交到仓库。请勿将 API Key 写入 `.env` 或其他公开文件。

---

## 安装依赖

项目已内置 RAG 相关依赖，安装项目依赖即可：

```bash
npm install
```

无需额外安装向量数据库依赖（当前方案使用本地 `index.json` + 内存余弦相似度检索，零额外依赖）。

---

## 构建索引

### 1. 准备资料

将你的个人资料写入 `src/data/rag/*.md` 文件。支持多个 `.md` 文件，例如：

```
src/data/rag/
  ├── resume.md          # 教育、技能、经历
  ├── projects.md        # 项目详情
  ├── introduction.md    # 个人介绍与设计理念
  └── contact.md         # 联系方式
```

每个文件将按段落切分（每段最多 500 字），对每段调用 Embedding API 生成向量，存入 `index.json`。

### 2. 运行索引构建

```bash
npm run rag:index
```

构建过程中控制台会输出进度：

```
[RAG Index] resume.md: 5 chunks
[RAG Index] projects.md: 8 chunks
[RAG Index] introduction.md: 3 chunks
[RAG Index] Total: 16 chunks, embedding...
[RAG Index] 1/16 done
[RAG Index] 2/16 done
...
[RAG Index] Saved to src/data/rag/index.json
```

构建完成后，`src/data/rag/index.json` 会包含所有 chunk 及其 embedding 向量。该文件约几 MB 到十几 MB，与资料量成正比。

---

## 如何更新资料

资料更新流程：

1. **编辑 Markdown 源文件**：修改 `src/data/rag/*.md` 中的内容（增删改均可）
2. **重新构建索引**：运行 `npm run rag:index`，覆盖旧的 `index.json`
3. **重启开发服务器**：`npm run dev`（如正在运行，Next.js 热更新会自动加载新索引，但重启更保险）

> **提示**：如果你的资料经常变动，可以在 npm scripts 中加一个 `npm run rag:update` 一键完成重建和重启。亦可考虑在 `package.json` 的 `dev` script 中前置 `npm run rag:index`，每次启动自动重建索引。

---

## 架构流程图

```
用户输入问题
     │
     ▼
┌─────────────────────────────┐
│  Next.js API Route          │
│  POST /api/rag/chat         │
│                             │
│  1. 高频预设匹配 ── 命中 ──► 直接返回写死回答（SSE 打字机流）
│     │
│     │ 未命中
│     ▼
│  2. 向量检索                │
│     ├── 调用 Embedding API  │
│     │   获取 query embedding │
│     ├── 加载 index.json     │
│     ├── 余弦相似度 top-K    │
│     └── 相似度阈值过滤      │
│          (MIN_SIMILARITY=0.3)│
│     │                       │
│     ├── 有相关结果 ────────► │
│     │                       │
│     └── 无相关结果 ──► 兜底回复（SSE 打字机流）
│                           │
│  3. 构建 System Prompt    │
│     (拼接检索上下文)       │
│                           │
│  4. 调用 LLM 流式输出      │
│     (DeepSeek V4 Flash)   │
│                           │
│  5. SSE 流式返回前端       │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  RagChat 组件                │
│  ├── 接收 SSE 事件          │
│  ├── 逐字符打字机渲染       │
│  └── 小鸟气泡显示           │
└─────────────────────────────┘
```

### 对话历史

- 保留最近 **7 轮**对话
- 超出 7 轮后滑动窗口自动丢弃最早记录
- 历史仅在 LLM 调用时传递，不影响向量检索和 FAQ 匹配

---

## 常见问题

### Q: 如何验证 RAG 是否正常工作？

```bash
npm run dev
```
1. 滚动到页面 Stage4 区域
2. 右键点击小鸟
3. 在弹出的对话面板中输入一个与个人资料相关的问题（如"你的教育背景是什么"）
4. 观察是否有流式打字机回复

### Q: 索引构建失败？

常见原因：
- **API Key 未配置或无效**：检查 `.env.local` 中的 `EMBEDDING_API_KEY` 是否正确
- **网络问题**：确认可以访问 OpenAI API（或自定义代理），审查防火墙/代理设置
- **资料文件编码问题**：确保 `src/data/rag/*.md` 使用 UTF-8 编码
- **资料内容过短**：`chunkText()` 会跳过少于 20 字的段落，确保资料有足够文本量

### Q: 检索结果质量差？

- 检查 `index.json` 是否是最新的（重新运行 `npm run rag:index`）
- 确保资料内容与预期问题相关
- 调整 `MIN_SIMILARITY` 阈值（当前 0.3）：
  - 降低（如 0.2）：更多结果通过，但可能包含不相关噪音
  - 提高（如 0.5）：结果更精准，但可能筛选掉边缘相关内容

### Q: LLM 返回了资料中不存在的信息？

System Prompt 中包含硬指令"只回答资料中有的内容，绝对不要编造"。如果仍然出现编造：
- 检查检索上下文中是否意外包含了不相关信息
- 调高 `MIN_SIMILARITY` 阈值以减少噪音
- 在 System Prompt 中强化指令

### Q: Embedding 调用太贵？

`text-embedding-3-small` 的价格为 $0.02 / 1M tokens，非常便宜。一次构建上百个 chunk 通常仅花费几分钱。

---

## 边界情况说明

### HR 问文档外的问题

当用户提问超出资料范围的问题时，系统的处理链路：

1. **高频预设匹配**：首先检查 FAQ_ANSWERS 字典（薪资、入职时间、联系方式等）
2. **向量检索**：对问题生成 embedding，在索引中检索 top-5 最相似 chunk
3. **相似度阈值过滤**：`MIN_SIMILARITY = 0.3`，低于此值的检索结果被丢弃
4. **兜底回复**：`context === "NO_RELEVANT_INFO"` 时，跳过 LLM 调用，直接返回 `"这个问题你可以联系我本人了解"`（SSE 打字机流形式返回）

**总结**：文档外的问题不消耗 LLM token，也不会有编造风险。用户直接收到友好的兜底回复，提示其联系本人。

### 空索引场景

如果尚未运行 `npm run rag:index`，`index.json` 不存在。此时：
- `loadIndex()` 返回空数组 `[]`
- `context` 被设为 `"NO_RELEVANT_INFO"`
- 所有问题（除 FAQ 命中外）都走兜底回复

### FAQ 短路机制

FAQ 匹配在 RAG 检索之前执行，匹配规则是 `question.includes(keyword)`。FAQ 命中后直接返回预设回答，不走 Embedding API 也不走 LLM，响应速度极快（约 1-2 秒完成打字机输出）。

### 对话上下文打断

FAQ 命中或兜底回复触发的 `streamText()` 不经过 LLM，因此不计入对话历史。当用户的下一轮问题需要 LLM 时，之前的 FAQ/兜底回复不会出现在历史中。

---

## Supabase 向量数据库（可选升级）

当前实现使用本地 `index.json`（内存余弦相似度），适合 <50 个文档的场景。

当资料量增大到百级别（或需要多环境共享索引、7x24 在线服务）时，可迁移到 Supabase pgvector。

### 1. 开启 pgvector 扩展

```sql
create extension if not exists vector;
```

### 2. 创建 chunks 表

```sql
create table rag_chunks (
  id bigserial primary key,
  content text not null,
  embedding vector(2048),  -- text-embedding-3-small = 1536 维（实际为 1536，2048 为预留）
  source_file text not null,
  created_at timestamptz default now()
);
```

### 3. 创建向量索引（加速检索）

```sql
create index on rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 50);
```

### 4. 相似度检索函数

```sql
create or replace function match_rag_chunks(
  query_embedding vector(2048),
  match_count int default 5,
  similarity_threshold float default 0.3
)
returns table (
  content text,
  source_file text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    rc.content,
    rc.source_file,
    1 - (rc.embedding <=> query_embedding) as similarity
  from rag_chunks rc
  where 1 - (rc.embedding <=> query_embedding) > similarity_threshold
  order by rc.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### 5. 从 index.json 迁移到 Supabase

创建迁移脚本 `scripts/migrate-to-supabase.ts`：

```ts
import { createClient } from "@supabase/supabase-js";
import { loadIndex } from "../src/lib/rag-index";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrate() {
  const chunks = loadIndex();
  for (const chunk of chunks) {
    await supabase.from("rag_chunks").insert({
      content: chunk.content,
      embedding: chunk.embedding,
      source_file: chunk.source,
    });
  }
  console.log(`Migrated ${chunks.length} chunks`);
}

migrate();
```

运行迁移：

```bash
npx tsx scripts/migrate-to-supabase.ts
```

迁移后需同步修改 `src/app/api/rag/chat/route.ts` 中的检索逻辑，改用 Supabase RPC 调用 `match_rag_chunks` 替代本地 `searchChunksWithScores`。

---

## 测试方法

```bash
# 启动开发服务器
npm run dev

# 浏览器操作
# 1. 打开 http://localhost:3000
# 2. 滚动到 Stage4 区域（个人介绍 / 联系页面）
# 3. 右键点击飞翔的小鸟角色
# 4. 输入一个问题，如"你学过什么专业"
# 5. 观察小鸟对话面板中是否有流式打字机回复
```

测试要点：
- 资料内问题：应有正常的流式 LLM 回复
- 高频预设问题（薪资、联系方式等）：应快速返回预设文本
- 完全无关问题（如"今天天气怎么样"）：应返回兜底回复"这个问题你可以联系我本人了解"
- 多轮对话：连续问问题，确认历史上下文被保留（7 轮内）
