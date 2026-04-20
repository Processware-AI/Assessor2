// Bundled standard profile seeds. These are written to data/standards/{id}.json
// on first run (never overwriting user edits). Two profiles ship by default:
//
//  1. aspice-v4  — Automotive SPICE v4.0 assessor (transformed from the
//                  pre-existing lib/aspice.ts raw process data).
//  2. iso21434   — ISO/SAE 21434 cybersecurity assessor (focused subset of
//                  clauses covering TARA, concept, product development,
//                  validation, and operations).
//
// Users can create additional standards through the Standards Manager tab
// (new / duplicate / import JSON); these seeds only exist so the app has a
// working baseline on first boot.

import { DEFAULT_ASPICE_PROCESSES } from "./aspice";
import type {
  HarnessConfig,
  ReferenceItem,
  StandardProfile,
} from "./standards";

// -----------------------------------------------------------------------------
// ASPICE v4.0 profile
// -----------------------------------------------------------------------------

const ASPICE_REFERENCE: ReferenceItem[] = DEFAULT_ASPICE_PROCESSES.map((p) => ({
  id: p.id,
  name: p.name,
  purpose: p.purpose,
  requirements: p.basePractices.map((bp) => ({
    id: bp.id,
    type: "BP",
    title: bp.title,
    description: bp.description,
  })),
  workProducts: p.workProducts,
}));

const ASPICE_HARNESS: HarnessConfig = {
  version: 1,
  name: "ASPICE Assessor",
  description:
    "자동차 제어기 프로젝트 산출물을 ASPICE v4.0 기반으로 평가하는 AI 어세서. SWE/SYS/MAN/SUP 영역의 BP 충족도를 분석하고 갭과 개선안을 제시한다.",
  role: "assessor",
  model: "gpt-4o",
  max_tokens: 4096,
  temperature: 0.2,
  scope_item_ids: ASPICE_REFERENCE.map((r) => r.id),
  target_maturity_level: "CL2",
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
      id: "reference_knowledge",
      label: "Reference Knowledge (auto-injected)",
      cache: true,
      editable: false,
      content: "<자동 주입: 활성 표준의 선택된 Reference Item의 목적·요구사항·기대 산출물>",
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
          bp_id: { type: "string", description: "예: SWE.2.BP3" },
          severity: {
            type: "string",
            enum: ["strength", "minor", "major", "critical"],
          },
          rating: { type: "string", enum: ["N", "P", "L", "F", "NR"] },
          evidence: { type: "string" },
          gap: { type: "string" },
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
          needed_work_products: { type: "array", items: { type: "string" } },
          reason: { type: "string" },
        },
        required: ["needed_work_products", "reason"],
      },
    },
  ],
  rubric: [
    { id: "completeness", label: "완전성", description: "요구된 BP·Work Product의 충족 여부", weight: 0.35 },
    { id: "consistency",  label: "일관성", description: "산출물 간 상호 일관성, 추적성", weight: 0.25 },
    { id: "traceability", label: "추적성", description: "양방향 추적 관계의 명시성", weight: 0.2 },
    { id: "verification", label: "검증성", description: "검증 가능성, 테스트 결과 존재", weight: 0.2 },
  ],
  output_format: "report_markdown",
  updated_at: new Date(0).toISOString(),
};

export const ASPICE_V4_SEED: StandardProfile = {
  id: "aspice-v4",
  name: "Automotive SPICE v4.0",
  version: "4.0",
  description:
    "자동차 제어기 프로젝트의 프로세스 성숙도 평가를 위한 Automotive SPICE v4.0 어세서. SYS / SWE / MAN / SUP 프로세스 그룹을 다룹니다.",
  ratings: ["N", "P", "L", "F", "NR"],
  maturity_levels: [
    { id: "CL0", name: "Incomplete",  description: "프로세스 미구현 또는 목적 달성 실패" },
    { id: "CL1", name: "Performed",   description: "BP 충족, 작업 산출물 존재" },
    { id: "CL2", name: "Managed",     description: "GP 2.x 충족: 계획·모니터링·산출물 관리" },
    { id: "CL3", name: "Established", description: "GP 3.x 충족: 정의된 표준 프로세스 테일러링" },
    { id: "CL4", name: "Predictable", description: "정량적 관리" },
    { id: "CL5", name: "Optimizing",  description: "지속적 개선" },
  ],
  harness: ASPICE_HARNESS,
  reference: ASPICE_REFERENCE,
  updated_at: new Date(0).toISOString(),
};

