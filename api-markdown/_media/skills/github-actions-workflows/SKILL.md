---
name: github-actions-workflows
description: Secure CI/CD workflows with GitHub Actions for TypeScript 6.0.2 / Node.js 25 MCP server — 12 pipelines, SLSA Level 3, SBOM, OpenSSF Scorecard
license: Apache-2.0
---

# GitHub Actions Workflows Skill

## Purpose

Create and maintain secure, efficient CI/CD pipelines using GitHub Actions for this TypeScript 6.0.2 / Node.js 25 MCP server project with 12 automated workflows.

## When to Use

- ✅ Setting up or modifying CI/CD pipelines for TypeScript MCP projects
- ✅ Automating security scans (CodeQL, dependency review, SLSA, SBOM)
- ✅ Implementing npm package publishing with attestation
- ✅ Configuring test/coverage reporting and quality gates
- ✅ Understanding the 8-stage pipeline architecture

## Current Pipeline Architecture (12 Workflows)

| Stage | Workflow | Trigger | Purpose |
|-------|----------|---------|---------|
| 1. Code Validation | `dependency-review.yml`, `labeler.yml` | PR | Dependency audit, auto-labeling |
| 2. Build & Test | `test-and-report.yml` | Push, PR | Lint, build, test, coverage (80%+) |
| 3. Security Analysis | `codeql.yml` | Push, PR, Weekly | CodeQL SAST scanning |
| 4. Integration Testing | `integration-tests.yml` | Push, PR, Daily | E2E tests against EP API |
| 5. Release & Publish | `release.yml` | Tag `v*`, Manual | npm publish with attestation |
| 6. Supply Chain | `sbom-generation.yml`, `slsa-provenance.yml` | Push (main), Tag `v*`, Release publish, Manual | CycloneDX/SPDX SBOM, SLSA Level 3 |
| 7. Continuous Monitoring | `scorecard.yml` | Push, Weekly | OpenSSF Scorecard |
| 8. Repository Management | `setup-labels.yml`, `copilot-setup-steps.yml`, `refresh-stats.yml` | Manual, Push, Schedule | Labels, Copilot environment, Stats refresh |

## CI/CD Pattern (Node.js 25 + TypeScript 6.0.2)

```yaml
name: Test and Report
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  checks: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: step-security/harden-runner@fe104658747b27e96e4f7e80cd0a94068e53901d # v2.16.1
        with:
          egress-policy: audit
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f # v6.3.0
        with:
          node-version: '25'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test:coverage
```

## Security Best Practices (Enforced)

- ✅ **Pin action versions with SHA hashes** — not tags (supply chain integrity)
- ✅ **Prefer `npm ci` in CI workflows** — reproducible installs from lockfile; some jobs may use `npm install` where needed
- ✅ **Minimize GITHUB_TOKEN permissions** — per-job `permissions` blocks
- ✅ **step-security/harden-runner** — egress auditing on most workflows
- ✅ **Dependency review** — block PRs introducing known vulnerabilities
- ✅ **CodeQL weekly + on-push** — continuous SAST scanning
- ✅ **SLSA Level 3 provenance** — verifiable build attestation
- ✅ **CycloneDX + SPDX SBOM** — software bill of materials on release
- ✅ **OpenSSF Scorecard** — continuous security posture monitoring
- ✅ **Dependabot** — automated dependency updates

## Test Reporting

```yaml
- name: Run tests with coverage
  run: npm run test:coverage
- name: Upload coverage
  uses: codecov/codecov-action@e28ff129e5465c2c0dcc6f003fc735cb6ae0c673 # v4.5.0
  with:
    files: ./coverage/lcov.info
```

## Release Pipeline with Attestation

```yaml
release:
  if: startsWith(github.ref, 'refs/tags/v')
  permissions:
    contents: write
    id-token: write
    attestations: write
  steps:
    - run: npm ci && npm run build
    - run: npm publish --provenance --access public
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    - uses: actions/attest-build-provenance@a2bbfa25375fe432b6a289bc6b6cd05ecd0c4c32 # v4.1.0
```

## Quality Gates

- **Lint:** Zero ESLint errors (TypeScript strict mode)
- **Type check:** `tsc --noEmit` passes
- **Tests:** 80%+ coverage, 1130+ unit tests, 71 E2E test cases across 4 spec files
- **Security:** No critical/high CodeQL alerts
- **Dependencies:** No known high/critical vulnerabilities
- **Unused code:** `npx knip` check passes

## ISMS Policy References

**Core policies:**

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — CI/CD security requirements, CodeQL, SAST/DAST, SBOM, SLSA Level 3, signed releases
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Supply-chain security, dependency pinning, OSSF Scorecard, SLSA provenance
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Pipeline as critical security control

**Supporting policies:**

- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) — Least-privilege `GITHUB_TOKEN`, fine-grained `permissions:` blocks
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md) — Signed commits / keyless Sigstore / cosign
- [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) — Protected branches, required reviews, status checks
- [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) — Dependabot, CodeQL scheduling
- [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) — Workflow-failure / compromise response
