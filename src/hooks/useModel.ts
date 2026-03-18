import { useState, useCallback } from "react";
import type { ModelLoadStatus } from "../types";
import { loadModels } from "../lib/llm";
import { DEFAULT_MODEL } from "../lib/models";

export function useModel() {
  const [modelId, setModelId] = useState(DEFAULT_MODEL.id);
  const [status, setStatus] = useState<ModelLoadStatus>({ stage: "idle" });

  const load = useCallback(
    async (id?: string) => {
      const target = id ?? modelId;
      if (id) setModelId(id);
      await loadModels(target, setStatus);
    },
    [modelId],
  );

  return { modelId, setModelId, status, load };
}