// -----------------------------------------------------------------------------
// ISO/SAE 21434 profile (cybersecurity engineering)
// -----------------------------------------------------------------------------

const ISO21434_REFERENCE: ReferenceItem[] = [
  {
    id: "Clause.05",
    name: "Overall Cybersecurity Management",
    purpose: "조직 수준의 사이버보안 관리 체계(CSMS)를 확립하고 유지한다.",
    requirements: [
      { id: "RQ-05-01", type: "RQ", title: "Cybersecurity governance", description: "경영진 책임·사이버보안 정책 확립." },
      { id: "RQ-05-08", type: "RQ", title: "Cybersecurity culture",     description: "조직 내 사이버보안 의식 및 문화 조성." },
      { id: "RQ-05-09", type: "RQ", title: "Competence management",     description: "사이버보안 역량 관리 및 교육." },
      { id: "RQ-05-11", type: "RQ", title: "Information sharing",       description: "내부·외부 정보 공유 체계." },
      { id: "RQ-05-12", type: "RQ", title: "Management systems",        description: "QMS·정보보안 관리시스템과의 통합." },
      { id: "RQ-05-13", type: "RQ", title: "Tool management",           description: "도구의 관리 및 검증." },
      { id: "RQ-05-15", type: "RQ", title: "Organizational cybersecurity audit", description: "조직 단위 내부 감사 수행." },
    ],
    workProducts: [
      "WP-05-01 Cybersecurity policies, rules and processes",
      "WP-05-02 Evidence of competence management",
      "WP-05-03 Evidence of cybersecurity culture",
      "WP-05-04 Evidence of continuous improvement",
      "WP-05-05 Organizational cybersecurity audit report",
    ],
    metadata: { phase: "organization" },
  },
  {
    id: "Clause.06",
    name: "Project-dependent Cybersecurity Management",
    purpose: "프로젝트별 사이버보안 활동을 계획·조정·문서화한다.",
    requirements: [
      { id: "RQ-06-04", type: "RQ", title: "Cybersecurity responsibilities", description: "프로젝트 내 역할·책임 할당." },
      { id: "RQ-06-06", type: "RQ", title: "Cybersecurity plan",             description: "활동·작업 산출물·일정 계획." },
      { id: "RQ-06-08", type: "RQ", title: "Tailoring",                      description: "활동 테일러링 근거 문서화." },
      { id: "RQ-06-09", type: "RQ", title: "Reuse",                          description: "재사용 컴포넌트의 사이버보안 분석." },
      { id: "RQ-06-11", type: "RQ", title: "Cybersecurity case",             description: "사이버보안 케이스 수립·갱신." },
      { id: "RQ-06-15", type: "RQ", title: "Cybersecurity assessment",       description: "독립 사이버보안 평가 계획과 수행." },
      { id: "RQ-06-17", type: "RQ", title: "Release for post-development",   description: "개발 이후 단계 진입 승인." },
    ],
    workProducts: [
      "WP-06-01 Cybersecurity plan",
      "WP-06-02 Cybersecurity case",
      "WP-06-03 Cybersecurity assessment report",
      "WP-06-04 Release for post-development report",
    ],
    metadata: { phase: "project" },
  },
  {
    id: "Clause.08",
    name: "Continual Cybersecurity Activities",
    purpose: "운영 단계의 사이버보안 모니터링·취약점 관리·인시던트 대응 활동을 수행한다.",
    requirements: [
      { id: "RQ-08-02", type: "RQ", title: "Cybersecurity monitoring",        description: "정보 소스 모니터링 및 분석." },
      { id: "RQ-08-05", type: "RQ", title: "Triage",                          description: "사이버보안 이벤트 분류." },
      { id: "RQ-08-07", type: "RQ", title: "Vulnerability analysis",          description: "취약점 분석 및 공격 경로 식별." },
      { id: "RQ-08-09", type: "RQ", title: "Vulnerability management",        description: "취약점 조치와 문서화." },
    ],
    workProducts: [
      "WP-08-01 Sources of cybersecurity information",
      "WP-08-02 Triaged cybersecurity events",
      "WP-08-03 Weaknesses from vulnerability analysis",
      "WP-08-04 Vulnerability management records",
    ],
    metadata: { phase: "continual" },
  },
  {
    id: "Clause.09",
    name: "Concept Phase — TARA and Cybersecurity Concept",
    purpose: "아이템 정의, TARA 수행, 사이버보안 목표·요구사항을 도출한다.",
    requirements: [
      { id: "RQ-09-01", type: "RQ", title: "Item definition",                description: "대상 시스템·경계·환경 정의." },
      { id: "RQ-09-04", type: "RQ", title: "Cybersecurity goals",            description: "TARA 결과 기반 사이버보안 목표 도출." },
      { id: "RQ-09-05", type: "RQ", title: "Cybersecurity claims",           description: "CAL·리스크 수용 근거 문서화." },
      { id: "RQ-09-07", type: "RQ", title: "Cybersecurity concept",          description: "요구사항·검증 기준 포함 개념 설계." },
      { id: "RQ-09-08", type: "RQ", title: "Concept verification",           description: "컨셉 검증 수행." },
    ],
    workProducts: [
      "WP-09-01 Item definition",
      "WP-09-02 TARA report (threat scenarios, attack paths, risk values)",
      "WP-09-03 Cybersecurity goals",
      "WP-09-04 Cybersecurity claims",
      "WP-09-05 Cybersecurity concept",
      "WP-09-06 Verification report of cybersecurity concept",
    ],
    metadata: { phase: "concept" },
  },
  {
    id: "Clause.10",
    name: "Product Development",
    purpose: "사이버보안 요구사항을 아키텍처·설계·구현으로 구체화하고 검증한다.",
    requirements: [
      { id: "RQ-10-01", type: "RQ", title: "Design consideration",           description: "공격 경로 완화 설계 고려." },
      { id: "RQ-10-03", type: "RQ", title: "Cybersecurity specification",    description: "사이버보안 요구사항 및 아키텍처 정의." },
      { id: "RQ-10-05", type: "RQ", title: "Weakness analysis",              description: "설계 단계 약점 분석." },
      { id: "RQ-10-06", type: "RQ", title: "Integration and verification",   description: "통합 및 사이버보안 관점 검증." },
      { id: "RQ-10-11", type: "RQ", title: "Verification of specification",  description: "요구사항·설계 검증 근거 문서화." },
    ],
    workProducts: [
      "WP-10-01 Cybersecurity specifications (requirements + architecture)",
      "WP-10-02 Documentation of the modelling, design or programming languages",
      "WP-10-03 Weakness analysis report",
      "WP-10-04 Integration and verification specification",
      "WP-10-05 Integration and verification report",
    ],
    metadata: { phase: "development" },
  },
  {
    id: "Clause.11",
    name: "Cybersecurity Validation",
    purpose: "차량 수준에서 사이버보안 목표 달성 여부를 검증한다.",
    requirements: [
      { id: "RQ-11-01", type: "RQ", title: "Validation at vehicle level",    description: "목표 달성 여부 검증." },
      { id: "RQ-11-02", type: "RQ", title: "Residual risk evaluation",       description: "잔존 리스크 평가 및 수용." },
    ],
    workProducts: [
      "WP-11-01 Validation report",
      "WP-11-02 Residual risk statement",
    ],
    metadata: { phase: "validation" },
  },
  {
    id: "Clause.13",
    name: "Operations and Maintenance",
    purpose: "제품 양산 후 사이버보안 인시던트 대응 및 업데이트를 관리한다.",
    requirements: [
      { id: "RQ-13-01", type: "RQ", title: "Incident response plan",         description: "인시던트 대응 계획 수립·유지." },
      { id: "RQ-13-02", type: "RQ", title: "Update management",              description: "보안 업데이트 배포 절차." },
    ],
    workProducts: [
      "WP-13-01 Incident response plan",
      "WP-13-02 Update records",
    ],
    metadata: { phase: "post-development" },
  },
];

