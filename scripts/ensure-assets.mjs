import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const root = process.cwd();
const publicDir = path.join(root, "public");
const fontsDir = path.join(publicDir, "fonts");

fs.mkdirSync(fontsDir, { recursive: true });

const ffmpeg = ffmpegInstaller.path;

function run(args) {
  const r = spawnSync(ffmpeg, args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr);
    throw new Error("FFmpeg failed");
  }
}

const intro = path.join(publicDir, "intro.mp4");
const outro = path.join(publicDir, "outro.mp4");
const textBg = path.join(publicDir, "text.mp4");
const wordBg = path.join(publicDir, "word.mp4");
const bgm = path.join(publicDir, "background.mp3");

if (!fs.existsSync(intro)) {
  run([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "color=c=black:s=1920x1080:d=5",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    intro,
  ]);
  console.log("Created placeholder intro.mp4");
}

if (!fs.existsSync(outro)) {
  run([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "color=c=black:s=1920x1080:d=5",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    outro,
  ]);
  console.log("Created placeholder outro.mp4");
}

function ensureLoopPlaceholder(filePath, color, label) {
  if (fs.existsSync(filePath)) return;
  run([
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${color}:s=1920x1080:d=12`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    filePath,
  ]);
  console.log(`Created placeholder ${label} (replace with your looping background)`);
}

ensureLoopPlaceholder(textBg, "0x0a1628", "text.mp4");
ensureLoopPlaceholder(wordBg, "0x1a1208", "word.mp4");

if (!fs.existsSync(bgm)) {
  run([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:duration=30",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "9",
    bgm,
  ]);
  console.log("Created placeholder background.mp3");
}

const malgun = "C:\\Windows\\Fonts\\malgun.ttf";
const fontDest = path.join(fontsDir, "malgun.ttf");
if (!fs.existsSync(fontDest) && fs.existsSync(malgun)) {
  fs.copyFileSync(malgun, fontDest);
  console.log("Copied malgun.ttf to public/fonts");
}

const malgunBd = "C:\\Windows\\Fonts\\malgunbd.ttf";
const fontBdDest = path.join(fontsDir, "malgunbd.ttf");
if (!fs.existsSync(fontBdDest) && fs.existsSync(malgunBd)) {
  fs.copyFileSync(malgunBd, fontBdDest);
  console.log("Copied malgunbd.ttf to public/fonts");
}
