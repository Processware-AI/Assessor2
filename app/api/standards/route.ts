import { NextRequest, NextResponse } from "next/server";
import {
  deleteStandard,
  duplicateStandard,
  getActiveStandardId,
  listStandards,
  loadStandard,
  saveStandard,
  setActiveStandardId,
  type StandardProfile,
} from "@/lib/standards";

// GET  /api/standards                    → list summaries + active id
// GET  /api/standards?id=aspice-v4       → full profile
// POST /api/standards { standard }       → create (fails if id exists)
// POST /api/standards { duplicate: { source, new_id, new_name } } → clone
// POST /api/standards { activate: id }   → set active
// PUT  /api/standards { standard }       → replace (id must exist)
// DELETE /api/standards?id=...           → delete (auto-fallback active)

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const s = await loadStandard(id);
    if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ standard: s });
  }
  const sums = await listStandards();
  const active = await getActiveStandardId();
  return NextResponse.json({ standards: sums, active });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (typeof body.activate === "string") {
    try {
      await setActiveStandardId(body.activate);
      return NextResponse.json({ ok: true, active: body.activate });
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 400 }
      );
    }
  }

  if (body.duplicate) {
    const { source, new_id, new_name } = body.duplicate as {
      source: string;
      new_id: string;
      new_name?: string;
    };
    if (!source || !new_id) {
      return NextResponse.json(
        { error: "duplicate.source and duplicate.new_id required" },
        { status: 400 }
      );
    }
    try {
      const s = await duplicateStandard(source, new_id, new_name || "");
      return NextResponse.json({ standard: s });
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 400 }
      );
    }
  }

  if (body.standard) {
    const incoming = body.standard as StandardProfile;
    const existing = await loadStandard(incoming.id);
    if (existing) {
      return NextResponse.json(
        { error: `이미 존재하는 ID: ${incoming.id}` },
        { status: 409 }
      );
    }
    try {
      const saved = await saveStandard(incoming);
      return NextResponse.json({ standard: saved });
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    { error: "unsupported body — expected {activate} / {duplicate} / {standard}" },
    { status: 400 }
  );
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.standard) {
    return NextResponse.json({ error: "missing standard" }, { status: 400 });
  }
  try {
    const saved = await saveStandard(body.standard);
    return NextResponse.json({ standard: saved });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await deleteStandard(id);
  return NextResponse.json({ ok: true });
}
