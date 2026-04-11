import { NextRequest } from "next/server";
import { loadSession, saveSession } from "@/lib/sessions";
import { loadHarness } from "@/lib/harness";
import { runAgentStream } from "@/lib/anthropic";

// SSE streaming variant of the one-click assessment report. Mirrors
// /api/chat's framing so the client can reuse the stream reader.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id } = body as { session_id: string };
  if (!session_id) return sseErrorResponse("missing session_id", 400);

  const session = await loadSession(session_id);
  if (!session) return sseErrorResponse("session not found", 404);

  if (!session.docs.length) {
    return sseErrorResponse("평가할 산출물이 없습니다. 먼저 파일을 업로드하세요.", 400);
  }

  const harness = await loadHarness();

  const prompt = `아래 업로드된 산출물 전체에 대해 ASPICE 평가 보고서를 생성하세요.
반드시 하네스의 "Output Format" 섹션에 정의된 마크다운 형식(# ASPICE Assessment Report …)을 그대로 따르세요.
대상 Capability Level: CL${harness.target_capability_level}
평가 범위 프로세스: ${harness.aspice_processes.join(", ")}
각 BP에 대해 N/P/L/F 판정과 구체적인 근거·갭·개선 권고를 포함하세요.
보고서는 섹션 번호 순서(1 → 5)대로 작성하세요.`;

  session.messages.push({ role: "user", content: "평가 보고서를 생성해줘" });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, payload: unknown) => {
        const frame = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(frame));
      };

      send("start", {
        mode: "assessment",
        aspice_processes: harness.aspice_processes,
        target_cl: harness.target_capability_level,
        model: harness.model,
        doc_count: session.docs.length,
      });

      await runAgentStream(
        {
          harness,
          history: session.messages.slice(0, -1),
          userMessage: prompt,
          docs: session.docs,
        },
        {
          onDelta: (delta) => send("delta", { text: delta }),
          onDone: async (result) => {
            const report = result.text || "(빈 보고서)";
            session.messages.push({ role: "assistant", content: report });
            session.report = report;
            await saveSession(session);
            send("done", {
              text: report,
              usage: result.usage,
              stop_reason: result.stopReason,
            });
            controller.close();
          },
          onError: async (err) => {
            session.messages.pop();
            await saveSession(session);
            const msg = err instanceof Error ? err.message : String(err);
            send("error", { error: msg });
            controller.close();
          },
        }
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function sseErrorResponse(msg: string, status: number) {
  return new Response(`event: error\ndata: ${JSON.stringify({ error: msg })}\n\n`, {
    status,
    headers: { "Content-Type": "text/event-stream; charset=utf-8" },
  });
}
