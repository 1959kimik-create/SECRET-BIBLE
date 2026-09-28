import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const devUrl = process.env.SECRET_BIBLE_DEV_URL || "http://127.0.0.1:3000";

const electronBin =
  process.platform === "win32"
    ? path.join(root, "node_modules", ".bin", "electron.cmd")
    : path.join(root, "node_modules", ".bin", "electron");

const child = spawn(electronBin, ["."], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, SECRET_BIBLE_DEV_URL: devUrl },
  shell: process.platform === "win32",
});

child.on("exit", (code) => process.exit(code ?? 0));
