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
