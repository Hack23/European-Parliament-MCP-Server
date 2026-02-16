---
name: open-source-governance
description: Open source governance, security badges, license compliance, SBOM, supply chain security, and vulnerability management per Hack23 Open Source Policy
license: MIT
---

# Open Source Governance Skill

## Context

This skill applies when:
- Setting up new open source repositories
- Implementing security badges (OpenSSF Scorecard, SLSA, CII Best Practices)
- Managing license compliance and dependencies
- Generating and validating SBOMs (Software Bill of Materials)
- Handling vulnerability disclosure and remediation
- Creating governance artifacts (SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md)
- Monitoring supply chain security
- Managing exceptions to open source policies

This skill enforces **[Hack23 Open Source Policy v2.3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)** requirements for transparent, secure open source development.

## Rules

### 1. Security Posture Evidence (Policy Section 1)

1. **OpenSSF Scorecard Badge**: All repos MUST display OpenSSF Scorecard ≥7.0
2. **CII Best Practices**: Minimum "Passing" level badge required
3. **SLSA Level 3**: Build provenance and integrity attestation mandatory
4. **Quality Gate**: SonarCloud or equivalent showing "Passed" status
5. **FOSSA License Compliance**: License scanning badge required
6. **Public Metrics**: All security posture metrics publicly visible

### 2. License Compliance Framework (Policy Section 4)

7. **Approved Licenses Only**: Use MIT, Apache-2.0, BSD-3-Clause, ISC, PostgreSQL, Mozilla Public License 2.0
8. **Review Required**: CC0-1.0, LGPL-2.1, LGPL-3.0 need explicit approval
9. **Prohibited Licenses**: NEVER use GPL-2.0, GPL-3.0, AGPL-3.0, proprietary/closed-source
10. **Dependency Scanning**: Automated license checking on every PR
11. **REUSE Compliance**: Clear licensing for all files

### 3. Governance Artifacts (Policy Section 2)

12. **SECURITY.md**: Vulnerability disclosure process, supported versions, security features
13. **CONTRIBUTING.md**: Contribution guidelines, DCO sign-off requirements
14. **CODE_OF_CONDUCT.md**: Community standards and enforcement
15. **LICENSE.md**: Repository license (MIT or Apache-2.0)
16. **CODEOWNERS**: Maintainer assignments for security-critical paths

### 4. Supply Chain Security (Policy Section 3)

17. **SBOM Generation**: CycloneDX format, quality score ≥7.0/10
18. **Dependency Pinning**: All dependencies pinned to specific versions
19. **Dependabot**: Enabled for automated security updates
20. **npm audit**: Zero known vulnerabilities before release
21. **Transitive Dependencies**: Review and approve all transitive deps

### 5. Vulnerability Management (Policy Section 3)

22. **Private Disclosure**: Security issues MUST be reported to security@hack23.com
23. **Response SLA**: Initial response within 48 hours
24. **Remediation SLA**: Critical (1 day), High (7 days), Medium (30 days), Low (90 days)
25. **Coordinated Disclosure**: 90-day disclosure window after fix
26. **CVE Assignment**: Request CVEs for significant vulnerabilities

## Examples

### ✅ Good Pattern: Complete Security Badge Integration

```markdown
# Repository Name

<p align="center">
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/Hack23/European-Parliament-MCP-Server">
    <img src="https://api.securityscorecards.dev/projects/github.com/Hack23/European-Parliament-MCP-Server/badge" alt="OpenSSF Scorecard"/>
  </a>
  <a href="https://bestpractices.coreinfrastructure.org/projects/XXXXX">
    <img src="https://bestpractices.coreinfrastructure.org/projects/XXXXX/badge" alt="CII Best Practices"/>
  </a>
  <a href="https://slsa.dev">
    <img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA 3"/>
  </a>
  <a href="https://sonarcloud.io/dashboard?id=Hack23_European-Parliament-MCP-Server">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Hack23_European-Parliament-MCP-Server&metric=alert_status" alt="Quality Gate"/>
  </a>
  <a href="https://app.fossa.com/projects/git%2Bgithub.com%2FHack23%2FEuropean-Parliament-MCP-Server">
    <img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2FHack23%2FEuropean-Parliament-MCP-Server.svg?type=shield" alt="FOSSA Status"/>
  </a>
</p>

**Security & Compliance:** All security practices align with [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) policies.
```

