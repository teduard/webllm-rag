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

// Chunk with its retrieval score - used in RagInternals
export interface ScoredChunk {
  text: string;
  embedding: number[];
  score: number;
  index: number; // position in the original chunk array
}

export interface FileState {
  name: string;
  content: string;
  tokenCount: number;
  contextWindow: number; // the model's context window at index time
  mode: InferenceMode;
  chunks: EmbeddedChunk[] | null;
}

export type AppStage = "idle" | "loading-model" | "ready" | "indexing" | "chat";

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
