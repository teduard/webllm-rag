import { useRef } from "react";
import type { NoteFile, IndexStatus } from "../types";
import styles from "./Sidebar.module.css";

interface Props {
  notes: NoteFile[];
  activeNoteId: number | null;
  indexStatus: IndexStatus;
  modelReady: boolean;
  onSelect: (note: NoteFile) => void;
  onUpload: (file: File) => void;
  onDelete: (fileId: number) => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  if (m > 0)  return `${m}m ago`;
  return "just now";
}

export function Sidebar({
  notes, activeNoteId, indexStatus, modelReady,
  onSelect, onUpload, onDelete,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const indexing = indexStatus.stage !== "idle" && indexStatus.stage !== "done" && indexStatus.stage !== "error";
  const indexLabel =
    indexStatus.stage === "chunking"   ? "analysing…"  :
    indexStatus.stage === "embedding"  ? "embedding…"  :
    indexStatus.stage === "saving"     ? "saving…"     :
    indexStatus.stage === "done"       ? `✓ ${(indexStatus as any).chunkCount} chunks` :
    indexStatus.stage === "error"      ? "error"        : "";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>ask your notes</span>
        <span className={styles.brandSub}>browser · local · private</span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { onUpload(f); e.target.value = ""; }
        }}
      />

      <button
        className={styles.uploadBtn}
        onClick={() => fileRef.current?.click()}
        disabled={indexing}
      >
        + add note
      </button>

      {indexing && (
        <div className={styles.indexingRow}>
          <span className={styles.spinner} />
          <span className={styles.indexingLabel}>{indexLabel}</span>
        </div>
      )}

      {indexStatus.stage === "done" && (
        <div className={styles.doneRow}>{indexLabel}</div>
      )}

      {indexStatus.stage === "error" && (
        <div className={styles.errorRow}>{(indexStatus as any).message}</div>
      )}

      <div className={styles.noteList}>
        {notes.length === 0 && (
          <p className={styles.empty}>no notes yet</p>
        )}
        {notes.map((n) => {
          const isActive   = n.id === activeNoteId;
          const isIndexing = n.chunkCount === 0;
          const canSelect  = modelReady && !isIndexing;

          return (
            <div
              key={n.id}
              className={`${styles.noteItem} ${isActive ? styles.noteActive : ""} ${!canSelect ? styles.noteDisabled : ""}`}
              onClick={() => canSelect && onSelect(n)}
            >
              <div className={styles.noteTop}>
                <span className={styles.noteName}>{n.name}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); onDelete(n.id!); }}
                  title="Delete note"
                >×</button>
              </div>
              <div className={styles.noteMeta}>
                {isIndexing
                  ? <span className={styles.indexingDot}>indexing…</span>
                  : <><span>{n.chunkCount} chunks</span><span>·</span><span>{relativeTime(n.uploadedAt)}</span></>
                }
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
