const STEPS = ["성경 · 의견", "다음 성경", "영상 제작", "영상 확인", "저장"];

/** App uses steps 1,3,4,5,6 (step 2 merged into 1). */
export function toDisplayStep(appStep: number): number {
  if (appStep <= 1) return 1;
  if (appStep === 3) return 2;
  if (appStep === 4) return 3;
  if (appStep === 5) return 4;
  if (appStep >= 6) return 5;
  return 1;
}

export function StepIndicator({ current }: { current: number }) {
  const display = toDisplayStep(current);
  return (
    <div className="mb-8 flex flex-wrap gap-2 text-xs tracking-wide text-zinc-500">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const active = stepNum === display;
        return (
          <span
            key={label}
            className={`rounded-full border px-3 py-1 ${
              active
                ? "border-amber-500/60 bg-amber-500/10 text-amber-200"
                : "border-zinc-800 text-zinc-600"
            }`}
          >
            STEP {stepNum} / {label}
          </span>
        );
      })}
    </div>
  );
}
