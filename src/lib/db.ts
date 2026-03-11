import Dexie, { type Table } from "dexie";
import type { NoteFile, EmbeddedChunk, Conversation, Message } from "../types";

class AppDB extends Dexie {
  notes!: Table<NoteFile>;
  chunks!: Table<EmbeddedChunk>;
  conversations!: Table<Conversation>;

  constructor() {
    super("ask-your-notes-v1");
    this.version(1).stores({
      notes:         "++id, uploadedAt",
      chunks:        "++id, fileId, chunkIndex",
      conversations: "++id, fileId, updatedAt",
    });
  }
}

export const db = new AppDB();

export async function saveNote(name: string, content: string): Promise<number> {
  return db.notes.add({ name, content, uploadedAt: Date.now(), chunkCount: 0 });
}

export async function markNoteIndexed(
  fileId: number,
  chunkCount: number,
  tokenCount?: number
) {
  await db.notes.update(fileId, { chunkCount, tokenCount });
}

export async function saveChunks(
  fileId: number,
  chunks: Omit<EmbeddedChunk, "id" | "fileId">[]
) {
  await db.chunks.where("fileId").equals(fileId).delete();
  await db.chunks.bulkAdd(chunks.map((c) => ({ ...c, fileId })));
}

export async function loadChunks(fileId: number): Promise<EmbeddedChunk[]> {
  return db.chunks.where("fileId").equals(fileId).sortBy("chunkIndex");
}

export async function loadAllNotes(): Promise<NoteFile[]> {
  return db.notes.orderBy("uploadedAt").reverse().toArray();
}

export async function deleteNote(fileId: number) {
  await Promise.all([
    db.notes.delete(fileId),
    db.chunks.where("fileId").equals(fileId).delete(),
    db.conversations.where("fileId").equals(fileId).delete(),
  ]);
}

export async function getOrCreateConversation(fileId: number): Promise<Conversation> {
  const existing = await db.conversations.where("fileId").equals(fileId).first();
  if (existing) return existing;
  const id = await db.conversations.add({
    fileId,
    startedAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  });
  return db.conversations.get(id) as Promise<Conversation>;
}

export async function persistMessages(conversationId: number, messages: Message[]) {
  await db.conversations.update(conversationId, {
    messages,
    updatedAt: Date.now(),
  });
}
