type Props = {
  onYes: () => void;
  onNo: () => void;
};

export function NextBibleSelector({ onYes, onNo }: Props) {
  return (
    <section className="mt-10 text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-300">STEP 2</p>
      <p className="mb-6 text-2xl font-medium text-white">다음 성경으로 진행할까요?</p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onYes();
          }}
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-8 py-3 text-amber-100 hover:bg-amber-500/20"
        >
          예
        </button>
        <button
          type="button"
          onClick={onNo}
          className="rounded-lg border border-zinc-700 px-8 py-3 text-zinc-200 hover:bg-zinc-900"
        >
          아니오
        </button>
      </div>
    </section>
  );
}
