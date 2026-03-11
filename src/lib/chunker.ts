// Splits documents into semantically coherent chunks.
// .md → split on headings (#, ##, ###) and double blank lines
// .txt → split on double blank lines, then single newlines as fallback
// Both: enforce a hard character ceiling with word-boundary snapping.

const MAX_CHARS = 800;
const MIN_CHARS = 10; // low threshold — let the embedder decide what's useful
const OVERLAP = 80;

export interface Chunk {
  text: string;
  index: number;
}

export function chunkDocument(content: string, filename: string): Chunk[] {
  const isMarkdown = filename.endsWith(".md");
  // Hard cap — prevents runaway processing on huge files
  const MAX_FILE_CHARS = 500_000; // ~125K tokens, more than any supported context window
  const normalised = content
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_FILE_CHARS);

  if (!normalised) return [];

  const sections = isMarkdown
    ? splitByHeadings(normalised)
    : splitByParagraphs(normalised);

  // Fallback: if semantic splitting produced nothing (e.g. "data1\ndata2"),
  // split on single newlines, and if that also fails, treat entire file as one chunk
  const effective =
    sections.length > 0
      ? sections
      : normalised
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean).length > 0
        ? normalised
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [normalised];

  const chunks: Chunk[] = [];
  for (const section of effective) {
    const trimmed = section.trim();
    if (trimmed.length < MIN_CHARS) continue;
    if (trimmed.length <= MAX_CHARS) {
      chunks.push({ text: trimmed, index: chunks.length });
    } else {
      const sub = splitByCharLimit(trimmed);
      for (const s of sub) {
        chunks.push({ text: s, index: chunks.length });
      }
    }
  }

  // Final fallback: if still empty, return the whole content as one chunk
  if (chunks.length === 0 && normalised.length >= MIN_CHARS) {
    chunks.push({ text: normalised, index: 0 });
  }

  return chunks;
}

// Split on markdown heading lines (# Title) or double blank lines
function splitByHeadings(text: string): string[] {
  const lines = text.split("\n");
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isHeading = /^#{1,4}\s/.test(line);
    const isBlankAfterBlank =
      line.trim() === "" && current[current.length - 1]?.trim() === "";

    if ((isHeading || isBlankAfterBlank) && current.length > 0) {
      const s = current.join("\n").trim();
      if (s) sections.push(s);
      current = isHeading ? [line] : [];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    const s = current.join("\n").trim();
    if (s) sections.push(s);
  }

  return sections;
}

// Split on double blank lines (paragraphs)
function splitByParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Fixed character window with word-boundary snapping and overlap
function splitByCharLimit(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    let end = Math.min(i + MAX_CHARS, text.length);

    if (end < text.length) {
      const snap = text.lastIndexOf(" ", end);
      if (snap > i) end = snap; // only snap if it moves forward
    }

    const chunk = text.slice(i, end).trim();
    if (chunk.length >= MIN_CHARS) chunks.push(chunk);

    // Always advance by at least 1 character to prevent infinite loop
    const next = end - OVERLAP;
    i = next > i ? next : end;
  }

  return chunks;
}
