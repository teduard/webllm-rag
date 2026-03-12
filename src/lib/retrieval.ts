import type { EmbeddedChunk } from "../types";

// Normalised vectors - cosine similarity = dot product
function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function retrieve(
  chunks: EmbeddedChunk[],
  query: number[],
  k = 4,
  minScore = 0.35
): EmbeddedChunk[] {
  return chunks
    .map(c => ({ chunk: c, score: dot(query, c.embedding) }))
    .filter(x => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(x => x.chunk);
}

export function buildContext(chunks: EmbeddedChunk[]): string {
  return chunks
    .map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`)
    .join("\n\n---\n\n");
}
