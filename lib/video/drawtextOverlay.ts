import { runFfmpeg } from "@/lib/ffmpeg/run";
import { H264_ULTRAFAST } from "@/lib/ffmpeg/videoEncodeArgs";
import { getFfmpegDrawtextFontPath, writeFfmpegTextFile } from "@/lib/video/ffmpegDrawtext";

function drawtextChain(font: string, entries: { file: string; content: string; opts: string }[]): string {
  return entries
    .map(({ file, content, opts }) => {
      const textfile = writeFfmpegTextFile(file, content);
      return `drawtext=fontfile='${font}':textfile='${textfile}':fix_bounds=1:${opts}`;
    })
    .join(",");
}

export async function overlayIntro(
  inputVideo: string,
  outputVideo: string,
  bibleRef: string,
  _workDir: string
): Promise<void> {
  const font = getFfmpegDrawtextFontPath();
  const vf = drawtextChain(font, [
    {
      file: "intro_title.txt",
      content: "SECRET BIBLE",
      opts: "fontcolor=white:fontsize=96:x=(w-text_w)/2:y=(h/2)-180",
    },
    {
      file: "intro_ref.txt",
      content: bibleRef,
      opts: "fontcolor=0xFFD700:fontsize=56:x=(w-text_w)/2:y=(h/2)-40",
    },
    {
      file: "intro_sub.txt",
      content: "성경속 숨겨진 이야기를 찾아서",
      opts: "fontcolor=0xCCCCCC:fontsize=44:x=(w-text_w)/2:y=(h/2)+80",
    },
  ]);

  const vfWithScale = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,${vf}`;
  await runFfmpeg(["-y", "-i", inputVideo, "-vf", vfWithScale, ...H264_ULTRAFAST, "-an", outputVideo]);
}

export async function overlayOutro(
  inputVideo: string,
  outputVideo: string,
  _workDir: string
): Promise<void> {
  const font = getFfmpegDrawtextFontPath();
  const vf = drawtextChain(font, [
    {
      file: "outro_title.txt",
      content: "SECRET BIBLE",
      opts: "fontcolor=white:fontsize=96:x=(w-text_w)/2:y=(h/2)-160",
    },
    {
      file: "outro_l1.txt",
      content: "여기까지 저의 개인적인 생각입니다.",
      opts: "fontcolor=0xFFD700:fontsize=40:x=(w-text_w)/2:y=(h/2)+20",
    },
    {
      file: "outro_l2.txt",
      content: "여러분의 의견은 어떠신지",
      opts: "fontcolor=0xFFD700:fontsize=40:x=(w-text_w)/2:y=(h/2)+80",
    },
    {
      file: "outro_l3.txt",
      content: "많은 관심과 댓글 부탁드립니다",
      opts: "fontcolor=0xFFD700:fontsize=40:x=(w-text_w)/2:y=(h/2)+140",
    },
  ]);

  const vfWithScale = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,${vf}`;
  await runFfmpeg(["-y", "-i", inputVideo, "-vf", vfWithScale, ...H264_ULTRAFAST, "-an", outputVideo]);
}
