import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message, FileState } from "../types";
import s from "./Chat.module.css";
import { ArrowTurnDownLeftIcon } from "@heroicons/react/24/outline";

interface Props {
  file: FileState;
  messages: Message[];
  isThinking: boolean;
  onSend: (text: string) => void;
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
      <div className={s.topBar}>
        <div className={s.fileInfo}>
          <span className={s.fileName}>{file.name}</span>
        </div>
      </div>

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
        <button className={s.submitBtn} onClick={submit} disabled={isThinking || !draft.trim()}>
          <ArrowTurnDownLeftIcon className="heroIcon" />
        </button>
      </div>
    </div>
  );
}
