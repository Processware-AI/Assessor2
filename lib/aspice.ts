// ASPICE (Automotive SPICE) v4.0 process reference data used by the assessor.
// This is an abbreviated, assessment-focused knowledge base; the agent uses this
// as grounding context for evaluating uploaded deliverables.

export type CapabilityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const CAPABILITY_LEVELS: Record<CapabilityLevel, { name: string; description: string }> = {
  0: { name: "Incomplete",  description: "프로세스가 구현되지 않았거나 목적 달성에 실패함" },
  1: { name: "Performed",   description: "프로세스가 수행되어 작업 산출물이 존재함 (BP 충족)" },
  2: { name: "Managed",     description: "프로세스가 계획·모니터링·조정되며 작업 산출물이 관리됨 (GP 2.x)" },
  3: { name: "Established", description: "표준 프로세스를 테일러링하여 정의된 프로세스로 수행됨 (GP 3.x)" },
  4: { name: "Predictable", description: "정량적 관리 하에서 예측 가능하게 수행됨 (GP 4.x)" },
  5: { name: "Optimizing",  description: "지속적으로 개선되고 최적화됨 (GP 5.x)" },
};

export type AspiceProcess = {
  id: string;               // e.g. "SWE.1"
  name: string;             // e.g. "Software Requirements Analysis"
  purpose: string;
  basePractices: { id: string; title: string; description: string }[];
  workProducts: string[];   // expected artefacts to look for
};

