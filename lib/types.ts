export type ContentBlock = {
  id: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  bibleText: string;
  opinion: string;
};

export type VideoSettings = {
  width: number;
  height: number;
  typingSpeed: number;
  bibleFontSize: number;
  opinionFontSize: number;
  titleFontSize: number;
  musicVolume: number;
};

export type VideoProject = {
  contentBlocks: ContentBlock[];
  videoSettings: VideoSettings;
};

export type VideoProgress = {
  percent: number;
  stepLabel: string;
};

export type GenerateVideoResult =
  | { ok: true; filePath: string; previewUrl: string }
  | { ok: false; message: string };

/** 본문 타이핑 본문 글자색 (성경 / 의견) */
export const TYPING_BIBLE_BODY_COLOR = "#0078FF";
export const TYPING_OPINION_BODY_COLOR = "#FFE032";

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  width: 1920,
  height: 1080,
  typingSpeed: 180,
  bibleFontSize: 50,
  opinionFontSize: 50,
  titleFontSize: 58,
  musicVolume: 0.08,
};
