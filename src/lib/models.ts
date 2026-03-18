import type { ModelOption } from "../types";

export const EMBED_MODEL_ID = "snowflake-arctic-embed-s-q0f32-MLC-b4";
export const EMBED_SIZE_GB = "0.13";
export const PROMPT_RESERVE = 1024;

export const MODELS: ModelOption[] = [
  {
    id: "SmolLM2-135M-Instruct-q0f32-MLC",
    label: "SmolLM2 - 135M",
    chatSizeGb: "0.26",
    embedSizeGb: EMBED_SIZE_GB,
    totalSizeGb: "0.39",
    contextWindow: 4096,
    description: "Good for testing",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    label: "Llama 3.2 - 1B",
    chatSizeGb: "0.78",
    embedSizeGb: EMBED_SIZE_GB,
    totalSizeGb: "0.91",
    contextWindow: 4096,
    description: "Good for short notes.",
  },
  {
    id: "gemma-2-2b-it-q4f32_1-MLC",
    label: "Gemma 2 - 2B",
    chatSizeGb: "1.44",
    embedSizeGb: EMBED_SIZE_GB,
    totalSizeGb: "1.57",
    contextWindow: 4096,
    description: "Results with better interpretation",
  },
];

export const DEFAULT_MODEL = MODELS[1];

export function findModel(id: string): ModelOption {
  return MODELS.find((m) => m.id === id) ?? DEFAULT_MODEL;
}
