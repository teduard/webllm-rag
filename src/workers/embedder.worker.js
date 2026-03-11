import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;

// Singleton pattern — only load the model once
class EmbedderPipeline {
  static instance = null;

  static async getInstance(progress_callback = null) {
    this.instance ??= pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      { progress_callback, quantized: true }
    );
    return this.instance;
  }
}

self.addEventListener("message", async (e) => {
  const { type, texts, id } = e.data;
  if (type !== "embed") return;

  try {
    const pipe = await EmbedderPipeline.getInstance((x) => {
      self.postMessage({ type: "progress", ...x });
    });

    const allEmbeddings = [];
    const BATCH = 32;
    for (let i = 0; i < texts.length; i += BATCH) {
      const batch = texts.slice(i, i + BATCH);
      const output = await pipe(batch, { pooling: "mean", normalize: true });
      allEmbeddings.push(...output.tolist());
    }

    self.postMessage({ type: "result", embeddings: allEmbeddings, id });
  } catch (err) {
    self.postMessage({ type: "error", message: String(err), id });
  }
});

// Signal ready after first successful model load
EmbedderPipeline.getInstance().then(() => {
  self.postMessage({ type: "ready" });
}).catch((err) => {
  self.postMessage({ type: "error", message: String(err), id: -1 });
});
