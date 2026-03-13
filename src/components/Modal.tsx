import { useEffect, useRef } from "react";
import s from "./Modal.module.css";
import { XCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close on backdrop click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div className={s.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={s.dialog} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={s.header}>
          <span id="modal-title" className={s.title}>{title}</span>
          <button className={s.closeBtn} onClick={onClose} aria-label="Close">
            <XCircleIcon className={`${s.heroIcon}`} />
          </button>
        </div>
        <div className={s.body}>
          {children}
        </div>
      </div>
    </div>
  );
}
