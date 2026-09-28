import fs from "fs";
import path from "path";
import { sanitizeFilename } from "@/lib/utils/filenameClient";

export function resolveUniquePath(dir: string, filename: string): string {
  const ext = path.extname(filename);
  const stem = path.basename(filename, ext);
  let candidate = path.join(dir, filename);
  if (!fs.existsSync(candidate)) return candidate;
  for (let i = 1; i < 1000; i++) {
    const numbered = path.join(dir, `${stem}_${String(i).padStart(2, "0")}${ext}`);
    if (!fs.existsSync(numbered)) return numbered;
  }
  throw new Error("같은 이름의 파일이 너무 많습니다.");
}
