// Standards module — a standard-neutral profile store. Each "standard profile"
// bundles its own harness (the agent configuration) and its own reference
// catalog (clauses / processes / requirements / work products) into a single
// JSON file under data/standards/{id}.json. An "active standard" pointer at
// data/active_standard.json tells the rest of the app which profile is
// currently in effect; the chat / assessment routes read from this pointer on
// every call, so switching standards is instant.
//
// The types here are deliberately generic so ASPICE, ISO/SAE 21434, ISO 26262,
// ISO 21448 (SOTIF) and company-specific standards can all live side by side
// with the same shape.

import fs from "node:fs/promises";
import path from "node:path";
import { SEED_STANDARDS } from "./seeds";

// -----------------------------------------------------------------------------
// Generic reference item types
// -----------------------------------------------------------------------------

// One atomic requirement inside a clause/process: ASPICE BP, 21434 RQ/PM/RC,
// 26262 Requirement, etc. The `type` field is free-form so new standards can
// define their own taxonomies.
export type RequirementItem = {
  id: string;           // e.g. "SWE.1.BP1", "RQ-09-07", "6-8.4.2"
  type: string;         // "BP" | "RQ" | "PM" | "RC" | "REQ" ... (free-form)
  title: string;
  description: string;
};

// A "reference item" is a unit the agent can be scoped to: an ASPICE process,
// an ISO clause, a 26262 part/section, or a company-specific gate.
export type ReferenceItem = {
  id: string;                       // "SWE.1", "Clause.09", "ACME.CSEC"
  name: string;                     // display title
  purpose: string;                  // goal/intent
  requirements: RequirementItem[];  // atomic checkable items
  workProducts: string[];           // expected artefacts
  metadata?: Record<string, string>; // ASIL, CAL, owner, …
};

export type MaturityLevel = {
  id: string;          // "CL1", "CAL2", "ASIL-B"
  name: string;
  description: string;
};

// -----------------------------------------------------------------------------
// Harness (generic, not tied to any standard)
// -----------------------------------------------------------------------------

export type HarnessRole = "assessor" | "planner" | "reviewer";

export type HarnessTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  enabled: boolean;
};

export type HarnessPromptLayer = {
  id: string;                 // "identity" | "reference_knowledge" | "task" | "rubric" | "format"
  label: string;
  content: string;
  cache: boolean;
  editable: boolean;
};

export type RubricItem = {
  id: string;
  label: string;
  description: string;
  weight: number;
};

export type HarnessConfig = {
  version: number;
  name: string;
  description: string;
  role: HarnessRole;
  model: string;
  max_tokens: number;
  temperature: number;
  // Standard-neutral scope selector — which reference items are in play.
  scope_item_ids: string[];
  // Free-form maturity level ID (e.g. "CL2", "CAL3"); must match one of
  // the active standard's maturity_levels.
  target_maturity_level: string;
  prompt_layers: HarnessPromptLayer[];
  tools: HarnessTool[];
  rubric: RubricItem[];
  output_format: "report_markdown" | "json" | "both";
  updated_at: string;
};

// -----------------------------------------------------------------------------
// Top-level standard profile
// -----------------------------------------------------------------------------

export type StandardProfile = {
  id: string;                    // "aspice-v4", "iso21434"
  name: string;                  // "Automotive SPICE v4.0"
  version: string;               // "4.0", "2021"
  description: string;
  // Allowed rating codes (free-form strings). The harness's record_finding
  // tool should match this set.
  ratings: string[];             // e.g. ["N","P","L","F","NR"]
  maturity_levels: MaturityLevel[];
  harness: HarnessConfig;
  reference: ReferenceItem[];
  updated_at: string;
};

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

export function isValidReferenceItem(o: unknown): o is ReferenceItem {
  if (!o || typeof o !== "object") return false;
  const r = o as Record<string, unknown>;
  if (typeof r.id !== "string" || r.id.length === 0) return false;
  if (typeof r.name !== "string") return false;
  if (typeof r.purpose !== "string") return false;
  if (!Array.isArray(r.requirements)) return false;
  if (!Array.isArray(r.workProducts)) return false;
  for (const req of r.requirements) {
    if (!req || typeof req !== "object") return false;
    const rq = req as Record<string, unknown>;
    if (typeof rq.id !== "string") return false;
    if (typeof rq.title !== "string") return false;
    if (rq.description !== undefined && typeof rq.description !== "string") return false;
    if (rq.type !== undefined && typeof rq.type !== "string") return false;
  }
  for (const wp of r.workProducts) {
    if (typeof wp !== "string") return false;
  }
  return true;
}

export function isValidProfile(o: unknown): o is StandardProfile {
  if (!o || typeof o !== "object") return false;
  const p = o as Record<string, unknown>;
  if (typeof p.id !== "string" || p.id.length === 0) return false;
  if (typeof p.name !== "string") return false;
  if (typeof p.version !== "string") return false;
  if (!Array.isArray(p.ratings)) return false;
  if (!Array.isArray(p.maturity_levels)) return false;
  if (!p.harness || typeof p.harness !== "object") return false;
  if (!Array.isArray(p.reference)) return false;
  return true;
}

// -----------------------------------------------------------------------------
// Filesystem layout + seeding
// -----------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const STANDARDS_DIR = path.join(DATA_DIR, "standards");
const ACTIVE_FILE = path.join(DATA_DIR, "active_standard.json");
const DEFAULT_ACTIVE_ID = "aspice-v4";

async function ensureDirs() {
  await fs.mkdir(STANDARDS_DIR, { recursive: true });
}

async function standardExists(id: string): Promise<boolean> {
  try {
    await fs.access(path.join(STANDARDS_DIR, `${id}.json`));
    return true;
  } catch {
    return false;
  }
}

