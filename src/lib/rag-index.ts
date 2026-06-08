import fs from "fs";
import path from "path";
import { getEmbedding } from "./embedding";

export interface Chunk {
  content: string;
  embedding: number[];
  source: string;
}

const INDEX_PATH = path.join(process.cwd(), "src/data/rag/index.json");

/** 把文本切分成小段（按段落，每段最多 500 字），相邻 chunk 重叠 80 字防止关键信息被切断 */
export function chunkText(text: string, source: string): Chunk[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const chunks: Chunk[] = [];
  let prevTail = ""; // 上一个 chunk 的尾部，作为下一个 chunk 的前缀

  for (const para of paragraphs) {
    let content = prevTail ? prevTail + "\n" + para.trim() : para.trim();
    prevTail = "";

    if (content.length > 500) {
      const sentences = content.split(/[。！？.!?]/);
      let current = "";
      for (const s of sentences) {
        if (current.length + s.length > 500 && current.length > 100) {
          const trimmed = current.trim();
          chunks.push({ content: trimmed, embedding: [], source });
          // 滑动窗口：取尾部 80 字作为下一个 chunk 的重叠前缀
          prevTail = trimmed.slice(-80);
          current = prevTail + s;
        } else {
          current += s + "。";
        }
      }
      if (current.trim().length > 20) {
        chunks.push({ content: current.trim(), embedding: [], source });
      }
    } else {
      chunks.push({ content, embedding: [], source });
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

// ============================================================
// 关键词检索（BM25 简化版）：解决纯向量检索对专有名词的遗漏
// ============================================================
export interface KeywordHit {
  index: number;
  score: number;
}

/** 对中英文混合文本做分词（中文用 bigram，英文用空格分词） */
function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const tokens: string[] = [];

  // 英文/数字词
  const engTokens = lower.match(/[a-z0-9]+/g) || [];
  tokens.push(...engTokens);

  // 中文 bigram（字符级2-gram，对专有名词更友好）
  const cnChars = lower.replace(/[^一-鿿]/g, "");
  for (let i = 0; i < cnChars.length - 1; i++) {
    tokens.push(cnChars.slice(i, i + 2));
  }
  // 单个汉字也保留
  for (const ch of cnChars) {
    tokens.push(ch);
  }

  return tokens.filter((t) => t.length >= 1);
}

/** BM25 简化版关键词检索 */
export function keywordSearch(
  query: string,
  chunks: Chunk[],
  topK = 5,
): SearchResult[] {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const totalDocs = chunks.length;
  const avgLen = chunks.reduce((s, c) => s + c.content.length, 0) / Math.max(1, totalDocs);

  // IDF: 包含每个词的文档数
  const df: Record<string, number> = {};
  for (const term of queryTerms) {
    df[term] = chunks.filter((c) => c.content.toLowerCase().includes(term)).length;
  }

  const k1 = 1.5;
  const b = 0.75;

  const scored = chunks.map((chunk, idx) => {
    const doc = tokenize(chunk.content);
    const docLen = chunk.content.length;
    let score = 0;

    for (const term of queryTerms) {
      const tf = doc.filter((t) => t === term).length;
      if (tf === 0) continue;
      const idf = Math.log((totalDocs - (df[term] || 0) + 0.5) / ((df[term] || 0) + 0.5) + 1);
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (docLen / avgLen));
      score += idf * (numerator / denominator);
    }

    return { index: idx, score };
  });

  // 归一化到 0-1
  const maxScore = Math.max(...scored.map((s) => s.score), 1);
  const norm = scored
    .filter((s) => s.score > 0)
    .map((s) => ({
      content: chunks[s.index].content,
      similarity: s.score / maxScore,
      source: chunks[s.index].source,
    }));

  norm.sort((a, b) => b.similarity - a.similarity);
  return norm.slice(0, topK);
}

// ============================================================
// 混合检索：RRF (Reciprocal Rank Fusion) 融合向量+关键词
// ============================================================
export function hybridSearch(
  queryEmbedding: number[],
  queryText: string,
  chunks: Chunk[],
  topK = 5,
  vectorWeight = 0.6,
): SearchResult[] {
  const k = 60;

  // 向量检索（带原始索引）
  const vecScored = chunks.map((chunk, i) => ({
    idx: i,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  vecScored.sort((a, b) => b.similarity - a.similarity);
  const vectorTop = vecScored.slice(0, topK * 2);

  // 关键词检索（带原始索引）
  const kwTop = keywordSearchWithIndex(queryText, chunks, topK * 2);

  // RRF 融合
  const rrfScores: Record<number, number> = {};
  vectorTop.forEach((r, rank) => {
    rrfScores[r.idx] = (rrfScores[r.idx] || 0) + vectorWeight / (k + rank + 1);
  });
  kwTop.forEach((r, rank) => {
    rrfScores[r.idx] = (rrfScores[r.idx] || 0) + (1 - vectorWeight) / (k + rank + 1);
  });

  const entries = Object.entries(rrfScores);
  if (entries.length === 0) return [];

  // 归一化 RRF 分数到 0-1 范围（保持与纯向量检索分数可比）
  const maxScore = Math.max(...entries.map(([, s]) => s));
  const fused = entries
    .map(([idx, score]) => ({
      content: chunks[parseInt(idx)].content,
      similarity: score / maxScore,
      source: chunks[parseInt(idx)].source,
    }))
    .sort((a, b) => b.similarity - a.similarity);

  return fused.slice(0, topK);
}

/** 关键词检索（返回带索引的结果） */
function keywordSearchWithIndex(
  query: string,
  chunks: Chunk[],
  topK = 5,
): { idx: number; score: number }[] {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const totalDocs = chunks.length;
  const avgLen = chunks.reduce((s, c) => s + c.content.length, 0) / Math.max(1, totalDocs);
  const df: Record<string, number> = {};
  for (const term of queryTerms) {
    df[term] = chunks.filter((c) => c.content.toLowerCase().includes(term)).length;
  }

  const k1 = 1.5;
  const b = 0.75;
  const scored = chunks.map((chunk, idx) => {
    const doc = tokenize(chunk.content);
    const docLen = chunk.content.length;
    let score = 0;
    for (const term of queryTerms) {
      const tf = doc.filter((t) => t === term).length;
      if (tf === 0) continue;
      const idf = Math.log((totalDocs - (df[term] || 0) + 0.5) / ((df[term] || 0) + 0.5) + 1);
      score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgLen)));
    }
    return { idx, score };
  });

  const maxScore = Math.max(...scored.map((s) => s.score), 1);
  return scored
    .filter((s) => s.score > 0)
    .map((s) => ({ idx: s.idx, score: s.score / maxScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
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
