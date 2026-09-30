"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BibleSelector, type BibleSelection } from "@/components/BibleSelector";
import { BibleText } from "@/components/BibleText";
import { OpinionInput, readOpinionFromDom } from "@/components/OpinionInput";
import { VideoProgress } from "@/components/VideoProgress";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SaveDialog } from "@/components/SaveDialog";
import { StepIndicator } from "@/components/StepIndicator";
import { FormAlert } from "@/components/FormAlert";
import { getPassageText, formatPassageRef } from "@/lib/bible/getVerses";
import { getAvailableVersesForChapter } from "@/lib/bible/verses";
import { useBibleText } from "@/lib/bible/useBibleText";
import { buildDefaultFilename } from "@/lib/utils/filenameClient";
import {
  validateOpinion,
  validatePassageExists,
  validateSelection,
} from "@/lib/validation";
import {
  DEFAULT_VIDEO_SETTINGS,
  type ContentBlock,
  type VideoProgress as Progress,
} from "@/lib/types";

type AppStep = 1 | 2 | 3 | 4 | 5 | 6;

const initialSelection: BibleSelection = {
  book: "창세기",
  chapter: 1,
  startVerse: 1,
  endVerse: 3,
};

const emptySelection: BibleSelection = {
  book: "",
  chapter: 1,
  startVerse: 1,
  endVerse: 1,
};

function newBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function paintPromptBox(message: string, success: boolean) {
  const el = document.getElementById("prompt-feedback-box");
  if (!el) return;
  el.textContent = message;
  el.className = success
    ? "mb-6 whitespace-pre-line rounded-lg border-2 border-emerald-400 bg-emerald-950/80 px-4 py-3 text-center text-base text-emerald-100"
    : "mb-6 whitespace-pre-line rounded-lg border-2 border-red-400 bg-red-950/60 px-4 py-3 text-center text-base text-red-100";
}

function restoreUiFocusAfterReset() {
  requestAnimationFrame(() => {
    const bookSelect = document.getElementById("bible-book-select");
    if (bookSelect instanceof HTMLElement) {
      bookSelect.focus({ preventScroll: true });
      return;
    }
    if (document.body.tabIndex < 0) document.body.tabIndex = -1;
    document.body.focus();
  });
}

