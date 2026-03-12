import { useRef, useState } from "react";
import type { IndexProgress } from "../types";
import s from "./FileZone.module.css";

interface Props {
  indexProgress: IndexProgress | null;
  onFile: (f: File) => void;
}

export function FileZone({ indexProgress, onFile }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const busy = indexProgress !== null
    && indexProgress.stage !== "done"
    && indexProgress.stage !== "error";

  function handle(f: File) {
    if (busy) return;
    onFile(f);
  }

  return (
    <div
      className={`${s.zone} ${drag ? s.drag : ""} ${busy ? s.busy : ""}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) handle(f);
      }}
      onClick={() => !busy && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }}
      />

      {!indexProgress || indexProgress.stage === "error" ? (
        <>
          <span className={s.icon}>⬆</span>
          <span className={s.main}>drop a file or click to browse</span>
          <span className={s.hint}>.txt or .md · any size</span>
          {indexProgress?.stage === "error" && (
            <span className={s.errMsg}>{indexProgress.error}</span>
          )}
        </>
      ) : indexProgress.stage === "done" ? (
        <>
          <span className={s.icon}>✓</span>
          <span className={s.main}>indexed - ask your question<br/> using the chat</span>
        </>
      ) : (
        <>
          <span className={s.spinner} />
          <span className={s.main}>{
            indexProgress.stage === "chunking"   ? "splitting into chunks…" :
            indexProgress.stage === "embedding"  ?
              `embedding ${indexProgress.done ?? 0} / ${indexProgress.total ?? "?"} chunks…` :
              "processing…"
          }</span>
        </>
      )}
    </div>
  );
}
