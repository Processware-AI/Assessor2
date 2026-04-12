import { NextRequest, NextResponse } from "next/server";
import {
  loadAspiceProcesses,
  saveAspiceProcesses,
  resetAspiceProcesses,
  isValidProcess,
  type AspiceProcess,
} from "@/lib/aspice";

// GET  /api/aspice               → { processes: AspiceProcess[] }
// PUT  /api/aspice               → body: { processes: AspiceProcess[] }  (replace whole list)
//                                  or body: { process: AspiceProcess }   (upsert one)
// POST /api/aspice               → body: { process: AspiceProcess }      (create one, fails if id exists)
// DELETE /api/aspice?id=SWE.7    → remove one
// DELETE /api/aspice?id=__reset__ → restore stock defaults

export async function GET() {
  const processes = await loadAspiceProcesses();
  return NextResponse.json({ processes });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Replace full list
  if (Array.isArray(body.processes)) {
    const incoming = body.processes as unknown[];
    const invalid = incoming.filter((p) => !isValidProcess(p));
    if (invalid.length) {
      return NextResponse.json(
        { error: `${invalid.length}개 프로세스가 유효하지 않습니다.` },
        { status: 400 }
      );
    }
    const saved = await saveAspiceProcesses(incoming as AspiceProcess[]);
    return NextResponse.json({ processes: saved });
  }

  // Upsert single
  if (body.process) {
    if (!isValidProcess(body.process)) {
      return NextResponse.json({ error: "invalid process" }, { status: 400 });
    }
    const list = await loadAspiceProcesses();
    const next = list.slice();
    const idx = next.findIndex((p) => p.id === body.process.id);
    if (idx >= 0) next[idx] = body.process;
    else next.push(body.process);
    const saved = await saveAspiceProcesses(next);
    return NextResponse.json({ processes: saved });
  }

  return NextResponse.json(
    { error: "body must contain 'processes' array or 'process' object" },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.process || !isValidProcess(body.process)) {
    return NextResponse.json({ error: "invalid process" }, { status: 400 });
  }
  const list = await loadAspiceProcesses();
  if (list.some((p) => p.id === body.process.id)) {
    return NextResponse.json(
      { error: `이미 존재하는 프로세스 ID: ${body.process.id}` },
      { status: 409 }
    );
  }
  const saved = await saveAspiceProcesses([...list, body.process]);
  return NextResponse.json({ processes: saved });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  if (id === "__reset__") {
    const list = await resetAspiceProcesses();
    return NextResponse.json({ processes: list });
  }

  const list = await loadAspiceProcesses();
  const next = list.filter((p) => p.id !== id);
  const saved = await saveAspiceProcesses(next);
  return NextResponse.json({ processes: saved });
}
