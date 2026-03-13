import { useCallback } from "react";
import { useModel } from "./hooks/useModel";
import { useSession } from "./hooks/useSession";
import { ModelPicker } from "./components/ModelPicker";
import { FileZone } from "./components/FileZone";
import { Chat } from "./components/Chat";
import { Sidebar } from "./components/Sidebar";
import { RagInternals } from "./components/RagInternals";
import s from "./App.module.css";

export default function App() {
  const { modelId, setModelId, status, load } = useModel();
  const {
    file,
    messages,
    isThinking,
    indexProgress,
    lastChunks,
    lastPrompt,
    loadFile,
    send,
    reset,
  } = useSession();

  const modelReady = status.stage === "ready";
  const fileReady = file !== null && indexProgress?.stage === "done";

  const handleFile = useCallback(
    async (f: File) => {
      try {
        await loadFile(f);
      } catch (e) {
        console.error(e);
      }
    },
    [loadFile],
  );

  return (
    <div className={s.app}>
      <Sidebar
        notes={[]}
        activeNoteId={null}
        indexStatus={0}
        modelReady={modelReady}
        onSelect={() => {}}
        onUpload={() => {}}
        onDelete={() => {}}
      >
        {/* Step 1 — Model */}
        <div className={s.center}>
          <div className={s.fileWrap}>
            <div className={s.fileHeader}>
              <h1 className={s.title}>1 - Configure model</h1>
            </div>
            <ModelPicker
              selectedId={modelId}
              status={status}
              onSelect={setModelId}
              onLoad={() => load()}
            />
          </div>
        </div>

        <hr className={s.divider} />

        {/* Step 2 — File */}
        <div className={s.center}>
          <div className={s.fileWrap}>
            <div className={s.fileHeader}>
              <h1 className={s.title}>2 - Upload file</h1>
              <button className={s.modelBtn} onClick={reset}>
                Clear File
              </button>
            </div>

            {status.stage === "ready" ? (
            <FileZone indexProgress={indexProgress} onFile={handleFile} />
            ): (
              <span className={s.emptyText}>
                Load a model to enable file upload.
              </span>
            )}
          </div>
        </div>

        <hr className={s.divider} />

        {/* Step 3 — RAG internals */}
        <div className={s.center}>
          <div className={s.fileWrap}>
            <div className={s.fileHeader}>
              <h1 className={s.title}>3 - RAG internals</h1>
            </div>
            <RagInternals
              file={file}
              lastChunks={lastChunks}
              lastPrompt={lastPrompt}
            />
          </div>
        </div>

      </Sidebar>

      {file && fileReady && (
        <Chat
          file={file}
          messages={messages}
          isThinking={isThinking}
          onSend={send}
        />
      )}
    </div>
  );
}
