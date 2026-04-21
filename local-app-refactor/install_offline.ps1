# ASPICE Workbench — 오프라인 설치 스크립트
# 저장 후 실행: powershell -ExecutionPolicy Bypass -File install.ps1

$target = "C:\Users\LG\aspice-app\src"
$ErrorActionPreference = "Stop"

function Write-UTF8 { param($path, $text)
  $dir = Split-Path $path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($path, $text, [System.Text.Encoding]::UTF8)
}

# 기존 App.jsx 백업
$backup = "$target\App.jsx.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (Test-Path "$target\App.jsx") { Copy-Item "$target\App.jsx" $backup; Write-Host "백업: $backup" -ForegroundColor Cyan }

# data/aspice.js — 기존 App.jsx에서 ASPICE_DATA 추출
Write-Host "추출: data/aspice.js" -ForegroundColor Yellow
$orig = [System.IO.File]::ReadAllText("$target\App.jsx", [System.Text.Encoding]::UTF8)
$m = [regex]::Match($orig, "const ASPICE_DATA = JSON\.parse\(`({.*?})`\)", [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($m.Success) {
  $json = $m.Groups[1].Value
  $aspice = "// ASPICE PAM v4.0 process definitions`nexport const ASPICE_DATA = JSON.parse(`` $json ``);"
  Write-UTF8 "$target\data\aspice.js" $aspice
  Write-Host "OK  data/aspice.js" -ForegroundColor Green
} else { Write-Host "경고: ASPICE_DATA 추출 실패 — aspice.js 수동 생성 필요" -ForegroundColor Red }

Write-Host "OK  App.jsx" -ForegroundColor Green
Write-UTF8 "$target\App.jsx" @'
import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { ASPICE_DATA } from "./data/aspice";
import { getFormatByName } from "./data/processData";
import { T, FONT_CSS } from "./theme";
import { toBase64, extractDocxText, extractXlsxText, readFileAsText } from "./utils/fileReader";
import { detectProcess } from "./utils/detectProcess";
import { downloadTxt } from "./utils/exportTxt";
import { downloadPdf } from "./utils/exportPdf";
import { useHistory } from "./hooks/useHistory";
import { ProcessSidebar } from "./components/ProcessSidebar";
import { ProcessInfo } from "./components/ProcessInfo";
import { FileImportPanel } from "./components/FileImportPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { ReportPanel } from "./components/ReportPanel";
import { ConfirmModal } from "./components/ConfirmModal";

export default function App() {
  const [selectedProcess, setSelectedProcess] = useState("SYS.2");
  const [fileB64, setFileB64] = useState(null);
  const [fileText, setFileText] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileMediaType, setFileMediaType] = useState("application/pdf");
  const [autoDetected, setAutoDetected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const reportRef = useRef(null);
  const { history, addEntry, removeEntry, clearAll } = useHistory();

  // Inject Google Fonts
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONT_CSS;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  const proc = ASPICE_DATA[selectedProcess];

  // Derived display state — history view overrides live results
  const viewingHistory = selectedHistoryId ? history.find(h => h.id === selectedHistoryId) : null;
  const displayResults  = viewingHistory ? viewingHistory.results  : results;
  const displayProc     = viewingHistory ? (ASPICE_DATA[viewingHistory.processId] || proc) : proc;
  const displayFileName = viewingHistory ? viewingHistory.fileName : fileName;
  const displayFileSize = viewingHistory ? viewingHistory.fileSize : fileSize;
  const displayDate     = viewingHistory ? new Date(viewingHistory.date) : new Date();

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fmt = getFormatByName(f.name);
    if (!fmt) { setError("지원형식: PDF, DOC, DOCX, XLSX, MD"); return; }
    if (f.size > 30 * 1024 * 1024) { setError("파일 크기가 30MB를 초과합니다."); return; }

    setFileB64(null); setFileText(null);
    if (fmt.mode === "pdf")       setFileB64(await toBase64(f));
    else if (fmt.mode === "docx") setFileText(await extractDocxText(f));
    else if (fmt.mode === "xlsx") setFileText(await extractXlsxText(f));
    else                          setFileText(await readFileAsText(f));

    setFileName(f.name); setFileSize(f.size); setFileMediaType(fmt.mediaType);
    setError(""); setResults(null); setSelectedHistoryId(null);

    const detected = detectProcess(f.name);
    setAutoDetected(detected || null);
    if (detected) setSelectedProcess(detected);
  };

  const resetAll = () => {
    setFileB64(null); setFileText(null); setFileName(""); setFileSize(0);
    setFileMediaType("application/pdf");
    setResults(null); setError(""); setPhase("");
    setSelectedHistoryId(null); setAutoDetected(null);
  };

  // ── Sample data ────────────────────────────────────────────────────────────
  const loadSample = () => {
    const cycle = ["F", "L+", "L-", "P+", "P-", "N", "F", "L+"];
    const rationales = [
      "요구사항 명세서에 기능/비기능 요건이 체계적으로 작성되어 있으며, 우선순위 분류 및 ID 관리가 이루어짐.",
      "아키텍처 설계서에 정적/동적 측면이 포함되어 있으나, 일부 인터페이스 정의 미흡.",
      "통합 검증 절차서가 작성되었으나, 일부 추적성 링크가 누락됨.",
      "부분적인 설계 검토 회의가 진행되었으나, HW 의존성 분석 및 타이밍 분석이 미흡함.",
      "형상관리 도구(Polarion)가 연동되어 있으며, 전체 요구사항과의 양방향 추적성 확인됨.",
      "수행 증거가 확인되지 않음. 관련 산출물 미존재 상태로 의견.",
      "단위 테스트 케이스가 Teamer에 작성되어 있으며 전체 요구사항과의 커버리지 확인됨.",
      "변경 요청 처리가 일부 누락되어 추적성이 불완전함.",
    ];
    const evidences = [
      "SRS_v2.3.docx §3.2 Functional Requirements · §4.1 Non-functional (pp.12–18)",
      "SWAD_v1.4.docx §2 Architecture Overview · Sequence Diagram pp.22–31",
      "TechFeasibility_Review_MoM_2026-02-14.pdf · Action item 3건 확인",
      "ImpactAnalysis_v1.1.xlsx — HW 인터페이스 Network/Timing 분석 항목",
      "Polarion Traceability Report 2026-03-28 (100% coverage, 0 orphans)",
      "없음",
      "Impact_Analysis.xlsx vs SRS_v2.3 §3.2 — 3개 항목 이행",
      "없음",
    ];
    const ratings = proc.bps.map((bp, i) => ({
      bp: bp.id,
      rating: cycle[i % cycle.length],
      rationale: rationales[i % rationales.length],
      evidence: evidences[i % evidences.length],
    }));
    const hasGap = ratings.some(r => r.rating === "N" || r.rating.startsWith("P"));
    const sampleResults = {
      ratings,
      summary: hasGap
        ? "일부 BP에서 수행 증거가 확인되지 않아 CL1 달성에 미달합니다. 개선 계획 수립이 필요합니다."
        : "주요 BP는 달성되었으나, 일부 항목에서 부분적으로 이행되어 CL1 달성을 위해 보완이 필요합니다.",
      strengths: "체계적인 요구사항 명세, Polarion 기반 양방향 추적성 확인, 단위 테스트 자동화",
      gaps: "부분 설계 검토 회의 범위 제한, 변경요청 산출물 일부 누락, 요구사항 우선순위 일부 미흡",
    };
    setResults(sampleResults);
    setFileName("sample_SRS_v2.3.pdf");
    setFileSize(2458112);
    setError(""); setPhase(""); setSelectedHistoryId(null);
    addEntry({
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      processId: proc.id, processName: proc.name,
      fileName: "sample_SRS_v2.3.pdf", fileSize: 2458112,
      results: sampleResults, isSample: true,
    });
  };

  // ── AI analysis ────────────────────────────────────────────────────────────
  const analyze = async () => {
    const fileReady = !!(fileB64 || fileText);
    if (!fileReady) { setError("먼저 산출물 파일을 업로드하십시오."); return; }
    setAnalyzing(true); setError(""); setResults(null);
    try {
      setPhase("BP 목록 · 가이드라인 로드");
      await new Promise(r => setTimeout(r, 250));

      const bpList = proc.bps.map(b => `- ${b.id} (${b.title}): ${b.description}`).join("\n");
      const outcomes = proc.outcomes.map((o, i) => `${i+1}) ${o}`).join(" ");
      const guidelineTrim = proc.guideline.slice(0, 5500);

      const systemMsg = `You are a certified Automotive SPICE 4.0 Lead Assessor (intacs). Rate Base Practices strictly per the six-tier N/P-/P+/L-/L+/F scale defined in ISO/IEC 33020 and the VDA Automotive SPICE Guidelines (2024-03-12). Be evidence-based and objective. Output only JSON. Respond in Korean for rationale fields.`;

      const prompt = `[평가 프로세스]
${proc.id} — ${proc.name}
Purpose: ${proc.purpose}
Outcomes: ${outcomes}

[적용 Base Practices]
${bpList}

[ASPICE Guidelines (VDA 2024-03-12) 발췌/적용 기준 요약]
${guidelineTrim}

[임무]
첨부된 산출물(프로젝트 결과물 / 프로세스 산출물, 파일명: ${fileName})을 검토하여, 각 BP가 어느정도 수행/이행되었는지를 N/P-/P+/L-/L+/F 등급으로 판정하십시오.
- F  (Fully,       86–100%): 모든 측면이 완전히 달성됨
- L+ (Largely+,   71–85%):  거의 완전히 달성, 경미한 결함만 존재
- L- (Largely-,   51–70%):  대부분 달성되었으나 일부 항목 미흡
- P+ (Partially+, 31–50%):  절반 이상 달성, 주요 항목 일부 미흡
- P- (Partially-, 16–30%):  부분적으로 달성, 대부분 미흡
- N  (Not,          0–15%): 달성 증거 없음

CL1 달성 기준: 모든 BP가 L- 이상으로 달성됨

[응답 형식 — 아래 JSON만 출력하고 다른 설명 금지]
{"ratings":[{"bp":"BP1","rating":"F|L+|L-|P+|P-|N","rationale":"근거 설명(한국어, 40자 이내)","evidence":"산출물에서 찾은 근거 항목/페이지(없으면\\"없음\\")"}],"summary":"전체 CL1 달성여부 평가(한국어, 30자 이내)","strengths":"강점(한국어, 20자 이내)","gaps":"주요 개선점(한국어, 30자 이내)"}
반드시 ${proc.bps.length}개의 BP를 모두 포함하십시오. BP 번호는 "BP1"..."BP${proc.bps.length}" 형식.`;

      setPhase("파일 분석 · BP별 NPLF 판정 중");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 2000,
          system: systemMsg,
          messages: [{
            role: "user",
            content: [
              fileB64
                ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileB64 } }
                : { type: "text", text: `[텍스트 산출물 활용 중: ${fileName}]\n\n${fileText}` },
              { type: "text", text: prompt }
            ]
          }]
        })
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`API ${response.status}: ${txt.slice(0, 200)}`);
      }
      const data = await response.json();
      const combined = (data.content || [])
        .filter(c => c.type === "text")
        .map(c => c.text)
        .join("\n")
        .replace(/```json|```/g, "")
        .trim();

      const match = combined.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("응답에서 JSON을 찾을 수 없습니다. 원문: " + combined.slice(0, 200));
      const parsed = JSON.parse(match[0]);
      if (!parsed.ratings || !Array.isArray(parsed.ratings)) throw new Error("ratings 필드 없음");

      setPhase("결과 처리 중");
      await new Promise(r => setTimeout(r, 200));
      setResults(parsed);
      setPhase("");
      setSelectedHistoryId(null);
      addEntry({
        id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        processId: proc.id, processName: proc.name,
        fileName, fileSize,
        results: parsed, isSample: false,
      });
    } catch (e) {
      setError(`분석 실패 — ${e.message}`);
      setPhase("");
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Export handlers ────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (!displayResults || !reportRef.current) return;
    setExporting(true);
    try {
      await downloadPdf(reportRef.current, displayProc, displayFileName);
    } catch (e) {
      setError(`PDF 생성 실패 — ${e.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportTxt = () => {
    downloadTxt(displayResults, displayProc, displayFileName, displayDate);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: T.bgGrad,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: T.textHi,
      padding: "40px 24px 96px",
      letterSpacing: "-0.005em",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── Header ── */}
        <header style={{ borderBottom: `1px solid ${T.borderL}`, paddingBottom: 32, marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: T.accent, marginBottom: 14, fontWeight: 500 }}>
                VDA · Automotive SPICE® 4.0 · CL1 Diagnostic Workbench
              </div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "clamp(36px, 5vw, 45px)", lineHeight: 1.02, letterSpacing: "-0.035em", margin: 0, color: T.textHi }}>
                Automotive <span style={{ fontWeight: 300, color: T.accent }}>SPICE</span><br/>
                <span style={{ fontSize: "0.66em", fontWeight: 300, color: T.textMd }}>Assessment Studio</span>
              </h1>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textLo, textAlign: "right", lineHeight: 1.85 }}>
              <div>REF · PAM v4.0 (2023-11-29)</div>
              <div>REF · Guidelines (2024-03-12)</div>
              <div>SCALE · ISO/IEC 33020 N/P-/P+/L-/L+/F</div>
              <div style={{ marginTop: 8, color: T.accent }}>✦ {Object.keys(ASPICE_DATA).length} PROCESSES LOADED</div>
            </div>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 400, color: T.textMd, maxWidth: 760, marginTop: 22, lineHeight: 1.6, letterSpacing: "-0.005em" }}>
            PDF 산출물을 업로드하면 Automotive SPICE PAM의 Base Practice와 VDA Guideline에 기반하여 각 BP의 N/P-/P+/L-/L+/F 등급이 판정됩니다.
          </p>
        </header>

        {/* ── Progress steps ── */}
        <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 36, flexWrap: "wrap" }}>
          {[
            { n: "01", label: "프로세스 선택",   active: true },
            { n: "02", label: "산출물파일 업로드", active: !!(fileB64 || fileText) },
            { n: "03", label: "분석 실행",        active: analyzing || !!results },
            { n: "04", label: "NPLF 결과",        active: !!results },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15.4, padding: "6px 13px", border: `1px solid ${s.active ? T.accent : T.borderM}`, color: s.active ? T.accent : T.textLo, background: s.active ? T.accentSoft : "transparent", fontWeight: 600, borderRadius: 3 }}>{s.n}</span>
              <span style={{ fontSize: 18.2, fontWeight: 500, color: s.active ? T.textHi : T.textLo, letterSpacing: "-0.005em" }}>{s.label}</span>
              {i < 3 && <ChevronRight size={20} style={{ color: T.textDim, marginLeft: 11 }} />}
            </div>
          ))}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 400px) 1fr", gap: 32 }}>
          <ProcessSidebar
            selectedProcess={selectedProcess}
            onSelect={(id) => { setSelectedProcess(id); setResults(null); setSelectedHistoryId(null); setAutoDetected(null); }}
          />

          <main>
            <ProcessInfo proc={proc} />

            <FileImportPanel
              fileB64={fileB64} fileText={fileText}
              fileName={fileName} fileSize={fileSize}
              autoDetected={autoDetected}
              analyzing={analyzing} phase={phase} error={error}
              onFileChange={handleFile}
              onRunClick={() => setShowConfirm(true)}
              onSampleClick={loadSample}
              onReset={resetAll}
            />

            <HistoryPanel
              history={history}
              selectedHistoryId={selectedHistoryId}
              onSelect={setSelectedHistoryId}
              onDelete={removeEntry}
              onClearAll={clearAll}
              reportRef={reportRef}
            />

            <ReportPanel
              results={displayResults}
              proc={displayProc}
              fileName={displayFileName}
              fileDate={displayDate}
              isHistoryView={!!viewingHistory}
              exporting={exporting}
              onExportPdf={handleExportPdf}
              onExportTxt={handleExportTxt}
              reportRef={reportRef}
            />

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim, fontWeight: 500 }}>
              <div>Automotive SPICE® VDA QMC · PAM v4.0 · Guidelines 2024-03-12</div>
              <div>✦ F fully  ✦ L+ largely+  ✦ L- largely-  ✦ P+ partially+  ✦ P- partially-  ✦ N not achieved</div>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .anim-spin { animation: spin 1s linear infinite; }
        details summary::-webkit-details-marker { display: none; }
        button:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
        ::selection { background: ${T.accent}; color: #0A0A0C; }
        body { background: ${T.bg}; }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {showConfirm && (
        <ConfirmModal
          proc={proc}
          fileName={fileName}
          fileSize={fileSize}
          onConfirm={() => { setShowConfirm(false); analyze(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

'@

Write-Host "OK  theme.js" -ForegroundColor Green
Write-UTF8 "$target\theme.js" @'
export const T = {
  bg:        "#0A0A0C",
  bgGrad:    "radial-gradient(ellipse at top, #14141A 0%, #0A0A0C 60%, #050507 100%)",
  surface:   "#121217",
  surface2:  "#181820",
  surface3:  "#1F1F28",
  borderL:   "#26262F",
  borderM:   "#33333F",
  borderH:   "#44444F",
  textHi:    "#FAFAFA",
  textMd:    "#B4B4BE",
  textLo:    "#74747E",
  textDim:   "#52525C",
  accent:    "#60A5FA",
  accentSoft:"#1E3A5F",
  warm:      "#F59E0B",
  ok:        "#10B981",
  err:       "#EF4444",
};

export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
`;

'@

Write-Host "OK  data/processData.js" -ForegroundColor Green
Write-UTF8 "$target\data\processData.js" @'
export const PROCESS_GROUPS = [
  { label: "SYS — System Engineering",   color: "#60A5FA", ids: ["SYS.2","SYS.3","SYS.4","SYS.5"] },
  { label: "SWE — Software Engineering", color: "#A78BFA", ids: ["SWE.1","SWE.2","SWE.3","SWE.4","SWE.5","SWE.6"] },
  { label: "MAN — Management",           color: "#34D399", ids: ["MAN.3"] },
  { label: "SUP — Support",              color: "#FBBF24", ids: ["SUP.1","SUP.8","SUP.9","SUP.10"] },
];

export const SUPPORTED_FORMATS = {
  pdf:  { mediaType: "application/pdf",   label: "PDF",  mode: "pdf"  },
  docx: { mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "DOCX", mode: "docx" },
  doc:  { mediaType: "application/msword", label: "DOC", mode: "docx" },
  xlsx: { mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "XLSX", mode: "xlsx" },
  md:   { mediaType: "text/markdown",     label: "MD",   mode: "text" },
};

export const ACCEPT_ATTR = ".pdf,.doc,.docx,.xlsx,.md";

export const getFormatByName = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  return SUPPORTED_FORMATS[ext] || null;
};

// Process auto-detection rules (matched against filename stem)
export const PROCESS_DETECT_RULES = [
  // SUP.10 must come before SUP.1 (more specific match first)
  { id: "SUP.10", patterns: [/sup[\._\-]?10(?!\d)/i] },
  { id: "SYS.2",  patterns: [/sys[\._\-]?2(?!\d)/i] },
  { id: "SYS.3",  patterns: [/sys[\._\-]?3(?!\d)/i] },
  { id: "SYS.4",  patterns: [/sys[\._\-]?4(?!\d)/i] },
  { id: "SYS.5",  patterns: [/sys[\._\-]?5(?!\d)/i] },
  { id: "SWE.1",  patterns: [/swe[\._\-]?1(?!\d)/i] },
  { id: "SWE.2",  patterns: [/swe[\._\-]?2(?!\d)/i] },
  { id: "SWE.3",  patterns: [/swe[\._\-]?3(?!\d)/i] },
  { id: "SWE.4",  patterns: [/swe[\._\-]?4(?!\d)/i] },
  { id: "SWE.5",  patterns: [/swe[\._\-]?5(?!\d)/i] },
  { id: "SWE.6",  patterns: [/swe[\._\-]?6(?!\d)/i] },
  { id: "SUP.1",  patterns: [/sup[\._\-]?1(?!\d)/i] },
  { id: "SUP.8",  patterns: [/sup[\._\-]?8(?!\d)/i] },
  { id: "SUP.9",  patterns: [/sup[\._\-]?9(?!\d)/i] },
  { id: "MAN.3",  patterns: [/man[\._\-]?3(?!\d)/i] },
  // Document abbreviation patterns
  { id: "SYS.2",  patterns: [/\bsrs\b/i, /system[_\-\s]req/i, /sys[_\-\s]req/i] },
  { id: "SYS.3",  patterns: [/\bsad\b/i, /system[_\-\s]arch/i, /sys[_\-\s]arch/i] },
  { id: "SYS.4",  patterns: [/\bsiv\b/i, /system[_\-\s]integ/i] },
  { id: "SYS.5",  patterns: [/\bsvs\b/i, /system[_\-\s]verif/i] },
  { id: "SWE.1",  patterns: [/\bswrs\b/i, /sw[_\-\s]req/i, /software[_\-\s]req/i] },
  { id: "SWE.2",  patterns: [/\bswad\b/i, /sw[_\-\s]arch/i, /software[_\-\s]arch/i] },
  { id: "SWE.3",  patterns: [/\bddd\b/i, /detailed[_\-\s]design/i, /unit[_\-\s]design/i] },
  { id: "SWE.4",  patterns: [/\bsut\b/i, /unit[_\-\s]test/i, /unit[_\-\s]verif/i] },
  { id: "SWE.5",  patterns: [/sw[_\-\s]integr/i, /software[_\-\s]integr/i] },
  { id: "SWE.6",  patterns: [/sw[_\-\s]verif/i, /sw[_\-\s]test/i, /software[_\-\s]verif/i] },
  { id: "SUP.1",  patterns: [/\bqap?\b/i, /quality[_\-\s]assur/i] },
  { id: "SUP.8",  patterns: [/\bcmp\b/i, /config[_\-\s]mgmt/i, /config[_\-\s]man/i, /cm[_\-\s]plan/i] },
  { id: "SUP.9",  patterns: [/\bprm\b/i, /problem[_\-\s]res/i, /incident[_\-\s]rep/i] },
  { id: "SUP.10", patterns: [/\bcrm\b/i, /change[_\-\s]req/i, /change[_\-\s]man/i] },
  { id: "MAN.3",  patterns: [/project[_\-\s]plan/i, /project[_\-\s]man/i, /\bpmp\b/i, /project[_\-\s]sched/i] },
];

'@

Write-Host "OK  data/ratingMeta.js" -ForegroundColor Green
Write-UTF8 "$target\data\ratingMeta.js" @'
// Rating metadata for the N/P-/P+/L-/L+/F six-tier scale (ISO/IEC 33020)
export const RATING_META = {
  F:    { label: "Fully",       kor: "완전 달성",    range: "86–100%", bg: "#052E1A", fg: "#6EE7B7", bar: "#10B981", pct: 95 },
  "L+": { label: "Largely+",   kor: "거의 완전",    range: "71–85%",  bg: "#1A3305", fg: "#BEF264", bar: "#84CC16", pct: 80 },
  "L-": { label: "Largely-",   kor: "대부분 달성",  range: "51–70%",  bg: "#1A2E05", fg: "#A3E635", bar: "#65A30D", pct: 62 },
  "P+": { label: "Partially+", kor: "절반 이상",    range: "31–50%",  bg: "#2E2005", fg: "#FDE68A", bar: "#F59E0B", pct: 42 },
  "P-": { label: "Partially-", kor: "부분 달성",    range: "16–30%",  bg: "#2E1A05", fg: "#FED7AA", bar: "#F97316", pct: 23 },
  N:    { label: "Not",         kor: "미달성",       range: "0–15%",   bg: "#2E0A0A", fg: "#FCA5A5", bar: "#EF4444", pct: 8  },
};

// Ratings that satisfy CL1 (Largely or better)
export const CL1_PASS_RATINGS = new Set(["F", "L+", "L-"]);

// Display order for stat cards
export const RATING_KEYS = ["F", "L+", "L-", "P+", "P-", "N"];

'@

Write-Host "OK  utils/fileReader.js" -ForegroundColor Green
Write-UTF8 "$target\utils\fileReader.js" @'
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export const toBase64 = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(f);
});

