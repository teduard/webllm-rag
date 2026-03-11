import type { ModelOption } from "../types";

// EMBED_MODEL is fixed — one small embedding model shared across all chat models.
// snowflake-arctic-embed-s: 384-dim, ~130MB, fast, no quality compromise for notes.
export const EMBED_MODEL_ID = "snowflake-arctic-embed-s-q0f32-MLC-b4";
export const EMBED_MODEL_SIZE = "0.13 GB";

// Token budget: reserve this many tokens for the system prompt wrapper +
// the user question + the model's answer. File content gets the rest.
export const PROMPT_RESERVE_TOKENS = 1024;

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    label: "Llama 3.2 · 1B",
    chatSizeGb: "0.78 GB",
    embedSizeGb: EMBED_MODEL_SIZE,
    totalSizeGb: "0.91 GB",
    contextWindow: 4096,
    description: "Fastest. Good for short notes on any GPU.",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 / 3B",
    chatSizeGb: "1.87 GB",
    embedSizeGb: EMBED_MODEL_SIZE,
    totalSizeGb: "2.0 GB",
    contextWindow: 8192,
    description: "Best balance. Recommended starting point.",
  },
  // {
  //   id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
  //   label: "Phi 3.5 Mini",
  //   chatSizeGb: "2.17 GB",
  //   embedSizeGb: EMBED_MODEL_SIZE,
  //   totalSizeGb: "2.3 GB",
  //   contextWindow: 4096,
  //   description: "Strong instruction following. Good for structured notes.",
  // },
  // {
  //   id: "gemma-2-2b-it-q4f16_1-MLC",
  //   label: "Gemma 2 / 2B",
  //   chatSizeGb: "1.44 GB",
  //   embedSizeGb: EMBED_MODEL_SIZE,
  //   totalSizeGb: "1.57 GB",
  //   contextWindow: 8192,
  //   description: "Fast on modern GPUs. Large context window.",
  // },
  // {
  //   id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
  //   label: "Mistral 7B",
  //   chatSizeGb: "4.07 GB",
  //   embedSizeGb: EMBED_MODEL_SIZE,
  //   totalSizeGb: "4.2 GB",
  //   contextWindow: 32768,
  //   description: "Highest quality. Large context — rarely needs RAG.",
  // },
];

export const DEFAULT_MODEL_ID = AVAILABLE_MODELS[0].id;

export function getModel(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
