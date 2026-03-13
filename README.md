# ask your notes

Chat with your meeting notes using a large language model that runs
entirely in your browser. No server. No API key. Your notes never
leave your machine.

---

## How it works

### Adaptive inference

The app measures the token length of your file against the selected
model's context window before answering any question. Based on this:

**Direct context** - if the file fits within the context window, its
full content is passed directly to the model. The model reads
everything at once, with no risk of retrieval missing relevant
sections. This is the preferred path and is used whenever possible.

**RAG fallback** - if the file exceeds the context window, the app
falls back to a retrieval-augmented generation pipeline. The file is
split into semantically coherent chunks, each chunk is embedded using
a dedicated embedding model (snowflake-arctic-embed-s, running on
WebGPU), and at query time the top-5 most similar chunks are
retrieved using cosine similarity and injected into the prompt.

The active mode is shown in the UI as a live indicator - you can see
exactly which path is being used and how much of the context window
your file occupies.

### In-browser LLM inference

Both the chat model and the embedding model run on your GPU via
WebGPU using [WebLLM](https://github.com/mlc-ai/web-llm). No Python
backend, no Node.js server, no external API. The full inference
pipeline runs inside a browser tab.

Models are downloaded once (~1–4 GB depending on selection) and
cached in browser Cache Storage. Subsequent loads are instant.

### Token counting

File content is tokenized using the selected model's own tokenizer
before any question is asked. This gives an exact token count for
that specific model's vocabulary, which determines whether direct
context or RAG is used.

### Persistence

Notes, embeddings, and conversation history are stored in IndexedDB
via [Dexie.js](https://dexie.org/). Refreshing the page restores
everything - previously indexed notes skip re-embedding, and chat
history is preserved per note.

---

## Stack

| Concern | Library |
|---|---|
| LLM inference + embeddings | `@mlc-ai/web-llm` (WebGPU) |
| Persistence | `dexie` (IndexedDB) |
| UI | React + TypeScript + Vite |
| Styling | CSS Modules |

---

## Models

| Model | Total size | Context window |
|---|---|---|
| Llama 3.2 - 1B | 0.91 GB | 4,096 tokens |
| Llama 3.2 - 3B | 2.0 GB  | 8,192 tokens |
| Phi 3.5 Mini   | 2.3 GB  | 4,096 tokens |
| Gemma 2 - 2B   | 1.57 GB | 8,192 tokens |
| Mistral 7B     | 4.2 GB  | 32,768 tokens |

Each total includes the shared embedding model (snowflake-arctic-embed-s, ~130 MB).
Mistral 7B's 32K context means most meeting notes never trigger RAG.

---

## Requirements

- Chrome 113+ or Edge 113+ (WebGPU required)
- GPU with sufficient VRAM for the selected model
- ~1–4 GB free disk space for model cache

---

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Fully static - deploy to any static host (Netlify, Cloudflare Pages,
Vercel). No special server configuration required.

GitHub Pages is not recommended as it does not allow controlling
response headers (required by some WebGPU contexts).
