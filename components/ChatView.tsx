"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Markdown } from "./Markdown";

type Msg = { role: "user" | "assistant"; content: string };
type Doc = { id: string; name: string; size: number; mime: string };
type Session = {
  id: string;
  title: string;
  messages: Msg[];
  docs: Doc[];
  report?: string;
};

const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

export default function ChatView() {
  const [sessions, setSessions] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSessions = useCallback(async () => {
    const res = await fetch("/api/session");
    const j = await res.json();
    setSessions(j.sessions || []);
    return j.sessions as { id: string; title: string; updated_at: string }[];
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
      if (!list.length) {
        await newSession();
      } else {
        await openSession(list[0].id);
      }
    })();
  }, [refreshSessions, newSession, openSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, busy]);

  const send = useCallback(async () => {
    if (!active || !input.trim() || busy) return;
    const msg = input.trim();
    setInput("");
    setBusy(true);
    setError(null);

    // Optimistic
    setActive((s) => (s ? { ...s, messages: [...s.messages, { role: "user", content: msg }] } : s));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: active.id, message: msg }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "요청 실패");
      setActive((s) =>
        s ? { ...s, messages: [...s.messages, { role: "assistant", content: j.reply }] } : s
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      // roll back optimistic user msg
      setActive((s) => (s ? { ...s, messages: s.messages.slice(0, -1) } : s));
    } finally {
      setBusy(false);
    }
  }, [active, input, busy]);

  const runAssessment = useCallback(async () => {
    if (!active || busy) return;
    if (!active.docs.length) {
      setError("먼저 산출물을 업로드하세요.");
      return;
    }
    setBusy(true);
    setError(null);
    setActive((s) =>
      s ? { ...s, messages: [...s.messages, { role: "user", content: "평가 보고서를 생성해줘" }] } : s
    );
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: active.id }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "보고서 생성 실패");
      setActive((s) =>
        s ? { ...s, messages: [...s.messages, { role: "assistant", content: j.report }], report: j.report } : s
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setActive((s) => (s ? { ...s, messages: s.messages.slice(0, -1) } : s));
    } finally {
      setBusy(false);
    }
  }, [active, busy]);

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
          {!sessions.length && (
            <div className="p-4 text-sm text-muted">세션이 없습니다.</div>
          )}
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
              {active.messages.length === 0 && (
                <div className="text-center text-muted text-sm pt-12">
                  <div className="mb-2 text-base">ASPICE Assessor에 오신 것을 환영합니다.</div>
                  <div>
                    좌측에서 자동차 제어기 프로젝트의 산출물을 업로드한 뒤 질문하거나, <br />
                    "평가 보고서 생성" 버튼을 눌러 보세요. 하네스 설정은 상단 메뉴에서 편집할 수 있습니다.
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
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-panel2 border border-border rounded-lg px-4 py-3 text-sm text-muted">
                    어세서가 분석 중입니다…
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
