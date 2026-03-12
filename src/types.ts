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

// How the current file is being answered
export type InferenceMode = "direct" | "rag";

export interface FileState {
  name: string;
  content: string;
  tokenCount: number;
  mode: InferenceMode;
  // RAG-specific - null when mode === "direct"
  chunks: EmbeddedChunk[] | null;
}

export interface EmbeddedChunk {
  text: string;
  embedding: number[];
}

export type AppStage =
  | "idle"          // no model loaded yet
  | "loading-model" // downloading / initialising
  | "ready"         // model ready, no file loaded
  | "indexing"      // file uploaded, embedding in progress
  | "chat";         // file ready, conversation active

export type ModelLoadStatus =
  | { stage: "idle" }
  | { stage: "loading"; progress: number; text: string }
  | { stage: "ready"; modelId: string }
  | { stage: "error"; message: string };

export type IndexStage =
  | "chunking"
  | "embedding"
  | "done"
  | "error";

export interface IndexProgress {
  stage: IndexStage;
  done?: number;
  total?: number;
  error?: string;
}
