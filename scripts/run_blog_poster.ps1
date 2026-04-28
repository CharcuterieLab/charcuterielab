$env:CHARCUTERIE_NO_GIT = "1"
$Python = "C:\Users\thill\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$Script = Join-Path $PSScriptRoot "publish_blog_queue.py"

Write-Host ""
Write-Host "Charcuterie Lab Blog Poster"
Write-Host "Queue folder: C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAABlogPosts"
Write-Host ""

& $Python $Script

Write-Host ""
Read-Host "Press Enter to close"
