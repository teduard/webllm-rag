import type { ModelOption } from "../types";

// Curated subset of the WebLLM model registry.
// All are instruction-tuned and work well for RAG Q&A.
// IDs must match exactly what's in the WebLLM registry.
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    label: "Llama 3.2 · 1B",
    sizeGb: "0.8 GB",
    description: "Fastest. Good for simple Q&A on short notes.",
  },
  // {
  //   id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  //   label: "Llama 3.2 · 3B",
  //   sizeGb: "1.9 GB",
  //   description: "Best balance of speed and quality. Recommended.",
  // },
  // {
  //   id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
  //   label: "Phi 3.5 Mini",
  //   sizeGb: "2.2 GB",
  //   description: "Microsoft's compact model. Strong instruction following.",
  // },
  // {
  //   id: "gemma-2-2b-it-q4f16_1-MLC",
  //   label: "Gemma 2 · 2B",
  //   sizeGb: "1.5 GB",
  //   description: "Google's efficient small model. Fast on modern GPUs.",
  // },
  // {
  //   id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
  //   label: "Mistral 7B",
  //   sizeGb: "4.1 GB",
  //   description: "Highest quality. Requires a capable GPU (6GB+ VRAM).",
  // },
];

export const DEFAULT_MODEL_ID = AVAILABLE_MODELS[0].id; // Llama 3.2 3B