const ISO21434_HARNESS: HarnessConfig = {
  version: 1,
  name: "ISO/SAE 21434 Cybersecurity Assessor",
  description:
    "자동차 사이버보안 엔지니어링 표준 ISO/SAE 21434 기반으로 TARA·사이버보안 개념·제품 개발·검증·운영 단계를 평가하는 AI 어세서.",
  role: "assessor",
  model: "gpt-4o",
  max_tokens: 4096,
  temperature: 0.2,
  scope_item_ids: ISO21434_REFERENCE.map((r) => r.id),
  target_maturity_level: "CAL2",
  prompt_layers: [
    {
      id: "identity",
      label: "Identity / Persona",
      cache: true,
      editable: true,
      content: `당신은 자동차 사이버보안 엔지니어링 국제표준 ISO/SAE 21434:2021 에 정통한 독립 사이버보안 평가자입니다.
- 조직(CSMS)·프로젝트·컨셉(TARA)·개발·검증·운영 단계 전반에 걸친 평가 경험을 보유합니다.
- 평가는 반드시 업로드된 증거(Work Product, 로그, 인터뷰 기록, TARA 결과 등)에 근거합니다.
- 판정 결과는 한국어로 작성하되, Clause·RQ ID 및 Work Product 명칭은 원문 유지합니다.
- 증거가 부족하면 "Not Assessed"로 표기하고 추가 증거를 요청합니다.`,
    },
    {
      id: "reference_knowledge",
      label: "Reference Knowledge (auto-injected)",
      cache: true,
      editable: false,
      content: "<자동 주입: 활성 표준의 선택된 Clause의 요구사항·Work Product>",
    },
    {
      id: "task",
      label: "Task Instruction",
      cache: false,
      editable: true,
      content: `사용자는 자동차 사이버보안 프로젝트의 산출물(사이버보안 계획, TARA 보고서, 컨셉, 요구사항, 검증 결과, 인시던트 대응 계획 등)을 업로드합니다.
당신은 다음 절차를 따릅니다.
1) 업로드된 각 문서를 식별하고, 어떤 Work Product(WP-xx-xx)에 대응하는지 분류한다.
2) Clause별 각 RQ에 대해 Met / Partially Met / Not Met / NA 판정을 내린다.
3) 판정 근거(evidence)로 사용한 문서 이름과 해당 부분을 인용한다.
4) 갭(gap)을 식별하고, 구체적 개선 권고를 제시한다.
5) 프로젝트 수준의 잔존 리스크(residual risk)와 목표 CAL 달성 여부를 추정한다.
사용자의 단순 질문에는 간결히 답변하고, "평가 보고서" 요청 시 전체 보고서를 생성한다.`,
    },
    {
      id: "rubric",
      label: "Rating Rubric",
      cache: true,
      editable: true,
      content: `RQ 판정 등급 정의:
- Met: 요구사항 100% 충족, 증거 완전.
- Partially Met: 일부 충족, 증거 존재하나 갭 있음.
- Not Met: 요구사항 미충족 또는 증거 부재.
- NA: 해당 프로젝트에 적용되지 않음 (사유 명시 필수).
CAL(Cybersecurity Assurance Level) 개념:
- CAL1~CAL4: 영향도(Impact Rating)와 공격 실현 가능성(Attack Feasibility Rating)을 토대로 Annex E에 따라 산출되는 보증 수준.
- 본 어세서는 요구된 CAL 수준을 기준으로 증거 요구 수준을 판단합니다.`,
    },
    {
      id: "format",
      label: "Output Format",
      cache: false,
      editable: true,
      content: `보고서 출력 형식 (Markdown):
# ISO/SAE 21434 Cybersecurity Assessment Report
## 1. 평가 개요
- 대상 / 일자 / 목표 CAL / 평가 범위 Clause
## 2. 업로드 산출물 인벤토리
| 파일 | 추정 Work Product | 대응 Clause |
## 3. Clause별 평가
### {CLAUSE_ID} {CLAUSE_NAME}
#### 요구사항 판정
| RQ ID | 제목 | 판정(Met/Partially/Not/NA) | 근거 | 갭 |
#### CAL 달성 평가
#### 개선 권고
- ...
## 4. 종합 잔존 리스크 및 권고
## 5. 운영 단계 고려사항

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
          clause_id: { type: "string", description: "예: Clause.09" },
          requirement_id: { type: "string", description: "예: RQ-09-07" },
          severity: {
            type: "string",
            enum: ["strength", "minor", "major", "critical"],
          },
          rating: {
            type: "string",
            enum: ["Met", "Partially Met", "Not Met", "NA"],
          },
          evidence: { type: "string" },
          gap: { type: "string" },
          recommendation: { type: "string" },
        },
        required: ["clause_id", "rating"],
      },
    },
    {
      name: "request_more_evidence",
      description: "평가에 필요한 추가 Work Product를 요청한다.",
      enabled: true,
      input_schema: {
        type: "object",
        properties: {
          clause_id: { type: "string" },
          needed_work_products: { type: "array", items: { type: "string" } },
          reason: { type: "string" },
        },
        required: ["needed_work_products", "reason"],
      },
    },
  ],
  rubric: [
    { id: "completeness",  label: "완전성",     description: "요구 RQ·Work Product 충족 여부",      weight: 0.3 },
    { id: "risk_coverage", label: "리스크 커버리지", description: "TARA 식별 위협에 대한 대응 완전성", weight: 0.3 },
    { id: "traceability",  label: "추적성",     description: "위협 → 요구사항 → 설계 → 검증 추적",    weight: 0.2 },
    { id: "verification",  label: "검증성",     description: "검증 계획·결과 존재 및 적절성",         weight: 0.2 },
  ],
  output_format: "report_markdown",
  updated_at: new Date(0).toISOString(),
};

export const ISO21434_SEED: StandardProfile = {
  id: "iso21434",
  name: "ISO/SAE 21434:2021 Cybersecurity",
  version: "2021",
  description:
    "ISO/SAE 21434 기반 자동차 사이버보안 엔지니어링 어세서. Organizational → Concept(TARA) → Product Development → Validation → Operations 전 단계 커버.",
  ratings: ["Met", "Partially Met", "Not Met", "NA"],
  maturity_levels: [
    { id: "CAL1", name: "Cybersecurity Assurance Level 1", description: "최소 수준 보증" },
    { id: "CAL2", name: "Cybersecurity Assurance Level 2", description: "중간 수준 보증" },
    { id: "CAL3", name: "Cybersecurity Assurance Level 3", description: "높은 수준 보증" },
    { id: "CAL4", name: "Cybersecurity Assurance Level 4", description: "최고 수준 보증" },
  ],
  harness: ISO21434_HARNESS,
  reference: ISO21434_REFERENCE,
  updated_at: new Date(0).toISOString(),
};

// -----------------------------------------------------------------------------
// Registry
// -----------------------------------------------------------------------------

export const SEED_STANDARDS: StandardProfile[] = [ASPICE_V4_SEED, ISO21434_SEED];
