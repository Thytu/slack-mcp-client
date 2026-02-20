import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { TokenFile } from "./types.js";

const TOKEN_DIR = path.join(os.homedir(), ".slack-mcp");
const TOKEN_FILE = path.join(TOKEN_DIR, "tokens.json");

function ensureDir(): void {
  if (!fs.existsSync(TOKEN_DIR)) {
    fs.mkdirSync(TOKEN_DIR, { mode: 0o700, recursive: true });
  }
}

export function loadTokenFile(): TokenFile | null {
  try {
    const data = fs.readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(data) as TokenFile;
  } catch {
    return null;
  }
}

export function saveTokenFile(data: TokenFile): void {
  ensureDir();
  const existing = loadTokenFile() ?? {};
  const merged = { ...existing, ...data };
  const tmp = TOKEN_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(merged, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, TOKEN_FILE);
}

export function clearTokenFile(): void {
  try {
    fs.unlinkSync(TOKEN_FILE);
  } catch {
    // already gone
  }
}
