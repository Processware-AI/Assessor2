import { NextRequest, NextResponse } from "next/server";
import { createSession, listSessions, loadSession, deleteSession } from "@/lib/sessions";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const s = await loadSession(id);
    if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ session: s });
  }
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title : "새 평가 세션";
  const s = await createSession(title);
  return NextResponse.json({ session: s });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await deleteSession(id);
  return NextResponse.json({ ok: true });
}
