import { useState } from "react";
import type { FileState, ScoredChunk } from "../types";
import { Modal } from "./Modal";
import { PROMPT_RESERVE } from "../lib/models";
import s from "./RagInternals.module.css";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface Props {
  file: FileState | null;
  lastChunks: ScoredChunk[] | null;
  lastPrompt: string | null;
}

// Score bar - visual representation of cosine similarity (0–1)
function ScoreBar({ score }: { score: number }) {
  const pct   = Math.round(score * 100);
  const color = score >= 0.65 ? "var(--ok)"
              : score >= 0.45 ? "var(--accent2)"
              : "var(--ink3)";
  return (
    <div className={s.scoreBar}>
      <div className={s.scoreTrack}>
        <div className={s.scoreFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={s.scoreLabel} style={{ color }}>{score.toFixed(2)}</span>
    </div>
  );
}

// Single retrieved chunk card
function ChunkCard({ chunk, rank }: { chunk: ScoredChunk; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLow = chunk.score < 0.45;
  const preview = chunk.text.length > 160
    ? chunk.text.slice(0, 160).trimEnd() + "…"
    : chunk.text;

  return (
    <div className={`${s.chunkCard} ${isLow ? s.lowConfidence : ""}`}>
      <div className={s.chunkHeader}>
        <span className={s.chunkRank}>[{rank}]</span>
        <span className={s.chunkIndex}>chunk {chunk.index}</span>
        <ScoreBar score={chunk.score} />
        {isLow && <span className={s.lowBadge}>low confidence</span>}
        <button
          className={s.expandBtn}
          onClick={() => setExpanded(v => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      <p className={s.chunkText}>{expanded ? chunk.text : preview}</p>
    </div>
  );
}

export function RagInternals({ file, lastChunks, lastPrompt }: Props) {
  const [promptOpen, setPromptOpen] = useState(false);

  // ── No file loaded ──────────────────────────────────────────────────────
  if (!file) {
    return (
      <div className={s.empty}>
        <span className={s.emptyText}>No file uploaded</span>
      </div>
    );
  }

  const isDirect    = file.mode === "direct";
  const available   = file.contextWindow - PROMPT_RESERVE;
  const usagePct    = Math.min(100, Math.round((file.tokenCount / available) * 100));
  const modeColor   = isDirect ? "var(--ok)" : "var(--accent2)";

  return (
    <div className={s.wrap}>

      {/* ── Mode indicator ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <span className={s.sectionLabel}>inference mode</span>

        <div className={s.modeRow}>
          <span className={s.modePill} style={{ color: modeColor }}>
            {isDirect ? "● direct context" : "● rag retrieval"}
          </span>
        </div>

        {/* Token usage bar */}
        <div className={s.tokenUsage}>
          <div className={s.tokenTrack}>
            <div
              className={s.tokenFill}
              style={{
                width: `${usagePct}%`,
                background: usagePct > 90 ? "var(--danger)"
                          : usagePct > 70 ? "var(--accent2)"
                          : "var(--ok)",
              }}
            />
          </div>
          <span className={s.tokenLabel}>
            {file.tokenCount.toLocaleString()} / {available.toLocaleString()} available tokens
            ({usagePct}%)
          </span>
        </div>

        {/* Plain-English explanation */}
        <p className={s.modeExplanation}>
          {isDirect ? (
            <>
              <strong>{file.name}</strong> fits within the model's{" "}
              {file.contextWindow.toLocaleString()}-token context window
              ({PROMPT_RESERVE.toLocaleString()} reserved for the prompt wrapper and answer).
              The full file is passed to the model on every question.
            </>
          ) : (
            <>
              <strong>{file.name}</strong> exceeds the {available.toLocaleString()} available
              tokens ({file.contextWindow.toLocaleString()}-token window minus{" "}
              {PROMPT_RESERVE.toLocaleString()} reserved). The file was split into chunks and
              embedded - each question retrieves the most relevant excerpts by cosine similarity.
            </>
          )}
        </p>
      </section>

      {/* ── Retrieved chunks ───────────────────────────────────────────── */}
      <section className={s.section}>
        <span className={s.sectionLabel}>retrieved chunks</span>

        {isDirect ? (
          <p className={s.naNote}>
            not applicable - full file is in context.
          </p>
        ) : !lastChunks ? (
          <p className={s.naNote}>
            ask a question to see which chunks are retrieved.
          </p>
        ) : lastChunks.length === 0 ? (
          <p className={s.naNote}>
            no chunks met the minimum similarity threshold (0.35) for this question.
            The model may answer from general knowledge.
          </p>
        ) : (
          <div className={s.chunkList}>
            {lastChunks.map((chunk, i) => (
              <ChunkCard key={i} chunk={chunk} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {/* ── Full prompt ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <span className={s.sectionLabel}>full prompt sent to model</span>

        {!lastPrompt ? (
          <p className={s.naNote}>ask a question to inspect the prompt.</p>
        ) : (
          <button className={s.showPromptBtn} onClick={() => setPromptOpen(true)}>
            View Prompt <ArrowRightIcon className={`${s.heroIcon}`} />
          </button>
        )}
      </section>

      {/* ── Prompt modal ───────────────────────────────────────────────── */}
      {promptOpen && lastPrompt && (
        <Modal title="system prompt" onClose={() => setPromptOpen(false)}>
          <textarea
            className={s.promptTextarea}
            value={lastPrompt}
            readOnly
            spellCheck={false}
            aria-label="Full system prompt"
          />
        </Modal>
      )}
    </div>
  );
}
