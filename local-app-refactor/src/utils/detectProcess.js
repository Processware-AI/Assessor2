import { PROCESS_DETECT_RULES } from "../data/processData";

export function detectProcess(filename) {
  const stem = filename.replace(/\.[^.]+$/, "");
  const normalized = stem.replace(/[_\-\.]/g, " ");
  for (const rule of PROCESS_DETECT_RULES) {
    if (rule.patterns.some(p => p.test(stem) || p.test(normalized))) return rule.id;
  }
  return null;
}
