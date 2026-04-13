// API key storage: reads from data/config.json first, falls back to env var.
// The data/ directory is in .gitignore so keys are never committed.

import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_PATH = path.join(process.cwd(), "data", "config.json");

type Config = {
  anthropic_api_key?: string;
};

async function readConfig(): Promise<Config> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as Config;
  } catch {
    return {};
  }
}

async function writeConfig(cfg: Config): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
}

/** Returns the Anthropic API key: config file takes priority over env var. */
export async function getApiKey(): Promise<string | null> {
  const cfg = await readConfig();
  return cfg.anthropic_api_key || process.env.ANTHROPIC_API_KEY || null;
}

/** Saves the API key to data/config.json. Pass null to clear it. */
export async function setApiKey(key: string | null): Promise<void> {
  const cfg = await readConfig();
  if (key === null) {
    delete cfg.anthropic_api_key;
  } else {
    cfg.anthropic_api_key = key;
  }
  await writeConfig(cfg);
}

/** Returns true if a key is configured (file or env var). */
export async function hasApiKey(): Promise<boolean> {
  return (await getApiKey()) !== null;
}

/** Returns a masked representation safe to send to the client, e.g. sk-ant-...abcd */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 10) + "..." + key.slice(-4);
}
