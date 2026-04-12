import { NextRequest, NextResponse } from "next/server";
import {
  getActiveStandard,
  resetActiveStandardToSeed,
  updateActiveHarness,
  type HarnessConfig,
} from "@/lib/standards";

// GET    /api/harness  → harness of active standard + available reference items
// PUT    /api/harness  → update active standard's harness (merged with existing)
// DELETE /api/harness  → reset active standard to its bundled seed (if any)

export async function GET() {
  const s = await getActiveStandard();
  return NextResponse.json({
    harness: s.harness,
    standard: {
      id: s.id,
      name: s.name,
      version: s.version,
      ratings: s.ratings,
      maturity_levels: s.maturity_levels,
    },
    available_items: s.reference.map((r) => ({ id: r.id, name: r.name })),
  });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Partial<HarnessConfig>;
  const next = await updateActiveHarness(body);
  return NextResponse.json({ harness: next.harness });
}

export async function DELETE() {
  try {
    const next = await resetActiveStandardToSeed();
    return NextResponse.json({ harness: next.harness });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
