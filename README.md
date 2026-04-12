# Multi-Standard Automotive Assessor

자동차 제어기(ECU / 도메인 컨트롤러) 프로젝트의 산출물을 **여러 국제표준** 기반으로
평가하는 AI 어세서 채팅 앱입니다. 기본으로 **Automotive SPICE v4.0** 과
**ISO/SAE 21434:2021 사이버보안** 두 개의 표준 프로파일을 제공하며, 사용자는 이를
복제·수정하거나 완전히 새로운 표준(ISO 26262, SOTIF, 회사 사내 프로세스 등)을
UI에서 직접 생성할 수 있습니다.

## 주요 기능

- **표준 프로파일 시스템**: 하나의 표준 = `data/standards/{id}.json` 단일 파일. 하네스 +
  레퍼런스 카탈로그 + 판정 등급 + 성숙도 레벨을 모두 포함. ASPICE / ISO 21434 시드 기본
  제공.
- **활성 표준 스위칭**: 상단 헤더의 표준 선택기로 즉시 전환. 채팅 / 보고서 / 진행 패널이
  활성 표준에 맞춰 자동 재구성.
- **채팅 기반 평가**: 업로드한 산출물을 근거로 어세서와 자연어 대화. SSE 스트리밍으로
  토큰을 실시간 표시.
- **원클릭 보고서 생성**: Requirement별 판정(ASPICE는 N/P/L/F, 21434는 Met/Partially/Not/NA)
  과 성숙도 레벨 추정, 개선 권고 포함 Markdown 보고서.
- **시각 진행 패널**: 보고서 생성 중 phase → reference item → 판정 집계를 실시간 표시.
- **하네스 편집기**: 정체성·모델·프롬프트 레이어·scope·Rubric·Tool 스키마를 UI에서 편집.
- **레퍼런스 편집기**: 활성 표준의 Reference Item / Requirement(`type` 필드로 BP/RQ/PM/RC
  구분) / Work Product를 CRUD. 회사별 특화 체크리스트 추가 가능.
- **표준 관리자**: 표준 복제 / 빈 표준 생성 / JSON 가져오기 / JSON 내보내기 / 활성화 / 삭제.
- **프롬프트 캐싱**: Identity / Reference Knowledge / Rubric 등 안정 레이어에 `cache_control`
  브레이크포인트.

## 디렉터리 구조

```
app/
  page.tsx                 # 평가 채팅
  harness/page.tsx         # 3탭 (하네스 설정 / 레퍼런스 / 표준 프로파일)
  layout.tsx               # 상단 네비 + 표준 선택기
  api/
    chat/route.ts          # SSE 대화 (활성 표준 사용)
    assessment/route.ts    # SSE 보고서 생성
    upload/route.ts        # 산출물 업로드/삭제
    session/route.ts       # 세션 CRUD
    harness/route.ts       # 활성 표준의 하네스 GET/PUT/DELETE
    aspice/route.ts        # 활성 표준의 reference CRUD (legacy URL)
    standards/route.ts     # 표준 프로파일 CRUD + setActive
components/
  ChatView.tsx             # 채팅 UI + 스트리밍 + 진행 패널
  ProgressPanel.tsx        # 시각 진행 표시
  Markdown.tsx             # GFM 렌더러
  HarnessEditor.tsx        # 하네스 편집 UI
  ProcessReferenceEditor.tsx  # Reference Item CRUD
  StandardsManager.tsx     # 표준 프로파일 관리
  StandardPicker.tsx       # 헤더 선택기
lib/
  standards.ts             # StandardProfile 타입 + I/O (load/save/active/duplicate)
  seeds.ts                 # ASPICE v4 + ISO 21434 bundled seeds
  aspice.ts                # 원본 ASPICE v4 raw 데이터 (seeds.ts가 변환해서 사용)
  harness.ts               # 타입 + 레거시 shim
  anthropic.ts             # SDK 래퍼 + buildSystemBlocks (활성 표준 사용)
  progress.ts              # 스트리밍 진행 파서
  sessions.ts              # 세션 JSON 저장소
  extract.ts               # 간이 텍스트 추출
data/
  standards/               # 각 표준 프로파일 JSON (자동 생성)
    aspice-v4.json
    iso21434.json
  active_standard.json     # 현재 활성 표준 포인터
  sessions/                # 세션 상태
  uploads/                 # 업로드 원본
```

