[**European Parliament MCP Server API v1.2.18**](../README.md)

***

[European Parliament MCP Server API](../modules.md) / THREAT\_MODEL

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🎯 European Parliament MCP Server — Threat Model</h1>

<p align="center">
  <strong>🛡️ Proactive Security Through Structured Threat Analysis</strong><br>
  <em>🔍 STRIDE • MITRE ATT&CK • MCP Protocol Security • Parliamentary Data Protection</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.3-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--04--28-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.3 | **📅 Last Updated:** 2026-04-28 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-07-28  
**🏷️ Classification:** Public (Open Source MCP Server)

---

## 📑 Table of Contents

- [ISMS Policy Alignment](#-isms-policy-alignment)
- [Security Documentation Map](#-security-documentation-map)
- [Purpose \& Scope](#-purpose--scope)
- [Multi-Strategy Threat Modeling Integration](#-multi-strategy-threat-modeling-integration)
- [System Classification](#-system-classification--operating-profile)
- [💎 Critical Assets \& Crown Jewel Analysis](#-critical-assets--crown-jewel-analysis)
- [STRIDE Threat Analysis](#-stride-threat-analysis)
- [MITRE ATT\&CK Coverage Analysis](#️-mitre-attck-coverage-analysis)
- [🏗️ Architecture-Centric STRIDE Analysis](#️-architecture-centric-stride-analysis)
- [MITRE ATT\&CK Mapping](#️-mitre-attck-mapping)
- [Kill Chain Disruption Analysis](#-kill-chain-disruption-analysis)
- [Threat Agent Classification](#-threat-agent-classification)
- [Current Threat Landscape](#-current-threat-landscape)
- [Scenario-Centric Threat Modeling](#-scenario-centric-threat-modeling-ep-specific)
- [Continuous Validation \& Assessment](#-continuous-validation--assessment)
- [Assessment Lifecycle](#-assessment-lifecycle)
- [Security Maturity Framework](#-security-maturity-framework)
- [Quantitative Risk Assessment](#-quantitative-risk-assessment)
- [Security Controls \& Mitigations](#️-security-controls--mitigations)
- [Attack Tree Analysis](#-attack-tree-analysis)
- [🔴 Priority Threat Scenarios](#-priority-threat-scenarios)
- [🛡️ STRIDE → Control Mapping](#️-stride--control-mapping)
- [🏛️ Comprehensive Security Control Framework](#️-comprehensive-security-control-framework)
- [🤖 OWASP LLM Top 10 (2025) — EP MCP Server Mapping](#owasp-llm-top-10-2025-ep-mcp-server-mapping)
- [🔌 MCP-Protocol-Specific Threats](#mcp-protocol-specific-threats-20252026-research)
- [🏗️ Architecture-Aligned STRIDE — Per-Component Refresh](#architecture-aligned-stride-per-component-refresh)
- [💰 Quantitative Risk Scoring — Top 7 Priority Scenarios](#quantitative-risk-scoring-top-7-priority-scenarios)
- [🔭 Detection Signatures — Per-Scenario Logging Indicators](#detection-signatures-per-scenario-logging-indicators)
- [🇪🇺 EU CRA Annex I Mapping](#eu-cyber-resilience-act-annex-i-mapping)
- [✍️ Residual-Risk Acceptance Log](#residual-risk-acceptance-log)
- [Policy Alignment](#-policy-alignment)
- [Related Documents](#-related-documents)

---

## 🔐 ISMS Policy Alignment

### Related ISMS Policies

| Policy | Relevance | Link |
|--------|-----------|------|
| **Open Source Policy** | Security transparency, vulnerability disclosure | [View](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) |
| **Secure Development Policy** | Secure coding practices, supply chain security | [View](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| **Risk Management Policy** | Threat assessment, risk mitigation | [View](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Management_Policy.md) |
| **Privacy Policy** | GDPR compliance, data protection | [View](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) |

### Security Control Implementation Status

| Control Area | Status | Evidence |
|-------------|--------|----------|
| Input Validation (Zod) | ✅ Implemented | Mitigates E-1, D-4, E-3 |
| Rate Limiting | ✅ Implemented | Mitigates D-1, D-2 |
| HTTPS/TLS | ✅ Implemented | Default EP API base URL uses HTTPS; `EP_API_URL` must be configured with `https://` (Mitigates S-2, T-1) |
| SLSA Level 3 | ✅ Implemented | Mitigates T-3, S-4 |
| Dependabot + npm audit | ✅ Implemented | Mitigates T-2 |
| Error Sanitization | ⚠️ Partial | Mitigates I-1, I-2 |

### Compliance Framework Mapping

| Framework | Controls | Status |
|-----------|----------|--------|
| **ISO 27001:2022** | A.5.1, A.8.2, A.8.8, A.8.25, A.14.2, A.18.1 | ✅ Aligned |
| **NIST CSF 2.0** | ID.AM, ID.RA, PR.DS, PR.IP, DE.CM, RS.AN | ✅ Aligned |
| **CIS Controls v8.1** | 1.1, 2.7, 3.3, 6.2, 7.1, 16.7 | ✅ Aligned |

> **See also**: [Policy Alignment](#-policy-alignment) below for the complete threat-specific ISMS policy mapping (Threat Modeling, Vulnerability Management, Network Security, Access Control, Cryptography, and Incident Response policies).

---

## 🗺️ Security Documentation Map

| Document | Type | Description | Status |
|----------|------|-------------|--------|
| [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) | 🛡️ Current | Implemented security design and controls | ✅ Current |
| [FUTURE_SECURITY_ARCHITECTURE.md](../_media/FUTURE_SECURITY_ARCHITECTURE.md) | 🚀 Future | Security roadmap and planned enhancements | ✅ Current |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | 🎯 Analysis | STRIDE threat analysis and risk assessment | ✅ Current |
| [FUTURE_THREAT_MODEL.md](../_media/FUTURE_THREAT_MODEL.md) | 🔮 Future | Threat analysis for planned architecture evolution | ✅ Current |
| [BCPPlan.md](../_media/BCPPlan.md) | 🔄 Continuity | Business continuity and disaster recovery | ✅ Current |
| [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md) | 📋 Compliance | EU Cyber Resilience Act conformity assessment | ✅ Current |
| [SECURITY.md](SECURITY.md) | 📜 Policy | Security policy and vulnerability disclosure | ✅ Current |
| [SECURITY_HEADERS.md](SECURITY_HEADERS.md) | 🔒 Technical | API security headers implementation | ✅ Current |

---

## 🎯 Purpose & Scope

Establish a comprehensive threat model for the European Parliament MCP Server, a TypeScript/Node.js Model Context Protocol server providing AI assistants with structured access to European Parliament open datasets. This systematic threat analysis integrates multiple frameworks to ensure proactive security through structured analysis.

### **🌟 Transparency Commitment**

This threat model demonstrates **🛡️ cybersecurity consulting expertise** through public documentation of advanced threat assessment methodologies, showcasing our **🏆 competitive advantage** via systematic risk management and **🤝 customer trust** through transparent security practices.

*— Based on Hack23 AB's commitment to security through transparency and excellence*

### **📚 Framework Integration**

- **🎭 STRIDE per architecture element:** Systematic threat categorization
- **🎖️ MITRE ATT&CK mapping:** Advanced threat intelligence integration
- **🏗️ Asset-centric analysis:** Critical resource protection focus
- **🎯 Scenario-centric modeling:** Real-world attack simulation
- **⚖️ Risk-centric assessment:** Business impact quantification

### **🔍 Scope Definition**

**Included Systems:**

- 🌐 TypeScript/Node.js MCP server application
- 🔌 MCP protocol implementation (stdio transport)
- 🏛️ European Parliament Open Data API integration
- 📦 npm package distribution (`european-parliament-mcp-server`)
- 🏭 CI/CD security pipeline (GitHub Actions, SLSA Level 3)
- 📦 Dependency supply chain (npm ecosystem)
- ✅ Input validation (Zod schemas)

**Out of Scope:**

- European Parliament API infrastructure security
- End-user AI assistant security (Claude, ChatGPT, etc.)
- Third-party npm registry infrastructure
- End-user operating system and network security

### **🔗 Policy Alignment**

Integrated with [🎯 Hack23 AB Threat Modeling Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) methodology and frameworks.

---

## 🎯 Multi-Strategy Threat Modeling Integration

This threat model implements the **five integrated threat modeling strategies** mandated by [Hack23 AB Threat Modeling Policy §4](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md). Each strategy provides complementary perspectives to ensure comprehensive threat coverage for the European Parliament MCP Server.

```mermaid
mindmap
  root((🎯 EP MCP Server<br/>Threat Modeling<br/>Strategies))
    (🎖️ Attacker-Centric)
      MITRE ATT&CK Mapping
      Kill Chain Analysis
      Threat Agent Classification
      Attack Tree Analysis
    (🏗️ Asset-Centric)
      Crown Jewel Analysis
      Critical Asset Inventory
      Data Flow Threat Analysis
      GDPR Data Classification
    (🏛️ Architecture-Centric)
      STRIDE per Component
      Trust Boundary Analysis
      Data Flow Diagrams
      Defense-in-Depth Layers
    (🎯 Scenario-Centric)
      Parliamentary Data Manipulation
      MEP Personal Data Abuse
      Electoral Disinformation
      Supply Chain Compromise
      MCP Protocol Injection
    (⚖️ Risk-Centric)
      Quantitative Risk Matrix
      Business Impact Analysis
      Likelihood Assessment
      Residual Risk Tracking
```

### **Strategy Integration Summary**

| Strategy | EP MCP Server Implementation | Key Sections |
|----------|------------------------------|-------------|
| **🎖️ Attacker-Centric** | MITRE ATT&CK mapping (13 techniques), Kill Chain disruption, 5 threat agent profiles | [ATT&CK Mapping](#️-mitre-attck-mapping), [Kill Chain](#-kill-chain-disruption-analysis), [Threat Agents](#-threat-agent-classification) |
| **🏗️ Asset-Centric** | 6 critical assets, Crown Jewel analysis, protection strategies | [Crown Jewels](#-critical-assets--crown-jewel-analysis) |
| **🏛️ Architecture-Centric** | STRIDE per 6 components (36 threat cells), trust boundary sequence diagram | [Architecture STRIDE](#️-architecture-centric-stride-analysis) |
| **🎯 Scenario-Centric** | 5 EP-specific attack scenarios with attack chains, detection, and response | [Scenarios](#-scenario-centric-threat-modeling-ep-specific) |
| **⚖️ Risk-Centric** | Quantitative risk matrix, priority risk ranking, residual risk assessment | [Risk Assessment](#-quantitative-risk-assessment) |

---

## 📊 System Classification & Operating Profile

### **🏷️ Security Classification Matrix**

| Dimension | Level | Rationale | Business Impact |
|----------|-------|-----------|----------------|
| **🔐 Confidentiality** | [![Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels) | Open source server processing public EP data | [![Trust Enhancement](https://img.shields.io/badge/Value-Trust_Enhancement-darkgreen?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |
| **🔒 Integrity** | [![Moderate](https://img.shields.io/badge/I-Moderate-yellow?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#integrity-levels) | Parliamentary data accuracy critical for democratic transparency | [![Operational Excellence](https://img.shields.io/badge/Value-Operational_Excellence-blue?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |
| **⚡ Availability** | [![Standard](https://img.shields.io/badge/A-Standard-lightgreen?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#availability-levels) | MCP server tolerates brief outages; AI clients retry | [![Revenue Protection](https://img.shields.io/badge/Value-Revenue_Protection-red?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |

### **⚙️ Operating Profile**

| Property | Value |
|----------|-------|
| **Runtime** | Node.js 25+ (Current) |
| **Language** | TypeScript 6.0.2 (strict mode) |
| **Transport** | stdio (local process) |
| **Data Source** | European Parliament Open Data API |
| **Distribution** | npm registry |
| **Authentication** | None (public data, local stdio) |
| **Users** | AI assistants (Claude, ChatGPT, etc.) |

---

## 💎 Critical Assets & Crown Jewel Analysis

### **🎯 Critical Asset Inventory**

| Asset | Description | Classification | Threat Impact |
|-------|-------------|----------------|---------------|
| **EP Parliamentary Data Integrity** | Accuracy and trustworthiness of MEP data, voting records, plenary documents | 🔒 Integrity: Moderate | Compromised democratic transparency, misinformation propagation |
| **Source Code & Build Pipeline** | TypeScript source, CI/CD workflows, GitHub Actions security | 🔐 Confidentiality: Public<br>🔒 Integrity: High | Supply chain compromise, malicious code injection |
| **Service Reputation & Trust** | OpenSSF Scorecard rating, npm package legitimacy, security posture | ⚡ Availability: Standard | User trust erosion, adoption reduction |
| **EP API Access & Availability** | Connection to European Parliament Open Data API | ⚡ Availability: Moderate | Service disruption, rate limit exhaustion |
| **npm Package Distribution** | Package integrity, version control, download statistics | 🔒 Integrity: Moderate | Malware distribution, user impact |
| **Audit Trail & Logging** | Structured logs, security event records | 🔒 Integrity: Moderate | Non-repudiation loss, incident investigation failure |

### **💎 Crown Jewel Analysis**

```mermaid
mindmap
  root((🏛️ EP MCP<br/>Crown Jewels))
    🔒 EP Parliamentary<br/>Data Integrity
      Voting Records
      MEP Profiles
      Plenary Documents
      Committee Assignments
      GDPR Personal Data
    📦 Source Code &<br/>Build Pipeline
      TypeScript Source
      GitHub Actions
      SLSA L3 Provenance
      npm Publishing
      Dependency Chain
    🛡️ Service<br/>Reputation & Trust
      OpenSSF Score 9.4+
      Security Badges
      npm Download Stats
      Community Trust
      Transparent Security
    🌐 EP API Access &<br/>Availability
      Rate Limit Quota
      API Response Time
      Connection Integrity
      HTTPS/TLS Security
      Failover Strategy
```

### **🛡️ Crown Jewel Protection Strategies**

| Crown Jewel | Primary Threats | Protection Controls | Residual Risk |
|-------------|-----------------|---------------------|---------------|
| **EP Parliamentary Data Integrity** | T-1, T-2, S-2 | HTTPS/TLS, response validation, Zod schemas, cache TTL | Low |
| **Source Code & Build Pipeline** | T-2, T-3, S-4 | SLSA Level 3, branch protection, GPG signing, Dependabot | Low-Medium |
| **Service Reputation & Trust** | All categories | OpenSSF Scorecard monitoring, security badges, transparent documentation | Low |
| **EP API Access & Availability** | D-1, D-2, S-2 | Rate limiting, retry logic, circuit breaker, HTTPS verification | Medium |
| **npm Package Distribution** | S-3, S-4, T-2 | Official package name ownership, npm 2FA, SBOM, npm provenance | Low-Medium |
| **Audit Trail & Logging** | R-1, R-2, R-3 | Structured stderr logging, immutable logs, timestamp integrity | Low |

---

## 🎭 STRIDE Threat Analysis

### **S — Spoofing**

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| S-1 | Malicious MCP client impersonation | MCP Transport | Low | Medium | Low | stdio transport limits to local process |
| S-2 | EP API response spoofing (MITM) | API Client | Low | High | Medium | HTTPS/TLS for all API communication |
| S-3 | npm package name squatting | Distribution | Low | High | Medium | Official package name, npm 2FA publishing |
| S-4 | Supply chain package substitution | Dependencies | Medium | High | High | SLSA Level 3 provenance, lockfile pinning |

### **T — Tampering**

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| T-1 | API response manipulation | API Client | Low | High | Medium | HTTPS integrity, response validation |
| T-2 | Dependency injection via compromised package | Supply Chain | Medium | Critical | High | Dependabot, npm audit, SBOM tracking |
| T-3 | Build artifact tampering | CI/CD | Low | Critical | Medium | SLSA Level 3 attestations |
| T-4 | Configuration manipulation | Runtime | Low | Medium | Low | Environment variable validation |

### **R — Repudiation**

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| R-1 | Untracked tool invocations | MCP Server | Medium | Medium | Medium | Structured audit logging (stderr) |
| R-2 | Unsigned commits in source | Source Code | Low | Medium | Low | GPG signing, branch protection |
| R-3 | Unattributed data access | API Client | Low | Low | Low | Request logging with timestamps |

### **I — Information Disclosure**

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| I-1 | Verbose error messages exposing internals | Error Handling | Medium | Medium | Medium | Sanitized error responses |
| I-2 | Stack traces in production | Runtime | Medium | Low | Low | Production error handling |
| I-3 | API keys in logs | Logging | Low | High | Medium | No API keys required (public API) |
| I-4 | Sensitive data in cached responses | Caching | Low | Low | Low | Public data only, TTL-based cache |

### **D — Denial of Service**

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| D-1 | EP API rate limit exhaustion | API Client | Medium | Medium | Medium | Client-side rate limiting |
| D-2 | Memory exhaustion via large responses | Runtime | Low | High | Medium | Response size limits |
| D-3 | Recursive/nested tool calls | MCP Server | Low | Medium | Low | Call depth limits |
| D-4 | ReDoS via crafted input | Input Validation | Low | Medium | Low | Zod schema validation (no regex) |

### **E — Elevation of Privilege**

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| E-1 | MCP tool parameter injection | Input Handling | Medium | Medium | Medium | Zod schema validation for all inputs |
| E-2 | Prototype pollution via JSON parsing | Runtime | Low | High | Medium | Safe JSON parsing, TypeScript strict |
| E-3 | Path traversal in document search | Tools | Low | Medium | Low | Input sanitization, no filesystem access |
| E-4 | Command injection via tool parameters | MCP Server | Low | Critical | Medium | No shell execution, parameterized APIs |

---

## 🤖 OWASP LLM Top 10 (2025) — EP MCP Server Mapping

This section maps the [OWASP LLM Top 10 (2025)](https://owasp.org/www-project-top-10-for-large-language-model-applications/) to the European Parliament MCP Server architecture, identifying applicable threats and gaps beyond traditional STRIDE analysis. Per the [Hack23 OWASP LLM Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/OWASP_LLM_Security_Policy.md), all MCP servers must assess LLM-specific attack vectors.

### LLM Threat Matrix

| LLM-ID | OWASP LLM Top 10 (2025) | Applicability to EP MCP | Threat IDs | Current Controls | Residual Risk |
|--------|-------------------------|-------------------------|------------|------------------|---------------|
| **LLM01** | **Prompt Injection** | ⚠️ **High Risk** — Indirect prompt injection via EP API response payloads (e.g., malicious text in procedure titles, speech transcripts, committee reports that the host LLM treats as instructions: "Ignore previous instructions and...") | **L-1** (new) | ✅ Tool result schema documentation<br/>ℹ️ Zod validates **structure only**, NOT semantic content — injection payloads in valid string fields pass through unmodified<br/>⚠️ Host-LLM responsibility (sanitize/sandbox tool-result text before treating as instructions)<br/>⚠️ No server-side content sanitization (intentional: out-of-scope per MCP spec) | **Medium**<br/>_(Host-LLM boundary defense required)_ |
| **LLM02** | **Sensitive Information Disclosure** | ⚠️ **Medium Risk** — System-prompt or tool-schema leakage through verbose error messages, stack traces in production logs | I-1, I-2 (existing) | ✅ Sanitized error responses<br/>⚠️ Partial production log review<br/>✅ No secrets in tool descriptions | **Low**<br/>_(Partial mitigation via I-1/I-2)_ |
| **LLM03** | **Supply Chain** | ⚠️ **High Risk** — Compromised npm dependencies containing LLM-targeted backdoors (e.g., AI-generated obfuscated malware) | T-2, S-4 (existing) | ✅ Dependabot + SLSA Level 3<br/>✅ SBOM tracking<br/>✅ npm audit + Snyk | **Medium**<br/>_(Covered by existing T-2/S-4 controls)_ |
| **LLM04** | **Data and Model Poisoning** | ❌ **Not Applicable** — EP MCP Server does not train or fine-tune models; consumes pre-trained host LLMs only | N/A | N/A | **N/A** |
| **LLM05** | **Improper Output Handling** | ⚠️ **Medium Risk** — Host LLM rendering EP-sourced HTML/Markdown from tool results as instructions (e.g., malicious `<script>` in MEP bio, XSS in speech transcript) | **L-2** (new) | ⚠️ No server-side sanitization<br/>✅ Public EP data only<br/>⚠️ Host-LLM sanitization required | **Low-Medium**<br/>_(Trust boundary at LLM client)_ |
| **LLM06** | **Excessive Agency** | ⚠️ **High Risk** — Host LLM autonomously invoking high-volume tool chains (e.g., enumerating all 705 MEPs via `get_mep_details` in a loop) causing EP API quota exhaustion | **L-3** (new) | ✅ Token bucket rate limiter (100/min)<br/>⚠️ No per-session limits<br/>⚠️ No autonomous-agent detection | **Medium**<br/>_(Rate limiting mitigates but not agent-aware)_ |
| **LLM07** | **System Prompt Leakage** | ✅ **Not Applicable** — EP MCP Server has no system prompt; tool descriptions are public by design (open-source, MCP schema published) | N/A | N/A (intentional transparency) | **N/A**<br/>_(Tool schemas are public API surface)_ |
| **LLM08** | **Vector and Embedding Weaknesses** | ❌ **Not Applicable** — EP MCP Server does not implement vector databases, embeddings, or RAG pipelines | N/A | N/A | **N/A** |
| **LLM09** | **Misinformation** | ⚠️ **High Risk** — Host LLM hallucinating around real EP data + cache staleness amplifying outdated voting records as "current" (e.g., 15-min cache TTL + EP API delay = stale plenary results presented as real-time) | **L-4** (new) | ✅ 15-min cache TTL<br/>✅ EP API as source of truth<br/>⚠️ No cache-age metadata in responses<br/>⚠️ Host-LLM hallucination out of scope | **Low-Medium**<br/>_(EP data accuracy trust boundary)_ |
| **LLM10** | **Unbounded Consumption** | ⚠️ **Medium Risk** — Host LLM token-cost amplification (e.g., AI client invoking `get_all_generated_stats` returning 20k+ tokens → expensive LLM processing) | D-1, D-2 (existing) + **L-5** (new, token-cost focus) | ✅ Rate limiting (request-level)<br/>⚠️ No response-size budgeting for LLM tokens<br/>⚠️ No cost-estimation metadata | **Low-Medium**<br/>_(Response-size limits mitigate but no token budgeting)_ |

### New LLM-Class Threat Definitions

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| **L-1** | **Indirect Prompt Injection via EP API** | Tool Results | Medium | High | High | Document trust boundary: tool results are untrusted data for host LLM; no server-side content filtering (out of scope); host-LLM sanitization required per OWASP LLM01 |
| **L-2** | **Improper Output Handling (HTML/Markdown Injection)** | Tool Results | Low | Medium | Low-Medium | Public EP data only; XSS risk on host-LLM client (browser-based); server documents Markdown/HTML pass-through; host-client sanitization required |
| **L-3** | **Excessive Agency (Autonomous Agent Abuse)** | Rate Limiter | Medium | Medium | Medium | Token bucket (100/min) limits request rate; no per-session or per-agent quotas; future: adaptive rate limiting + agent fingerprinting |
| **L-4** | **Misinformation via Cache Staleness** | Cache Layer | Low | Medium | Low-Medium | 15-min TTL balances freshness vs. EP API load; no cache-age metadata in responses; future: add `cacheAge` field to tool results |
| **L-5** | **Unbounded Token-Cost Consumption** | API Client | Low | Medium | Low-Medium | Response-size limits (10MB) mitigate bandwidth DoS; no LLM token-cost budgeting; future: add token-count estimates to tool schemas |

### OWASP LLM → ISMS Policy Alignment

| OWASP LLM Risk | Hack23 ISMS Policy | Compliance Status |
|----------------|-------------------|-------------------|
| LLM01 Prompt Injection | [OWASP LLM Security Policy §4.1](https://github.com/Hack23/ISMS-PUBLIC/blob/main/OWASP_LLM_Security_Policy.md) — Tool description hardening | ✅ Documented trust boundary |
| LLM02 Info Disclosure | [Information Security Policy §3.2](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Data classification | ✅ Public data only (C: Public) |
| LLM03 Supply Chain | [Secure Development Policy §5](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — SLSA Level 3 | ✅ Full compliance |
| LLM05 Output Handling | [OWASP LLM Security Policy §4.3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/OWASP_LLM_Security_Policy.md) — Safe output encoding | ⚠️ Host-LLM responsibility |
| LLM06 Excessive Agency | [Access Control Policy §4](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) — Rate limiting | ✅ Token bucket enforced |
| LLM09 Misinformation | [Data Classification Policy §3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md) — Integrity (Moderate) | ✅ EP API as source of truth |
| LLM10 Unbounded Consumption | [Secure Development Policy §6.2](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — DoS prevention | ✅ Response-size limits |

---

## 🔌 MCP-Protocol-Specific Threats (2025–2026 Research)

This section catalogs threats specific to the Model Context Protocol (MCP) based on 2025–2026 security research, beyond generic web/API vulnerabilities. Per [Hack23 AI Policy §5](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) and [OWASP LLM Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/OWASP_LLM_Security_Policy.md), MCP servers must assess protocol-level attack vectors.

### MCP Threat Catalog

| ID | Threat | Component | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|------------|--------|------|------------|
| **M-1** | **Tool Poisoning (Malicious Tool Descriptions)** | MCP Tool Schema | ❌ N/A (first-party server) | N/A *(hypothetical: Critical)* | N/A | **Not applicable:** EP MCP Server is first-party (not third-party/untrusted). Tool descriptions authored in-repo, code-reviewed, signed via SLSA Level 3 provenance. Host-LLM trust boundary documented. *Hypothetical impact shown in italics to indicate exposure if the threat were applicable (e.g., if a third party forked and republished the package).* |
| **M-2** | **Indirect Prompt Injection via Tool Results** | Tool Result Payloads | Medium | High | Medium-High | EP API returns text containing "ignore previous instructions…" patterns → host-LLM treats as commands. **Mitigation:** Zod validates structure (not content); host-LLM responsibility per OWASP LLM01; server documents trust boundary; no server-side text sanitization (out of scope). |
| **M-3** | **Rug-Pull Tool Re-Definition (npm Package Update)** | npm Distribution | Low | Critical | Medium | npm package update silently changes tool semantics (e.g., `get_meps` → exfiltration). **Mitigation:** SemVer contract enforcement, CHANGELOG.md mandatory, SLSA provenance attestations, npm 2FA publishing, signed Git tags (GPG), community review window. |
| **M-4** | **Confused-Deputy via MCP Gateway** | Multi-Server Gateway | ❌ N/A (stdio, no gateway) | N/A *(hypothetical: High)* | N/A | When used behind multi-server MCP gateway, requests from Client A conflated with Client B. **Mitigation:** Stateless server design (no per-client identity assumed), audit logger captures `sessionId` (future), stdio isolation (single-process). Future: add session-isolation guidance for gateway deployments. |
| **M-5** | **Cross-Tool Data Leakage (Cache Pollution)** | LRU Cache | Low | Medium | Low | Tool A's cached output influencing Tool B via shared cache namespace. **Mitigation:** Per-tool cache namespacing (`cacheKey = toolName:params`), LRU eviction policy, 15-min TTL prevents long-lived pollution, immutable cache entries. |
| **M-6** | **Resource URI Scheme Abuse (Path Traversal)** | MCP Resources | Low | Medium | Low | `ep://` resource URIs used to traverse outside intended scope (e.g., `ep://../../etc/passwd`). **Mitigation:** Zod-validated URI patterns (`ep://{entity}/{id}`), no filesystem-backed resources (all HTTP-only), explicit resource schema constraints. |
| **M-7** | **Transport/Session ID Confusion** | stdio Transport | ❌ N/A (single-process stdio) | N/A *(hypothetical: Medium)* | N/A | stdio is single-process → inherently isolated. **Future risk:** HTTP/SSE transport (planned for v2.0) introduces session-management attack surface. **Mitigation:** Explicitly N/A for v1.x stdio; deferred to `FUTURE_THREAT_MODEL.md` for multi-session HTTP/SSE mode. |

### MCP Protocol Attack Vectors

| Attack Vector | Description | EP MCP Server Exposure | Current Mitigation | Residual Risk |
|---------------|-------------|------------------------|-------------------|---------------|
| **Malicious Tool Schema Injection** | Attacker publishes MCP server with tool descriptions containing prompt-injection payloads | ❌ **Not Exposed** — First-party server, not third-party marketplace | N/A (first-party trust model) | **N/A** |
| **Tool Result Content Injection** | Tool results contain adversarial text interpreted as instructions by host-LLM | ✅ **Exposed** — EP API returns user-generated content (speech transcripts, procedure titles) | ⚠️ Documented trust boundary; no server-side sanitization; host-LLM responsibility | **Medium** |
| **Semantic Tool Redefinition** | Package update changes tool behavior without schema change (e.g., `get_meps` → spy logic) | ✅ **Exposed** — npm distribution model allows silent updates | ✅ SemVer, CHANGELOG, SLSA attestations, community review | **Low-Medium** |
| **MCP Gateway Confused-Deputy** | Multi-server gateway routes request from Client A using identity/quota of Client B | ❌ **Not Exposed** — stdio transport (no gateway) | N/A (stdio isolation) | **N/A** (future: document gateway security) |
| **Cache Namespace Collision** | Attacker crafts Tool A params to pollute Tool B's cache namespace | ⚠️ **Partially Exposed** — Shared LRU cache across tools | ✅ Per-tool namespacing, immutable entries, 15-min TTL | **Low** |
| **Resource URI Directory Traversal** | `ep://../../../sensitive` path traversal in resource URIs | ⚠️ **Theoretically Exposed** — 9 `ep://` resources defined | ✅ Zod URI validation, no filesystem access, HTTP-only resources | **Low** |
| **Session Hijacking (HTTP/SSE)** | Attacker steals session token for HTTP-based MCP transport | ❌ **Not Exposed** — stdio only (no network transport) | N/A (stdio design) | **N/A** (future: v2.0 HTTP mode) |

### MCP-Specific ISMS Policy Alignment

| MCP Threat | Hack23 ISMS Policy | Compliance Status |
|------------|-------------------|-------------------|
| M-2 Indirect Prompt Injection | [OWASP LLM Security Policy §4.1](https://github.com/Hack23/ISMS-PUBLIC/blob/main/OWASP_LLM_Security_Policy.md) — Tool result trust boundary | ✅ Documented trust model |
| M-3 Rug-Pull Tool Redefinition | [Secure Development Policy §5.3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — Supply chain integrity | ✅ SLSA Level 3, SemVer, CHANGELOG |
| M-4 Confused-Deputy | [Access Control Policy §3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) — Session isolation | ✅ stdio isolation (N/A for v1.x) |
| M-5 Cross-Tool Data Leakage | [Data Classification Policy §4](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Data_Classification_Policy.md) — Data segregation | ✅ Per-tool cache namespacing |
| M-6 Resource URI Abuse | [Secure Development Policy §6.1](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — Input validation | ✅ Zod URI validation |

---

## 🎖️ MITRE ATT&CK Coverage Analysis

### **ATT&CK Coverage Heat Map by Tactic**

This heat map shows the relevance and coverage of MITRE ATT&CK tactics for the European Parliament MCP Server context. Each tactic is assessed for applicability and current security posture.

| Tactic | Coverage Status | Relevant Techniques | Priority | Notes |
|--------|----------------|---------------------|----------|-------|
| **🎯 Initial Access** | 🟢 High Coverage | T1190, T1195.002 | 🔴 Critical | Supply chain & MCP protocol entry points |
| **⚡ Execution** | 🟡 Medium Coverage | T1059 | 🟠 High | Limited - no direct shell execution |
| **🔄 Persistence** | 🟢 N/A (Not Applicable) | — | 🟢 Low | Stateless MCP server, no persistence |
| **🔺 Privilege Escalation** | 🟡 Medium Coverage | T1068 | 🟠 Medium | Prototype pollution, injection risks |
| **🛡️ Defense Evasion** | 🟢 High Coverage | T1027, T1562 | 🟠 High | Obfuscated dependencies, log suppression |
| **🔑 Credential Access** | 🟢 N/A (Not Applicable) | — | 🟢 Low | No credentials stored/managed |
| **🔍 Discovery** | 🟡 Medium Coverage | T1592 | 🟡 Medium | Information disclosure via errors |
| **↔️ Lateral Movement** | 🟢 N/A (Not Applicable) | — | 🟢 Low | Single-process stdio transport |
| **📦 Collection** | 🟢 High Coverage | T1530 | 🟠 Medium | Parliamentary data harvesting abuse |
| **📡 Command & Control** | 🟡 Medium Coverage | T1071 | 🟡 Medium | MCP protocol as C2 channel |
| **📤 Exfiltration** | 🟢 High Coverage | T1041 | 🟠 High | Parliamentary data exfiltration |
| **💥 Impact** | 🟢 High Coverage | T1498, T1485 | 🔴 Critical | DoS via rate exhaustion, data manipulation |

**Coverage Legend:**
- 🟢 **High Coverage:** Comprehensive mitigations implemented
- 🟡 **Medium Coverage:** Partial mitigations, monitoring in place
- 🔴 **Low Coverage:** Minimal mitigations, requires attention
- 🟢 **N/A:** Tactic not applicable to this architecture
## 🏗️ Architecture-Centric STRIDE Analysis

### **🌊 Data Flow Threat Surface**

```mermaid
sequenceDiagram
    participant AI as 🤖 AI Assistant<br/>(Claude/ChatGPT)
    participant MCP as 🔌 MCP Server<br/>(stdio transport)
    participant Cache as 💾 Cache Layer<br/>(LRU in-memory)
    participant RL as ⏱️ Rate Limiter<br/>(Token bucket)
    participant API as 🏛️ EP API<br/>(HTTPS)
    participant Log as 📋 Audit Logger<br/>(stderr)

    Note over AI,MCP: 🎭 S-1: MCP client spoofing<br/>🛡️ Mitigation: stdio isolation
    AI->>MCP: Tool call request (JSON-RPC)
    Note over MCP: 🎭 E-1: Parameter injection<br/>🛡️ Mitigation: Zod validation
    
    MCP->>Log: Log request (structured)
    Note over Log: 🎭 R-1: Non-repudiation<br/>🛡️ Mitigation: Immutable stderr
    
    MCP->>Cache: Check cache
    alt Cache Hit
        Cache-->>MCP: Cached data
        Note over Cache: 🎭 I-4: Stale data exposure<br/>🛡️ Mitigation: TTL expiration
    else Cache Miss
        MCP->>RL: Check rate limit
        Note over RL: 🎭 D-1: Rate exhaustion<br/>🛡️ Mitigation: Token bucket
        alt Rate OK
            RL-->>MCP: Allow
            Note over MCP,API: 🎭 S-2: MITM attack<br/>🛡️ Mitigation: HTTPS/TLS 1.3
            MCP->>API: GET /meps (HTTPS)
            Note over API: 🎭 T-1: Response tampering<br/>🛡️ Mitigation: TLS integrity
            API-->>MCP: JSON response
            MCP->>MCP: Validate response (Zod)
            Note over MCP: 🎭 E-2: Prototype pollution<br/>🛡️ Mitigation: TypeScript strict
            MCP->>Cache: Store response
        else Rate Exceeded
            RL-->>MCP: Deny
            Note over MCP: 🎭 D-1: DoS protection<br/>✅ Request rejected
        end
    end
    
    Note over MCP: 🎭 I-1: Error info leak<br/>🛡️ Mitigation: Sanitized errors
    MCP-->>AI: Tool response
    MCP->>Log: Log response (structured)
```

### **🔍 STRIDE per Component Analysis**

#### **Component 1: MCP Server Core (Tool Dispatcher & Request Handler)**

| STRIDE | Threat | Attack Vector | Mitigation | Status |
|--------|--------|---------------|------------|--------|
| **S** | Client impersonation through stdio hijacking | Malicious process capturing stdio streams | stdio transport limits to parent process | ✅ Inherent |
| **T** | Tool invocation manipulation | Modified JSON-RPC request parameters | Zod schema validation on all inputs | ✅ Active |
| **R** | Untracked tool calls | Missing audit trail for debugging | Structured stderr logging (JSON format) | ✅ Active |
| **I** | Stack trace exposure in errors | Production error messages revealing code structure | Sanitized error responses to AI client | ⚠️ Partial |
| **D** | Recursive tool calls causing OOM | AI assistant invoking tools in infinite loop | Call depth tracking, memory monitoring | ⚠️ Future |
| **E** | JSON-RPC protocol exploitation | Crafted JSON-RPC bypassing validation | TypeScript strict mode, Zod schemas | ✅ Active |

#### **Component 2: EP API Client (HTTP Client & Response Parser)**

| STRIDE | Threat | Attack Vector | Mitigation | Status |
|--------|--------|---------------|------------|--------|
| **S** | EP API response spoofing | MITM attacker injecting false EP data | HTTPS/TLS 1.3 with certificate validation | ✅ Active |
| **T** | API response manipulation | TLS downgrade or compromised proxy | Strict TLS configuration, no HTTP fallback | ✅ Active |
| **R** | Unlogged API requests | Missing request/response audit trail | Structured logging for all API interactions | ✅ Active |
| **I** | API error details in client logs | EP API returning sensitive error messages | Sanitize EP API errors before logging | ⚠️ Partial |
| **D** | API rate limit exhaustion | Excessive requests overwhelming EP API | Client-side rate limiting (token bucket) | ✅ Active |
| **E** | Malicious redirect exploitation | EP API sending redirect to attacker domain | No automatic redirects, validate URLs | ✅ Active |

#### **Component 3: Cache Layer (In-Memory LRU Cache)**

| STRIDE | Threat | Attack Vector | Mitigation | Status |
|--------|--------|---------------|------------|--------|
| **S** | Cache poisoning with fake data | Attacker injecting malicious cache entries | Cache only validated API responses | ✅ Active |
| **T** | Cached data tampering | Memory corruption or external modification | Immutable cache entries, process isolation | ✅ Inherent |
| **R** | Cache operations not logged | Missing visibility into cache hits/misses | Cache statistics in audit logs | ⚠️ Future |
| **I** | Sensitive data in cache dumps | Memory dumps exposing cached MEP data | Public data only, no PII in cache keys | ✅ Inherent |
| **D** | Memory exhaustion via cache growth | Unbounded cache causing OOM | LRU eviction policy, max size limit | ✅ Active |
| **E** | Cache timing attacks | Inferring data presence via response time | Constant-time cache lookups (not security critical) | ❌ Accepted |

#### **Component 4: Rate Limiter (Token Bucket Algorithm)**

| STRIDE | Threat | Attack Vector | Mitigation | Status |
|--------|--------|---------------|------------|--------|
| **S** | Rate limit bypass | Attacker spoofing source to reset limits | Process-level rate limiting (stdio isolation) | ✅ Inherent |
| **T** | Rate limit configuration tampering | Modified rate limits allowing excess requests | Immutable configuration, validated env vars | ✅ Active |
| **R** | Rate limit violations unlogged | Missing audit trail for throttling events | Log all rate limit denials with timestamps | ✅ Active |
| **I** | Rate limit details exposure | Attacker learning rate limits via probing | No rate limit details in error messages | ✅ Active |
| **D** | Rate limiter resource exhaustion | Token bucket state consuming excessive memory | Fixed-size token bucket, constant memory | ✅ Active |
| **E** | Race condition in rate checks | Concurrent requests bypassing rate limits | Atomic token bucket operations | ✅ Active |

#### **Component 5: Audit Logger (Structured stderr Logging)**

| STRIDE | Threat | Attack Vector | Mitigation | Status |
|--------|--------|---------------|------------|--------|
| **S** | Log injection attacks | Attacker injecting fake log entries via user input | Structured JSON logging, no string interpolation | ✅ Active |
| **T** | Log tampering | Attacker modifying stderr logs post-facto | Immutable stderr stream, external log aggregation | ✅ Recommended |
| **R** | Log repudiation | Attacker denying logged actions | Timestamps (ISO 8601), request IDs, immutable stderr | ✅ Active |
| **I** | Sensitive data in logs | PII or credentials logged inadvertently | Sanitize user input, no API keys (public API) | ✅ Active |
| **D** | Log flooding DoS | Excessive logging consuming disk/bandwidth | Rate limit log output, log level filtering | ⚠️ Future |
| **E** | Log analysis exploitation | Attacker using logs to map system internals | Generic log messages, no internal implementation details | ⚠️ Partial |

#### **Component 6: npm Package Distribution (package.json & dist/)**

| STRIDE | Threat | Attack Vector | Mitigation | Status |
|--------|--------|---------------|------------|--------|
| **S** | npm package name squatting | Attacker publishing `european-parliament-server` (typo) | Official `european-parliament-mcp-server` package name ownership, npm 2FA-protected publisher account | ✅ Active |
| **T** | Build artifact injection | Malicious code in `dist/` not matching source | SLSA Level 3 provenance, reproducible builds | ✅ Active |
| **R** | Unsigned package versions | Unverifiable package authorship | npm provenance attestations, 2FA publishing | ✅ Active |
| **I** | Source code exposure (non-issue) | Full source code visible in npm package | Intentional: open source transparency | ✅ Accepted |
| **D** | npm registry DoS | npm registry unavailable during installation | Use npm mirrors, cache dependencies locally | ❌ External |
| **E** | Dependency confusion attack | Internal package name colliding with public npm | No private dependencies, unique public package names | ✅ Inherent |

---

## 🏗️ Architecture-Aligned STRIDE — Per-Component Refresh

This section provides a **component-by-component STRIDE refresh** aligned with the C4 Component Diagram in [ARCHITECTURE.md](ARCHITECTURE.md). Each row represents a concrete architectural component from the `src/` codebase, cross-referenced to existing STRIDE threat IDs.

### EP Sub-Clients (9 Components)

| Component | Spoofing | Tampering | Repudiation | Info Disc | DoS | EoP | Linked IDs |
|-----------|----------|-----------|-------------|-----------|-----|-----|------------|
| **`baseClient.ts`** | Adequate (S-2: HTTPS/TLS) | Adequate (T-1: TLS integrity) | Adequate (R-3: logged) | Adequate (I-3: no keys) | Adequate (D-1: rate limited) | Adequate (E-1: Zod) | S-2, T-1, R-3, I-3, D-1, E-1 |
| **`mepClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Partial (I-1: MEP PII in errors) | Adequate (D-1) | Adequate (E-1) | S-2, T-1, R-3, I-1, D-1, E-1 |
| **`plenaryClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Adequate (I-4: public data) | Adequate (D-1, D-2: size limits) | Adequate (E-1) | S-2, T-1, R-3, I-4, D-1, D-2, E-1 |
| **`documentClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Adequate (I-4) | Adequate (D-2: 10MB limit) | Adequate (E-1, E-3: no path traversal) | S-2, T-1, R-3, I-4, D-2, E-1, E-3 |
| **`legislativeClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Adequate (I-4) | Adequate (D-1) | Adequate (E-1) | S-2, T-1, R-3, I-4, D-1, E-1 |
| **`committeeClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Adequate (I-4) | Adequate (D-1) | Adequate (E-1) | S-2, T-1, R-3, I-4, D-1, E-1 |
| **`questionClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Adequate (I-4) | Adequate (D-1) | Adequate (E-1) | S-2, T-1, R-3, I-4, D-1, E-1 |
| **`votingClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Adequate (I-4) | Adequate (D-1) | Adequate (E-1) | S-2, T-1, R-3, I-4, D-1, E-1 |
| **`vocabularyClient.ts`** | Adequate (S-2) | Adequate (T-1) | Adequate (R-3) | Adequate (I-4) | Adequate (D-1) | Adequate (E-1) | S-2, T-1, R-3, I-4, D-1, E-1 |

### Core Infrastructure Components

| Component | Spoofing | Tampering | Repudiation | Info Disc | DoS | EoP | Linked IDs |
|-----------|----------|-----------|-------------|-----------|-----|-----|------------|
| **DI Container** (`src/di/`) | N/A (internal) | Adequate (T-4: validated config) | N/A | Adequate (I-2: no secrets) | N/A | Adequate (E-2: TypeScript strict) | T-4, I-2, E-2 |
| **MetricResult Wrapper** | N/A | N/A | Adequate (R-1: logged) | Adequate (I-1: sanitized) | N/A | N/A | R-1, I-1 |
| **Branded Types (Zod)** | N/A | Adequate (T-1: validated) | N/A | N/A | Adequate (D-4: no ReDoS) | Adequate (E-1: strict schemas) | T-1, D-4, E-1 |
| **LruCache** (`src/cache/`) | N/A | Adequate (immutable entries) | Partial (R-1: cache ops not logged) | Adequate (I-4: public data) | Adequate (D-2: max size) | N/A | R-1, I-4, D-2 |
| **RateLimiter** (`src/utils/rateLimiter.ts`) | Adequate (S-1: stdio isolation) | Adequate (T-4: immutable config) | Adequate (R-1: violations logged) | Adequate (I-1: no details in errors) | Adequate (D-1: token bucket) | Adequate (E-1: atomic ops) | S-1, T-4, R-1, I-1, D-1, E-1 |
| **AuditSink** (`src/utils/auditLogger.ts`) | Adequate (S-1: stderr isolation) | Adequate (immutable stderr) | Adequate (R-1: ISO 8601 timestamps) | Partial (I-1: PII sanitization) | Partial (future: log flooding) | Adequate (E-1: structured JSON) | S-1, R-1, I-1, E-1 |

### Coverage Summary

| STRIDE Category | Components w/ Adequate Coverage | Components w/ Partial Coverage | Components w/ N/A |
|-----------------|--------------------------------|-------------------------------|-------------------|
| **Spoofing** | 11/15 (73%) | 0 | 4 (internal-only) |
| **Tampering** | 13/15 (87%) | 0 | 2 |
| **Repudiation** | 11/15 (73%) | 2 (cache ops, log flooding) | 2 |
| **Info Disclosure** | 13/15 (87%) | 2 (MEP PII in errors, PII sanitization) | 0 |
| **DoS** | 12/15 (80%) | 1 (log flooding) | 2 |
| **EoP** | 13/15 (87%) | 0 | 2 |

**Key Gaps:**
- **Repudiation (Partial):** LRU cache operations (hits/misses) not logged → future MetricsService integration
- **Info Disclosure (Partial):** MEP personal data in error messages (I-1) → enhanced error sanitization
- **DoS (Partial):** No log-flooding protection → future rate limiting for audit events

---

## 🎖️ MITRE ATT&CK Mapping

---

### **ATT&CK → Security Control Mitigation Mapping**

Comprehensive mapping of MITRE ATT&CK techniques to implemented security controls for the European Parliament MCP Server.

| Technique ID | Technique Name | Security Control | Implementation | Effectiveness |
|-------------|----------------|------------------|----------------|---------------|
| **T1195.002** | Supply Chain Compromise: Software Supply Chain | Dependabot + SLSA Level 3 + SBOM | Automated vulnerability scanning, provenance attestations, CycloneDX SBOM generation | 🟢 High (95%) |
| **T1059** | Command and Scripting Interpreter | No shell execution policy | TypeScript/Node.js without child_process, strict input validation | 🟢 High (98%) |
| **T1190** | Exploit Public-Facing Application | Zod schema validation + rate limiting | Strict input validation for all MCP tool parameters, client-side rate limits | 🟢 High (90%) |
| **T1557** | Adversary-in-the-Middle | HTTPS/TLS 1.3 for EP API | Enforced TLS for all EP API requests, certificate validation | 🟢 High (95%) |
| **T1498** | Network Denial of Service | Rate limiting + response size limits | Client-side rate limiter, 10MB response cap, timeout controls | 🟡 Medium (75%) |
| **T1027** | Obfuscated Files or Information | SLSA provenance + npm audit | Build attestations, integrity verification, transparency logs | 🟢 High (85%) |
| **T1071** | Application Layer Protocol | stdio transport isolation | MCP protocol limited to stdio, no network exposure | 🟢 High (90%) |
| **T1592** | Gather Victim Host Information | Error sanitization + structured logging | Production error handlers, no stack traces to clients | 🟡 Medium (70%) |
| **T1068** | Exploitation for Privilege Escalation | TypeScript strict mode + safe JSON parsing | Prototype pollution prevention, type safety | 🟢 High (85%) |
| **T1562** | Impair Defenses | Immutable logging + monitoring | Audit logs via stderr, OpenSSF Scorecard monitoring | 🟢 High (80%) |
| **T1530** | Data from Cloud Storage Object | Rate limiting + usage analytics | Monitor bulk data requests, pattern-based anomaly detection | 🟡 Medium (65%) |
| **T1041** | Exfiltration Over C2 Channel | stdio isolation + data flow monitoring | No outbound network from MCP server, logging all tool invocations | 🟢 High (80%) |
| **T1485** | Data Destruction | Integrity validation + EP API trust | Response validation against expected schemas, EP API as source of truth | 🟡 Medium (70%) |

**Effectiveness Scale:**
- 🟢 **High (>80%):** Control effectively mitigates technique
- 🟡 **Medium (60-80%):** Partial mitigation, residual risk remains
- 🔴 **Low (<60%):** Limited mitigation, requires enhancement

---

### **ATT&CK Navigator Visualization**

To visualize this threat landscape comprehensively, the European Parliament MCP Server team maintains an **ATT&CK Navigator layer** with:

- **Highlighted techniques:** All 13 relevant techniques color-coded by coverage
- **Metadata annotations:** Links to STRIDE threat IDs and security controls
- **Score-based heatmap:** Effectiveness ratings (0-100) for each technique
- **Filter views:** Supply Chain, MCP Protocol, API Layer, Runtime

**📊 ATT&CK Navigator Layer JSON:** The layer JSON is a planned deliverable and will be added in a future release under a `docs/threat-model/` directory once the visualization is finalized; it is not yet available in this repository.

**🔗 Online Visualization:** Use [MITRE ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) to load the layer JSON for interactive exploration.

**Recommendation:** Review this mapping **quarterly** and after major architecture changes to ensure continued alignment with evolving threat intelligence.

---

## 🔗 Kill Chain Disruption Analysis

This section maps the **Cyber Kill Chain** phases to the EP MCP Server's defensive controls and detection capabilities, as required by [Hack23 AB Threat Modeling Policy §4.1](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md). Each phase identifies how an attacker progresses and where our controls disrupt the chain.

### **Kill Chain Phase → Defensive Control → Detection Mapping**

| Kill Chain Phase | Attack Activity (EP MCP Context) | Defensive Controls | Detection Mechanisms | Disruption Effectiveness |
|-----------------|----------------------------------|-------------------|---------------------|--------------------------|
| **1️⃣ Reconnaissance** | Attacker probes MCP tool schemas, EP API endpoints, npm package metadata, GitHub repo structure | • Public data only (no sensitive info to discover)<br/>• Generic error messages (I-1 mitigation)<br/>• No version info in runtime errors | • GitHub traffic analytics<br/>• npm download pattern monitoring<br/>• Unusual MCP tool enumeration logging | 🟡 **Medium** — Public project limits reconnaissance value |
| **2️⃣ Weaponization** | Attacker crafts malicious npm package, prepares prototype pollution payload, or creates typosquatting package | • SLSA Level 3 provenance verification<br/>• Package-lock.json integrity<br/>• No private dependencies | • Dependabot new vulnerability alerts<br/>• npm audit CI/CD gate<br/>• OpenSSF Scorecard monitoring | 🟢 **High** — Supply chain controls are comprehensive |
| **3️⃣ Delivery** | Attacker publishes compromised dependency, sends phishing to maintainer, or submits malicious PR | • npm 2FA required for publishing<br/>• Branch protection rules<br/>• CODEOWNERS enforcement<br/>• GPG commit signing | • GitHub security alerts<br/>• PR review requirements<br/>• npm provenance verification<br/>• Snyk continuous monitoring | 🟢 **High** — Multi-layer delivery prevention |
| **4️⃣ Exploitation** | Attacker exploits Zod validation bypass, prototype pollution, or MCP parameter injection | • Zod schema validation on all inputs (E-1)<br/>• TypeScript strict mode (E-2)<br/>• No shell execution (E-4)<br/>• Safe JSON parsing | • Zod validation error logging<br/>• TypeScript type check failures<br/>• Runtime exception monitoring<br/>• stderr audit logs | 🟢 **High** — Defense-in-depth input validation |
| **5️⃣ Installation** | Attacker attempts persistence via modified cache entries, altered build artifacts, or backdoored dependency | • Stateless MCP server (no persistence)<br/>• Immutable cache entries<br/>• SLSA build attestations<br/>• Process isolation (stdio) | • SLSA provenance signature mismatch<br/>• Build artifact hash verification<br/>• npm package content diff | 🟢 **High** — Stateless architecture prevents installation |
| **6️⃣ Command & Control** | Attacker uses compromised MCP server to exfiltrate data or inject false responses to AI assistants | • stdio transport isolation (no network)<br/>• No outbound connections from MCP server<br/>• Rate limiting on all tool calls | • Audit logging of all tool invocations<br/>• Response size anomaly detection<br/>• Data flow monitoring | 🟢 **High** — stdio isolation prevents C2 channels |
| **7️⃣ Actions on Objectives** | Attacker manipulates parliamentary data, harvests MEP data, or disrupts service availability | • EP API as source of truth (integrity)<br/>• Response validation via Zod<br/>• Rate limiting prevents bulk harvesting<br/>• GDPR-aware data minimization | • Data integrity checks against EP API<br/>• Bulk access pattern detection<br/>• Rate limit violation alerts<br/>• OpenSSF Scorecard degradation | 🟡 **Medium** — Continuous monitoring required |

### **Kill Chain Disruption Visualization**

```mermaid
graph LR
    R[1️⃣ Recon] -->|Public project| W[2️⃣ Weaponize]
    W -->|Supply chain| D[3️⃣ Deliver]
    D -->|Malicious code| E[4️⃣ Exploit]
    E -->|Code execution| I[5️⃣ Install]
    I -->|Persistence| C[6️⃣ C2]
    C -->|Control| A[7️⃣ Actions]

    R -.->|🛡️ Generic errors| RD[Disrupted]
    W -.->|🛡️ SLSA + Dependabot| WD[Disrupted]
    D -.->|🛡️ 2FA + Branch protection| DD[Disrupted]
    E -.->|🛡️ Zod + TypeScript strict| ED[Disrupted]
    I -.->|🛡️ Stateless architecture| ID[Disrupted]
    C -.->|🛡️ stdio isolation| CD[Disrupted]
    A -.->|🛡️ EP API integrity| AD[Monitored]

    style RD fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style WD fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style DD fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style ED fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style ID fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style CD fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style AD fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

```

**Key Insight:** The EP MCP Server's **stateless stdio architecture** provides inherent disruption at Kill Chain phases 5 (Installation) and 6 (C2), while **SLSA Level 3 + Dependabot** provide strong disruption at phases 2-3. The primary residual risk is at phase 7 (Actions on Objectives) where continuous monitoring is essential.

---

## 👥 Threat Agent Classification

Understanding potential adversaries is critical for proportionate security investment. This section profiles threat actors relevant to the European Parliament MCP Server based on motivation, capability, and likely attack vectors.

### **Nation-State Actors**

**Profile:**
- **🎯 Motivation:** Intelligence gathering on European parliamentary activities, electoral interference, political influence operations
- **💪 Capability Level:** 🔴 **Advanced (Nation-State Resources)**
  - Sophisticated supply chain attacks (e.g., SolarWinds-style compromise)
  - Zero-day exploits in Node.js/TypeScript ecosystem
  - Advanced persistent threats (APT) with long-term objectives
- **🎭 Likely Tactics:**
  - T1195.002: Supply chain compromise of npm dependencies
  - T1557: MITM attacks on EP API communications
  - T1530: Systematic harvesting of MEP voting patterns and committee data
- **🔴 Priority:** High — Due to potential for sophisticated, persistent attacks
- **🛡️ Mitigation Focus:** SLSA Level 3 provenance, dependency integrity, EP API transport security

---

### **Hacktivist Groups**

**Profile:**
- **🎯 Motivation:** Political activism, transparency advocacy, anti-establishment campaigns, public disclosure of parliamentary data
- **💪 Capability Level:** 🟡 **Intermediate (Skilled Individuals/Small Teams)**
  - Script-based attacks, publicly available exploit tools
  - Social engineering of developers and contributors
  - Website defacement, data leaks for publicity
- **🎭 Likely Tactics:**
  - T1190: Exploit MCP tool parameter injection vulnerabilities
  - T1498: DDoS via API rate exhaustion
  - T1485: Data manipulation to spread disinformation
- **🟠 Priority:** Medium — Capable of opportunistic attacks but limited persistence
- **🛡️ Mitigation Focus:** Input validation (Zod schemas), rate limiting, public vulnerability disclosure program

---

### **Insider Threats (Supply Chain)**

**Profile:**
- **🎯 Motivation:** Compromised developer account, malicious open-source contributor, disgruntled maintainer
- **💪 Capability Level:** 🟠 **High (Trusted Access)**
  - Direct commit access or pull request approval
  - Knowledge of codebase internals and security controls
  - Ability to introduce subtle vulnerabilities
- **🎭 Likely Tactics:**
  - T1195.002: Malicious dependency substitution or backdoor insertion
  - T1027: Obfuscated malicious code in commits
  - T1562: Disabling security controls (e.g., test bypasses)
- **🔴 Priority:** High — Trusted position enables high-impact attacks
- **🛡️ Mitigation Focus:** Branch protection, mandatory code review, GPG commit signing, SLSA attestations

---

### **Automated Threat Actors (Bots/Scrapers)**

**Profile:**
- **🎯 Motivation:** Bulk data harvesting, API abuse for commercial purposes, training dataset collection for AI models
- **💪 Capability Level:** 🟢 **Low (Automated Scripts)**
  - Mass automated requests via compromised MCP clients
  - Simple evasion techniques (rotating IPs, user agents)
  - No sophisticated exploit capability
- **🎭 Likely Tactics:**
  - T1498: API rate limit exhaustion via distributed requests
  - T1530: Bulk collection of parliamentary datasets
  - T1071: Abuse of MCP protocol for unauthorized access
- **🟡 Priority:** Medium — High volume but low sophistication
- **🛡️ Mitigation Focus:** Client-side rate limiting, usage analytics, anomaly detection

---

### **Competitor/Espionage Actors**

**Profile:**
- **🎯 Motivation:** Commercial intelligence gathering, competitive advantage in political consulting, lobbying intelligence
- **💪 Capability Level:** 🟡 **Intermediate to High**
  - Funded operations with technical capabilities
  - Targeted attacks on specific MEP data or committee information
  - Long-term systematic data collection
- **🎭 Likely Tactics:**
  - T1530: Systematic harvesting of EP voting records and attendance data
  - T1592: Reconnaissance via error message analysis
  - T1041: Exfiltration of aggregated parliamentary intelligence
- **🟠 Priority:** Medium — Targeted but not infrastructure-destructive
- **🛡️ Mitigation Focus:** Audit logging, data access pattern monitoring, request attribution

---

### **Threat Actor Priority Matrix**

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "quadrant1Fill": "#D32F2F",
    "quadrant2Fill": "#FF9800",
    "quadrant3Fill": "#4CAF50",
    "quadrant4Fill": "#1565C0",
    "quadrantTitleFill": "#ffffff",
    "quadrantPointFill": "#ffffff",
    "quadrantPointTextFill": "#ffffff",
    "quadrantXAxisTextFill": "#ffffff",
    "quadrantYAxisTextFill": "#ffffff"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 12,
    "titleFontSize": 20,
    "quadrantLabelFontSize": 16,
    "xAxisLabelFontSize": 14,
    "yAxisLabelFontSize": 14
  }
}}%%
quadrantChart
    title 🎯 Threat Actor Assessment — Capability vs Motivation
    x-axis Low Motivation --> High Motivation
    y-axis Low Capability --> High Capability
    quadrant-1 CRITICAL THREATS
    quadrant-2 HIGH-RISK ACTORS
    quadrant-3 OPPORTUNISTIC
    quadrant-4 PERSISTENT
    "🏴 Nation-State APT": [0.9, 0.95]
    "👤 Insider Threat": [0.7, 0.85]
    "💻 Hacktivist Groups": [0.8, 0.5]
    "🕵️ Competitor Espionage": [0.65, 0.6]
    "🤖 Automated Bots": [0.4, 0.2]
```

**Action Items by Actor:**
- **Nation-State:** Focus on supply chain integrity (SLSA Level 3, SBOM)
- **Hacktivist:** Strengthen input validation and public-facing security
- **Insider Threat:** Enforce code review, branch protection, audit trails
- **Automated Bots:** Implement robust rate limiting and anomaly detection
- **Competitor:** Monitor data access patterns, enhance logging

---

## 🌐 Current Threat Landscape

The European Parliament MCP Server operates within a dynamic threat environment shaped by geopolitical tensions, evolving attack techniques, and the strategic importance of parliamentary data. This section integrates **ENISA Threat Landscape 2024** findings with EP-specific context.

### **ENISA Threat Landscape 2024 — Top Threats Mapped to EP MCP Server**

| ENISA Threat | Relevance to EP MCP Server | Current Posture | Priority |
|--------------|---------------------------|----------------|----------|
| **🔒 Ransomware** | Low direct risk (no data persistence), but **supply chain ransomware** targeting npm dependencies could encrypt developer workstations | 🟢 Mitigated via SLSA Level 3, no critical data storage | 🟡 Medium |
| **🦠 Malware** | **High risk:** Malicious npm packages in dependency tree (e.g., typosquatting, compromised maintainer accounts) | 🟢 Mitigated via Dependabot, npm audit, OpenSSF Scorecard | 🔴 High |
| **🎣 Social Engineering** | **Developer phishing/account takeover** to inject malicious code or publish compromised npm versions | 🟡 Partial mitigation via 2FA, GPG signing | 🔴 High |
| **💾 Data Breaches** | **Parliamentary data integrity breach:** Manipulation of EP voting records, MEP personal data exposure (GDPR violation) | 🟡 Partial mitigation via HTTPS, response validation | 🟠 Medium-High |
| **☁️ DDoS** | **API exhaustion attacks** targeting EP Open Data API via MCP server abuse | 🟢 Mitigated via client-side rate limiting | 🟡 Medium |
| **📰 Disinformation** | **Data manipulation via compromised MCP server:** False parliamentary data fed to AI assistants, influencing political analysis | 🟡 Partial mitigation via integrity checks | 🔴 High |
| **⛓️ Supply Chain Attacks** | **Primary threat vector:** Compromised npm packages, malicious CI/CD pipeline modifications, SLSA bypass attempts | 🟢 Strong mitigation via SLSA Level 3, SBOM, Dependabot | 🔴 Critical |

---

### **EU Cyber Resilience Act (CRA) Context**

The **EU Cyber Resilience Act (Regulation (EU) 2024/2847)** imposes mandatory cybersecurity requirements for products with digital elements. The EP MCP Server, as an open-source component with parliamentary data access, falls under CRA scope:

- **📋 Vulnerability Disclosure:** Mandatory 24-hour reporting of actively exploited vulnerabilities to ENISA
- **📦 SBOM Requirements:** CycloneDX SBOM generation already implemented
- **🔄 Security Updates:** Commitment to timely patching (currently: critical <7 days, high <30 days)
- **🛡️ Default Security:** Secure-by-default configuration (no hardcoded credentials, HTTPS enforcement)

**CRA Compliance Status:** ✅ **Conforming** — See [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md) for detailed analysis

---

### **Parliamentary Data Threat Context**

The strategic value of European Parliament data creates unique threat scenarios:

1. **Electoral Interference (Nation-State):**
   - **Threat:** Manipulation of MEP voting records before elections to influence public perception
   - **Attack Vector:** Compromised MCP server returning altered roll-call vote data
   - **Impact:** Democratic integrity, electoral outcomes
   - **Mitigation:** EP API as single source of truth, response integrity validation

2. **GDPR-Protected MEP Data (Privacy Activists/Competitors):**
   - **Threat:** Bulk harvesting of MEP personal contact data, office locations, parliamentary group affiliations
   - **Attack Vector:** Automated MCP tool invocations to systematically collect MEP biographical data
   - **Impact:** GDPR Article 6 violation, privacy breach, potential harassment campaigns
   - **Mitigation:** Rate limiting, usage pattern monitoring, public data scope limitation

3. **Policy Intelligence (Lobbying/Espionage):**
   - **Threat:** Systematic collection of committee votes, amendments, and parliamentary questions for competitive intelligence
   - **Attack Vector:** Long-term MCP server abuse by competitor AI assistants
   - **Impact:** Unfair commercial advantage, policy prediction, lobbying strategy
   - **Mitigation:** Audit logging, anomaly detection, transparency about data sources

---

### **Emerging Threat Vectors (2024-2025)**

| Threat | Description | Likelihood | Impact |
|--------|-------------|------------|--------|
| **AI-Powered Supply Chain Attacks** | LLMs used to generate sophisticated obfuscated malware in npm packages | 🟡 Medium | 🔴 Critical |
| **MCP Protocol Exploitation** | Novel attacks targeting MCP stdio transport or tool parameter parsing | 🟡 Medium | 🟠 High |
| **Dependency Confusion 2.0** | Advanced typosquatting using AI-generated package names similar to `european-parliament-mcp-server` | 🟡 Medium | 🟠 High |
| **Deepfake Parliamentary Data** | AI-generated false EP datasets indistinguishable from legitimate data | 🟢 Low | 🔴 Critical |
| **Quantum-Resistant Cryptography Pressure** | Future requirement to migrate TLS to post-quantum algorithms | 🟢 Low (2025+) | 🟠 Medium |

---

## 🎬 Scenario-Centric Threat Modeling (EP-Specific)

This section applies scenario-based threat modeling to European Parliament-specific attack chains, providing actionable detection and response strategies.

---

### **Scenario 1: Parliamentary Data Manipulation Attack**

**🎯 Attack Objective:** Manipulate voting record data returned by MCP server to influence AI-assisted political analysis

**🎭 Threat Actor:** Nation-state actor or hacktivist group

**📊 Attack Chain:**

```mermaid
graph LR
    A[1️⃣ Compromise npm dependency] --> B[2️⃣ Inject response manipulation code]
    B --> C[3️⃣ MCP server returns altered vote data]
    C --> D[4️⃣ AI assistant provides false analysis]
    D --> E[5️⃣ Political decisions based on false data]
    
    style A fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style B fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style C fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style D fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style E fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

```

**Attack Steps:**
1. **Initial Compromise:** Attacker exploits vulnerability in transitive npm dependency (e.g., malicious `lodash` substitute)
2. **Code Injection:** Malicious code intercepts the `get_voting_records` MCP tool
3. **Data Manipulation:** Alters vote outcomes (e.g., changes "Against" to "For" for specific MEPs)
4. **Propagation:** AI assistant uses corrupted data to generate policy analysis
5. **Impact:** Political decisions, news articles, or research based on false parliamentary data

**🔍 Detection Indicators:**
- ✅ SLSA provenance verification failure
- ✅ npm audit alerts on compromised dependency
- ✅ Anomalous response size or schema validation errors
- ✅ OpenSSF Scorecard supply chain score degradation

**🛡️ Response Actions:**
1. **Immediate:** Quarantine affected npm package version
2. **Containment:** Revert to last known-good dependency lockfile
3. **Investigation:** Audit all tool invocations during compromise window
4. **Recovery:** Publish security advisory, coordinate with npm security team
5. **Prevention:** Enhance SBOM monitoring, implement runtime integrity checks

**📉 Risk Score:** 🔴 **Critical (9.0/10)** — High impact on democratic integrity

---

### **Scenario 2: MEP Personal Data Abuse (GDPR Violation)**

**🎯 Attack Objective:** Unauthorized bulk harvesting of MEP contact and personal data for commercial or political purposes

**🎭 Threat Actor:** Competitor intelligence firm or automated bot network

**📊 Attack Chain:**

```mermaid
graph LR
    A[1️⃣ Automated MCP client] --> B[2️⃣ Systematic MEP data queries]
    B --> C[3️⃣ Bulk export of GDPR-protected data]
    C --> D[4️⃣ Commercial database sale]
    D --> E[5️⃣ GDPR Article 6 violation]
    
    style A fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style B fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style C fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style D fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

    style E fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

```

**Attack Steps:**
1. **Reconnaissance:** Attacker identifies MCP tools `get_meps` and `get_mep_details` for biographical data (using `get_meps` to enumerate MEPs and `get_mep_details` to retrieve full profiles)
2. **Automation:** Script iterates through all 705 MEPs to harvest contact details, office locations, party affiliations
3. **Exfiltration:** Bulk collection of GDPR Article 9 special category data (political opinions)
4. **Monetization:** Sells MEP database to lobbying firms or political campaigns
5. **Legal Impact:** GDPR fine up to €20M or 4% of global turnover

**🔍 Detection Indicators:**
- ✅ Rate limiting threshold exceeded (>100 requests/hour)
- ✅ Sequential MEP ID enumeration pattern detected
- ✅ Bulk data access from single IP/client
- ✅ Unusual off-hours usage patterns

**🛡️ Response Actions:**
1. **Immediate:** Throttle client rate limits to 10 requests/minute
2. **Containment:** Implement CAPTCHA-style challenge for bulk requests
3. **Investigation:** Audit logs to identify compromised client identity
4. **Recovery:** Notify EP data protection officer, potential GDPR Article 33 notification
5. **Prevention:** Implement data minimization (limit biographical data scope)

**📉 Risk Score:** 🟠 **High (7.5/10)** — GDPR violation with significant financial penalties

---

### **Scenario 3: Electoral Influence via AI-Assisted Disinformation**

**🎯 Attack Objective:** Compromise MCP server to feed false parliamentary data to AI assistants used by journalists and researchers

**🎭 Threat Actor:** Nation-state APT targeting EU elections

**📊 Attack Chain:**

```mermaid
graph LR
    A[1️⃣ Supply chain compromise] --> B[2️⃣ Inject disinformation logic]
    B --> C[3️⃣ AI assistants use false data]
    C --> D[4️⃣ News articles published]
    D --> E[5️⃣ Electoral influence achieved]
    
    style A fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style B fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style C fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style D fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

    style E fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

```

**Attack Steps:**
1. **Pre-Election Timing:** 3 months before EU parliamentary elections, attacker compromises MCP server
2. **Targeted Manipulation:** Alters voting records for specific MEPs in swing districts
3. **AI Propagation:** Journalists using AI assistants (Claude, ChatGPT) cite false data
4. **Media Amplification:** News articles report fabricated voting patterns
5. **Electoral Impact:** Public perception shift influences voting behavior

**🔍 Detection Indicators:**
- ✅ Discrepancy between EP official portal and MCP server responses
- ✅ SLSA provenance verification failures
- ✅ Community reports of data inconsistencies
- ✅ Anomalous build artifacts in npm package

**🛡️ Response Actions:**
1. **Immediate:** Emergency npm package deprecation + public security advisory
2. **Containment:** Direct users to EP official API as alternative
3. **Investigation:** Forensic analysis of compromised build pipeline
4. **Recovery:** Restore from verified clean state, republish with enhanced attestations
5. **Prevention:** Implement EP API response checksums, real-time integrity monitoring

**📉 Risk Score:** 🔴 **Critical (9.5/10)** — Democratic process integrity threat

---

### **Scenario 4: Supply Chain Compromise of npm Package**

**🎯 Attack Objective:** Publish malicious version of `european-parliament-mcp-server` to npm registry

**🎭 Threat Actor:** Insider threat (compromised maintainer account)

**📊 Attack Chain:**

```mermaid
graph LR
    A[1️⃣ Maintainer account phishing] --> B[2️⃣ 2FA bypass via session hijacking]
    B --> C[3️⃣ Malicious npm publish]
    C --> D[4️⃣ Automatic updates infect users]
    D --> E[5️⃣ Widespread MCP server compromise]
    
    style A fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style B fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style C fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

    style D fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

    style E fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

```

**Attack Steps:**
1. **Social Engineering:** Attacker sends targeted phishing email to npm package maintainer
2. **Account Takeover:** Bypasses 2FA via browser session cookie theft
3. **Malicious Publish:** Publishes `european-parliament-mcp-server@3.1.4` with backdoor
4. **Auto-Update:** Users with `^3.1.0` in package.json automatically pull malicious version
5. **Backdoor Activation:** Malware exfiltrates API keys or injects false data

**🔍 Detection Indicators:**
- ✅ SLSA provenance signature mismatch
- ✅ npm package version published without corresponding GitHub release
- ✅ OpenSSF Scorecard token permissions alert
- ✅ Community reports of unexpected behavior

**🛡️ Response Actions:**
1. **Immediate:** npm unpublish malicious version (within 72-hour window)
2. **Containment:** Publish emergency patch version, notify users via GitHub Security Advisory
3. **Investigation:** Revoke compromised npm token, audit all recent publishes
4. **Recovery:** Reset maintainer credentials, enforce hardware 2FA
5. **Prevention:** Implement GitHub Actions OIDC publishing (no long-lived tokens)

**📉 Risk Score:** 🔴 **Critical (9.0/10)** — Supply chain attack with wide blast radius

---

### **Scenario 5: MCP Protocol Injection Attack**

**🎯 Attack Objective:** Exploit MCP tool parameter parsing to inject malicious JSON-RPC payloads

**🎭 Threat Actor:** Security researcher (white hat) or advanced persistent threat

**📊 Attack Chain:**

```mermaid
graph LR
    A[1️⃣ Craft malicious tool parameters] --> B[2️⃣ Exploit Zod schema weakness]
    B --> C[3️⃣ Inject code execution payload]
    C --> D[4️⃣ MCP server executes attacker code]
    D --> E[5️⃣ AI assistant compromise]
    
    style A fill:#ffa726,stroke:#b2741a,stroke-width:2px,color:#1f1f1f

    style B fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style C fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

    style D fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

    style E fill:#ef5350,stroke:#a73a38,stroke-width:2px,color:#ffffff

```

**Attack Steps:**
1. **Payload Crafting:** Attacker analyzes Zod schemas for `searchDocuments` tool
2. **Schema Bypass:** Finds edge case where deeply nested JSON evades validation
3. **Code Injection:** Injects prototype pollution payload via `__proto__` in parameters
4. **Execution:** Exploits TypeScript `any` type in error handler to gain code execution
5. **Persistence:** Modifies AI assistant behavior to exfiltrate user prompts

**🔍 Detection Indicators:**
- ✅ Zod validation errors with unusual parameter structures
- ✅ TypeScript strict mode violations (should not occur)
- ✅ stderr logs show unexpected JSON parsing errors
- ✅ Memory usage spikes during tool invocation

**🛡️ Response Actions:**
1. **Immediate:** Kill MCP server process, isolate affected AI assistant instance
2. **Containment:** Deploy emergency patch to harden Zod schemas
3. **Investigation:** Analyze parameter payloads, identify injection vector
4. **Recovery:** Publish CVE, coordinate disclosure with MCP protocol maintainers
5. **Prevention:** Fuzz testing of all MCP tool schemas, add runtime schema enforcement

**📉 Risk Score:** 🟠 **High (8.0/10)** — Novel MCP protocol exploit with AI assistant compromise

---

## 🔄 Continuous Validation & Assessment

Threat modeling is not a one-time activity but a **continuous process** that evolves with the system, threat landscape, and organizational maturity. This section defines the validation lifecycle for the European Parliament MCP Server threat model.

### **Threat Modeling Workshop Process**

Following [Hack23 AB Workshop Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md), the EP MCP Server employs a structured **7-phase workshop process**:

```mermaid
graph LR
    PRE[🔍 PRE<br/>Preparation] --> ENUM[📋 ENUM<br/>Enumeration]
    ENUM --> THREATS[⚠️ THREATS<br/>Identification]
    THREATS --> MAP[🗺️ MAP<br/>ATT&CK Mapping]
    MAP --> PLAN[📝 PLAN<br/>Mitigation]
    PLAN --> VALIDATE[✅ VALIDATE<br/>Verification]
    VALIDATE --> MONITOR[📊 MONITOR<br/>Continuous]
    MONITOR -.->|Next Cycle| PRE

    style PRE fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style ENUM fill:#2196F3,stroke:#1769aa,stroke-width:2px,color:#ffffff

    style THREATS fill:#FF9800,stroke:#b26a00,stroke-width:2px,color:#1a1a1a

    style MAP fill:#9C27B0,stroke:#6d1b7b,stroke-width:2px,color:#ffffff

    style PLAN fill:#F44336,stroke:#aa2e25,stroke-width:2px,color:#ffffff

    style VALIDATE fill:#00BCD4,stroke:#008394,stroke-width:2px,color:#ffffff

    style MONITOR fill:#795548,stroke:#543b32,stroke-width:2px,color:#ffffff

```

| Phase | Activities | EP MCP Server Focus | Output |
|-------|-----------|--------------------|---------| 
| **🔍 PRE** | Gather architecture docs, review previous findings, update scope | Review SECURITY_ARCHITECTURE.md, npm audit, Dependabot alerts | Updated scope definition, pre-read materials |
| **📋 ENUM** | Enumerate assets, trust boundaries, data flows | Map MCP tools, EP API endpoints, cache layer, stdio transport | Asset inventory, data flow diagrams |
| **⚠️ THREATS** | Apply STRIDE per component, identify new threats | Analyze 6 components × 6 STRIDE categories | Updated STRIDE threat tables |
| **🗺️ MAP** | Map threats to MITRE ATT&CK, ENISA TL 2024, Kill Chain | Update 13 ATT&CK technique mappings, kill chain disruption table | ATT&CK coverage heat map, kill chain analysis |
| **📝 PLAN** | Design mitigations, assign owners, set deadlines | Prioritize controls for supply chain, input validation, data integrity | Mitigation action items with owners |
| **✅ VALIDATE** | Test controls, verify SLSA attestations, review OpenSSF score | Run security tests, verify rate limiting, check SBOM | Validation report, control effectiveness metrics |
| **📊 MONITOR** | Track KPIs, review threat intelligence, schedule next cycle | Monitor OpenSSF Scorecard, Dependabot, npm audit, audit logs | KPI dashboard, next review date |

**🗓️ Cadence:**
- **Monthly:** Quick threat landscape review (30 minutes)
- **Quarterly:** Full threat model workshop (2-3 hours)
- **Annually:** Comprehensive threat model revision (full-day session)

**👥 Workshop Participants:**

| Role | Responsibility | Mandatory? |
|------|---------------|-----------|
| **Security Architect (CEO)** | Workshop facilitator, threat prioritization | ✅ Yes |
| **Lead Developer** | Technical feasibility of mitigations | ✅ Yes |
| **Product Owner** | Business impact assessment | ✅ Yes |
| **DevOps Engineer** | CI/CD security controls | 🟡 Recommended |
| **External Security Expert** | Independent threat assessment | 🟢 Annually |

---

### **Ad-Hoc Review Triggers**

The threat model must be reviewed **immediately** when any of the following events occur:

| Trigger Event | Review Scope | Timeline |
|--------------|--------------|----------|
| **🚨 Security Incident** | Full STRIDE re-analysis of affected component | Within 48 hours |
| **🆕 Major Feature Release** | Threat analysis of new attack surface | Before release |
| **📊 Significant Threat Landscape Change** | Update threat actor profiles, MITRE ATT&CK mapping | Within 1 week |
| **🔧 Architecture Change** | Re-assess STRIDE for modified components | Before deployment |
| **📜 New Regulatory Requirement** | Compliance gap analysis (e.g., CRA update) | Within 30 days |
| **🔓 Zero-Day in Dependency** | Risk assessment and mitigation strategy | Within 24 hours |

---

### **Workshop Activities Checklist**

**Quarterly Threat Modeling Workshop Agenda:**

- [ ] **Review Previous Action Items (15 min)**
  - Status of mitigations from last workshop
  - Effectiveness metrics for deployed controls

- [ ] **Threat Landscape Update (30 min)**
  - ENISA Threat Landscape review
  - Recent vulnerabilities in Node.js/TypeScript ecosystem
  - New MITRE ATT&CK techniques

- [ ] **STRIDE Re-Assessment (45 min)**
  - Walk through each threat category
  - Identify new threats since last review
  - Re-assess likelihood and impact scores

- [ ] **Attack Tree Review (30 min)**
  - Update attack tree with new threat vectors
  - Re-evaluate mitigation effectiveness

- [ ] **Security Control Validation (30 min)**
  - Test SLSA attestations, Dependabot alerts
  - Review OpenSSF Scorecard metrics
  - Verify rate limiting and input validation

- [ ] **Risk Prioritization (20 min)**
  - Update risk matrix based on new findings
  - Assign action items with owners and deadlines

- [ ] **Documentation Update (10 min)**
  - Update this THREAT_MODEL.md
  - Sync with SECURITY_ARCHITECTURE.md

**📝 Workshop Output:** Updated threat model, prioritized action items, risk register

---

### **Continuous Validation Cycle**

```mermaid
graph LR
    A[🔍 Monitor Threat<br/>Landscape] --> B[📊 Identify New<br/>Threats]
    B --> C[🎯 Assess Impact &<br/>Likelihood]
    C --> D[🛡️ Design/Update<br/>Mitigations]
    D --> E[✅ Implement<br/>Controls]
    E --> F[📈 Measure<br/>Effectiveness]
    F --> A
    
    style A fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style B fill:#2196F3,stroke:#1769aa,stroke-width:2px,color:#ffffff

    style C fill:#FF9800,stroke:#b26a00,stroke-width:2px,color:#1a1a1a

    style D fill:#9C27B0,stroke:#6d1b7b,stroke-width:2px,color:#ffffff

    style E fill:#F44336,stroke:#aa2e25,stroke-width:2px,color:#ffffff

    style F fill:#00BCD4,stroke:#008394,stroke-width:2px,color:#ffffff

```

**Key Performance Indicators (KPIs) for Threat Model Health:**

| KPI | Target | Current | Status |
|-----|--------|---------|--------|
| OpenSSF Scorecard Score | ≥8.0/10 | 9.2/10 | ✅ Excellent |
| High/Critical Vulnerabilities | 0 | 0 | ✅ Excellent |
| SLSA Provenance Coverage | 100% | 100% | ✅ Excellent |
| Threat Model Staleness | <90 days | 15 days | ✅ Current |
| Security Control Test Coverage | ≥80% | 85% | ✅ Good |
| Incident Response Drill Success | 100% | N/A | ⚠️ Not tested |

**Improvement Actions:**
1. Schedule annual incident response tabletop exercise
2. Implement automated threat intelligence feed integration
3. Develop threat model dashboard for real-time monitoring

---

## 📅 Assessment Lifecycle

This section defines the **structured cadence** for threat model reviews, ensuring systematic and timely updates aligned with the evolving threat landscape and project lifecycle.

### **Scheduled Review Cadence**

| Frequency | Activity | Owner | Duration | Deliverables |
|-----------|----------|-------|----------|-------------|
| **📆 Monthly** | Dependency vulnerability scan review | Lead Developer | 30 min | Updated dependency lockfile, npm audit report |
| **📆 Quarterly** | Full threat model review workshop | Security Architect | 2-3 hours | Updated THREAT_MODEL.md, risk register, action items |
| **📆 Semi-Annually** | MITRE ATT&CK mapping update | Security Architect | 1 hour | Updated ATT&CK Navigator layer, coverage gaps identified |
| **📆 Annually** | Complete threat model revision | Security Architect + External Expert | 1 day | Comprehensive threat model v2.0, new attack scenarios |
| **🔴 Ad-Hoc** | Triggered by events (see below) | Security Architect | Variable | Incident-specific threat assessment |

---

### **Ad-Hoc Review Triggers (Detailed)**

**Immediate Review Required (<48 hours):**
- 🚨 **Security Incident:** Active compromise or exploitation detected
- 🔓 **Zero-Day Vulnerability:** Critical CVE in Node.js, npm, or direct dependencies
- 📰 **Public Disclosure:** Security researcher publishes vulnerability in MCP protocol

**Expedited Review (Within 1 Week):**
- 🆕 **Major Feature Release:** New MCP tool added, API integration change
- 📊 **Threat Intelligence Alert:** ENISA/CISA advisory relevant to Node.js/TypeScript ecosystem
- 🏛️ **EP API Breaking Change:** European Parliament API schema or security model update

**Scheduled Review (Within 30 Days):**
- 📜 **Regulatory Update:** EU CRA amendment, GDPR guidance update
- 🔧 **Architecture Refactor:** Migration to new framework, protocol upgrade
- 🎖️ **Compliance Audit Finding:** ISO 27001 audit identifies threat modeling gap

---

### **Review Process Workflow**

```mermaid
graph TD
    A[📅 Scheduled Review<br/>or Trigger Event] --> B{Review Type?}
    B -->|Monthly| C[Dependency Scan<br/>Review]
    B -->|Quarterly| D[Full Threat Model<br/>Workshop]
    B -->|Annual| E[Comprehensive<br/>Revision]
    B -->|Ad-Hoc| F[Incident-Specific<br/>Assessment]
    
    C --> G[Update Lockfile]
    D --> H[Update STRIDE Tables]
    E --> I[New Attack Scenarios]
    F --> J[Incident Report]
    
    G --> K[Document Changes]
    H --> K
    I --> K
    J --> K
    
    K --> L[Commit to GitHub]
    L --> M[📢 Communicate Updates]
    M --> N[✅ Review Complete]
    
    style A fill:#4CAF50,stroke:#357a38,stroke-width:2px,color:#ffffff

    style B fill:#2196F3,stroke:#1769aa,stroke-width:2px,color:#ffffff

    style K fill:#FF9800,stroke:#b26a00,stroke-width:2px,color:#1a1a1a

    style N fill:#9C27B0,stroke:#6d1b7b,stroke-width:2px,color:#ffffff

```

---

### **Review Deliverables by Type**

**Monthly Dependency Review:**
- ✅ Updated `package-lock.json` with patched dependencies
- ✅ npm audit report with 0 high/critical vulnerabilities
- ✅ Dependabot PR merge/rejection justifications
- ✅ Updated SBOM (CycloneDX) published to GitHub Releases

**Quarterly Threat Model Workshop:**
- ✅ Updated THREAT_MODEL.md with new threats
- ✅ Risk matrix with re-assessed likelihood/impact scores
- ✅ Action item register with assigned owners and deadlines
- ✅ Security control effectiveness validation report

**Annual Comprehensive Revision:**
- ✅ Threat Model v2.0 with new attack scenarios
- ✅ Updated MITRE ATT&CK Navigator layer JSON
- ✅ External security expert assessment report
- ✅ Alignment with latest ENISA Threat Landscape
- ✅ Security maturity level progression plan

**Ad-Hoc Incident Assessment:**
- ✅ Root cause analysis with STRIDE classification
- ✅ Lessons learned document
- ✅ Updated threat actor profiles (if new TTPs identified)
- ✅ Enhanced mitigations roadmap

---

### **Version Control & Change Tracking**

All threat model updates are tracked via **Git commits** with the following conventions:

```bash
# Commit message format
threat-model: [Review Type] - Brief description

# Examples
git commit -m "threat-model: Quarterly Review Q1 2025 - Added MCP injection scenario"
git commit -m "threat-model: Ad-Hoc - CVE-2025-12345 in ws dependency assessment"
git commit -m "threat-model: Annual Revision - MITRE ATT&CK coverage expansion"
```

**📊 Threat Model Changelog:** Maintained via Git commit history using the `threat-model:` commit-message convention described above.

---

## 🎯 Security Maturity Framework

The European Parliament MCP Server's security posture is assessed using a **5-level maturity model** adapted from NIST Cybersecurity Framework and ISO 27001 maturity scales. This framework guides continuous improvement toward optimized security practices.

### **Maturity Level Definitions**

---

#### **Level 1: 🔴 Initial (Ad-Hoc Security Practices)**

**Characteristics:**
- ❌ No formal threat modeling process
- ❌ Security controls implemented reactively after incidents
- ❌ No security testing in CI/CD pipeline
- ❌ Dependency vulnerabilities addressed sporadically
- ❌ No security documentation or policies

**Typical Indicators:**
- Multiple high/critical vulnerabilities in production
- No SBOM or supply chain visibility
- Manual security testing (if any)
- No incident response plan

**Improvement Path:** Establish basic security controls (SAST, dependency scanning)

---

#### **Level 2: 🟡 Developing (Basic Controls Implemented)**

**Characteristics:**
- ✅ Basic threat identification (STRIDE threats documented)
- ✅ Essential security controls deployed (HTTPS, input validation)
- ✅ Dependency scanning with Dependabot
- ⚠️ Inconsistent security testing
- ⚠️ No quantitative risk assessment

**Typical Indicators:**
- Dependabot alerts reviewed weekly
- Some SAST tools integrated in CI/CD
- SECURITY.md and basic vulnerability disclosure process
- Reactive incident response

**Improvement Path:** Systematize threat modeling, implement SLSA Level 2

---

#### **Level 3: 🟢 Defined (Systematic Threat Modeling)**

**Characteristics:**
- ✅ Formal threat model with STRIDE per element
- ✅ MITRE ATT&CK mapping to threats
- ✅ Quarterly threat model reviews
- ✅ Comprehensive security testing (SAST, DAST, SCA)
- ✅ SLSA Level 3 provenance
- ✅ Security architecture documentation

**Typical Indicators:**
- OpenSSF Scorecard ≥8.0/10
- THREAT_MODEL.md and SECURITY_ARCHITECTURE.md maintained
- Automated security gates in CI/CD
- Proactive vulnerability management with SLAs

**Current Level:** 🟢 **The European Parliament MCP Server is at Level 3**

**Improvement Path:** Implement security metrics, threat intelligence integration

---

#### **Level 4: 🔵 Managed (Metrics-Driven Security)**

**Characteristics:**
- ✅ Quantitative risk assessment with business impact
- ✅ Security metrics dashboard (MTTR, vulnerability density, control effectiveness)
- ✅ Threat intelligence feeds integrated
- ✅ Continuous security testing (shift-left + shift-right)
- ✅ Automated incident response playbooks
- ✅ Security budget aligned with risk

**Typical Indicators:**
- Mean Time To Remediation (MTTR) tracked and improving
- Security KPIs reported to leadership quarterly
- Threat model updated automatically from threat intelligence
- Bug bounty program operational

**Improvement Path:** Predictive security analytics, AI-driven threat hunting

---

#### **Level 5: ⭐ Optimizing (Continuous Improvement)**

**Characteristics:**
- ✅ Real-time threat model updates via automation
- ✅ Predictive threat analytics using ML/AI
- ✅ Self-healing security controls
- ✅ Zero Trust Architecture fully implemented
- ✅ Security innovation through R&D
- ✅ Industry-leading security posture

**Typical Indicators:**
- OpenSSF Scorecard 10.0/10
- Autonomous security validation and remediation
- Published security research and threat intelligence
- Recognized as security exemplar in open-source community

**Improvement Path:** Maintain excellence, contribute to security standards

---

### **European Parliament MCP Server — Current Maturity Assessment**

**📊 Overall Maturity Level:** 🟢 **Level 3: Defined (Systematic Threat Modeling)**

| Security Domain | Current Level | Target (2025) | Gap Analysis |
|-----------------|---------------|---------------|--------------|
| **Threat Modeling** | 🟢 Level 3 | 🔵 Level 4 | Implement threat intelligence integration |
| **Supply Chain Security** | 🟢 Level 3 | 🟢 Level 3 | Maintain SLSA Level 3, monitor npm ecosystem |
| **Vulnerability Management** | 🟢 Level 3 | 🔵 Level 4 | Add MTTR metrics, automate patching |
| **Security Testing** | 🟢 Level 3 | 🔵 Level 4 | Add DAST, penetration testing |
| **Incident Response** | 🟡 Level 2 | 🟢 Level 3 | Conduct tabletop exercises, automate runbooks |
| **Security Monitoring** | 🟡 Level 2 | 🟢 Level 3 | Implement security metrics dashboard |
| **Documentation** | 🟢 Level 3 | 🟢 Level 3 | Maintain current excellence |

---

### **Maturity Progression Roadmap (2025-2026)**

```mermaid
gantt
    title Security Maturity Roadmap
    dateFormat YYYY-MM
    section Threat Modeling
    Threat Intelligence Integration   :2025-03, 3M
    Automated MITRE ATT&CK Updates   :2025-06, 2M
    section Vulnerability Management
    MTTR Metrics Dashboard           :2025-02, 2M
    Automated Patch Deployment       :2025-08, 3M
    section Security Testing
    DAST Integration (OWASP ZAP)     :2025-04, 2M
    Annual Penetration Test          :2025-09, 1M
    section Incident Response
    Tabletop Exercise                :2025-05, 1M
    Automated IR Playbooks           :2025-10, 3M
    section Monitoring
    Security Metrics Dashboard       :2025-03, 3M
    Anomaly Detection System         :2025-11, 4M
```

**🎯 2025 Target:** Achieve **Level 4 (Managed)** maturity in Threat Modeling and Vulnerability Management domains.

---

### **Maturity Assessment Criteria**

To objectively measure progression, the following criteria are used for annual maturity assessments:

| Criterion | Weight | Level 3 Threshold | Level 4 Threshold |
|-----------|--------|------------------|------------------|
| OpenSSF Scorecard | 20% | ≥8.0/10 | ≥9.0/10 |
| SLSA Level | 15% | Level 3 | Level 3 + Enhanced Monitoring |
| Threat Model Freshness | 10% | <90 days | <30 days (automated) |
| Vulnerability MTTR | 15% | Critical <7d, High <30d | Critical <24h, High <7d |
| Security Test Coverage | 15% | ≥80% | ≥90% with mutation testing |
| Incident Response Readiness | 10% | Plan documented | Drills quarterly, automation |
| Security Metrics | 10% | Manual reporting | Real-time dashboard |
| Threat Intelligence | 5% | Manual review | Automated integration |

**Assessment Method:** Annual third-party security audit with maturity scorecard

---

## 📊 Quantitative Risk Assessment

### **Risk Matrix**

```mermaid
%%{init: {
  "theme": "dark",
  "themeVariables": {
    "quadrant1Fill": "#D32F2F",
    "quadrant2Fill": "#4CAF50",
    "quadrant3Fill": "#2E7D32",
    "quadrant4Fill": "#FF9800",
    "quadrantTitleFill": "#ffffff",
    "quadrantPointFill": "#ffffff",
    "quadrantPointTextFill": "#ffffff",
    "quadrantXAxisTextFill": "#ffffff",
    "quadrantYAxisTextFill": "#ffffff"
  },
  "quadrantChart": {
    "chartWidth": 700,
    "chartHeight": 700,
    "pointLabelFontSize": 12,
    "titleFontSize": 20,
    "quadrantLabelFontSize": 16,
    "xAxisLabelFontSize": 14,
    "yAxisLabelFontSize": 14
  }
}}%%
quadrantChart
    title 🎯 Threat Risk Assessment Matrix
    x-axis Low Likelihood --> High Likelihood
    y-axis Low Impact --> High Impact
    quadrant-1 CRITICAL PRIORITY
    quadrant-2 MONITOR
    quadrant-3 ACCEPT
    quadrant-4 MITIGATE
    "📦 Supply Chain Attack": [0.5, 0.9]
    "⚡ API Rate Exhaustion": [0.6, 0.5]
    "💉 Input Injection": [0.4, 0.6]
    "🔍 Error Info Leak": [0.5, 0.4]
    "📛 Package Squatting": [0.3, 0.7]
    "🧬 Prototype Pollution": [0.2, 0.7]
    "🕵️ MITM Attack": [0.2, 0.6]
    "🏗️ Build Tampering": [0.2, 0.8]
```

### **Top Priority Risks**

| Priority | Risk | Current Status | Action Required |
|----------|------|---------------|----------------|
| 🔴 P1 | Supply chain compromise (T-2, S-4) | ✅ Mitigated | Maintain Dependabot, SLSA attestations |
| 🟠 P2 | Input validation bypass (E-1) | ✅ Mitigated | Zod schemas for all tool inputs |
| 🟡 P3 | API rate limit exhaustion (D-1) | ✅ Mitigated | Client-side rate limiting implemented |
| 🟡 P4 | Error information disclosure (I-1) | ⚠️ Partial | Improve error sanitization |
| 🟢 P5 | Build artifact tampering (T-3) | ✅ Mitigated | SLSA Level 3 provenance |

---

## 💰 Quantitative Risk Scoring — Top 7 Priority Scenarios

This section provides **quantitative risk estimates** for the 7 priority threat scenarios using **Single Loss Expectancy (SLE)**, **Annual Rate of Occurrence (ARO)**, and **Annualized Loss Expectancy (ALE)** metrics. Per [Hack23 Risk Management Policy §4.2](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Management_Policy.md), quantitative risk scoring enables risk-prioritized security investment.

**⚠️ Disclaimer:** These figures are **order-of-magnitude estimates for risk prioritization, not insurance-grade quantification**. Actual losses may vary significantly based on threat landscape evolution, control effectiveness, and business context. Estimates are grounded in publicly available data for open-source npm-distributed servers with no revenue.

### Quantitative Risk Matrix

| # | Scenario | SLE (€) | ARO (per year) | ALE (€/year) | Confidence | Calculation Basis |
|---|----------|---------|----------------|--------------|------------|-------------------|
| **1** | **Supply Chain Compromise**<br/>(T1195.002, T1059.007) | €5,000 – €10,000 | 0.1 – 0.2 | **€500 – €2,000** | **Medium** | **SLE:** OpenSSF Scorecard drop (9.4→7.0) → estimated 20–30% user-loss × €500 replacement cost per user (developer time to find alternative); npm package removal cost €2k–5k (republishing, reputation recovery). **ARO:** npm ecosystem avg. supply-chain incident rate 0.1–0.2/year (1 incident per 5–10 years) for packages with SLSA Level 3 + Dependabot. |
| **2** | **Parliamentary Data Manipulation**<br/>(T1557, T1565.002) | €1,000 – €3,000 | 0.05 – 0.1 | **€50 – €300** | **Low** | **SLE:** Reputational damage if false EP data propagates (news article retractions, community trust loss) → €1k–3k in brand recovery, user communication. **ARO:** HTTPS/TLS 1.3 + certificate validation makes MITM highly unlikely (0.05–0.1/year, ca. 1 per 10–20 years for well-configured TLS). |
| **3** | **MCP Protocol Abuse (AI Jailbreak)**<br/>(T1059, T1480) | €500 – €2,000 | 0.2 – 0.5 | **€100 – €1,000** | **Medium** | **SLE:** Service disruption (rate-limit exhaustion) + incident-response time (8–16 hours × €50/hour contractor rate) + minor reputational impact. **ARO:** AI jailbreak attempts growing (0.2–0.5/year, ca. 1 per 2–5 years) as LLM capabilities advance; Zod validation provides strong defense. |
| **4** | **GDPR Personal Data Exposure**<br/>(T1213) | €10,000 – €10,000,000 | 0.01 – 0.05 | **€100 – €500,000** | **Low** | **SLE:** GDPR Article 83 fines: €10M or 2% turnover (Article 83(4)(a) for security-of-processing violations); worst-case €20M or 4% turnover (Article 83(5) if personal data breach under Articles 33/34). For a €0-revenue open-source project, realistic fine €0–10k (administrative fine for non-compliance); reputational damage €5k–10k. **ARO:** Very low (0.01–0.05/year, ca. 1 per 20–100 years) due to public data focus + sanitized error handling; requires verbose error misconfiguration + regulatory audit. |
| **5** | **EP API Denial of Service**<br/>(T1499.004) | €500 – €1,500 | 0.1 – 0.3 | **€50 – €450** | **Medium** | **SLE:** Service downtime (4–8 hours) × user frustration + EP API quota reset cost (€0 for public API, but reputational impact €500–1.5k). **ARO:** Rate limiting (100/min) mitigates but not adaptive; 0.1–0.3/year (ca. 1 per 3–10 years) for sustained DoS attempts. |
| **6** | **Build Artifact Tampering**<br/>(T1554, T1195.002) | €10,000 – €50,000 | 0.02 – 0.05 | **€200 – €2,500** | **Medium** | **SLE:** Complete service compromise → npm package removal + user notifications + emergency patching + OpenSSF Scorecard drop → €10k–50k (developer time + reputation recovery + potential legal costs if malware spread). **ARO:** Very low (0.02–0.05/year, ca. 1 per 20–50 years) with SLSA Level 3 + branch protection + npm 2FA. |
| **7** | **Reputation Attack via Security Metrics**<br/>(T1591, T1588.005) | €1,000 – €5,000 | 0.1 – 0.2 | **€100 – €1,000** | **Medium** | **SLE:** OpenSSF Scorecard drop (9.4→8.5) → 10–15% user-loss × €500 replacement cost; FUD campaign response (blog posts, CVE triage, community communication) €1k–5k. **ARO:** Competitive FUD campaigns or minor-CVE exploitation (0.1–0.2/year, ca. 1 per 5–10 years); transparent security posture mitigates. |

### Aggregated Annual Risk Exposure

| Metric | Value | Notes |
|--------|-------|-------|
| **Total ALE (Sum)** | €1,200 – €505,250 | Sum of all 7 scenarios; dominated by GDPR worst-case |
| **Realistic ALE (Excluding Worst-Case GDPR)** | €1,100 – €5,250 | Excluding scenario 4 worst-case (€10M GDPR fine unlikely for €0-revenue OSS) |
| **Mean ALE (Realistic)** | **€3,175/year** | Average across 7 scenarios (realistic range) |
| **Risk-Adjusted Budget Recommendation** | **€5,000 – €10,000/year** | Security investment = 1.5–3× mean ALE (industry standard risk-adjusted budget) |

### Confidence Levels Explained

| Confidence | Meaning | Basis |
|------------|---------|-------|
| **High** | 75–90% confidence in SLE/ARO estimates | Industry benchmarks, historical npm data |
| **Medium** | 50–75% confidence | Expert judgment, limited historical data |
| **Low** | 25–50% confidence | Worst-case scenarios, regulatory uncertainty |

**Data Sources:**
- SLE (Reputation): OpenSSF Scorecard user-adoption impact studies (2024)
- SLE (GDPR): GDPR enforcement tracker (2018–2024 fines database)
- ARO (Supply Chain): npm ecosystem incident reports (Snyk, Sonatype, GitHub Advisory Database)
- ARO (MITM): TLS 1.3 vulnerability disclosures (2020–2024)
- Cost (Developer Time): €50/hour contractor rate (EU market average, 2024)

---

## 🛡️ Security Controls & Mitigations

### **Control Architecture**

```mermaid
graph TB
    subgraph "🔒 Defense in Depth"
        subgraph "Layer 1: Input Validation"
            ZOD[Zod Schema Validation]
            PARAM[Parameter Sanitization]
        end
        subgraph "Layer 2: Rate Limiting"
            RL[Request Rate Limiter]
            QUOTA[API Quota Management]
        end
        subgraph "Layer 3: Transport Security"
            HTTPS[HTTPS/TLS 1.3]
            STDIO[stdio Isolation]
        end
        subgraph "Layer 4: Supply Chain"
            SLSA[SLSA Level 3]
            SBOM[CycloneDX SBOM]
            DEP[Dependabot]
        end
        subgraph "Layer 5: Monitoring"
            AUDIT[Audit Logging]
            SCORE[OpenSSF Scorecard]
        end
    end

    ZOD --> RL --> HTTPS --> SLSA --> AUDIT
```

### **Security Controls Matrix**

| Control | Category | Threats Mitigated | Status |
|---------|----------|-------------------|--------|
| Zod input validation | Preventive | E-1, D-4, E-3 | ✅ Active |
| Rate limiting | Preventive | D-1, D-2 | ✅ Active |
| HTTPS/TLS for EP API | Preventive | S-2, T-1 | ✅ Active |
| SLSA Level 3 provenance | Detective | T-3, S-4 | ✅ Active |
| Dependabot alerts | Detective | T-2 | ✅ Active |
| npm audit | Detective | T-2, S-4 | ✅ Active |
| OpenSSF Scorecard | Detective | Multiple | ✅ Active |
| CycloneDX SBOM | Transparency | T-2 | ✅ Active |
| TypeScript strict mode | Preventive | E-2, I-1 | ✅ Active |
| Environment variable validation | Preventive | T-4 | ✅ Active |
| Structured error handling | Preventive | I-1, I-2 | ✅ Active |
| Branch protection | Preventive | R-2 | ✅ Active |
| Code review requirements | Detective | Multiple | ✅ Active |
| Security headers | Preventive | Multiple | ✅ Active |

---

## 🌳 Attack Tree Analysis

### **Attack Tree 1: Supply Chain Compromise (Detailed)**

```mermaid
graph TD
    ROOT["🎯 Compromise EP MCP<br/>via Supply Chain"]
    
    ROOT --> A["📦 Malicious Dependency<br/>Injection"]
    ROOT --> B["🏭 Build Pipeline<br/>Compromise"]
    ROOT --> C["📤 npm Package<br/>Substitution"]
    ROOT --> D["🔧 Developer<br/>Environment Attack"]
    
    A --> A1["Compromised npm package"]
    A --> A2["Typosquatting dependency"]
    A --> A3["Dependency confusion"]
    A1 --> A1a["Install backdoored package"]
    A1 --> A1b["Exploit known CVE"]
    A1a --> A1M["✅ Dependabot alerts"]
    A1b --> A1M2["✅ npm audit + Snyk"]
    A2 --> A2M["✅ package-lock.json pinning"]
    A3 --> A3M["✅ No private scope overlap"]
    
    B --> B1["GitHub Actions compromise"]
    B --> B2["Build artifact tampering"]
    B --> B3["Stolen publish credentials"]
    B1 --> B1a["Malicious workflow change"]
    B1 --> B1b["Environment secret theft"]
    B1a --> B1M["✅ Branch protection + CODEOWNERS"]
    B1b --> B1M2["✅ OIDC token auth (no secrets)"]
    B2 --> B2M["✅ SLSA Level 3 provenance"]
    B3 --> B3M["✅ npm 2FA required"]
    
    C --> C1["Package name squatting"]
    C --> C2["Account takeover"]
    C --> C3["npm registry compromise"]
    C1 --> C1M["✅ Official package ownership verified: european-parliament-mcp-server"]
    C2 --> C2M["✅ npm 2FA + strong passwords"]
    C3 --> C3M["❌ Out of scope (npm responsibility)"]
    
    D --> D1["Developer laptop malware"]
    D --> D2["SSH/GPG key theft"]
    D --> D3["Social engineering"]
    D1 --> D1M["⚠️ Developer responsibility"]
    D2 --> D2M["✅ GPG commit signing required"]
    D3 --> D3M["⚠️ Security awareness training"]
```

### **Attack Tree 2: Unauthorized Data Manipulation (T-1, T-2)**

```mermaid
graph TD
    ROOT2["🎯 Manipulate EP<br/>Parliamentary Data"]
    
    ROOT2 --> E["🌐 API Response<br/>Tampering"]
    ROOT2 --> F["💾 Cache<br/>Poisoning"]
    ROOT2 --> G["📦 Dependency<br/>Injection"]
    ROOT2 --> H["🔧 Build Artifact<br/>Tampering"]
    
    E --> E1["MITM TLS interception"]
    E --> E2["Compromised EP API"]
    E --> E3["DNS hijacking"]
    E1 --> E1a["TLS downgrade attack"]
    E1 --> E1b["Rogue CA certificate"]
    E1a --> E1M["✅ TLS 1.3 minimum, no fallback"]
    E1b --> E1M2["✅ Certificate pinning (future)"]
    E2 --> E2M["❌ Out of scope (EP infrastructure)"]
    E3 --> E3M["⚠️ DNSSEC (ISP/user responsibility)"]
    
    F --> F1["Inject malicious response"]
    F --> F2["Memory corruption"]
    F --> F3["Race condition exploitation"]
    F1 --> F1M["✅ Cache only validated responses"]
    F2 --> F2M["✅ TypeScript + process isolation"]
    F3 --> F3M["✅ Atomic cache operations"]
    
    G --> G1["Install backdoored package"]
    G --> G2["Exploit known CVE"]
    G --> G3["Prototype pollution"]
    G1 --> G1M["✅ Dependabot + SLSA"]
    G2 --> G2M["✅ npm audit + Snyk"]
    G3 --> G3M["✅ TypeScript strict mode"]
    
    H --> H1["Modify dist/ artifacts"]
    H --> H2["CI/CD pipeline injection"]
    H --> H3["Release process bypass"]
    H1 --> H1M["✅ SLSA Level 3 attestations"]
    H2 --> H2M["✅ Branch protection + required checks"]
    H3 --> H3M["✅ npm provenance + 2FA"]
```

### **Attack Tree 3: Service Disruption / DoS (D-1, D-2, D-3)**

```mermaid
graph TD
    ROOT3["🎯 Disrupt EP MCP<br/>Service Availability"]
    
    ROOT3 --> I["⏱️ Rate Limit<br/>Exhaustion"]
    ROOT3 --> J["💻 Resource<br/>Exhaustion"]
    ROOT3 --> K["🌐 EP API<br/>Overload"]
    ROOT3 --> L["📦 Supply Chain<br/>DoS"]
    
    I --> I1["AI client excessive requests"]
    I --> I2["Bypass rate limiter"]
    I --> I3["Distributed request flood"]
    I1 --> I1M["✅ Token bucket rate limiting"]
    I2 --> I2M["✅ Atomic rate limit checks"]
    I3 --> I3M["⚠️ stdio isolation limits multi-client"]
    
    J --> J1["Memory exhaustion (large responses)"]
    J --> J2["CPU exhaustion (regex DoS)"]
    J --> J3["Cache memory overflow"]
    J1 --> J1M["✅ Response size limits"]
    J2 --> J2M["✅ Zod validation (no regex)"]
    J3 --> J3M["✅ LRU cache with max size"]
    
    K --> K1["Excessive API requests"]
    K --> K2["Concurrent request flood"]
    K --> K3["Long-polling attacks"]
    K1 --> K1M["✅ Client-side rate limiting"]
    K2 --> K2M["✅ Concurrency limits (future)"]
    K3 --> K3M["✅ HTTP timeout configuration"]
    
    L --> L1["npm registry unavailable"]
    L --> L2["Compromised dependency unavailable"]
    L --> L3["GitHub Actions outage"]
    L1 --> L1M["⚠️ npm mirrors (user responsibility)"]
    L2 --> L2M["✅ package-lock.json ensures reproducibility"]
    L3 --> L3M["❌ Out of scope (GitHub SLA)"]
```

### **Attack Tree 4: MCP Protocol Exploit (Original - Preserved)**

```mermaid
graph TD
    ROOT["🎯 Compromise MCP Server"]
    ROOT --> A["📦 Supply Chain Attack"]
    ROOT --> B["🔌 MCP Protocol Exploit"]
    ROOT --> C["🌐 API Layer Attack"]
    ROOT --> D["💻 Runtime Exploit"]

    A --> A1["Malicious dependency"]
    A --> A2["Build pipeline compromise"]
    A --> A3["npm package substitution"]
    A1 --> A1M["✅ Dependabot + npm audit"]
    A2 --> A2M["✅ SLSA Level 3"]
    A3 --> A3M["✅ Official package, 2FA"]

    B --> B1["Parameter injection"]
    B --> B2["Tool abuse"]
    B --> B3["Resource exhaustion"]
    B1 --> B1M["✅ Zod validation"]
    B2 --> B2M["✅ Rate limiting"]
    B3 --> B3M["✅ Memory limits"]

    C --> C1["API MITM"]
    C --> C2["Rate limit exhaustion"]
    C --> C3["Response manipulation"]
    C1 --> C1M["✅ HTTPS/TLS"]
    C2 --> C2M["✅ Client rate limiting"]
    C3 --> C3M["✅ Response validation"]

    D --> D1["Prototype pollution"]
    D --> D2["Memory exhaustion"]
    D --> D3["Error info leakage"]
    D1 --> D1M["✅ TypeScript strict"]
    D2 --> D2M["✅ Response limits"]
    D3 --> D3M["⚠️ Improve sanitization"]
```

---

## 🔴 Priority Threat Scenarios

Detailed narrative scenarios prioritized by likelihood and business impact for the European Parliament MCP Server.

| # | Scenario | Actor | Method | Impact | Current Controls | Residual Risk |
|---|----------|-------|--------|--------|------------------|---------------|
| **1** | **Supply Chain Compromise**<br/>(T1195.002 Compromise Software Supply Chain, T1059.007 JavaScript) | 🎭 Nation-State APT<br/>💰 Cybercriminal | Backdoored npm dependency injected via compromised maintainer account → malicious code in `node_modules/` → data exfiltration or sabotage during MCP tool execution | **Critical**: Loss of service reputation, potential data manipulation, user trust erosion, OpenSSF Scorecard degradation | ✅ Dependabot alerts<br/>✅ npm audit + Snyk<br/>✅ SLSA Level 3<br/>✅ SBOM (CycloneDX)<br/>✅ package-lock.json pinning | **Medium**<br/>_(Continuous monitoring required)_ |
| **2** | **Parliamentary Data Manipulation**<br/>(T1557 Adversary-in-the-Middle, T1565.002 Transmitted Data Manipulation) | 🏛️ Disinformation APT<br/>🎯 Political Actor | MITM attack on EP API connection → inject false MEP voting records or manipulated plenary transcripts → AI assistant provides incorrect democratic transparency data → misinformation spread | **High**: Democratic process undermined, service credibility damaged, regulatory scrutiny (GDPR/NIS2) | ✅ HTTPS/TLS 1.3<br/>✅ Certificate validation<br/>✅ Response validation (Zod)<br/>⚠️ Certificate pinning (future) | **Low-Medium**<br/>_(TLS provides strong protection)_ |
| **3** | **MCP Protocol Abuse (AI Jailbreak)**<br/>(T1059 Command and Scripting Interpreter, T1480 Execution Guardrails Bypass) | 🤖 Malicious AI User<br/>🔬 Security Researcher | Crafted prompts causing AI assistant to invoke MCP tools with malicious parameters → bypass Zod validation via edge cases → unauthorized data access or service abuse | **Medium**: Data exposure, rate limit exhaustion, service disruption, reputational risk | ✅ Zod schema validation<br/>✅ TypeScript strict mode<br/>✅ No shell execution<br/>✅ Input sanitization | **Low**<br/>_(Defense-in-depth architecture)_ |
| **4** | **GDPR Personal Data Exposure**<br/>(T1213 Data from Information Repositories) | 🔍 Privacy Researcher<br/>🎯 Regulatory Auditor | Verbose error messages or debug logs expose MEP personal data (addresses, contact info, personal declarations) → GDPR Article 32 violation → regulatory fines and reputational damage | **Medium**: GDPR Article 32 security-of-processing fines (typically up to €10M or 2% of worldwide annual turnover under Article 83(4)(a); potential escalation to €20M or 4% under Article 83(5) if a reportable personal data breach under Articles 33/34 occurs), reputational damage, user trust loss, mandatory breach notification | ✅ Sanitized error handling<br/>⚠️ Production log review<br/>⚠️ PII detection in logs<br/>✅ Public data focus | **Low-Medium**<br/>_(Requires log sanitization review)_ |
| **5** | **EP API Denial of Service**<br/>(T1499.004 Application or System Exploitation Flood) | 💼 Competitive Adversary<br/>🎯 Disruptive Actor | Automated script or compromised AI client floods EP MCP Server with requests → client-side rate limiter bypassed or overwhelmed → EP API rate limits exhausted → service unavailable for legitimate users | **Medium**: Service unavailability, user frustration, EP API access suspended, reputational damage | ✅ Token bucket rate limiter<br/>✅ Concurrency limits<br/>✅ Request logging<br/>⚠️ Adaptive rate limiting (future) | **Low-Medium**<br/>_(Rate limiting effective but not adaptive)_ |
| **6** | **Build Artifact Tampering**<br/>(T1554 Compromise Host Software Binary, T1195.002 Compromise Software Supply Chain) | 🏭 CI/CD Attacker<br/>🔓 Compromised GitHub Actions | Attacker modifies GitHub Actions workflow or injects malicious code during build → tampered `dist/` artifacts published to npm → users install compromised package → backdoor execution | **Critical**: Widespread malware distribution, npm package removal, OpenSSF Scorecard failure, complete service compromise | ✅ SLSA Level 3 provenance<br/>✅ Branch protection<br/>✅ Required status checks<br/>✅ CODEOWNERS enforcement<br/>✅ npm 2FA | **Low**<br/>_(Strong supply chain security)_ |
| **7** | **Reputation Attack via Security Metrics**<br/>(T1591 Gather Victim Org Information, T1588.005 Exploits) | 🎯 Competitive Adversary<br/>📉 FUD Campaign | Attacker exploits minor vulnerability or submits CVE against EP MCP Server → OpenSSF Scorecard drops below 9.0 → negative publicity and user migration to competitors | **Medium**: Market share loss, user trust erosion, competitive disadvantage, reduced adoption rate | ✅ OpenSSF Scorecard 9.4+<br/>✅ Security badges (up-to-date)<br/>✅ Transparent security docs<br/>✅ Rapid vulnerability response | **Low**<br/>_(Strong security posture)_ |

---

## 🔭 Detection Signatures — Per-Scenario Logging Indicators

This section defines **concrete detection signatures** for each of the 7 priority threat scenarios, enabling automated threat detection and incident response. Per [Hack23 Incident Response Plan §3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md), detection signatures must be actionable and tied to response playbooks.

**Audit Event Schema:** Based on `src/utils/auditLogger.ts` — `AuditLogEntry { action: string; params?: Record<string, unknown>; result?: { count?: number; success: boolean; error?: string }; duration?: number; timestamp: Date }`

### Scenario 1: Supply Chain Compromise

| Detection Attribute | Signature | Alert Threshold | Response Playbook |
|---------------------|-----------|----------------|-------------------|
| **Detection Source** | Dependabot alerts, npm audit, OpenSSF Scorecard, SLSA provenance verification | Critical/high severity CVE in direct dependency | [IR-SUPPLY-CHAIN](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md#supply-chain-compromise) |
| **Signature 1** | Dependabot alert severity `in ("critical", "high")` AND `package.scope === "direct"` | 1 alert | Immediate patch or dependency replacement |
| **Signature 2** | OpenSSF Scorecard drop: `(previousScore - currentScore) >= 1.0` AND `currentScore < 9.0` | Score drop ≥1.0 | Investigate scorecard degradation cause |
| **Signature 3** | npm audit: `vulnerabilities.high > 0 OR vulnerabilities.critical > 0` | Any high/critical vuln | CI/CD gate: block merge/publish |
| **Signature 4** | SLSA provenance signature mismatch: `slsa.verified === false` | Any mismatch | Quarantine build artifact, investigate tampering |

### Scenario 2: Parliamentary Data Manipulation

| Detection Attribute | Signature | Alert Threshold | Response Playbook |
|---------------------|-----------|----------------|-------------------|
| **Detection Source** | TLS certificate validation errors, Zod response validation failures, EP API response anomalies | TLS handshake failure or schema validation error spike | [IR-DATA-INTEGRITY](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md#data-integrity-incident) |
| **Signature 1** | auditEvent: `action === "tool_call" AND result.success === false AND result.error.includes("certificate")` | >3 TLS errors/hour | Potential MITM attack or cert expiry |
| **Signature 2** | auditEvent: `action === "tool_call" AND result.success === false AND result.error.includes("ZodError")` | >10 validation errors/hour | EP API schema change or response tampering |
| **Signature 3** | auditEvent: `action === "tool_call" AND params.tool.includes("vot") AND result.count === 0` (unexpected empty voting records) | >5 empty results/day | EP API outage or data manipulation |

### Scenario 3: MCP Protocol Abuse (AI Jailbreak)

| Detection Attribute | Signature | Alert Threshold | Response Playbook |
|---------------------|-----------|----------------|-------------------|
| **Detection Source** | Zod validation errors, rate limiter denials, unusual tool invocation patterns | Repeated Zod failures or rate-limit violations from single client | [IR-ABUSE](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md#service-abuse) |
| **Signature 1** | auditEvent: `action === "tool_call" AND result.success === false AND result.error.includes("ZodError")` | >20 Zod errors/hour from same tool | Jailbreak attempt or malformed client |
| **Signature 2** | Rate limiter: `rateLimitDenials > 10/minute` (requires future rate-limit logging enhancement) | >10 denials/min | Automated abuse or compromised client |
| **Signature 3** | Tool invocation depth: `toolCallChain.length > 5` (future: track recursive tool calls) | Depth >5 | Potential infinite-loop AI agent |

### Scenario 4: GDPR Personal Data Exposure

| Detection Attribute | Signature | Alert Threshold | Response Playbook |
|---------------------|-----------|----------------|-------------------|
| **Detection Source** | Error logs, audit logs, PII-detection regex (future enhancement) | PII keywords in error messages or logs | [IR-GDPR-BREACH](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md#gdpr-personal-data-breach) |
| **Signature 1** | auditEvent: `result.error` contains PII regex: `/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/` (email) | Any match | Sanitize error handling immediately |
| **Signature 2** | auditEvent: `action === "get_mep_details" AND params.id` logged with full MEP bio in `result` | Requires log-content analysis | Ensure PII sanitization in audit logs |
| **Signature 3** | Production error stack trace: `error.stack !== undefined` in logged errors | Any stack trace in prod | Fix error sanitization (I-1/I-2) |

### Scenario 5: EP API Denial of Service

| Detection Attribute | Signature | Alert Threshold | Response Playbook |
|---------------------|-----------|----------------|-------------------|
| **Detection Source** | Rate limiter logs, EP API 429 responses, request throughput monitoring | Sustained rate-limit denials or EP API quota exhaustion | [IR-DOS](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md#denial-of-service) |
| **Signature 1** | auditEvent: `action === "rate_limit_exceeded"` (requires future enhancement: log rate-limit events) | >100 denials/minute | Potential DoS attack |
| **Signature 2** | EP API response: `statusCode === 429` (Too Many Requests) | >5 consecutive 429s | EP API quota exhausted, throttle client |
| **Signature 3** | Request throughput: `toolCallsPerMinute > 150` (exceeds 100/min rate limit + 50% burst) | >150 calls/min | Burst traffic, investigate client behavior |

### Scenario 6: Build Artifact Tampering

| Detection Attribute | Signature | Alert Threshold | Response Playbook |
|---------------------|-----------|----------------|-------------------|
| **Detection Source** | SLSA provenance verification, GitHub Actions audit logs, npm publish logs | Provenance signature mismatch or unauthorized publish | [IR-SUPPLY-CHAIN](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md#supply-chain-compromise) |
| **Signature 1** | SLSA: `provenance.signature.verified === false` OR `provenance.builder !== "https://github.com/slsa-framework/slsa-github-generator"` | Any mismatch | Quarantine npm package version |
| **Signature 2** | GitHub Actions: `workflow.modified === true` AND `approver !== CODEOWNERS` | Workflow change w/o approval | Investigate unauthorized workflow modification |
| **Signature 3** | npm publish: `publisher.twoFactorAuth === false` OR `publisher !== "authorized-maintainer"` | Any unauthorized publish | Revoke npm token, audit recent publishes |

### Scenario 7: Reputation Attack via Security Metrics

| Detection Attribute | Signature | Alert Threshold | Response Playbook |
|---------------------|-----------|----------------|-------------------|
| **Detection Source** | OpenSSF Scorecard monitoring, GitHub Security Advisories, CVE database alerts | Scorecard drop or new CVE assigned | [IR-REPUTATION](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md#reputation-incident) |
| **Signature 1** | OpenSSF Scorecard: `currentScore < 9.0` AND `previousScore >= 9.0` | Score drops below 9.0 | Investigate scorecard check failures |
| **Signature 2** | CVE assigned: `cve.severity in ("high", "critical")` AND `cve.packageName === "european-parliament-mcp-server"` | Any high/critical CVE | Emergency patch, security advisory |
| **Signature 3** | GitHub Security Advisory: `advisory.state === "published"` AND `advisory.severity in ("high", "critical")` | Any published advisory | Public communication, rapid response |

### Detection Infrastructure Requirements

| Requirement | Current Status | Future Enhancement |
|-------------|---------------|-------------------|
| **Audit log aggregation** | ⚠️ stderr only (no centralized SIEM) | Integrate with CloudWatch Logs / Elasticsearch |
| **Rate-limit event logging** | ⚠️ Denials not logged (future: add to auditLogger) | Add `rate_limit_exceeded` event to audit log schema |
| **SLSA provenance verification** | ✅ Automated in CI/CD | Add provenance-verification alerts to Slack/email |
| **OpenSSF Scorecard monitoring** | ⚠️ Manual weekly check | Automate daily Scorecard API polling + alerting |
| **PII detection in logs** | ❌ No automated PII scanning | Implement regex-based PII detector for audit logs |

---

## 🛡️ STRIDE → Control Mapping

Comprehensive mapping of each STRIDE threat category to preventive, detective, and corrective security controls.

| STRIDE Category | Threat Definition | Primary Controls | Secondary Controls | Detection Controls | Monitoring & Response |
|-----------------|-------------------|------------------|--------------------|--------------------|----------------------|
| **🎭 Spoofing (S)** | Impersonating a legitimate entity | • stdio transport isolation (S-1)<br/>• HTTPS/TLS 1.3 (S-2)<br/>• Official npm package name ownership (S-3)<br/>• npm 2FA (S-3) | • Certificate validation<br/>• Package provenance<br/>• GitHub Actions OIDC | • Audit logging (all requests)<br/>• npm download anomaly detection<br/>• TLS handshake monitoring | • OpenSSF Scorecard<br/>• npm package monitoring<br/>• Security badge alerts |
| **🔧 Tampering (T)** | Unauthorized modification of data or code | • HTTPS integrity checks (T-1)<br/>• SLSA Level 3 provenance (T-2, T-3)<br/>• Zod response validation (T-1)<br/>• Dependabot + npm audit (T-2) | • Branch protection<br/>• GPG commit signing<br/>• Immutable cache entries<br/>• Environment variable validation | • Dependabot alerts<br/>• npm audit (CI/CD)<br/>• SBOM vulnerability scanning<br/>• GitHub Advanced Security | • Snyk monitoring<br/>• Supply chain security alerts<br/>• Build artifact verification |
| **🚫 Repudiation (R)** | Denying actions or events | • Structured stderr logging (R-1)<br/>• ISO 8601 timestamps (R-1)<br/>• Immutable log streams (R-1)<br/>• GPG commit signing (R-2) | • Request ID correlation<br/>• GitHub Actions audit logs<br/>• npm publish logs | • Log aggregation (future)<br/>• Audit trail completeness checks<br/>• GitHub audit log API | • Log retention policy<br/>• Incident response procedures<br/>• Forensic analysis capability |
| **📢 Information Disclosure (I)** | Exposure of confidential information | • Sanitized error messages (I-1, I-2)<br/>• No API keys required (I-3)<br/>• Public data only (I-4)<br/>• TypeScript strict mode | • Production error handling<br/>• Generic log messages<br/>• No PII in cache keys<br/>• Environment variable masking | • Log content review<br/>• Error message monitoring<br/>• Stack trace detection | • Privacy impact assessment<br/>• GDPR compliance monitoring<br/>• Security code review |
| **🚨 Denial of Service (D)** | Degrading or preventing service availability | • Token bucket rate limiting (D-1)<br/>• Response size limits (D-2)<br/>• LRU cache max size (D-2)<br/>• Zod validation (no ReDoS) (D-4) | • HTTP timeout configuration<br/>• Memory monitoring<br/>• Concurrency limits<br/>• Call depth tracking | • Rate limit violation logs<br/>• Memory usage monitoring<br/>• API response time tracking | • Incident response procedures<br/>• Failover strategy<br/>• EP API health monitoring |
| **⚡ Elevation of Privilege (E)** | Gaining unauthorized capabilities | • Zod schema validation (E-1)<br/>• TypeScript strict mode (E-2)<br/>• No shell execution (E-4)<br/>• Input sanitization (E-3) | • Parameterized API calls<br/>• Process isolation (stdio)<br/>• Safe JSON parsing<br/>• No filesystem access | • Input validation failures<br/>• Unexpected tool invocations<br/>• Privilege escalation attempts | • Security testing (SAST/DAST)<br/>• Penetration testing<br/>• Bug bounty program (future) |

---

## 🏛️ Comprehensive Security Control Framework

### **🛡️ Defense-in-Depth Architecture**

```mermaid
graph TB
    subgraph "🏰 Layer 1: Perimeter Security"
        L1A[🌐 HTTPS/TLS 1.3]
        L1B[⏱️ Rate Limiting]
        L1C[🔒 Certificate Validation]
        L1D[🚫 No HTTP Fallback]
    end
    
    subgraph "🏗️ Layer 2: Application Security"
        L2A[✅ Zod Input Validation]
        L2B[📝 TypeScript Strict Mode]
        L2C[🛡️ Parameter Sanitization]
        L2D[🚫 No Shell Execution]
        L2E[🔍 Response Validation]
    end
    
    subgraph "💾 Layer 3: Data Security"
        L3A[✅ Public Data Only]
        L3B[⏳ TTL-Based Caching]
        L3C[🔒 Immutable Cache Entries]
        L3D[🧹 Sanitized Error Messages]
        L3E[📊 Structured Logging]
    end
    
    subgraph "📦 Layer 4: Supply Chain Security"
        L4A[🏅 SLSA Level 3]
        L4B[🤖 Dependabot Alerts]
        L4C[📋 SBOM CycloneDX]
        L4D[🔐 npm 2FA Publishing]
        L4E[🔒 package-lock.json]
        L4F[🎯 npm Provenance]
    end
    
    subgraph "🔍 Layer 5: Operational Security"
        L5A[📊 OpenSSF Scorecard]
        L5B[📋 Audit Logging stderr]
        L5C[🎖️ Security Badges]
        L5D[🔄 Automated Testing]
        L5E[🛡️ CodeQL SAST]
        L5F[🔍 Snyk Scanning]
    end
    
    L1A --> L2A
    L1B --> L2A
    L2A --> L3A
    L2B --> L3A
    L3A --> L4A
    L3E --> L4A
    L4A --> L5A
    L4B --> L5A
    
    style L1A fill:#ff6b6b,stroke:#b24a4a,stroke-width:2px,color:#ffffff

    style L2A fill:#feca57,stroke:#b18d3c,stroke-width:2px,color:#000000

    style L3A fill:#48dbfb,stroke:#3299af,stroke-width:2px,color:#000000

    style L4A fill:#1dd1a1,stroke:#149270,stroke-width:2px,color:#000000

    style L5A fill:#9b59b6,stroke:#6c3e7f,stroke-width:2px,color:#ffffff

```

### **🎯 Control Effectiveness Matrix**

| Layer | Control | Type | NIST CSF 2.0 Function | Threats Addressed | Effectiveness | Status |
|-------|---------|------|----------------------|-------------------|---------------|--------|
| **1: Perimeter** | HTTPS/TLS 1.3 | Preventive | PR.DS-2, PR.DS-5 | S-2, T-1, I-3 | ⭐⭐⭐⭐⭐ High | ✅ Active |
| **1: Perimeter** | Token bucket rate limiting | Preventive | PR.IP-12, DE.CM-1 | D-1, D-2, D-3 | ⭐⭐⭐⭐ High | ✅ Active |
| **1: Perimeter** | Certificate validation | Detective | PR.DS-2 | S-2, T-1 | ⭐⭐⭐⭐⭐ High | ✅ Active |
| **2: Application** | Zod schema validation | Preventive | PR.DS-1, PR.IP-1 | E-1, D-4, E-3 | ⭐⭐⭐⭐⭐ High | ✅ Active |
| **2: Application** | TypeScript strict mode | Preventive | PR.IP-1 | E-2, I-1 | ⭐⭐⭐⭐ High | ✅ Active |
| **2: Application** | No shell execution | Preventive | PR.AC-4, PR.IP-1 | E-4 | ⭐⭐⭐⭐⭐ High | ✅ Active |
| **3: Data** | Response validation | Preventive | PR.DS-1 | T-1, E-2 | ⭐⭐⭐⭐ High | ✅ Active |
| **3: Data** | TTL-based caching | Preventive | PR.DS-3 | I-4, T-1 | ⭐⭐⭐ Medium | ✅ Active |
| **3: Data** | Sanitized error messages | Preventive | PR.DS-5 | I-1, I-2 | ⭐⭐⭐ Medium | ⚠️ Partial |
| **3: Data** | Structured logging (stderr) | Detective | DE.AE-3, DE.CM-1 | R-1, R-3 | ⭐⭐⭐⭐ High | ✅ Active |
| **4: Supply Chain** | SLSA Level 3 provenance | Detective | PR.DS-6, ID.SC-2 | T-2, T-3, S-4 | ⭐⭐⭐⭐⭐ High | ✅ Active |
| **4: Supply Chain** | Dependabot + npm audit | Detective | ID.RA-1, DE.CM-4 | T-2, S-4 | ⭐⭐⭐⭐ High | ✅ Active |
| **4: Supply Chain** | SBOM (CycloneDX) | Transparency | ID.AM-4, ID.SC-5 | T-2 | ⭐⭐⭐ Medium | ✅ Active |
| **4: Supply Chain** | npm 2FA publishing | Preventive | PR.AC-1 | S-3, T-2 | ⭐⭐⭐⭐⭐ High | ✅ Active |
| **4: Supply Chain** | package-lock.json pinning | Preventive | ID.SC-2 | T-2, S-4 | ⭐⭐⭐⭐ High | ✅ Active |
| **5: Operations** | OpenSSF Scorecard 9.4+ | Detective | ID.IM-1, PR.IP-1 | All categories | ⭐⭐⭐⭐⭐ High | ✅ Active |
| **5: Operations** | Audit logging (stderr) | Detective | DE.AE-3, RS.AN-1 | R-1, R-2, R-3 | ⭐⭐⭐⭐ High | ✅ Active |
| **5: Operations** | CodeQL SAST scanning | Detective | ID.RA-1, DE.CM-4 | E-1, E-2, E-4, I-1 | ⭐⭐⭐⭐ High | ✅ Active |
| **5: Operations** | Snyk vulnerability scanning | Detective | ID.RA-1, DE.CM-4 | T-2, S-4 | ⭐⭐⭐⭐ High | ✅ Active |

### **📊 NIST CSF 2.0 Function Mapping**

| Function | Description | EP MCP Server Controls |
|----------|-------------|------------------------|
| **🔍 IDENTIFY (ID)** | Understand risks to systems and assets | • OpenSSF Scorecard monitoring<br/>• SBOM generation (CycloneDX)<br/>• Threat modeling (this document)<br/>• Security architecture documentation |
| **🛡️ PROTECT (PR)** | Implement safeguards for critical services | • Zod input validation<br/>• HTTPS/TLS 1.3<br/>• TypeScript strict mode<br/>• Rate limiting<br/>• No shell execution<br/>• npm 2FA publishing |
| **🔎 DETECT (DE)** | Identify occurrence of cybersecurity events | • Dependabot alerts<br/>• npm audit<br/>• CodeQL SAST<br/>• Snyk scanning<br/>• Audit logging (stderr)<br/>• OpenSSF Scorecard |
| **🚨 RESPOND (RS)** | Take action regarding detected incidents | • Incident response procedures<br/>• Security advisory publication<br/>• Rapid patch deployment<br/>• Coordinated vulnerability disclosure |
| **♻️ RECOVER (RC)** | Restore capabilities or services | • npm package rollback<br/>• Version pinning (package-lock.json)<br/>• GitHub release rollback<br/>• Incident post-mortem |

---

## 🔗 Policy Alignment

| ISMS Policy | Relevance | Link |
|-------------|-----------|------|
| 🎯 Threat Modeling | Primary methodology | [Threat_Modeling.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md) |
| 🔒 Secure Development | Development security requirements | [Secure_Development_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| 🔍 Vulnerability Management | Vulnerability handling SLAs | [Vulnerability_Management.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) |
| 🌐 Network Security | Transport security requirements | [Network_Security_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Network_Security_Policy.md) |
| 🔑 Access Control | Authentication/authorization | [Access_Control_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) |
| 🔐 Cryptography | TLS and encryption standards | [Cryptography_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md) |
| 🚨 Incident Response | Security incident procedures | [Incident_Response_Plan.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) |
| 🏷️ Classification | Data classification framework | [CLASSIFICATION.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |

### **Compliance Framework Mapping**

| Framework | Controls Addressed |
|-----------|-------------------|
| **ISO 27001:2022** | A.5.7, A.8.8, A.8.9, A.8.25, A.8.26, A.8.28 |
| **NIST CSF 2.0** | ID.RA, PR.DS, PR.IP, DE.CM, RS.AN |
| **CIS Controls v8.1** | 2.7, 7.1, 7.4, 16.1, 16.9 |

---

## 📋 CIA Triad and AAA Framework Application

### CIA Triad Assessment

| Principle | Application to EP MCP Server | Key Controls | Threat Categories |
|-----------|------------------------------|--------------|-------------------|
| **🔐 Confidentiality** | MEP personal data protected from unauthorized access; API responses contain only publicly available parliamentary data | GDPR data minimization, PII stripping in audit logs, no persistent storage | Information disclosure (I-1 through I-4) |
| **🔒 Integrity** | Parliamentary data accuracy maintained from EP API source to MCP client response | TLS transport integrity, Zod schema validation, SLSA Level 3 provenance | Tampering (T-1 through T-4), Supply chain attacks |
| **⚡ Availability** | Continuous access to EP parliamentary data within rate limits | Rate limiting (100 req/min), LRU cache (15-min TTL), graceful degradation | Denial of service (D-1 through D-3) |

### AAA Framework Integration

| Component | EP MCP Server Implementation | Scope |
|-----------|------------------------------|-------|
| **🔐 Authentication** | OS process isolation (stdio transport) — client identity is the spawning process | Process-level identity |
| **📋 Authorization** | All 62 tools available to any authenticated client; no role-based restrictions in v1.1 | Flat access model |
| **📊 Accounting** | AuditLogger tracks every tool invocation with timestamp, tool name, sanitized parameters, duration | Full audit trail |

---

## 📊 Threat Catalog

### Threat Documentation Standard

Each threat in this model follows the structured documentation format defined in [Hack23 Threat Modeling Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md):

| Field | Description | Example |
|-------|-------------|---------|
| **Threat ID** | Unique identifier (STRIDE category + sequence) | S-1, T-2, I-3 |
| **Category** | STRIDE classification | Spoofing, Tampering, etc. |
| **Description** | Detailed threat narrative | "Malicious MCP client sends crafted tool arguments" |
| **Attack Vector** | MITRE ATT&CK technique mapping | T1059 (Command and Scripting) |
| **Likelihood** | Probability assessment (Low/Medium/High) | Medium |
| **Impact** | Business impact assessment (Low/Medium/High/Critical) | High |
| **Risk Score** | Likelihood × Impact | Medium-High |
| **Controls** | Existing mitigations | SC-001 (Zod validation) |
| **Residual Risk** | Risk after controls | Low |
| **Owner** | Responsible party | Development team |

### Threat Count Summary

| STRIDE Category | Total Threats | Critical | High | Medium | Low |
|----------------|---------------|----------|------|--------|-----|
| **Spoofing** | 2 | 0 | 0 | 1 | 1 |
| **Tampering** | 4 | 0 | 1 | 2 | 1 |
| **Repudiation** | 2 | 0 | 0 | 2 | 0 |
| **Information Disclosure** | 4 | 0 | 1 | 2 | 1 |
| **Denial of Service** | 3 | 0 | 1 | 1 | 1 |
| **Elevation of Privilege** | 3 | 0 | 0 | 2 | 1 |
| **Supply Chain** | 3 | 0 | 2 | 1 | 0 |
| **Total** | **21** | **0** | **5** | **11** | **5** |

---

## 📈 AI Model Evolution — Threat Landscape Perspective

### 🔴 Evolving AI-Enabled Threat Vectors

As AI capabilities advance, the threat landscape for MCP servers evolves:

| Timeline | AI Threat Vector | Impact on EP MCP Server | Mitigation Strategy |
|----------|-----------------|------------------------|---------------------|
| **2025–2026** | AI-generated social engineering targeting MCP tool arguments | Medium — crafted inputs designed to extract maximum data | Zod schema validation, rate limiting, data minimization |
| **2026–2027** | AI-powered dependency poisoning (LLM-generated malware in npm) | High — sophisticated supply chain attacks | SLSA Level 3, Dependabot, lockfile pinning, minimal deps |
| **2027–2028** | Autonomous AI agents attempting data exfiltration via MCP | Medium — automated abuse of MCP protocol | Rate limiting, anomaly detection, audit logging |
| **2028–2030** | AI-assisted API manipulation (adversarial ML against data pipelines) | Medium — attempted manipulation of parliamentary data flows | Source validation (EP API only), integrity checks |
| **2030+** | Quantum computing threats to TLS encryption | Low (current) — future risk to transport security | Monitor NIST post-quantum cryptography standards |

### 🛡️ AI-Powered Defense Progression

| Phase | Defense Capability | Implementation |
|-------|-------------------|----------------|
| **Current (v1.1)** | Static schema validation, rule-based rate limiting | Zod schemas, token bucket algorithm |
| **Near-term (v1.2)** | Enhanced anomaly detection in request patterns | MetricsService pattern analysis |
| **Medium-term (v2.0)** | AI-assisted threat detection for MCP protocol abuse | ML-based request classification |
| **Long-term (v3.0+)** | Predictive security analytics, automated threat response | Self-learning security controls |

### MCP Protocol-Specific AI Threats

| Threat | Description | Current Control | Future Control |
|--------|-------------|----------------|----------------|
| **Prompt injection via tool args** | AI client generates tool arguments containing injection payloads | Zod schema validation (strict types) | Semantic input analysis |
| **Data harvesting automation** | AI agent systematically extracts all available EP data | Rate limiting (100/min) | Usage pattern detection |
| **Cross-tool correlation attacks** | AI combines outputs from multiple tools to infer sensitive information | Data minimization per tool | Cross-tool correlation monitoring |
| **Model poisoning via cached data** | Compromised EP API responses cached and served to AI models | 15-min cache TTL, EP API as single source | Response integrity validation |

---

## 🇪🇺 EU Cyber Resilience Act — Annex I Mapping

This section maps the European Parliament MCP Server's security controls to the **EU Cyber Resilience Act (CRA) Annex I Essential Cybersecurity Requirements**. Per [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md), this threat model provides evidence for CRA conformity assessment.

### Part I — Product Design & Development Requirements

| CRA Annex I Clause | Requirement (Paraphrased) | EP MCP Implementation | Linked Threat IDs | Status |
|--------------------|---------------------------|----------------------|-------------------|--------|
| **1(a) — Secure by Default** | Products shall be designed, developed, and produced in such a way that they ensure an appropriate level of cybersecurity based on the risks | ✅ Security-by-design architecture: 4-layer defense (Zod validation → rate limiting → audit logging → GDPR compliance); threat modeling integrated into SDLC; STRIDE analysis per component | S-1 through E-4, L-1 through L-5, M-1 through M-7 | ✅ Compliant |
| **1(b) — No Known Exploitable Vulnerabilities** | Products shall be delivered without any known exploitable vulnerabilities | ✅ Dependabot + npm audit + Snyk continuous scanning; SLSA Level 3 provenance; CodeQL SAST on every PR; OpenSSF Scorecard 9.4+ | T-2, S-4, T-3 | ✅ Compliant |
| **1(c) — Secure Data Processing** | Products shall be delivered with a secure by default configuration, including the possibility to reset the product to its original state | ✅ Default configuration uses HTTPS-only (no HTTP fallback); no persistent state (stateless stdio MCP server); environment-variable validation; reset via `npm install` (reinstall) | T-4, S-2, T-1 | ✅ Compliant |
| **1(d) — Confidentiality Protection** | Products shall protect the confidentiality of stored, transmitted, or otherwise processed data, personal or other, such as by encrypting relevant data at rest or in transit by state of the art mechanisms | ✅ HTTPS/TLS 1.3 for all EP API communications; no secrets stored (public API only); stdio transport isolation (local process); public data classification (C: Public per ISMS) | S-2, T-1, I-3, I-4 | ✅ Compliant |
| **1(e) — Integrity Protection** | Products shall protect the integrity of stored, transmitted, or otherwise processed data, commands, programs, and configuration against any manipulation or modification not authorized by the user, as well as report on corruptions | ✅ TLS integrity checks (S-2, T-1); Zod response validation against EP API schema; SLSA provenance for build artifacts; immutable cache entries; no user-writable configuration (env vars only) | T-1, T-2, T-3, E-2 | ✅ Compliant |
| **1(f) — Availability & Minimal Impact** | Products shall process only data that are adequate, relevant, and limited to what is necessary in relation to the intended use of the product (minimize attack surface) | ✅ Data minimization: only public EP data accessed; no PII storage; no credentials required; minimal npm dependencies (26 direct, audited); no shell execution; no filesystem access | E-1, E-3, E-4, I-3, I-4 | ✅ Compliant |
| **1(g) — Exploitation Mitigation** | Products shall minimize their own negative impact on the availability of services provided by other devices or networks | ✅ Client-side rate limiting (100 tokens/min); response-size limits (10MB); timeout controls (30s); LRU cache max-size (500 entries); no resource exhaustion (stateless design) | D-1, D-2, D-3, D-4 | ✅ Compliant |
| **1(h) — Security Event Monitoring** | Products shall be designed, developed, and produced to limit attack surfaces, including external interfaces | ✅ Minimal attack surface: stdio transport (no network exposure); Zod schema validation (strict input surface); TypeScript strict mode; no eval/exec; public MCP protocol (62 tools, 9 resources, 7 prompts) | E-1, E-2, E-3, E-4, S-1 | ✅ Compliant |
| **1(i) — Secure Default Configuration** | Products shall be resilient against outages of external dependencies, e.g., power, cooling, information and communication technology infrastructure | ✅ Stateless design (no persistent dependencies); EP API as single external dependency (fail-fast if unavailable); retry logic + circuit breaker (future); npm package self-contained (all deps bundled in `node_modules/`) | D-1, D-2 | ✅ Compliant |
| **1(j) — Secure Update Mechanisms** | Products shall be designed to facilitate the secure execution and maintenance of software updates and patches | ✅ Structured stderr audit logging (R-1, R-3); ISO 8601 timestamps; request/response logging; GDPR-compliant PII sanitization; future: centralized log aggregation (CloudWatch/SIEM) | R-1, R-2, R-3, I-1 | ✅ Compliant |

### Part II — Vulnerability Handling Requirements

| CRA Annex I Clause | Requirement (Paraphrased) | EP MCP Implementation | Linked Threat IDs | Status |
|--------------------|---------------------------|----------------------|-------------------|--------|
| **2(1) — Vulnerability Identification** | Manufacturers shall identify and document vulnerabilities and components contained in the product, including by drawing up a software bill of materials (SBOM) in a commonly used and machine-readable format | ✅ CycloneDX SBOM generated on every release via GitHub Actions (`anchore/sbom-action`); SBOM quality ≥7.0/10 (NTIA/BSI validation); published to npm package + GitHub releases; SBOM includes all direct + transitive dependencies | T-2, S-4 | ✅ Compliant |
| **2(2) — Address Vulnerabilities Without Delay** | Manufacturers shall address and remediate vulnerabilities without delay, including by providing security updates | ✅ MTTR SLA: Critical <7d, High <30d (per [Vulnerability Management Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md)); Dependabot auto-PRs; npm audit CI/CD gate; rapid security-patch process (SemVer PATCH release) | T-2, S-4 | ✅ Compliant |
| **2(3) — Security Policy** | Manufacturers shall apply effective and regular tests and reviews to ensure the cybersecurity of the product | ✅ [SECURITY.md](SECURITY.md) vulnerability reporting policy; security@hack23.org contact; coordinated disclosure process (90-day embargo); responsible disclosure guidelines per [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) | R-1, R-2, I-1 | ✅ Compliant |
| **2(4) — Vulnerability Disclosure** | Manufacturers shall publicly disclose information about fixed vulnerabilities and security updates, including in a machine-readable format | ✅ Automated testing: Vitest unit tests (80%+ coverage); E2E integration tests; CodeQL SAST (every PR); mutation testing (future); quarterly penetration testing (planned 2026) | T-1, T-2, E-1, E-2 | ✅ Compliant |
| **2(5) — Coordinated Vulnerability Disclosure** | Manufacturers shall facilitate the sharing of information about potential vulnerabilities in their products and associated upstream third-party components | ✅ GitHub Security Advisories (GHSA) for all CVEs; npm advisory database; CHANGELOG.md for all releases; Security section in README.md; CVE publication via MITRE/NVD | T-2, S-4 | ✅ Compliant |
| **2(6) — Information Sharing** | Manufacturers shall establish and enforce policies and procedures for coordinated vulnerability disclosure | ✅ Active participation in npm/GitHub security ecosystems; SBOM + SLSA provenance shared publicly; contribution to OWASP LLM Top 10 / MCP security research; OpenSSF Best Practices badge (public evidence) | T-2, S-4, L-1, M-2 | ✅ Compliant |
| **2(7) — Security Update Distribution** | Manufacturers shall remediate vulnerabilities by providing security updates that can be applied easily, minimizing disruption | ✅ Coordinated disclosure via SECURITY.md; 90-day embargo for responsible disclosure; GitHub Security Advisories for coordination; CVSS scoring per [Vulnerability Management Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) | T-2, R-2 | ✅ Compliant |
| **2(8) — Vulnerability Information to Users** | Manufacturers shall ensure that vulnerabilities are remediated in a timely manner and made available to users | ✅ npm package updates (`npm install european-parliament-mcp-server@latest`); SemVer PATCH for security fixes; CHANGELOG.md documents all fixes; automated Dependabot notifications for downstream users | T-2, S-4 | ✅ Compliant |

### CRA Compliance Summary

| Compliance Area | Total Clauses | Compliant (✅) | Partial (⚠️) | Non-Compliant (❌) | Compliance Rate |
|-----------------|---------------|---------------|-------------|-------------------|-----------------|
| **Part I: Product Design (1a–1j)** | 10 | 10 | 0 | 0 | **100%** |
| **Part II: Vulnerability Handling (2.1–2.8)** | 8 | 8 | 0 | 0 | **100%** |
| **Overall CRA Annex I** | **18** | **18** | **0** | **0** | **100%** |

**Cross-Reference:** For complete CRA conformity assessment including Article 10 (EU Declaration of Conformity), Article 20 (Technical Documentation), and Annex V (Conformity Assessment Process), see **[CRA-ASSESSMENT.md](CRA-ASSESSMENT.md)**.

---

## ✍️ Residual-Risk Acceptance Log

This section documents **accepted residual risks** where mitigation costs exceed risk impact, per [Hack23 Risk Management Policy §4.3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Management_Policy.md). All residual risks are formally accepted by the CEO with scheduled quarterly review.

### Residual Risk Register

| Risk ID | Description | Residual Risk Level | Accepted By | Date | Review Date | Rationale |
|---------|-------------|---------------------|-------------|------|-------------|-----------|
| **Scenario-4-GDPR** | GDPR personal data exposure via verbose error messages or debug logs containing MEP PII (addresses, contact info, declarations) | **Low-Medium**<br/>(I-1, I-2 partially mitigated) | CEO / Hack23 AB | 2026-04-28 | 2026-07-28 | **Risk:** €100–€500k ALE (worst-case €10M GDPR fine, realistic €0–10k for OSS project with no revenue).<br/>**Mitigation:** ✅ Sanitized error handling implemented; ⚠️ Production log review ongoing; ✅ Public data focus (C: Public classification).<br/>**Acceptance Criteria:** Residual risk acceptable given (1) public EP data only (no GDPR Article 9 special-category data processed), (2) error sanitization controls in place (I-1), (3) realistic GDPR fine for €0-revenue OSS is €0–10k (administrative, not €10M), (4) cost of 100% PII elimination (€15k–25k for ML-based log scanning) exceeds realistic ALE.<br/>**Compensating Controls:** Quarterly production log audits for PII leakage; automated PII-detection regex (overdue since 2025 Q3). |
| **Scenario-1-Supply-Chain** | Supply chain compromise via backdoored npm dependency or compromised maintainer account | **Medium**<br/>(T-2, S-4 mitigated but non-zero residual) | CEO / Hack23 AB | 2026-04-28 | 2026-07-28 | **Risk:** €500–€2k ALE (ARO 0.1–0.2/year, SLE €5k–10k).<br/>**Mitigation:** ✅ Dependabot alerts; ✅ SLSA Level 3; ✅ npm audit + Snyk; ✅ SBOM (CycloneDX); ✅ package-lock.json pinning.<br/>**Acceptance Criteria:** Residual risk acceptable given (1) comprehensive supply-chain controls (SLSA L3 + Dependabot + SBOM), (2) ARO very low (0.1–0.2/year = 1 incident per 5–10 years for well-protected packages), (3) cost of additional controls (hardware security modules for signing, €10k–20k/year) exceeds ALE (€500–2k/year).<br/>**Compensating Controls:** Continuous OpenSSF Scorecard monitoring (target ≥9.0); community review of all dependency updates; npm 2FA + OIDC publishing. |
| **L-3-Excessive-Agency** | Autonomous AI agent invoking high-volume tool chains causing EP API quota exhaustion (LLM06 Excessive Agency) | **Medium**<br/>(D-1 mitigated but agent-unaware) | CEO / Hack23 AB | 2026-04-28 | 2026-07-28 | **Risk:** €50–€450 ALE (ARO 0.1–0.3/year, SLE €500–1.5k).<br/>**Mitigation:** ✅ Token bucket rate limiter (100/min); ⚠️ No per-session limits; ⚠️ No autonomous-agent detection.<br/>**Acceptance Criteria:** Residual risk acceptable given (1) rate limiting provides baseline DoS protection, (2) stdio transport limits abuse to single-process (no multi-client amplification), (3) cost of agent-fingerprinting + adaptive rate limiting (€8k–12k development effort) exceeds current ALE, (4) EP API has own rate limits (upstream protection).<br/>**Compensating Controls:** Monitor for sustained rate-limit denials (future: add `rate_limit_exceeded` audit event); future v2.0: per-session quotas for HTTP/SSE transport. |

### Risk Acceptance Governance

| Governance Requirement | Implementation | Status |
|------------------------|---------------|--------|
| **Acceptance Authority** | CEO / Hack23 AB (per [Risk Management Policy §4.3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Management_Policy.md)) | ✅ Documented |
| **Review Frequency** | Quarterly (aligned with threat model review cycle) | ✅ Scheduled 2026-07-28 |
| **Acceptance Criteria** | (1) Mitigation cost > ALE, (2) Compensating controls in place, (3) Business justification documented | ✅ Applied to all 3 risks |
| **Re-Evaluation Triggers** | (1) Control failure, (2) Threat landscape change, (3) New vulnerability disclosure, (4) Regulatory update | ✅ Documented in [Incident Response Plan](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) |

**Next Scheduled Review:** **2026-07-28** (quarterly review aligned with threat model refresh cycle per [Hack23 Threat Modeling Policy §5](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md)).

---

## 📚 Related Documents

| Document | Description | Link |
|----------|-------------|------|
| 🛡️ Security Architecture | Current security design and controls | [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) |
| 🚀 Future Security Architecture | Planned security enhancements | [FUTURE_SECURITY_ARCHITECTURE.md](../_media/FUTURE_SECURITY_ARCHITECTURE.md) |
| 🔮 Future Threat Model | Threat analysis for planned architecture evolution | [FUTURE_THREAT_MODEL.md](../_media/FUTURE_THREAT_MODEL.md) |
| 🔄 Business Continuity Plan | Recovery objectives and procedures | [BCPPlan.md](../_media/BCPPlan.md) |
| 🛡️ CRA Assessment | EU Cyber Resilience Act conformity | [CRA-ASSESSMENT.md](CRA-ASSESSMENT.md) |
| 🏛️ Architecture | System architecture overview | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 📊 Data Model | Data structures and relationships | [DATA_MODEL.md](DATA_MODEL.md) |
| 🔒 Security Policy | Security reporting and disclosure | [SECURITY.md](SECURITY.md) |

---

<p align="center">
  <em>This threat model is maintained as part of the <a href="https://github.com/Hack23/ISMS-PUBLIC">Hack23 AB ISMS</a> framework.</em><br>
  <em>Licensed under <a href="../_media/LICENSE.md">Apache-2.0</a></em>
</p>
