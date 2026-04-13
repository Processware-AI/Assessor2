"use client";

import { useEffect, useState } from "react";
import HarnessEditor from "@/components/HarnessEditor";
import ProcessReferenceEditor from "@/components/ProcessReferenceEditor";
import StandardsManager from "@/components/StandardsManager";
import ApiKeyEditor from "@/components/ApiKeyEditor";

type Tab = "harness" | "reference" | "standards" | "apikey";

const TABS: { id: Tab; label: string; desc: string }[] = [
  {
    id: "harness",
    label: "하네스 설정",
    desc: "활성 표준의 에이전트 정체성 · 모델 · 프롬프트 레이어 · Rubric · 도구",
  },
  {
    id: "reference",
    label: "레퍼런스",
    desc: "활성 표준의 Reference Item · Requirement · Work Product CRUD",
  },
  {
    id: "standards",
    label: "표준 프로파일",
    desc: "ASPICE / ISO 21434 / 사용자 정의 표준 생성 · 복제 · 가져오기 · 내보내기",
  },
  {
    id: "apikey",
    label: "API 키",
    desc: "Anthropic API 키 설정 및 관리",
  },
];

export default function Page() {
  const [tab, setTab] = useState<Tab>("harness");
  // Key used to force-remount the child editors when the active standard
  // changes (so they re-fetch against the new profile).
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handler = () => setKey((k) => k + 1);
    window.addEventListener("active-standard-changed", handler);
    return () => window.removeEventListener("active-standard-changed", handler);
  }, []);

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
        {tab === "harness" && <HarnessEditor key={`h-${key}`} />}
        {tab === "reference" && <ProcessReferenceEditor key={`r-${key}`} />}
        {tab === "standards" && (
          <StandardsManager key={`s-${key}`} onActiveChanged={() => setKey((k) => k + 1)} />
        )}
        {tab === "apikey" && <ApiKeyEditor />}
      </div>
    </div>
  );
}
