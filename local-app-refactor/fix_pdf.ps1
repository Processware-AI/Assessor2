# downloadPdf 함수 완전 교체 스크립트
# 실행: powershell -ExecutionPolicy Bypass -File fix_pdf.ps1

$f = "C:\Users\LG\aspice-app\src\App.jsx"
$txt = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# 교체할 새 함수 (단일 인용 here-string: 백틱/달러 모두 그대로 처리됨)
$newFunc = @'
  const downloadPdf = async () => {
    if (!displayResults || !reportRef.current) return;
    setExporting(true);
    try {
      const node = reportRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        logging: false,
        windowWidth: node.scrollWidth,
        onclone: (clonedDoc) => {
          const sections = clonedDoc.querySelectorAll("section");
          let target = null;
          sections.forEach(el => {
            if (el.textContent && el.textContent.includes("NPLF VERDICT")) target = el;
          });
          if (!target) return;
          target.id = "pdf-export-root";

          const s = clonedDoc.createElement("style");
          s.textContent = `
            #pdf-export-root {
              background: #FFFFFF !important;
              color: #3F3F46 !important;
              border: 1.5px solid #0A0A0C !important;
              border-radius: 4px !important;
              padding: 20px 24px 22px !important;
              font-family: 'Inter', system-ui, sans-serif !important;
            }
            #pdf-export-root, #pdf-export-root * {
              color: #3F3F46 !important;
              letter-spacing: -0.005em !important;
            }
            #pdf-export-root > div:first-child {
              background: #FFFFFF !important; color: #0A0A0C !important;
              border: 1.5px solid #0A0A0C !important;
              font-size: 9px !important; padding: 3px 10px !important; top: -9px !important;
            }
            #pdf-export-root > div:first-child * { color: #0A0A0C !important; }
            #pdf-export-root h3 {
              color: #0A0A0C !important; font-size: 22px !important;
              margin: 0 0 6px 0 !important; font-weight: 700 !important;
            }
            #pdf-export-root h3 > span { font-size: 12px !important; color: #52525C !important; }
            #pdf-export-root p { font-size: 10.5px !important; line-height: 1.45 !important; margin: 0 !important; }
            #pdf-export-root div[style*="repeat(3, 1fr)"] { gap: 8px !important; margin-bottom: 14px !important; }
            #pdf-export-root div[style*="repeat(3, 1fr)"] > div {
              background: #FFFFFF !important; border-radius: 4px !important;
              padding: 10px 14px !important;
              border-width: 1px 1px 1px 4px !important; border-style: solid !important;
            }
            #pdf-export-root div[style*="repeat(3, 1fr)"] > div > div:nth-child(1) {
              font-size: 9px !important; font-weight: 700 !important; opacity: 1 !important;
            }
            #pdf-export-root div[style*="repeat(3, 1fr)"] > div > div:nth-child(2) {
              font-size: 32px !important; line-height: 1 !important;
              margin-top: 6px !important; font-weight: 800 !important; color: #111827 !important;
            }
            #pdf-export-root div[style*="repeat(3, 1fr)"] > div > div:nth-child(3) {
              font-size: 9px !important; color: #6B7280 !important;
              opacity: 1 !important; margin-top: 3px !important;
            }
            #pdf-export-root div[style*="1fr 1fr"] { gap: 10px !important; margin-bottom: 14px !important; }
            #pdf-export-root div[style*="1fr 1fr"] > div {
              background: #FAFAFA !important; border: 1px solid #D4D4D8 !important;
              border-left: 2.5px solid #0A0A0C !important;
              border-radius: 0 3px 3px 0 !important; padding: 10px 12px !important;
            }
            #pdf-export-root div[style*="1fr 1fr"] > div > div:nth-child(1) {
              font-size: 9px !important; color: #0A0A0C !important;
              font-weight: 700 !important; margin-bottom: 3px !important;
            }
            #pdf-export-root div[style*="1fr 1fr"] > div > div:nth-child(2) {
              font-size: 11px !important; color: #3F3F46 !important; line-height: 1.45 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] {
              background: #FFFFFF !important; border: 1px solid #0A0A0C !important;
              border-radius: 3px !important; margin-bottom: 0 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) {
              background: #FFFFFF !important; color: #0A0A0C !important;
              border-right: 1px solid #0A0A0C !important; padding: 6px 0 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) > div:nth-child(1) {
              font-size: 20px !important; font-weight: 800 !important;
              color: #0A0A0C !important; line-height: 1 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) > div:nth-child(2) {
              font-size: 7px !important; color: #52525C !important;
              opacity: 1 !important; margin-top: 2px !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) { padding: 8px 12px !important; }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(2) {
              font-size: 10px !important; color: #3F3F46 !important;
              line-height: 1.4 !important; margin-bottom: 3px !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(3) {
              font-size: 9px !important; color: #52525C !important; line-height: 1.4 !important;
            }
            #pdf-export-root > div[style*="flex-direction: column"]:last-child { gap: 5px !important; }
          `;
          clonedDoc.head.appendChild(s);
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableW = pageWidth - margin * 2;
      const imgW = usableW;
      let imgH = (canvas.height * imgW) / canvas.width;
      const headerH = 16;
      const usablePerPage = pageHeight - headerH - margin;
      const twoPageCapacity = usablePerPage * 2 - 4;
      let scaledImgW = imgW;
      if (imgH > twoPageCapacity) {
        const scale = twoPageCapacity / imgH;
        scaledImgW = imgW * scale;
        imgH = twoPageCapacity;
      }
      const imgX = (pageWidth - scaledImgW) / 2;

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setFillColor(248, 248, 250);
      pdf.rect(0, 0, pageWidth, headerH, "F");
      pdf.setDrawColor(180, 180, 188);
      pdf.setLineWidth(0.3);
      pdf.line(0, headerH, pageWidth, headerH);
      pdf.setTextColor(10, 10, 12);
      pdf.setFontSize(10);
      pdf.text(`ASPICE 4.0 · ${displayProc.id} ${displayProc.name}`, margin, 10);
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 100, 110);
      pdf.text(new Date().toLocaleString("ko-KR"), pageWidth - margin, 10, { align: "right" });

      const positionY = headerH + 4;
      const pxPerMm = canvas.width / scaledImgW;

      if (imgH + positionY + margin <= pageHeight) {
        pdf.addImage(imgData, "PNG", imgX, positionY, scaledImgW, imgH);
      } else {
        const firstSliceMm = pageHeight - positionY - margin;
        const otherSliceMm = pageHeight - headerH - 4 - margin;
        const drawSlice = (yMmTop, sliceMm, sliceCanvasYpx, sliceHeightPx) => {
          const tmp = document.createElement("canvas");
          tmp.width = canvas.width;
          tmp.height = sliceHeightPx;
          const ctx = tmp.getContext("2d");
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, tmp.width, tmp.height);
          ctx.drawImage(canvas, 0, sliceCanvasYpx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
          pdf.addImage(tmp.toDataURL("image/png"), "PNG", imgX, yMmTop, scaledImgW, sliceMm);
        };
        const firstSlicePx = Math.min(canvas.height, Math.floor(firstSliceMm * pxPerMm));
        drawSlice(positionY, firstSlicePx / pxPerMm, 0, firstSlicePx);
        let sliceY = firstSlicePx;
        let remainingH = canvas.height - sliceY;
        while (remainingH > 0) {
          pdf.addPage();
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
          pdf.setFillColor(248, 248, 250);
          pdf.rect(0, 0, pageWidth, headerH, "F");
          pdf.setDrawColor(180, 180, 188);
          pdf.setLineWidth(0.3);
          pdf.line(0, headerH, pageWidth, headerH);
          pdf.setTextColor(10, 10, 12);
          pdf.setFontSize(10);
          pdf.text(`ASPICE 4.0 · ${displayProc.id} ${displayProc.name} (cont.)`, margin, 10);
          const slicePx = Math.min(remainingH, Math.floor(otherSliceMm * pxPerMm));
          drawSlice(positionY, slicePx / pxPerMm, sliceY, slicePx);
          sliceY += slicePx;
          remainingH -= slicePx;
        }
      }

      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 130);
        pdf.text(
          `Automotive SPICE® VDA QMC · Generated by ASPICE Workbench  ·  ${i}/${pageCount}`,
          pageWidth / 2, pageHeight - 4, { align: "center" }
        );
      }
      pdf.save(`ASPICE_${displayProc.id}_report_${Date.now()}.pdf`);
    } catch (e) {
      setError(`PDF 생성 실패 — ${e.message}`);
    } finally {
      setExporting(false);
    }
  };

'@

# 함수 시작/끝 마커로 교체
$startMarker = "  const downloadPdf = async () => {"
$endMarker   = "  const viewingHistory"

$si = $txt.IndexOf($startMarker)
$ei = $txt.IndexOf($endMarker)

if ($si -lt 0) { Write-Host "오류: downloadPdf 시작을 찾을 수 없습니다" -ForegroundColor Red; exit 1 }
if ($ei -lt 0) { Write-Host "오류: viewingHistory 마커를 찾을 수 없습니다" -ForegroundColor Red; exit 1 }
if ($si -ge $ei) { Write-Host "오류: 마커 순서가 잘못되었습니다" -ForegroundColor Red; exit 1 }

# 기존 파일 백업
$backup = $f + ".bak_" + (Get-Date -Format "HHmmss")
[System.IO.File]::WriteAllText($backup, $txt, [System.Text.Encoding]::UTF8)
Write-Host "백업: $backup" -ForegroundColor Cyan

# 교체
$result = $txt.Substring(0, $si) + $newFunc + $txt.Substring($ei)
[System.IO.File]::WriteAllText($f, $result, [System.Text.Encoding]::UTF8)
Write-Host "완료! npm run dev 를 실행하세요." -ForegroundColor Green
