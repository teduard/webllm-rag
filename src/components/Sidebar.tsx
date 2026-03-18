import { useState } from "react";
import { Modal } from "./Modal";
import styles from "./Sidebar.module.css";
import { useSession } from "../hooks/useSession";
import { About } from "./About";

interface Props {
  children?: React.ReactNode;
}

export function Sidebar({ children }: Props) {
  const [canRun, setCanRun] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
    const {
      isMobile,
      canRunWebLLM
    } = useSession();

  return (
    <aside className={`${isMobile ? styles.sidebarMobile : styles.sidebar}`}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Ask Your Notes</span>
        <span className={styles.brandSub}>browser / local / private</span>
        <span className={styles.brandSub}>
          Chat with your .txt or .md file on your GPU
          <br />
          Your data stays on your device.
        </span>
        <a href="#" onClick={() => setAboutOpen(true)}>
          About
        </a>{" "}
        /{" "}
        <a href="#" onClick={() => setDemoOpen(true)}>
          Watch Demo
        </a>{" "}
        /{" "}
        <a href="https://github.com/teduard/webllm-rag" target="_blank">
          GitHub Repo
        </a>
      </div>

      <div>
        {isMobile && <><p className={styles.centerText}>Unavailable on mobile<br/>Please use a computer.</p></>}
        
        {!isMobile && !canRunWebLLM && <><p className={styles.centerText}>You computer does not offer support for WebGPU.</p></>}
        
        {!isMobile && canRunWebLLM && children}

        {aboutOpen && (
          <Modal title="About project" onClose={() => setAboutOpen(false)}>
            <About />
          </Modal>
        )}

        {demoOpen && (
          <Modal title="Application Demo" onClose={() => setDemoOpen(false)}>
            <div>
              The application requires downloading LLM models in your browser,
              which means at least 0.39GB
              <br />
              The following video shows how LLMs in a browser can use custom content:
              <ul>
                <li>to perform direct interrogation if the file size allows it</li>
                <li>to apply RAG by selecting top excerpts.</li>
              </ul>
              <br />
              <video controls width="100%" poster={`${import.meta.env.BASE_URL}/assets/preview.png`}>
                <source
                  src={`${import.meta.env.BASE_URL}/assets/demo.mp4`}
                  type="video/mp4"
                />
              </video>
            </div>
          </Modal>
        )}
      </div>
    </aside>
  );
}
