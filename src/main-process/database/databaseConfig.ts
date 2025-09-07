import { IDatabaseConfig } from "./IDatabaseConfig";
import path from "node:path";
import os from "node:os";
import { app } from "electron";

const isDev = !app.isPackaged; // true in `npm run dev`, false in production

// Choose base directory
let baseDir: string;

if (isDev) {
  // In dev → keep in project root or OS temp folder (so rebuilds don’t wipe it)
  baseDir = path.join(process.cwd());
} else {
  // In production → use Electron’s userData path (safe, persistent)
  baseDir = app.getPath("userData");
}

// Different filename based on OS if you like
let dbFile = "app.db";
switch (process.platform) {
  case "win32":
    dbFile = "app-win.db";
    break;
  case "darwin":
    dbFile = "app-mac.db";
    break;
  case "linux":
    dbFile = "app-linux.db";
    break;
}

export const databaseConfig: IDatabaseConfig = {
  version: "1.0",
  description: "Configuration for the Electron app database",
  database: {
    path: path.join(baseDir, dbFile),
    options: {
      verbose: true,
      foreignKeys: true,
      journalMode: "WAL",
    },
  },
};
