// useSession owns the entire app state for one file session.
// No DB - everything lives in React state. Cleared when a new file is loaded.

import { useState, useCallback } from "react";
import type { FileState, Message, IndexProgress } from "../types";
import { chunkDocument } from "../lib/chunker";
import { embed, embedOne, decideMode, streamChat, directPrompt, ragPrompt, getModelId } from "../lib/llm";
import { retrieve, buildContext } from "../lib/retrieval";

export function useSession() {
  const [file, setFile]           = useState<FileState | null>(null);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [isThinking, setThinking] = useState(false);
  const [indexProgress, setIndex] = useState<IndexProgress | null>(null);

  // ── Load file ───────────────────────────────────────────────────────────
  const loadFile = useCallback(async (f: File) => {
    const modelId = getModelId();
    if (!modelId) throw new Error("Load a model first");

    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "txt" && ext !== "md") {
      throw new Error("Only .txt and .md files are supported");
    }

    // Reset session
    setFile(null);
    setMessages([]);
    setIndex({ stage: "chunking" });

    try {
      const content = await f.text();

      // Decide direct vs RAG before chunking
      const { tokenCount, mode, usagePct } = await decideMode(content, modelId);

      let chunks = null;

      if (mode === "rag") {
        // Chunk
        setIndex({ stage: "chunking" });
        const rawChunks = chunkDocument(content, f.name);

        // Embed
        setIndex({ stage: "embedding", done: 0, total: rawChunks.length });
        const texts      = rawChunks.map(c => c.text);
        const embeddings = await embed(texts);
        setIndex({ stage: "embedding", done: rawChunks.length, total: rawChunks.length });

        chunks = rawChunks.map((c, i) => ({
          text:      c.text,
          embedding: embeddings[i],
        }));
      }

      setFile({ name: f.name, content, tokenCount, mode, chunks });
      setIndex({ stage: "done" });
    } catch (err) {
      setIndex({ stage: "error", error: String(err) });
    }
  }, []);

  // ── Send message ────────────────────────────────────────────────────────
  const send = useCallback(async (text: string) => {
    if (!file || isThinking) return;

    const userMsg: Message    = { role: "user",      text };
    const assistantMsg: Message = { role: "assistant", text: "" };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setThinking(true);

    try {
      let system: string;

      if (file.mode === "direct") {
        system = directPrompt(file.content, file.name);
        console.log("Using direct mode prompt, with system:", system);
      } else {
        const qVec    = await embedOne(text);
        const hits    = retrieve(file.chunks!, qVec);
        const context = buildContext(hits);
        system        = ragPrompt(context, file.name);
        console.log("Using RAG mode prompt with system:", system);
      }

      let fullText = "";
      await streamChat(system, text, token => {
        fullText += token;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", text: fullText };
          return next;
        });
      });
    } catch (err) {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", text: `Error: ${String(err)}` };
        return next;
      });
    } finally {
      setThinking(false);
    }
  }, [file, isThinking]);

  const reset = useCallback(() => {
    setFile(null);
    setMessages([]);
    setIndex(null);
  }, []);

  return { file, messages, isThinking, indexProgress, loadFile, send, reset };
}
