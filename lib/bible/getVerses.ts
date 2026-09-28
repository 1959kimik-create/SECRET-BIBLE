import {
  getLoadedVerseText,
  isBookTextLoaded,
} from "@/lib/bible/bibleTextStore";

export function getVerseText(book: string, chapter: number, verse: number): string | null {
  if (!isBookTextLoaded(book)) return null;
  return getLoadedVerseText(book, chapter, verse);
}

export function getPassageText(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number
): { text: string; missing: boolean } {
  if (!isBookTextLoaded(book)) {
    return {
      text: "(성경 본문을 불러오는 중이거나, data/bible-text/ 데이터가 없습니다. npm run bible:fetch 실행 후 다시 시도해 주세요.)",
      missing: true,
    };
  }

  const parts: string[] = [];
  let missing = false;
  for (let v = startVerse; v <= endVerse; v++) {
    const t = getVerseText(book, chapter, v);
    if (!t) {
      missing = true;
      parts.push(`${v}. (본문을 찾을 수 없습니다)`);
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
