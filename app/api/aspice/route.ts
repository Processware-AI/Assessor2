import { NextRequest, NextResponse } from "next/server";
import {
  getActiveStandard,
  isValidReferenceItem,
  resetActiveStandardToSeed,
  saveStandard,
  type ReferenceItem,
} from "@/lib/standards";

// Legacy route name kept for backward compatibility. Under the hood this now
// operates on the active standard's `reference` array — so editing through the
// UI works for whichever standard is currently active (ASPICE, 21434, custom).
//
// GET    /api/aspice              → { processes: ReferenceItem[] }
// PUT    /api/aspice              → body: { processes: ReferenceItem[] }  (replace)
//                                    or body: { process: ReferenceItem }   (upsert)
// POST   /api/aspice              → body: { process: ReferenceItem }       (create, 409 if exists)
// DELETE /api/aspice?id=X         → remove one by id
// DELETE /api/aspice?id=__reset__ → restore seed for active standard

export async function GET() {
  const s = await getActiveStandard();
  return NextResponse.json({ processes: s.reference });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (Array.isArray(body.processes)) {
    const incoming = body.processes as unknown[];
    const invalid = incoming.filter((p) => !isValidReferenceItem(p));
    if (invalid.length) {
      return NextResponse.json(
        { error: `${invalid.length}개 항목이 유효하지 않습니다.` },
        { status: 400 }
      );
    }
    const s = await getActiveStandard();
    const saved = await saveStandard({ ...s, reference: incoming as ReferenceItem[] });
    return NextResponse.json({ processes: saved.reference });
  }

  if (body.process) {
    if (!isValidReferenceItem(body.process)) {
      return NextResponse.json({ error: "invalid reference item" }, { status: 400 });
    }
    const s = await getActiveStandard();
    const next = s.reference.slice();
    const idx = next.findIndex((r) => r.id === body.process.id);
    if (idx >= 0) next[idx] = body.process;
    else next.push(body.process);
    const saved = await saveStandard({ ...s, reference: next });
    return NextResponse.json({ processes: saved.reference });
  }

  return NextResponse.json(
    { error: "body must contain 'processes' array or 'process' object" },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.process || !isValidReferenceItem(body.process)) {
    return NextResponse.json({ error: "invalid reference item" }, { status: 400 });
  }
  const s = await getActiveStandard();
  if (s.reference.some((r) => r.id === body.process.id)) {
    return NextResponse.json(
      { error: `이미 존재하는 ID: ${body.process.id}` },
      { status: 409 }
    );
  }
  const saved = await saveStandard({
    ...s,
    reference: [...s.reference, body.process],
  });
  return NextResponse.json({ processes: saved.reference });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  if (id === "__reset__") {
    try {
      const s = await resetActiveStandardToSeed();
      return NextResponse.json({ processes: s.reference });
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 400 }
      );
    }
  }

  const s = await getActiveStandard();
  const saved = await saveStandard({
    ...s,
    reference: s.reference.filter((r) => r.id !== id),
  });
  return NextResponse.json({ processes: saved.reference });
}
