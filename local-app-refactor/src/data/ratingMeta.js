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
