"use client";

import { useMemo } from "react";
import { getBooks, getChapterNumbers } from "@/lib/bible/books";
import { getAvailableVersesForChapter } from "@/lib/bible/verses";

export type BibleSelection = {
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

type Props = {
  value: BibleSelection;
  onChange: (next: BibleSelection) => void;
  error?: string | null;
  /** Re-render verse lists after async book text load */
  textLoadTick?: number;
  textLoading?: boolean;
  textReady?: boolean;
};

export function BibleSelector({
  value,
  onChange,
  error,
  textLoadTick = 0,
  textLoading = false,
  textReady = false,
}: Props) {
  const books = getBooks();
  const chapters = value.book ? getChapterNumbers(value.book) : [];
  const verses = useMemo(
    () =>
      value.book && value.chapter && textReady
        ? getAvailableVersesForChapter(value.book, value.chapter)
        : [],
    [value.book, value.chapter, textReady, textLoadTick]
  );

  const update = (partial: Partial<BibleSelection>) => {
    const next = { ...value, ...partial };
    if (partial.book !== undefined) {
      next.chapter = 1;
      if (partial.book) {
        const vList = getAvailableVersesForChapter(partial.book, 1);
        next.startVerse = vList[0] ?? 1;
        next.endVerse = next.startVerse;
      } else {
        next.startVerse = 1;
        next.endVerse = 1;
      }
    }
    if (partial.chapter !== undefined) {
      const vList = getAvailableVersesForChapter(next.book, next.chapter);
      next.startVerse = vList[0] ?? 1;
      next.endVerse = next.startVerse;
    }
    if (partial.startVerse !== undefined) {
      if (next.endVerse < next.startVerse) {
        next.endVerse = next.startVerse;
      }
      const allowed = getAvailableVersesForChapter(next.book, next.chapter).filter(
        (v) => v >= next.startVerse
      );
      if (allowed.length && !allowed.includes(next.endVerse)) {
        next.endVerse = allowed[allowed.length - 1];
      }
    }
    onChange(next);
  };

  return (
    <div id="bible-selector-top" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-2 text-sm text-zinc-400">
        성경
        <select
          id="bible-book-select"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          value={value.book}
          onChange={(e) => update({ book: e.target.value })}
        >
          <option value="">선택</option>
          {books.map((b) => (
            <option key={b.book_id} value={b.book_name}>
              {b.book_name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-zinc-400">
        장
        <select
          id="bible-chapter-select"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          value={value.chapter || ""}
          disabled={!value.book}
          onChange={(e) => update({ chapter: Number(e.target.value) })}
        >
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-zinc-400">
        시작절
        <select
          id="bible-start-verse-select"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          value={value.startVerse || ""}
          disabled={!verses.length}
          onChange={(e) => update({ startVerse: Number(e.target.value) })}
        >
          {verses.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-zinc-400">
        종료절
        <select
          id="bible-end-verse-select"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          value={value.endVerse || ""}
          disabled={!verses.length}
          onChange={(e) => update({ endVerse: Number(e.target.value) })}
        >
          {verses
            .filter((v) => v >= value.startVerse)
            .map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
        </select>
      </label>

      {textLoading ? (
        <p className="sm:col-span-2 lg:col-span-4 text-sm text-zinc-500">성경 본문 불러오는 중…</p>
      ) : null}
      {!textLoading && value.book && !textReady ? (
        <p className="sm:col-span-2 lg:col-span-4 text-sm text-amber-400/90">
          본문 데이터가 없습니다. 프로젝트에서 npm run bible:fetch 를 실행해 주세요.
        </p>
      ) : null}
      {error ? <p className="sm:col-span-2 lg:col-span-4 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
