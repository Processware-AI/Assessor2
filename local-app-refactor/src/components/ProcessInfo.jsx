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
