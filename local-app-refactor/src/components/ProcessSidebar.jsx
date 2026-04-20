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
