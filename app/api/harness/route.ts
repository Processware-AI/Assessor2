import { NextRequest, NextResponse } from "next/server";
import { loadHarness, saveHarness, resetHarness, type HarnessConfig } from "@/lib/harness";
import { loadAspiceProcesses } from "@/lib/aspice";

export async function GET() {
  const cfg = await loadHarness();
  const processes = await loadAspiceProcesses();
  return NextResponse.json({
    harness: cfg,
    available_processes: processes.map((p) => ({ id: p.id, name: p.name })),
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
