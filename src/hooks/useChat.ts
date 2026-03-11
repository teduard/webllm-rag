import { useState, useEffect, useCallback, useRef } from "react";
import type { Message, NoteFile, Conversation, TokenInfo } from "../types";
import {
  loadChunks, getOrCreateConversation, persistMessages,
} from "../lib/db";
import { loadIndex } from "../lib/retrieval";
import { retrieve, buildContext } from "../lib/retrieval";
import {
  embedOne, streamChat,
  buildDirectPrompt, buildRagPrompt,
  getTokenInfo, getLoadedModelId,
} from "../lib/llm";

export function useChat(activeNote: NoteFile | null) {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [tokenInfo, setTokenInfo]   = useState<TokenInfo | null>(null);
  const convoRef                    = useRef<Conversation | null>(null);

  // When note changes: load vector index + conversation + compute token info
  useEffect(() => {
    if (!activeNote?.id) {
      setMessages([]);
      setTokenInfo(null);
      convoRef.current = null;
      return;
    }

    (async () => {
      // Load chunks into in-memory vector index for RAG fallback
      const chunks = await loadChunks(activeNote.id!);
      loadIndex(chunks);

      // Restore conversation
      const convo = await getOrCreateConversation(activeNote.id!);
      convoRef.current = convo;
      setMessages(convo.messages);

      // Compute token info to decide direct vs RAG
      const modelId = getLoadedModelId();
      if (modelId) {
        const info = await getTokenInfo(activeNote.content, modelId);
        setTokenInfo(info);
      }
    })();
  }, [activeNote?.id]);

  const sendMessage = useCallback(async (text: string) => {
    if (!activeNote || isThinking || !convoRef.current) return;

    const userMsg: Message    = { role: "user", text, createdAt: Date.now() };
    const nextMessages        = [...messages, userMsg];
    const assistantMsg: Message = { role: "assistant", text: "", createdAt: Date.now() };

    setMessages([...nextMessages, assistantMsg]);
    setIsThinking(true);

    try {
      let systemPrompt: string;

      if (tokenInfo?.mode === "direct") {
        // ── Direct mode: full file in context ───────────────────────────
        systemPrompt = buildDirectPrompt(activeNote.content, activeNote.name);
      } else {
        // ── RAG mode: retrieve top-k relevant chunks ─────────────────────
        const qVec    = await embedOne(text);
        const chunks  = retrieve(qVec, 5);
        const context = buildContext(chunks);
        systemPrompt  = buildRagPrompt(context, activeNote.name);
      }

      let fullText = "";
      await streamChat(systemPrompt, text, (token) => {
        fullText += token;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, text: fullText };
          return updated;
        });
      });

      const finalMessages = [...nextMessages, { ...assistantMsg, text: fullText }];
      setMessages(finalMessages);
      await persistMessages(convoRef.current.id!, finalMessages);
    } catch (e: unknown) {
      const errText   = `Error: ${String(e)}`;
      const finalMessages = [...nextMessages, { ...assistantMsg, text: errText }];
      setMessages(finalMessages);
      await persistMessages(convoRef.current.id!, finalMessages);
    } finally {
      setIsThinking(false);
    }
  }, [activeNote, isThinking, messages, tokenInfo]);

  const clearConversation = useCallback(async () => {
    if (!convoRef.current?.id) return;
    setMessages([]);
    await persistMessages(convoRef.current.id, []);
  }, []);

  return { messages, isThinking, tokenInfo, sendMessage, clearConversation };
}
