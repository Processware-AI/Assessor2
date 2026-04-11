import { NextRequest, NextResponse } from "next/server";
import { loadHarness, saveHarness, resetHarness, type HarnessConfig } from "@/lib/harness";
import { ASPICE_PROCESSES } from "@/lib/aspice";

export async function GET() {
  const cfg = await loadHarness();
  return NextResponse.json({
    harness: cfg,
    available_processes: ASPICE_PROCESSES.map((p) => ({ id: p.id, name: p.name })),
  });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Partial<HarnessConfig>;
  const current = await loadHarness();
  const next: HarnessConfig = { ...current, ...body } as HarnessConfig;
  const saved = await saveHarness(next);
  return NextResponse.json({ harness: saved });
}

export async function DELETE() {
  const cfg = await resetHarness();
  return NextResponse.json({ harness: cfg });
}
