import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message, NoteFile } from "../types";
import styles from "./ChatPanel.module.css";

interface Props {
  note: NoteFile;
  messages: Message[];
  isThinking: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
}

export function ChatPanel({ note, messages, isThinking, onSend, onClear }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef         = useRef<HTMLDivElement>(null);
  const textareaRef       = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [draft]);

  function submit() {
    const t = draft.trim();
    if (!t || isThinking) return;
    onSend(t);
    setDraft("");
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const canSend = draft.trim().length > 0 && !isThinking;

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.noteIcon}>▤</span>
          <span className={styles.noteName}>{note.name}</span>
          <span className={styles.chunkBadge}>{note.chunkCount} chunks</span>
        </div>
        <button className={styles.clearBtn} onClick={onClear}>clear</button>
      </header>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>ready.</p>
            <p className={styles.emptySub}>ask anything about <em>{note.name}</em></p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.bubble} ${m.role === "user" ? styles.user : styles.assistant}`}
          >
            <span className={styles.role}>{m.role === "user" ? "you" : "ai"}</span>
            {m.role === "assistant" ? (
              <div className={styles.markdown}>
                {m.text
                  ? <ReactMarkdown>{m.text}</ReactMarkdown>
                  : <span className={styles.cursor} />
                }
              </div>
            ) : (
              <p className={styles.userText}>{m.text}</p>
            )}
          </div>
        ))}

        {isThinking && messages[messages.length - 1]?.role !== "assistant" && (
          <div className={`${styles.bubble} ${styles.assistant}`}>
            <span className={styles.role}>ai</span>
            <span className={styles.cursor} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={draft}
          placeholder="ask a question…  ↵ to send · shift+↵ for newline"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          disabled={isThinking}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={submit}
          disabled={!canSend}
        >↵</button>
      </div>
    </div>
  );
}
