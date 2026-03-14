import { useRef, useState } from "react";
import {Modal} from "./Modal";
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

export function Sidebar({
  children
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

 
  const indexing = true;
  const indexLabel = "testing";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Ask Your Notes</span>
        <span className={styles.brandSub}>browser / local / private</span>
        <span className={styles.brandSub}>
          Chat with your .txt or .md file on your GPU<br/>
          Your data stays on your device.
        </span>
        
        <a href="#" onClick={() => setAboutOpen(true)}>About</a> / {" "}
        <a href="#" onClick={() => setDemoOpen(true)}>Watch Demo</a> / {" "}
        <a href="https://github.com/teduard/webllm-rag" target="_blank">GitHub Repo</a>
      </div>

      <div>
        {children}

        {aboutOpen && <Modal title="About project" onClose={() => setAboutOpen(false)}>
          <div>Some text about this project</div>
        </Modal>
        }

        {demoOpen && <Modal title="Application Demo" onClose={() => setDemoOpen(false)}>
          <div>
          The application requires downloading LLM models in your browser, which means 0.39GB minimum<br/>
          The following video shows how LLMs in a browser can be used for direct interrogation on custom content<br/> 
          or using RAG by selecting top excerpts.<br/>

        <video controls width="100%">
            <source src={`${import.meta.env.BASE_URL}/assets/flower.webm`} type="video/webm" />

            {/* <source src="/shared-assets/videos/flower.mp4" type="video/mp4" /> */}

            {/* Download the
            <a href="/shared-assets/videos/flower.webm">WEBM</a>
            or
            <a href="/shared-assets/videos/flower.mp4">MP4</a>
            video. */}
          </video>

          </div>
        </Modal>
      }
      </div>

    </aside>
  );
}
