import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getApiKey, setApiKey, hasApiKey, maskApiKey } from "@/lib/apikey";
import { resetClient } from "@/lib/anthropic";

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

// GET  /api/apikey → { configured: bool, masked?: string, source?: "file"|"env" }
// POST /api/apikey { key: string | null } → save or clear the stored key
// DELETE /api/apikey → clear the stored key (env var fallback still works)

export async function GET() {
  const key = await getApiKey();
  if (!key) {
    return NextResponse.json({ configured: false });
  }

  let source: "file" | "env" = "env";
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    const cfg = JSON.parse(raw) as { anthropic_api_key?: string };
    if (cfg.anthropic_api_key) source = "file";
  } catch {
    // no config file → env
  }

  return NextResponse.json({
    configured: true,
    masked: maskApiKey(key),
    source,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { key?: string | null };
  const key = body.key ?? null;

  if (key !== null && typeof key !== "string") {
    return NextResponse.json({ error: "key must be a string or null" }, { status: 400 });
  }
  if (key !== null && key.trim() === "") {
    return NextResponse.json({ error: "key must not be empty" }, { status: 400 });
  }

  await setApiKey(key === null ? null : key.trim());
  resetClient();

  const configured = await hasApiKey();
  const newKey = await getApiKey();
  return NextResponse.json({
    configured,
    masked: newKey ? maskApiKey(newKey) : undefined,
  });
}

export async function DELETE() {
  await setApiKey(null);
  resetClient();

  const configured = await hasApiKey();
  const key = await getApiKey();
  return NextResponse.json({
    configured,
    masked: key ? maskApiKey(key) : undefined,
  });
}
