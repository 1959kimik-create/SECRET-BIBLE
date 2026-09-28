import { generateFinalVideo } from "../lib/video/generateFinalVideo";
import type { ContentBlock } from "../lib/types";
import { DEFAULT_VIDEO_SETTINGS } from "../lib/types";

const block: ContentBlock = {
  id: "test",
  book: "창세기",
  chapter: 1,
  startVerse: 1,
  endVerse: 1,
  bibleText: "1. 태초에 하나님이 천지를 창조하시니라",
  opinion: "저는 이 한 verse에서 하나님의 창조하심을 묵상합니다.",
};

async function main() {
  const filePath = await generateFinalVideo(
    { contentBlocks: [block], videoSettings: DEFAULT_VIDEO_SETTINGS },
    (p) => console.log(p.percent, p.stepLabel)
  );
  console.log("Video smoke OK:", filePath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
