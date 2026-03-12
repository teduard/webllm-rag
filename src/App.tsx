import { useState, useCallback } from "react";
import { useModel }    from "./hooks/useModel";
import { useSession }  from "./hooks/useSession";
import { ModelPicker } from "./components/ModelPicker";
import { FileZone }    from "./components/FileZone";
import { Chat }        from "./components/Chat";
import s from "./App.module.css";
import { Sidebar } from "./components/Sidebar";
import { RagInternals } from "./components/RagInternals";

export default function App() {
  const { modelId, setModelId, status, load } = useModel();
  const { file, messages, isThinking, indexProgress, loadFile, send, reset } = useSession();

  const modelReady   = status.stage === "ready";
  const fileReady    = file !== null && indexProgress?.stage === "done";
  const showPicker   = !modelReady;
  const showFileZone = modelReady && !fileReady;
  const showChat     = modelReady && fileReady;

  const handleFile = useCallback(async (f: File) => {
    try { await loadFile(f); }
    catch (e) { console.error(e); }
  }, [loadFile]);

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
         
    { /*showPicker &&*/ (
        <div className={s.center}>
          <ModelPicker
            selectedId={modelId}
            status={status}
            onSelect={setModelId}
            onLoad={() => load()}
          />
        </div>
      )}

      <hr/>

      {/*showFileZone && */(
        <div className={s.center}>
          <div className={s.fileWrap}>
            <div className={s.fileHeader}>
              <h1 className={s.title}>2 - Upload file</h1>
              <button className={s.modelBtn} onClick={reset}>
                Clear File
              </button>
            </div>
            <FileZone indexProgress={indexProgress} onFile={handleFile} />
            {/* <p className={s.fileHint}>
              .txt or .md - files that fit in the model's {
                status.stage === "ready" ? "" : ""
              } context window are answered directly - larger files use RAG retrieval
            </p> */}
          </div>
        </div>
      )}

        <hr/>
        <div className={s.center}>
          <div className={s.fileWrap}>
            <div className={s.fileHeader}>
              <h1 className={s.title}>3 - RAG internals</h1>
              {/* <button className={s.modelBtn} onClick={reset}>
                Clear File
              </button> */}
            </div>
            {/* <FileZone indexProgress={indexProgress} onFile={handleFile} />
            <p className={s.fileHint}>
              .txt or .md - files that fit in the model's {
                status.stage === "ready" ? "" : ""
              } context window are answered directly - larger files use RAG retrieval
            </p> */}
            <RagInternals content="test" file={file}/>
          </div>
        </div>

          </Sidebar>
      

     

      {/*showChat &&*/ file &&(
        <Chat
          file={file}
          messages={messages}
          isThinking={isThinking}
          onSend={send}
          onReset={reset}
        />
      )}
    </div>
  );
}
