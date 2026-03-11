import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message, NoteFile, TokenInfo } from "../types";
import styles from "./ChatPanel.module.css";

interface Props {
  note: NoteFile;
  messages: Message[];
  isThinking: boolean;
  tokenInfo: TokenInfo | null;
  onSend: (text: string) => void;
  onClear: () => void;
}

function TokenBar({ info }: { info: TokenInfo }) {
  const pct     = info.usagePct;
  const isDirect = info.mode === "direct";
  const barColor = pct > 90 ? "var(--danger)" : pct > 70 ? "var(--accent2)" : "var(--ok)";

  return (
    <div className={styles.tokenBar}>
      <div className={styles.tokenBarTrack}>
        <div
          className={styles.tokenBarFill}
          style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
        />
      </div>
      <div className={styles.tokenBarMeta}>
        <span className={styles.tokenCount}>
          {info.fileTokens.toLocaleString()} / {info.contextWindow.toLocaleString()} tokens
        </span>
        <span
          className={styles.modeBadge}
          style={{ color: isDirect ? "var(--ok)" : "var(--accent2)" }}
        >
          {isDirect ? "● direct context" : "● rag retrieval"}
        </span>
      </div>
    </div>
  );
}

export function ChatPanel({ note, messages, isThinking, tokenInfo, onSend, onClear }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef         = useRef<HTMLDivElement>(null);
  const textareaRef       = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

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

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.noteIcon}>▤</span>
          <span className={styles.noteName}>{note.name}</span>
        </div>
        <button className={styles.clearBtn} onClick={onClear}>clear</button>
      </header>

      {tokenInfo && <TokenBar info={tokenInfo} />}

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>ready.</p>
            <p className={styles.emptySub}>
              ask anything about <em>{note.name}</em>
              {tokenInfo && (
                <span className={styles.modeHint}>
                  {tokenInfo.mode === "direct"
                    ? " / full file in context"
                    : " / answering via retrieval"}
                </span>
              )}
            </p>
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
          placeholder="ask a question…  ↵ send · shift+↵ newline"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          disabled={isThinking}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={submit}
          disabled={isThinking || !draft.trim()}
        >↵</button>
      </div>
    </div>
  );
}
