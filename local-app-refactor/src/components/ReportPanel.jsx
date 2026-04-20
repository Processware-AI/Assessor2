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
