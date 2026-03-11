import { useState, useEffect, useCallback } from "react";
import type { NoteFile, IndexStatus } from "../types";
import {
  loadAllNotes, saveNote, deleteNote,
  saveChunks, markNoteIndexed,
} from "../lib/db";
import { chunkDocument } from "../lib/chunker";
import { embed } from "../lib/embedder";

export function useNotes() {
  const [notes, setNotes]             = useState<NoteFile[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [indexStatus, setIndexStatus] = useState<IndexStatus>({ stage: "idle" });

  useEffect(() => {
    loadAllNotes()
      .then(setNotes)
      .finally(() => setIsLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    setNotes(await loadAllNotes());
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<NoteFile | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "txt" && ext !== "md") {
      setIndexStatus({ stage: "error", message: "Only .txt and .md files are supported." });
      return null;
    }

    try {
      const content = await file.text();
      console.log("content = ", content)
      const fileId  = await saveNote(file.name, content);

      setIndexStatus({ stage: "chunking" });
      const chunks = chunkDocument(content, file.name);

      setIndexStatus({ stage: "embedding" });
      const texts      = chunks.map((c) => c.text);
      const embeddings = await embed(texts);

      console.log("embeddings = ", embeddings)

      setIndexStatus({ stage: "saving" });
      await saveChunks(
        fileId,
        chunks.map((c, i) => ({
          text:       c.text,
          embedding:  embeddings[i],
          chunkIndex: i,
        }))
      );
      await markNoteIndexed(fileId, chunks.length);

      await refresh();
      setIndexStatus({ stage: "done", chunkCount: chunks.length });

      // Return the saved note
      const all = await loadAllNotes();
      return all.find((n) => n.id === fileId) ?? null;
    } catch (e: unknown) {
      setIndexStatus({ stage: "error", message: String(e) });
      return null;
    }
  }, [refresh]);

  const removeNote = useCallback(async (fileId: number) => {
    await deleteNote(fileId);
    await refresh();
  }, [refresh]);

  return { notes, isLoading, indexStatus, uploadFile, removeNote };
}
