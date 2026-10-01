# SECRET BIBLE

성경 구절과 나의 의견을 입력하면 INTRO · 본문(흰색 타이핑) · 의견(노란색 타이핑) · OUTRO · BGM이 합쳐진 MP4를 만드는 Electron + Next.js 앱입니다.

**처음이신가요?** → 프로젝트 폴더의 **[초보자_가이드.md](./초보자_가이드.md)** 를 순서대로 따라 하세요.  
Windows에서는 **`시작하기.bat`** 더블클릭으로도 실행할 수 있습니다.

## 준비물

- Node.js 20+
- `public/intro.mp4`, `public/outro.mp4`, `public/text.mp4`, `public/word.mp4`, `public/background.mp3` (없으면 `npm run assets:ensure`로 임시 파일 생성)
- 한글 폰트: `public/fonts/` (Windows에서는 `malgun.ttf` 자동 복사)

## 실행

```bat
npm.cmd install
npm.cmd run electron:dev
```

PowerShell에서 `npm` 보안 오류가 나면 **`npm.cmd`** 를 사용하세요. 또는 **`시작하기.bat`** / **`electron-dev.cmd`** 더블클릭.

브라우저만 UI 확인: `npm run dev` (영상 생성은 Electron IPC 필요)

## Vercel (웹 미리보기)

Next.js 화면만 배포됩니다. **MP4 영상 제작은 PC에서 `시작하기.bat` / Electron으로 실행**해야 합니다.

## 영상 파이프라인 테스트

```bash
npm run smoke:ffmpeg
npm run smoke:video
```

## 성경 본문 데이터

개역한글(KRV) 66권 전체는 `data/bible-text/` (권별 JSON)에 저장됩니다. 처음 클론 후 또는 본문이 없을 때:

```bash
npm run bible:fetch
```

(bolls.life KRV API에서 내려받습니다. 이용 조건·저작권은 해당 출처를 확인하세요.)

## 사용자 미디어 교체

준비한 파일을 `public/`에 덮어쓰기:

- `intro.mp4`
- `outro.mp4`
- `background.mp3`
