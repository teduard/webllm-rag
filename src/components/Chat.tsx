import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message, FileState } from "../types";
import s from "./Chat.module.css";

interface Props {
  file: FileState;
  messages: Message[];
  isThinking: boolean;
  onSend: (text: string) => void;
}

function TokenBar({ file }: { file: FileState }) {
  const pct = Math.min(
    100,
    Math.round(
      (file.tokenCount / (file.tokenCount / (file.mode === "direct" ? 1 : 1))) *
        100,
    ),
  );
  const isDirect = file.mode === "direct";
  // Compute real usage against context - tokenCount is raw file tokens
  const color = isDirect ? "var(--ok)" : "var(--accent2)";

  return (
    <div className={s.tokenBar}>
      <span className={s.fileName}>{file.name}</span>
      <span className={s.tokenCount}>
        {file.tokenCount.toLocaleString()} tokens
      </span>
      <span className={s.modePill} style={{ color }}>
        {isDirect ? "● direct" : "● rag"}
      </span>
      <button className={s.newFile} onClick={() => {}}>
        × new file
      </button>
    </div>
  );
}

export function Chat({ file, messages, isThinking, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className={s.panel}>
      {/* Token / mode bar */}
      <div className={s.topBar}>
        <div className={s.fileInfo}>
          <span className={s.fileName}>{file.name}</span>
        </div>
      </div>

      {/* Messages */}
      <div className={s.messages}>
        {messages.length === 0 && (
          <div className={s.empty}>
            <p className={s.emptyTitle}>ready.</p>
            <p className={s.emptySub}>
              {file.mode === "direct"
                ? "Full file in context - ask anything."
                : `Large file - answering from top excerpts.`}
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`${s.bubble} ${m.role === "user" ? s.user : s.assistant}`}
          >
            <span className={s.role}>{m.role === "user" ? "you" : "ai"}</span>
            {m.role === "assistant" ? (
              <div className={s.md}>
                {m.text ? (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                ) : (
                  <span className={s.cursor} />
                )}
              </div>
            ) : (
              <p className={s.userText}>{m.text}</p>
            )}
          </div>
        ))}

        {isThinking && messages[messages.length - 1]?.role !== "assistant" && (
          <div className={`${s.bubble} ${s.assistant}`}>
            <span className={s.role}>ai</span>
            <span className={s.cursor} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={s.inputRow}>
        <textarea
          ref={textareaRef}
          className={s.textarea}
          value={draft}
          placeholder="ask a question"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          disabled={isThinking}
          rows={1}
        />
        <button
          className={s.sendBtn}
          onClick={submit}
          disabled={isThinking || !draft.trim()}
        >
          ↵
        </button>
      </div>
    </div>
  );
}
