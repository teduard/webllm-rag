import { useState, useCallback } from "react";
import type { ModelLoadStatus } from "../types";
import { loadModels } from "../lib/llm";
import { DEFAULT_MODEL_ID } from "../lib/models";

export function useModel() {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [status, setStatus] = useState<ModelLoadStatus>({ stage: "idle" });

  const load = useCallback(async (modelId?: string) => {
    const id = modelId ?? selectedModelId;
    if (modelId) setSelectedModelId(modelId);
    await loadModels(id, setStatus);
  }, [selectedModelId]);

  return { selectedModelId, setSelectedModelId, status, load };
}
