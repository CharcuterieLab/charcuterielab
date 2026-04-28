$Python = "C:\Users\thill\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$Script = Join-Path $PSScriptRoot "generate_content_images.py"

& $Python $Script @args
