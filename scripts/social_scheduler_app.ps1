param(
    [switch]$SmokeTest
)

$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PinterestScript = Join-Path $ScriptRoot "run_pinterest_buffer_planner.ps1"

if (-not (Test-Path -LiteralPath $PinterestScript)) {
    throw "Pinterest planner script not found: $PinterestScript"
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

function New-Button($text, $top, $enabled = $true) {
    $button = New-Object System.Windows.Forms.Button
    $button.Text = $text
    $button.Size = New-Object System.Drawing.Size(360, 42)
    $button.Location = New-Object System.Drawing.Point(28, $top)
    $button.Enabled = $enabled
    $button.FlatStyle = "Flat"
    $button.BackColor = if ($enabled) {
        [System.Drawing.Color]::FromArgb(20, 61, 43)
    } else {
        [System.Drawing.Color]::FromArgb(210, 204, 194)
    }
    $button.ForeColor = if ($enabled) {
        [System.Drawing.Color]::White
    } else {
        [System.Drawing.Color]::FromArgb(90, 84, 78)
    }
    $button.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    return $button
}

$pinterestButton = New-Button "Pinterest -> Buffer Scheduler" 98 $true
$pinterestButton.Add_Click({
    Start-Process powershell.exe -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-NoExit",
        "-File", "`"$PinterestScript`""
    ) -WorkingDirectory $ScriptRoot
})
$form.Controls.Add($pinterestButton)

$instagramButton = New-Button "Instagram Scheduler - coming soon" 150 $false
$form.Controls.Add($instagramButton)

$facebookButton = New-Button "Facebook Scheduler - coming soon" 202 $false
$form.Controls.Add($facebookButton)

$closeButton = New-Object System.Windows.Forms.Button
$closeButton.Text = "Close"
$closeButton.Size = New-Object System.Drawing.Size(90, 30)
$closeButton.Location = New-Object System.Drawing.Point(298, 244)
$closeButton.Add_Click({ $form.Close() })
$form.Controls.Add($closeButton)

[void]$form.ShowDialog()
