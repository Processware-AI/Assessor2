import { NextRequest, NextResponse } from "next/server";
import { loadSession, saveSession } from "@/lib/sessions";
import { loadHarness } from "@/lib/harness";
import { runAgent } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, message } = body as { session_id: string; message: string };
  if (!session_id || !message) {
    return NextResponse.json({ error: "missing session_id or message" }, { status: 400 });
  }
  const session = await loadSession(session_id);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  const harness = await loadHarness();

  session.messages.push({ role: "user", content: message });

  try {
    const result = await runAgent({
      harness,
      history: session.messages.slice(0, -1),
      userMessage: message,
      docs: session.docs,
    });

    const assistantText =
      result.text ||
      (result.toolUses.length
        ? `(도구 호출: ${result.toolUses.map((t) => t.name).join(", ")})`
        : "(응답 없음)");

    session.messages.push({ role: "assistant", content: assistantText });

    // If it looks like a report, cache it onto the session
    if (/^#\s*ASPICE Assessment Report/im.test(assistantText)) {
      session.report = assistantText;
    }
    await saveSession(session);

    return NextResponse.json({
      reply: assistantText,
      tool_uses: result.toolUses,
      usage: result.usage,
      stop_reason: result.stopReason,
    });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    // Don't commit the user message if we failed, so they can retry cleanly.
    session.messages.pop();
    await saveSession(session);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
