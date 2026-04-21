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

  // ── Sample data (fixed to SWE.2 — 5 BPs, all 6-tier ratings used) ──────────
  const loadSample = () => {
    // Hardcoded ratings for SWE.2 BP1–BP5 using N/P-/P+/L-/L+/F scale
    // Counts: F=1, L+=1, L-=2, P+=1, P-=0, N=0  →  total=5 = proc.bps.length ✓
    const sampleRatings = [
      {
        bp: "BP1", rating: "L+",
        rationale: "정적 아키텍처(컴포넌트/인터페이스) 명세가 문서화되어 있으나, 일부 외부 인터페이스 상세 정의 미흡.",
        evidence: "SWAD_v2.1.docx §3.1 Component Diagram · §3.3 Interface List (pp.14–22)",
      },
      {
        bp: "BP2", rating: "L-",
        rationale: "시퀀스 다이어그램 등 동적 측면이 일부 작성되었으나, 소프트웨어 모드/상태 전환 행위 정의가 부분적.",
        evidence: "SWAD_v2.1.docx §4 Sequence Diagrams — 5개 시나리오 중 3개 작성 확인",
      },
      {
        bp: "BP3", rating: "P+",
        rationale: "아키텍처 분석이 수행되었으나, Cybersecurity/Safety 관련 설계 결정 근거 문서화 미흡.",
        evidence: "SWAD_Review_MoM_2026-01-20.pdf · Action item 5건 중 2건 미결 상태",
      },
      {
        bp: "BP4", rating: "F",
        rationale: "Polarion을 통해 SW 아키텍처와 SW 요구사항 간 양방향 추적성 완전 확립. 0 orphan.",
        evidence: "Polarion Traceability Matrix 2026-03-15 — 100% coverage, 0 orphans confirmed",
      },
      {
        bp: "BP5", rating: "L-",
        rationale: "합의된 아키텍처가 관련 이해관계자에게 배포되었으나, 일부 팀의 검토 수신 확인이 누락.",
        evidence: "SharePoint SWAD_v2.1 배포 이력 — QA 팀 수신 확인서 미첨부",
      },
    ];
    const sampleResults = {
      ratings: sampleRatings,
      summary: "BP3(아키텍처 분석) P+ 미달로 CL1 미충족. 설계 결정 근거 문서화 및 Safety 분석 보완 필요.",
      strengths: "Polarion 기반 완전한 양방향 추적성 확립(BP4 F), 정적 아키텍처 체계적 명세(BP1 L+)",
      gaps: "아키텍처 분석 근거 문서화 미흡(BP3 P+), 동적 행위 정의 불완전(BP2 L-), 이해관계자 검토 확인 누락(BP5 L-)",
    };
    setSelectedProcess("SWE.2");
    setResults(sampleResults);
    setFileName("sample_SWAD_v2.1.docx");
    setFileSize(1843200);
    setError(""); setPhase(""); setSelectedHistoryId(null);
    // Sample results are for preview only — not saved to history
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
