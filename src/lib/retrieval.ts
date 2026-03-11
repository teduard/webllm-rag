import type { EmbeddedChunk, ScoredChunk } from "../types";

let activeChunks: EmbeddedChunk[] = [];

export function loadIndex(chunks: EmbeddedChunk[]) {
  activeChunks = chunks;
}

export function clearIndex() {
  activeChunks = [];
}

export function indexSize() {
  return activeChunks.length;
}

// all-MiniLM-L6-v2 outputs normalised vectors so cosine = dot product
function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function retrieve(query: number[], k = 5, minScore = 0.2): ScoredChunk[] {
  return activeChunks
    .map((c) => ({ ...c, score: dot(query, c.embedding) }))
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function buildContext(chunks: ScoredChunk[]): string {
  return chunks
    .map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`)
    .join("\n\n---\n\n");
}
