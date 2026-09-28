/** Shared libx264 options for faster desktop encoding. */
export const H264_ULTRAFAST = [
  "-c:v",
  "libx264",
  "-preset",
  "ultrafast",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
] as const;
