param(
    [switch]$SmokeTest
)

$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PinterestScript = Join-Path $ScriptRoot "run_pinterest_buffer_planner.ps1"
$InstagramScript = Join-Path $ScriptRoot "run_instagram_buffer_planner.ps1"
$FacebookScript = Join-Path $ScriptRoot "run_facebook_buffer_planner.ps1"

if (-not (Test-Path -LiteralPath $PinterestScript)) {
    throw "Pinterest planner script not found: $PinterestScript"
}
if (-not (Test-Path -LiteralPath $InstagramScript)) {
    throw "Instagram planner script not found: $InstagramScript"
}
if (-not (Test-Path -LiteralPath $FacebookScript)) {
    throw "Facebook planner script not found: $FacebookScript"
}

if ($SmokeTest) {
    Write-Host "Charcuterie Lab Social Scheduler smoke test passed."
    exit 0
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object System.Windows.Forms.Form
$form.Text = "Charcuterie Lab Social Scheduler"
$form.StartPosition = "CenterScreen"
$form.Size = New-Object System.Drawing.Size(430, 310)
$form.MinimumSize = New-Object System.Drawing.Size(430, 310)
$form.BackColor = [System.Drawing.Color]::FromArgb(255, 247, 236)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

$title = New-Object System.Windows.Forms.Label
$title.Text = "Charcuterie Lab Social Scheduler"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::FromArgb(20, 61, 43)
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(24, 22)
$form.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Choose a channel to preview and schedule queued posts."
$subtitle.ForeColor = [System.Drawing.Color]::FromArgb(70, 58, 45)
$subtitle.AutoSize = $true
$subtitle.Location = New-Object System.Drawing.Point(27, 58)
$form.Controls.Add($subtitle)

function New-Button($text, $top) {
    $button = New-Object System.Windows.Forms.Button
    $button.Text = $text
    $button.Size = New-Object System.Drawing.Size(360, 42)
    $button.Location = New-Object System.Drawing.Point(28, $top)
    $button.FlatStyle = "Flat"
    $button.BackColor = [System.Drawing.Color]::FromArgb(20, 61, 43)
    $button.ForeColor = [System.Drawing.Color]::White
    $button.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    return $button
}

function Start-Planner($PlannerScript) {
    Start-Process powershell.exe -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-NoExit",
        "-File", "`"$PlannerScript`""
    ) -WorkingDirectory $ScriptRoot
}

$pinterestButton = New-Button "Pinterest -> Buffer Scheduler" 98
$pinterestButton.Add_Click({
    Start-Planner $PinterestScript
})
$form.Controls.Add($pinterestButton)

$instagramButton = New-Button "Instagram -> Buffer Scheduler" 150
$instagramButton.Add_Click({
    Start-Planner $InstagramScript
})
$form.Controls.Add($instagramButton)

$facebookButton = New-Button "Facebook -> Buffer Scheduler" 202
$facebookButton.Add_Click({
    Start-Planner $FacebookScript
})
$form.Controls.Add($facebookButton)

$closeButton = New-Object System.Windows.Forms.Button
$closeButton.Text = "Close"
$closeButton.Size = New-Object System.Drawing.Size(90, 30)
$closeButton.Location = New-Object System.Drawing.Point(298, 244)
$closeButton.Add_Click({ $form.Close() })
$form.Controls.Add($closeButton)

[void]$form.ShowDialog()
