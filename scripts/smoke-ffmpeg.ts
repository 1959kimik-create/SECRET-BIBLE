import path from "path";
import { smokeTestMp4 } from "../lib/ffmpeg/run";
import { getGeneratedDir } from "../lib/utils/paths";

async function main() {
  const out = path.join(getGeneratedDir(), "smoke_test.mp4");
  await smokeTestMp4(out);
  console.log("FFmpeg smoke OK:", out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
