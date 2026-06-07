import { NextRequest } from "next/server";
import { getLLMResponse } from "@/lib/llm";
import { getEmbedding } from "@/lib/embedding";
import { loadIndex, searchChunksWithScores } from "@/lib/rag-index";

// 高频预设回答：仅对短问题做精确匹配，避免长问题中关键词误触发
const FAQ_PATTERNS: { regex: RegExp; answer: string }[] = [
  { regex: /^(怎么|如何|怎样)?联系(你|方式)?[？?]?$/, answer: "你可以通过 GitHub (mistake-12) 或个人网站联系我。" },
  { regex: /^(你(的)?)?联系方式(是)?(什么|啥)?[？?]?$/, answer: "你可以通过 GitHub (mistake-12) 或个人网站联系我。" },
  { regex: /^(你(的)?)?(期望)?薪资(多少|怎样|如何)[？?]?$/, answer: "薪资我们可以沟通中详细聊，你方便的话可以直接联系我。" },
  { regex: /^(什么时候|何时|怎么|如何)入职[？?]?$/, answer: "根据具体情况可协商，欢迎直接联系我讨论。" },
  { regex: /^(你(在|的))?工作地点(在哪|在哪里|是哪里)[？?]?$/, answer: "对上海、深圳、杭州都持开放态度，具体看机会和团队。" },
];

function matchFAQ(question: string): string | null {
  for (const { regex, answer } of FAQ_PATTERNS) {
    if (regex.test(question.trim())) {
      return answer;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { question, history = [] } = await req.json();

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "问题不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. 精确匹配短问句（如"怎么联系你？"），避免长问题误触发
    const faqAnswer = matchFAQ(question);
    if (faqAnswer) {
      return streamText(faqAnswer);
    }

    // 2. RAG 检索：向量语义检索（若 embedding 未正确生成则回退到本地知识库）
    const chunks = loadIndex();
    let context: string;
    const hasValidEmbeddings =
      chunks.length > 0 &&
      chunks[0].embedding.length > 0 &&
      chunks[0].embedding.some((v: number) => v !== 0);

    if (hasValidEmbeddings) {
      const queryEmbedding = await getEmbedding(question);
      const results = searchChunksWithScores(queryEmbedding, chunks, 5);

      // 通过相似度阈值过滤低质量检索结果
      const MIN_SIMILARITY = 0.3;
      const relevant = results.filter((r) => r.similarity > MIN_SIMILARITY);

      if (relevant.length > 0) {
        context = relevant.map((c) => c.content).join("\n\n");
      } else {
        context = "NO_RELEVANT_INFO";
      }
    } else if (chunks.length > 0) {
      // Fallback: embedding 未正确生成（全零向量），用关键词匹配
      const keywords = question.split(/[？?。，,\s]+/).filter((w: string) => w.length > 1);
      const matched = chunks.filter((c) =>
        keywords.some((kw: string) => c.content.includes(kw)),
      );
      context =
        matched.length > 0
          ? matched.map((c) => c.content).join("\n\n")
          : "NO_RELEVANT_INFO";
    } else {
      context = "NO_RELEVANT_INFO";
    }

    // 2.5 若无相关资料，跳过 LLM，直接返回兜底回复
    if (context === "NO_RELEVANT_INFO") {
      return streamText("这个问题你可以联系我本人了解");
    }

    // 3. 构建 System Prompt
    const systemPrompt = `你是马子航，一个上海交通大学工业设计专业的学生，同时也喜欢Vibe coding一些有意思的东西。

用第一人称回答。你的性格：有点幽默、自嘲、但专业。语气自然，像在跟朋友聊天。

以下是你知道的关于自己的信息，只根据这些信息回答：
${context}

重要规则：
1. 用第一人称"我"回答，不要说"马子航"
2. 只回答资料中有的内容，绝对不要编造
3. 如果资料中没有相关信息，说"这个问题你可以联系我本人了解"
4. 回答简洁自然，不要长篇大论
5. 偶尔可以加一点自嘲式的幽默，但不要无厘头，一定要有根据能有笑点。`;

    // 4. 流式输出
    const llmStream = await getLLMResponse(systemPrompt, question, history);

    return new Response(llmStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[RAG Chat] Error:", error);
    return new Response(
      JSON.stringify({ error: "对话服务暂时不可用" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/** 将字符串包装为 SSE 打字机流 */
function streamText(text: string): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for (const char of text) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ text: char })}\n\n`,
          ),
        );
        await new Promise((r) => setTimeout(r, 30));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
