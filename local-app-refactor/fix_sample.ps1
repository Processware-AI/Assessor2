# Remove addEntry call from loadSample (samples must not appear in history)
# Run: powershell -ExecutionPolicy Bypass -File fix_sample.ps1

$f = "C:\Users\LG\aspice-app\src\App.jsx"
$txt = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

$oldBlock = @'
    setResults(sampleResults);
    setFileName("sample_SRS_v2.3.pdf");
    setFileSize(2458112);
    setError(""); setPhase(""); setSelectedHistoryId(null);
    addEntry({
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      processId: proc.id, processName: proc.name,
      fileName: "sample_SRS_v2.3.pdf", fileSize: 2458112,
      results: sampleResults, isSample: true,
    });
  };
'@

$newBlock = @'
    setResults(sampleResults);
    setFileName("sample_SRS_v2.3.pdf");
    setFileSize(2458112);
    setError(""); setPhase(""); setSelectedHistoryId(null);
    // Sample results are for preview only - not saved to history
  };
'@

if (!$txt.Contains($oldBlock)) {
  Write-Host "ERROR: Target block not found. The file may already be patched or have different content." -ForegroundColor Red
  exit 1
}

$backup = $f + ".bak_sample_" + (Get-Date -Format "HHmmss")
[System.IO.File]::WriteAllText($backup, $txt, [System.Text.Encoding]::UTF8)
Write-Host "Backup: $backup" -ForegroundColor Cyan

$result = $txt.Replace($oldBlock, $newBlock)
[System.IO.File]::WriteAllText($f, $result, [System.Text.Encoding]::UTF8)
Write-Host "Done! Sample will no longer appear in history." -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor White
