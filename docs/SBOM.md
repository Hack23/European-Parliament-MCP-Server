# Software Bill of Materials (SBOM)

## Overview

This repository generates and publishes Software Bill of Materials (SBOM) in SPDX 2.3+ format for every release, complying with Hack23 Open Source Policy requirements.

## SBOM Formats

- **SPDX JSON** - Primary format, attached to every release
- **CycloneDX JSON** - Secondary format for tool compatibility

## Quality Standards

- **Minimum SBOM Quality Score**: 7.0/10 (validated with SBOMQS)
- **Standards Compliance**: NTIA Minimum Elements, BSI v1.1/v2.0
- **Vulnerability Scanning**: Grype scans for critical/high vulnerabilities

## Accessing SBOM

### Latest Release
Download SBOM from the [latest release](https://github.com/Hack23/European-Parliament-MCP-Server/releases/latest):
- `sbom.spdx.json` - SPDX format
- `sbom.cyclonedx.json` - CycloneDX format
- `sbomqs-report.json` - Quality validation report

### Verification
Verify SBOM authenticity with SLSA attestations:
```bash
gh attestation verify sbom.spdx.json \
  --owner Hack23 \
  --repo European-Parliament-MCP-Server
```

## SBOM Contents

The SBOM includes:
- **Direct dependencies** - All npm packages listed in package.json
- **Transitive dependencies** - All nested dependencies
- **Package metadata** - Names, versions, licenses, checksums
- **Relationship graph** - Dependency relationships
- **Vulnerability data** - Known security issues

## Tools Used

- **Syft** - SBOM generation (Anchore)
- **SBOMQS** - Quality validation (Interlynk)
- **Grype** - Vulnerability scanning (Anchore)

## ISMS Policy Compliance

- [Open Source Policy - SBOM Requirements](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Secure Development Policy - Supply Chain Security](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
