[**European Parliament MCP Server API v1.2.11**](../README.md)

***

[European Parliament MCP Server API](../modules.md) / SECURITY

<p align="center">
  <img src="https://hack23.github.io/cia-compliance-manager/icon-192.png" alt="Hack23 AB Logo" width="192" height="192">
</p>

<h1 align="center">🔐 Hack23 AB — European Parliament MCP Server Security Policy</h1>

<p align="center">
  <strong>🛡️ Security Through Transparency and Excellence</strong><br>
  <em>🎯 Security-first API development with verifiable compliance</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2025--02--16-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
  <a href="https://www.bestpractices.dev/projects/12067"><img src="https://www.bestpractices.dev/projects/12067/badge" alt="OpenSSF Best Practices"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-02-26 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-05-26

---

## 🏆 Current Security Posture

**Current security state as of 2026-02-26:**

| Metric | Status | Value |
|--------|--------|-------|
| 🧪 Test Suite | ✅ Passing | 1396 tests across 54 test files (docs/test-results/results.json) |
| 🔒 npm audit | ✅ Clean | 0 vulnerabilities |
| 📜 License compliance | ✅ Passing | All MIT/ISC/Apache-2.0 |
| 🏛️ SLSA Level 3 | ✅ Achieved | Cryptographic provenance on all releases |
| 🔍 SAST (CodeQL) | ✅ Enabled | Automated on every PR and push |
| 🔑 Secret scanning | ✅ Enabled | GitHub native secret detection |
| 📦 SBOM | ✅ Published | SPDX + CycloneDX on every release |
| 🔐 Sigstore | ✅ Enabled | npm package and GitHub release artifacts |

---

## 🎯 Security Commitment

