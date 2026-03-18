const MAX_CHARS = 1200;
const MIN_CHARS = 10;
const OVERLAP = 150;
const MAX_FILE_CHARS = 500000;

export interface Chunk {
  text: string;
  index: number;
}

export function chunkDocument(content: string, filename: string): Chunk[] {
  const isMarkdown = filename.endsWith(".md");
  const normalised = content
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_FILE_CHARS);

  if (!normalised) return [];

  const sections = isMarkdown
    ? splitByHeadings(normalised)
    : splitByParagraphs(normalised);

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
      for (const s of splitByCharLimit(trimmed)) {
        chunks.push({ text: s, index: chunks.length });
      }
    }
  }

  if (chunks.length === 0 && normalised.length >= MIN_CHARS) {
    chunks.push({ text: normalised, index: 0 });
  }

  return chunks;
}

function splitByHeadings(text: string): string[] {
  const lines = text.split("\n");
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isHeading = /^#{1,4}\s/.test(line);
    const isDoubleBlank =
      line.trim() === "" && current[current.length - 1]?.trim() === "";

    if ((isHeading || isDoubleBlank) && current.length > 0) {
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

function splitByParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitByCharLimit(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    let end = Math.min(i + MAX_CHARS, text.length);
    if (end < text.length) {
      const snap = text.lastIndexOf(" ", end);
      if (snap > i) end = snap;
    }
    const chunk = text.slice(i, end).trim();
    if (chunk.length >= MIN_CHARS) chunks.push(chunk);

    const next = end - OVERLAP;
    i = next > i ? next : end;
  }

  return chunks;
}
