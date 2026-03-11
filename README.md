# ask your notes

Chat with your meeting notes. Runs entirely in your browser — no server, no API key, nothing leaves your machine.

Built with WebLLM (WebGPU), transformers.js, Dexie/IndexedDB, React + TypeScript + Vite.

## Stack

| Concern | Library |
|---|---|
| LLM inference | `@mlc-ai/web-llm` — runs on WebGPU |
| Embeddings | `@xenova/transformers` — all-MiniLM-L6-v2, CPU/WASM |
| Persistence | `dexie` — IndexedDB for notes, embeddings, conversations |
| Markdown render | `react-markdown` |

## Run locally

```bash
npm install
npm run dev
```

Requires Chrome 113+ or Edge 113+ (WebGPU).

## Deploy to GitHub Pages

```bash
# 1. Set base in vite.config.ts:
#    base: "/ask-your-notes/"

npm run build
# Push dist/ to your gh-pages branch
```

## Available models

| Model | Size | Notes |
|---|---|---|
| Llama 3.2 1B | 0.8 GB | Fastest |
| Llama 3.2 3B | 1.9 GB | Recommended |
| Phi 3.5 Mini | 2.2 GB | Strong instruction following |
| Gemma 2 2B | 1.5 GB | Fast on modern GPUs |
| Mistral 7B | 4.1 GB | Highest quality, needs 6GB+ VRAM |

Models are downloaded once and cached in browser Cache Storage.

## ⚠️ Required HTTP headers

ONNX Runtime (used by the embedder) needs `SharedArrayBuffer`, which requires
these two headers to be set by the server:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Vite's dev server sets them automatically via `vite.config.ts`.

**GitHub Pages** does not support custom headers — use **Cloudflare Pages** or
**Netlify** instead (both respect the `public/_headers` file included in this repo).

For Netlify/Cloudflare Pages: the `public/_headers` file handles this automatically.
