
# UTP CONTROL - Selective Project Backup
# Avoids locked folders and node_modules

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "C:\UTP\CONTROL\backups"
$ProjectDir = "C:\UTP\CONTROL"
$BackupName = "utp_control_src_$Timestamp.zip"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

Write-Host "Creating selective source backup..." -ForegroundColor Blue

$IncludePaths = @(
    "apps\api\src",
    "apps\api\prisma",
    "apps\api\package.json",
    "apps\web\src",
    "apps\web\package.json",
    "scripts",
    "docs",
    "package.json",
    "pnpm-workspace.yaml",
    "turbo.json"
)

$ItemsToZip = @()
foreach ($Path in $IncludePaths) {
    $FullPath = Join-Path $ProjectDir $Path
    if (Test-Path $FullPath) {
        $ItemsToZip += $FullPath
    }
}

Compress-Archive -Path $ItemsToZip -DestinationPath "$BackupDir\$BackupName" -Force

Write-Host "Backup completed: $BackupDir\$BackupName" -ForegroundColor Green
