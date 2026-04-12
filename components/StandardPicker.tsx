"use client";

import { useCallback, useEffect, useState } from "react";

type Summary = { id: string; name: string; version: string };

export default function StandardPicker() {
  const [list, setList] = useState<Summary[]>([]);
  const [active, setActive] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/standards");
      const j = await res.json();
      setList(j.standards || []);
      setActive(j.active || "");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll occasionally in case another tab changed the active standard.
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, [refresh]);

  const change = async (id: string) => {
    if (id === active || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/standards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ activate: id }),
      });
      if (res.ok) {
        setActive(id);
        // Notify the rest of the app so pages that cache state can refresh.
        window.dispatchEvent(new CustomEvent("active-standard-changed", { detail: { id } }));
      }
    } finally {
      setBusy(false);
    }
  };

  if (!list.length) return null;

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-muted">표준</span>
      <select
        value={active}
        disabled={busy}
        onChange={(e) => change(e.target.value)}
        className="!py-1 !px-2 text-xs"
      >
        {list.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.version})
          </option>
        ))}
      </select>
    </div>
  );
}
