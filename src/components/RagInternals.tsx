import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message, FileState } from "../types";
import s from "./RagInternals.module.css";

interface Props {
  content: string;
  file: FileState;
  // messages: Message[];
  // isThinking: boolean;
  // onSend: (text: string) => void;
  // onReset: () => void;
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

export function RagInternals({ content, file }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div>
      {file && `${file.tokenCount.toLocaleString()} tokens`} <br/>
      Mode indicator: <br/>
      {file && (file.mode === "direct" ? "/ direct context" : "/ rag retrieval")}
      //explanation
      {!file && "file not selected"}
      

      <br/>
      Retrieved chunk panel:<br/>
      //todo: fill in the chunk panel with actual content
      <br/>

      Check full prompt sent to the model:
      <br/>
      <button>show prompt</button>
      //todo: open a modal with the full prompt, displayed in a scrollabale readonly textarea

    </div>
  );
}
