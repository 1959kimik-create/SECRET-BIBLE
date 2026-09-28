import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function resolveTsPath(basePath) {
  const candidates = [basePath, `${basePath}.ts`, `${basePath}.tsx`, path.join(basePath, "index.ts")];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return basePath;
}

/** @type {import('esbuild').Plugin} */
const aliasAt = {
  name: "alias-at",
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => ({
      path: resolveTsPath(path.join(root, args.path.slice(2))),
    }));
  },
};

await esbuild.build({
  entryPoints: [path.join(root, "electron/main.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: path.join(root, "electron-dist/main.cjs"),
  format: "cjs",
  sourcemap: true,
  plugins: [aliasAt],
  external: [
    "electron",
    "@napi-rs/canvas",
    "@ffmpeg-installer/ffmpeg",
    "@ffprobe-installer/ffprobe",
  ],
});

const preloadSrc = path.join(root, "electron", "preload.cjs");
const preloadOut = path.join(root, "electron-dist", "preload.cjs");
fs.copyFileSync(preloadSrc, preloadOut);

console.log("Electron main built → electron-dist/main.cjs");
console.log("Preload copied → electron-dist/preload.cjs");
