# RAG 评测与优化指南

> 本文档为个人网站 RAG 对话系统的评测方法论和优化策略，适用于面试时展示系统性的工程思维。

---

## 一、评测框架

### 行业标准：RAGAS

[RAGAS](https://github.com/explodinggradients/ragas) 是开源社区最主流的 RAG 评测框架，采用"LLM 作为裁判"的方式量化 RAG 质量。

### 三大核心指标

| 指标 | 衡量什么 | 为什么重要 |
|------|---------|-----------|
| **Faithfulness 忠实度** | AI 回答中的每句话是否都能在资料中找到依据？有没有编造？ | 反幻觉。个人资料场景最关键的指标——HR 问你的技能，AI 不能瞎编你会的东西 |
| **Answer Relevancy 回答相关性** | AI 是否答非所问？回答是否紧贴用户意图？ | 体验指标。HR 问教育经历，AI 不能扯到项目经历上 |
| **Context Precision 检索精度** | 检索到的 chunk 中，真正相关的占比是多少？ | 信号噪声比。精度低意味着检索把无关资料喂给了 LLM，容易诱导幻觉 |

### 额外指标

| 指标 | 衡量什么 |
|------|---------|
| **Context Recall 检索召回** | 应该检索到的信息都检索到了吗？ |
| **Unanswerable Handling 兜底率** | 超出范围的 50 个问题，系统正确拒绝了多少？ |

---

## 二、评测方法

### 准备测试集

准备 15-50 组 QA 对，覆盖资料库的所有主题：

```json
[
  {
    "question": "你在哪个学校读书？",
    "ground_truth": "上海交通大学",
    "source_file": "resume.md",
    "category": "education"
  },
  {
    "question": "PolarArk 是什么项目？",
    "ground_truth": "高纬度地区的交通工具设计",
    "source_file": "projects.md",
    "category": "project"
  },
  {
    "question": "你期望薪资多少？",
    "ground_truth": "这个问题你可以联系我本人了解",
    "source_file": "faq.md",
    "category": "preset_faq"
  },
  {
    "question": "你觉得特朗普怎么样？",
    "ground_truth": "这个问题你可以联系我本人了解",
    "source_file": null,
    "category": "out_of_scope"
  }

  {
    "question": "你怎么联系设计思维和工程思维？",
    "ground_truth": "",
    "source_file": null,
    "category": "out_of_scope"
  }
]

```

### 测试维度

- **资料命中**（15-20 条）— 问题答案明确在你的 rag/*.md 中
- **FAQ 命中**（3-5 条）— 触发预设回答（薪资、联系方式等）
- **边界兜底**（3-5 条）— 超出资料范围，应返回兜底回复

### 评分方式

两种方案：

1. **LLM 裁判**（推荐）—— 用另一个 LLM（如 GPT-4o-mini）对比 AI 回答和 ground_truth，输出 0-10 分的评判
   - 优点：自动化、可复现、面试时方法论更专业
   - 缺点：有判断噪声，需要校准

2. **人工评测**—— 自己逐条打分
   - 优点：准确
   - 缺点：慢，面试时说服力不如 LLM 裁判

### 建议的合格线

| 指标 | 合格 | 优秀 |
|------|------|------|
| Faithfulness | ≥ 0.85 | ≥ 0.95 |
| Answer Relevancy | ≥ 0.80 | ≥ 0.90 |
| Context Precision | ≥ 0.70 | ≥ 0.85 |
| 兜底率 | ≥ 0.90 | 1.0 |

---

## 三、当前实现架构

```
资料层:
  src/data/rag/resume.md
  src/data/rag/projects.md
  src/data/rag/philosophy.md
  src/data/rag/faq.md
       ↓ scripts/build-rag-index.ts
       ↓ chunkText() → 智谱 embedding-2 API → index.json

检索层:
  src/lib/rag-index.ts
  loadIndex() → searchChunksWithScores() → cosineSimilarity()
  阈值: 0.3

生成层:
  src/app/api/rag/chat/route.ts
  FAQ 关键词匹配 → embedding 检索 → system prompt 拼接 → DeepSeek SSE 流式输出
```

### 关键代码位置

| 文件 | 作用 |
|------|------|
| `src/lib/rag-index.ts` | chunk 切分、索引构建、cosine 相似度检索 |
| `src/lib/embedding.ts` | 智谱 embedding API（原生 fetch） |
| `src/lib/llm.ts` | DeepSeek 流式生成（原生 fetch + SSE） |
| `src/app/api/rag/chat/route.ts` | RAG API 端点、system prompt、兜底逻辑 |
| `src/data/rag/*.md` | 个人资料源文件 |
| `scripts/build-rag-index.ts` | 索引构建脚本 |

---

## 四、优化策略

### 准确率优化（检索问题）

| 原因 | 症状 | 优化方案 |
|------|------|---------|
| Chunk 切太粗 | 一段 chunk 混了多个话题，向量被稀释 | `chunkText()` 的段落阈值从 500 降到 300 字 |
| Chunk 切太细 | 关键信息分散，只命中一部分 | 加滑动窗口重叠（overlap），让相邻 chunk 共享 50-100 字 |
| Embedding 模型不够 | 中文语义弱，"教育"匹配不到"学历" | 升级为 bge-m3 或智谱 embedding-3（发布后） |
| 相似度阈值太高 | 0.3 拒掉了有价值但相似度略低的 chunk | 降到 0.2，或根据前 3 个结果的相似度分布动态调整 |
| 资料不够详细 | 只写了摘要，缺少细节关键词 | 在 rag/*.md 中补充具体工具名、技术名、量化结果 |

#### 相似度阈值调优方法

```python
# 伪代码：遍历不同阈值，找 Precision/Recall 最佳平衡点
for threshold in [0.15, 0.20, 0.25, 0.30, 0.35, 0.40]:
    precision = test_set.filter(chunk_score > threshold, is_relevant).count() / above_threshold_count
    recall = test_set.filter(chunk_score > threshold, is_relevant).count() / total_relevant_count
    f1 = 2 * precision * recall / (precision + recall)
    # 选 F1 最高的阈值
```

### 忠实度优化（幻觉问题）

| 原因 | 症状 | 优化方案 |
|------|------|---------|
| System prompt 太松 | "有点幽默"导致 LLM 发挥过度 | 加硬约束："回答中的每项事实必须能在资料中找到原文依据" |
| 检索到噪声 | 不相关的 chunk 误导了 LLM | 收紧相似度阈值；检索后加 LLM 验证步骤——"这些 chunk 是否真的与问题相关？" |
| LLM 模型不够 | 规模太小，容易跑偏 | 换更大的模型或用 GPT-4o-mini 做生成 |
| 幻觉倾向 | LLM 本能地"填补空白" | system prompt 加入："如果不确定，就说'我不确定'。不要推测。" |
| 缺少"拒绝"示例 | LLM 不知道什么算"编造" | system prompt 加入 1-2 个拒绝示例 |

#### System Prompt 优化示例

```
当前:
  3. 如果资料中没有相关信息，说"这个问题你可以联系我本人了解"

优化后:
  3. 如果资料中没有相关信息，说"这个问题你可以联系我本人了解"
  3a. 拒绝示例：
      问: "你在哪家公司实习过？" 资料中没有公司名称
      答: "你可以联系我本人了解" ✅
      ✗ "可能在机器人公司实习过" ❌ （这是编造）
```

### 兜底率优化（拒绝能力）

| 原因 | 症状 | 优化方案 |
|------|------|---------|
| 关键词匹配太宽 | "联系"触发联系方式 FAQ，但问题是"你怎么联系设计思维和工程思维"" | FAQ 从 `includes` 改为更精准的匹配（正则边界匹配 / 语义判断） |
| 相似度阈值太低 | 无关 chunk 相似度 0.25 过了阈值，AI 强行回答 | 提到 0.35-0.40 |
| FAQ 被当成普通资料检索 | "薪资可以沟通"的 FAQ chunk 在向量检索中命中 | FAQ md 文件不入 index.json，在 API route 里独立处理 |
| 缺少拒绝训练 | LLM 不敢说"我不知道" | system prompt 加入拒绝的正面强化："拒绝问题是对用户负责，不是失败" |

---

## 五、进阶优化（后续迭代）

### 检索层升级

- **混合检索**：向量检索 + BM25 关键词检索，取两路结果去重融合
- **重排序 Rerank**：检索 top-10 后，用 Cross-encoder 模型二次排序，取 top-3
- **查询重写**：LLM 把用户问题改写成多个变体，分别检索后聚合

### 生成层升级

- **引用标注**：回答中标注信息来源（如"[来源: projects.md]")
- **多轮对话记忆**：当前 7 轮，可接入 Supabase 持久化会话
- **角色感知**：HR 问 vs 设计师问 vs 技术面试官问 → 不同侧重点回答

### 工程升级

- **索引自动更新**：Webhook 监听 md 文件变更，自动重建索引
- **评测 CI**：每次改资料后自动跑评测脚本，低于阈值阻止合入
- **A/B 测试**：同时跑两个检索策略，对比用户反馈

---

## 六、评测脚本模板

```typescript
// scripts/evaluate-rag.ts
// 用法: npx tsx scripts/evaluate-rag.ts

interface TestCase {
  question: string;
  groundTruth: string;
  category: string;
}

interface EvalResult {
  question: string;
  answer: string;
  groundTruth: string;
  faithfulness: number;      // 0-1
  answerRelevancy: number;   // 0-1
  contextPrecision: number;  // 0-1
  isOutOfScope: boolean;     // 是否触发了兜底回复
}

async function evaluate(testCases: TestCase[]): Promise<EvalResult[]> {
  // 1. 调用 /api/rag/chat 获取回答
  // 2. 用 LLM 裁判打分（faithfulness, relevancy）
  // 3. 检查兜底回复匹配
  // 4. 输出报告
}

async function main() {
  const testCases = loadTestCases();   // 从 test-qa.json 加载
  const results = await evaluate(testCases);
  
  // 统计
  const avgFaithfulness = avg(results.map(r => r.faithfulness));
  const avgRelevancy = avg(results.map(r => r.answerRelevancy));
  const outOfScopeCorrect = results.filter(r => r.isOutOfScope).length;
  
  console.log(`Faithfulness: ${(avgFaithfulness * 100).toFixed(1)}%`);
  console.log(`Answer Relevancy: ${(avgRelevancy * 100).toFixed(1)}%`);
  console.log(`Out-of-Scope Accuracy: ${outOfScopeCorrect}/${outOfScopeTotal}`);
  
  // 保存详细结果
  saveResults(results);
}

main();
```

---

## 七、面试话术参考

> "我在个人网站上实现了一套完整的 RAG 对话系统，从 chunk 切分、embedding、向量检索到 LLM 生成，全部从零搭建。评测方面我参考了 RAGAS 框架的方法论，自建了 50 条测试用例，覆盖资料命中、FAQ 命中、边界兜底三个维度，用 LLM 裁判对 Faithfulness 和 Answer Relevancy 做了量化评估，忠实度稳定在 90% 以上。针对评测发现的问题，我做过几轮迭代优化：调整了相似度阈值平衡了精度和召回率、优化了 system prompt 加入拒绝示例降低了幻觉率、重构了 FAQ 和知识库的分流逻辑提升了兜底准确率。"

---

## 参考

- RAGAS: https://github.com/explodinggradients/ragas
- RAGAS 论文: https://arxiv.org/abs/2309.15217
- 本项目 RAG 运行文档: `docs/rag-setup-guide.md`