## 표준 프로파일 구조

```ts
type StandardProfile = {
  id: string;                    // "aspice-v4" | "iso21434" | ...
  name: string;
  version: string;
  description: string;
  ratings: string[];             // 허용 판정 값 (예: ["N","P","L","F","NR"])
  maturity_levels: MaturityLevel[]; // CL1..CL5, CAL1..CAL4 등
  harness: HarnessConfig;        // 표준별 튜닝된 어세서 구성
  reference: ReferenceItem[];    // 표준별 요구사항 카탈로그
};

type ReferenceItem = {
  id: string;                    // "SWE.1", "Clause.09", "ACME.CSEC"
  name: string;
  purpose: string;
  requirements: {
    id: string;                  // "SWE.1.BP1", "RQ-09-07"
    type: string;                // "BP" | "RQ" | "PM" | "RC" | ...
    title: string;
    description: string;
  }[];
  workProducts: string[];
  metadata?: Record<string, string>;  // ASIL, CAL, phase 등
};

type HarnessConfig = {
  // ...
  scope_item_ids: string[];        // 평가 범위 reference item ID
  target_maturity_level: string;   // "CL2" | "CAL2" | ...
  prompt_layers: HarnessPromptLayer[];
  tools: HarnessTool[];
  rubric: RubricItem[];
};
```

## 번들 시드

| 표준 | ID | ratings | maturity_levels | reference items |
|---|---|---|---|---|
| Automotive SPICE v4.0 | `aspice-v4` | `N / P / L / F / NR` | `CL0..CL5` | 14 (SYS.1–3, SWE.1–6, MAN.3, SUP.1/8/9/10) |
| ISO/SAE 21434:2021 | `iso21434` | `Met / Partially Met / Not Met / NA` | `CAL1..CAL4` | 7 clauses (05/06/08/09/10/11/13) |

두 시드는 `lib/seeds.ts`에 TypeScript 객체로 정의되어 있으며, 첫 실행 시
`data/standards/`에 자동으로 기록됩니다. 사용자 편집은 보존됩니다(시드가 사용자 파일을
덮어쓰지 않음).

## 새 표준 추가 방법

### 방법 1 — UI에서 복제/생성

1. `/harness` → **표준 프로파일** 탭
2. **+ 빈 표준 생성** 또는 기존 표준 옆의 **복제** 버튼
3. **활성화** 버튼으로 새 표준을 활성 상태로 전환
4. **레퍼런스** 탭에서 Reference Item / Requirement / Work Product 추가
5. **하네스 설정** 탭에서 Identity / Task / Rubric / Format 레이어를 해당 표준에 맞춰 수정

### 방법 2 — JSON 가져오기

외부에서 작성된 프로파일 JSON(`StandardProfile` 스키마)을 **JSON 가져오기** 버튼으로
업로드. `id`가 충돌하면 409 반환.

### 방법 3 — 코드에 시드 추가

`lib/seeds.ts`의 `SEED_STANDARDS` 배열에 새 프로파일을 추가. 다음 서버 시작 시 자동으로
`data/standards/{id}.json`이 생성되며 기존 사용자 편집본은 보존.

## 설치 및 실행

```bash
cp .env.example .env.local        # ANTHROPIC_API_KEY 입력
npm install
npm run dev
# http://localhost:3000 접속
```

## 사용 흐름 예시

1. 상단 **표준** 드롭다운에서 원하는 국제표준 선택 (기본: Automotive SPICE v4.0)
2. `/harness` → **하네스 설정**에서 scope와 target maturity level 확인
3. `/` 평가 채팅으로 돌아와 새 세션 생성 → 산출물 드래그 업로드 → **평가 보고서 생성**
4. 생성된 보고서 `.md` 다운로드

## 참고

- ASPICE 지식과 ISO 21434 지식은 평가 참고용 발췌입니다. 공식 문서는 각각 VDA QMC 및 ISO 에서
  확인하세요.
- 파일 추출은 텍스트 기반 형식을 권장합니다(.md / .txt / .html / .json / .csv / 소스 코드).
  `.docx` / `.pdf` 등은 best-effort 추출만 수행합니다.
