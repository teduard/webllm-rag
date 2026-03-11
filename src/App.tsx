import { useState, useCallback } from "react";
import type { NoteFile } from "./types";
import { useModel }  from "./hooks/useModel";
import { useNotes }  from "./hooks/useNotes";
import { useChat }   from "./hooks/useChat";
import { ModelPicker } from "./components/ModelPicker";
import { Sidebar }     from "./components/Sidebar";
import { ChatPanel }   from "./components/ChatPanel";
import styles from "./App.module.css";

export default function App() {
  const { selectedModelId, setSelectedModelId, status: modelStatus, load } = useModel();
  const { notes, isLoading, indexStatus, uploadFile, removeNote } = useNotes();
  const [activeNote, setActiveNote] = useState<NoteFile | null>(null);
  const { messages, isThinking, tokenInfo, sendMessage, clearConversation } = useChat(activeNote);
  const [showPicker, setShowPicker] = useState(true);

  const handleUpload = useCallback(async (file: File) => {
    const saved = await uploadFile(file);
    if (saved) setActiveNote(saved);
  }, [uploadFile]);

  const handleDelete = useCallback(async (fileId: number) => {
    await removeNote(fileId);
    if (activeNote?.id === fileId) setActiveNote(null);
  }, [removeNote, activeNote]);

  const handleLoad = useCallback(() => {
    load();
    setShowPicker(false);
  }, [load]);

  const modelReady = modelStatus.stage === "ready";

  return (
    <div className={styles.app}>
      {!isLoading && (
        <Sidebar
          notes={notes}
          activeNoteId={activeNote?.id ?? null}
          indexStatus={indexStatus}
          modelReady={modelReady}
          onSelect={setActiveNote}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
      )}

      <main className={styles.main}>
        {(showPicker || !modelReady) && (
          <div className={styles.pickerWrap}>
            <ModelPicker
              selectedId={selectedModelId}
              status={modelStatus}
              onSelect={setSelectedModelId}
              onLoad={handleLoad}
            />
            {modelReady && (
              <button
                className={styles.dismissBtn}
                onClick={() => setShowPicker(false)}
              >
                → continue to notes
              </button>
            )}
          </div>
        )}

        {!showPicker && modelReady && !activeNote && (
          <div className={styles.landing}>
            <p className={styles.landingTitle}>ready.</p>
            <p className={styles.landingSub}>
              upload a .txt or .md file from the sidebar,<br />
              then ask anything about its contents.
            </p>
            <button
              className={styles.modelToggle}
              onClick={() => setShowPicker(true)}
            >
              ⚙ {selectedModelId.split("-").slice(0, 3).join(" ")}
            </button>
          </div>
        )}

        {!showPicker && modelReady && activeNote && (
          <>
            <button
              className={styles.modelToggle}
              onClick={() => setShowPicker(true)}
              title="Change model"
            >
              ⚙ {selectedModelId.split("-").slice(0, 3).join(" ")}
            </button>
            <ChatPanel
              note={activeNote}
              messages={messages}
              isThinking={isThinking}
              tokenInfo={tokenInfo}
              onSend={sendMessage}
              onClear={clearConversation}
            />
          </>
        )}
      </main>
    </div>
  );
}
