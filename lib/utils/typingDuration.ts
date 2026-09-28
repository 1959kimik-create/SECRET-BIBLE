export function typingDurationSeconds(charCount: number, typingSpeedPerMinute: number): number {
  if (charCount <= 0) return 1;
  const charsPerSecond = typingSpeedPerMinute / 60;
  return Math.max(1, charCount / charsPerSecond);
}

export function visibleCharCountAtTime(
  charCount: number,
  elapsedSec: number,
  typingSpeedPerMinute: number
): number {
  const charsPerSecond = typingSpeedPerMinute / 60;
  return Math.min(charCount, Math.floor(elapsedSec * charsPerSecond));
}