export default function HomePage() {
  const [step, setStep] = useState<AppStep>(1);
  const [selection, setSelection] = useState<BibleSelection>(initialSelection);
  const [opinion, setOpinion] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formWarning, setFormWarning] = useState<string | null>(null);

  const [progress, setProgress] = useState<Progress>({ percent: 0, stepLabel: "준비 중" });
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showExitChoice, setShowExitChoice] = useState(false);
  const [previewAsk, setPreviewAsk] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSavedHint, setLastSavedHint] = useState<string | null>(null);
  const [awaitingNextPick, setAwaitingNextPick] = useState(false);
  const [promptFeedback, setPromptFeedback] = useState<string | null>(null);
  const [promptIsSuccess, setPromptIsSuccess] = useState(false);
  const [selectorKey, setSelectorKey] = useState(0);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const yesHandlerRef = useRef<() => void>(() => {});
  const noHandlerRef = useRef<() => void>(() => {});
  const generationEpochRef = useRef(0);
  const progressUnsubRef = useRef<(() => void) | null>(null);

  const writePrompt = useCallback((message: string, success: boolean) => {
    setPromptFeedback(message);
    setPromptIsSuccess(success);
    paintPromptBox(message, success);
  }, []);

  const bookForTextLoad = selection.book || "";
  const {
    loading: bibleTextLoading,
    ready: bibleTextReady,
    loadTick: bibleTextLoadTick,
  } = useBibleText(bookForTextLoad);

  useEffect(() => {
    if (!bibleTextReady || !selection.book) return;
    const verses = getAvailableVersesForChapter(selection.book, selection.chapter);
    if (!verses.length) return;
    setSelection((prev) => {
      if (prev.book !== selection.book || prev.chapter !== selection.chapter) return prev;
      let startVerse = prev.startVerse;
      let endVerse = prev.endVerse;
      if (!verses.includes(startVerse)) startVerse = verses[0];
      if (!verses.includes(endVerse) || endVerse < startVerse) endVerse = startVerse;
      if (startVerse === prev.startVerse && endVerse === prev.endVerse) return prev;
      return { ...prev, startVerse, endVerse };
    });
  }, [bibleTextReady, bibleTextLoadTick, selection.book, selection.chapter]);

  const reference = useMemo(
    () =>
      selection.book
        ? formatPassageRef(selection.book, selection.chapter, selection.startVerse, selection.endVerse)
        : "",
    [selection]
  );

  const passage = useMemo(
    () =>
      selection.book
        ? getPassageText(selection.book, selection.chapter, selection.startVerse, selection.endVerse)
        : { text: "", missing: false },
    [selection, bibleTextReady, bibleTextLoadTick]
  );

  const resetAll = useCallback(async () => {
    generationEpochRef.current += 1;
    progressUnsubRef.current?.();
    progressUnsubRef.current = null;

    try {
      await window.secretBible?.resetContentBlocks();
    } catch {
      /* ignore */
    }

    setStep(1);
    setSelection(initialSelection);
    setOpinion("");
    setContentBlocks([]);
    setFormError(null);
    setFormWarning(null);
    setProgress({ percent: 0, stepLabel: "준비 중" });
    setGeneratedPath(null);
    setPreviewUrl(null);
    setGenError(null);
    setSaveMessage(null);
    setShowExitChoice(false);
    setPreviewAsk(null);
    setSaving(false);
    setLastSavedHint(null);
    setAwaitingNextPick(false);
    setPromptFeedback(null);
    setPromptIsSuccess(false);
    setResetConfirmOpen(false);
    setSelectorKey((k) => k + 1);

    void window.secretBible?.focusWindow?.();
    restoreUiFocusAfterReset();
  }, []);

  const requestReset = () => setResetConfirmOpen(true);

  const performReset = () => {
    void resetAll();
  };

  const getCurrentOpinion = () => readOpinionFromDom(opinion);

  const tryCommitCurrentBlock = ():
    | { ok: true; block: ContentBlock }
    | { ok: false; message: string } => {
    const selErr = validateSelection(selection);
    if (selErr) return { ok: false, message: selErr };
    if (!bibleTextReady) {
      return { ok: false, message: "성경 본문을 불러오는 중입니다. 잠시 후 다시 시도해 주세요." };
    }
    const opText = getCurrentOpinion();
    const opErr = validateOpinion(opText);
    if (opErr) return { ok: false, message: opErr };
    const { text } = getPassageText(
      selection.book,
      selection.chapter,
      selection.startVerse,
      selection.endVerse
    );
    return {
      ok: true,
      block: {
        id: newBlockId(),
        book: selection.book,
        chapter: selection.chapter,
        startVerse: selection.startVerse,
        endVerse: selection.endVerse,
        bibleText: text,
        opinion: opText,
      },
    };
  };

  const finalizeBlockAndGenerate = () => {
    const result = tryCommitCurrentBlock();
    if (!result.ok) {
      writePrompt(`⚠ ${result.message}`, false);
      setFormError(result.message);
      return;
    }
    const blocks = [...contentBlocks, result.block];
    setContentBlocks(blocks);
    setOpinion("");
    setAwaitingNextPick(false);
    void startGeneration(blocks);
  };

  const handleNextBibleYes = async () => {
    try {
      writePrompt("저장 확인 중…", false);
      const result = tryCommitCurrentBlock();
      if (!result.ok) {
        writePrompt(`⚠ ${result.message}\n위쪽 「나의 의견」 칸을 확인하세요.`, false);
        setFormError(result.message);
        document.getElementById("opinion-textarea")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const { block } = result;
      const label = `${block.book} ${block.chapter}:${block.startVerse}${block.endVerse !== block.startVerse ? `~${block.endVerse}` : ""}`;
      setFormError(null);

      if (window.secretBible?.appendContentBlock) {
        const res = await window.secretBible.appendContentBlock(block);
        if (!res.ok) {
          writePrompt(`⚠ ${res.message ?? "저장 실패"}`, false);
          return;
        }
        setContentBlocks(res.blocks);
      } else {
        setContentBlocks((prev) => [...prev, block]);
      }

      setOpinion("");
      setSelection(emptySelection);
      setSelectorKey((k) => k + 1);
      setAwaitingNextPick(true);
      setLastSavedHint(label);
      writePrompt(
        `✅ ${label} 저장되었습니다!\n맨 위 「성경」→ 요한복음 · 3장 · 16~18절을 고르세요.`,
        true
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      writePrompt(`⚠ 처리 중 오류: ${err instanceof Error ? err.message : String(err)}`, false);
    }
  };

  yesHandlerRef.current = handleNextBibleYes;
  noHandlerRef.current = finalizeBlockAndGenerate;

  const selectorValue = awaitingNextPick ? emptySelection : selection;

  const startGeneration = useCallback(async (blocks: ContentBlock[]) => {
    if (!window.secretBible) {
      setGenError("Electron 환경에서 실행해 주세요. (npm run electron:dev)");
      setStep(4);
      return;
    }

    setStep(4);
    setGenError(null);
    setGeneratedPath(null);
    setPreviewUrl(null);
    setProgress({ percent: 0, stepLabel: "시작" });

    const epoch = generationEpochRef.current;
    progressUnsubRef.current?.();
    const unsubscribe = window.secretBible.onProgress((p) => {
      if (generationEpochRef.current !== epoch) return;
      setProgress(p);
    });
    progressUnsubRef.current = unsubscribe;

    const result = await window.secretBible.generateVideo({
      contentBlocks: blocks,
      videoSettings: DEFAULT_VIDEO_SETTINGS,
    });

    unsubscribe();
    if (progressUnsubRef.current === unsubscribe) {
      progressUnsubRef.current = null;
    }

    if (generationEpochRef.current !== epoch) return;

    if (!result.ok) {
      setGenError(result.message);
      return;
    }

    setGeneratedPath(result.filePath);
    setPreviewUrl(result.previewUrl);
    setStep(5);
    setPreviewAsk(null);
  }, []);

  useEffect(() => {
    if (step !== 5 || !previewAsk || !generatedPath || !window.secretBible?.getVideoPreviewUrl) {
      return;
    }
    const stale =
      !previewUrl ||
      previewUrl.startsWith("file:") ||
      previewUrl.startsWith("secretvideo:") ||
      !previewUrl.includes("/v/");
    if (!stale) return;
    void window.secretBible.getVideoPreviewUrl(generatedPath).then((url) => {
      if (url) setPreviewUrl(url);
    });
  }, [step, previewAsk, generatedPath, previewUrl]);

  useEffect(() => {
    window.__SECRET_BIBLE_REACT_CLICK__ = true;

    const onDocClick = (event: MouseEvent) => {
      const raw = event.target as Node | null;
      const el = (raw?.nodeType === 3 ? raw.parentElement : raw) as Element | null;
      if (!el?.closest) return;
      if (el.closest("#btn-next-bible-yes") || el.closest("#btn-save-and-next")) {
        event.preventDefault();
        event.stopPropagation();
        void yesHandlerRef.current();
      } else if (el.closest("#btn-next-bible-no")) {
        event.preventDefault();
        event.stopPropagation();
        void noHandlerRef.current();
      }
    };
    document.addEventListener("click", onDocClick, true);

    const onBlocks = (event: Event) => {
      const detail = (event as CustomEvent<ContentBlock[]>).detail;
      if (Array.isArray(detail)) setContentBlocks(detail);
    };
    const onGenerate = (event: Event) => {
      const detail = (event as CustomEvent<ContentBlock[]>).detail;
      if (Array.isArray(detail) && detail.length) {
        setContentBlocks(detail);
        void startGeneration(detail);
      }
    };
    const onPrompt = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; success: boolean }>).detail;
      if (detail?.message) {
        setPromptFeedback(detail.message);
        setPromptIsSuccess(!!detail.success);
      }
    };
    const onSavedNext = (event: Event) => {
      const detail = (
        event as CustomEvent<{ blocks: ContentBlock[]; label: string; message: string }>
      ).detail;
      if (!detail?.blocks) return;
      setContentBlocks(detail.blocks);
      setOpinion("");
      setSelection(emptySelection);
      setSelectorKey((k) => k + 1);
      setAwaitingNextPick(true);
      setLastSavedHint(detail.label);
      setFormError(null);
      if (detail.message) {
        setPromptFeedback(detail.message);
        setPromptIsSuccess(true);
      }
    };
    window.addEventListener("secret-bible:blocks-updated", onBlocks);
    window.addEventListener("secret-bible:start-generate", onGenerate);
    window.addEventListener("secret-bible:prompt", onPrompt);
    window.addEventListener("secret-bible:saved-next", onSavedNext);
    void window.secretBible?.getContentBlocks().then((res) => {
      if (res.ok && res.blocks.length) setContentBlocks(res.blocks);
    });
    return () => {
      document.removeEventListener("click", onDocClick, true);
      delete window.__SECRET_BIBLE_REACT_CLICK__;
      window.removeEventListener("secret-bible:blocks-updated", onBlocks);
      window.removeEventListener("secret-bible:start-generate", onGenerate);
      window.removeEventListener("secret-bible:prompt", onPrompt);
      window.removeEventListener("secret-bible:saved-next", onSavedNext);
      progressUnsubRef.current?.();
      progressUnsubRef.current = null;
    };
  }, [startGeneration]);

  const defaultFilename =
    contentBlocks[0] &&
    buildDefaultFilename(
      contentBlocks[0].book,
      contentBlocks[0].chapter,
      contentBlocks[0].startVerse,
      contentBlocks[0].endVerse
    );

  const handleSave = async () => {
    if (!window.secretBible || !generatedPath || !defaultFilename) return;
    setSaving(true);
    const res = await window.secretBible.saveVideo(generatedPath, defaultFilename);
    setSaving(false);
    if (res.ok) {
      setSaveMessage("영상 저장이 완료되었습니다.");
      setStep(6);
    } else if (res.message !== "cancelled") {
      setSaveMessage(res.message ?? "저장에 실패했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-[0.2em] text-white md:text-5xl">SECRET BIBLE</h1>
          <p className="mt-3 text-zinc-500">성경속 숨겨진 이야기를 찾아서</p>
        </header>

        <StepIndicator current={step} />

        <FormAlert error={formError} warning={step === 1 ? formWarning : null} />

        {step === 1 && (
          <>
            {awaitingNextPick ? (
              <div
                id="pick-next-banner"
                className="mb-6 rounded-xl border border-emerald-500/50 bg-emerald-950/50 px-5 py-4 text-center text-emerald-100"
              >
                <strong>{lastSavedHint}</strong> 저장됨 · 위에서 다음 구절을 선택하세요
              </div>
            ) : null}
            <ul
              id="saved-blocks-panel"
              className="mb-6 space-y-1 rounded-lg border border-zinc-600 bg-zinc-950/80 px-4 py-3 text-sm"
            >
              <li className="font-medium text-zinc-300">
                영상에 포함될 구절: <span className="text-amber-300">{contentBlocks.length}</span>개
              </li>
              {contentBlocks.length === 0 ? (
                <li className="text-zinc-600">아직 저장된 구절 없음</li>
              ) : (
                contentBlocks.map((b) => (
                  <li key={b.id} className="text-zinc-300">
                    · {b.book} {b.chapter}:{b.startVerse}
                    {b.endVerse !== b.startVerse ? `~${b.endVerse}` : ""}
                  </li>
                ))
              )}
            </ul>
            <BibleSelector
              key={`selector-${selectorKey}-${contentBlocks.length}`}
              value={selectorValue}
              onChange={(next) => {
                if (awaitingNextPick && next.book) setAwaitingNextPick(false);
                setSelection(next);
                setFormError(null);
                setFormWarning(next.book ? validatePassageExists(next) : null);
              }}
              error={null}
              textLoading={bibleTextLoading}
              textReady={bibleTextReady}
              textLoadTick={bibleTextLoadTick}
            />
            {selectorValue.book ? (
              <>
                <div className="mt-8">
                  <BibleText reference={reference} text={passage.text} />
                </div>
                <OpinionInput
                  value={opinion}
                  onChange={(v) => {
                    setOpinion(v);
                    if (formError?.includes("의견")) setFormError(null);
                  }}
                  error={
                    formError && (formError.includes("의견") || formError.includes("입력"))
                      ? formError
                      : null
                  }
                />
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    id="btn-save-and-next"
                    className="rounded-lg bg-emerald-700 px-5 py-2 text-white hover:bg-emerald-600"
                  >
                    이 구절 저장 + 다음 성경
                  </button>
                </div>
              </>
            ) : null}
            <div
              id="next-bible-prompt"
              className="mt-10 rounded-xl border border-amber-500/40 bg-zinc-950/80 p-6"
            >
              {promptFeedback ? (
                <div
                  id="prompt-feedback-box"
                  className={
                    promptIsSuccess
                      ? "mb-5 whitespace-pre-line rounded-lg border border-emerald-500/50 bg-emerald-950/60 px-4 py-3 text-center text-sm text-emerald-100"
                      : "mb-5 whitespace-pre-line rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-3 text-center text-sm text-red-100"
                  }
                >
                  {promptFeedback}
                </div>
              ) : (
                <div id="prompt-feedback-box" className="hidden" aria-hidden="true" />
              )}
              <p className="mb-5 text-center text-xl font-medium text-white">다음 성경으로 진행할까요?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  id="btn-next-bible-yes"
                  className="rounded-lg border-2 border-amber-400 bg-amber-500/20 px-10 py-4 text-lg text-amber-100"
                >
                  예
                </button>
                <button
                  type="button"
                  id="btn-next-bible-no"
                  className="rounded-lg border-2 border-zinc-500 px-10 py-4 text-lg text-zinc-200"
                >
                  아니오
                </button>
              </div>
              <p className="mt-4 text-center text-sm text-zinc-500">
                한 구절만 → 아니오 · 구절 추가 → 예 또는 초록 버튼
              </p>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="py-16">
            {genError ? (
              <div className="text-center">
                <p className="mb-2 text-lg text-red-300">영상 제작 중 문제가 발생했습니다.</p>
                <p className="mb-8 text-sm text-zinc-500">{genError}</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setGenError(null);
                      setProgress({ percent: 0, stepLabel: "준비 중" });
                      void startGeneration(contentBlocks);
                    }}
                    className="rounded-lg border border-amber-500/40 px-6 py-2 text-amber-100"
                  >
                    다시 시도
                  </button>
                  <button type="button" onClick={requestReset} className="rounded-lg border border-zinc-700 px-6 py-2">
                    처음으로
                  </button>
                </div>
              </div>
            ) : (
              <VideoProgress progress={progress} />
            )}
          </div>
        )}

        {step === 5 && (
          <div className="py-8">
            {previewAsk === null ? (
              <div className="text-center">
                <p className="mb-6 text-lg">동영상을 확인할까요?</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPreviewAsk(true)}
                    className="rounded-lg border border-amber-500/40 px-8 py-3 text-amber-100"
                  >
                    예
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewAsk(false);
                      setStep(6);
                    }}
                    className="rounded-lg border border-zinc-700 px-8 py-3"
                  >
                    아니오
                  </button>
                </div>
              </div>
            ) : previewAsk && previewUrl ? (
              <VideoPlayer
                src={previewUrl}
                onClose={() => {
                  setPreviewAsk(false);
                  setStep(6);
                }}
              />
            ) : (
              <SaveDialog onYes={handleSave} onNo={() => setShowExitChoice(true)} />
            )}
          </div>
        )}

        {step === 6 && !saveMessage && !showExitChoice && (
          <SaveDialog onYes={handleSave} onNo={() => setShowExitChoice(true)} busy={saving} />
        )}

        {step === 6 && saveMessage ? (
          <div className="text-center">
            <p className="mb-8 text-lg text-amber-100">{saveMessage}</p>
            <button type="button" onClick={requestReset} className="rounded-lg border border-zinc-700 px-8 py-3">
              처음으로
            </button>
          </div>
        ) : null}

        {showExitChoice && step >= 5 ? (
          <div className="mt-10 text-center">
            <p className="mb-6 text-lg">종료할까요?</p>
            <div className="flex justify-center gap-4">
              <button type="button" onClick={requestReset} className="rounded-lg border border-zinc-700 px-6 py-2">
                처음으로
              </button>
              <button
                type="button"
                onClick={() => window.secretBible?.exitApp()}
                className="rounded-lg border border-amber-500/40 px-6 py-2 text-amber-100"
              >
                종료
              </button>
            </div>
          </div>
        ) : null}

        {step <= 3 ? (
          <div className="mt-12 text-center">
            <button type="button" onClick={requestReset} className="text-xs text-zinc-700 hover:text-zinc-500">
              작업 초기화
            </button>
          </div>
        ) : null}

        {resetConfirmOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-confirm-title"
          >
            <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-950 p-6 text-center shadow-xl">
              <p id="reset-confirm-title" className="mb-6 text-lg text-zinc-100">
                현재 작업을 삭제하고 처음으로 돌아가시겠습니까?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  autoFocus
                  onClick={performReset}
                  className="rounded-lg border border-amber-500/40 px-6 py-2 text-amber-100"
                >
                  예
                </button>
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(false)}
                  className="rounded-lg border border-zinc-700 px-6 py-2 text-zinc-200"
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
