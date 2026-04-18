---
name: vulnerability-management
description: Systematic vulnerability lifecycle management with SLAs aligned with OWASP, NIST, and CIS Controls for Node.js/TypeScript
license: Apache-2.0
---

# Vulnerability Management Skill

## Purpose

Systematic procedures for vulnerability discovery, remediation, and tracking in TypeScript/Node.js MCP server projects.

## When to Use

- ✅ Analyzing Dependabot alerts
- ✅ Responding to GitHub Security Advisories
- ✅ Triaging CodeQL findings
- ✅ Prioritizing vulnerability remediation
- ✅ Managing SLA compliance for fixes

## Severity Classification and SLAs

| Severity | CVSS Score | SLA | Escalation |
|----------|-----------|-----|------------|
| 🔴 Critical | 9.0-10.0 | 7 days | Immediate |
| 🟠 High | 7.0-8.9 | 30 days | Within 1 day |
| 🟡 Medium | 4.0-6.9 | 90 days | Weekly review |
| 🟢 Low | 0.1-3.9 | 180 days | Monthly review |

## Vulnerability Lifecycle

### 1. Discovery

```bash
# Automated detection
npm audit                    # npm advisory check
npx knip                     # unused dependency detection
# + GitHub Dependabot alerts
# + CodeQL security scanning
# + GitHub secret scanning
```

### 2. Assessment

- [ ] CVSS score from NVD or GitHub Advisory
- [ ] Is vulnerable code path reachable?
- [ ] What data is exposed?
- [ ] Is a fix available?

### 3. Remediation

```bash
# Create remediation branch
git checkout -b security/CVE-2024-XXXXX

# Update dependency
npm update affected-package
# or
npm install affected-package@patched-version

# Verify
npm audit
npm test
npm run build
```

### 4. Verification

- ✅ npm audit clean
- ✅ All tests pass
- ✅ CodeQL scan clean
- ✅ No regressions
- ✅ Documentation updated

## Compliance Mapping

| Framework | Controls |
|-----------|----------|
| ISO 27001:2022 | A.8.8 - Technical Vulnerability Management |
| NIST CSF 2.0 | DE.CM-8 - Vulnerability scans performed |
| CIS Controls v8 | Control 7 - Continuous Vulnerability Management |
| OWASP Top 10 | A06 - Vulnerable and Outdated Components |

## ISMS Policy References

**Core policies:**

- [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) — **Primary policy**: CVSS-based SLAs, lifecycle (discover → triage → fix → verify → close), responsible disclosure
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — CodeQL / SAST / DAST gates, pre-merge checks
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Supply-chain vulnerabilities, SBOM, dependency provenance
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Transparency of vulnerability posture

**Supporting policies:**

- [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) — Critical / exploited vulnerabilities invoke IR
- [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) — Remediation PRs follow standard review
- [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) — Breach notification if personal data exposure

### Remediation SLAs (CVSS-based)

| Severity | CVSS | Target Fix Window |
|----------|------|-------------------|
| Critical | 9.0–10.0 | 7 days |
| High | 7.0–8.9 | 30 days |
| Medium | 4.0–6.9 | 90 days |
| Low | 0.1–3.9 | 180 days |