export const ASPICE_PROCESSES: AspiceProcess[] = [
  {
    id: "SYS.1",
    name: "Requirements Elicitation",
    purpose:
      "이해관계자 요구사항을 수집·이해하고 프로젝트 수명주기 전반에 걸쳐 관리한다.",
    basePractices: [
      { id: "SYS.1.BP1", title: "이해관계자 요구사항 수집", description: "고객/이해관계자로부터 요구사항과 기대를 식별한다." },
      { id: "SYS.1.BP2", title: "요구사항 변경 이해", description: "요구사항 변경 요청을 이해하고 추적한다." },
      { id: "SYS.1.BP3", title: "고객과 합의", description: "고객과 요구사항에 대해 합의하고 문서화한다." },
      { id: "SYS.1.BP4", title: "이해관계자 요구사항 기반 확립", description: "기준선(baseline)을 설정한다." },
      { id: "SYS.1.BP5", title: "이해관계자 피드백 수립", description: "변경과 피드백을 주기적으로 수집한다." },
    ],
    workProducts: ["이해관계자 요구사항 명세서", "요구사항 변경 요청", "고객 합의서", "회의록"],
  },
  {
    id: "SYS.2",
    name: "System Requirements Analysis",
    purpose: "이해관계자 요구사항을 시스템 요구사항 집합으로 변환한다.",
    basePractices: [
      { id: "SYS.2.BP1", title: "시스템 요구사항 명세화", description: "기능/비기능/안전/환경 요구사항을 명세한다." },
      { id: "SYS.2.BP2", title: "시스템 요구사항 구조화", description: "요구사항을 그룹화·우선순위화한다." },
      { id: "SYS.2.BP3", title: "요구사항 분석", description: "기술적 실현 가능성·리스크·비용 영향 분석." },
      { id: "SYS.2.BP4", title: "영향 분석", description: "운영 환경과 다른 요소에 대한 영향 분석." },
      { id: "SYS.2.BP5", title: "양방향 추적성", description: "이해관계자 ↔ 시스템 요구사항 추적성 확립." },
      { id: "SYS.2.BP6", title: "일관성 보장", description: "요구사항 간 일관성·완전성 보장." },
      { id: "SYS.2.BP7", title: "시스템 요구사항 합의·소통", description: "관계자에 공유되고 합의됨." },
    ],
    workProducts: ["시스템 요구사항 명세서(SyRS)", "추적성 매트릭스", "분석 보고서"],
  },
  {
    id: "SYS.3",
    name: "System Architectural Design",
    purpose: "시스템 요구사항을 구현할 시스템 아키텍처 설계를 확립한다.",
    basePractices: [
      { id: "SYS.3.BP1", title: "시스템 아키텍처 개발", description: "시스템 요소(HW/SW/기계)로 분해한 아키텍처 정의." },
      { id: "SYS.3.BP2", title: "요구사항 할당", description: "시스템 요구사항을 시스템 요소에 할당." },
      { id: "SYS.3.BP3", title: "동적 행위 정의", description: "요소 간 인터페이스·상호작용·동적 행위 정의." },
      { id: "SYS.3.BP4", title: "설계 평가", description: "대안 평가·트레이드오프 분석." },
      { id: "SYS.3.BP5", title: "양방향 추적성", description: "요구사항 ↔ 아키텍처 요소 추적성." },
      { id: "SYS.3.BP6", title: "일관성 보장", description: "아키텍처와 요구사항의 일관성." },
      { id: "SYS.3.BP7", title: "합의·소통", description: "설계 공유·합의." },
    ],
    workProducts: ["시스템 아키텍처 설계서", "인터페이스 명세", "추적성 매트릭스"],
  },
  {
    id: "SWE.1",
    name: "Software Requirements Analysis",
    purpose: "시스템 요구사항 중 SW에 할당된 부분을 SW 요구사항으로 변환한다.",
    basePractices: [
      { id: "SWE.1.BP1", title: "SW 요구사항 명세화", description: "기능·성능·인터페이스·안전 요구사항 정의." },
      { id: "SWE.1.BP2", title: "구조화", description: "우선순위·분류·그룹화." },
      { id: "SWE.1.BP3", title: "기술적 타당성 분석", description: "리스크·비용·일정 영향." },
      { id: "SWE.1.BP4", title: "영향 분석", description: "운영 환경·다른 요구사항 영향." },
      { id: "SWE.1.BP5", title: "양방향 추적성", description: "시스템 요구사항 ↔ SW 요구사항 추적성." },
      { id: "SWE.1.BP6", title: "일관성 보장", description: "SW 요구사항 간 일관성·검증 가능성." },
      { id: "SWE.1.BP7", title: "합의·소통", description: "이해관계자 합의." },
    ],
    workProducts: ["SW 요구사항 명세서(SwRS)", "추적성 매트릭스", "영향 분석 보고서"],
  },
  {
    id: "SWE.2",
    name: "Software Architectural Design",
    purpose: "SW 요구사항을 구현할 SW 아키텍처 설계를 확립한다.",
    basePractices: [
      { id: "SWE.2.BP1", title: "SW 아키텍처 개발", description: "SW 컴포넌트·계층·모듈 식별." },
      { id: "SWE.2.BP2", title: "인터페이스 정의", description: "컴포넌트 간/외부 인터페이스 명세." },
      { id: "SWE.2.BP3", title: "동적 행위 기술", description: "태스크·스케줄링·리소스·타이밍." },
      { id: "SWE.2.BP4", title: "자원 소비 목표 정의", description: "ROM/RAM/CPU/네트워크 부하." },
      { id: "SWE.2.BP5", title: "대안 평가", description: "대안 분석·트레이드오프." },
      { id: "SWE.2.BP6", title: "양방향 추적성", description: "SW 요구사항 ↔ 아키텍처 추적성." },
      { id: "SWE.2.BP7", title: "일관성 보장", description: "" },
      { id: "SWE.2.BP8", title: "합의·소통", description: "" },
    ],
    workProducts: ["SW 아키텍처 설계서(SwAD)", "인터페이스 명세", "자원 사용 계획"],
  },
  {
    id: "SWE.3",
    name: "Software Detailed Design and Unit Construction",
    purpose: "SW 아키텍처를 상세 설계하고 SW 유닛을 코딩한다.",
    basePractices: [
      { id: "SWE.3.BP1", title: "SW 상세 설계", description: "SW 유닛 상세 설계(알고리즘, 데이터구조)." },
      { id: "SWE.3.BP2", title: "인터페이스 정의", description: "유닛 간 인터페이스." },
      { id: "SWE.3.BP3", title: "동적 행위 기술", description: "유닛 간 상호작용." },
      { id: "SWE.3.BP4", title: "상세 설계 평가", description: "코딩 표준·메트릭 준수." },
      { id: "SWE.3.BP5", title: "SW 유닛 개발", description: "코딩 및 정적 분석." },
      { id: "SWE.3.BP6", title: "양방향 추적성", description: "" },
      { id: "SWE.3.BP7", title: "일관성 보장", description: "" },
      { id: "SWE.3.BP8", title: "합의·소통", description: "" },
    ],
    workProducts: ["SW 상세 설계서", "SW 유닛 소스 코드", "정적 분석 보고서", "코딩 표준 문서"],
  },
  {
    id: "SWE.4",
    name: "Software Unit Verification",
    purpose: "SW 유닛이 상세 설계를 준수함을 검증한다.",
    basePractices: [
      { id: "SWE.4.BP1", title: "유닛 검증 전략 개발", description: "방법(리뷰/정적/동적)·환경·기준 정의." },
      { id: "SWE.4.BP2", title: "유닛 검증 기준 정의", description: "진입·종료·커버리지 목표." },
      { id: "SWE.4.BP3", title: "정적 검증", description: "코드 리뷰·정적 분석 수행." },
      { id: "SWE.4.BP4", title: "유닛 테스트 사례 개발", description: "경계값·에러 포함." },
      { id: "SWE.4.BP5", title: "유닛 테스트 실행", description: "실행·결과 기록." },
      { id: "SWE.4.BP6", title: "양방향 추적성", description: "상세 설계 ↔ 유닛 테스트." },
      { id: "SWE.4.BP7", title: "일관성 보장", description: "" },
      { id: "SWE.4.BP8", title: "결과 요약·소통", description: "" },
    ],
    workProducts: ["유닛 테스트 계획서", "유닛 테스트 사례/결과", "코드 리뷰 보고서", "커버리지 리포트"],
  },
  {
    id: "SWE.5",
    name: "Software Component Verification and Integration Verification",
    purpose: "SW 컴포넌트가 통합되어 SW 아키텍처대로 동작함을 검증한다.",
    basePractices: [
      { id: "SWE.5.BP1", title: "통합 전략 개발", description: "통합 순서·방식·환경." },
      { id: "SWE.5.BP2", title: "검증 전략 개발", description: "테스트/리뷰 방법·도구." },
      { id: "SWE.5.BP3", title: "통합 검증 기준 정의", description: "진입·종료·합격 기준." },
      { id: "SWE.5.BP4", title: "테스트 사례 개발", description: "인터페이스·상호작용 중심." },
      { id: "SWE.5.BP5", title: "SW 통합", description: "계획대로 통합." },
      { id: "SWE.5.BP6", title: "통합 검증 수행", description: "테스트 실행·결과 기록." },
      { id: "SWE.5.BP7", title: "양방향 추적성", description: "SW 아키텍처 ↔ 통합 테스트." },
      { id: "SWE.5.BP8", title: "일관성 보장", description: "" },
      { id: "SWE.5.BP9", title: "결과 요약·소통", description: "" },
    ],
    workProducts: ["통합 테스트 계획서", "통합 테스트 사례/결과", "테스트 환경 설정"],
  },
  {
    id: "SWE.6",
    name: "Software Verification",
    purpose: "통합된 SW가 SW 요구사항을 만족함을 검증한다.",
    basePractices: [
      { id: "SWE.6.BP1", title: "SW 검증 전략 개발", description: "방법/환경/기준." },
      { id: "SWE.6.BP2", title: "검증 기준 정의", description: "" },
      { id: "SWE.6.BP3", title: "테스트 사례 개발", description: "요구사항 기반 테스트." },
      { id: "SWE.6.BP4", title: "검증 수행", description: "실행·결과 기록." },
      { id: "SWE.6.BP5", title: "양방향 추적성", description: "SW 요구사항 ↔ 검증 결과." },
      { id: "SWE.6.BP6", title: "일관성 보장", description: "" },
      { id: "SWE.6.BP7", title: "결과 요약·소통", description: "" },
    ],
    workProducts: ["SW 검증 계획서", "검증 테스트 사례/결과", "요구사항 커버리지 매트릭스"],
  },
  {
    id: "MAN.3",
    name: "Project Management",
    purpose: "프로젝트 활동·자원을 식별·확립·통제하여 품질/일정/예산 목표를 달성한다.",
    basePractices: [
      { id: "MAN.3.BP1", title: "작업 범위 정의", description: "목표·산출물·활동 정의." },
      { id: "MAN.3.BP2", title: "프로젝트 수명주기 정의", description: "모델·단계·마일스톤." },
      { id: "MAN.3.BP3", title: "실행 가능성 평가", description: "" },
      { id: "MAN.3.BP4", title: "프로젝트 활동·자원 결정", description: "" },
      { id: "MAN.3.BP5", title: "일정 수립", description: "" },
      { id: "MAN.3.BP6", title: "인터페이스 식별", description: "" },
      { id: "MAN.3.BP7", title: "프로젝트 계획 수립", description: "" },
      { id: "MAN.3.BP8", title: "프로젝트 계획 실행·모니터링", description: "" },
      { id: "MAN.3.BP9", title: "프로젝트 계획 조정", description: "" },
      { id: "MAN.3.BP10", title: "진척/이슈 보고", description: "" },
    ],
    workProducts: ["프로젝트 계획서", "일정/WBS", "위험 등록부", "상태 보고서"],
  },
  {
    id: "SUP.1",
    name: "Quality Assurance",
    purpose: "작업 산출물과 프로세스가 정의된 요구사항·계획에 부합함을 독립적으로 보증한다.",
    basePractices: [
      { id: "SUP.1.BP1", title: "QA 전략 개발", description: "" },
      { id: "SUP.1.BP2", title: "산출물 품질 보증", description: "" },
      { id: "SUP.1.BP3", title: "프로세스 품질 보증", description: "" },
      { id: "SUP.1.BP4", title: "독립성 보장", description: "" },
      { id: "SUP.1.BP5", title: "이슈 에스컬레이션", description: "" },
    ],
    workProducts: ["QA 계획서", "QA 감사 보고서", "부적합 기록"],
  },
  {
    id: "SUP.8",
    name: "Configuration Management",
    purpose: "작업 산출물의 무결성과 일관성을 확립·유지한다.",
    basePractices: [
      { id: "SUP.8.BP1", title: "CM 전략 개발", description: "" },
      { id: "SUP.8.BP2", title: "형상 항목 식별", description: "" },
      { id: "SUP.8.BP3", title: "형상 관리 시스템 구축", description: "" },
      { id: "SUP.8.BP4", title: "기준선 생성", description: "" },
      { id: "SUP.8.BP5", title: "상태 기록·보고", description: "" },
      { id: "SUP.8.BP6", title: "형상 관리 감사", description: "" },
      { id: "SUP.8.BP7", title: "빌드/릴리즈 관리", description: "" },
    ],
    workProducts: ["CM 계획서", "형상 항목 목록", "베이스라인 기록", "릴리즈 노트"],
  },
  {
    id: "SUP.9",
    name: "Problem Resolution Management",
    purpose: "식별된 문제를 분석·해결하고 재발을 방지한다.",
    basePractices: [
      { id: "SUP.9.BP1", title: "PRM 전략 개발", description: "" },
      { id: "SUP.9.BP2", title: "문제 식별/기록", description: "" },
      { id: "SUP.9.BP3", title: "문제 영향 분석", description: "" },
      { id: "SUP.9.BP4", title: "근본 원인 분석", description: "" },
      { id: "SUP.9.BP5", title: "해결 조치", description: "" },
      { id: "SUP.9.BP6", title: "상태 추적", description: "" },
      { id: "SUP.9.BP7", title: "경향 분석", description: "" },
    ],
    workProducts: ["문제 기록부", "근본 원인 분석 보고서", "조치 기록"],
  },
  {
    id: "SUP.10",
    name: "Change Request Management",
    purpose: "변경 요청을 식별·분석·승인·추적한다.",
    basePractices: [
      { id: "SUP.10.BP1", title: "CR 관리 전략 개발", description: "" },
      { id: "SUP.10.BP2", title: "변경 요청 식별", description: "" },
      { id: "SUP.10.BP3", title: "영향 분석", description: "" },
      { id: "SUP.10.BP4", title: "변경 승인", description: "" },
      { id: "SUP.10.BP5", title: "변경 이행 및 추적", description: "" },
    ],
    workProducts: ["변경 요청 기록", "영향 분석 보고서", "CCB 회의록"],
  },
];

export function getProcess(id: string): AspiceProcess | undefined {
  return ASPICE_PROCESSES.find((p) => p.id === id);
}

export function renderProcessBrief(ids: string[]): string {
  const procs = ids.map(getProcess).filter(Boolean) as AspiceProcess[];
  return procs
    .map((p) => {
      const bps = p.basePractices
        .map((bp) => `  - ${bp.id} ${bp.title}${bp.description ? `: ${bp.description}` : ""}`)
        .join("\n");
      const wps = p.workProducts.map((w) => `  * ${w}`).join("\n");
      return `### ${p.id} — ${p.name}\n목적: ${p.purpose}\nBase Practices:\n${bps}\n기대 산출물:\n${wps}`;
    })
    .join("\n\n");
}
