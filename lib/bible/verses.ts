import verses from "@/data/bible-text.json";
import { getVersesInChapter } from "@/lib/bible/getVerses";

export type VerseRecord = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export function getAvailableVersesForChapter(book: string, chapter: number): number[] {
  const list = (verses as VerseRecord[]).filter((v) => v.book === book && v.chapter === chapter);
  if (list.length > 0) {
    return list.map((v) => v.verse).sort((a, b) => a - b);
  }
  return getVersesInChapter(book, chapter);
}
