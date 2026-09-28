import fs from "fs";
import path from "path";

export function getProjectRoot(): string {
  return process.cwd();
}

export function getPublicDir(): string {
  return path.join(getProjectRoot(), "public");
}

export function getGeneratedDir(): string {
  const dir = path.join(getProjectRoot(), "generated");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getFontPath(): string {
  const candidates = [
    path.join(getPublicDir(), "fonts", "NotoSansKR-Regular.otf"),
    path.join(getPublicDir(), "fonts", "NotoSansKR-Regular.ttf"),
    path.join(getPublicDir(), "fonts", "malgun.ttf"),
    "C:\\Windows\\Fonts\\malgun.ttf",
    "C:\\Windows\\Fonts\\malgunsl.ttf",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    "한글 폰트를 찾을 수 없습니다. public/fonts/ 에 Noto Sans KR 또는 malgun.ttf 를 넣어 주세요."
  );
}

export function getBoldFontPath(): string {
  const candidates = [
    path.join(getPublicDir(), "fonts", "malgunbd.ttf"),
    path.join(getPublicDir(), "fonts", "NotoSansKR-Bold.otf"),
    path.join(getPublicDir(), "fonts", "NotoSansKR-Bold.ttf"),
    "C:\\Windows\\Fonts\\malgunbd.ttf",
    getFontPath(),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return getFontPath();
}

export function escapeFfmpegPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/:/g, "\\:");
}
