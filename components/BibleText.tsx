type Props = {
  reference: string;
  text: string;
};

export function BibleText({ reference, text }: Props) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6">
      <h2 className="mb-4 text-lg font-medium text-amber-200/90">{reference}</h2>
      <pre
        id="bible-passage-display"
        className="whitespace-pre-wrap font-sans text-base leading-relaxed text-zinc-100"
      >
        {text}
      </pre>
    </section>
  );
}
