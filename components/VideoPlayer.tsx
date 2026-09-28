"use client";

import { useRef, useState } from "react";

type Props = {
  src: string;
  onClose: () => void;
};

export function VideoPlayer({ src, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  };

  return (
    <section className="mx-auto max-w-4xl">
      {loadError ? (
        <p className="mb-4 rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-3 text-center text-sm text-red-200">
          {loadError}
        </p>
      ) : null}
      <video
        ref={videoRef}
        key={src}
        src={src}
        className="aspect-video w-full rounded-xl border border-zinc-800 bg-black"
        controls
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedData={() => setLoadError(null)}
        onError={() =>
          setLoadError(
            "미리보기를 불러오지 못했습니다. 시작하기.bat으로 앱을 다시 연 뒤 영상을 한 번 더 만들어 주세요. (generated 폴더의 MP4는 PC에서 더블클릭으로 재생해 볼 수 있습니다.)"
          )
        }
      />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <ControlBtn onClick={() => videoRef.current && (videoRef.current.currentTime = 0)}>처음으로</ControlBtn>
        <ControlBtn onClick={() => seek(-10)}>뒤로</ControlBtn>
        <ControlBtn
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            if (v.paused) void v.play();
            else v.pause();
          }}
        >
          {playing ? "일시정지" : "재생"}
        </ControlBtn>
        <ControlBtn onClick={() => seek(10)}>앞으로</ControlBtn>
        <ControlBtn
          onClick={() => {
            const v = videoRef.current;
            if (v && v.duration) v.currentTime = v.duration;
          }}
        >
          끝으로
        </ControlBtn>
        <ControlBtn onClick={onClose}>종료</ControlBtn>
      </div>
    </section>
  );
}

function ControlBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
    >
      {children}
    </button>
  );
}
