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
