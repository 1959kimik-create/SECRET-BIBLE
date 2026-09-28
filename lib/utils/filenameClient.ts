const INVALID = /[\\/:*?"<>|]/g;

export function sanitizeFilename(name: string): string {
  return name.replace(INVALID, "").trim() || "video";
}

export function buildDefaultFilename(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number
): string {
  return sanitizeFilename(`${book}_${chapter}_${startVerse}-${endVerse}.mp4`);
}
