---
name: secure-development-lifecycle
description: Comprehensive SDLC security practices with DevSecOps automation, OWASP Top 10, supply chain security (OSSF/SLSA)
license: Apache-2.0
---

# Secure Development Lifecycle Skill

## Purpose

Implement secure development practices across all SDLC phases for TypeScript/Node.js MCP server development, from requirements through deployment.

## When to Use

- ✅ Planning new features with security requirements
- ✅ Implementing security controls in code
- ✅ Configuring CI/CD security gates
- ✅ Conducting security reviews before release
- ✅ Managing supply chain security

## SDLC Security Phases

### 1. Requirements

- Define security requirements alongside functional requirements
- Identify data classification (European Parliament public data, GDPR considerations)
- Determine compliance requirements (ISMS, GDPR)

### 2. Design

- Threat modeling using STRIDE methodology
- Security architecture documentation (SECURITY_ARCHITECTURE.md)
- Input validation strategy (Zod schemas)
- Rate limiting and API security design

### 3. Implementation

```typescript
// Security controls in code
import { z } from 'zod';

// Input validation
const schema = z.object({
  id: z.number().int().positive(),
  query: z.string().min(1).max(500),
});

// Error handling (no information leakage)
try {
  const result = await apiCall();
} catch (error) {
  logger.error('API call failed', { error });
  throw new Error('Request failed');  // Generic message
}
```

### 4. Testing

- Unit tests with 80%+ coverage
- Security-focused tests (input validation, error handling)
- Dependency scanning (npm audit)
- License compliance (test:licenses)

### 5. Deployment

- Automated security checks in CI/CD
- CodeQL analysis on every PR
- SBOM generation for supply chain transparency
- Signed releases with provenance attestation

### 6. Monitoring

- Dependabot alerts for dependency vulnerabilities
- GitHub secret scanning
- Regular security audits

## Supply Chain Security

| Control | Implementation |
|---------|---------------|
| OSSF Scorecard | Automated scoring of security practices |
| SLSA Level | Build provenance and supply chain integrity |
| SBOM | CycloneDX software bill of materials |
| Dependency pinning | package-lock.json committed |
| Signed commits | GPG-signed git commits |

## ISMS Policy References

**Core SDLC policies:**

- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Governance and security-by-design mandate
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — SDLC phases, DevSecOps controls, test / SBOM / SLSA obligations
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Supply-chain security, licensing, vulnerability disclosure, SBOM publication

**Supporting policies:**

- [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) — Controlled, reviewed, reversible changes
- [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) — CVSS-based SLAs (Critical 7d / High 30d / Medium 90d / Low 180d)
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md) — Approved algorithms, TLS 1.3+, key management
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) — Least privilege in CI/CD tokens and runtime
- [Threat Modeling](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) — STRIDE at design phase
- [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) — Response to CI/CD / supply-chain incidents
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) + [OWASP LLM Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/OWASP_LLM_Security_Policy.md) — AI-assisted development and MCP-specific hardening
