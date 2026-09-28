import type { SKRSContext2D } from "@napi-rs/canvas";
import { createCanvas } from "@napi-rs/canvas";

export function wrapText(
  ctx: SKRSContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n/);
  for (const para of paragraphs) {
    if (!para) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const char of para) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export function paginateLines(lines: string[], maxLinesPerPage: number): string[][] {
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }
  if (pages.length === 0) pages.push([]);
  return pages;
}

export function measureMaxLines(
  canvasHeight: number,
  topPadding: number,
  bottomPadding: number,
  lineHeight: number
): number {
  const available = canvasHeight - topPadding - bottomPadding;
  return Math.max(1, Math.floor(available / lineHeight));
}

export type TypingPage = {
  lines: string[];
  charStart: number;
  charEnd: number;
};

/** Flatten text into pages with global char offsets (newlines count as chars). */
export function buildTypingPages(
  ctx: SKRSContext2D,
  fullText: string,
  maxWidth: number,
  maxLinesPerPage: number
): TypingPage[] {
  const lines = wrapText(ctx, fullText, maxWidth);
  const linePages = paginateLines(lines, maxLinesPerPage);

  let cursor = 0;
  const pages: TypingPage[] = [];
  for (const pageLines of linePages) {
    const pageText = pageLines.join("\n");
    const charStart = cursor;
    const charEnd = cursor + pageText.length;
    pages.push({ lines: pageLines, charStart, charEnd });
    cursor = charEnd + 1;
  }
  if (pages.length === 0) {
    pages.push({ lines: [], charStart: 0, charEnd: 0 });
  }
  return pages;
}

export function createMeasureCanvas(width: number, height: number) {
  return createCanvas(width, height);
}
