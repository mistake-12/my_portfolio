// 最小测试：验证 RAG API + LLM Judge 评分管道是否正常工作
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

async function askRag(q: string) {
  const r = await fetch("http://localhost:3000/api/rag/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: q }),
  });
  const t = await r.text();
  return t.split("\n")
    .filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))
    .map(l => { try { return JSON.parse(l.slice(6)).text || "" } catch { return "" } })
    .join("");
}

async function judge(prompt: string) {
  const r = await fetch("https://api.deepseek.com/chat/completions", {
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
      stream: false,
    }),
  });
  const raw = await r.text();
  if (!r.ok) { console.log("API Error:", r.status, raw.slice(0, 500)); return ""; }
  const j = JSON.parse(raw);
  console.log("API response:", raw.slice(0, 300));
  return j.choices?.[0]?.message?.content || "";
}

async function main() {
  // 测试 1：RAG API 是否正常
  console.log("=== 测试 1: askRag ===");
  const a1 = await askRag("你在哪个学校读书？");
  console.log("回答:", a1.slice(0, 200));
  console.log("");

  console.log("=== 测试 2: judge ===");
  const j1 = await judge("只输出数字9，不要其他文字。");
  console.log("judge 原始输出:", JSON.stringify(j1));
  console.log("");

  console.log("=== 测试 3: 忠实度评分 ===");
  const faithPrompt = `判断AI回答是否忠实于预期答案。只输出0-10的整数。

问题: 你在哪个学校读书？
AI回答: ${a1.slice(0, 300)}
预期答案: 上海交通大学工业设计专业

评分:` ;
  const faith = await judge(faithPrompt);
  console.log("忠实度原始输出:", JSON.stringify(faith));
}

main().catch(e => console.error(e));