At Hack23 AB, we are committed to maintaining the highest standards of security in all our projects. The European Parliament MCP Server implements comprehensive security measures aligned with our **[Information Security Management System (ISMS)](https://github.com/Hack23/ISMS-PUBLIC)**, providing verifiable transparency and demonstrating security excellence for sensitive European Parliament data access.

## 🌍 European Parliament Context

This MCP server provides access to European Parliament datasets, including:
- **Parliamentary proceedings** - Legislative activities, debates, votes
- **Member information** - MEP profiles, committee memberships
- **Legislative documents** - Proposals, amendments, reports
- **Historical data** - Archive access to parliamentary records

As such, this server implements enhanced security controls to ensure:
- **🔒 GDPR Compliance** - Personal data protection for MEP information
- **🇪🇺 EU Data Sovereignty** - Appropriate handling of EU institutional data
- **🔐 Data Integrity** - Immutable audit trails for all API access
- **📊 Transparency** - Public accountability for institutional data access

## 📋 ISMS Policy Framework

All security practices in this repository are governed by our publicly available ISMS policies:

### 🔐 Core Security Policies

| Policy | Purpose | Link |
|--------|---------|------|
| 🔐 **Information Security Policy** | Overarching security governance and principles | [View Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) |
| 🛠️ **Secure Development Policy** | SDLC, testing, deployment, and CI/CD requirements | [View Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| 📦 **Open Source Policy** | Open source usage, license compliance, supply chain security | [View Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) |
| 🏷️ **Data Classification Policy** | Data sensitivity levels, handling requirements | [View Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md) |
| 🔒 **Privacy Policy** | Personal data protection, GDPR compliance | [View Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) |
| 🔑 **Access Control Policy** | Authentication, authorization, identity management | [View Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) |

---

## ✅ Supported Versions

This project is under active development, and we provide security updates for the latest version only. Please ensure you're using the latest version of the project to receive security updates.

| Version | Supported          | Node.js Compatibility |
| ------- | ------------------ | --------------------- |
| latest  | :white_check_mark: | Node.js 25.x |

---

## 🛡️ Security Features & Evidence

This MCP server implements comprehensive security measures aligned with our **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** and **[Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)**:

### 🔍 Static & Dynamic Analysis

- **🛡️ Static Analysis (SAST)** - CodeQL scanning for vulnerabilities
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Implementation: [CodeQL Workflow](../_media/codeql.yml) (if present)
  - Focus: Node.js/TypeScript security patterns, API vulnerabilities

- **🕷️ Dynamic Analysis (DAST)** - OWASP ZAP security testing
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Implementation: [ZAP Workflow](.github/workflows/zap-scan.yml) (if present)
  - Focus: API endpoint security, injection attacks

- **📋 Code Quality** - ESLint with TypeScript rules
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Standards: TypeScript strict mode, security-focused linting rules

### 📦 Supply Chain Security

- **🏆 OSSF Scorecard** - Supply chain security assessment
  - Policy: [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
  - Badge: [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/Hack23/European-Parliament-MCP-Server/badge)](https://scorecard.dev/viewer/?uri=github.com/Hack23/European-Parliament-MCP-Server)

- **🔍 Dependency Review** - Automated dependency vulnerability checks
  - Policy: [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
  - Implementation: [Dependency Review Workflow](../_media/dependency-review.yml)
  - Tools: GitHub Dependabot, npm audit

- **📜 License Compliance** - Automated license checking
  - Policy: [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
  - Approved Licenses: MIT, Apache-2.0, BSD variants, ISC, CC0-1.0, Unlicense

- **📄 SBOM Generation** - Software Bill of Materials in SPDX format
  - Policy: [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
  - Implementation: [SBOM Generation Workflow](.github/workflows/sbom-generation.yml)
  - Documentation: [SBOM.md](../_media/SBOM.md)
  - Location: Included in every release
  - Format: SPDX 2.3+ JSON

- **📊 SBOM Quality Validation** - Automated quality scoring with SBOMQS
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Implementation: [SBOM Generation Workflow](.github/workflows/sbom-generation.yml)
  - Minimum Score: 7.0/10
  - Standards: NTIA-minimum-elements, BSI v1.1/v2.0

- **🏷️ Pinned Dependencies** - All GitHub Actions pinned to SHA hashes
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Implementation: All `.github/workflows/*.yml` files

### 🔏 Build Integrity & Attestations

- **🔐 SLSA Provenance** - Build attestations for artifact verification
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Verification: `gh attestation verify <artifact> --owner Hack23 --repo European-Parliament-MCP-Server`
  - Level: SLSA Level 3+ compliant
  - Documentation: [ATTESTATIONS.md](../_media/ATTESTATIONS.md)

- **🛡️ Immutable Releases** - Release artifacts cannot be tampered with
  - Policy: [Data Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md)
  - Implementation: GitHub release immutability enabled

- **🔏 Artifact Signing** - Cryptographic proof of build integrity
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Format: In-toto attestations in JSONL format

- **📦 npm Provenance** - Build transparency for npm packages
  - Policy: [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
  - Package: [european-parliament-mcp-server](https://www.npmjs.com/package/european-parliament-mcp-server)
  - Verification: `npm audit signatures`
  - Documentation: [NPM_PUBLISHING.md](./NPM_PUBLISHING.md)
  - Features:
    - ✅ Cryptographic provenance for every published version
    - ✅ Transparent build process via GitHub Actions
    - ✅ SLSA Level 3 compliance for npm packages
    - ✅ Verifiable with `npm audit signatures`
  - Algorithm: SHA-256 cryptographic hashing

### 🧪 Testing & Quality Assurance

- **✅ Unit Testing** - Comprehensive test coverage
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Minimum Coverage: 80% line coverage, 70% branch coverage
  - Framework: Jest, Vitest, or Node.js test runner

- **🌐 Integration Testing** - API endpoint testing
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Focus: MCP protocol compliance, European Parliament API integration
  - Tools: Supertest, API testing frameworks

- **🔒 Security Testing** - Dedicated security test suites
  - Authentication/authorization tests
  - Input validation and sanitization tests
  - Rate limiting and DoS protection tests
  - GDPR compliance tests (data minimization, right to erasure)

### 🔐 API Security Controls

- **🔒 Rate Limiting** - Protection against abuse and DoS attacks
  - Policy: [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
  - Implementation: Express rate-limit or similar middleware
  - Thresholds: Configurable per-endpoint limits

- **🛡️ Input Validation** - Comprehensive request validation
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Tools: Joi, Yup, or Zod schema validation
  - Protection: SQL injection, XSS, command injection prevention

- **🔐 Authentication & Authorization** - MCP protocol security
  - Policy: [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md)
  - Implementation: OAuth2/OIDC support for client authentication
  - Principle: Least privilege access to European Parliament data

- **📝 Audit Logging** - Comprehensive API access logging
  - Policy: [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
  - Coverage: All API requests, authentication events, errors
  - Retention: Compliant with EU data retention requirements

### 🔐 Security Infrastructure

- **🔒 Runner Hardening** - All CI/CD runners hardened with audit logging
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Implementation: Step Security hardening in all workflows

- **🚨 Security Advisories** - Private vulnerability disclosure
  - Policy: [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
  - Process: GitHub Security Advisories (see below)

### 👥 Secure Development Environment

- **🚀 GitHub Codespaces** - Secure, hardened development environment
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) + [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md)
  - Configuration: [.devcontainer](../_media/.devcontainer) (if present)

- **🤖 GitHub Copilot** - AI-assisted development with security guidelines
  - Policy: [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
  - Agents: [.github/agents/](../_media/agents)
  - Skills: [.github/skills/](../_media/skills)

### 🇪🇺 GDPR & European Data Protection

- **🔐 Data Minimization** - Only collect necessary European Parliament data
  - Policy: [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)
  - Implementation: API endpoints filter unnecessary personal data

- **🗑️ Right to Erasure** - Support for data deletion requests
  - Policy: [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)
  - Process: `AuditLogger.eraseByUser(userId, authToken)` removes all in-memory entries for a data subject (GDPR Art. 17). Entries flushed to durable sinks must be erased separately via those sinks.

- **🔒 Data Protection by Design** - Privacy-enhancing technologies
  - Policy: [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)
  - Implementation: Encryption at rest and in transit, anonymization where applicable

- **📋 GDPR Compliance Documentation**
  - Data Protection Impact Assessment (DPIA) for high-risk processing
  - Records of processing activities (ROPA)
  - Data breach notification procedures

### 📝 Audit Logging (`src/utils/auditLogger.ts` + `src/utils/auditSink.ts`)

ISMS Policy AU-002 (Audit Logging and Monitoring) — all MCP tool invocations and EP API data-access events are recorded in a structured, GDPR-compliant audit trail.

#### Architecture

| Component | Description |
|-----------|-------------|
| `AuditLogger` | Central logger; writes to an always-on `MemoryAuditSink` plus zero or more extra sinks |
| `MemoryAuditSink` | In-process buffer; supports `query(filter)` and `eraseByUser(userId)` |
| `StderrAuditSink` | Default extra sink; emits `[AUDIT] <json>` to stderr (MCP-compatible) |
| `FileAuditSink` | Appends NDJSON to a file; rotates when the file reaches `maxSizeBytes` |
| `StructuredJsonSink` | Passes serialised JSON to a caller-supplied writer (CloudWatch, Elastic, …) |
| `RetentionPolicy` | Filters entries older than `maxAgeMs` on every `getLogs()` / `queryLogs()` call |

#### Security Controls

| Control | Mechanism |
|---------|-----------|
| **PII Protection** | `sanitizeParams()` redacts top-level keys in `DEFAULT_SENSITIVE_KEYS` (`name`, `email`, `fullName`, `address`, `firstName`, `lastName`, `phone`) before any entry is stored |
| **Access Control** | `requiredAuthToken` constructor option gates `getLogs()`, `queryLogs()`, `eraseByUser()`, and `clear()` behind an authorization token; unauthorized calls throw immediately |
| **Data Retention** | `retentionMs` constructor option enforces a configurable maximum age; expired entries are excluded from all query results |
| **Right to Erasure** | `eraseByUser(userId, authToken)` removes all in-memory entries for a given data subject (GDPR Art. 17) |
| **Append-only sinks** | `FileAuditSink` appends using async `fs.appendFile` (append-only writes); `MemoryAuditSink.clear()` is publicly exposed but is intended to be used via `AuditLogger.clear()`, which enforces authorization via `checkAuthorization` |
| **No stdout pollution** | All sinks write to stderr or external systems; stdout is reserved for the MCP protocol |

#### Configuration Example

```typescript
import { AuditLogger, FileAuditSink } from 'european-parliament-mcp-server';

const requiredAuthToken = process.env['AUDIT_READ_TOKEN'];

if (!requiredAuthToken) {
  throw new Error('AUDIT_READ_TOKEN environment variable must be set to enable secure audit log access.');
}

const logger = new AuditLogger({
  // Persist to file with automatic log rotation at 50 MiB
  sinks: [new FileAuditSink({ filePath: '/var/log/ep-mcp-audit.ndjson', maxSizeBytes: 50 * 1024 * 1024 })],
  // Enforce 90-day data retention (GDPR Art. 5(1)(e))
  retentionMs: 90 * 24 * 60 * 60 * 1000,
  // Require an auth token to read or erase audit logs
  requiredAuthToken,
  // Extend the default set of redacted keys
  sensitiveKeys: ['name', 'email', 'fullName', 'address', 'mepPrivateEmail'],
});
```

#### Test Coverage

The audit logging subsystem is security-critical and maintains **100% statement, branch, function, and line coverage** (`src/utils/auditLogger.ts` and `src/utils/auditSink.ts`).

---

## 🚨 Reporting a Vulnerability

We take the security of the European Parliament MCP Server project seriously. If you have found a potential security vulnerability, we kindly ask you to report it privately, so that we can assess and address the issue before it becomes publicly known.

Our vulnerability management process is governed by our **[Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)** and follows industry best practices for responsible disclosure.

### 🔍 What Constitutes a Vulnerability

A vulnerability is a weakness or flaw in the project that can be exploited to compromise the security, integrity, or availability of the system or its data. Examples of vulnerabilities include, but are not limited to:

- **🔓 Unauthenticated access** to sensitive European Parliament data
- **💉 Injection attacks** (SQL injection, NoSQL injection, command injection)
- **🔐 Authentication/authorization bypass** in MCP protocol implementation
- **🌐 API security issues** (rate limit bypass, parameter manipulation)
- **🔒 Cryptographic weaknesses** (weak algorithms, improper key management)
- **📊 GDPR violations** (unauthorized data exposure, insufficient data protection)
- **⚡ Denial of service** vulnerabilities in API endpoints
- **🔗 Supply chain attacks** through compromised dependencies

### 🛡️ How to Privately Report a Vulnerability using GitHub

Please follow these steps to privately report a security vulnerability:

1. On GitHub.com, navigate to the main page of the [European-Parliament-MCP-Server repository](https://github.com/Hack23/European-Parliament-MCP-Server).
2. Under the repository name, click **Security**. If you cannot see the "Security" tab, select the dropdown menu, and then click **Security**.
3. In the left sidebar, under "Reporting", click **Advisories**.
4. Click **Report a vulnerability** to open the advisory form.
5. Fill in the advisory details form. Provide as much information as possible to help us understand and reproduce the issue:
   - **Title**: Brief description of the vulnerability
   - **Description**: Detailed explanation including:
     - Affected components (API endpoints, authentication, etc.)
     - Steps to reproduce
     - Potential impact (especially GDPR/data protection concerns)
     - Suggested mitigation (if any)
   - **Severity**: Your assessment of the vulnerability severity
   - **CVE ID**: If already assigned
6. At the bottom of the form, click **Submit report**.

After you submit the report, the maintainers of the European-Parliament-MCP-Server repository will be notified. They will review the report, validate the vulnerability, and take necessary actions to address the issue. You will be added as a collaborator and credited for the security advisory.

### ⏱️ Disclosure Timeline

Upon receipt of a vulnerability report, our team will:

1. **Acknowledge** the report within **48 hours**
2. **Validate** the vulnerability within **7 days**
3. **Assess** GDPR/data protection implications within **7 days**
4. **Develop and release** a patch or mitigation within **30 days**, depending on the complexity and severity of the issue
5. **Publish** a security advisory with a detailed description of the vulnerability and the fix
6. **Notify** affected users if there is a potential data breach (as required by GDPR)

### 🏆 Recognition and Anonymity

We appreciate your effort in helping us maintain a secure and reliable project. If your report results in a confirmed security fix, we will recognize your contribution in the release notes and/or a public acknowledgment, unless you request to remain anonymous.

---

## 📚 Related Security Resources

### Internal Documentation
- 🛡️ **[Security Headers](SECURITY_HEADERS.md)** - Security headers implementation for API responses
- 📖 **[README.md](../modules.md)** - Project overview with security features
- 🤖 **[Copilot Agents](../_media/agents)** - AI-assisted secure development
- 🎯 **[Copilot Skills](../_media/skills)** - Specialized security and compliance skills

### ISMS-PUBLIC Policies
All security practices are governed by our publicly available ISMS:

- 🔐 **[Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)** - Overall security governance
- 🛠️ **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** - SDLC and CI/CD requirements
- 📦 **[Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)** - Supply chain security
- 🏷️ **[Data Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md)** - Data handling requirements
- 🔒 **[Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)** - Privacy and GDPR compliance
- 🔑 **[Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md)** - Authentication and authorization
- 🔍 **[Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md)** - Security vulnerability handling
- 🏷️ **[Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md)** - CIA triad and impact levels

### European Parliament Data Protection
- **🇪🇺 GDPR** - [Regulation (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- **🏛️ EP Data Protection** - [European Parliament data protection rules](https://www.europarl.europa.eu/at-your-service/en/transparency/access-to-documents)
- **🔒 ePrivacy Directive** - [Directive 2002/58/EC](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32002L0058)

---

## 📚 Related Documents

- 🔐 [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) - Overall security governance
- 🛠️ [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) - SDLC and CI/CD requirements
- 📦 [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) - Supply chain security
- 🏷️ [Data Classification Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md) - Data handling requirements
- 🔒 [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) - Privacy and GDPR compliance
- 🔑 [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) - Authentication and authorization
- 🔍 [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) - Security vulnerability handling
- 🏷️ [Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) - CIA triad and impact levels
- 🛡️ [CRA Conformity Assessment](CRA-ASSESSMENT.md) - EU Cyber Resilience Act compliance
- 🛡️ [CRA Conformity Assessment Process](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CRA_Conformity_Assessment_Process.md) - CRA assessment template

---

**📋 Document Control:**  
**✅ Approved by:** James Pether Sörling, CEO  
**📤 Distribution:** Public  
**🏷️ Classification:** [![Confidentiality: Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels)  
**📅 Effective Date:** 2026-02-26  
**⏰ Next Review:** 2026-05-26  
**🎯 Framework Compliance:** [![ISO 27001](https://img.shields.io/badge/ISO_27001-2022_Aligned-blue?style=flat-square&logo=iso&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![NIST CSF 2.0](https://img.shields.io/badge/NIST_CSF-2.0_Aligned-green?style=flat-square&logo=nist&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![CIS Controls](https://img.shields.io/badge/CIS_Controls-v8.1_Aligned-orange?style=flat-square&logo=cisecurity&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![AWS Well-Architected](https://img.shields.io/badge/AWS-Well_Architected-orange?style=flat-square&logo=amazon-aws&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![GDPR Compliant](https://img.shields.io/badge/GDPR-Compliant-success?style=flat-square&logo=european-union&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)

---

<div align="center">

**Thank you for helping us keep the European Parliament MCP Server and its users safe.**

*Part of Hack23 AB's commitment to transparency and security excellence*

</div>

---

## 🔌 MCP-Specific Security

### Tool Invocation Security

**Input Validation**: All tool parameters validated with Zod schemas
- Country codes: ISO 3166-1 alpha-2 format
- Dates: YYYY-MM-DD format
- Keywords: Alphanumeric + spaces/hyphens only

**Rate Limiting**: 100 requests per 15 minutes per IP address

**Output Sanitization**: Error messages sanitized to prevent information disclosure

### Threat Model

**Threats Addressed**:
- ✅ Injection attacks → Zod validation
- ✅ DoS attacks → Rate limiting
- ✅ Data exfiltration → Audit logging
- ✅ Information disclosure → Error sanitization

🔒 **[Complete security architecture →](./docs/ARCHITECTURE_DIAGRAMS.md#security-architecture)**

### MCP Security Checklist

- [x] Input validation (Zod schemas)
- [x] Rate limiting (Token bucket)
- [x] Audit logging (All requests)
- [x] Error sanitization
- [x] HTTPS only
- [x] No secrets in code
- [x] GDPR compliance

📋 **[Complete security guide →](./TROUBLESHOOTING.md)**
