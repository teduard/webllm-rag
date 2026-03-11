import styles from "./ModelPicker.module.css";
import { AVAILABLE_MODELS, EMBED_MODEL_ID, EMBED_MODEL_SIZE } from "../lib/models";
import type { ModelLoadStatus } from "../types";

interface Props {
  selectedId: string;
  status: ModelLoadStatus;
  onSelect: (id: string) => void;
  onLoad: () => void;
}

export function ModelPicker({ selectedId, status, onSelect, onLoad }: Props) {
  const isLoading = status.stage === "loading";
  const isReady   = status.stage === "ready";
  const isError   = status.stage === "error";
  const pct       = isLoading ? Math.round((status as any).progress * 100) : 0;
  const loadText  = isLoading ? (status as any).text : "";

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>select model</span>
        {isReady && <span className={styles.readyBadge}>● ready</span>}
      </div>

      <div className={styles.grid}>
        {AVAILABLE_MODELS.map((m) => {
          const active = m.id === selectedId;
          return (
            <button
              key={m.id}
              className={`${styles.card} ${active ? styles.active : ""}`}
              onClick={() => onSelect(m.id)}
              disabled={isLoading}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>{m.label}</span>
                <span className={styles.cardSize}>{m.totalSizeGb}</span>
              </div>
              <div className={styles.cardMeta}>
                <span>{m.contextWindow.toLocaleString()} token ctx</span>
              </div>
              <span className={styles.cardDesc}>{m.description}</span>
            </button>
          );
        })}
      </div>

      {/* Embed model note */}
      <div className={styles.embedNote}>
        <span className={styles.embedLabel}>+ embedding model</span>
        <span className={styles.embedId}>{EMBED_MODEL_ID.split("-").slice(0,3).join("-")}</span>
        <span className={styles.embedSize}>{EMBED_MODEL_SIZE}</span>
        <span className={styles.embedDesc}>included in all totals above · cached after first load</span>
      </div>

      {isLoading ? (
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.progressText}>
            {pct}% — {loadText}
          </span>
        </div>
      ) : (
        <button
          className={styles.loadBtn}
          onClick={onLoad}
          disabled={isLoading}
        >
          {isReady ? "↺ reload model" : "load models →"}
        </button>
      )}

      {isError && (
        <p className={styles.error}>{(status as any).message}</p>
      )}

      <p className={styles.note}>
        downloaded once / cached in browser / runs on your GPU / nothing leaves your machine
      </p>
    </div>
  );
}
