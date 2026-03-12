import { useRef } from "react";
//import type { NoteFile, IndexStatus } from "../types";
import styles from "./Sidebar.module.css";

interface Props {
  notes: [];//NoteFile[];
  activeNoteId: number | null;
  indexStatus: number;//IndexStatus;
  modelReady: boolean;
  onSelect: (note: File) => void;
  onUpload: (file: File) => void;
  onDelete: (fileId: number) => void;
  children?: React.ReactNode;
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
  onSelect, onUpload, onDelete, children
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const indexing = true;
  const indexLabel = "testing";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>ask your notes</span>
        <span className={styles.brandSub}>browser / local / private</span>
      </div>

      <div>
        {children}
      </div>

    </aside>
  );
}
