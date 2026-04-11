import { NextRequest, NextResponse } from "next/server";
import { loadSession, saveSession } from "@/lib/sessions";
import { loadHarness } from "@/lib/harness";
import { runAgent } from "@/lib/anthropic";

// Dedicated endpoint that asks the agent to produce a full assessment report
// over the currently uploaded deliverables. Separate from /api/chat so the UI
// can offer a one-click "보고서 생성" button.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id } = body as { session_id: string };
  if (!session_id) return NextResponse.json({ error: "missing session_id" }, { status: 400 });

  const session = await loadSession(session_id);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  if (!session.docs.length) {
    return NextResponse.json(
      { error: "평가할 산출물이 없습니다. 먼저 파일을 업로드하세요." },
      { status: 400 }
    );
  }

  const harness = await loadHarness();

  const prompt = `아래 업로드된 산출물 전체에 대해 ASPICE 평가 보고서를 생성하세요.
반드시 하네스의 "Output Format" 섹션에 정의된 마크다운 형식(# ASPICE Assessment Report …)을 그대로 따르세요.
대상 Capability Level: CL${harness.target_capability_level}
평가 범위 프로세스: ${harness.aspice_processes.join(", ")}
각 BP에 대해 N/P/L/F 판정과 구체적인 근거·갭·개선 권고를 포함하세요.`;

  session.messages.push({ role: "user", content: "평가 보고서를 생성해줘" });

  try {
    const result = await runAgent({
      harness,
      history: session.messages.slice(0, -1),
      userMessage: prompt,
      docs: session.docs,
    });

    const report = result.text || "(빈 보고서)";
    session.messages.push({ role: "assistant", content: report });
    session.report = report;
    await saveSession(session);

    return NextResponse.json({ report, usage: result.usage });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    session.messages.pop();
    await saveSession(session);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
