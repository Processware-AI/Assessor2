"use client";

import { useEffect, useState } from "react";

type ApiKeyStatus = {
  configured: boolean;
  masked?: string;
  source?: "file" | "env";
};

export default function ApiKeyEditor() {
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    const res = await fetch("/api/apikey");
    const data = (await res.json()) as ApiKeyStatus;
    setStatus(data);
    if (!data.configured) setShowInput(true);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!inputKey.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: inputKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error ?? "저장 실패" });
      } else {
        setStatus(data as ApiKeyStatus);
        setInputKey("");
        setShowInput(false);
        setMsg({ type: "ok", text: "API 키가 저장되었습니다." });
      }
    } catch (e) {
      setMsg({ type: "err", text: String(e) });
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!confirm("저장된 API 키를 삭제하시겠습니까?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/apikey", { method: "DELETE" });
      const data = await res.json();
      setStatus(data as ApiKeyStatus);
      setShowInput(true);
      setMsg({ type: "ok", text: "저장된 API 키가 삭제되었습니다." });
    } catch (e) {
      setMsg({ type: "err", text: String(e) });
    } finally {
      setBusy(false);
    }
  };

  if (!status) {
    return <div className="text-sm text-muted">로딩 중…</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-1">Anthropic API 키</h2>
        <p className="text-xs text-muted">
          Claude API 호출에 사용되는 키입니다. 키는 서버의 <code className="font-mono bg-panel2 px-1 rounded">data/config.json</code>에
          저장되며 Git에 커밋되지 않습니다.
          환경변수 <code className="font-mono bg-panel2 px-1 rounded">ANTHROPIC_API_KEY</code>가 설정된 경우 파일 키가 우선합니다.
        </p>
      </div>

      {/* Current key status */}
      <div className="rounded border border-border bg-panel2 p-3 text-sm space-y-1">
        {status.configured ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span className="font-mono text-xs">{status.masked}</span>
              <span className="text-muted text-xs">
                ({status.source === "file" ? "config.json" : "환경변수"})
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowInput((v) => !v); setMsg(null); }}
                className="text-xs px-2 py-1 rounded bg-panel hover:bg-border transition-colors"
              >
                {showInput ? "취소" : "키 변경"}
              </button>
              {status.source === "file" && (
                <button
                  onClick={clear}
                  disabled={busy}
                  className="text-xs px-2 py-1 rounded bg-panel hover:bg-red-900/40 text-red-400 transition-colors disabled:opacity-50"
                >
                  삭제
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            API 키가 설정되지 않았습니다.
          </div>
        )}
      </div>

      {/* Input form */}
      {showInput && (
        <div className="space-y-2">
          <label className="text-xs text-muted block">새 API 키 입력</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              placeholder="sk-ant-..."
              className="flex-1 text-sm font-mono bg-panel2 border border-border rounded px-3 py-2 focus:outline-none focus:border-accent"
              autoFocus
            />
            <button
              onClick={save}
              disabled={busy || !inputKey.trim()}
              className="text-sm px-4 py-2 rounded bg-accent text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {busy ? "저장 중…" : "저장"}
            </button>
          </div>
          <p className="text-xs text-muted">
            Anthropic Console에서 발급한 키를 붙여넣으세요 (<code className="font-mono">sk-ant-...</code>)
          </p>
        </div>
      )}

      {/* Feedback message */}
      {msg && (
        <div
          className={`text-xs px-3 py-2 rounded border ${
            msg.type === "ok"
              ? "bg-green-900/20 border-green-700 text-green-400"
              : "bg-red-900/20 border-red-700 text-red-400"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
