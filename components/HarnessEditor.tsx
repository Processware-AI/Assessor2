"use client";

import { useEffect, useState } from "react";

type Tool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  enabled: boolean;
};
type PromptLayer = {
  id: string;
  label: string;
  content: string;
  cache: boolean;
  editable: boolean;
};
type Rubric = { id: string; label: string; description: string; weight: number };
type Harness = {
  version: number;
  name: string;
  description: string;
  role: "assessor" | "planner" | "reviewer";
  model: string;
  max_tokens: number;
  temperature: number;
  scope_item_ids: string[];
  target_maturity_level: string;
  prompt_layers: PromptLayer[];
  tools: Tool[];
  rubric: Rubric[];
  output_format: "report_markdown" | "json" | "both";
  updated_at: string;
};
type MaturityLevel = { id: string; name: string; description: string };
type StandardMeta = {
  id: string;
  name: string;
  version: string;
  ratings: string[];
  maturity_levels: MaturityLevel[];
};

const MODEL_OPTIONS = [
  { id: "gpt-4o",        label: "GPT-4o (최고 정확도)" },
  { id: "gpt-4o-mini",   label: "GPT-4o mini (빠르고 균형)" },
  { id: "gpt-4.1",       label: "GPT-4.1 (최신, 고성능)" },
  { id: "gpt-4.1-mini",  label: "GPT-4.1 mini (경량, 빠름)" },
];

