import type { EmbeddedChunk, ScoredChunk } from "../types";

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function retrieve(
  chunks: EmbeddedChunk[],
  query: number[],
  k = 5,
  minScore = 0.35,
): ScoredChunk[] {
  return chunks
    .map((c, i) => ({ ...c, score: dot(query, c.embedding), index: i }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function buildContext(chunks: ScoredChunk[]): string {
  return chunks
    .map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`)
    .join("\n\n---\n\n");
}
