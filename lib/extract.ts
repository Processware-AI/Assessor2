// Minimal text extraction for uploaded deliverables. We intentionally keep
// this lightweight — in a production setup this would delegate to a real
// parser service for .docx / .pdf / .xlsx. For now we handle UTF-8 text
// formats natively and best-effort-strip binary formats.

export function extractText(filename: string, mime: string, buf: Buffer): string {
  const lower = filename.toLowerCase();
  const isTextMime = mime.startsWith("text/") || mime === "application/json" || mime === "application/xml";
  const isTextExt = /\.(txt|md|markdown|csv|tsv|json|xml|yml|yaml|log|c|h|cpp|hpp|cc|hh|py|ts|tsx|js|jsx|rs|go|java|kt|ino|arxml|reqif|reqifz|html|htm|sql)$/i.test(
    lower
  );

  if (isTextMime || isTextExt) {
    try {
      return buf.toString("utf-8");
    } catch {
      return buf.toString("latin1");
    }
  }

  // Best-effort for office / pdf: extract printable ASCII/UTF-8 runs.
  // This is NOT a real parser but gives the agent *something* to grep.
  const str = buf.toString("latin1");
  const printable = str.replace(/[^\x09\x0a\x0d\x20-\x7e\u00a0-\uffff]/g, " ");
  const collapsed = printable.replace(/\s{2,}/g, " ").trim();
  if (collapsed.length < 40) {
    return `[${filename}: 바이너리 형식이어서 텍스트 추출에 실패했습니다. 파일명과 크기(${buf.length} bytes)만 사용 가능합니다. 가능하다면 .md / .txt / .html 로 변환 후 다시 업로드해주세요.]`;
  }
  return collapsed;
}
