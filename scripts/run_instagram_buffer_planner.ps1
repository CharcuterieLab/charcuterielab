$Python = "C:\Users\thill\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$Script = Join-Path $PSScriptRoot "publish_buffer_queue.py"

Write-Host ""
Write-Host "Charcuterie Lab Instagram -> Buffer Planner"
Write-Host "Queue folder: C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAAInstagramPosts"
Write-Host ""

Write-Host "Previewing scheduled posts..."
& $Python $Script --platform instagram --schedule-all --dry-run @args

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
$answer = Read-Host "Push these files into Buffer now? Type YES to continue"
if ($answer -ne "YES") {
    Write-Host "Canceled. Nothing was sent to Buffer."
    exit 0
}

& $Python $Script --platform instagram --schedule-all @args
