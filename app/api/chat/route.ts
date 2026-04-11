import { NextRequest } from "next/server";
import { loadSession, saveSession } from "@/lib/sessions";
import { loadHarness } from "@/lib/harness";
import { runAgentStream } from "@/lib/anthropic";

// SSE streaming endpoint. The client receives a sequence of
//   event: ...
//   data: {json}
// frames. Event types:
//   start   — preamble, includes scope info for the progress UI
//   delta   — incremental text fragment
//   done    — final message + usage
//   error   — aborted, with error message
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, message } = body as { session_id: string; message: string };
  if (!session_id || !message) {
    return sseErrorResponse("missing session_id or message", 400);
  }
  const session = await loadSession(session_id);
  if (!session) return sseErrorResponse("session not found", 404);

  const harness = await loadHarness();

  // Commit the user message optimistically; if we error out we roll back.
  session.messages.push({ role: "user", content: message });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, payload: unknown) => {
        const frame = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(frame));
      };

      send("start", {
        mode: "chat",
        aspice_processes: harness.aspice_processes,
        target_cl: harness.target_capability_level,
        model: harness.model,
      });

      await runAgentStream(
        {
          harness,
          history: session.messages.slice(0, -1),
          userMessage: message,
          docs: session.docs,
        },
        {
          onDelta: (delta) => send("delta", { text: delta }),
          onDone: async (result) => {
            const assistantText =
              result.text ||
              (result.toolUses.length
                ? `(도구 호출: ${result.toolUses.map((t) => t.name).join(", ")})`
                : "(응답 없음)");
            session.messages.push({ role: "assistant", content: assistantText });
            if (/^#\s*ASPICE Assessment Report/im.test(assistantText)) {
              session.report = assistantText;
            }
            await saveSession(session);
            send("done", {
              text: assistantText,
              usage: result.usage,
              stop_reason: result.stopReason,
              tool_uses: result.toolUses,
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
