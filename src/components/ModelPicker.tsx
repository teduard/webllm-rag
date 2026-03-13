import { useRef } from "react";
import type { ModelLoadStatus } from "../types";
import { MODELS } from "../lib/models";
import s from "./ModelPicker.module.css";
import { ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface Props {
  selectedId: string;
  status: ModelLoadStatus;
  onSelect: (id: string) => void;
  onLoad: () => void;
}

export function ModelPicker({ selectedId, status, onSelect, onLoad }: Props) {
  const isLoading = status.stage === "loading";
  const isReady   = status.stage === "ready";
  const pct       = isLoading ? Math.round((status as any).progress * 100) : 0;
  const txt       = isLoading ? (status as any).text as string : "";

  return (
    <div className={s.wrap}>
      <div className={s.heading}>
        <h1 className={s.title}>Select Model</h1>
       
      </div>

      <div className={s.section}>
        <div className={s.grid}>
          {MODELS.map(m => (
            <button
              key={m.id}
              className={`${s.card} ${m.id === selectedId ? s.active : ""}`}
              onClick={() => onSelect(m.id)}
              disabled={isLoading}
            >
              <div className={s.cardRow}>
                <span className={s.cardName}>{m.label}</span>
                <span className={s.cardSize}>{m.totalSizeGb} GB</span>
              </div>
              <span className={s.cardCtx}>{m.contextWindow.toLocaleString()} token context</span>
              <span className={s.cardDesc}>{m.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.section}>
        <span className={s.label}>Load Model</span>

        {isLoading ? (
          <div className={s.progress}>
            <div className={s.track}><div className={s.bar} style={{ width: `${pct}%` }} /></div>
            <span className={s.pct}>{pct}%</span>
            <span className={s.ptxt}>{txt}</span>
          </div>
        ) : (
          <button className={s.loadBtn} onClick={onLoad}>
            {isReady ? 
            <span>Reload <ArrowPathIcon className={`${s.heroIcon}`}/></span>
            :
            <span>Load <ArrowRightIcon className={`${s.heroIcon}`}/></span>
            }
          </button>
        )}

        {status.stage === "error" && (
          <p className={s.err}>{(status as any).message}</p>
        )}
      </div>

      <p className={s.note}>
        Models are cached after first download<br/>
        Specified size includes the embed model (0.13GB)
      </p>
    </div>
  );
}
