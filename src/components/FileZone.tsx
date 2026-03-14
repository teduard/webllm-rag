import { useRef, useState } from "react";
import type { IndexProgress } from "../types";
import s from "./FileZone.module.css";
import { ArrowUpTrayIcon, CheckIcon } from '@heroicons/react/24/outline'

interface SampleFile {
  filename: string;
  label: string;
  description: string;
  mode: "direct" | "rag";  // hint shown to user - actual decision made at runtime
}

const SAMPLES: SampleFile[] = [
  {
    filename: "q3-planning.md",
    label: "Q3 Planning Meeting",
    description: "Short meeting notes",
    mode: "direct",
  },
  {
    filename: "architecture-review.txt",
    label: "Architecture Review",
    description: "Long technical transcript",
    mode: "rag",
  },
];

interface Props {
  indexProgress: IndexProgress | null;
  onFile: (f: File) => void;
}

export function FileZone({ indexProgress, onFile }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<string | null>(null); // which sample is fetching
  const [drag, setDrag] = useState(false);

  const busy = indexProgress !== null
    && indexProgress.stage !== "done"
    && indexProgress.stage !== "error";

  function handle(f: File) {
    if (busy) return;
    onFile(f);
  }

  async function loadSample(sample: SampleFile) {
    if (busy) return;
    setLoading(sample.filename);
    try {
      const url  = `${import.meta.env.BASE_URL}samples/${sample.filename}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch sample: ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: "text/plain" });
      onFile(file);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  const showIdle = !indexProgress
    || indexProgress.stage === "error"
    || indexProgress.stage === "done";

  const modeColor = (mode: "direct" | "rag") =>
    mode === "direct" ? "var(--ok)" : "var(--accent2)";

  return (
    <>
    {/* Sample files */}
      {showIdle && (
        <div className={s.samples}>
          <span className={s.samplesLabel}>Try a sample</span>
          <div className={s.sampleGrid}>
            {SAMPLES.map(sample => (
              <button
                key={sample.filename}
                className={s.sampleCard}
                onClick={() => loadSample(sample)}
                disabled={busy}
              >
                {loading === sample.filename ? (
                  <span className={s.sampleSpinner} />
                ) : (
                  <span
                    className={s.sampleMode}
                    style={{ color: modeColor(sample.mode) }}
                  >
                    / {sample.mode}
                  </span>
                )}
                <span className={s.sampleLabel}>{sample.label}</span>
                <span className={s.sampleDesc}>{sample.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}


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
  
          <ArrowUpTrayIcon className={`${s.heroIcon}`} />
          <span className={s.main}>upload your own file</span>
          <span className={s.hint}>(.txt or .md)</span>
          {indexProgress?.stage === "error" && (
            <span className={s.errMsg}>{indexProgress.error}</span>
          )}
        </>
      ) : indexProgress.stage === "done" ? (
        <>
          <CheckIcon className={`${s.heroIcon}`} />
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
        </>
  );
}
