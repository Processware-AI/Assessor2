import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ASPICE Assessor",
  description: "자동차 제어기 프로젝트 산출물을 ASPICE 기반으로 평가하는 AI 어세서",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-bg text-white min-h-screen font-sans antialiased">
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-border bg-panel/80 backdrop-blur sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="inline-block w-2 h-6 rounded bg-gradient-to-b from-accent to-accent2" />
                <span>ASPICE Assessor</span>
              </Link>
              <nav className="ml-auto flex items-center gap-2 text-sm">
                <Link href="/" className="px-3 py-1.5 rounded hover:bg-panel2">
                  평가 채팅
                </Link>
                <Link href="/harness" className="px-3 py-1.5 rounded hover:bg-panel2">
                  하네스 설정
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border text-xs text-muted text-center py-3">
            ASPICE v4.0 기반 AI 어세서 · Claude Opus 4.6 · 로컬 세션 저장
          </footer>
        </div>
      </body>
    </html>
  );
}