async function writeProfileFile(p: StandardProfile): Promise<StandardProfile> {
  const file = path.join(STANDARDS_DIR, `${p.id}.json`);
  const next: StandardProfile = { ...p, updated_at: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

// On first run (or if a seed is missing), drop the bundled seeds into place
// but never overwrite user edits.
async function seedIfMissing() {
  await ensureDirs();
  for (const seed of SEED_STANDARDS) {
    if (!(await standardExists(seed.id))) {
      await writeProfileFile(seed);
    }
  }
  try {
    await fs.access(ACTIVE_FILE);
  } catch {
    await fs.writeFile(
      ACTIVE_FILE,
      JSON.stringify({ id: DEFAULT_ACTIVE_ID }, null, 2),
      "utf-8"
    );
  }
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export type StandardSummary = Pick<
  StandardProfile,
  "id" | "name" | "version" | "description" | "updated_at"
>;

export async function listStandards(): Promise<StandardSummary[]> {
  await seedIfMissing();
  const files = await fs.readdir(STANDARDS_DIR);
  const out: StandardSummary[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(STANDARDS_DIR, f), "utf-8");
      const p = JSON.parse(raw) as StandardProfile;
      out.push({
        id: p.id,
        name: p.name,
        version: p.version,
        description: p.description,
        updated_at: p.updated_at,
      });
    } catch {
      // skip malformed files
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export async function loadStandard(id: string): Promise<StandardProfile | null> {
  await seedIfMissing();
  try {
    const raw = await fs.readFile(path.join(STANDARDS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw) as StandardProfile;
  } catch {
    return null;
  }
}

export async function saveStandard(p: StandardProfile): Promise<StandardProfile> {
  await ensureDirs();
  if (!isValidProfile(p)) throw new Error("invalid standard profile");
  return writeProfileFile(p);
}

export async function deleteStandard(id: string): Promise<void> {
  try {
    await fs.unlink(path.join(STANDARDS_DIR, `${id}.json`));
  } catch {}
  const active = await getActiveStandardId();
  if (active === id) {
    const remaining = await listStandards();
    if (remaining.length) await setActiveStandardId(remaining[0].id);
  }
}

export async function duplicateStandard(
  sourceId: string,
  newId: string,
  newName: string
): Promise<StandardProfile> {
  const src = await loadStandard(sourceId);
  if (!src) throw new Error("source not found");
  if (await standardExists(newId)) throw new Error("target id already exists");
  const copy: StandardProfile = {
    ...src,
    id: newId,
    name: newName || `${src.name} (사본)`,
  };
  return writeProfileFile(copy);
}

export async function getActiveStandardId(): Promise<string> {
  await seedIfMissing();
  try {
    const raw = await fs.readFile(ACTIVE_FILE, "utf-8");
    const j = JSON.parse(raw) as { id?: string };
    return j.id || DEFAULT_ACTIVE_ID;
  } catch {
    return DEFAULT_ACTIVE_ID;
  }
}

export async function setActiveStandardId(id: string): Promise<void> {
  await ensureDirs();
  if (!(await standardExists(id))) {
    throw new Error(`standard not found: ${id}`);
  }
  await fs.writeFile(ACTIVE_FILE, JSON.stringify({ id }, null, 2), "utf-8");
}

export async function getActiveStandard(): Promise<StandardProfile> {
  const id = await getActiveStandardId();
  const p = await loadStandard(id);
  if (p) return p;
  // Fall back to first available — then to the very first seed.
  const list = await listStandards();
  if (list.length) {
    const first = await loadStandard(list[0].id);
    if (first) return first;
  }
  return SEED_STANDARDS[0];
}

// Convenience mutators on the currently active profile.
export async function updateActiveHarness(
  patch: Partial<HarnessConfig>
): Promise<StandardProfile> {
  const p = await getActiveStandard();
  const next: StandardProfile = {
    ...p,
    harness: { ...p.harness, ...patch, updated_at: new Date().toISOString() },
  };
  return writeProfileFile(next);
}

export async function updateActiveReference(
  items: ReferenceItem[]
): Promise<StandardProfile> {
  const p = await getActiveStandard();
  const next: StandardProfile = { ...p, reference: items };
  return writeProfileFile(next);
}

export async function resetActiveStandardToSeed(): Promise<StandardProfile> {
  const id = await getActiveStandardId();
  const seed = SEED_STANDARDS.find((s) => s.id === id);
  if (!seed) throw new Error(`no seed available for active standard: ${id}`);
  return writeProfileFile(seed);
}

// -----------------------------------------------------------------------------
// Prompt rendering helper (generic over the reference shape)
// -----------------------------------------------------------------------------

export function renderReferenceBrief(
  items: ReferenceItem[],
  scopeIds: string[]
): string {
  const selected = scopeIds
    .map((id) => items.find((it) => it.id === id))
    .filter(Boolean) as ReferenceItem[];
  return selected
    .map((i) => {
      const reqs = i.requirements
        .map((r) => {
          const tag = r.type ? `[${r.type}] ` : "";
          return `  - ${tag}${r.id} ${r.title}${
            r.description ? `: ${r.description}` : ""
          }`;
        })
        .join("\n");
      const wps = i.workProducts.map((w) => `  * ${w}`).join("\n");
      const meta =
        i.metadata && Object.keys(i.metadata).length
          ? `\nMetadata: ${Object.entries(i.metadata)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}`
          : "";
      return `### ${i.id} — ${i.name}\n목적: ${i.purpose}${meta}\n요구사항:\n${reqs}\n기대 산출물:\n${wps}`;
    })
    .join("\n\n");
}
