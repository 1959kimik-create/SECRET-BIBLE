import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { generateFinalVideo } from "../lib/video/generateFinalVideo";
import { toUserFriendlyError } from "../lib/ffmpeg/errors";
import { resolveUniquePath } from "../lib/utils/filename";
import {
  createPreviewHttpUrl,
  isAllowedPreviewFile,
  startPreviewHttpServer,
} from "../lib/electron/previewHttpServer";
import type { VideoProject } from "../lib/types";

let mainWindow: BrowserWindow | null = null;
let sessionContentBlocks: VideoProject["contentBlocks"] = [];

const isDev = !app.isPackaged;

function getDevServerUrl(): string {
  return process.env.SECRET_BIBLE_DEV_URL || "http://127.0.0.1:3000";
}

function getPreloadPath(): string {
  const besideMain = path.join(__dirname, "preload.cjs");
  if (fs.existsSync(besideMain)) return besideMain;
  return path.join(__dirname, "..", "electron", "preload.cjs");
}

function getActionsScriptPath(): string {
  const base = isDev ? process.cwd() : app.getAppPath();
  return path.join(base, "public", "secret-bible-actions.js");
}

function injectActionsScript(win: BrowserWindow) {
  const scriptPath = getActionsScriptPath();
  if (!fs.existsSync(scriptPath)) return;
  const code = fs.readFileSync(scriptPath, "utf8");
  void win.webContents.executeJavaScript(code).catch(() => {
    /* ignore */
  });
}

function createWindow() {
  const preloadPath = path.resolve(getPreloadPath());
  if (!fs.existsSync(preloadPath)) {
    dialog.showErrorBox(
      "SECRET BIBLE",
      `preload 파일을 찾을 수 없습니다.\n${preloadPath}\n\nnpm.cmd run build:electron 을 실행하세요.`
    );
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.on("console-message", (_event, _level, message) => {
    if (isDev) console.log("[renderer]", message);
  });

  const base = getDevServerUrl();
  const url = `${base}${base.includes("?") ? "&" : "?"}build=20260329i`;
  void mainWindow.loadURL(url);
  mainWindow.webContents.on("did-finish-load", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      injectActionsScript(mainWindow);
      mainWindow.setTitle(`SECRET BIBLE — ${mainWindow.webContents.getURL()}`);
      if (isDev) {
        mainWindow.webContents.openDevTools({ mode: "bottom" });
      }
    }
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error("[SECRET BIBLE] did-fail-load", errorCode, errorDescription);
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        void mainWindow.loadURL(`${getDevServerUrl()}?build=20260329i`);
      }
    }, 1500);
  });
}

function previewUrlForFile(filePath: string): string {
  const url = createPreviewHttpUrl(filePath);
  if (!url) {
    throw new Error("미리보기 URL을 만들 수 없습니다. generated 폴더의 MP4인지 확인하세요.");
  }
  return url;
}

app.whenReady().then(async () => {
  try {
    await startPreviewHttpServer();
  } catch (err) {
    console.error("[SECRET BIBLE] preview server failed", err);
    dialog.showErrorBox("SECRET BIBLE", "영상 미리보기 서버를 시작하지 못했습니다.");
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("append-content-block", async (_event, block: VideoProject["contentBlocks"][number]) => {
  sessionContentBlocks.push(block);
  return { ok: true, blocks: [...sessionContentBlocks] };
});

ipcMain.handle("get-content-blocks", async () => {
  return { ok: true, blocks: [...sessionContentBlocks] };
});

ipcMain.handle("reset-content-blocks", async () => {
  sessionContentBlocks = [];
  return { ok: true, blocks: [] };
});

ipcMain.handle("generate-video", async (_event, project: VideoProject) => {
  try {
    const filePath = await generateFinalVideo(project, (progress) => {
      mainWindow?.webContents.send("video-progress", progress);
    });
    const previewUrl = previewUrlForFile(filePath);
    return { ok: true, filePath, previewUrl };
  } catch (err) {
    return { ok: false, message: toUserFriendlyError(err) };
  }
});

ipcMain.handle(
  "save-video",
  async (_event, payload: { sourcePath: string; defaultFilename: string }) => {
    const { sourcePath, defaultFilename } = payload;
    if (!fs.existsSync(sourcePath)) {
      return { ok: false, message: "저장할 영상 파일을 찾을 수 없습니다." };
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: defaultFilename,
      filters: [{ name: "MP4 Video", extensions: ["mp4"] }],
    });

    if (canceled || !filePath) {
      return { ok: false, message: "cancelled" };
    }

    const unique = resolveUniquePath(path.dirname(filePath), path.basename(filePath));
    fs.copyFileSync(sourcePath, unique);
    return { ok: true, filePath: unique };
  }
);

ipcMain.handle("get-video-preview-url", async (_event, filePath: string) => {
  if (!isAllowedPreviewFile(filePath)) return null;
  return createPreviewHttpUrl(filePath);
});

ipcMain.handle("exit-app", () => {
  app.quit();
});

ipcMain.handle("focus-window", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.focus();
  }
});
