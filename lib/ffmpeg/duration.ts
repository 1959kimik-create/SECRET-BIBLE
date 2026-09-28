import { spawn } from "child_process";
import { getFfprobePath } from "@/lib/ffmpeg/run";

function probeDurationSec(filePath: string, stream: "format" | "audio"): Promise<number> {
  return new Promise((resolve, reject) => {
    const args =
      stream === "audio"
        ? [
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            filePath,
          ]
        : [
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            filePath,
          ];

    const proc = spawn(getFfprobePath(), args, { windowsHide: true });
    let out = "";
    proc.stdout.on("data", (c: Buffer) => {
      out += c.toString();
    });
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error("미디어 길이를 확인할 수 없습니다."));
      else resolve(parseFloat(out.trim()) || 0);
    });
  });
}

export function getVideoDurationSec(videoPath: string): Promise<number> {
  return probeDurationSec(videoPath, "format");
}

export function getAudioDurationSec(audioPath: string): Promise<number> {
  return probeDurationSec(audioPath, "audio").catch(() => probeDurationSec(audioPath, "format"));
}
