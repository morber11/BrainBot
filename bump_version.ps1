[CmdletBinding()]
param(
    [switch]$Major,
    [switch]$Minor,
    [switch]$Patch,
    [int]$increment = 1
)

$pkgPath = Join-Path $PSScriptRoot 'package.json'
if (-not (Test-Path $pkgPath)) {
    Write-Error "package.json not found at $pkgPath"
    exit 1
}

$content = Get-Content $pkgPath -Raw
# grab current version using regex so we only touch that line
$versionRegex = '"version"\s*:\s*"([0-9]+\.[0-9]+\.[0-9]+)"'
if ($content -notmatch $versionRegex) {
    Write-Error "Could not locate version field in package.json"
    exit 1
}
$currentVersion = $Matches[1]

function bumpVersion($version, $type, $inc) {
    $parts = $version -split '\.'
    if ($parts.Length -lt 3) {
        throw "Version '$version' is not in semver format"
    }
    switch ($type) {
        'major' {
            $parts[0] = [int]$parts[0] + $inc
            $parts[1] = 0
            $parts[2] = 0
        }
        'minor' {
            $parts[1] = [int]$parts[1] + $inc
            $parts[2] = 0
        }
        'patch' {
            $parts[2] = [int]$parts[2] + $inc
        }
    }
    return ($parts -join '.')
}

if ($Major) { $type = 'major' }
elseif ($Minor) { $type = 'minor' }
elseif ($Patch) { $type = 'patch' }
else { $type = 'patch' }

try {
    $newVersion = bumpVersion $currentVersion $type $increment
    Write-Host "Updating version $currentVersion -> $newVersion" -ForegroundColor Cyan
} catch {
    Write-Error "Version bump failed: $_"
    exit 1
}

# update only the version line
try {
    $replacement = "`"version`": `"$newVersion`""
    $newContent = $content -replace $versionRegex, $replacement
} catch {
    Write-Error "Failed to construct new content: $_"
    exit 1
}

# write result
Set-Content -Path $pkgPath -Value $newContent -Encoding UTF8

Write-Host "package.json updated" -ForegroundColor Green
