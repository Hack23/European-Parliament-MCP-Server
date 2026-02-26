# Software Bill of Materials (SBOM)

## SBOM Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Created** | 2026-02-26 |
| **Creator** | Hack23 AB / Syft (automated via GitHub Actions) |
| **Format** | SPDX 2.3+ (primary), CycloneDX JSON (secondary) |
| **Scope** | All runtime and development dependencies |
| **Vulnerability Status** | ✅ 0 vulnerabilities (npm audit 2026-02-26) |

## Overview

This repository generates and publishes Software Bill of Materials (SBOM) in SPDX 2.3+ format for every release, complying with Hack23 Open Source Policy requirements.

## Runtime Dependencies

| Package | Version | License | Description |
|---------|---------|---------|-------------|
| `@modelcontextprotocol/sdk` | 1.27.1 | MIT | Model Context Protocol TypeScript SDK |
| `lru-cache` | 11.2.6 | ISC | A cache object that deletes the least-recently-used items |
| `undici` | 7.22.0 | MIT | HTTP/1.1 client, written from scratch for Node.js |
| `zod` | 4.3.6 | MIT | TypeScript-first schema validation with static type inference |

## Development Dependencies

| Package | Version | License | Description |
|---------|---------|---------|-------------|
| `@types/node` | 25.3.1 | MIT | TypeScript definitions for Node.js |
| `@typescript-eslint/eslint-plugin` | 8.56.1 | MIT | TypeScript ESLint plugin |
| `@typescript-eslint/parser` | 8.56.1 | MIT | TypeScript parser for ESLint |
| `@vitest/coverage-v8` | 4.0.18 | MIT | V8 coverage provider for Vitest |
| `@vitest/ui` | 4.0.18 | MIT | UI interface for Vitest |
| `eslint` | 10.0.2 | MIT | JavaScript and TypeScript linter |
| `globals` | 17.3.0 | ISC | Global identifiers from different JavaScript environments |
| `knip` | 5.85.0 | ISC | Find unused files, exports, and dependencies |
| `license-compliance` | 3.0.1 | MIT | Verify license compliance of dependencies |
| `prettier` | 3.8.1 | MIT | Opinionated code formatter |
| `tsx` | 4.21.0 | MIT | TypeScript Execute — Node.js enhanced with esbuild to run TypeScript & ESM files |
| `typedoc` | 0.28.17 | Apache-2.0 | Documentation generator for TypeScript |
| `typedoc-plugin-markdown` | 4.10.0 | MIT | A plugin that enables TypeDoc to output documentation as Markdown |
| `typedoc-plugin-mdn-links` | 5.1.1 | MIT | TypeDoc plugin to add links to MDN for built-in JS/TS types |
| `typedoc-plugin-zod` | 1.4.3 | MIT | TypeDoc plugin for Zod schema documentation |
| `typescript` | 5.9.3 | Apache-2.0 | TypeScript is a language for application-scale JavaScript |
| `typescript-eslint` | 8.56.1 | MIT | Tooling which enables you to use TypeScript with ESLint |
| `vitest` | 4.0.18 | MIT | A Vite-native test framework |

## License Summary

| License | Count | Packages |
|---------|-------|---------|
| MIT | 16 | @modelcontextprotocol/sdk, undici, zod, @types/node, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, @vitest/coverage-v8, @vitest/ui, eslint, license-compliance, prettier, tsx, typedoc-plugin-markdown, typedoc-plugin-mdn-links, typedoc-plugin-zod, typescript-eslint, vitest |
| ISC | 3 | lru-cache, globals, knip |
| Apache-2.0 | 2 | typedoc, typescript |

All licenses are **permissive** and compatible with Hack23 Open Source Policy.

## SBOM Formats

- **SPDX JSON** - Primary format, attached to every release
- **CycloneDX JSON** - Secondary format for tool compatibility

## Quality Standards

- **Minimum SBOM Quality Score**: 7.0/10 (validated with SBOMQS)
- **Standards Compliance**: NTIA Minimum Elements, BSI v1.1/v2.0
- **Vulnerability Scanning**: Grype scans for critical/high vulnerabilities

## Accessing SBOM Artifacts

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

### Generate Locally
```bash
# Install Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Generate SBOM from local checkout
syft dir:. -o spdx-json=sbom.spdx.json
syft dir:. -o cyclonedx-json=sbom.cyclonedx.json
```

## SBOM Contents

The SBOM includes:
- **Direct dependencies** - All npm packages listed in package.json
- **Transitive dependencies** - All nested dependencies
- **Package metadata** - Names, versions, licenses, checksums
- **Relationship graph** - Dependency relationships
- **Vulnerability data** - Known security issues

## Supply Chain Security

| Control | Status | Details |
|---------|--------|---------|
| npm audit | ✅ 0 vulnerabilities | Last checked 2026-02-26 |
| License compliance | ✅ Passing | All MIT/ISC/Apache-2.0 |
| SLSA Level 3 | ✅ Achieved | Cryptographic provenance on all releases |
| Sigstore signatures | ✅ Enabled | npm package and GitHub release artifacts |
| Dependabot | ✅ Enabled | Automated dependency update PRs |
| SHA-pinned CI actions | ✅ Enforced | All GitHub Actions pinned to commit SHA |

## Tools Used

- **Syft** - SBOM generation (Anchore)
- **SBOMQS** - Quality validation (Interlynk)
- **Grype** - Vulnerability scanning (Anchore)

## ISMS Policy Compliance

- [Open Source Policy - SBOM Requirements](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Secure Development Policy - Supply Chain Security](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
