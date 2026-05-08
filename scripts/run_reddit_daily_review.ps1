param(
    [switch]$SmokeTest
)

$ErrorActionPreference = "Stop"

$Python = "C:\Users\thill\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$RedditDir = "C:\Users\thill\Documents\Codex\2026-04-29\files-mentioned-by-the-user-charcuterie"
$RedditScript = Join-Path $RedditDir "reddit_daily_review.py"

if (-not (Test-Path -LiteralPath $Python)) {
    throw "Python was not found: $Python"
}
if (-not (Test-Path -LiteralPath $RedditScript)) {
    throw "Reddit review script was not found: $RedditScript"
}

if ($SmokeTest) {
    Write-Host "Reddit daily review launcher smoke test passed."
    exit 0
}

Write-Host "Running Charcuterie Lab Reddit report for the past 24 hours..."
Write-Host "Reports will be saved in: $RedditDir\reddit_reviews"
Write-Host ""

Push-Location $RedditDir
try {
    & $Python $RedditScript --max-age-hours 24 --top 40
}
finally {
    Pop-Location
}

Write-Host ""
Read-Host "Press Enter to close"
