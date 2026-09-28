import fs from "fs";
import path from "path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { runFfmpeg } from "@/lib/ffmpeg/run";
import { H264_ULTRAFAST } from "@/lib/ffmpeg/videoEncodeArgs";
import { getBoldFontPath, getFontPath } from "@/lib/utils/paths";
import { wrapText, measureMaxLines } from "@/lib/video/textLayout";
import type { VideoSettings } from "@/lib/types";

export type TypingSegmentOptions = {
  outputPath: string;
  title: string;
  bodyText: string;
  color: string;
  fontSize: number;
  titleFontSize: number;
  settings: VideoSettings;
  workDir: string;
  label: string;
  onFrameProgress?: (current: number, total: number) => void;
};

const FONT_FAMILY = "SecretBibleKR";
const FONT_FAMILY_BOLD = "SecretBibleKRBold";
const HOLD_SEC = 0.6;
const START_EMPTY_SEC = 0.35;
let fontRegistered = false;

function ensureFont(): void {
  if (fontRegistered) return;
  GlobalFonts.registerFromPath(getFontPath(), FONT_FAMILY);
  GlobalFonts.registerFromPath(getBoldFontPath(), FONT_FAMILY_BOLD);
  fontRegistered = true;
}

function renderFrame(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  options: TypingSegmentOptions,
  width: number,
  height: number,
  marginX: number,
  titleTop: number,
  bodyTop: number,
  lineHeight: number,
  maxWidth: number,
  maxLines: number,
  visibleText: string
): void {
  const lines = wrapText(ctx, visibleText, maxWidth);
  const displayLines = lines.length > maxLines ? lines.slice(0, maxLines) : lines;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `${options.titleFontSize}px ${FONT_FAMILY_BOLD}`;
  ctx.textAlign = "center";
  ctx.fillText(options.title, width / 2, titleTop);

  ctx.fillStyle = options.color;
  ctx.font = `${options.fontSize}px ${FONT_FAMILY_BOLD}`;
  ctx.textAlign = "left";
  displayLines.forEach((line, idx) => {
    ctx.fillText(line, marginX, bodyTop + idx * lineHeight);
  });
}

export async function createTypingSegment(options: TypingSegmentOptions): Promise<void> {
  ensureFont();
  const { width, height, typingSpeed } = options.settings;
  const charCount = options.bodyText.length;
  const charsPerSecond = Math.max(typingSpeed / 60, 0.5);
  const startHoldSteps = Math.max(1, Math.ceil(START_EMPTY_SEC * charsPerSecond));
  const holdSteps = Math.max(1, Math.ceil(HOLD_SEC * charsPerSecond));
  const typingSteps = Math.max(1, charCount + 1);
  const totalSteps = startHoldSteps + typingSteps + holdSteps;

  const framesDir = path.join(options.workDir, `frames_${options.label}`);
  fs.mkdirSync(framesDir, { recursive: true });

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const marginX = 120;
  const titleTop = 100;
  const bodyTop = 220;
  const bottomPad = 100;
  const lineHeight = Math.round(options.fontSize * 1.55);
  const maxWidth = width - marginX * 2;
  const maxLines = measureMaxLines(height, bodyTop, bottomPad, lineHeight);

  ctx.font = `${options.fontSize}px ${FONT_FAMILY_BOLD}`;

  let frameIndex = 1;
  let lastFramePath = "";

  for (let s = 0; s < startHoldSteps; s++) {
    renderFrame(
      ctx,
      options,
      width,
      height,
      marginX,
      titleTop,
      bodyTop,
      lineHeight,
      maxWidth,
      maxLines,
      ""
    );
    const framePath = path.join(framesDir, `frame_${String(frameIndex).padStart(5, "0")}.jpg`);
    fs.writeFileSync(framePath, canvas.toBuffer("image/jpeg", 0.82));
    lastFramePath = framePath;
    options.onFrameProgress?.(frameIndex, totalSteps);
    frameIndex++;
  }

  for (let visible = 0; visible <= charCount; visible++) {
    const visibleText = options.bodyText.slice(0, visible);
    renderFrame(
      ctx,
      options,
      width,
      height,
      marginX,
      titleTop,
      bodyTop,
      lineHeight,
      maxWidth,
      maxLines,
      visibleText
    );
    const framePath = path.join(framesDir, `frame_${String(frameIndex).padStart(5, "0")}.jpg`);
    fs.writeFileSync(framePath, canvas.toBuffer("image/jpeg", 0.82));
    lastFramePath = framePath;
    options.onFrameProgress?.(frameIndex, totalSteps);
    frameIndex++;
  }

  for (let h = 0; h < holdSteps; h++) {
    const framePath = path.join(framesDir, `frame_${String(frameIndex).padStart(5, "0")}.jpg`);
    fs.copyFileSync(lastFramePath, framePath);
    options.onFrameProgress?.(frameIndex, totalSteps);
    frameIndex++;
  }

  const totalFrames = frameIndex - 1;

  await runFfmpeg([
    "-y",
    "-start_number",
    "1",
    "-framerate",
    String(charsPerSecond),
    "-i",
    path.join(framesDir, "frame_%05d.jpg"),
    "-frames:v",
    String(totalFrames),
    ...H264_ULTRAFAST,
    "-tune",
    "stillimage",
    options.outputPath,
  ]);

  fs.rmSync(framesDir, { recursive: true, force: true });
}
