type Props = {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
};

export function OpinionInput({ value, onChange, error }: Props) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-medium text-amber-200/90">나의 의견</h2>
      <textarea
        id="opinion-textarea"
        name="opinion"
        className="min-h-[220px] w-full rounded-xl border-2 border-amber-600/40 bg-zinc-950 px-4 py-3 text-lg leading-relaxed text-amber-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        placeholder="저는 이 말씀에서 ..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
      />
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}

export function readOpinionFromDom(fallback: string): string {
  if (typeof document === "undefined") return fallback.trim();
  const byId = document.getElementById("opinion-textarea");
  if (byId instanceof HTMLTextAreaElement && byId.value.trim()) {
    return byId.value.trim();
  }
  const byName = document.querySelector('textarea[name="opinion"]');
  if (byName instanceof HTMLTextAreaElement && byName.value.trim()) {
    return byName.value.trim();
  }
  return fallback.trim();
}
