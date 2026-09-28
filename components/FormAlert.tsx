type Props = {
  error?: string | null;
  warning?: string | null;
};

export function FormAlert({ error, warning }: Props) {
  if (!error && !warning) return null;
  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-500/50 bg-red-950/40 text-red-200"
          : "border-amber-500/40 bg-amber-950/30 text-amber-100"
      }`}
      role="alert"
    >
      {error ?? warning}
    </div>
  );
}