export default function HarnessEditor() {
  const [cfg, setCfg] = useState<Harness | null>(null);
  const [available, setAvailable] = useState<{ id: string; name: string }[]>([]);
  const [standard, setStandard] = useState<StandardMeta | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch("/api/harness");
    const j = await res.json();
    setCfg(j.harness);
    setAvailable(j.available_items || []);
    setStandard(j.standard || null);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!cfg) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/harness", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "저장 실패");
      setCfg(j.harness);
      setStatus("저장되었습니다.");
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!confirm("기본값으로 되돌리시겠습니까? 변경사항이 사라집니다.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/harness", { method: "DELETE" });
      const j = await res.json();
      setCfg(j.harness);
      setStatus("기본값으로 복원되었습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (!cfg) {
    return <div className="text-muted text-sm">하네스 설정을 불러오는 중…</div>;
  }

  const toggleScopeItem = (id: string) => {
    setCfg((c) =>
      c
        ? {
            ...c,
            scope_item_ids: c.scope_item_ids.includes(id)
              ? c.scope_item_ids.filter((p) => p !== id)
              : [...c.scope_item_ids, id],
          }
        : c
    );
  };

  const updateLayer = (i: number, patch: Partial<PromptLayer>) => {
    setCfg((c) => {
      if (!c) return c;
      const layers = c.prompt_layers.slice();
      layers[i] = { ...layers[i], ...patch };
      return { ...c, prompt_layers: layers };
    });
  };

  const updateTool = (i: number, patch: Partial<Tool>) => {
    setCfg((c) => {
      if (!c) return c;
      const tools = c.tools.slice();
      tools[i] = { ...tools[i], ...patch };
      return { ...c, tools };
    });
  };

  const updateRubric = (i: number, patch: Partial<Rubric>) => {
    setCfg((c) => {
      if (!c) return c;
      const rubric = c.rubric.slice();
      rubric[i] = { ...rubric[i], ...patch };
      return { ...c, rubric };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">하네스 설정</h2>
        <div className="text-xs text-muted">
          {standard && (
            <span className="mr-2">
              활성 표준: <span className="text-accent">{standard.name}</span> ({standard.version})
            </span>
          )}
          마지막 저장: {cfg.updated_at ? new Date(cfg.updated_at).toLocaleString("ko-KR") : "-"}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={reset}
            disabled={busy}
            className="px-3 py-1.5 text-sm rounded border border-border hover:bg-panel2 disabled:opacity-40"
          >
            기본값 복원
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="px-4 py-1.5 text-sm rounded bg-gradient-to-r from-accent to-accent2 text-white disabled:opacity-40"
          >
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {status && (
        <div className="bg-panel2 border border-border rounded px-3 py-2 text-sm">{status}</div>
      )}

      {/* Identity */}
      <section className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">에이전트 정체성</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs text-muted mb-1">이름</div>
            <input
              value={cfg.name}
              onChange={(e) => setCfg({ ...cfg, name: e.target.value })}
              className="w-full"
            />
          </label>
          <label className="block">
            <div className="text-xs text-muted mb-1">역할</div>
            <select
              value={cfg.role}
              onChange={(e) =>
                setCfg({ ...cfg, role: e.target.value as Harness["role"] })
              }
              className="w-full"
            >
              <option value="assessor">assessor (평가자)</option>
              <option value="reviewer">reviewer (리뷰어)</option>
              <option value="planner">planner (기획자)</option>
            </select>
          </label>
        </div>
        <label className="block">
          <div className="text-xs text-muted mb-1">설명</div>
          <textarea
            value={cfg.description}
            rows={3}
            onChange={(e) => setCfg({ ...cfg, description: e.target.value })}
            className="w-full"
          />
        </label>
      </section>

      {/* Model params */}
      <section className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">모델 및 생성 파라미터</h2>
        <div className="grid grid-cols-3 gap-3">
          <label className="block col-span-2">
            <div className="text-xs text-muted mb-1">모델</div>
            <select
              value={cfg.model}
              onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
              className="w-full"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="text-xs text-muted mb-1">출력 형식</div>
            <select
              value={cfg.output_format}
              onChange={(e) =>
                setCfg({ ...cfg, output_format: e.target.value as Harness["output_format"] })
              }
              className="w-full"
            >
              <option value="report_markdown">Markdown 보고서</option>
              <option value="json">JSON</option>
              <option value="both">Markdown + JSON</option>
            </select>
          </label>
          <label className="block">
            <div className="text-xs text-muted mb-1">max_tokens</div>
            <input
              type="number"
              value={cfg.max_tokens}
              onChange={(e) => setCfg({ ...cfg, max_tokens: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="block">
            <div className="text-xs text-muted mb-1">temperature</div>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={cfg.temperature}
              onChange={(e) => setCfg({ ...cfg, temperature: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="block">
            <div className="text-xs text-muted mb-1">목표 성숙도 Level</div>
            <select
              value={cfg.target_maturity_level}
              onChange={(e) =>
                setCfg({ ...cfg, target_maturity_level: e.target.value })
              }
              className="w-full"
            >
              {(standard?.maturity_levels?.length
                ? standard.maturity_levels
                : [{ id: cfg.target_maturity_level, name: cfg.target_maturity_level, description: "" }]
              ).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} {m.name ? `— ${m.name}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Scope items */}
      <section className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">평가 대상 (Scope)</h2>
        <p className="text-xs text-muted">
          활성 표준의 reference item 중 평가에 포함할 항목을 선택하세요.
          {standard && <> 현재 표준: <span className="text-accent">{standard.name}</span></>}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {available.map((p) => {
            const on = cfg.scope_item_ids.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleScopeItem(p.id)}
                className={`text-left text-sm px-3 py-2 rounded border ${
                  on
                    ? "bg-accent/15 border-accent/50"
                    : "bg-panel2 border-border hover:border-accent/40"
                }`}
              >
                <span className="font-mono text-xs mr-2">{p.id}</span>
                {p.name}
              </button>
            );
          })}
          {!available.length && (
            <div className="col-span-2 text-xs text-muted italic">
              활성 표준에 reference item이 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* Prompt layers */}
      <section className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">프롬프트 레이어</h2>
        <p className="text-xs text-muted">
          Identity/Task/Rubric/Format 등 여러 레이어로 분리되어 있으며, "cache" 켜진 레이어는
          프롬프트 캐싱 대상이 되어 반복 호출 비용을 줄입니다.
        </p>
        {cfg.prompt_layers.map((l, i) => (
          <div key={l.id} className="border border-border rounded p-3 bg-panel2/60 space-y-2">
            <div className="flex items-center gap-3">
              <div className="font-medium">{l.label}</div>
              <span className="text-[10px] font-mono text-muted">{l.id}</span>
              <label className="ml-auto text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={l.cache}
                  onChange={(e) => updateLayer(i, { cache: e.target.checked })}
                />
                cache
              </label>
            </div>
            {l.editable ? (
              <textarea
                value={l.content}
                rows={Math.min(14, Math.max(4, l.content.split("\n").length + 1))}
                onChange={(e) => updateLayer(i, { content: e.target.value })}
                className="w-full font-mono text-xs"
              />
            ) : (
              <div className="text-xs text-muted italic bg-panel2 rounded px-2 py-1">
                {l.content} (선택한 프로세스로부터 자동 주입)
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Rubric */}
      <section className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">평가 차원 (Rubric)</h2>
        <div className="space-y-2">
          {cfg.rubric.map((r, i) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 items-center text-sm">
              <input
                className="col-span-2"
                value={r.label}
                onChange={(e) => updateRubric(i, { label: e.target.value })}
              />
              <input
                className="col-span-7"
                value={r.description}
                onChange={(e) => updateRubric(i, { description: e.target.value })}
              />
              <label className="col-span-3 flex items-center gap-2">
                <span className="text-xs text-muted">weight</span>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  className="w-full"
                  value={r.weight}
                  onChange={(e) => updateRubric(i, { weight: Number(e.target.value) })}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">도구 (Tools)</h2>
        <p className="text-xs text-muted">
          에이전트가 사용할 수 있는 구조화 도구입니다. input_schema는 JSON으로 편집하세요.
        </p>
        {cfg.tools.map((t, i) => (
          <div key={t.name} className="border border-border rounded p-3 bg-panel2/60 space-y-2">
            <div className="flex items-center gap-3">
              <div className="font-mono text-sm">{t.name}</div>
              <label className="ml-auto text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={t.enabled}
                  onChange={(e) => updateTool(i, { enabled: e.target.checked })}
                />
                enabled
              </label>
            </div>
            <input
              className="w-full"
              value={t.description}
              onChange={(e) => updateTool(i, { description: e.target.value })}
            />
            <textarea
              className="w-full font-mono text-xs"
              rows={6}
              value={JSON.stringify(t.input_schema, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateTool(i, { input_schema: parsed });
                } catch {
                  // ignore parse errors while user types; they'll see invalid state on save
                }
              }}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
