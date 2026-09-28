import verses from "@/data/bible-text.json";

export type VerseRecord = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

/** Placeholder verse range when sample text is missing (UI still works). */
export function getVersesInChapter(book: string, chapter: number): number[] {
  const max = book === "시편" && chapter === 119 ? 176 : 30;
  return Array.from({ length: max }, (_, i) => i + 1);
}

export function getVerseText(book: string, chapter: number, verse: number): string | null {
  const found = (verses as VerseRecord[]).find(
    (v) => v.book === book && v.chapter === chapter && v.verse === verse
  );
  return found?.text ?? null;
}

export function getPassageText(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number
): { text: string; missing: boolean } {
  const parts: string[] = [];
  let missing = false;
  for (let v = startVerse; v <= endVerse; v++) {
    const t = getVerseText(book, chapter, v);
    if (!t) {
      missing = true;
      parts.push(`${v}. (본문 데이터 없음 — 샘플 구간만 제공됩니다)`);
    } else {
      parts.push(`${v}. ${t}`);
    }
  }
  return { text: parts.join("\n"), missing };
}

export function formatPassageRef(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number
): string {
  if (startVerse === endVerse) return `${book} ${chapter}:${startVerse}`;
  return `${book} ${chapter}:${startVerse}~${endVerse}`;
}
