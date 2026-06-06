import fs from "fs";
import path from "path";
import { getEmbedding } from "./embedding";

export interface Chunk {
  content: string;
  embedding: number[];
  source: string;
}

const INDEX_PATH = path.join(process.cwd(), "src/data/rag/index.json");

/** 把文本切分成小段（按段落，每段最多 500 字） */
export function chunkText(text: string, source: string): Chunk[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const chunks: Chunk[] = [];
  for (const para of paragraphs) {
    // 如果段落太长，进一步按句号切分
    if (para.length > 500) {
      const sentences = para.split(/[。！？.!?]/);
      let current = "";
      for (const s of sentences) {
        if (current.length + s.length > 500 && current.length > 100) {
          chunks.push({ content: current.trim(), embedding: [], source });
          current = s;
        } else {
          current += s + "。";
        }
      }
      if (current.trim().length > 20) {
        chunks.push({ content: current.trim(), embedding: [], source });
      }
    } else {
      chunks.push({ content: para.trim(), embedding: [], source });
    }
  }
  return chunks;
}

/** 读取所有 RAG 资料，切分 chunk，调 embedding API，保存到 JSON */
export async function buildIndex(): Promise<Chunk[]> {
  const ragDir = path.join(process.cwd(), "src/data/rag");
  const files = fs
    .readdirSync(ragDir)
    .filter((f) => f.endsWith(".md") && f !== "index.json");
  const allChunks: Chunk[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(ragDir, file), "utf-8");
    const chunks = chunkText(content, file);
    console.log(`[RAG Index] ${file}: ${chunks.length} chunks`);
    allChunks.push(...chunks);
  }

  console.log(`[RAG Index] Total: ${allChunks.length} chunks, embedding...`);

  for (let i = 0; i < allChunks.length; i++) {
    try {
      allChunks[i].embedding = await getEmbedding(allChunks[i].content);
      console.log(`[RAG Index] ${i + 1}/${allChunks.length} done`);
    } catch (err) {
      console.error(`[RAG Index] Failed chunk ${i}:`, err);
    }
  }

  // Save index
  fs.writeFileSync(INDEX_PATH, JSON.stringify(allChunks, null, 2), "utf-8");
  console.log(`[RAG Index] Saved to ${INDEX_PATH}`);

  return allChunks;
}

/** 加载已有的索引 */
export function loadIndex(): Chunk[] {
  if (!fs.existsSync(INDEX_PATH)) {
    console.warn("[RAG Index] No index found, returning empty");
    return [];
  }
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
}

/** 检索结果（含相似度分数） */
export interface SearchResult {
  content: string;
  similarity: number;
  source: string;
}

/** 用问题向量检索最相关的 top-K chunks（余弦相似度） */
export function searchChunks(
  queryEmbedding: number[],
  chunks: Chunk[],
  topK = 5,
): Chunk[] {
  const results = chunks.map((chunk) => ({
    chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK).map((r) => r.chunk);
}

/** 用问题向量检索最相关的 top-K chunks，并返回相似度分数 */
export function searchChunksWithScores(
  queryEmbedding: number[],
  chunks: Chunk[],
  topK = 5,
): SearchResult[] {
  const results = chunks.map((chunk) => ({
    content: chunk.content,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    source: chunk.source,
  }));

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
