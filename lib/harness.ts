// Harness definition for the ASPICE assessment agent.
//
// The "harness" describes everything needed to make the agent behave a certain
// way: identity, model, generation params, the prompt layers (system / task /
// rubric / output format), the tool definitions it can call, which ASPICE
// processes are in scope, and a scoring rubric. It is stored as JSON on disk
// and is fully editable from the UI.

import fs from "node:fs/promises";
import path from "node:path";

export type HarnessRole = "assessor" | "planner" | "reviewer";

export type HarnessTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  enabled: boolean;
};

export type HarnessPromptLayer = {
  id: string;                 // e.g. "identity", "aspice_knowledge", "task", "rubric", "format"
  label: string;
  content: string;
  cache: boolean;             // whether to mark as a cache breakpoint
  editable: boolean;
};

export type RubricItem = {
  id: string;                 // "completeness"
  label: string;              // "완전성"
  description: string;        // what this dimension means
  weight: number;             // 0..1
};

export type HarnessConfig = {
  version: number;
  name: string;
  description: string;
  role: HarnessRole;
  model: string;              // claude-opus-4-6, claude-sonnet-4-6, ...
  max_tokens: number;
  temperature: number;
  aspice_processes: string[]; // which process IDs are in scope
  target_capability_level: 1 | 2 | 3;
  prompt_layers: HarnessPromptLayer[];
  tools: HarnessTool[];
  rubric: RubricItem[];
  output_format: "report_markdown" | "json" | "both";
  updated_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const HARNESS_FILE = path.join(DATA_DIR, "harness.json");

export const DEFAULT_HARNESS: HarnessConfig = {
  version: 1,
  name: "ASPICE Assessor",
  description:
    "자동차 제어기 프로젝트 산출물을 ASPICE v4.0 기반으로 평가하는 AI 어세서. SWE/SYS/MAN/SUP 영역의 BP 충족도를 분석하고 갭과 개선안을 제시한다.",
  role: "assessor",
  model: "claude-opus-4-6",
  max_tokens: 4096,
  temperature: 0.2,
  aspice_processes: [
    "SYS.1", "SYS.2", "SYS.3",
    "SWE.1", "SWE.2", "SWE.3", "SWE.4", "SWE.5", "SWE.6",
    "MAN.3", "SUP.1", "SUP.8", "SUP.9", "SUP.10",
  ],
  target_capability_level: 2,
  prompt_layers: [
    {
      id: "identity",
      label: "Identity / Persona",
      cache: true,
      editable: true,
      content: `당신은 자동차 제어기(ECU/도메인 컨트롤러) 프로젝트의 ASPICE v4.0 기반 공식 어세서(assessor)입니다.
- 15년 이상의 ISO/IEC 33020 및 Automotive SPICE 평가 경험이 있습니다.
- 당신의 평가는 객관적이며, 반드시 관찰된 증거(evidence)에 근거해야 합니다.
- 평가 결과는 한국어로 작성하되 프로세스 ID·BP ID·Work Product 이름은 원문을 유지합니다.
- 과도한 추측을 삼가고, 증거가 부족할 경우 "증거 부족(Not Rated / Needs More Evidence)"으로 표시합니다.`,
    },
    {
      id: "aspice_knowledge",
      label: "ASPICE Reference Knowledge",
      cache: true,
      editable: false, // auto-injected from lib/aspice.ts
      content: "<자동 주입: 선택된 ASPICE 프로세스의 목적, BP, 기대 산출물>",
    },
    {
      id: "task",
      label: "Task Instruction",
      cache: false,
      editable: true,
      content: `사용자는 자동차 제어기 프로젝트의 산출물(요구사항, 아키텍처, 상세 설계, 테스트 결과, 계획서 등)을 업로드합니다.
당신은 다음 절차를 따릅니다.
1) 업로드된 각 문서를 식별하고, 어떤 ASPICE 작업 산출물(Work Product)에 매핑되는지 분류한다.
2) 각 프로세스별 Base Practice에 대해 충족 여부(N/P/L/F: Not/Partially/Largely/Fully)를 판정한다.
3) 판정 근거(evidence)로 사용한 문서 이름과 해당 부분을 인용한다.
4) 갭(gap)을 식별하고, 구체적인 개선 권고를 제시한다.
5) 프로세스별 Capability Level 추정치를 산출한다.
사용자의 단순 질문에는 평가자 관점에서 간결히 답변하고, "평가해줘" / "보고서" 요청이 오면 전체 보고서를 생성한다.`,
    },
    {
      id: "rubric",
      label: "Rating Rubric",
      cache: true,
      editable: true,
      content: `BP 판정 등급 정의 (ISO/IEC 33020):
- N (Not achieved): 0–15% 충족. 증거가 거의 없음.
- P (Partially achieved): 16–50% 충족. 일부 증거 존재하나 불완전.
- L (Largely achieved): 51–85% 충족. 대부분 증거 존재하나 일부 약점.
- F (Fully achieved): 86–100% 충족. 완전한 증거.
Capability Level 산출:
- CL1: 모든 BP가 L 또는 F.
- CL2: CL1 + GP 2.x (작업관리, 산출물관리)가 L/F.
- CL3: CL2 + 표준 프로세스 정의/테일러링이 L/F.`,
    },
    {
      id: "format",
      label: "Output Format",
      cache: false,
      editable: true,
      content: `보고서 출력 형식 (Markdown):
# ASPICE Assessment Report
## 1. 평가 개요
- 대상 / 일자 / 평가 범위 프로세스
## 2. 업로드 산출물 인벤토리
| 파일 | 추정 Work Product | 대응 프로세스 |
## 3. 프로세스별 평가
### {PROCESS_ID} {PROCESS_NAME}
#### BP 판정 요약
| BP ID | 제목 | 판정(N/P/L/F) | 근거 | 갭 |
#### Capability Level 추정: CLx
#### 개선 권고
- ...
## 4. 종합 요약 및 권고
## 5. 위험 및 Next Steps

채팅 응답(보고서 요청이 아닐 때)에서는 짧고 명확하게 답하라.`,
    },
  ],
  tools: [
    {
      name: "record_finding",
      description:
        "평가 과정에서 발견한 개별 관찰 사항(strength/weakness/gap)을 구조화하여 기록한다.",
      enabled: true,
      input_schema: {
        type: "object",
        properties: {
          process_id: { type: "string", description: "예: SWE.2" },
          bp_id:      { type: "string", description: "예: SWE.2.BP3" },
          severity:   { type: "string", enum: ["strength", "minor", "major", "critical"] },
          rating:     { type: "string", enum: ["N", "P", "L", "F", "NR"] },
          evidence:   { type: "string", description: "인용한 문서/구절" },
          gap:        { type: "string" },
          recommendation: { type: "string" },
        },
        required: ["process_id", "severity", "rating"],
      },
    },
    {
      name: "request_more_evidence",
      description: "평가에 필요한 추가 문서/증거를 사용자에게 요청한다.",
      enabled: true,
      input_schema: {
        type: "object",
        properties: {
          process_id: { type: "string" },
          needed_work_products: {
            type: "array",
            items: { type: "string" },
          },
          reason: { type: "string" },
        },
        required: ["needed_work_products", "reason"],
      },
    },
  ],
  rubric: [
    { id: "completeness", label: "완전성",  description: "요구된 BP·Work Product의 충족 여부", weight: 0.35 },
    { id: "consistency",  label: "일관성",  description: "산출물 간 상호 일관성, 추적성",    weight: 0.25 },
    { id: "traceability", label: "추적성",  description: "양방향 추적 관계의 명시성",         weight: 0.20 },
    { id: "verification", label: "검증성",  description: "검증 가능성, 테스트 결과 존재",     weight: 0.20 },
  ],
  output_format: "report_markdown",
  updated_at: new Date(0).toISOString(),
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, "uploads"), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, "sessions"), { recursive: true });
}

export async function loadHarness(): Promise<HarnessConfig> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(HARNESS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as HarnessConfig;
    // merge any newly added defaults without clobbering user edits
    return { ...DEFAULT_HARNESS, ...parsed };
  } catch {
    await saveHarness(DEFAULT_HARNESS);
    return DEFAULT_HARNESS;
  }
}

export async function saveHarness(cfg: HarnessConfig): Promise<HarnessConfig> {
  await ensureDataDir();
  const next = { ...cfg, updated_at: new Date().toISOString() };
  await fs.writeFile(HARNESS_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export async function resetHarness(): Promise<HarnessConfig> {
  return saveHarness(DEFAULT_HARNESS);
}
