import crypto from "crypto";
import fs from "fs";
import http from "http";
import path from "path";
import { getGeneratedDir } from "@/lib/utils/paths";

const tokens = new Map<string, string>();
let port = 0;
let server: http.Server | null = null;

export function isAllowedPreviewFile(filePath: string): boolean {
  const generatedRoot = path.resolve(getGeneratedDir());
  const resolved = path.resolve(filePath);
  return resolved.startsWith(generatedRoot) && fs.existsSync(resolved);
}

function serveMp4(filePath: string, req: http.IncomingMessage, res: http.ServerResponse): void {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (Number.isNaN(start) || start >= fileSize || end >= fileSize) {
      res.statusCode = 416;
      res.end();
      return;
    }
    const chunkSize = end - start + 1;
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Content-Length", chunkSize);
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Length", fileSize);
    fs.createReadStream(filePath).pipe(res);
  }
}

export function startPreviewHttpServer(): Promise<number> {
  if (server && port) return Promise.resolve(port);

  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      const url = req.url ?? "";
      const match = url.match(/^\/v\/([a-f0-9]+)\.mp4/i);
      if (!match) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const filePath = tokens.get(match[1]);
      if (!filePath || !isAllowedPreviewFile(filePath)) {
        res.statusCode = 404;
        res.end();
        return;
      }
      serveMp4(filePath, req, res);
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server?.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("미리보기 서버를 시작할 수 없습니다."));
        return;
      }
      port = addr.port;
      resolve(port);
    });
  });
}

export function createPreviewHttpUrl(filePath: string): string | null {
  if (!port || !isAllowedPreviewFile(filePath)) return null;
  const token = crypto.randomBytes(16).toString("hex");
  tokens.set(token, filePath);
  if (tokens.size > 24) {
    const oldest = tokens.keys().next().value;
    if (oldest) tokens.delete(oldest);
  }
  return `http://127.0.0.1:${port}/v/${token}.mp4`;
}
