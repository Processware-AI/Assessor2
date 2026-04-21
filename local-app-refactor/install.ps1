# ASPICE Workbench — 리팩토링 적용 스크립트
# 실행 방법: PowerShell에서 이 파일이 있는 폴더로 이동 후 .\install.ps1

$ErrorActionPreference = "Stop"
$target = "C:\Users\LG\aspice-app\src"
$base   = "https://raw.githubusercontent.com/processware-ai/assessor2/claude/myproject2-work-LnHlt/local-app-refactor/src"

$files = @(
  "App.jsx",
  "theme.js",
  "data/aspice.js",
  "data/processData.js",
  "data/ratingMeta.js",
  "utils/fileReader.js",
  "utils/detectProcess.js",
  "utils/exportTxt.js",
  "utils/exportPdf.js",
  "hooks/useHistory.js",
  "components/Stat.jsx",
  "components/ProcessSidebar.jsx",
  "components/ProcessInfo.jsx",
  "components/FileImportPanel.jsx",
  "components/HistoryPanel.jsx",
  "components/ReportPanel.jsx",
  "components/ConfirmModal.jsx"
)

# 기존 App.jsx 백업
$backup = "$target\App.jsx.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item "$target\App.jsx" $backup
Write-Host "백업 완료: $backup" -ForegroundColor Cyan

# 각 파일 다운로드 및 저장
foreach ($file in $files) {
  $dest = "$target\$($file.Replace('/', '\'))"
  $dir  = Split-Path $dest -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

  try {
    $content = (Invoke-WebRequest "$base/$file" -UseBasicParsing).Content
    [System.IO.File]::WriteAllText($dest, $content, [System.Text.Encoding]::UTF8)
    Write-Host "OK  $file" -ForegroundColor Green
  } catch {
    Write-Host "실패 $file — $_" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "완료! 이제 서버를 재시작하세요:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
