"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Markdown } from "./Markdown";
import ProgressPanel from "./ProgressPanel";
import { parseProgress, EMPTY_PROGRESS, type ProgressState } from "@/lib/progress";

type Msg = { role: "user" | "assistant"; content: string };
type Doc = { id: string; name: string; size: number; mime: string };
type Session = {
  id: string;
  title: string;
  messages: Msg[];
  docs: Doc[];
  report?: string;
};

type StreamMode = "chat" | "assessment";
type StreamMeta = {
  mode: StreamMode;
  aspice_processes: string[];
  target_cl: 1 | 2 | 3;
  model: string;
};

const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

// --- Minimal SSE client -----------------------------------------------------
type SseHandlers = {
  onStart?: (meta: StreamMeta) => void;
  onDelta: (text: string) => void;
  onDone: (payload: { text: string }) => void;
  onError: (err: string) => void;
};

async function streamPost(url: string, body: unknown, h: SseHandlers, signal?: AbortSignal) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    try {
      const j = await res.json();
      h.onError(j.error || `HTTP ${res.status}`);
    } catch {
      h.onError(`HTTP ${res.status}`);
    }
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE frames are separated by a blank line.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const raw of frames) {
      const lines = raw.split("\n");
      let event = "message";
      const dataLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      if (!dataLines.length) continue;
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(dataLines.join("\n"));
      } catch {
        continue;
      }
      if (event === "start" && h.onStart) h.onStart(parsed as unknown as StreamMeta);
      else if (event === "delta") h.onDelta((parsed.text as string) || "");
      else if (event === "done") h.onDone({ text: (parsed.text as string) || "" });
      else if (event === "error") h.onError((parsed.error as string) || "unknown error");
    }
  }
}
// ---------------------------------------------------------------------------

