"use client";

import { useEffect, useState } from "react";

type BP = { id: string; title: string; description: string };
type Process = {
  id: string;
  name: string;
  purpose: string;
  basePractices: BP[];
  workProducts: string[];
};

const blankProcess = (id: string): Process => ({
  id,
  name: "새 프로세스",
  purpose: "",
  basePractices: [],
  workProducts: [],
});

export default function ProcessReferenceEditor() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/aspice");
      const j = await res.json();
      setProcesses(j.processes || []);
      setDirty(false);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markDirty = (next: Process[]) => {
    setProcesses(next);
    setDirty(true);
  };

  // --- mutations -----------------------------------------------------------
  const updateProcess = (idx: number, patch: Partial<Process>) => {
    const next = processes.slice();
    next[idx] = { ...next[idx], ...patch };
    markDirty(next);
  };

  const removeProcess = (id: string) => {
    if (!confirm(`${id} 프로세스를 삭제하시겠습니까?`)) return;
    markDirty(processes.filter((p) => p.id !== id));
  };

  const addProcess = () => {
    const id = prompt("새 프로세스 ID를 입력하세요 (예: SWE.7, ACME.1):");
    if (!id) return;
    if (processes.some((p) => p.id === id)) {
      alert(`이미 존재하는 ID입니다: ${id}`);
      return;
    }
    markDirty([...processes, blankProcess(id)]);
    setExpanded(new Set([...expanded, id]));
  };

  const updateBP = (procIdx: number, bpIdx: number, patch: Partial<BP>) => {
    const next = processes.slice();
    const bps = next[procIdx].basePractices.slice();
    bps[bpIdx] = { ...bps[bpIdx], ...patch };
    next[procIdx] = { ...next[procIdx], basePractices: bps };
    markDirty(next);
  };

  const addBP = (procIdx: number) => {
    const next = processes.slice();
    const p = next[procIdx];
    const bps = p.basePractices.slice();
    bps.push({
      id: `${p.id}.BP${bps.length + 1}`,
      title: "새 BP",
      description: "",
    });
    next[procIdx] = { ...p, basePractices: bps };
    markDirty(next);
  };

  const removeBP = (procIdx: number, bpIdx: number) => {
    const next = processes.slice();
    next[procIdx] = {
      ...next[procIdx],
      basePractices: next[procIdx].basePractices.filter((_, i) => i !== bpIdx),
    };
    markDirty(next);
  };

  const moveBP = (procIdx: number, bpIdx: number, dir: -1 | 1) => {
    const next = processes.slice();
    const bps = next[procIdx].basePractices.slice();
    const j = bpIdx + dir;
    if (j < 0 || j >= bps.length) return;
    [bps[bpIdx], bps[j]] = [bps[j], bps[bpIdx]];
    next[procIdx] = { ...next[procIdx], basePractices: bps };
    markDirty(next);
  };

  const updateWP = (procIdx: number, wpIdx: number, val: string) => {
    const next = processes.slice();
    const wps = next[procIdx].workProducts.slice();
    wps[wpIdx] = val;
    next[procIdx] = { ...next[procIdx], workProducts: wps };
    markDirty(next);
  };

  const addWP = (procIdx: number) => {
    const next = processes.slice();
    next[procIdx] = {
      ...next[procIdx],
      workProducts: [...next[procIdx].workProducts, "새 Work Product"],
    };
    markDirty(next);
  };

  const removeWP = (procIdx: number, wpIdx: number) => {
    const next = processes.slice();
    next[procIdx] = {
      ...next[procIdx],
      workProducts: next[procIdx].workProducts.filter((_, i) => i !== wpIdx),
    };
    markDirty(next);
  };

  // --- persistence ---------------------------------------------------------
  const saveAll = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/aspice", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ processes }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "저장 실패");
      setProcesses(j.processes);
      setDirty(false);
      setStatus(`저장되었습니다. (${j.processes.length}개 프로세스)`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const resetDefaults = async () => {
    if (
      !confirm(
        "모든 변경사항이 사라지고 기본 ASPICE v4.0 레퍼런스로 복원됩니다. 계속할까요?"
      )
    )
      return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/aspice?id=__reset__", { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "복원 실패");
      setProcesses(j.processes);
      setDirty(false);
      setStatus("기본값으로 복원되었습니다.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) => {
    const s = new Set(expanded);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setExpanded(s);
  };

  const expandAll = () => setExpanded(new Set(processes.map((p) => p.id)));
  const collapseAll = () => setExpanded(new Set());

  // --- render --------------------------------------------------------------
  if (loading) {
    return <div className="text-muted text-sm">프로세스 레퍼런스를 불러오는 중…</div>;
  }

  const totalBPs = processes.reduce((n, p) => n + p.basePractices.length, 0);
  const totalWPs = processes.reduce((n, p) => n + p.workProducts.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">프로세스 레퍼런스 편집기</h2>
        <div className="text-xs text-muted">
          {processes.length} 프로세스 · {totalBPs} BPs · {totalWPs} Work Products
          {dirty && <span className="ml-2 text-warn">● 저장되지 않은 변경</span>}
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs rounded border border-border hover:bg-panel2"
          >
            모두 펼치기
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-xs rounded border border-border hover:bg-panel2"
          >
            모두 접기
          </button>
          <button
            onClick={addProcess}
            className="px-3 py-1.5 text-sm rounded border border-accent/40 text-accent hover:bg-accent/10"
          >
            + 프로세스 추가
          </button>
          <button
            onClick={resetDefaults}
            disabled={busy}
            className="px-3 py-1.5 text-sm rounded border border-border hover:bg-panel2 disabled:opacity-40"
          >
            기본값 복원
          </button>
          <button
            onClick={saveAll}
            disabled={busy || !dirty}
            className="px-4 py-1.5 text-sm rounded bg-gradient-to-r from-accent to-accent2 text-white disabled:opacity-40"
          >
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {status && (
        <div className="bg-panel2 border border-border rounded px-3 py-2 text-sm">
          {status}
        </div>
      )}

      <p className="text-xs text-muted">
        여기서 편집한 프로세스 · Base Practice · Work Product는{" "}
        <code className="text-accent">data/aspice-processes.json</code>에 저장되며,
        저장 즉시 하네스의 ASPICE Knowledge 시스템 프롬프트에 반영됩니다. 회사별 특화
        프로세스(예: <code>ACME.1</code>)나 OEM 체크리스트를 자유롭게 추가/수정할 수
        있습니다. 프로세스 ID를 변경하면 하네스 설정의 &quot;평가 대상 프로세스&quot;
        체크박스에서 다시 선택해야 합니다.
      </p>

      {processes.map((p, pi) => {
        const isOpen = expanded.has(p.id);
        return (
          <div key={`${p.id}-${pi}`} className="bg-panel border border-border rounded-lg">
            <button
              onClick={() => toggle(p.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-panel2 rounded-t-lg"
            >
              <span className="font-mono text-xs text-accent w-20 shrink-0">{p.id}</span>
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="text-xs text-muted">
                {p.basePractices.length} BPs · {p.workProducts.length} WPs
              </span>
              <span className="text-muted">{isOpen ? "▼" : "▶"}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-border">
                <div className="grid grid-cols-3 gap-2 pt-3">
                  <label className="col-span-1">
                    <div className="text-xs text-muted mb-1">프로세스 ID</div>
                    <input
                      value={p.id}
                      onChange={(e) => updateProcess(pi, { id: e.target.value })}
                      className="w-full font-mono"
                    />
                  </label>
                  <label className="col-span-2">
                    <div className="text-xs text-muted mb-1">이름</div>
                    <input
                      value={p.name}
                      onChange={(e) => updateProcess(pi, { name: e.target.value })}
                      className="w-full"
                    />
                  </label>
                </div>

                <label className="block">
                  <div className="text-xs text-muted mb-1">목적 (Purpose)</div>
                  <textarea
                    value={p.purpose}
                    rows={2}
                    onChange={(e) => updateProcess(pi, { purpose: e.target.value })}
                    className="w-full"
                  />
                </label>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-muted">
                      Base Practices ({p.basePractices.length})
                    </div>
                    <button
                      onClick={() => addBP(pi)}
                      className="text-xs text-accent hover:underline"
                    >
                      + BP 추가
                    </button>
                  </div>
                  <div className="space-y-1">
                    {p.basePractices.map((bp, bi) => (
                      <div
                        key={bi}
                        className="grid grid-cols-12 gap-1 items-center bg-panel2 border border-border rounded p-2"
                      >
                        <input
                          className="col-span-3 font-mono text-xs"
                          value={bp.id}
                          onChange={(e) => updateBP(pi, bi, { id: e.target.value })}
                        />
                        <input
                          className="col-span-3"
                          value={bp.title}
                          onChange={(e) => updateBP(pi, bi, { title: e.target.value })}
                          placeholder="제목"
                        />
                        <input
                          className="col-span-4"
                          value={bp.description}
                          onChange={(e) =>
                            updateBP(pi, bi, { description: e.target.value })
                          }
                          placeholder="설명 (선택)"
                        />
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <button
                            onClick={() => moveBP(pi, bi, -1)}
                            disabled={bi === 0}
                            className="text-muted hover:text-white disabled:opacity-30"
                            title="위로"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveBP(pi, bi, 1)}
                            disabled={bi === p.basePractices.length - 1}
                            className="text-muted hover:text-white disabled:opacity-30"
                            title="아래로"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => removeBP(pi, bi)}
                            className="text-bad hover:text-red-300"
                            title="삭제"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    {!p.basePractices.length && (
                      <div className="text-xs text-muted italic px-2">
                        BP가 없습니다. &quot;+ BP 추가&quot;로 시작하세요.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-muted">
                      Work Products ({p.workProducts.length})
                    </div>
                    <button
                      onClick={() => addWP(pi)}
                      className="text-xs text-accent hover:underline"
                    >
                      + Work Product 추가
                    </button>
                  </div>
                  <div className="space-y-1">
                    {p.workProducts.map((wp, wi) => (
                      <div
                        key={wi}
                        className="flex gap-1 items-center bg-panel2 border border-border rounded px-2 py-1"
                      >
                        <input
                          value={wp}
                          onChange={(e) => updateWP(pi, wi, e.target.value)}
                          className="flex-1"
                        />
                        <button
                          onClick={() => removeWP(pi, wi)}
                          className="text-bad hover:text-red-300"
                          title="삭제"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {!p.workProducts.length && (
                      <div className="text-xs text-muted italic px-2">
                        Work Product가 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <button
                    onClick={() => removeProcess(p.id)}
                    className="text-xs text-bad hover:text-red-300"
                  >
                    이 프로세스 전체 삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!processes.length && (
        <div className="text-center text-muted text-sm py-8 bg-panel border border-dashed border-border rounded">
          등록된 프로세스가 없습니다. 상단 &quot;+ 프로세스 추가&quot; 또는 &quot;기본값
          복원&quot;을 사용하세요.
        </div>
      )}
    </div>
  );
}
