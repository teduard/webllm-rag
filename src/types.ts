export interface NoteFile {
  id?: number;
  name: string;
  content: string;
  uploadedAt: number;
  chunkCount: number;
  tokenCount?: number;
}

export interface EmbeddedChunk {
  id?: number;
  fileId: number;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface Conversation {
  id?: number;
  fileId: number;
  startedAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface Message {
  role: "user" | "assistant";
  text: string;
  createdAt: number;
}

export interface ScoredChunk extends EmbeddedChunk {
  score: number;
}

export interface ModelOption {
  id: string;
  label: string;
  chatSizeGb: string;
  embedSizeGb: string;
  totalSizeGb: string;
  contextWindow: number;
  description: string;
}

export type InferenceMode = "direct" | "rag";

export interface TokenInfo {
  fileTokens: number;
  contextWindow: number;
  mode: InferenceMode;
  usagePct: number;
}

export type ModelLoadStatus =
  | { stage: "idle" }
  | { stage: "loading"; progress: number; text: string }
  | { stage: "ready"; modelId: string }
  | { stage: "error"; message: string };

export type IndexStatus =
  | { stage: "idle" }
  | { stage: "chunking" }
  | { stage: "embedding"; done: number; total: number }
  | { stage: "saving" }
  | { stage: "done"; chunkCount: number }
  | { stage: "error"; message: string };
