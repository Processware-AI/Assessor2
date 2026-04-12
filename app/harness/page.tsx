"use client";

import { useState } from "react";
import HarnessEditor from "@/components/HarnessEditor";
import ProcessReferenceEditor from "@/components/ProcessReferenceEditor";

type Tab = "harness" | "aspice";

const TABS: { id: Tab; label: string; desc: string }[] = [
  {
    id: "harness",
    label: "하네스 설정",
    desc: "에이전트 정체성 · 모델 · 프롬프트 레이어 · Rubric · 도구",
  },
  {
    id: "aspice",
    label: "프로세스 레퍼런스",
    desc: "ASPICE 프로세스 · Base Practice · Work Product CRUD",
  },
];

export default function Page() {
  const [tab, setTab] = useState<Tab>("harness");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">에이전트 구성</h1>
        <div className="text-xs text-muted">
          {TABS.find((t) => t.id === tab)?.desc}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 transition-colors ${
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {tab === "harness" ? <HarnessEditor /> : <ProcessReferenceEditor />}
      </div>
    </div>
  );
}
