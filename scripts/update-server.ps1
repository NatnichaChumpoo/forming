param(
  [string]$FrontendPort,
  [string]$BackendPort,
  [string]$MysqlHostPort,
  [string]$PublicHost = '10.255.255.173',
  [string]$CorsOrigin,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
}

function Set-EnvValue {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Key,
    [Parameter(Mandatory=$true)][string]$Value
  )

  $lines = @()
  if (Test-Path -LiteralPath $Path) {
    $lines = @(Get-Content -LiteralPath $Path)
  }

  $pattern = "^$([regex]::Escape($Key))="
  $replacement = "$Key=$Value"
  $found = $false

  $next = foreach ($line in $lines) {
    if ($line -match $pattern) {
      $found = $true
      $replacement
    } else {
      $line
    }
  }

  if (-not $found) {
    $next += $replacement
  }

  Set-Content -LiteralPath $Path -Value $next
}

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $repoRoot

Write-Step "Preparing local working tree"
$nodeModules = Join-Path $repoRoot 'backend\node_modules'
if (Test-Path -LiteralPath $nodeModules) {
  Remove-Item -LiteralPath $nodeModules -Recurse -Force
  Write-Host "Removed backend\node_modules"
}

$composeChanged = $false
git diff --quiet -- docker-compose.yml
if ($LASTEXITCODE -ne 0) {
  $composeChanged = $true
}

if ($composeChanged) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backup = "docker-compose.yml.local-backup-$stamp"
  Copy-Item -LiteralPath 'docker-compose.yml' -Destination $backup
  git restore docker-compose.yml
  Write-Host "Backed up local docker-compose.yml to $backup and restored tracked version"
}

Write-Step "Pulling latest main"
git pull --ff-only

Write-Step "Preparing local .env"
if (-not (Test-Path -LiteralPath '.env')) {
  Copy-Item -LiteralPath '.env.example' -Destination '.env'
  Write-Host "Created .env from .env.example"
}

if ($FrontendPort) {
  Set-EnvValue -Path '.env' -Key 'FRONTEND_PORT' -Value $FrontendPort
  if (-not $CorsOrigin) {
    $CorsOrigin = "http://$PublicHost`:$FrontendPort,http://$PublicHost,http://localhost,http://localhost:5173"
  }
}
if ($BackendPort) {
  Set-EnvValue -Path '.env' -Key 'BACKEND_PORT' -Value $BackendPort
}
if ($MysqlHostPort) {
  Set-EnvValue -Path '.env' -Key 'MYSQL_HOST_PORT' -Value $MysqlHostPort
}
if ($CorsOrigin) {
  Set-EnvValue -Path '.env' -Key 'CORS_ORIGIN' -Value $CorsOrigin
}

Write-Step "Validating compose services"
docker compose config --services

if (-not $SkipBuild) {
  Write-Step "Building images"
  docker compose build --no-cache
}

Write-Step "Starting containers"
docker compose up -d

Write-Step "Container status"
docker compose ps
