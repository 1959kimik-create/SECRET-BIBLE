import fs from "fs";
import path from "path";
import { runFfmpeg } from "@/lib/ffmpeg/run";
import { H264_ULTRAFAST } from "@/lib/ffmpeg/videoEncodeArgs";

export async function concatVideos(segments: string[], outputPath: string, workDir: string): Promise<void> {
  const listPath = path.join(workDir, "concat_list.txt");
  const listContent = segments
    .map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
    .join("\n");
  fs.writeFileSync(listPath, listContent, "utf8");

  await runFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    ...H264_ULTRAFAST,
    "-an",
    outputPath,
  ]);
}
