"use client";

import { useEffect, useRef, useState } from "react";

type Summary = {
  id: string;
  name: string;
  version: string;
  description: string;
  updated_at: string;
};

type Props = {
  onActiveChanged?: (id: string) => void;
};

export default function StandardsManager({ onActiveChanged }: Props) {
  const [list, setList] = useState<Summary[]>([]);
  const [active, setActive] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/standards");
      const j = await res.json();
      setList(j.standards || []);
      setActive(j.active || "");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activate = async (id: string) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/standards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ activate: id }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "활성화 실패");
      setActive(id);
      setStatus(`'${id}'가 활성 표준으로 설정되었습니다.`);
      onActiveChanged?.(id);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const duplicate = async (sourceId: string) => {
    const newId = prompt("복제본의 새 ID:", `${sourceId}-copy`);
    if (!newId) return;
    const newName = prompt("복제본의 이름:", "");
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/standards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ duplicate: { source: sourceId, new_id: newId, new_name: newName || "" } }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "복제 실패");
      setStatus(`'${newId}'가 생성되었습니다.`);
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(`표준 '${id}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/standards?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "삭제 실패");
      setStatus(`'${id}'가 삭제되었습니다.`);
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const exportJson = async (id: string) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/standards?id=${encodeURIComponent(id)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "조회 실패");
      const blob = new Blob([JSON.stringify(j.standard, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `standard_${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const importJson = async (file: File) => {
    setBusy(true);
    setStatus(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch("/api/standards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ standard: parsed }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "가져오기 실패");
      setStatus(`'${parsed.id}'가 가져와졌습니다.`);
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const createBlank = async () => {
    const newId = prompt("새 표준 ID (영문, 하이픈 허용, 예: iso26262-p6):");
    if (!newId) return;
    const newName = prompt("표준 이름 (예: ISO 26262 Part 6):", newId);
    if (!newName) return;
    const version = prompt("버전 (예: 2018):", "1.0") || "1.0";

    const blank = {
      id: newId,
      name: newName,
      version,
      description: "",
      ratings: ["Met", "Partially Met", "Not Met", "NA"],
      maturity_levels: [
        { id: "L1", name: "Level 1", description: "" },
        { id: "L2", name: "Level 2", description: "" },
      ],
      harness: {
        version: 1,
        name: `${newName} Assessor`,
        description: "",
        role: "assessor",
        model: "claude-opus-4-6",
        max_tokens: 4096,
        temperature: 0.2,
        scope_item_ids: [],
        target_maturity_level: "L1",
        prompt_layers: [
          {
            id: "identity",
            label: "Identity / Persona",
            cache: true,
            editable: true,
            content: `당신은 ${newName}을(를) 기반으로 자동차 제어기 프로젝트를 평가하는 공식 어세서입니다.`,
          },
          {
            id: "reference_knowledge",
            label: "Reference Knowledge (auto-injected)",
            cache: true,
            editable: false,
            content: "<자동 주입>",
          },
          {
            id: "task",
            label: "Task Instruction",
            cache: false,
            editable: true,
            content: "업로드된 산출물을 분석하고, 각 requirement에 대한 판정을 내리세요.",
          },
          {
            id: "rubric",
            label: "Rating Rubric",
            cache: true,
            editable: true,
            content: "Met / Partially Met / Not Met / NA 등급으로 판정합니다.",
          },
          {
            id: "format",
            label: "Output Format",
            cache: false,
            editable: true,
            content: "# Assessment Report\n## 1. 평가 개요\n## 2. 산출물 인벤토리\n## 3. 프로세스별 평가",
          },
        ],
        tools: [],
        rubric: [
          { id: "completeness", label: "완전성", description: "요구사항 충족", weight: 0.5 },
          { id: "traceability", label: "추적성", description: "추적성 확립", weight: 0.5 },
        ],
        output_format: "report_markdown",
        updated_at: new Date(0).toISOString(),
      },
      reference: [],
      updated_at: new Date(0).toISOString(),
    };

    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/standards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ standard: blank }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "생성 실패");
      setStatus(`'${newId}' 생성 완료. 활성화 후 레퍼런스 탭에서 항목을 추가하세요.`);
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="text-muted text-sm">표준 목록을 불러오는 중…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">표준 프로파일 관리</h2>
        <div className="text-xs text-muted">
          {list.length}개 · 활성: <span className="text-accent">{active || "없음"}</span>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="px-3 py-1.5 text-sm rounded border border-border hover:bg-panel2 disabled:opacity-40"
          >
            JSON 가져오기
          </button>
          <button
            onClick={createBlank}
            disabled={busy}
            className="px-3 py-1.5 text-sm rounded border border-accent/40 text-accent hover:bg-accent/10 disabled:opacity-40"
          >
            + 빈 표준 생성
          </button>
        </div>
      </div>

      {status && (
        <div className="bg-panel2 border border-border rounded px-3 py-2 text-sm">{status}</div>
      )}

      <p className="text-xs text-muted">
        각 표준 프로파일은 자체 하네스 + 레퍼런스 카탈로그를 포함합니다. 활성 표준을 바꾸면
        평가 채팅과 하네스 편집기 모두 해당 표준의 설정으로 즉시 전환됩니다. 기존 표준을
        복제해 수정하는 방식으로 회사 맞춤 프리셋을 만들 수 있습니다.
      </p>

      <div className="space-y-2">
        {list.map((s) => {
          const isActive = s.id === active;
          return (
            <div
              key={s.id}
              className={`bg-panel border rounded-lg p-3 flex items-center gap-3 ${
                isActive ? "border-accent" : "border-border"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted">{s.id}</span>
                  <span className="font-medium truncate">{s.name}</span>
                  <span className="text-[10px] text-muted">v{s.version}</span>
                  {isActive && (
                    <span className="text-[10px] bg-accent/20 text-accent border border-accent/40 rounded px-1.5 py-0.5">
                      ACTIVE
                    </span>
                  )}
                </div>
                {s.description && (
                  <div className="text-xs text-muted truncate mt-0.5">{s.description}</div>
                )}
                <div className="text-[10px] text-muted mt-0.5">
                  수정: {s.updated_at ? new Date(s.updated_at).toLocaleString("ko-KR") : "-"}
                </div>
              </div>
              <div className="flex gap-1">
                {!isActive && (
                  <button
                    onClick={() => activate(s.id)}
                    disabled={busy}
                    className="px-2 py-1 text-xs rounded border border-accent/40 text-accent hover:bg-accent/10 disabled:opacity-40"
                  >
                    활성화
                  </button>
                )}
                <button
                  onClick={() => duplicate(s.id)}
                  disabled={busy}
                  className="px-2 py-1 text-xs rounded border border-border hover:bg-panel2 disabled:opacity-40"
                >
                  복제
                </button>
                <button
                  onClick={() => exportJson(s.id)}
                  disabled={busy}
                  className="px-2 py-1 text-xs rounded border border-border hover:bg-panel2 disabled:opacity-40"
                >
                  내보내기
                </button>
                <button
                  onClick={() => remove(s.id)}
                  disabled={busy || list.length <= 1}
                  className="px-2 py-1 text-xs rounded border border-border text-bad hover:bg-bad/10 disabled:opacity-40"
                  title={list.length <= 1 ? "마지막 표준은 삭제할 수 없습니다" : "삭제"}
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
