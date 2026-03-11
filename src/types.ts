export interface NoteFile {
  id?: number;
  name: string;
  content: string;
  uploadedAt: number;
  chunkCount: number;
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
  sizeGb: string;
  description: string;
}

export type ModelLoadStatus =
  | { stage: "idle" }
  | { stage: "loading"; progress: number; text: string }
  | { stage: "ready"; modelId: string }
  | { stage: "error"; message: string };

export type IndexStatus =
  | { stage: "idle" }
  | { stage: "chunking" }
  | { stage: "embedding" }
  | { stage: "saving" }
  | { stage: "done"; chunkCount: number }
  | { stage: "error"; message: string };
