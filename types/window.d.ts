import type { ContentBlock, GenerateVideoResult, VideoProgress, VideoProject } from "@/lib/types";

export type SecretBibleApi = {
  appendContentBlock: (
    block: ContentBlock
  ) => Promise<{ ok: boolean; blocks: ContentBlock[]; message?: string }>;
  getContentBlocks: () => Promise<{ ok: boolean; blocks: ContentBlock[] }>;
  resetContentBlocks: () => Promise<{ ok: boolean; blocks: ContentBlock[] }>;
  generateVideo: (project: VideoProject) => Promise<GenerateVideoResult>;
  saveVideo: (
    sourcePath: string,
    defaultFilename: string
  ) => Promise<{ ok: boolean; message?: string; filePath?: string }>;
  exitApp: () => Promise<void>;
  focusWindow: () => Promise<void>;
  onProgress: (callback: (progress: VideoProgress) => void) => () => void;
  getVideoPreviewUrl: (filePath: string) => Promise<string | null>;
};

declare global {
  interface Window {
    secretBible?: SecretBibleApi;
    __SECRET_BIBLE_ACTIONS_LOADED__?: boolean;
    __SECRET_BIBLE_REACT_CLICK__?: boolean;
  }
}

export {};
