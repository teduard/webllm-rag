import { CreateMLCEngine, type MLCEngine } from "@mlc-ai/web-llm";
import type { ModelLoadStatus } from "../types";

let engine: MLCEngine | null = null;
let loadedModelId: string | null = null;

export async function loadModel(
  modelId: string,
  onStatus: (s: ModelLoadStatus) => void
): Promise<void> {
  // Already loaded with same model — nothing to do
  if (engine && loadedModelId === modelId) {
    onStatus({ stage: "ready", modelId });
    return;
  }

  // Different model selected — reset
  if (engine) {
    engine = null;
    loadedModelId = null;
  }

  onStatus({ stage: "loading", progress: 0, text: "Initialising…" });

  try {
    engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        onStatus({
          stage: "loading",
          progress: report.progress,
          text: report.text,
        });
      },
    });
    loadedModelId = modelId;
    onStatus({ stage: "ready", modelId });
  } catch (err: unknown) {
    engine = null;
    loadedModelId = null;
    onStatus({ stage: "error", message: String(err) });
  }
}

export async function streamChat(
  systemPrompt: string,
  userMessage: string,
  onToken: (token: string) => void
): Promise<void> {
  if (!engine) throw new Error("Model not loaded");

  const stream = await engine.chat.completions.create({
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

export function buildSystemPrompt(context: string, filename: string): string {
  return `You are a concise assistant helping review meeting notes.
The user has loaded "${filename}". Answer only from the excerpts below.
If the answer isn't there, say so — never invent information.
Quote relevant lines when helpful.

${context}`;
}

export function isModelReady() {
  return engine !== null;
}

export function getLoadedModelId() {
  return loadedModelId;
}
