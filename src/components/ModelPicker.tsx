import styles from "./ModelPicker.module.css";
import { AVAILABLE_MODELS } from "../lib/models";
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>select model</span>
        {isReady && (
          <span className={styles.readyBadge}>
            ● ready
          </span>
        )}
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
                <span className={styles.cardSize}>{m.sizeGb}</span>
              </div>
              <span className={styles.cardDesc}>{m.description}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.progressText}>
            {pct}% — {(status as any).text}
          </span>
        </div>
      ) : (
        <button
          className={styles.loadBtn}
          onClick={onLoad}
          disabled={isLoading}
        >
          {isReady ? "↺ reload model" : "load model →"}
        </button>
      )}

      {isError && (
        <p className={styles.error}>{(status as any).message}</p>
      )}

      <p className={styles.note}>
        downloaded once · cached in your browser · nothing leaves your machine
      </p>
    </div>
  );
}
