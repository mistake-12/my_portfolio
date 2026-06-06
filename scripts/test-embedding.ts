import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.GLM_API_KEY;
  console.log("Key exists:", !!apiKey);
  console.log("Key prefix:", apiKey?.slice(0, 12) + "...");

  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "embedding-2",
      input: "测试文本",
    }),
  });

  const json = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(json, null, 2));
}

main().catch(console.error);
