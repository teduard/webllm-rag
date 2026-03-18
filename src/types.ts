export interface ModelOption {
  id: string;
  label: string;
  chatSizeGb: string;
  embedSizeGb: string;
  totalSizeGb: string;
  contextWindow: number;
  description: string;
}

export interface Message {
  role: "user" | "assistant";
  text: string;
}

export type InferenceMode = "direct" | "rag";

export interface EmbeddedChunk {
  text: string;
  embedding: number[];
}

export interface ScoredChunk {
  text: string;
  embedding: number[];
  score: number;
  index: number;
}

export interface FileState {
  name: string;
  content: string;
  tokenCount: number;
  contextWindow: number;
  mode: InferenceMode;
  chunks: EmbeddedChunk[] | null;
}

export type ModelLoadStatus =
  | { stage: "idle" }
  | { stage: "loading"; progress: number; text: string }
  | { stage: "ready"; modelId: string }
  | { stage: "error"; message: string };

export type IndexStage = "chunking" | "embedding" | "done" | "error";

export interface IndexProgress {
  stage: IndexStage;
  done?: number;
  total?: number;
  error?: string;
}