const readArrayBuffer = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsArrayBuffer(f);
});

const readAsText = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsText(f, "utf-8");
});

export const extractDocxText = async (f) => {
  const buf = await readArrayBuffer(f);
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
};

export const extractXlsxText = async (f) => {
  const buf = await readArrayBuffer(f);
  const wb = XLSX.read(buf, { type: "array" });
  return wb.SheetNames.map(name => {
    const rows = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
    return `[Sheet: ${name}]\n${rows}`;
  }).join("\n\n");
};

export const readFileAsText = readAsText;

'@

Write-Host "OK  utils/detectProcess.js" -ForegroundColor Green
Write-UTF8 "$target\utils\detectProcess.js" @'
import { PROCESS_DETECT_RULES } from "../data/processData";

export function detectProcess(filename) {
  const stem = filename.replace(/\.[^.]+$/, "");
  const normalized = stem.replace(/[_\-\.]/g, " ");
  for (const rule of PROCESS_DETECT_RULES) {
    if (rule.patterns.some(p => p.test(stem) || p.test(normalized))) return rule.id;
  }
  return null;
}

'@

Write-Host "OK  utils/exportTxt.js" -ForegroundColor Green
Write-UTF8 "$target\utils\exportTxt.js" @'
export function downloadTxt(results, proc, fileName, date) {
  if (!results) return;
  const lines = [];
  lines.push("ASPICE 4.0 CL1 진단 리포트");
  lines.push("================================");
  lines.push(`프로세스: ${proc.id} ${proc.name}`);
  lines.push(`파일: ${fileName}`);
  lines.push(`일시: ${date.toLocaleString("ko-KR")}`);
  lines.push("");
  lines.push(`[Summary] ${results.summary || ""}`);
  lines.push(`[Strengths] ${results.strengths || ""}`);
  lines.push(`[Gaps] ${results.gaps || ""}`);
  lines.push("");
  lines.push("BP별 판정");
  lines.push("--------------------------------");
  results.ratings.forEach(r => {
    const bpDef = proc.bps.find(b => b.id === r.bp);
    lines.push(`${r.bp} [${r.rating}] ${bpDef?.title || ""}`);
    lines.push(`  근거: ${r.rationale}`);
    lines.push(`  증거: ${r.evidence}`);
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ASPICE_${proc.id}_report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

'@

Write-Host "OK  utils/exportPdf.js" -ForegroundColor Green
Write-UTF8 "$target\utils\exportPdf.js" @'
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function downloadPdf(reportNode, proc, fileName) {
  if (!reportNode) return;

  const canvas = await html2canvas(reportNode, {
    scale: 2,
    backgroundColor: "#FFFFFF",
    useCORS: true,
    logging: false,
    windowWidth: reportNode.scrollWidth,
    onclone: (clonedDoc) => {
      const sections = clonedDoc.querySelectorAll("section");
      let target = null;
      sections.forEach(el => {
        if (el.textContent && el.textContent.includes("NPLF VERDICT")) target = el;
      });
      if (!target) return;
      target.id = "pdf-export-root";

      const s = clonedDoc.createElement("style");
      s.textContent = `
        #pdf-export-root {
          background: #FFFFFF !important;
          color: #3F3F46 !important;
          border: 1.5px solid #0A0A0C !important;
          border-radius: 4px !important;
          padding: 20px 24px 22px !important;
          font-family: 'Inter', system-ui, sans-serif !important;
        }
        #pdf-export-root, #pdf-export-root * {
          color: #3F3F46 !important;
          letter-spacing: -0.005em !important;
        }
        #pdf-export-root > div:first-child {
          background: #FFFFFF !important;
          color: #0A0A0C !important;
          border: 1.5px solid #0A0A0C !important;
          font-size: 9px !important;
          padding: 3px 10px !important;
          top: -9px !important;
        }
        #pdf-export-root > div:first-child * { color: #0A0A0C !important; }
        #pdf-export-root h3 {
          color: #0A0A0C !important;
          font-size: 22px !important;
          margin: 0 0 6px 0 !important;
          font-weight: 700 !important;
          letter-spacing: -0.025em !important;
        }
        #pdf-export-root h3 > span { font-size: 12px !important; color: #52525C !important; }
        #pdf-export-root p { font-size: 10.5px !important; line-height: 1.45 !important; margin: 0 !important; color: #3F3F46 !important; }
        #pdf-export-root div[style*="1fr 1fr"] { gap: 10px !important; margin-bottom: 14px !important; }
        #pdf-export-root div[style*="1fr 1fr"] > div {
          background: #FAFAFA !important;
          border: 1px solid #D4D4D8 !important;
          border-left: 2.5px solid #0A0A0C !important;
          border-radius: 0 3px 3px 0 !important;
          padding: 10px 12px !important;
        }
        #pdf-export-root div[style*="1fr 1fr"] > div > div:nth-child(1) {
          font-size: 9px !important; color: #0A0A0C !important;
          font-weight: 700 !important; margin-bottom: 3px !important;
        }
        #pdf-export-root div[style*="1fr 1fr"] > div > div:nth-child(2) {
          font-size: 11px !important; color: #3F3F46 !important; line-height: 1.45 !important;
        }
        #pdf-export-root div[style*="60px 1fr"] {
          background: #FFFFFF !important;
          border: 1px solid #0A0A0C !important;
          border-radius: 3px !important;
          margin-bottom: 0 !important;
        }
        #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) {
          background: #FFFFFF !important; color: #0A0A0C !important;
          border-right: 1px solid #0A0A0C !important; padding: 6px 0 !important;
        }
        #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) > div:nth-child(1) {
          font-size: 22px !important; font-weight: 800 !important;
          color: #0A0A0C !important; line-height: 1 !important;
        }
        #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) > div:nth-child(2) {
          font-size: 7px !important; color: #52525C !important;
          opacity: 1 !important; margin-top: 2px !important;
        }
        #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) { padding: 8px 12px !important; }
        #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(2) {
          font-size: 10px !important; color: #3F3F46 !important; line-height: 1.4 !important; margin-bottom: 3px !important;
        }
        #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(3) {
          font-size: 9px !important; color: #52525C !important; line-height: 1.4 !important;
        }
        #pdf-export-root > div[style*="flex-direction: column"]:last-child { gap: 5px !important; }
      `;
      clonedDoc.head.appendChild(s);
    },
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableW = pageWidth - margin * 2;
  const imgW = usableW;
  let imgH = (canvas.height * imgW) / canvas.width;

  const headerH = 16;
  const usablePerPage = pageHeight - headerH - margin;
  const twoPageCapacity = usablePerPage * 2 - 4;
  let scaledImgW = imgW;
  if (imgH > twoPageCapacity) {
    const scale = twoPageCapacity / imgH;
    scaledImgW = imgW * scale;
    imgH = twoPageCapacity;
  }
  const imgX = (pageWidth - scaledImgW) / 2;

  const drawPageHeader = (page, cont = false) => {
    pdf.setPage(page);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(248, 248, 250);
    pdf.rect(0, 0, pageWidth, headerH, "F");
    pdf.setDrawColor(180, 180, 188);
    pdf.setLineWidth(0.3);
    pdf.line(0, headerH, pageWidth, headerH);
    pdf.setTextColor(10, 10, 12);
    pdf.setFontSize(10);
    pdf.text(`ASPICE 4.0 · ${proc.id} ${proc.name}${cont ? " (cont.)" : ""}`, margin, 10);
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 100, 110);
    pdf.text(new Date().toLocaleString("ko-KR"), pageWidth - margin, 10, { align: "right" });
  };

  drawPageHeader(1);

  const positionY = headerH + 4;
  const pxPerMm = canvas.width / scaledImgW;

  if (imgH + positionY + margin <= pageHeight) {
    pdf.addImage(imgData, "PNG", imgX, positionY, scaledImgW, imgH);
  } else {
    const firstSliceMm = pageHeight - positionY - margin;
    const otherSliceMm = pageHeight - headerH - 4 - margin;

    const drawSlice = (yMmTop, sliceMm, sliceCanvasYpx, sliceHeightPx) => {
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width;
      tmp.height = sliceHeightPx;
      const ctx = tmp.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(canvas, 0, sliceCanvasYpx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
      pdf.addImage(tmp.toDataURL("image/png"), "PNG", imgX, yMmTop, scaledImgW, sliceMm);
    };

    const firstSlicePx = Math.min(canvas.height, Math.floor(firstSliceMm * pxPerMm));
    drawSlice(positionY, firstSlicePx / pxPerMm, 0, firstSlicePx);
    let sliceY = firstSlicePx;
    let remainingH = canvas.height - sliceY;
    let pageNum = 2;

    while (remainingH > 0) {
      pdf.addPage();
      drawPageHeader(pageNum, true);
      const slicePx = Math.min(remainingH, Math.floor(otherSliceMm * pxPerMm));
      drawSlice(positionY, slicePx / pxPerMm, sliceY, slicePx);
      sliceY += slicePx;
      remainingH -= slicePx;
      pageNum++;
    }
  }

  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 130);
    pdf.text(
      `Automotive SPICE® VDA QMC · Generated by ASPICE Workbench  ·  ${i}/${pageCount}`,
      pageWidth / 2, pageHeight - 4, { align: "center" }
    );
  }

  pdf.save(`ASPICE_${proc.id}_report_${Date.now()}.pdf`);
}

'@

Write-Host "OK  hooks/useHistory.js" -ForegroundColor Green
Write-UTF8 "$target\hooks\useHistory.js" @'
import { useState, useEffect } from "react";

const STORAGE_KEY = "aspice_history";
const MAX_ENTRIES = 50;

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const addEntry = (entry) => {
    setHistory(prev => [entry, ...prev].slice(0, MAX_ENTRIES));
  };

  const removeEntry = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const clearAll = () => setHistory([]);

  return { history, addEntry, removeEntry, clearAll };
}

'@

Write-Host "OK  components/Stat.jsx" -ForegroundColor Green
Write-UTF8 "$target\components\Stat.jsx" @'
import { T } from "../theme";

export function Stat({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: T.accent }}>{icon}</span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: T.textLo,
        fontWeight: 500,
      }}>{label}:</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: T.textHi, letterSpacing: "-0.02em" }}>{value}</span>
    </div>
  );
}

