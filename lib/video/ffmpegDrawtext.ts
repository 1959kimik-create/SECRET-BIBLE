import fs from "fs";
import os from "os";
import path from "path";
import { escapeFfmpegPath, getBoldFontPath, getFontPath } from "@/lib/utils/paths";

const OVERLAY_DIR = path.join(os.tmpdir(), "secret_bible_ffmpeg_overlay");

function ensureOverlayDir(): string {
  fs.mkdirSync(OVERLAY_DIR, { recursive: true });
  return OVERLAY_DIR;
}

/** FFmpeg drawtext용 — 한글 경로 문제를 피하기 위해 TEMP에 TTF 복사 */
export function getFfmpegDrawtextFontPath(): string {
  const dir = ensureOverlayDir();
  const dest = path.join(dir, "korean.ttf");
  const src = getFontPath();
  const srcStat = fs.statSync(src);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  } else {
    const destStat = fs.statSync(dest);
    if (destStat.mtimeMs < srcStat.mtimeMs) {
      fs.copyFileSync(src, dest);
    }
  }
  return escapeFfmpegPath(dest);
}

/** FFmpeg drawtext용 굵은 한글 폰트 */
export function getFfmpegDrawtextBoldFontPath(): string {
  const dir = ensureOverlayDir();
  const dest = path.join(dir, "korean-bold.ttf");
  const src = getBoldFontPath();
  const srcStat = fs.statSync(src);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  } else {
    const destStat = fs.statSync(dest);
    if (destStat.mtimeMs < srcStat.mtimeMs) {
      fs.copyFileSync(src, dest);
    }
  }
  return escapeFfmpegPath(dest);
}

export function writeFfmpegTextFile(basename: string, content: string): string {
  const dir = ensureOverlayDir();
  const filePath = path.join(dir, basename);
  const text = content.replace(/^\uFEFF/, "");
  fs.writeFileSync(filePath, text, { encoding: "utf8" });
  return escapeFfmpegPath(filePath);
}
