import { useState, useEffect, useCallback, useRef } from "react";
import type { Message, NoteFile, Conversation } from "../types";
import {
  loadChunks, getOrCreateConversation, persistMessages,
} from "../lib/db";
import { loadIndex } from "../lib/retrieval";
import { embedOne } from "../lib/embedder";
import { retrieve, buildContext } from "../lib/retrieval";
import { streamChat, buildSystemPrompt } from "../lib/llm";

export function useChat(activeNote: NoteFile | null) {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const convoRef                    = useRef<Conversation | null>(null);

  // Load chunks into vector index + restore conversation when note changes
  useEffect(() => {
    if (!activeNote?.id) {
      setMessages([]);
      convoRef.current = null;
      return;
    }

    (async () => {
      const chunks = await loadChunks(activeNote.id!);
      loadIndex(chunks);
      const convo = await getOrCreateConversation(activeNote.id!);
      convoRef.current = convo;
      setMessages(convo.messages);
    })();
  }, [activeNote?.id]);

  const sendMessage = useCallback(async (text: string) => {
    if (!activeNote || isThinking || !convoRef.current) return;

    const userMsg: Message = { role: "user", text, createdAt: Date.now() };
    const nextMessages     = [...messages, userMsg];
    setMessages(nextMessages);
    setIsThinking(true);

    // Placeholder for streaming
    const assistantMsg: Message = { role: "assistant", text: "", createdAt: Date.now() };
    setMessages([...nextMessages, assistantMsg]);

    try {
      const qVec     = await embedOne(text);
      const relevant = retrieve(qVec, 5);
      const context  = buildContext(relevant);
      const prompt   = buildSystemPrompt(context, activeNote.name);

      console.log("prompt = ", prompt)

      let fullText = "";
      await streamChat(prompt, text, (token) => {
        fullText += token;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, text: fullText };
          return updated;
        });
      });

      const finalMessages = [
        ...nextMessages,
        { ...assistantMsg, text: fullText },
      ];
      setMessages(finalMessages);
      await persistMessages(convoRef.current.id!, finalMessages);
    } catch (e: unknown) {
      const errMsg = { ...assistantMsg, text: `Error: ${String(e)}` };
      const finalMessages = [...nextMessages, errMsg];
      setMessages(finalMessages);
      await persistMessages(convoRef.current.id!, finalMessages);
    } finally {
      setIsThinking(false);
    }
  }, [activeNote, isThinking, messages]);

  const clearConversation = useCallback(async () => {
    if (!convoRef.current?.id) return;
    setMessages([]);
    await persistMessages(convoRef.current.id, []);
  }, []);

  return { messages, isThinking, sendMessage, clearConversation };
}
