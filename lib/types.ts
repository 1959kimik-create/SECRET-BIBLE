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

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  width: 1920,
  height: 1080,
  typingSpeed: 170,
  bibleFontSize: 50,
  opinionFontSize: 50,
  titleFontSize: 58,
  musicVolume: 0.08,
};
