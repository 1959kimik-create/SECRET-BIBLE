const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("secretBible", {
  appendContentBlock: (block) => ipcRenderer.invoke("append-content-block", block),
  getContentBlocks: () => ipcRenderer.invoke("get-content-blocks"),
  resetContentBlocks: () => ipcRenderer.invoke("reset-content-blocks"),
  generateVideo: (project) => ipcRenderer.invoke("generate-video", project),
  saveVideo: (sourcePath, defaultFilename) =>
    ipcRenderer.invoke("save-video", { sourcePath, defaultFilename }),
  exitApp: () => ipcRenderer.invoke("exit-app"),
  onProgress: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("video-progress", listener);
    return () => ipcRenderer.removeListener("video-progress", listener);
  },
  getVideoPreviewUrl: (filePath) => ipcRenderer.invoke("get-video-preview-url", filePath),
});
