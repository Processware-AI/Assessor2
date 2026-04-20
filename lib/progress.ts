// Derives an "assessment progress" state by parsing the (possibly partial)
// Markdown text emitted by the streaming agent. This lets the UI render a
// phase bar + per-process checklist while generation is still in flight.

export type PhaseId =
  | "idle"
  | "preparing"
  | "overview"       // # 1. 평가 개요
  | "inventory"      // # 2. 산출물 인벤토리
  | "processes"      // # 3. 프로세스별 평가
  | "summary"        // # 4. 종합 요약
  | "risks"          // # 5. 위험/Next Steps
  | "done";

export type PhaseState = {
  id: PhaseId;
  label: string;
  status: "pending" | "active" | "done";
};

export type ProcessState = {
  id: string;              // "SWE.3"
  status: "pending" | "active" | "done";
};

export type ProgressState = {
  currentPhase: PhaseId;
  phases: PhaseState[];
  processes: ProcessState[];
  percent: number;         // 0..100
  charCount: number;
  // Rating counts harvested from a "| N/P/L/F |" markdown table while
  // streaming. Rough but fun to watch.
  ratings: { N: number; "P-": number; "P+": number; "L-": number; "L+": number; F: number; NR: number };
};

const PHASES: { id: PhaseId; label: string; marker: RegExp }[] = [
  { id: "overview",  label: "평가 개요",        marker: /^##\s*1\.\s*평가\s*개요/m },
  { id: "inventory", label: "산출물 분류",      marker: /^##\s*2\.\s*업로드\s*산출물\s*인벤토리/m },
  { id: "processes", label: "프로세스별 평가",  marker: /^##\s*3\.\s*프로세스별\s*평가/m },
  { id: "summary",   label: "종합 요약/권고",   marker: /^##\s*4\.\s*종합/m },
  { id: "risks",     label: "위험 / Next Steps", marker: /^##\s*5\.\s*위험/m },
];

// Match a table cell with just N/P/L/F/NR — very loose since we're seeing
// partial markdown tables.
const RATING_CELL = /\|\s*(N|P[+-]?|L[+-]?|F|NR)\s*\|/g;

export function parseProgress(
  text: string,
  scopeProcessIds: string[],
  isDone: boolean
): ProgressState {
  const phases: PhaseState[] = [
    { id: "preparing", label: "분석 시작", status: text.length ? "done" : "active" },
  ];
  let activeIdx = -1;
  for (let i = 0; i < PHASES.length; i++) {
    const p = PHASES[i];
    const hit = p.marker.test(text);
    phases.push({ id: p.id, label: p.label, status: hit ? "active" : "pending" });
    if (hit) activeIdx = i + 1; // +1 because of the "preparing" prefix
  }

  // Resolve active/done: the last matched phase is "active" (if not yet
  // finished), all before it are "done".
  if (activeIdx >= 0) {
    for (let i = 1; i < activeIdx; i++) phases[i].status = "done";
    if (isDone) phases[activeIdx].status = "done";
  }
  if (isDone) {
    // everything resolves to done on completion
    for (const ph of phases) ph.status = "done";
  }

  // Process detection: look for "### SWE.3" style headings within the text.
  // Rule: every process whose heading has appeared is marked "done", except
  // the most recent one — while streaming that one is "active".
  const procs: ProcessState[] = scopeProcessIds.map((id) => ({ id, status: "pending" }));
  const hitIdxs: number[] = [];
  for (let i = 0; i < procs.length; i++) {
    const pid = procs[i].id;
    const re = new RegExp(`^###\\s*${pid.replace(".", "\\.")}(?:\\s|—|-|$)`, "m");
    if (re.test(text)) hitIdxs.push(i);
  }
  for (const i of hitIdxs) procs[i].status = "done";
  if (hitIdxs.length && !isDone) {
    procs[hitIdxs[hitIdxs.length - 1]].status = "active";
  }

  // Rating tally from tables seen so far.
  const ratings = { N: 0, "P-": 0, "P+": 0, "L-": 0, "L+": 0, F: 0, NR: 0 };
  let m: RegExpExecArray | null;
  const regex = new RegExp(RATING_CELL.source, "g");
  while ((m = regex.exec(text)) !== null) {
    const key = m[1] as keyof typeof ratings;
    if (key in ratings) ratings[key]++;
  }

  // Rough percent estimate. Weight phases heavily and add sub-progress from
  // processes within the current phase.
  const phaseWeight = 100 / (PHASES.length + 1); // +1 for "preparing"
  const phasesDone = phases.filter((p) => p.status === "done").length;
  let percent = phasesDone * phaseWeight;
  if (!isDone && scopeProcessIds.length && phases.find((p) => p.id === "processes")?.status === "active") {
    const procDone = procs.filter((p) => p.status === "done").length;
    percent += (procDone / scopeProcessIds.length) * phaseWeight;
  }
  if (isDone) percent = 100;
  percent = Math.max(0, Math.min(100, Math.round(percent)));

  const currentPhase: PhaseId = isDone
    ? "done"
    : (phases.slice().reverse().find((p) => p.status === "active")?.id as PhaseId) ?? "preparing";

  return {
    currentPhase,
    phases,
    processes: procs,
    percent,
    charCount: text.length,
    ratings,
  };
}

export const EMPTY_PROGRESS: ProgressState = {
  currentPhase: "idle",
  phases: [],
  processes: [],
  percent: 0,
  charCount: 0,
  ratings: { N: 0, "P-": 0, "P+": 0, "L-": 0, "L+": 0, F: 0, NR: 0 },
};
