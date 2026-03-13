import { CreateMLCEngine, type MLCEngine } from "@mlc-ai/web-llm";
import type { ModelLoadStatus, InferenceMode } from "../types";
import { EMBED_MODEL_ID, PROMPT_RESERVE, findModel } from "./models";

let chatEngine: MLCEngine | null = null;
let embedEngine: MLCEngine | null = null;
let loadedModelId: string | null = null;

// ── Loading ───────────────────────────────────────────────────────────────

export async function loadModels(
  modelId: string,
  onStatus: (s: ModelLoadStatus) => void,
): Promise<void> {
  if (chatEngine && embedEngine && loadedModelId === modelId) {
    onStatus({ stage: "ready", modelId });
    return;
  }

  chatEngine = null;
  embedEngine = null;
  loadedModelId = null;

  onStatus({ stage: "loading", progress: 0, text: "Starting…" });

  try {
    chatEngine = await CreateMLCEngine(modelId, {
      initProgressCallback: (r) =>
        onStatus({
          stage: "loading",
          progress: r.progress * 0.7,
          text: `Chat model - ${r.text}`,
        }),
    });

    embedEngine = await CreateMLCEngine(EMBED_MODEL_ID, {
      initProgressCallback: (r) =>
        onStatus({
          stage: "loading",
          progress: 0.7 + r.progress * 0.3,
          text: `Embedding model - ${r.text}`,
        }),
    });

    loadedModelId = modelId;
    onStatus({ stage: "ready", modelId });
  } catch (err) {
    chatEngine = null;
    embedEngine = null;
    loadedModelId = null;
    onStatus({ stage: "error", message: String(err) });
  }
}

// ── Embeddings ────────────────────────────────────────────────────────────

export async function embed(texts: string[]): Promise<number[][]> {
  if (!embedEngine) throw new Error("Embedding model not loaded");
  const out = await embedEngine.embeddings.create({
    input: texts,
    model: EMBED_MODEL_ID,
  });
  return out.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

export async function embedOne(text: string): Promise<number[]> {
  const [v] = await embed([text]);
  return v;
}

// ── Token counting & mode decision ───────────────────────────────────────

export function countTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

export function decideMode(
  content: string,
  modelId: string,
): {
  tokenCount: number;
  contextWindow: number;
  mode: InferenceMode;
  usagePct: number;
} {
  const model = findModel(modelId);
  const available = model.contextWindow - PROMPT_RESERVE;
  const tokenCount = countTokens(content);
  const mode: InferenceMode = tokenCount <= available ? "direct" : "rag";
  const usagePct = Math.min(100, Math.round((tokenCount / available) * 100));
  return { tokenCount, contextWindow: model.contextWindow, mode, usagePct };
}

// ── Streaming chat ────────────────────────────────────────────────────────

export async function streamChat(
  system: string,
  user: string,
  onToken: (t: string) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!chatEngine) throw new Error("Chat model not loaded");

  const stream = await chatEngine.chat.completions.create({
    messages: [
      { role: "system", content: system },
      { role: "user",   content: user },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 1024,
  });

  for await (const chunk of stream) {
    if (signal?.aborted) {
      await chatEngine.interruptGenerate();
      break;
    }
    const t = chunk.choices[0]?.delta?.content ?? "";
    if (t) onToken(t);
  }
}

// ── Prompt builders ───────────────────────────────────────────────────────

export function directPrompt(content: string, filename: string): string {
  return `You are a helpful assistant reviewing the file "${filename}".
Answer questions based only on the content below.
If the answer isn't present say so - never invent information.
Quote relevant lines when helpful.

FILE CONTENT:
${content}`;
}

export function ragPrompt(context: string, filename: string): string {
  return `You are a helpful assistant reviewing the file "${filename}".
Answer based only on the excerpts below - never invent information.
Quote relevant lines when helpful.

${context}`;
}

export const isReady = () => chatEngine !== null && embedEngine !== null;
export const getModelId = () => loadedModelId;
