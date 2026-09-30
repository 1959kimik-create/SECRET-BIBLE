import fs from "fs";
import path from "path";
import { getFontPath, getPublicDir } from "@/lib/utils/paths";

export function validateMediaAssets(): void {
  const publicDir = getPublicDir();
  const required = ["intro.mp4", "outro.mp4", "background.mp3", "content-bg.mp4"];
  for (const file of required) {
    const full = path.join(publicDir, file);
    if (!fs.existsSync(full)) {
      throw new Error(`${file} 파일이 없습니다.`);
    }
  }
  getFontPath();
}

export function assetPath(name: string): string {
  return path.join(getPublicDir(), name);
}
