import {
  getLoadedVersesForChapter,
  isBookTextLoaded,
} from "@/lib/bible/bibleTextStore";

export function getAvailableVersesForChapter(book: string, chapter: number): number[] {
  if (!isBookTextLoaded(book)) return [];
  const list = getLoadedVersesForChapter(book, chapter);
  return list.map((v) => v.verse).sort((a, b) => a - b);
}
