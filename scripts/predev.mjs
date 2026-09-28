import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function removeNextDevLock() {
  const lock = path.join(root, ".next", "dev", "lock");
  if (fs.existsSync(lock)) {
    fs.unlinkSync(lock);
    console.log("Removed stale Next.js dev lock.");
  }
}

function killWindowsPort(port) {
  if (process.platform !== "win32") return;
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Freed port ${port} (stopped PID ${pid}).`);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* port free */
  }
}

removeNextDevLock();
killWindowsPort(3000);
killWindowsPort(3001);
