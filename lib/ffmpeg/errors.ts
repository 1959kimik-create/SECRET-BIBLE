export function toUserFriendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("intro.mp4") || raw.includes("INTRO")) {
    return "시작 영상(intro.mp4)을 찾을 수 없습니다. public 폴더를 확인해 주세요.";
  }
  if (raw.includes("outro.mp4") || raw.includes("OUTRO")) {
    return "종료 영상(outro.mp4)을 찾을 수 없습니다. public 폴더를 확인해 주세요.";
  }
  if (raw.includes("background.mp3") || raw.includes("BGM")) {
    return "배경음악(background.mp3)을 찾을 수 없습니다. public 폴더를 확인해 주세요.";
  }
  if (raw.includes("font") || raw.includes("폰트")) {
    return "한글 폰트를 찾을 수 없습니다. public/fonts 폴더를 확인해 주세요.";
  }
  if (raw.toLowerCase().includes("ffmpeg")) {
    return "영상 변환 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
  return "영상 제작 중 문제가 발생했습니다. 입력 내용과 미디어 파일을 확인해 주세요.";
}
