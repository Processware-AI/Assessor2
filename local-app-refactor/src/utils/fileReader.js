import mammoth from "mammoth";
import * as XLSX from "xlsx";

export const toBase64 = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(f);
});

const readArrayBuffer = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsArrayBuffer(f);
});

const readAsText = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsText(f, "utf-8");
});

export const extractDocxText = async (f) => {
  const buf = await readArrayBuffer(f);
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
};

export const extractXlsxText = async (f) => {
  const buf = await readArrayBuffer(f);
  const wb = XLSX.read(buf, { type: "array" });
  return wb.SheetNames.map(name => {
    const rows = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
    return `[Sheet: ${name}]\n${rows}`;
  }).join("\n\n");
};

export const readFileAsText = readAsText;
