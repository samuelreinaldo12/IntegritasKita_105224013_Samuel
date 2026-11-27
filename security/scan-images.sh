#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -ne 2 ]]; then
  echo "Usage: bash security/scan-images.sh <image-before> <image-after>" >&2
  exit 2
fi

if ! command -v trivy >/dev/null 2>&1; then
  echo "Trivy is required to scan container images." >&2
  exit 1
fi

image_before="$1"
image_after="$2"
security_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

trivy image --scanners vuln --format table \
  --output "$security_directory/image-scan-before.txt" "$image_before"
trivy image --scanners vuln --format table \
  --output "$security_directory/image-scan-after.txt" "$image_after"
trivy image --format cyclonedx \
  --output "$security_directory/sbom.cdx.json" "$image_after"
trivy image --scanners vuln --severity CRITICAL --exit-code 1 "$image_after"
