import { CreateMLCEngine, type MLCEngine } from "@mlc-ai/web-llm";
import type { ModelLoadStatus, InferenceMode, TokenInfo } from "../types";
import { EMBED_MODEL_ID, PROMPT_RESERVE_TOKENS, getModel } from "./models";

// ── Singleton engines ─────────────────────────────────────────────────────

let chatEngine: MLCEngine | null = null;
let embedEngine: MLCEngine | null = null;
let loadedChatModelId: string | null = null;

// ── Model loading ─────────────────────────────────────────────────────────

export async function loadModels(
  chatModelId: string,
  onStatus: (s: ModelLoadStatus) => void
): Promise<void> {
  // Already loaded with same model
  if (chatEngine && embedEngine && loadedChatModelId === chatModelId) {
    onStatus({ stage: "ready", modelId: chatModelId });
    return;
  }

  // Reset on model change
  chatEngine = null;
  embedEngine = null;
  loadedChatModelId = null;

  onStatus({ stage: "loading", progress: 0, text: "Initialising…" });

  try {
    // Step 1: load chat model (maps to 0–70% of progress bar)
    chatEngine = await CreateMLCEngine(chatModelId, {
      initProgressCallback: (r) => {
        onStatus({
          stage: "loading",
          progress: r.progress * 0.7,
          text: `Chat model — ${r.text}`,
        });
      },
    });

    // Step 2: load embedding model (maps to 70–100%)
    embedEngine = await CreateMLCEngine(EMBED_MODEL_ID, {
      initProgressCallback: (r) => {
        onStatus({
          stage: "loading",
          progress: 0.7 + r.progress * 0.3,
          text: `Embedding model — ${r.text}`,
        });
      },
    });

    loadedChatModelId = chatModelId;
    onStatus({ stage: "ready", modelId: chatModelId });
  } catch (err: unknown) {
    chatEngine = null;
    embedEngine = null;
    loadedChatModelId = null;
    onStatus({ stage: "error", message: String(err) });
  }
}

// ── Embeddings ────────────────────────────────────────────────────────────

export async function embed(texts: string[]): Promise<number[][]> {
  if (!embedEngine) throw new Error("Embedding model not loaded");

  console.log("embedEngine:", embedEngine);

  const output = await embedEngine.embeddings.create({
    input: texts,
    model: EMBED_MODEL_ID,
  });

  // Sort by index to guarantee order matches input
  return output.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export async function embedOne(text: string): Promise<number[]> {
  const [vec] = await embed([text]);
  return vec;
}

// ── Token counting ────────────────────────────────────────────────────────

export function countTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/**
 * Decide whether to use direct context or RAG for a given file.
 * Returns a TokenInfo with the decision and usage stats.
 */
export async function getTokenInfo(
  content: string,
  chatModelId: string
): Promise<TokenInfo> {
  const model = getModel(chatModelId);
  const contextWindow = model?.contextWindow ?? 4096;
  const fileTokens = await countTokens(content);
  const available = contextWindow - PROMPT_RESERVE_TOKENS;
  const mode: InferenceMode = fileTokens <= available ? "direct" : "rag";
  const usagePct = Math.min(100, Math.round((fileTokens / available) * 100));

  return { fileTokens, contextWindow, mode, usagePct };
}

// ── Chat ──────────────────────────────────────────────────────────────────

export async function streamChat(
  systemPrompt: string,
  userMessage: string,
  onToken: (token: string) => void
): Promise<void> {
  if (!chatEngine) throw new Error("Chat model not loaded");

  const stream = await chatEngine.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 768,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? "";
    if (token) onToken(token);
  }
}

// ── Prompt builders ───────────────────────────────────────────────────────

/** Direct mode: full file content in context */
export function buildDirectPrompt(content: string, filename: string): string {
  return `You are a helpful assistant reviewing meeting notes.
The user has loaded "${filename}". Answer questions based only on the content below.
If the answer isn't present, say so clearly — never invent information.
Quote relevant lines when helpful.

NOTES:
${content}`;
}

/** RAG mode: only retrieved excerpts in context */
export function buildRagPrompt(context: string, filename: string): string {
  return `You are a helpful assistant reviewing meeting notes.
The user has loaded "${filename}". Answer based only on the excerpts below.
If the answer isn't in the excerpts, say so — never invent information.
Quote relevant lines when helpful.

${context}`;
}

export function isReady(): boolean {
  return chatEngine !== null && embedEngine !== null;
}

export function getLoadedModelId(): string | null {
  return loadedChatModelId;
}
