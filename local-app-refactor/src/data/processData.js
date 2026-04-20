export const PROCESS_GROUPS = [
  { label: "SYS — System Engineering",   color: "#60A5FA", ids: ["SYS.2","SYS.3","SYS.4","SYS.5"] },
  { label: "SWE — Software Engineering", color: "#A78BFA", ids: ["SWE.1","SWE.2","SWE.3","SWE.4","SWE.5","SWE.6"] },
  { label: "MAN — Management",           color: "#34D399", ids: ["MAN.3"] },
  { label: "SUP — Support",              color: "#FBBF24", ids: ["SUP.1","SUP.8","SUP.9","SUP.10"] },
];

export const SUPPORTED_FORMATS = {
  pdf:  { mediaType: "application/pdf",   label: "PDF",  mode: "pdf"  },
  docx: { mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "DOCX", mode: "docx" },
  doc:  { mediaType: "application/msword", label: "DOC", mode: "docx" },
  xlsx: { mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "XLSX", mode: "xlsx" },
  md:   { mediaType: "text/markdown",     label: "MD",   mode: "text" },
};

export const ACCEPT_ATTR = ".pdf,.doc,.docx,.xlsx,.md";

export const getFormatByName = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  return SUPPORTED_FORMATS[ext] || null;
};

// Process auto-detection rules (matched against filename stem)
export const PROCESS_DETECT_RULES = [
  // SUP.10 must come before SUP.1 (more specific match first)
  { id: "SUP.10", patterns: [/sup[\._\-]?10(?!\d)/i] },
  { id: "SYS.2",  patterns: [/sys[\._\-]?2(?!\d)/i] },
  { id: "SYS.3",  patterns: [/sys[\._\-]?3(?!\d)/i] },
  { id: "SYS.4",  patterns: [/sys[\._\-]?4(?!\d)/i] },
  { id: "SYS.5",  patterns: [/sys[\._\-]?5(?!\d)/i] },
  { id: "SWE.1",  patterns: [/swe[\._\-]?1(?!\d)/i] },
  { id: "SWE.2",  patterns: [/swe[\._\-]?2(?!\d)/i] },
  { id: "SWE.3",  patterns: [/swe[\._\-]?3(?!\d)/i] },
  { id: "SWE.4",  patterns: [/swe[\._\-]?4(?!\d)/i] },
  { id: "SWE.5",  patterns: [/swe[\._\-]?5(?!\d)/i] },
  { id: "SWE.6",  patterns: [/swe[\._\-]?6(?!\d)/i] },
  { id: "SUP.1",  patterns: [/sup[\._\-]?1(?!\d)/i] },
  { id: "SUP.8",  patterns: [/sup[\._\-]?8(?!\d)/i] },
  { id: "SUP.9",  patterns: [/sup[\._\-]?9(?!\d)/i] },
  { id: "MAN.3",  patterns: [/man[\._\-]?3(?!\d)/i] },
  // Document abbreviation patterns
  { id: "SYS.2",  patterns: [/\bsrs\b/i, /system[_\-\s]req/i, /sys[_\-\s]req/i] },
  { id: "SYS.3",  patterns: [/\bsad\b/i, /system[_\-\s]arch/i, /sys[_\-\s]arch/i] },
  { id: "SYS.4",  patterns: [/\bsiv\b/i, /system[_\-\s]integ/i] },
  { id: "SYS.5",  patterns: [/\bsvs\b/i, /system[_\-\s]verif/i] },
  { id: "SWE.1",  patterns: [/\bswrs\b/i, /sw[_\-\s]req/i, /software[_\-\s]req/i] },
  { id: "SWE.2",  patterns: [/\bswad\b/i, /sw[_\-\s]arch/i, /software[_\-\s]arch/i] },
  { id: "SWE.3",  patterns: [/\bddd\b/i, /detailed[_\-\s]design/i, /unit[_\-\s]design/i] },
  { id: "SWE.4",  patterns: [/\bsut\b/i, /unit[_\-\s]test/i, /unit[_\-\s]verif/i] },
  { id: "SWE.5",  patterns: [/sw[_\-\s]integr/i, /software[_\-\s]integr/i] },
  { id: "SWE.6",  patterns: [/sw[_\-\s]verif/i, /sw[_\-\s]test/i, /software[_\-\s]verif/i] },
  { id: "SUP.1",  patterns: [/\bqap?\b/i, /quality[_\-\s]assur/i] },
  { id: "SUP.8",  patterns: [/\bcmp\b/i, /config[_\-\s]mgmt/i, /config[_\-\s]man/i, /cm[_\-\s]plan/i] },
  { id: "SUP.9",  patterns: [/\bprm\b/i, /problem[_\-\s]res/i, /incident[_\-\s]rep/i] },
  { id: "SUP.10", patterns: [/\bcrm\b/i, /change[_\-\s]req/i, /change[_\-\s]man/i] },
  { id: "MAN.3",  patterns: [/project[_\-\s]plan/i, /project[_\-\s]man/i, /\bpmp\b/i, /project[_\-\s]sched/i] },
];
