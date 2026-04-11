// Lightweight on-disk session store: holds chat history and attached
// deliverables for a single assessment session. Good enough for a local
// dev tool; swap for a real DB later.

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { ChatMessage, UploadedDoc } from "./anthropic";

const SESSIONS_DIR = path.join(process.cwd(), "data", "sessions");
const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

export type Session = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  docs: UploadedDoc[];
  report?: string;
};

async function ensureDirs() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export function newId(prefix: string = "s"): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export async function listSessions(): Promise<Pick<Session, "id" | "title" | "updated_at">[]> {
  await ensureDirs();
  const files = await fs.readdir(SESSIONS_DIR);
  const out: Pick<Session, "id" | "title" | "updated_at">[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(SESSIONS_DIR, f), "utf-8");
      const s = JSON.parse(raw) as Session;
      out.push({ id: s.id, title: s.title, updated_at: s.updated_at });
    } catch {}
  }
  out.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  return out;
}

export async function loadSession(id: string): Promise<Session | null> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(path.join(SESSIONS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function saveSession(s: Session): Promise<Session> {
  await ensureDirs();
  s.updated_at = new Date().toISOString();
  await fs.writeFile(path.join(SESSIONS_DIR, `${s.id}.json`), JSON.stringify(s, null, 2), "utf-8");
  return s;
}

export async function createSession(title: string = "새 평가 세션"): Promise<Session> {
  const now = new Date().toISOString();
  const s: Session = {
    id: newId("ses"),
    title,
    created_at: now,
    updated_at: now,
    messages: [],
    docs: [],
  };
  return saveSession(s);
}

export async function deleteSession(id: string): Promise<void> {
  await ensureDirs();
  try {
    await fs.unlink(path.join(SESSIONS_DIR, `${id}.json`));
  } catch {}
}
