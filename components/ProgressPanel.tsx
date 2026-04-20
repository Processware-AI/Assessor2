"use client";

import type { ProgressState } from "@/lib/progress";

type Props = {
  state: ProgressState;
  mode: "chat" | "assessment";
  elapsedMs: number;
  model: string;
  targetCL: 1 | 2 | 3;
};

function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  if (m > 0) return `${m}분 ${r.toString().padStart(2, "0")}초`;
  return `${s}초`;
}

const DOT = (status: "pending" | "active" | "done") => {
  if (status === "done") return "bg-good border-good";
  if (status === "active") return "bg-accent border-accent animate-pulse";
  return "bg-panel2 border-border";
};

export default function ProgressPanel({ state, mode, elapsedMs, model, targetCL }: Props) {
  const ratingTotal =
    state.ratings.N + state.ratings["P-"] + state.ratings["P+"] +
    state.ratings["L-"] + state.ratings["L+"] + state.ratings.F + state.ratings.NR;

  return (
    <div className="bg-panel2/80 border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-accent/30" />
          <div
            className="absolute inset-0 rounded-full border-2 border-accent border-r-transparent animate-spin"
            style={{ animationDuration: "1.4s" }}
          />
          <div className="text-xs font-mono">{state.percent}%</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {mode === "assessment" ? "평가 보고서 생성 중" : "어세서 응답 중"}
          </div>
          <div className="text-[11px] text-muted truncate">
            {model} · CL{targetCL} · {fmtDuration(elapsedMs)} 경과 · {state.charCount.toLocaleString()}자
          </div>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="h-2 w-full rounded-full bg-panel border border-border overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent2 transition-all duration-300"
          style={{ width: `${state.percent}%` }}
        />
      </div>

      {/* Phase steps */}
      {state.phases.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted mb-2">진행 단계</div>
          <ol className="space-y-1.5">
            {state.phases.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full border ${DOT(p.status)}`} />
                <span
                  className={
                    p.status === "done"
                      ? "text-white"
                      : p.status === "active"
                      ? "text-accent"
                      : "text-muted"
                  }
                >
                  {p.label}
                </span>
                {p.status === "active" && (
                  <span className="ml-auto text-[10px] text-accent animate-pulse">진행중</span>
                )}
                {p.status === "done" && <span className="ml-auto text-[10px] text-good">완료</span>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Process checklist */}
      {state.processes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wide text-muted">프로세스 체크리스트</div>
            <div className="text-[10px] text-muted">
              {state.processes.filter((p) => p.status !== "pending").length} / {state.processes.length}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {state.processes.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 text-[11px] px-2 py-1 rounded border ${
                  p.status === "done"
                    ? "bg-good/10 border-good/30 text-white"
                    : p.status === "active"
                    ? "bg-accent/15 border-accent/50 text-accent animate-pulse"
                    : "bg-panel border-border text-muted"
                }`}
              >
                {p.status === "done" && <span>✓</span>}
                {p.status === "active" && <span>▸</span>}
                {p.status === "pending" && <span className="text-muted">·</span>}
                <span className="font-mono">{p.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live rating tally */}
      {ratingTotal > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted mb-2">
            BP 판정 집계 (스트리밍)
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {(["F", "L+", "L-", "P+", "P-", "N", "NR"] as const).map((k) => {
              const n = state.ratings[k];
              const color =
                k === "F"
                  ? "bg-good/20 border-good/40 text-good"
                  : k === "L+"
                  ? "bg-good/12 border-good/25 text-white"
                  : k === "L-"
                  ? "bg-good/8 border-good/15 text-white"
                  : k === "P+"
                  ? "bg-warn/20 border-warn/40 text-warn"
                  : k === "P-"
                  ? "bg-warn/10 border-warn/25 text-warn"
                  : k === "N"
                  ? "bg-bad/15 border-bad/40 text-bad"
                  : "bg-panel border-border text-muted";
              return (
                <div key={k} className={`rounded border px-1 py-1 ${color}`}>
                  <div className="font-mono text-sm">{n}</div>
                  <div className="text-[9px] text-muted">{k}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
