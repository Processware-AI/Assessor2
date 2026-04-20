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
