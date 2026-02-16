# ISMS Skills Mapping

**Comprehensive mapping of Hack23 ISMS policy sections to GitHub Copilot Skills**

This document provides a complete mapping between [Hack23 ISMS-PUBLIC](https://github.com/Hack23/ISMS-PUBLIC) policy sections and the 17 GitHub Copilot skills implemented in this repository.

## Policy Coverage Summary

| Policy Document | Version | Skills Covering | Coverage |
|----------------|---------|-----------------|----------|
| [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) | 2.3 | 6 skills | 100% |
| [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) | 2.1 | 11 skills | 100% |
| **Total** | - | **17 skills** | **100%** |

---

## Open Source Policy v2.3 Mapping

### Section 1: Security Posture Evidence

**Policy Section:** 🎖️ Required Security Badges  
**Skills:** 
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - OpenSSF Scorecard ≥7.0, CII Best Practices, SLSA Level 3, Quality Gate

**Implementation:**
- Badge integration in README.md
- Automated badge updates in CI/CD
- Compliance monitoring and alerting

---

### Section 2: Governance Artifacts

**Policy Section:** 📋 Governance Artifacts  
**Skills:**
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, CODEOWNERS
- [`documentation-standards`](./.github/skills/documentation-standards/SKILL.md) - Documentation structure and standards

**Implementation:**
- Template generation for governance files
- Policy compliance verification
- Documentation maintenance

---

### Section 3: Security Implementation Requirements

**Policy Section:** 🔒 Supply Chain Security  
**Skills:**
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - SBOM generation, dependency scanning, Dependabot
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - Secure dependency management

**Implementation:**
- CycloneDX SBOM generation
- Automated dependency vulnerability scanning
- Dependency pinning enforcement

---

### Section 4: License Compliance Framework

**Policy Section:** 📊 License Compliance  
**Skills:**
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - Approved/prohibited licenses, FOSSA scanning

**Implementation:**
- Automated license validation
- Approved license list enforcement
- License conflict detection

---

### Section 5: Classification & Documentation

**Policy Section:** 🏷️ Classification Requirements  
**Skills:**
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - Data classification
- [`architecture-documentation`](./.github/skills/architecture-documentation/SKILL.md) - Classification in architecture docs

**Implementation:**
- Data classification schema
- Classification-based security controls
- Documentation requirements

---

### Section 6: Data Protection Requirements

**Policy Section:** 🔐 Data Protection  
**Skills:**
- [`gdpr-compliance`](./.github/skills/gdpr-compliance/SKILL.md) - GDPR data protection
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - Secure data handling

**Implementation:**
- Prohibited data detection
- Acceptable data practices
- Secret scanning

---

### Section 7: Vulnerability Management

**Policy Section:** 🛡️ Vulnerability Management  
**Skills:**
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - Vulnerability disclosure, remediation SLAs

**Implementation:**
- Private disclosure process
- Response SLAs (Critical: 1 day, High: 7 days, Medium: 30 days, Low: 90 days)
- Coordinated disclosure (90-day window)

---

### Section 8: Exception Management

**Policy Section:** 🚨 Exception Management  
**Skills:**
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - Exception request process, tracking

**Implementation:**
- Exception request workflow
- Temporary exceptions (30 days max)
- Permanent exceptions (CEO approval)

---

## Secure Development Policy v2.1 Mapping

### Section 🔄: Secure Development Lifecycle (SDLC)

**Policy Sections:**
- 📋 Phase 1: Planning & Design
- 💻 Phase 2: Development
- 🧪 Phase 3: Security Testing
- 🚀 Phase 4: Deployment
- 🔧 Phase 5: Maintenance & Operations

**Skills:**
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - Security by design principles
- [`threat-modeling-framework`](./.github/skills/threat-modeling-framework/SKILL.md) - Planning phase threat modeling
- [`typescript-strict-patterns`](./.github/skills/typescript-strict-patterns/SKILL.md) - Development phase type safety
- [`testing-strategy`](./.github/skills/testing-strategy/SKILL.md) - Testing phase coverage

**Implementation:**
- SDLC phase integration
- Security gate requirements
- Phase-specific checklists

---

### Section 🤖: AI-Augmented Development Controls

**Policy Sections:**
- 🔐 AI as Proposal Generator, Not Authority
- 📋 PR Review Requirements
- 🔧 Curator-Agent as Tooling Change
- 🛡️ Security Requirements

**Skills:**
- [`ai-development-governance`](./.github/skills/ai-development-governance/SKILL.md) - Complete AI governance framework

**Implementation:**
- AI code review requirements
- GitHub Copilot usage guidelines
- Custom agent governance
- AI security requirements

---

### Section 🎯: Unit Test Coverage & Quality

**Policy Section:** 📊 Testing Standards & Requirements  
**Skills:**
- [`testing-strategy`](./.github/skills/testing-strategy/SKILL.md) - 80% coverage, unit tests
- [`testing-mcp-tools`](./.github/skills/testing-mcp-tools/SKILL.md) - MCP-specific testing

**Implementation:**
- Vitest/Jest testing patterns
- Coverage thresholds (80% line, 70% branch)
- Security test requirements (95% coverage)

---

### Section 🕷️: Advanced Security Testing Framework

**Policy Sections:**
- 🎯 Threat Modeling Requirements
- 🛡️ OWASP ZAP Security Scanning
- 📦 SBOM Requirements

**Skills:**
- [`threat-modeling-framework`](./.github/skills/threat-modeling-framework/SKILL.md) - STRIDE methodology, threat model docs
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - OWASP ZAP integration
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - SBOM generation

**Implementation:**
- THREAT_MODEL.md documentation
- STRIDE threat analysis
- OWASP ZAP CI/CD integration
- CycloneDX SBOM generation

---

### Section ⚡: Performance Testing & Monitoring

**Policy Section:** 🎯 Performance Validation Requirements  
**Skills:**
- [`performance-optimization`](./.github/skills/performance-optimization/SKILL.md) - <200ms response times, profiling

**Implementation:**
- Performance benchmarking
- Response time monitoring
- Resource usage optimization

---

### Section 🔄: CI/CD Workflow & Automation Excellence

**Policy Section:** 🔧 Advanced CI/CD Requirements  
**Skills:**
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - CI/CD security gates
- [`open-source-governance`](./.github/skills/open-source-governance/SKILL.md) - Automated compliance checks

**Implementation:**
- GitHub Actions workflows
- Security gate automation
- Automated testing and validation

---

### Section 🏗️: Architecture Documentation Matrix

**Policy Sections:**
- 📄 Documentation Requirements
- 📄 Required Documentation Files
- 📋 Mandatory Security Architecture Content

**Skills:**
- [`architecture-documentation`](./.github/skills/architecture-documentation/SKILL.md) - SECURITY_ARCHITECTURE.md, C4 model, Mermaid diagrams

**Implementation:**
- SECURITY_ARCHITECTURE.md template
- FUTURE_SECURITY_ARCHITECTURE.md planning
- C4 architecture levels (Context, Container, Component, Code)

---

### Section 📐: C4 Architecture Model Implementation

**Policy Section:** 🎯 C4 Architecture Model  
**Skills:**
- [`architecture-documentation`](./.github/skills/architecture-documentation/SKILL.md) - Complete C4 model implementation

**Implementation:**
- Level 1: System Context
- Level 2: Container
- Level 3: Component
- Level 4: Code (optional)

---

### Section 🔑: Authentication & Identity Architecture

**Policy Section:** 🎯 Strategic Authentication Requirements  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - IAM, identity management
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - Authentication patterns

**Implementation:**
- IAM policy design
- Least privilege access
- Authentication documentation

---

### Section 📜: Data Integrity & Audit Framework

**Policy Section:** 🛡️ Systematic Audit Requirements  
**Skills:**
- [`gdpr-compliance`](./.github/skills/gdpr-compliance/SKILL.md) - Audit logging for personal data
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - Audit framework implementation

**Implementation:**
- Structured audit logging
- GDPR-compliant access logs
- Data integrity controls

---

### Section 🔍: Security Monitoring & Detection

**Policy Section:** ☁️ AWS-Native Security Services  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - GuardDuty, Security Hub, CloudTrail

**Implementation:**
- AWS GuardDuty threat detection
- AWS Security Hub centralized findings
- AWS CloudTrail API logging

---

### Section 🌐: Network Security & Zero Trust

**Policy Section:** 🔒 Network Security Principles  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - Zero Trust, VPC security
- [`security-by-design`](./.github/skills/security-by-design/SKILL.md) - Network security patterns

**Implementation:**
- Zero Trust architecture
- VPC configuration
- Security groups and NACLs

---

### Section 🔌: VPC Endpoints & Private Connectivity

**Policy Section:** 🏗️ Private Service Access  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - VPC endpoints, PrivateLink

**Implementation:**
- Gateway endpoints (S3, DynamoDB)
- Interface endpoints (Secrets Manager, etc.)
- Private DNS configuration

---

### Section 🏗️: High Availability & Resilience Design

**Policy Section:** ⚡ Availability Architecture Requirements  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - Multi-AZ, HA/DR patterns

**Implementation:**
- Multi-AZ deployment
- Route 53 health checks
- Failover configuration

---

### Section ⚡: Resilience & Operational Readiness

**Policy Section:** 🛡️ AWS Resilience Hub Integration  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - Resilience Hub, RTO/RPO

**Implementation:**
- Resilience assessments
- RTO/RPO targets
- Recovery procedures

---

### Section 🧪: Chaos Engineering & Resilience Testing

**Policy Section:** 🔬 AWS Fault Injection Service (FIS)  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - FIS experiments

**Implementation:**
- FIS experiment design
- Chaos testing scenarios
- Resilience validation

---

### Section 💾: Data Protection & Backup Strategy

**Policy Section:** 🏗️ Centralized Backup Management  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - AWS Backup, service-native backups

**Implementation:**
- AWS Backup plans
- DynamoDB Point-in-Time Recovery
- S3 versioning and lifecycle

---

### Section 📜: Compliance Framework Integration

**Policy Section:** 🏛️ Multi-Standard Compliance Alignment  
**Skills:**
- [`compliance-frameworks`](./.github/skills/compliance-frameworks/SKILL.md) - ISO 27001, NIST CSF, CIS Controls, EU CRA
- [`isms-compliance`](./.github/skills/isms-compliance/SKILL.md) - ISMS policy alignment

**Implementation:**
- ISO 27001:2022 control mapping
- NIST CSF 2.0 function mapping
- CIS Controls v8.1 safeguards
- EU CRA conformity assessment

---

### Section 🎯: AWS Control Tower Objective Mapping

**Policy Section:** 📋 Comprehensive Control Implementation (CO.1-CO.15)  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - Control Tower objectives

**Implementation:**
- CO.1: IAM
- CO.2: Network security
- CO.3: Data protection
- CO.4: Detective controls
- CO.5-15: Operational excellence

---

### Section 🏛️: AWS Well-Architected Framework

**Policy Section:** AWS WAF Pillars  
**Skills:**
- [`aws-security-architecture`](./.github/skills/aws-security-architecture/SKILL.md) - Complete WAF alignment

**Implementation:**
- Security Pillar
- Reliability Pillar
- Operational Excellence
- Performance Efficiency
- Cost Optimization
- Sustainability

---

## Skill Usage Matrix

| Skill | Open Source Policy | Secure Development Policy | Lines of Code |
|-------|-------------------|---------------------------|---------------|
| open-source-governance | ✅ Primary | ⚪ Referenced | 16.4KB |
| threat-modeling-framework | ⚪ Referenced | ✅ Primary | 15.4KB |
| architecture-documentation | ⚪ Referenced | ✅ Primary | 14.8KB |
| aws-security-architecture | ❌ Not covered | ✅ Primary | 13.1KB |
| compliance-frameworks | ✅ Referenced | ✅ Primary | 19.5KB |
| ai-development-governance | ❌ Not covered | ✅ Primary | 14.5KB |
| security-by-design | ✅ Referenced | ✅ Primary | Existing |
| isms-compliance | ✅ Primary | ✅ Primary | Existing |
| mcp-server-development | ⚪ Project-specific | ⚪ Project-specific | Existing |
| european-parliament-api | ⚪ Project-specific | ⚪ Project-specific | Existing |
| gdpr-compliance | ✅ Referenced | ✅ Referenced | Existing |
| typescript-strict-patterns | ❌ Not covered | ✅ Referenced | Existing |
| testing-mcp-tools | ❌ Not covered | ✅ Referenced | Existing |
| testing-strategy | ❌ Not covered | ✅ Primary | Existing |
| documentation-standards | ✅ Referenced | ✅ Referenced | Existing |
| performance-optimization | ❌ Not covered | ✅ Referenced | Existing |

**Legend:**
- ✅ Primary: Skill is primary implementation of policy section
- ⚪ Referenced: Skill references or supports policy section
- ❌ Not covered: Policy doesn't apply to this skill

---

## Evidence Links

### Open Source Policy Evidence

All skills reference:
- [Hack23 Open Source Policy v2.3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [CIA Repository](https://github.com/Hack23/cia) - Reference implementation
- [Black Trigram Repository](https://github.com/Hack23/blacktrigram) - Reference implementation
- [CIA Compliance Manager](https://github.com/Hack23/cia-compliance-manager) - Reference implementation

### Secure Development Policy Evidence

All skills reference:
- [Hack23 Secure Development Policy v2.1](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- Policy-specific sections with direct links
- Real-world implementations in Hack23 repositories

---

## Skill Activation Context

| Context | Activated Skills |
|---------|------------------|
| Repository setup | `open-source-governance`, `documentation-standards` |
| Feature design | `threat-modeling-framework`, `architecture-documentation`, `security-by-design` |
| MCP tool development | `mcp-server-development`, `typescript-strict-patterns`, `testing-mcp-tools` |
| EP API integration | `european-parliament-api`, `gdpr-compliance`, `performance-optimization` |
| AWS deployment | `aws-security-architecture`, `compliance-frameworks` |
| Testing | `testing-strategy`, `testing-mcp-tools` |
| Documentation | `documentation-standards`, `architecture-documentation` |
| Compliance audit | `compliance-frameworks`, `isms-compliance`, `open-source-governance` |
| AI development | `ai-development-governance` |

---

## Maintenance Schedule

### Quarterly Review (Every 3 months)
- Review skill accuracy against latest ISMS policies
- Update evidence links
- Add new patterns from recent implementations
- Remove obsolete patterns

### Annual Review (Every year)
- Comprehensive skill audit
- Alignment with ISMS policy updates
- Cross-repository pattern analysis
- Skill effectiveness assessment

### Ad-Hoc Updates
- Policy changes requiring immediate updates
- New security patterns discovered
- Compliance requirement changes
- Critical security updates

---

## Contributing

When updating skills to reflect ISMS policy changes:

1. **Identify Policy Section**: Find exact section in Open Source or Secure Development Policy
2. **Update Skill**: Modify relevant skill(s) to reflect policy change
3. **Update This Mapping**: Add/modify entries in this document
4. **Evidence Links**: Ensure evidence links are current and accessible
5. **Test with Copilot**: Verify skill activates in relevant contexts
6. **PR Review**: Security team approval required for ISMS-related changes

---

## Contact

**Policy Owner**: CEO, Hack23 AB  
**Security Team**: security@hack23.com  
**ISMS Repository**: https://github.com/Hack23/ISMS-PUBLIC

---

**Last Updated**: 2026-02-16  
**Next Review**: 2026-05-16 (Quarterly)
