/** 智谱AI (GLM) Embedding API */
export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "embedding-2",
      input: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`GLM Embedding error: ${res.status}`);
  }

  const json = await res.json();
  return json.data[0].embedding;
}
