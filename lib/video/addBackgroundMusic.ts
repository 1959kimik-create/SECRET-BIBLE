import { spawn } from "child_process";
import { getFfmpegPath } from "@/lib/ffmpeg/run";
import { getVideoDurationSec } from "@/lib/ffmpeg/duration";

function runFfmpegArgs(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(getFfmpegPath(), args, { windowsHide: true });
    let stderr = "";
    proc.stderr.on("data", (c: Buffer) => {
      stderr += c.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.slice(-2000)));
    });
  });
}

export async function addBackgroundMusic(
  videoPath: string,
  musicPath: string,
  outputPath: string,
  volume: number
): Promise<void> {
  const duration = await getVideoDurationSec(videoPath);
  if (duration <= 0) {
    throw new Error("영상 길이가 0초입니다.");
  }

  const fadeDur = Math.min(3, Math.max(0.5, duration * 0.08));
  const fadeStart = Math.max(0, duration - fadeDur);
  const vol = volume.toFixed(3);
  const d = duration.toFixed(3);

  // Loop only if needed, then trim to exact video duration so BGM ends with the video.
  const filter = `[1:a]volume=${vol},aloop=loop=-1:size=2e+09,atrim=0:${d},asetpts=PTS-STARTPTS,afade=t=out:st=${fadeStart.toFixed(2)}:d=${fadeDur.toFixed(2)}[aout]`;

  await runFfmpegArgs([
    "-y",
    "-i",
    videoPath,
    "-i",
    musicPath,
    "-filter_complex",
    filter,
    "-map",
    "0:v",
    "-map",
    "[aout]",
    "-c:v",
    "copy",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    outputPath,
  ]);
}
