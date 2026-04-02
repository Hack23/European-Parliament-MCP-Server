---
name: github-actions-workflows
description: Secure CI/CD workflows with GitHub Actions for TypeScript 6.0.2 / Node.js 25 MCP server — 11 pipelines, SLSA Level 3, SBOM, OpenSSF Scorecard
license: Apache-2.0
---

# GitHub Actions Workflows Skill

## Purpose

Create and maintain secure, efficient CI/CD pipelines using GitHub Actions for this TypeScript 6.0.2 / Node.js 25 MCP server project with 11 automated workflows.

## When to Use

- ✅ Setting up or modifying CI/CD pipelines for TypeScript MCP projects
- ✅ Automating security scans (CodeQL, dependency review, SLSA, SBOM)
- ✅ Implementing npm package publishing with attestation
- ✅ Configuring test/coverage reporting and quality gates
- ✅ Understanding the 8-stage pipeline architecture

## Current Pipeline Architecture (11 Workflows)

| Stage | Workflow | Trigger | Purpose |
|-------|----------|---------|---------|
| 1. Code Validation | `dependency-review.yml`, `labeler.yml` | PR | Dependency audit, auto-labeling |
| 2. Build & Test | `test-and-report.yml` | Push, PR | Lint, build, test, coverage (80%+) |
| 3. Security Analysis | `codeql.yml` | Push, PR, Weekly | CodeQL SAST scanning |
| 4. Integration Testing | `integration-tests.yml` | Push, PR, Daily | E2E tests against EP API |
| 5. Release & Publish | `release.yml` | Tag `v*`, Manual | npm publish with attestation |
| 6. Supply Chain | `sbom-generation.yml`, `slsa-provenance.yml` | Release | CycloneDX/SPDX SBOM, SLSA Level 3 |
| 7. Continuous Monitoring | `scorecard.yml` | Push, Weekly | OpenSSF Scorecard |
| 8. Repository Management | `setup-labels.yml`, `copilot-setup-steps.yml` | Manual, Push | Labels, Copilot environment |

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
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
        with:
          node-version: '25'
          cache: 'npm'
      - uses: step-security/harden-runner@c6295a65d1254861815972266d5933fd6e532bdf # v2.11.1
        with:
          egress-policy: audit
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test:coverage
```

## Security Best Practices (Enforced)

- ✅ **Pin action versions with SHA hashes** — not tags (supply chain integrity)
- ✅ **Use `npm ci`** — reproducible installs from lockfile
- ✅ **Minimize GITHUB_TOKEN permissions** — per-job `permissions` blocks
- ✅ **step-security/harden-runner** — egress auditing on all workflows
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
    - uses: actions/attest-build-provenance@v2
```

## Quality Gates

- **Lint:** Zero ESLint errors (TypeScript strict mode)
- **Type check:** `tsc --noEmit` passes
- **Tests:** 80%+ coverage, 1130+ unit tests, 23 E2E tests
- **Security:** No critical/high CodeQL alerts
- **Dependencies:** No known high/critical vulnerabilities
- **Unused code:** `npx knip` check passes

## ISMS Policy References

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — CI/CD security requirements
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Supply chain security, SBOM, SLSA
