import { runFfmpeg } from "@/lib/ffmpeg/run";
import { H264_ULTRAFAST } from "@/lib/ffmpeg/videoEncodeArgs";

/** Concatenate clips with different frame rates into one CFR timeline (outro included). */
export async function concatVideosWithFilter(
  segments: string[],
  outputPath: string,
  width: number,
  height: number,
  outputFps = 30
): Promise<void> {
  if (!segments.length) {
    throw new Error("합칠 영상 조각이 없습니다.");
  }

  const inputArgs: string[] = [];
  for (const seg of segments) {
    inputArgs.push("-i", seg);
  }

  const scaleParts = segments.map(
    (_, i) =>
      `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${outputFps}[v${i}]`
  );
  const concatInputs = segments.map((_, i) => `[v${i}]`).join("");
  const filter = `${scaleParts.join(";")};${concatInputs}concat=n=${segments.length}:v=1:a=0[outv]`;

  await runFfmpeg([
    "-y",
    ...inputArgs,
    "-filter_complex",
    filter,
    "-map",
    "[outv]",
    ...H264_ULTRAFAST,
    "-r",
    String(outputFps),
    "-an",
    outputPath,
  ]);
}
