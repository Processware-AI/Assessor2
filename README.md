# ASPICE Assessor

자동차 제어기(ECU / 도메인 컨트롤러) 프로젝트의 산출물을 **Automotive SPICE v4.0** 기준으로
평가하는 AI 어세서 채팅 앱입니다. 에이전트는 **하네스(Harness) 구조**로 정의되며, 사용자는
웹 UI에서 하네스 설정을 열람·편집하고, 산출물(요구사항·아키텍처·상세설계·테스트 결과 등)을
업로드하여 평가 보고서를 생성할 수 있습니다.

## 주요 기능

- **채팅 기반 평가**: 업로드한 산출물을 근거로 어세서와 자연어 대화. (`/`)
- **원클릭 보고서 생성**: Base Practice 별 N/P/L/F 판정, Capability Level 추정, 개선 권고
  포함 Markdown 보고서. (사이드바의 "평가 보고서 생성")
- **산출물 업로드**: 드래그&드롭, 다중 파일 지원. 세션 단위로 관리·삭제. (`/api/upload`)
- **하네스 설정 편집기**: 정체성·모델·파라미터·프롬프트 레이어·평가 대상 프로세스·Rubric·Tool
  스키마를 웹 UI에서 직접 편집·저장·복원. (`/harness`)
- **프롬프트 캐싱**: Identity / ASPICE 지식 / Rubric 등 안정된 레이어에 `cache_control`
  브레이크포인트를 붙여 반복 호출 비용을 절감.
- **세션 영속화**: 메시지 / 업로드 / 보고서를 로컬 디스크에 JSON으로 보관.

## 구조

```
app/
  page.tsx                 # 평가 채팅 페이지
  harness/page.tsx         # 하네스 편집 페이지
  api/
    chat/route.ts          # 일반 대화
    assessment/route.ts    # 전체 보고서 생성
    upload/route.ts        # 산출물 업로드/삭제
    harness/route.ts       # 하네스 GET / PUT / DELETE
    session/route.ts       # 세션 CRUD
components/
  ChatView.tsx             # 채팅 UI + 파일 업로드
  HarnessEditor.tsx        # 하네스 편집 UI
  Markdown.tsx             # GFM Markdown 렌더러
lib/
  aspice.ts                # ASPICE v4.0 프로세스 레퍼런스 (SWE/SYS/MAN/SUP + BP)
  harness.ts               # HarnessConfig 타입 + 기본값 + 로드/저장
  anthropic.ts             # Anthropic SDK 래퍼, 프롬프트 캐싱, 에이전트 실행
  sessions.ts              # 세션 JSON 저장소
  extract.ts               # 간이 텍스트 추출
data/
  harness.json             # 저장된 하네스 (자동 생성)
  sessions/*.json          # 세션 상태
  uploads/                 # 업로드된 원본 파일
```

## 하네스(Harness) 구조

하네스는 에이전트가 어떻게 동작할지 정의하는 JSON 문서입니다. UI에서 편집 가능한 항목:

| 필드                       | 설명                                                     |
| -------------------------- | -------------------------------------------------------- |
| `name` / `description`     | 에이전트 정체성                                          |
| `role`                     | `assessor` / `reviewer` / `planner`                      |
| `model`                    | Claude 모델 선택 (Opus 4.6 / Sonnet 4.6 / Haiku 4.5)     |
| `max_tokens` / `temperature` | 생성 파라미터                                          |
| `aspice_processes`         | 평가 대상 프로세스 ID 목록 (SYS.1 … SUP.10)              |
| `target_capability_level`  | 목표 CL (1/2/3)                                          |
| `prompt_layers`            | Identity / ASPICE 지식 / Task / Rubric / Format 레이어   |
| `rubric`                   | 완전성·일관성·추적성·검증성 등 평가 차원 및 가중치       |
| `tools`                    | 에이전트가 호출할 수 있는 구조화 도구 (record_finding 등) |
| `output_format`            | 보고서 출력 형식                                         |

각 프롬프트 레이어는 `cache` 플래그를 가지며, 활성화 시 Anthropic 프롬프트 캐싱
(`cache_control: ephemeral`)이 적용됩니다.

## 설치 및 실행

```bash
cp .env.example .env.local        # ANTHROPIC_API_KEY 입력
npm install
npm run dev
# http://localhost:3000 접속
```

## 사용 흐름

1. `/harness`에서 평가 대상 프로세스와 프롬프트 레이어를 확인/조정한다.
2. `/`(평가 채팅)에서 "+ 새 세션"을 만든다.
3. 좌측 또는 채팅 영역에 산출물을 드래그하여 업로드한다 (텍스트 기반 형식 권장).
4. "평가 보고서 생성" 버튼을 클릭하면 프로세스별 BP 판정과 개선 권고를 포함한 Markdown
   보고서가 생성된다. `보고서 다운로드 (.md)` 로 저장 가능.
5. 보고서 이후에도 채팅으로 후속 질문(예: "SWE.3의 Critical 갭 상세 설명해줘")을 이어갈 수
   있다.

## 참고

- ASPICE 지식 레이어(`lib/aspice.ts`)는 평가용으로 발췌된 프로세스/BP 레퍼런스입니다. 공식
  배포본은 [VDA QMC](https://vda-qmc.de/) 를 통해 확인하세요.
- 바이너리 형식(.docx/.pdf 등)은 간이 텍스트 추출만 시도하므로, 정확한 평가를 위해서는 .md,
  .txt, .html 등 텍스트 변환본 업로드를 권장합니다.
