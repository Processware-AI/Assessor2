# Fix loadSample: fixed SWE.2 sample data, no history entry, 6-tier ratings
# Run: powershell -ExecutionPolicy Bypass -File fix_sample.ps1

$f = "C:\Users\LG\aspice-app\src\App.jsx"
$txt = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Start/end markers — work for both monolithic and refactored App.jsx
$startMarker = "  const loadSample = () => {"
$endMarker   = "  const analyze = async () => {"

$si = $txt.IndexOf($startMarker)
$ei = $txt.IndexOf($endMarker)

if ($si -lt 0) { Write-Host "ERROR: loadSample start not found" -ForegroundColor Red; exit 1 }
if ($ei -lt 0) { Write-Host "ERROR: analyze marker not found" -ForegroundColor Red; exit 1 }
if ($si -ge $ei) { Write-Host "ERROR: marker order wrong" -ForegroundColor Red; exit 1 }

# New loadSample — fixed SWE.2, 5 BPs, counts: F=1 L+=1 L-=2 P+=1 P-=0 N=0 => total=5
$newFunc = @'
  // Sample data fixed to SWE.2 — 5 BPs, all 6-tier ratings (N/P-/P+/L-/L+/F)
  const loadSample = () => {
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
    // Sample results are for preview only - not saved to history
  };

'@

$backup = $f + ".bak_" + (Get-Date -Format "HHmmss")
[System.IO.File]::WriteAllText($backup, $txt, [System.Text.Encoding]::UTF8)
Write-Host "Backup: $backup" -ForegroundColor Cyan

$result = $txt.Substring(0, $si) + $newFunc + $txt.Substring($ei)
[System.IO.File]::WriteAllText($f, $result, [System.Text.Encoding]::UTF8)
Write-Host "Done! Run: npm run dev" -ForegroundColor Green
