import books from "@/data/bible-books.json";

export type BibleBook = {
  book_id: number;
  book_name: string;
  chapter_count: number;
};

export function getBooks(): BibleBook[] {
  return books as BibleBook[];
}

export function getBookByName(name: string): BibleBook | undefined {
  return getBooks().find((b) => b.book_name === name);
}

export function getChapterNumbers(bookName: string): number[] {
  const book = getBookByName(bookName);
  if (!book) return [];
  return Array.from({ length: book.chapter_count }, (_, i) => i + 1);
}
