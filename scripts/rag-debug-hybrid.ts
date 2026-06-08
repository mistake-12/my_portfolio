import { config } from "dotenv";
config({ path: ".env.local" });
import { loadIndex, hybridSearch } from "../src/lib/rag-index";
import { getEmbedding } from "../src/lib/embedding";

(async () => {
  const chunks = loadIndex();
  console.log("chunks loaded:", chunks.length);
  console.log("chunk[0] emb len:", chunks[0]?.embedding?.length);

  const q = "你在哪个学校读书？";
  const emb = await getEmbedding(q);
  console.log("embedding dim:", emb.length);

  const results = hybridSearch(emb, q, chunks, 5);
  console.log("hybrid results:", results.length);
  for (const r of results.slice(0, 3)) {
    console.log(`  s=${r.similarity.toFixed(3)} [${r.source}] ${r.content.slice(0, 80)}`);
  }

  // 检查建筑学是否在检索结果中
  console.log("");
  const q2 = "你以前学的是什么专业？";
  const emb2 = await getEmbedding(q2);
  const r2 = hybridSearch(emb2, q2, chunks, 5);
  console.log("【你以前学的是什么专业？】检索结果:");
  r2.forEach((r: any, i: number) =>
    console.log(`  [${i}] s=${r.similarity.toFixed(3)} [${r.source}] ${r.content.slice(0, 100)}`)
  );

  // 纯关键词搜索
  console.log("");
  const { keywordSearch } = await import("../src/lib/rag-index");
  const kw2 = keywordSearch(q2, chunks, 3);
  console.log("【关键词检索】:");
  kw2.forEach((r: any, i: number) =>
    console.log(`  [${i}] s=${r.similarity.toFixed(3)} [${r.source}] ${r.content.slice(0, 100)}`)
  );

  // raw check: 资料中有建筑学吗
  console.log("");
  const archHits = chunks.filter((c: any) => c.content.includes("建筑学") || c.content.includes("建筑"));
  console.log("含'建筑'的chunks:", archHits.length);
  archHits.forEach((c: any) => console.log("  [" + c.source + "]", c.content.slice(0, 100)));
})().catch((e: any) => console.error(e));
