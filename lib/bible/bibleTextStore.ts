import books from "@/data/bible-books.json";

export type StoredVerse = {
  chapter: number;
  verse: number;
  text: string;
};

type BookPayload = {
  book_id: number;
  book_name: string;
  verses: StoredVerse[];
};

const byBookName = new Map<string, StoredVerse[]>();
const inFlight = new Map<string, Promise<boolean>>();

function bookIdForName(bookName: string): number | null {
  const found = books.find((b) => b.book_name === bookName);
  return found?.book_id ?? null;
}

export function isBookTextLoaded(bookName: string): boolean {
  return byBookName.has(bookName);
}

export function clearBookTextCache(): void {
  byBookName.clear();
  inFlight.clear();
}

/** Loads one book's verses from the local API (bundled JSON on disk). */
export async function ensureBookTextLoaded(bookName: string): Promise<boolean> {
  if (!bookName.trim()) return false;
  if (byBookName.has(bookName)) return true;

  const existing = inFlight.get(bookName);
  if (existing) return existing;

  const bookId = bookIdForName(bookName);
  if (!bookId) return false;

  const promise = (async () => {
    try {
      const res = await fetch(`/api/bible/book/${bookId}`);
      if (!res.ok) return false;
      const data = (await res.json()) as BookPayload;
      if (!Array.isArray(data.verses)) return false;
      byBookName.set(bookName, data.verses);
      return true;
    } catch {
      return false;
    } finally {
      inFlight.delete(bookName);
    }
  })();

  inFlight.set(bookName, promise);
  return promise;
}

export function getLoadedVersesForChapter(bookName: string, chapter: number): StoredVerse[] {
  const all = byBookName.get(bookName);
  if (!all) return [];
  return all.filter((v) => v.chapter === chapter);
}

export function getLoadedVerseText(
  bookName: string,
  chapter: number,
  verse: number
): string | null {
  const found = getLoadedVersesForChapter(bookName, chapter).find((v) => v.verse === verse);
  return found?.text ?? null;
}
