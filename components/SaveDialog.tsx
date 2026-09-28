type Props = {
  onYes: () => void;
  onNo: () => void;
  busy?: boolean;
};

export function SaveDialog({ onYes, onNo, busy }: Props) {
  return (
    <section className="text-center">
      <p className="mb-6 text-lg text-zinc-200">저장할까요?</p>
      <div className="flex justify-center gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={onYes}
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-8 py-3 text-amber-100 disabled:opacity-50"
        >
          예
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onNo}
          className="rounded-lg border border-zinc-700 px-8 py-3 text-zinc-200"
        >
          아니오
        </button>
      </div>
    </section>
  );
}
