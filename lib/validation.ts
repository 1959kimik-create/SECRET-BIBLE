import type { BibleSelection } from "@/components/BibleSelector";
import { getPassageText } from "@/lib/bible/getVerses";

export function validateSelection(sel: BibleSelection): string | null {
  if (!sel.book?.trim()) return "성경을 선택해 주세요.";
  const chapter = Number(sel.chapter);
  const startVerse = Number(sel.startVerse);
  const endVerse = Number(sel.endVerse);
  if (!Number.isFinite(chapter) || chapter < 1) return "장을 선택해 주세요.";
  if (!Number.isFinite(startVerse) || startVerse < 1) return "시작절을 선택해 주세요.";
  if (!Number.isFinite(endVerse) || endVerse < 1) return "종료절을 선택해 주세요.";
  if (endVerse < startVerse) return "종료절은 시작절보다 작을 수 없습니다.";
  return null;
}

export function validateOpinion(opinion: string): string | null {
  if (!opinion.trim()) return "나의 의견을 입력해 주세요.";
  return null;
}

export function validatePassageExists(sel: BibleSelection): string | null {
  const { missing } = getPassageText(sel.book, sel.chapter, sel.startVerse, sel.endVerse);
  if (missing) {
    return "선택한 구간의 본문 데이터가 없습니다. 샘플 구간(창세기 1, 요한복음 3 등)을 이용해 주세요.";
  }
  return null;
}
