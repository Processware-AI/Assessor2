// Legacy shim — the real harness lives inside the active StandardProfile
// (see lib/standards.ts). This file is kept only to preserve the public
// surface (loadHarness / saveHarness / resetHarness + type re-exports) so
// existing imports don't have to churn. New code should prefer the functions
// in lib/standards.ts directly.

import {
  getActiveStandard,
  resetActiveStandardToSeed,
  updateActiveHarness,
  type HarnessConfig,
  type HarnessPromptLayer,
  type HarnessRole,
  type HarnessTool,
  type RubricItem,
} from "./standards";

export type {
  HarnessConfig,
  HarnessPromptLayer,
  HarnessRole,
  HarnessTool,
  RubricItem,
};

export async function loadHarness(): Promise<HarnessConfig> {
  const s = await getActiveStandard();
  return s.harness;
}

export async function saveHarness(cfg: HarnessConfig): Promise<HarnessConfig> {
  const s = await updateActiveHarness(cfg);
  return s.harness;
}

export async function resetHarness(): Promise<HarnessConfig> {
  const s = await resetActiveStandardToSeed();
  return s.harness;
}