export default function ChatView() {
  const [sessions, setSessions] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Streaming state
  const [streamingText, setStreamingText] = useState<string>("");
  const [progress, setProgress] = useState<ProgressState>(EMPTY_PROGRESS);
  const [streamMeta, setStreamMeta] = useState<StreamMeta | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const streamStartRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- session load/refresh ---
  const refreshSessions = useCallback(async () => {
    const res = await fetch("/api/session");
    const j = await res.json();
    setSessions(j.sessions || []);
    return (j.sessions as { id: string; title: string; updated_at: string }[]) || [];
  }, []);

  const openSession = useCallback(async (id: string) => {
    const res = await fetch(`/api/session?id=${encodeURIComponent(id)}`);
    const j = await res.json();
    if (j.session) setActive(j.session);
  }, []);

  const newSession = useCallback(async () => {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "새 평가 세션" }),
    });
    const j = await res.json();
    await refreshSessions();
    if (j.session) setActive(j.session);
  }, [refreshSessions]);

  useEffect(() => {
    (async () => {
      const list = await refreshSessions();
      if (!list.length) await newSession();
      else await openSession(list[0].id);
    })();
  }, [refreshSessions, newSession, openSession]);

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, busy, streamingText]);

  // Elapsed time ticker while streaming
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => {
      setElapsedMs(Date.now() - streamStartRef.current);
    }, 250);
    return () => clearInterval(t);
  }, [busy]);

  // Re-parse progress whenever streamingText changes
  useEffect(() => {
    if (!streamMeta) return;
    setProgress(parseProgress(streamingText, streamMeta.aspice_processes, false));
  }, [streamingText, streamMeta]);

  const resetStreamState = () => {
    setStreamingText("");
    setProgress(EMPTY_PROGRESS);
    setStreamMeta(null);
    setElapsedMs(0);
  };

  // --- core stream invocation used by both chat and assessment ---
  const runStream = useCallback(
    async (url: string, body: unknown, displayUserMsg: string) => {
      if (!active) return;
      setBusy(true);
      setError(null);
      resetStreamState();
      streamStartRef.current = Date.now();
      abortRef.current = new AbortController();

      // Optimistic user message
      setActive((s) =>
        s ? { ...s, messages: [...s.messages, { role: "user", content: displayUserMsg }] } : s
      );

      let gotStart = false;
      let acc = "";
      try {
        await streamPost(
          url,
          body,
          {
            onStart: (meta) => {
              gotStart = true;
              setStreamMeta(meta);
            },
            onDelta: (t) => {
              acc += t;
              setStreamingText(acc);
            },
            onDone: (p) => {
              const final = p.text || acc;
              setActive((s) =>
                s
                  ? {
                      ...s,
                      messages: [...s.messages, { role: "assistant", content: final }],
                      report: /^#\s*ASPICE Assessment Report/im.test(final) ? final : s.report,
                    }
                  : s
              );
              if (streamMeta || gotStart) {
                setProgress((prev) => ({ ...prev, percent: 100, currentPhase: "done" }));
              }
            },
            onError: (e) => {
              setError(e);
              // roll back optimistic user msg
              setActive((s) => (s ? { ...s, messages: s.messages.slice(0, -1) } : s));
            },
          },
          abortRef.current.signal
        );
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
        setActive((s) => (s ? { ...s, messages: s.messages.slice(0, -1) } : s));
      } finally {
        setBusy(false);
        abortRef.current = null;
        // Keep the final progress panel visible briefly, then clear.
        setTimeout(() => resetStreamState(), 800);
      }
    },
    [active, streamMeta]
  );

  const send = useCallback(async () => {
    if (!active || !input.trim() || busy) return;
    const msg = input.trim();
    setInput("");
    await runStream("/api/chat", { session_id: active.id, message: msg }, msg);
  }, [active, input, busy, runStream]);

  const runAssessment = useCallback(async () => {
    if (!active || busy) return;
    if (!active.docs.length) {
      setError("먼저 산출물을 업로드하세요.");
      return;
    }
    await runStream("/api/assessment", { session_id: active.id }, "평가 보고서를 생성해줘");
  }, [active, busy, runStream]);

  const cancelStream = () => {
    abortRef.current?.abort();
  };

  // --- upload ---
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!active) return;
      const arr = Array.from(files);
      if (!arr.length) return;
      setUploadBusy(true);
      setError(null);
      const fd = new FormData();
      fd.append("session_id", active.id);
      for (const f of arr) fd.append("files", f);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "업로드 실패");
        await openSession(active.id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setUploadBusy(false);
      }
    },
    [active, openSession]
  );

  const removeDoc = useCallback(
    async (id: string) => {
      if (!active) return;
      const res = await fetch(
        `/api/upload?session_id=${encodeURIComponent(active.id)}&doc_id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (res.ok) await openSession(active.id);
    },
    [active, openSession]
  );

  const downloadReport = () => {
    if (!active?.report) return;
    const blob = new Blob([active.report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASPICE_Report_${active.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-12 gap-4 h-[calc(100vh-110px)]">
      {/* Sidebar */}
      <aside className="col-span-3 bg-panel border border-border rounded-lg flex flex-col min-h-0">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <button
            onClick={newSession}
            className="flex-1 px-3 py-1.5 text-sm rounded bg-accent/20 border border-accent/40 hover:bg-accent/30"
          >
            + 새 세션
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => openSession(s.id)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-border hover:bg-panel2 ${
                active?.id === s.id ? "bg-panel2" : ""
              }`}
            >
              <div className="truncate">{s.title}</div>
              <div className="text-[10px] text-muted mt-0.5">
                {new Date(s.updated_at).toLocaleString("ko-KR")}
              </div>
            </button>
          ))}
          {!sessions.length && <div className="p-4 text-sm text-muted">세션이 없습니다.</div>}
        </div>

        {active && (
          <div className="border-t border-border p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted mb-2">
              첨부 산출물 ({active.docs.length})
            </div>
            <ul className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin text-xs">
              {active.docs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-2 bg-panel2 border border-border rounded px-2 py-1"
                >
                  <span className="truncate flex-1" title={d.name}>
                    {d.name}
                  </span>
                  <span className="text-muted">{formatBytes(d.size)}</span>
                  <button
                    onClick={() => removeDoc(d.id)}
                    className="text-bad hover:text-red-300"
                    title="삭제"
                  >
                    ×
                  </button>
                </li>
              ))}
              {!active.docs.length && <li className="text-muted">업로드된 파일 없음</li>}
            </ul>
            <button
              onClick={runAssessment}
              disabled={busy || !active.docs.length}
              className="mt-3 w-full px-3 py-1.5 text-sm rounded bg-gradient-to-r from-accent to-accent2 text-white disabled:opacity-40"
            >
              평가 보고서 생성
            </button>
            {active.report && (
              <button
                onClick={downloadReport}
                className="mt-2 w-full px-3 py-1.5 text-xs rounded border border-border hover:bg-panel2"
              >
                보고서 다운로드 (.md)
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Chat panel */}
      <section className="col-span-9 bg-panel border border-border rounded-lg flex flex-col min-h-0">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-muted">세션을 선택하세요</div>
        ) : (
          <>
            <div
              className={`flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4 ${
                dragOver ? "ring-2 ring-accent/60" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                uploadFiles(e.dataTransfer.files);
              }}
            >
              {active.messages.length === 0 && !busy && (
                <div className="text-center text-muted text-sm pt-12">
                  <div className="mb-2 text-base">ASPICE Assessor에 오신 것을 환영합니다.</div>
                  <div>
                    좌측에서 자동차 제어기 프로젝트의 산출물을 업로드한 뒤 질문하거나, <br />
                    &quot;평가 보고서 생성&quot; 버튼을 눌러 보세요. 하네스 설정은 상단 메뉴에서
                    편집할 수 있습니다.
                  </div>
                </div>
              )}
              {active.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 text-sm border ${
                      m.role === "user"
                        ? "bg-accent/20 border-accent/30"
                        : "bg-panel2 border-border"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wide text-muted mb-1">
                      {m.role === "user" ? "사용자" : "어세서"}
                    </div>
                    <Markdown>{m.content}</Markdown>
                  </div>
                </div>
              ))}

              {/* In-flight streaming bubble + live progress panel */}
              {busy && (
                <div className="flex justify-start">
                  <div className="max-w-[92%] w-full space-y-3">
                    {streamMeta && (
                      <ProgressPanel
                        state={progress}
                        mode={streamMeta.mode}
                        elapsedMs={elapsedMs}
                        model={streamMeta.model}
                        targetCL={streamMeta.target_cl}
                      />
                    )}
                    <div className="bg-panel2 border border-border rounded-lg px-4 py-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] uppercase tracking-wide text-muted">
                          어세서 (스트리밍)
                        </div>
                        <button
                          onClick={cancelStream}
                          className="text-[10px] text-bad hover:text-red-300"
                        >
                          중지
                        </button>
                      </div>
                      {streamingText ? (
                        <Markdown>{streamingText}</Markdown>
                      ) : (
                        <div className="flex items-center gap-1 text-muted">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                          <span
                            className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                            style={{ animationDelay: "0.15s" }}
                          />
                          <span
                            className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                            style={{ animationDelay: "0.3s" }}
                          />
                          <span className="ml-2 text-xs">모델 준비 중…</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="px-4 py-2 text-sm text-bad border-t border-border bg-bad/10">
                {error}
              </div>
            )}

            <div className="border-t border-border p-3">
              <div className="flex gap-2 mb-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) uploadFiles(e.target.files);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadBusy}
                  className="px-3 py-1.5 text-xs rounded border border-border hover:bg-panel2 disabled:opacity-40"
                >
                  {uploadBusy ? "업로드 중…" : "+ 산출물 업로드"}
                </button>
                <span className="text-xs text-muted self-center">
                  또는 이 영역에 파일을 드래그하세요
                </span>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                  }}
                  placeholder="질문이나 지시를 입력하세요. (Ctrl/Cmd+Enter 로 전송)"
                  rows={3}
                  className="flex-1 resize-none"
                />
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
                  className="px-4 py-2 text-sm rounded bg-gradient-to-r from-accent to-accent2 text-white disabled:opacity-40"
                >
                  전송
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
