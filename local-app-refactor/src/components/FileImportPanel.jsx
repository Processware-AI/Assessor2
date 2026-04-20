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
