import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@mlc-ai/web-llm"],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          webllm: ["@mlc-ai/web-llm"],
        },
      },
    },
  },
  base: "/webllm-rag/",
});
