import type { VideoProgress as Progress } from "@/lib/types";

type Props = {
  progress: Progress;
};

export function VideoProgress({ progress }: Props) {
  return (
    <section className="mx-auto max-w-lg text-center">
      <h2 className="mb-2 text-xl text-zinc-100">영상 제작 중...</h2>
      <p className="mb-6 whitespace-pre-line text-sm text-zinc-400">{progress.stepLabel}</p>
      <div className="mb-2 h-3 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-amber-700 to-amber-400 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="text-2xl font-light text-amber-200">{progress.percent}%</p>
    </section>
  );
}
