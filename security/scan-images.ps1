param(
  [Parameter(Mandatory = $true)]
  [string] $ImageBefore,
  [Parameter(Mandatory = $true)]
  [string] $ImageAfter
)

$ErrorActionPreference = 'Stop'
$trivy = Get-Command trivy -ErrorAction SilentlyContinue
if (-not $trivy) {
  throw 'Trivy is required. Install it on the scanning host and rerun this script.'
}

$securityDirectory = $PSScriptRoot

& $trivy.Source image --scanners vuln --format table --output (Join-Path $securityDirectory 'image-scan-before.txt') $ImageBefore
if ($LASTEXITCODE -ne 0) {
  throw "Trivy failed to scan the before image ($ImageBefore)."
}

& $trivy.Source image --scanners vuln --format table --output (Join-Path $securityDirectory 'image-scan-after.txt') $ImageAfter
if ($LASTEXITCODE -ne 0) {
  throw "Trivy failed to scan the after image ($ImageAfter)."
}

& $trivy.Source image --format cyclonedx --output (Join-Path $securityDirectory 'sbom.cdx.json') $ImageAfter
if ($LASTEXITCODE -ne 0) {
  throw "Trivy failed to create the CycloneDX SBOM for $ImageAfter."
}

& $trivy.Source image --scanners vuln --severity CRITICAL --exit-code 1 $ImageAfter
if ($LASTEXITCODE -ne 0) {
  throw "The after image has CRITICAL vulnerabilities or the scan failed ($ImageAfter)."
}