**Evidence**: [CIA Repository Badges](https://github.com/Hack23/cia)

### ✅ Good Pattern: SBOM Generation and Validation

```yaml
# .github/workflows/sbom.yml
name: Generate SBOM

on:
  release:
    types: [published]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate CycloneDX SBOM
        run: |
          npx @cyclonedx/cyclonedx-npm \
            --output-format JSON \
            --output-file sbom.json
      
      - name: Validate SBOM Quality
        run: |
          # Check SBOM has required components
          COMPONENT_COUNT=$(jq '.components | length' sbom.json)
          if [ "$COMPONENT_COUNT" -lt 1 ]; then
            echo "Error: SBOM has no components"
            exit 1
          fi
          
          # Validate all components have licenses
          UNLICENSED=$(jq '.components | map(select(.licenses == null or .licenses == [])) | length' sbom.json)
          if [ "$UNLICENSED" -gt 0 ]; then
            echo "Error: $UNLICENSED components missing licenses"
            exit 1
          fi
          
          echo "✅ SBOM quality validated"
      
      - name: Upload SBOM to Release
        uses: actions/upload-release-asset@v1
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ./sbom.json
          asset_name: sbom.json
          asset_content_type: application/json
```

**Evidence**: [Black Trigram SBOM Workflow](https://github.com/Hack23/blacktrigram/blob/main/.github/workflows/sbom.yml)

### ✅ Good Pattern: License Compliance Check

```yaml
# .github/workflows/license-check.yml
name: License Compliance

on: [push, pull_request]

jobs:
  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check Licenses with FOSSA
        uses: fossas/fossa-action@v1
        with:
          api-key: ${{ secrets.FOSSA_API_KEY }}
      
      - name: Validate Approved Licenses
        run: |
          # Extract all licenses from package-lock.json
          npm ls --json --all | jq -r '
            .. | .license? | select(. != null)
          ' | sort -u > licenses.txt
          
          # Check against approved list
          APPROVED="MIT|Apache-2.0|BSD-3-Clause|ISC|PostgreSQL|MPL-2.0"
          
          while read license; do
            if ! echo "$license" | grep -E "^($APPROVED)$" > /dev/null; then
              echo "❌ Unapproved license: $license"
              echo "See: https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#approved-licenses"
              exit 1
            fi
          done < licenses.txt
          
          echo "✅ All licenses approved"
```

**Policy Reference**: [Open Source Policy Section 4](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#4-license-compliance-framework)

### ✅ Good Pattern: SECURITY.md Template

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**IMPORTANT:** Per [Hack23 Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#vulnerability-management), do NOT open public issues for security vulnerabilities.

### Reporting Process

1. **Email**: security@hack23.com with detailed vulnerability report
2. **Response**: Expect initial response within 48 hours
3. **Disclosure**: Coordinated disclosure after fix (typically 90 days)

### What to Include

- Vulnerability description
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

## Security Features

This project implements security controls per [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md):

### Supply Chain Security
- **OSSF Scorecard**: Target ≥8.0/10
- **SLSA Level 3**: Build provenance
- **SBOM**: CycloneDX format, quality ≥7.0/10
- **Dependencies**: All pinned to specific versions
- **Licenses**: Only approved open source licenses

### Static Analysis
- **CodeQL**: Scans on every PR
- **Dependabot**: Automated security updates
- **License Compliance**: FOSSA scanning

### Testing
- **Coverage**: 80% minimum (95% for security code)
- **Security Tests**: Input validation, auth, authorization

## Security Contacts

- **Security Team**: security@hack23.com
- **Policy Owner**: CEO, Hack23 AB
```

**Evidence**: [European Parliament MCP Server SECURITY.md](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/SECURITY.md)

### ✅ Good Pattern: Vulnerability Remediation Tracking

```typescript
/**
 * Vulnerability remediation tracker
 * 
 * ISMS Policy: Open Source Policy Section 3 - Vulnerability Management
 * Evidence: https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#vulnerability-management
 */

interface Vulnerability {
  id: string;                   // CVE-YYYY-NNNNN or GHSA-XXXX-XXXX-XXXX
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;            // Affected dependency
  version: string;              // Vulnerable version
  discoveredDate: string;       // ISO 8601 date
  remediationDeadline: string;  // Based on severity SLA
  status: 'open' | 'in-progress' | 'resolved' | 'risk-accepted';
  assignedTo?: string;
}

// SLA per Open Source Policy Section 3
const REMEDIATION_SLA_DAYS = {
  critical: 1,
  high: 7,
  medium: 30,
  low: 90,
};

function calculateDeadline(severity: Vulnerability['severity'], discovered: Date): Date {
  const days = REMEDIATION_SLA_DAYS[severity];
  const deadline = new Date(discovered);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

// Track in issue tracker
async function createVulnerabilityIssue(vuln: Vulnerability): Promise<void> {
  const issue = {
    title: `[SECURITY] ${vuln.severity.toUpperCase()}: ${vuln.id} in ${vuln.component}`,
    labels: ['security', `severity:${vuln.severity}`],
    body: `
## Vulnerability Details

- **CVE/ID**: ${vuln.id}
- **Severity**: ${vuln.severity}
- **Component**: ${vuln.component}@${vuln.version}
- **Discovered**: ${vuln.discoveredDate}
- **Remediation Deadline**: ${vuln.remediationDeadline}

## SLA Reference

Per [Hack23 Open Source Policy Section 3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#vulnerability-management):
- Critical: 1 day
- High: 7 days
- Medium: 30 days
- Low: 90 days

## Action Required

1. Review vulnerability details
2. Assess impact on this project
3. Implement remediation or mitigation
4. Update dependencies
5. Verify fix and close issue
    `,
  };
  
  // Create GitHub issue via API
  await createGitHubIssue(issue);
}
```

**Policy Reference**: [Open Source Policy Section 3.2](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#vulnerability-management)

### ✅ Good Pattern: Exception Management Process

```typescript
/**
 * Open Source Policy Exception Request
 * 
 * ISMS Policy: Open Source Policy Section 8 - Exception Management
 * Evidence: https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#exception-management
 */

interface PolicyException {
  type: 'license' | 'security' | 'compliance';
  reason: string;
  component: string;
  requestedBy: string;
  requestDate: string;
  approvedBy?: string;
  approvalDate?: string;
  expiryDate?: string;
  compensatingControls: string[];
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

// Temporary exception (max 30 days)
const temporaryException: PolicyException = {
  type: 'license',
  reason: 'Dependency X required for critical feature, GPL-3.0 license under review for replacement',
  component: 'example-package@1.0.0',
  requestedBy: 'developer@hack23.com',
  requestDate: '2026-02-16',
  expiryDate: '2026-03-18', // 30 days
  compensatingControls: [
    'Isolated in separate module',
    'Dynamic linking only',
    'Alternative being evaluated',
    'Legal review in progress',
  ],
  status: 'pending',
};

// Permanent exception (requires CEO approval)
const permanentException: PolicyException = {
  type: 'security',
  reason: 'Legacy system integration requires specific outdated dependency version',
  component: 'legacy-lib@2.0.0',
  requestedBy: 'architect@hack23.com',
  requestDate: '2026-02-16',
  compensatingControls: [
    'Network isolation via VPC',
    'WAF rules blocking known exploits',
    'Regular security scanning',
    'Monitoring and alerting',
    'Incident response plan',
  ],
  status: 'approved',
  approvedBy: 'CEO',
  approvalDate: '2026-02-20',
};
```

**Policy Reference**: [Open Source Policy Section 8](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md#exception-management)

## Anti-Patterns

### ❌ Bad: Using Prohibited License

```json
// package.json - NEVER do this!
{
  "dependencies": {
    "gpl-library": "^1.0.0"  // GPL-3.0 is PROHIBITED
  }
}
```

**Why**: Violates Open Source Policy Section 4.3 - GPL licenses create legal risks

### ❌ Bad: No Security Badges

```markdown
# My Project

Just a cool project.  // No security posture evidence!
```

**Why**: Violates Open Source Policy Section 1 - Security posture must be publicly visible

### ❌ Bad: Public Security Disclosure

```markdown
# ISSUE #123: SQL Injection Vulnerability Found!

Steps to reproduce:
1. Go to /api/users?id=1' OR '1'='1
2. See all user data exposed
```

**Why**: Violates vulnerability disclosure process - MUST report privately to security@hack23.com

## Evidence Portfolio

### Reference Implementations

1. **Citizen Intelligence Agency (CIA)**
   - Scorecard: https://securityscorecards.dev/viewer/?uri=github.com/Hack23/cia
   - SBOM: https://github.com/Hack23/cia/releases
   - SECURITY.md: https://github.com/Hack23/cia/blob/master/SECURITY.md

2. **Black Trigram Game**
   - Scorecard: https://securityscorecards.dev/viewer/?uri=github.com/Hack23/blacktrigram
   - License Check: https://github.com/Hack23/blacktrigram/blob/main/.github/workflows/license-check.yml
   - SBOM Workflow: https://github.com/Hack23/blacktrigram/blob/main/.github/workflows/sbom.yml

3. **CIA Compliance Manager**
   - Governance Docs: https://github.com/Hack23/cia-compliance-manager/tree/main/.github
   - FOSSA: https://app.fossa.com/projects/git%2Bgithub.com%2FHack23%2Fcia-compliance-manager

4. **European Parliament MCP Server**
   - All Badges: https://github.com/Hack23/European-Parliament-MCP-Server#readme
   - SECURITY.md: https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/SECURITY.md
   - Open Source Policy: https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/Open_Source_Policy.md

### Policy Documents

- **Open Source Policy v2.3**: https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md
- **ISMS-PUBLIC Repository**: https://github.com/Hack23/ISMS-PUBLIC

## Compliance Checklist

Use this checklist for new repositories:

- [ ] OpenSSF Scorecard badge displayed and score ≥7.0
- [ ] CII Best Practices badge at "Passing" level
- [ ] SLSA Level 3 provenance configured
- [ ] Quality gate badge (SonarCloud/equivalent)
- [ ] FOSSA license scanning enabled
- [ ] SECURITY.md with vulnerability disclosure process
- [ ] CONTRIBUTING.md with DCO and contribution guidelines
- [ ] CODE_OF_CONDUCT.md with community standards
- [ ] LICENSE.md with approved license (MIT/Apache-2.0)
- [ ] CODEOWNERS for security-critical paths
- [ ] SBOM generation in release workflow
- [ ] All dependencies use approved licenses
- [ ] Dependabot enabled for security updates
- [ ] npm audit passes with zero vulnerabilities
- [ ] Exception tracking for any policy deviations

## ISMS Compliance

This skill enforces:
- **OS-001**: Public transparency through badges
- **OS-002**: License compliance framework
- **OS-003**: Supply chain security
- **OS-004**: Vulnerability management
- **OS-005**: Governance artifacts

**Policy Reference**: [Hack23 Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
