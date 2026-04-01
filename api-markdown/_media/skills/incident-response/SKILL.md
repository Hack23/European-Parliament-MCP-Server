---
name: incident-response
description: Security incident detection, analysis, containment, and recovery per NIST SP 800-61r2 and ISO 27035
license: Apache-2.0
---

# Incident Response Skill

## Purpose

Establish procedures for detecting, analyzing, containing, and recovering from security incidents affecting MCP server projects.

## When to Use

- ✅ Responding to security vulnerability reports
- ✅ Handling dependency compromise alerts
- ✅ Managing secret exposure incidents
- ✅ Addressing CodeQL critical findings
- ✅ Processing SECURITY.md vulnerability disclosures

## Incident Classification

| Severity | Examples | Response Time |
|----------|----------|--------------|
| 🔴 Critical | Secret exposure, RCE vulnerability | 4 hours |
| 🟠 High | Authentication bypass, data exposure | 24 hours |
| 🟡 Medium | XSS, CSRF, moderate vulnerability | 72 hours |
| 🟢 Low | Information disclosure, minor issues | 1 week |

## Response Workflow

### 1. Detection & Triage

- GitHub Security Advisories notification
- Dependabot critical alert
- Security researcher disclosure via SECURITY.md
- CodeQL/SAST finding in CI

### 2. Containment

```bash
# If secret exposed
# 1. Rotate immediately
# 2. Revoke old credentials
# 3. Review access logs

# If vulnerable dependency
npm audit fix
# or pin to safe version
npm install package@safe-version
```

### 3. Eradication

- Apply security patch
- Update vulnerable dependencies
- Fix code vulnerability
- Verify fix with security tests

### 4. Recovery

- Deploy fixed version
- Verify no unauthorized access occurred
- Monitor for residual effects
- Update security documentation

### 5. Lessons Learned

- Document incident timeline
- Update detection mechanisms
- Improve prevention controls
- Share findings with team

## Communication

- Use GitHub Security Advisories for coordinated disclosure
- Follow responsible disclosure timeline in SECURITY.md
- Notify affected users if personal data involved (GDPR)

## ISMS Policy References

- [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md)
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) - GDPR breach notification
