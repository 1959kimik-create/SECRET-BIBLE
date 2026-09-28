import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { VideoProgress, VideoProject } from "@/lib/types";
import { getGeneratedDir } from "@/lib/utils/paths";
import { assetPath, validateMediaAssets } from "@/lib/video/validateAssets";
import { overlayIntro, overlayOutro } from "@/lib/video/drawtextOverlay";
import { createTypingSegment } from "@/lib/video/createTypingSegment";
import { concatVideosWithFilter } from "@/lib/video/concatWithFilter";
import { addBackgroundMusic } from "@/lib/video/addBackgroundMusic";

function formatRef(book: string, chapter: number, start: number, end: number): string {
  if (start === end) return `${book} ${chapter}:${start}`;
  return `${book} ${chapter}:${start}~${end}`;
}

export async function generateFinalVideo(
  project: VideoProject,
  onProgress?: (p: VideoProgress) => void
): Promise<string> {
  validateMediaAssets();
  if (!project.contentBlocks.length) {
    throw new Error("영상으로 만들 콘텐츠가 없습니다.");
  }

  const jobId = uuidv4();
  const workDir = path.join(getGeneratedDir(), `job_${jobId}`);
  fs.mkdirSync(workDir, { recursive: true });

  const report = (percent: number, stepLabel: string) => {
    onProgress?.({ percent: Math.min(100, Math.round(percent)), stepLabel });
  };

  const tempFiles: string[] = [];
  const segmentPaths: string[] = [];

  try {
    report(5, "INTRO 제작");
    const introOut = path.join(workDir, "intro_overlay.mp4");
    const first = project.contentBlocks[0];
    await overlayIntro(
      assetPath("intro.mp4"),
      introOut,
      formatRef(first.book, first.chapter, first.startVerse, first.endVerse),
      workDir
    );
    tempFiles.push(introOut);
    segmentPaths.push(introOut);

    const blockCount = project.contentBlocks.length;
    for (let i = 0; i < blockCount; i++) {
      const block = project.contentBlocks[i];
      const ref = formatRef(block.book, block.chapter, block.startVerse, block.endVerse);
      const basePct = 10 + (i / blockCount) * 55;

      report(basePct, `성경 본문 영상 (${i + 1}/${blockCount}) — 준비`);
      const bibleOut = path.join(workDir, `bible_${i + 1}.mp4`);
      const bibleChars = block.bibleText.length;
      await createTypingSegment({
        outputPath: bibleOut,
        title: ref,
        bodyText: block.bibleText,
        color: "#FFFFFF",
        fontSize: project.videoSettings.bibleFontSize,
        titleFontSize: project.videoSettings.titleFontSize,
        settings: project.videoSettings,
        workDir,
        label: `bible_${i + 1}`,
        onFrameProgress: (cur, tot) => {
          const slice = 8;
          const inner = tot > 0 ? cur / tot : 0;
          report(
            basePct + inner * slice,
            `성경 본문 타이핑 (${i + 1}/${blockCount}) ${cur}/${tot} · ${bibleChars}자`
          );
        },
      });
      tempFiles.push(bibleOut);
      segmentPaths.push(bibleOut);

      report(basePct + 8, `의견 영상 (${i + 1}/${blockCount}) — 준비`);
      const opinionOut = path.join(workDir, `opinion_${i + 1}.mp4`);
      const opinionChars = block.opinion.length;
      await createTypingSegment({
        outputPath: opinionOut,
        title: "나의 의견",
        bodyText: block.opinion,
        color: "#FFD700",
        fontSize: project.videoSettings.opinionFontSize,
        titleFontSize: project.videoSettings.titleFontSize,
        settings: project.videoSettings,
        workDir,
        label: `opinion_${i + 1}`,
        onFrameProgress: (cur, tot) => {
          const slice = 8;
          const inner = tot > 0 ? cur / tot : 0;
          report(
            basePct + 8 + inner * slice,
            `의견 타이핑 (${i + 1}/${blockCount}) ${cur}/${tot} · ${opinionChars}자`
          );
        },
      });
      tempFiles.push(opinionOut);
      segmentPaths.push(opinionOut);
    }

    report(72, "OUTRO 제작");
    const outroOut = path.join(workDir, "outro_overlay.mp4");
    await overlayOutro(assetPath("outro.mp4"), outroOut, workDir);
    tempFiles.push(outroOut);
    segmentPaths.push(outroOut);

    report(82, "영상 합성 (INTRO→본문→OUTRO)");
    const merged = path.join(workDir, "merged.mp4");
    await concatVideosWithFilter(
      segmentPaths,
      merged,
      project.videoSettings.width,
      project.videoSettings.height,
      30
    );
    tempFiles.push(merged);

    report(92, "BGM 삽입");
    const finalPath = path.join(getGeneratedDir(), `final_${jobId}.mp4`);
    await addBackgroundMusic(merged, assetPath("background.mp3"), finalPath, project.videoSettings.musicVolume);

    report(100, "최종 MP4 생성");
    return finalPath;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
