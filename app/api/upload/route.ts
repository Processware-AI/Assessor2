import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { loadSession, saveSession, newId } from "@/lib/sessions";
import { extractText } from "@/lib/extract";
import type { UploadedDoc } from "@/lib/anthropic";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const sessionId = form.get("session_id");
  if (typeof sessionId !== "string") {
    return NextResponse.json({ error: "missing session_id" }, { status: 400 });
  }
  const session = await loadSession(sessionId);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const added: UploadedDoc[] = [];

  for (const file of files) {
    const buf = Buffer.from(await file.arrayBuffer());
    const id = newId("doc");
    const safeName = file.name.replace(/[^\w.\-가-힣 ]+/g, "_");
    const diskPath = path.join(UPLOADS_DIR, `${id}__${safeName}`);
    await fs.writeFile(diskPath, buf);

    const text = extractText(file.name, file.type || "application/octet-stream", buf);

    const doc: UploadedDoc = {
      id,
      name: file.name,
      size: buf.length,
      mime: file.type || "application/octet-stream",
      content: text,
    };
    session.docs.push(doc);
    added.push(doc);
  }

  await saveSession(session);
  return NextResponse.json({
    added: added.map((d) => ({ id: d.id, name: d.name, size: d.size, mime: d.mime })),
    total_docs: session.docs.length,
  });
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const docId = req.nextUrl.searchParams.get("doc_id");
  if (!sessionId || !docId) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  const session = await loadSession(sessionId);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });
  session.docs = session.docs.filter((d) => d.id !== docId);
  await saveSession(session);
  return NextResponse.json({ ok: true, total_docs: session.docs.length });
}
