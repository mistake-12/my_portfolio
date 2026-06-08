// RAG 评测脚本 — 基于 RAGAS 框架的 LLM-as-Judge
// 用法: npx tsx scripts/rag-evaluate.ts
//
// 三大核心指标:
// - Faithfulness 忠实度
// - Answer Relevancy 回答相关性
// - Context Precision 检索精度（待 API 暴露检索数据后加入）

// 加载 .env.local（Next.js 自动加载，独立 tsx 进程需要手动）
// 评分方式: LLM裁判（DeepSeek）- 比关键词匹配更准确
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

interface TestCase {
  id: string;
  question: string;
  ground_truth: string;
  category: string;
  expected_behavior: string;
}

interface EvalDetail {
  id: string;
  question: string;
  category: string;
  answer: string;
  ground_truth: string;
  faithfulness: number;
  answerRelevancy: number;
}

// ============================================================
// 1. 调用 RAG API，收集流式响应
// ============================================================
async function askRag(question: string): Promise<string> {
  const res = await fetch("http://localhost:3000/api/rag/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.startsWith("data: "));
  const chars: string[] = [];
  for (const line of lines) {
    const data = line.slice(6);
    if (data === "[DONE]") break;
    try {
      const p = JSON.parse(data);
      if (p.text) chars.push(p.text);
    } catch {}
  }
  return chars.join("");
}

// Context Precision 需要检索结果，但评测脚本不独立调用 embedding
// 通过 askRag 返回的 API 响应间接获取（需要 API 端配合暴露 chunk 信息）
// 当前版本仅评测 Faithfulness 和 Answer Relevancy

// ============================================================
// 3. LLM-as-Judge 评分 (通过项目已有的 DeepSeek Anthropic 兼容 API)
// ============================================================
async function llmJudge(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 10,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Judge API ${res.status}: ${err.slice(0, 200)}`);
  }
  const j = await res.json() as any;
  const text = (j.choices?.[0]?.message?.content || "").trim();
  const match = text.match(/\d+/);
  return match ? match[0] : text;
}

// ----------------------
// 3a. Faithfulness 忠实度（基于回答内容内部一致性 + 有无典型幻觉特征）
// ----------------------
async function scoreFaithfulness(
  question: string,
  answer: string,
  ground_truth: string,
): Promise<number> {
  const prompt = `你是一个RAG评测裁判。请判断以下AI回答是否忠实于其知识库内容。

【用户问题】
${question}

【AI回答】
${answer}

【预期答案要点】
${ground_truth}

评分标准(0-10):
- 10: 回答事实完全准确，与预期答案一致，没有编造或推测
- 7-9: 回答基本准确，有少量无关紧要的补充
- 4-6: 回答部分准确，但混入了不相关或推测性信息
- 1-3: 回答大部分不准确或编造
- 0: 完全错误，或者拒绝回答但实际资料中有答案

只输出一个数字(0-10)，不要解释:`;

  const result = await llmJudge(prompt);
  return Math.max(0, Math.min(10, parseInt(result.trim()) || 0));
}

// ---------------------------
// 3b. Answer Relevancy 回答相关性
// ---------------------------
async function scoreAnswerRelevancy(question: string, answer: string): Promise<number> {
  const prompt = `你是一个RAG评测裁判。请判断以下AI回答是否与用户问题紧密相关。

【用户问题】
${question}

【AI回答】
${answer}

评分标准(0-10):
- 10: 回答完全针对问题，直接回应了用户意图
- 7-9: 回答基本相关，有少量偏离
- 4-6: 回答部分相关，但较多内容答非所问
- 1-3: 回答勉强沾边，大部分内容跑题
- 0: 完全答非所问

只输出一个数字(0-10)，不要解释:`;

  const result = await llmJudge(prompt);
  return Math.max(0, Math.min(10, parseInt(result.trim()) || 0));
}

// ============================================================
// 4. 主流程
// ============================================================
async function main() {
  const fs = await import("fs");
  const path = await import("path");

  console.log("========================================");
  console.log("  RAG RAGAS 评测 (LLM-as-Judge)");
  console.log("  指标: Faithfulness / Answer Relevancy");
  console.log("  (Context Precision 待 API 暴露检索数据后加入)");
  console.log("========================================\n");

  const testSetPath = path.join(process.cwd(), "scripts/rag-eval-test-set.json");
  const testCases: TestCase[] = JSON.parse(fs.readFileSync(testSetPath, "utf-8"));

  console.log(`共 ${testCases.length} 条测试用例\n`);
  console.log(`  hit:       ${testCases.filter((t) => t.category === "hit").length} 条`);
  console.log(`  faq:       ${testCases.filter((t) => t.category === "faq").length} 条`);
  console.log(`  boundary:  ${testCases.filter((t) => t.category === "boundary").length} 条`);
  console.log(`  out_of_scope: ${testCases.filter((t) => t.category === "out_of_scope").length} 条`);
  console.log("");

  const details: EvalDetail[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    process.stdout.write(`[${i + 1}/${testCases.length}] ${tc.id} "${tc.question.slice(0, 30)}..." `);

    try {
      const answer = await askRag(tc.question);

      const [faithfulness, answerRelevancy] = await Promise.all([
        scoreFaithfulness(tc.question, answer, tc.ground_truth),
        scoreAnswerRelevancy(tc.question, answer),
      ]);

      details.push({
        id: tc.id,
        question: tc.question,
        category: tc.category,
        answer,
        ground_truth: tc.ground_truth,
        faithfulness,
        answerRelevancy,
      });

      const avg = ((faithfulness + answerRelevancy) / 2).toFixed(1);
      console.log(`F:${faithfulness}/10  R:${answerRelevancy}/10  → ${avg}/10`);
    } catch (err) {
      console.log(`💥 错误: ${err instanceof Error ? err.message : String(err)}`);
      details.push({
        id: tc.id,
        question: tc.question,
        category: tc.category,
        answer: "",
        ground_truth: tc.ground_truth,
        faithfulness: 0,
        answerRelevancy: 0,
      });
    }
  }

  // ============================================================
  // 汇总报告
  // ============================================================
  const byCategory = {
    hit: details.filter((r) => r.category === "hit"),
    faq: details.filter((r) => r.category === "faq"),
    boundary: details.filter((r) => r.category === "boundary"),
    out_of_scope: details.filter((r) => r.category === "out_of_scope"),
  };

  console.log("\n========================================");
  console.log("  RAGAS 评测报告");
  console.log("========================================\n");

  const all = details.filter((d) => d.answer.length > 0);

  for (const [cat, catResults] of Object.entries(byCategory)) {
    const valid = catResults.filter((d) => d.answer.length > 0);
    if (valid.length === 0) continue;
    const avgF = valid.reduce((s, r) => s + r.faithfulness, 0) / valid.length;
    const avgR = valid.reduce((s, r) => s + r.answerRelevancy, 0) / valid.length;
    const labels: Record<string, string> = {
      hit: "资料命中",
      faq: "FAQ 精确匹配",
      boundary: "项目边界",
      out_of_scope: "兜底拒绝",
    };
    console.log(`  ${labels[cat] || cat} (${valid.length}条)`);
    console.log(`    Faithfulness:       ${avgF.toFixed(1)}/10`);
    console.log(`    Answer Relevancy:   ${avgR.toFixed(1)}/10`);
    console.log("");
  }

  const totalF = all.reduce((s, r) => s + r.faithfulness, 0) / all.length;
  const totalR = all.reduce((s, r) => s + r.answerRelevancy, 0) / all.length;

  console.log("  ─────────────────────────────────────");
  console.log(`  总计 (${all.length}条)`);
  console.log(`    Faithfulness:       ${totalF.toFixed(1)}/10  (合格≥8.5, 优秀≥9.5)`);
  console.log(`    Answer Relevancy:   ${totalR.toFixed(1)}/10  (合格≥8.0, 优秀≥9.0)`);
  console.log(`    Context Precision:  需要 API 暴露检索结果后才能评测`);
  console.log("");

  // 保存
  const reportPath = path.join(process.cwd(), "scripts/rag-eval-results.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          total: all.length,
          avgFaithfulness: totalF.toFixed(1),
          avgAnswerRelevancy: totalR.toFixed(1),
          byCategory: Object.fromEntries(
            Object.entries(byCategory).map(([cat, cr]) => {
              const v = cr.filter((d) => d.answer.length > 0);
              return [
                cat,
                {
                  count: v.length,
                  faithfulness: (v.reduce((s, r) => s + r.faithfulness, 0) / v.length).toFixed(1),
                  answerRelevancy: (v.reduce((s, r) => s + r.answerRelevancy, 0) / v.length).toFixed(1),
                },
              ];
            }),
          ),
        },
        details: details.filter((d) => d.answer.length > 0).map((d) => ({
          id: d.id,
          question: d.question,
          category: d.category,
          answer: d.answer.slice(0, 300),
          faithfulness: d.faithfulness,
          answerRelevancy: d.answerRelevancy,
        })),
      },
      null,
      2,
    ),
    "utf-8",
  );
  console.log(`详细结果已保存到: ${reportPath}`);
}

main().catch(console.error);