'@

Write-Host "OK  components/ProcessSidebar.jsx" -ForegroundColor Green
Write-UTF8 "$target\components\ProcessSidebar.jsx" @'
import { ChevronRight } from "lucide-react";
import { ASPICE_DATA } from "../data/aspice";
import { PROCESS_GROUPS } from "../data/processData";
import { T } from "../theme";

export function ProcessSidebar({ selectedProcess, onSelect }) {
  return (
    <aside>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 18,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: T.accent,
        marginBottom: 16,
        paddingBottom: 10,
        borderBottom: `1px solid ${T.borderL}`,
        fontWeight: 600,
      }}>§ 01  Target Process</div>

      {PROCESS_GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 20,
            fontWeight: 600,
            color: group.color,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}>
            {group.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {group.ids.map(id => {
              const active = id === selectedProcess;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  style={{
                    textAlign: "left",
                    border: "none",
                    background: active ? T.surface3 : "transparent",
                    color: active ? T.textHi : T.textMd,
                    padding: "14px 16px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.15s",
                    borderLeft: active ? `3px solid ${group.color}` : "3px solid transparent",
                    borderRadius: 3,
                    lineHeight: 1.3,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.textHi; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMd; } }}
                >
                  <span style={{ display: "flex", alignItems: "baseline", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 25, fontWeight: 600, color: group.color, flexShrink: 0 }}>{id}</span>
                    <span style={{ fontSize: 23, fontWeight: active ? 600 : 500, letterSpacing: "-0.005em" }}>{ASPICE_DATA[id].name}</span>
                  </span>
                  {active && <ChevronRight size={16} style={{ color: group.color, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}

'@

Write-Host "OK  components/ProcessInfo.jsx" -ForegroundColor Green
Write-UTF8 "$target\components\ProcessInfo.jsx" @'
import { BookOpen, ListChecks, Target } from "lucide-react";
import { T } from "../theme";
import { Stat } from "./Stat";

export function ProcessInfo({ proc }) {
  return (
    <section style={{
      background: T.surface,
      border: `1px solid ${T.borderL}`,
      borderRadius: 6,
      padding: "32px 36px",
      marginBottom: 26,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -11, left: 26,
        background: T.surface3, color: T.accent,
        border: `1px solid ${T.borderM}`,
        padding: "4px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: "0.15em", fontWeight: 600, borderRadius: 3,
      }}>{proc.id}</div>

      <h2 style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 30, fontWeight: 700,
        margin: "10px 0 8px 0",
        letterSpacing: "-0.025em", color: T.textHi,
      }}>{proc.name}</h2>

      <div style={{ display: "flex", gap: 22, marginBottom: 22, flexWrap: "wrap" }}>
        <Stat icon={<ListChecks size={13}/>} label="Base Practices" value={proc.bps.length} />
        <Stat icon={<Target size={13}/>} label="Outcomes" value={proc.outcomes.length} />
        <Stat icon={<BookOpen size={13}/>} label="Guideline" value={`${(proc.guideline.length/1000).toFixed(1)}K`} />
      </div>

      <div style={{
        fontSize: 14.5, fontWeight: 400, color: T.textMd,
        lineHeight: 1.6, borderLeft: `2px solid ${T.accent}`,
        paddingLeft: 16, marginBottom: 20, fontStyle: "italic",
      }}>
        "{proc.purpose}"
      </div>

      <details>
        <summary style={{
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: "0.15em",
          textTransform: "uppercase", color: T.accent,
          marginBottom: 10, fontWeight: 600,
        }}>▶ Base Practices ({proc.bps.length})</summary>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
          {proc.bps.map(bp => (
            <li key={bp.id} style={{
              padding: "12px 0", borderBottom: `1px dashed ${T.borderL}`,
              fontSize: 13, lineHeight: 1.55, color: T.textMd,
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 600, color: T.accent, marginRight: 10,
              }}>{bp.id}</span>
              <strong style={{ color: T.textHi, fontWeight: 600 }}>{bp.title}.</strong>{" "}
              <span>{bp.description}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

'@

Write-Host "OK  components/FileImportPanel.jsx" -ForegroundColor Green
Write-UTF8 "$target\components\FileImportPanel.jsx" @'
import { useRef } from "react";
import { AlertCircle, Loader2, Play, RotateCcw, Sparkles, Upload } from "lucide-react";
import { SUPPORTED_FORMATS, getFormatByName, ACCEPT_ATTR } from "../data/processData";
import { T } from "../theme";

export function FileImportPanel({
  fileB64, fileText, fileName, fileSize, autoDetected,
  analyzing, phase, error,
  onFileChange, onRunClick, onSampleClick, onReset,
}) {
  const fileInputRef = useRef(null);
  const hasFile = !!(fileB64 || fileText);

  return (
    <section style={{
      background: T.surface, border: `1px solid ${T.borderL}`,
      borderRadius: 6, padding: "32px 36px", marginBottom: 26, position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -11, left: 26,
        background: T.surface3, color: T.warm,
        border: `1px solid ${T.borderM}`,
        padding: "4px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: "0.15em", fontWeight: 600, borderRadius: 3,
      }}>§ 02 · IMPORT</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
        <label style={{
          border: `1.5px dashed ${hasFile ? T.accent : T.borderH}`,
          borderRadius: 5, padding: "30px 26px", cursor: "pointer",
          background: hasFile ? T.accentSoft : T.surface2,
          transition: "all 0.2s", display: "flex", alignItems: "center", gap: 18,
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={onFileChange}
            style={{ display: "none" }}
          />
          <Upload size={28} style={{ color: hasFile ? T.accent : T.textLo }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: T.textHi, letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fileName || "산출물 파일 선택"}
            </div>
            <div style={{ fontSize: 11, color: T.textLo, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              {hasFile
                ? `${(fileSize/1024).toFixed(1)} KB · ${getFormatByName(fileName)?.label || ""} · ready`
                : "드래그하여 파일 선택 · max 30MB"}
            </div>
            {hasFile && autoDetected && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
                padding: "4px 10px", background: T.accentSoft,
                border: `1px solid ${T.accent}`, borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                color: T.accent, fontWeight: 700, letterSpacing: "0.08em",
              }}>
                ★ 자동감지 → {autoDetected}
              </div>
            )}
            {!hasFile && (
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {Object.values(SUPPORTED_FORMATS).map(f => (
                  <span key={f.label} style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                    padding: "3px 7px", border: `1px solid ${T.borderM}`,
                    color: T.textLo, borderRadius: 3, letterSpacing: "0.1em", fontWeight: 600,
                  }}>{f.label}</span>
                ))}
              </div>
            )}
          </div>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => { if (!hasFile) return; onRunClick(); }}
            disabled={analyzing || !hasFile}
            style={{
              background: analyzing || !hasFile ? T.surface3 : T.accent,
              color: analyzing || !hasFile ? T.textLo : "#0A0A0C",
              border: "none", padding: "14px 28px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: analyzing || !hasFile ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              fontWeight: 700, borderRadius: 3, transition: "all 0.15s",
            }}
          >
            {analyzing ? <Loader2 size={14} className="anim-spin" /> : <Play size={14} />}
            {analyzing ? "Analyzing" : "Run Assessment"}
          </button>
          <button
            onClick={onSampleClick}
            style={{
              background: "transparent", color: T.warm,
              border: `1px solid ${T.warm}66`, padding: "8px 28px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              borderRadius: 3, fontWeight: 600,
            }}
            title="API 호출 없이 샘플 리포트 미리보기"
          >
            <Sparkles size={11} /> Load Sample
          </button>
          {(hasFile || analyzing) && (
            <button
              onClick={onReset}
              style={{
                background: "transparent", color: T.textMd,
                border: `1px solid ${T.borderM}`, padding: "8px 28px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: "0.12em", textTransform: "uppercase",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, borderRadius: 3,
              }}
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
        </div>
      </div>

      {phase && (
        <div style={{
          marginTop: 20, padding: "12px 16px", background: T.surface3,
          border: `1px solid ${T.borderM}`, borderRadius: 3, color: T.accent,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 10,
        }}>
          <Loader2 size={12} className="anim-spin" /> {phase}...
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 16, padding: "12px 16px", background: "#2E0A0A",
          border: `1px solid ${T.err}`, borderRadius: 3, color: "#FCA5A5",
          fontSize: 13, display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}
    </section>
  );
}

'@

Write-Host "OK  components/HistoryPanel.jsx" -ForegroundColor Green
Write-UTF8 "$target\components\HistoryPanel.jsx" @'
import { Clock, Eye, FileText, Trash2, Upload } from "lucide-react";
import { CL1_PASS_RATINGS, RATING_KEYS } from "../data/ratingMeta";
import { T } from "../theme";

function countRatings(ratings) {
  return ratings.reduce((acc, r) => { acc[r.rating] = (acc[r.rating] || 0) + 1; return acc; }, {});
}

export function HistoryPanel({ history, selectedHistoryId, onSelect, onDelete, onClearAll, reportRef }) {
  return (
    <section style={{
      background: T.surface, border: `1px solid ${T.borderL}`,
      borderRadius: 6, padding: "32px 36px", marginBottom: 26, position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -11, left: 26,
        background: T.surface3, color: "#A78BFA",
        border: `1px solid ${T.borderM}`, padding: "4px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: "0.15em", fontWeight: 600, borderRadius: 3,
      }}>§ 04 · HISTORY</div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, marginTop: 6, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{
            fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700,
            margin: "0 0 4px 0", letterSpacing: "-0.02em", color: T.textHi,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Clock size={18} style={{ color: "#A78BFA" }}/>
            분석 이력 관리
          </h3>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textLo, letterSpacing: "0.1em" }}>
            {history.length} ENTRIES · 브라우저에 자동 저장
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => { if (confirm("모든 분석 이력을 삭제하시겠습니까?")) onClearAll(); }}
            style={{
              background: "transparent", color: T.textMd,
              border: `1px solid ${T.borderM}`, padding: "8px 16px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              borderRadius: 3, fontWeight: 600,
            }}
          >
            <Trash2 size={11}/> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{
          padding: "36px 20px", textAlign: "center",
          border: `1px dashed ${T.borderM}`, borderRadius: 4,
          color: T.textLo, fontSize: 13, background: T.surface2,
        }}>
          <FileText size={26} style={{ color: T.textDim, marginBottom: 10 }}/>
          <div>아직 저장된 분석 이력이 없습니다.</div>
          <div style={{ fontSize: 11, marginTop: 6, color: T.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
            PDF를 업로드하고 분석을 실행하면 결과가 자동으로 저장됩니다.
          </div>
        </div>
      ) : (
        <div style={{ border: `1px solid ${T.borderL}`, borderRadius: 4, overflow: "hidden", background: T.surface2 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "180px 1fr 1.4fr 110px",
            background: T.surface3, borderBottom: `1px solid ${T.borderM}`,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMd, fontWeight: 700,
          }}>
            <div style={{ padding: "12px 16px", borderRight: `1px solid ${T.borderL}` }}>분석일자</div>
            <div style={{ padding: "12px 16px", borderRight: `1px solid ${T.borderL}` }}>Import 파일</div>
            <div style={{ padding: "12px 16px", borderRight: `1px solid ${T.borderL}` }}>판정 · 분석 결과</div>
            <div style={{ padding: "12px 16px", textAlign: "center" }}>Action</div>
          </div>
          {history.map((h, idx) => {
            const isActive = selectedHistoryId === h.id;
            const hCounts = countRatings(h.results.ratings);
            const hPass = h.results.ratings.every(r => CL1_PASS_RATINGS.has(r.rating));
            const hTotal = h.results.ratings.length;
            const dateStr = new Date(h.date).toLocaleString("ko-KR", {
              year: "numeric", month: "2-digit", day: "2-digit",
              hour: "2-digit", minute: "2-digit",
            });
            return (
              <div key={h.id} style={{
                display: "grid", gridTemplateColumns: "180px 1fr 1.4fr 110px",
                borderBottom: idx === history.length - 1 ? "none" : `1px solid ${T.borderL}`,
                background: isActive ? T.accentSoft : "transparent",
                transition: "background 0.15s", alignItems: "center",
              }}>
                <div style={{ padding: "14px 16px", borderRight: `1px solid ${T.borderL}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isActive ? T.textHi : T.textMd, lineHeight: 1.5 }}>
                  {dateStr}
                  {h.isSample && <div style={{ fontSize: 9, color: T.warm, marginTop: 3, letterSpacing: "0.1em" }}>SAMPLE</div>}
                </div>
                <div style={{ padding: "14px 16px", borderRight: `1px solid ${T.borderL}`, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.textHi, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={h.fileName}>
                    <Upload size={11} style={{ color: T.accent, marginRight: 6, verticalAlign: "middle" }}/>
                    {h.fileName || "—"}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: T.textLo, marginTop: 4, letterSpacing: "0.05em" }}>
                    {h.fileSize ? `${(h.fileSize/1024).toFixed(1)} KB` : ""}
                  </div>
                </div>
                <div style={{ padding: "14px 16px", borderRight: `1px solid ${T.borderL}`, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                      padding: "3px 8px", border: `1px solid ${hPass ? T.ok : T.err}`,
                      color: hPass ? T.ok : T.err,
                      background: hPass ? "#052E1A" : "#2E0A0A",
                      borderRadius: 3, fontWeight: 700, letterSpacing: "0.08em",
                    }}>
                      {hPass ? "CONFORMANT" : "GAP"}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#A78BFA", fontWeight: 700 }}>{h.processId}</span>
                    <span style={{ fontSize: 12, color: T.textMd, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{h.processName}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: T.textLo, marginTop: 6, letterSpacing: "0.05em", display: "flex", gap: 8 }}>
                    {RATING_KEYS.map(k => (
                      <span key={k} style={{ color: hCounts[k] ? (k === "N" ? T.err : k.startsWith("P") ? T.warm : k === "F" ? T.ok : T.textMd) : T.textDim }}>
                        {k}:{hCounts[k]||0}
                      </span>
                    ))}
                    <span style={{ marginLeft: "auto", color: T.textDim }}>/ {hTotal} BP</span>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, alignItems: "stretch" }}>
                  <button
                    onClick={() => {
                      onSelect(isActive ? null : h.id);
                      if (!isActive) {
                        setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                      }
                    }}
                    style={{
                      background: isActive ? T.accent : "transparent",
                      color: isActive ? "#0A0A0C" : T.accent,
                      border: `1px solid ${T.accent}`, padding: "6px 10px",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                      letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      borderRadius: 3, fontWeight: 700,
                    }}
                  >
                    <Eye size={11}/> {isActive ? "닫기" : "보기"}
                  </button>
                  <button
                    onClick={() => { if (confirm("이 분석 이력을 삭제하시겠습니까?")) onDelete(h.id); }}
                    style={{
                      background: "transparent", color: T.textLo,
                      border: `1px solid ${T.borderM}`, padding: "5px 10px",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                      letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 3,
                    }}
                  >
                    <Trash2 size={9}/> Del
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

'@

Write-Host "OK  components/ReportPanel.jsx" -ForegroundColor Green
Write-UTF8 "$target\components\ReportPanel.jsx" @'
import { Download, FileDown, Loader2 } from "lucide-react";
import { RATING_META, RATING_KEYS, CL1_PASS_RATINGS } from "../data/ratingMeta";
import { T } from "../theme";

export function ReportPanel({
  results, proc, fileName, fileDate, isHistoryView,
  exporting, onExportPdf, onExportTxt, reportRef,
}) {
  if (!results) return null;

  const counts = results.ratings.reduce((acc, r) => { acc[r.rating] = (acc[r.rating] || 0) + 1; return acc; }, {});
  const totalBps = proc.bps.length;
  const cl1Pass = results.ratings.every(r => CL1_PASS_RATINGS.has(r.rating));
  const passCount = results.ratings.filter(r => CL1_PASS_RATINGS.has(r.rating)).length;

  return (
    <section ref={reportRef} style={{
      background: T.surface, border: `1px solid ${T.borderL}`,
      borderRadius: 6, padding: "36px 36px 40px", position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -11, left: 26,
        background: cl1Pass ? "#052E1A" : "#2E0A0A",
        color: cl1Pass ? T.ok : T.err,
        border: `1px solid ${cl1Pass ? T.ok : T.err}`,
        padding: "4px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: "0.15em", fontWeight: 600, borderRadius: 3,
      }}>§ 03 · NPLF VERDICT</div>

      {/* Header: verdict + export buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
        <div style={{ flex: "1 1 300px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.15em", color: T.textLo, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
            Capability Level 1 · Verdict
          </div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 42, fontWeight: 700, letterSpacing: "-0.035em", margin: "0 0 12px 0", lineHeight: 1.05, color: cl1Pass ? T.ok : T.err }}>
            {cl1Pass ? "Conformant" : "Gap Detected"}
            <span style={{ fontSize: 18, marginLeft: 12, fontWeight: 400, color: T.textMd, letterSpacing: "-0.01em" }}>
              · {passCount}/{totalBps} BP ≥ L
            </span>
          </h3>
          <p style={{ fontSize: 14, color: T.textMd, lineHeight: 1.6, maxWidth: 580, margin: 0, fontWeight: 400 }}>
            {results.summary}
          </p>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textLo, marginTop: 12, letterSpacing: "0.05em" }}>
            {proc.id} · {fileName || "—"} · {fileDate.toLocaleString("ko-KR")}
            {isHistoryView && <span style={{ color: T.warm, marginLeft: 8 }}>· HISTORY VIEW</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }} data-html2canvas-ignore="true">
          <button
            onClick={onExportPdf}
            disabled={exporting}
            style={{
              background: T.accent, color: "#0A0A0C", border: "none", padding: "12px 22px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: exporting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              fontWeight: 700, borderRadius: 3, opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting ? <Loader2 size={13} className="anim-spin" /> : <FileDown size={13} />}
            {exporting ? "Generating" : "Export PDF"}
          </button>
          <button
            onClick={onExportTxt}
            style={{
              background: "transparent", color: T.textMd,
              border: `1px solid ${T.borderM}`, padding: "8px 22px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, borderRadius: 3,
            }}
          >
            <Download size={11} /> Text
          </button>
        </div>
      </div>

      {/* Rating stat cards — 3 columns × 2 rows */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 30 }}>
        {RATING_KEYS.map(k => {
          const m = RATING_META[k];
          const c = counts[k] || 0;
          const pct = totalBps ? (c / totalBps * 100) : 0;
          return (
            <div key={k} style={{
              background: m.bg, color: m.fg, padding: "14px 16px",
              position: "relative", overflow: "hidden",
              border: `1px solid ${m.bar}33`, borderRadius: 4,
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.85, letterSpacing: "0.15em", fontWeight: 600 }}>{k}  ·  {m.label.toUpperCase()}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1, marginTop: 6, letterSpacing: "-0.03em" }}>{c}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{pct.toFixed(0)}%  ·  {m.range}</div>
            </div>
          );
        })}
      </div>

      {/* Strengths / Gaps */}
      {(results.strengths || results.gaps) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 30 }}>
          {results.strengths && (
            <div style={{ padding: "16px 20px", background: "#0A1F14", borderLeft: `3px solid ${T.ok}`, borderRadius: "0 4px 4px 0" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.ok, letterSpacing: "0.15em", marginBottom: 6, fontWeight: 600 }}>▲ STRENGTHS</div>
              <div style={{ fontSize: 13, color: T.textHi, lineHeight: 1.55 }}>{results.strengths}</div>
            </div>
          )}
          {results.gaps && (
            <div style={{ padding: "16px 20px", background: "#1F0A0A", borderLeft: `3px solid ${T.err}`, borderRadius: "0 4px 4px 0" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.err, letterSpacing: "0.15em", marginBottom: 6, fontWeight: 600 }}>▼ GAPS</div>
              <div style={{ fontSize: 13, color: T.textHi, lineHeight: 1.55 }}>{results.gaps}</div>
            </div>
          )}
        </div>
      )}

      {/* BP-level ratings */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase", color: T.accent, marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${T.borderL}`, fontWeight: 600 }}>
        BP-level Ratings
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {proc.bps.map(bp => {
          const r = results.ratings.find(x => x.bp === bp.id) || { rating: "N", rationale: "응답 없음", evidence: "없음" };
          const m = RATING_META[r.rating] || RATING_META.N;
          return (
            <div key={bp.id} style={{
              display: "grid", gridTemplateColumns: "60px 1fr",
              background: T.surface2, border: `1px solid ${T.borderL}`,
              borderRadius: 4, overflow: "hidden",
            }}>
              <div style={{
                background: m.bg, color: m.fg,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "14px 0", borderRight: `1px solid ${m.bar}40`,
              }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>{r.rating}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, opacity: 0.8, marginTop: 4 }}>{m.range}</div>
              </div>
              <div style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: T.accent }}>{proc.id}.{bp.id}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.textHi, letterSpacing: "-0.005em" }}>{bp.title}</span>
                </div>
                <div style={{ fontSize: 12.5, color: T.textMd, lineHeight: 1.6, marginBottom: 6 }}>
                  <strong style={{ color: T.accent, fontWeight: 600 }}>근거 · </strong>{r.rationale}
                </div>
                <div style={{ fontSize: 11.5, color: T.textLo, lineHeight: 1.55 }}>
                  <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: "0.1em", color: T.textDim, fontWeight: 600 }}>EVIDENCE · </strong>{r.evidence}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

'@

Write-Host "OK  components/ConfirmModal.jsx" -ForegroundColor Green
Write-UTF8 "$target\components\ConfirmModal.jsx" @'
import { Play } from "lucide-react";
import { getFormatByName } from "../data/processData";
import { T } from "../theme";

export function ConfirmModal({ proc, fileName, fileSize, onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.surface, border: `1px solid ${T.borderM}`,
          borderRadius: 8, padding: "36px 40px",
          maxWidth: 520, width: "100%",
          animation: "fadeIn 0.18s ease",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, letterSpacing: "0.2em", color: T.accent, textTransform: "uppercase", fontWeight: 700, marginBottom: 20 }}>
          ▶ Run Assessment — 분석 확인
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 16, color: T.textMd, lineHeight: 1.6, marginBottom: 20 }}>
            아래 설정으로 <span style={{ color: T.textHi, fontWeight: 600 }}>NPLF 판정</span>을 실행하시겠습니까?
          </div>

          <div style={{
            background: T.surface2, border: `1px solid ${T.borderL}`,
            borderRadius: 5, padding: "16px 20px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {[
              { label: "Target",         content: <><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: T.accent, marginRight: 10 }}>{proc.id}</span><span style={{ fontSize: 14, fontWeight: 600, color: T.textHi }}>{proc.name}</span></> },
              { label: "Document",       content: <><div style={{ fontSize: 13, color: T.textHi, fontWeight: 500, wordBreak: "break-all" }}>{fileName}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textLo, marginTop: 4 }}>{(fileSize/1024).toFixed(1)} KB · {getFormatByName(fileName)?.label || "FILE"}</div></> },
              { label: "Base Practices", content: <span style={{ fontSize: 14, fontWeight: 700, color: T.textHi }}>{proc.bps.length} BPs</span> },
            ].map(({ label, content }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textLo, letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 80, paddingTop: 2 }}>{label}</div>
                <div>{content}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: "transparent", color: T.textMd,
              border: `1px solid ${T.borderM}`, padding: "11px 26px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", borderRadius: 4, fontWeight: 600,
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: T.accent, color: "#0A0A0C", border: "none",
              padding: "11px 32px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", borderRadius: 4, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <Play size={13} /> 분석 시작
          </button>
        </div>
      </div>
    </div>
  );
}

'@

Write-Host ""
Write-Host "설치 완료! 서버 재시작:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White