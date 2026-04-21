<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📦 European Parliament MCP Server — End-of-Life Strategy</h1>

<p align="center">
  <strong>🛡️ Proactive Technology Lifecycle Management for MCP Server</strong><br>
  <em>📦 Current Stack Maintenance • 🔄 Node.js New Release Model • ⚡ Future-Ready Architecture</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--03--12-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Annual-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 3.0 | **📅 Last Updated:** 2026-04-21 (UTC)  
**🔄 Review Cycle:** Annual | **⏰ Next Review:** 2027-04-21  
**🏷️ Classification:** Public (Open Source MCP Server)

---

## 📑 Table of Contents

- [EOL Strategy Overview](#-eol-strategy-overview)
- [Current Technology Stack](#-current-technology-stack-analysis)
- [Technology Lifecycle Matrix](#-technology-lifecycle-matrix)
- [Node.js Release Schedule Evolution](#-nodejs-release-schedule-evolution)
- [Node.js Version Strategy](#-nodejs-version-strategy)
- [Node.js Transition Roadmap](#-nodejs-transition-roadmap)
- [Dependency EOL Monitoring](#-dependency-eol-monitoring)
- [npm Package Lifecycle](#-npm-package-lifecycle)
- [EOL Trigger Criteria](#-eol-trigger-criteria)
- [Migration Procedures](#-migration-procedures)
- [Archive & Preservation](#-archive--preservation)
- [Policy Alignment](#-policy-alignment)
- [Related Documents](#-related-documents)
- [Revision History](#-revision-history)

---

## 🎯 EOL Strategy Overview

### **📋 Strategic Objective**

The European Parliament MCP Server will maintain its current technology stack, utilizing modern TypeScript/Node.js with the MCP SDK, following Hack23 AB's **"Living on the Edge"** philosophy — maintaining latest stable releases with comprehensive automated testing and security validation.

This strategy aligns with [Hack23 AB's Vulnerability Management Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md).

### **🏷️ Business Impact Classification**

| Dimension | Level | EOL Impact | Rationale |
|----------|-------|------------|-----------|
| **🔐 Confidentiality** | [![Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels) | Low | Open source, public data |
| **🔒 Integrity** | [![Moderate](https://img.shields.io/badge/I-Moderate-yellow?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#integrity-levels) | Medium | Data accuracy matters |
| **⚡ Availability** | [![Standard](https://img.shields.io/badge/A-Standard-lightgreen?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#availability-levels) | Medium | Tolerates maintenance windows |

---

## 📦 Current Technology Stack Analysis

```mermaid
graph TB
    subgraph "🏗️ Core Runtime"
        NODE[Node.js 25.x Current]
        TS[TypeScript 6.0.2]
    end
    subgraph "📦 Key Dependencies"
        MCP["@modelcontextprotocol/sdk"]
        ZOD[Zod 4.x]
    end
    subgraph "🧪 Testing"
        VIT[Vitest]
    end
    subgraph "🔧 Build & Distribution"
        NPM[npm Registry]
        GHA[GitHub Actions]
        TSC[tsc Compiler]
    end

    NODE --> TS --> MCP & ZOD
    TS --> TSC --> NPM
    VIT --> GHA
```

---

## 🔄 Technology Lifecycle Matrix

| Component | Current Version | EOL Date | Risk Level | Migration Path |
|-----------|----------------|----------|------------|---------------|
| **Node.js** | >=25.0.0 (25.x Current) | **April 2026** 🔴 | 🔴 **IMMINENT** | **Upgrade to Node.js 26 immediately upon release (≈ April 22, 2026 — this week)** |
| **Node.js 26** | Releasing April 2026 | April 2029 | 🟢 Low | Will be even-numbered LTS candidate; migrate within days of release |
| **TypeScript** | 6.0.2 | Active | 🟢 Low | Stay on 6.0.x until the next supported minor |
| **MCP SDK** | Latest | Active | 🟡 Medium | Track protocol evolution |
| **Zod** | ^4.3.6 (4.x) | Active | 🟢 Low | Follow semver updates |
| **Vitest** | Latest | Active | 🟢 Low | Follow semver updates |
| **npm** | Registry | Indefinite | 🟢 Low | N/A |
| **GitHub Actions** | Latest | Indefinite | 🟢 Low | Pin action versions |

> ⚠️ **Node.js 25 is an odd-numbered Current release** (old release model). It has **no LTS phase** and reaches EOL when Node.js 26 releases in April 2026. Upgrade to Node.js 26 within days of its release.
> ✅ **TypeScript 6.0.2 is now the active compiler baseline.** TypeScript 5.9.x is retained only as the previous stable line and is no longer part of the active toolchain.

### **📅 Key Dates**

| Event | Date | Action Required |
|-------|------|----------------|
| **Node.js 25 EOL** | **≈ April 2026** 🔴 | **Upgrade to Node.js 26 IMMEDIATELY on release** |
| **Node.js 26 release** | **≈ April 22, 2026** 🔴 | **Upgrade all CI/CD and `engines` field — target: within 2 days of release** |
| Node.js 26 LTS promotion | October 2026 | Confirmed long-term support; 36-month runway confirmed |
| Node.js 26 maintenance | October 2028 | Security-only updates; begin evaluating Node.js 27 |
| Node.js 27 Alpha opens | October 2026 | Begin CI testing on alpha channel (new release model) |
| Node.js 27 Current release | April 2027 | Stabilization; evaluate for production (new model: every release = LTS) |
| Node.js 27 LTS promotion | October 2027 | Begin production migration if Node.js 26 maintenance window is undesirable |
| Node.js 26 EOL | April 2029 | Must have migrated to Node.js 27+ |
| Node.js 28 Alpha opens | October 2027 | Monitor for early testing |
| Node.js 28 Current release | April 2028 | Next annual release (new model) |
| Node.js 27 EOL | April 2030 | 36 months total support |

> **Note:** Starting with Node.js 27, the release schedule changes to **one major release per year** with **every release becoming LTS**. See [Node.js Release Schedule Evolution](#-nodejs-release-schedule-evolution) for details.

---

## 🔄 Node.js Release Schedule Evolution

### **📢 New Release Model (Starting Node.js 27.x)**

In March 2026, the Node.js project [announced a fundamental change](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule) to its release schedule, effective from October 2026. This section documents the impact on the European Parliament MCP Server's lifecycle management.

#### **🔀 Old Model vs. New Model**

| Aspect | Old Model (≤ Node.js 26) | New Model (≥ Node.js 27) |
|--------|--------------------------|--------------------------|
| **Major releases per year** | 2 (April + October) | 1 (April) |
| **LTS eligibility** | Even-numbered only | **Every release** |
| **Odd-numbered releases** | Current only (no LTS) | N/A — distinction removed |
| **LTS promotion** | October (even releases) | October (all releases) |
| **Total support lifetime** | ~30 months (LTS only) | **36 months** (Current + LTS) |
| **Alpha channel** | None | **New:** Oct–Mar, semver-major allowed |
| **Version numbering** | Sequential (24, 25, 26…) | Calendar-year aligned (27 in 2027, 28 in 2028) |

#### **📊 New Release Phases**

| Phase | Duration | Description |
|-------|----------|-------------|
| **Alpha** | 6 months (Oct → Mar) | Early testing, semver-major changes allowed |
| **Current** | 6 months (Apr → Oct) | Stabilization, no new breaking changes |
| **LTS** | 30 months (Oct → EOL) | Long-term support with security fixes |
| **EOL** | — | No further support |
| **Total support** | **36 months** | From first Current release to End of Life |

#### **📈 Impact on This Project**

| Impact Area | Assessment | Action |
|-------------|-----------|--------|
| **Upgrade frequency** | 🟢 Positive | One major upgrade/year instead of two evaluation cycles |
| **LTS availability** | 🟢 Positive | Every release becomes LTS — no more skipping odd versions |
| **Alpha testing** | 🟡 Requires action | Must integrate alpha channel into CI for early bug detection |
| **Planning predictability** | 🟢 Positive | Calendar-year versioning simplifies upgrade scheduling |
| **Support window** | 🟢 Positive | 36-month total support provides longer runway |
| **Library compatibility** | 🟡 Monitor | Library authors encouraged to test on alpha early |

#### **🗓️ Node.js Release Timeline Visualization**

```mermaid
gantt
    title Node.js Release Lifecycle — Old vs. New Model
    dateFormat YYYY-MM-DD
    axisFormat %Y-%m

    section Current (Node.js 25 — Odd/Current Only)
    Node.js 25 Current         :active, n25c, 2025-10-28, 2026-04-22
    Node.js 25 EOL             :crit, milestone, n25eol, 2026-04-22, 0d

    section Legacy Model (Node.js 26 — Last Even/LTS)
    Node.js 26 Current         :n26c, 2026-04-22, 2026-10-28
    Node.js 26 LTS             :n26lts, 2026-10-28, 2029-04-30
    Node.js 26 EOL             :crit, milestone, n26eol, 2029-04-30, 0d

    section New Model (Node.js 27)
    Node.js 27 Alpha           :n27a, 2026-10-01, 2027-03-31
    Node.js 27 Current         :n27c, 2027-04-01, 2027-10-01
    Node.js 27 LTS             :n27lts, 2027-10-01, 2030-04-01
    Node.js 27 EOL             :crit, milestone, n27eol, 2030-04-01, 0d

    section New Model (Node.js 28)
    Node.js 28 Alpha           :n28a, 2027-10-01, 2028-03-31
    Node.js 28 Current         :n28c, 2028-04-01, 2028-10-01
    Node.js 28 LTS             :n28lts, 2028-10-01, 2031-04-01
    Node.js 28 EOL             :crit, milestone, n28eol, 2031-04-01, 0d

    section EP MCP Server Strategy
    Production on Node.js 25   :active, ep25, 2025-10-28, 2026-04-22
    URGENT: Upgrade to Node 26 :crit, ep26upgrade, 2026-04-22, 2026-04-24
    Production on Node.js 26   :ep26, 2026-04-22, 2027-10-01
    Alpha 27 CI Testing        :ep27alpha, 2026-10-01, 2027-04-01
    Node.js 27 Evaluation      :ep27eval, 2027-04-01, 2027-10-01
    Production on Node.js 27   :ep27prod, 2027-10-01, 2030-04-01
    Alpha 28 CI Testing        :ep28alpha, 2027-10-01, 2028-04-01
```

> **Source:** [Evolving the Node.js Release Schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule) — see also [nodejs/Release#1113](https://github.com/nodejs/Release/issues/1113) for background discussion.

---

## 📋 Node.js Version Strategy

Following the **"Living on the Edge"** philosophy from [Vulnerability Management Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md):

1. **Track Latest Current:** Run Node.js 25.x (Current) in production today; upgrade to Node.js 26 within **2 days** of its April 2026 release
2. **Rapid Even-Number Adoption:** Node.js 26 (even, LTS candidate) releases ≈ April 22, 2026 — upgrade immediately to avoid running an EOL Node.js 25 in production
3. **Alpha CI Integration:** Add Node.js alpha releases to CI matrix as soon as the alpha channel opens (per Node.js project guidance for library authors)
4. **Early Testing:** Begin production evaluation during the Current phase (April–October)
5. **Rapid Adoption:** Migrate to new LTS within 1 month of LTS promotion (October)
6. **CI Matrix:** Test against current, next Current/alpha, and previous LTS
7. **Automated Alerts:** Dependabot monitors for Node.js security updates

> ⚠️ **URGENT ACTION REQUIRED:** Node.js 25 (odd-numbered, Current-only) reaches End-of-Life when Node.js 26 releases **this week** (≈ April 22, 2026). Upgrade plan is documented in the [Node.js 25 → 26 Transition Plan](#-nodejs-25--26-transition-plan-urgent) below.

### **🔄 Upgrade Process (Updated for New Release Model)**

```
Phase 1 — Alpha Testing (Oct–Mar, 6 months before release)
  1. Add Node.js alpha to CI matrix (non-blocking)
  2. Report upstream bugs found during testing
  3. Track dependency compatibility with alpha

Phase 2 — Current Evaluation (Apr–Oct, pre-LTS)
  4. Promote alpha CI jobs to required status
  5. Run full test suite (unit + E2E) on Current release
  6. Benchmark performance against current LTS
  7. Review breaking changes and update code as needed

Phase 3 — LTS Migration (Oct, on LTS promotion)
  8. Update engines field in package.json
  9. Update GitHub Actions workflow matrix
  10. Run: npm install (rebuild native modules if any)
  11. Run: npm run test:all && npm run lint (full validation)
  12. Update documentation (README, DEVELOPER_GUIDE, this EOL Strategy)
  13. Publish new npm version
```

---

## 🗺️ Node.js Transition Roadmap

### **📋 Node.js 25 → 26 Transition Plan (URGENT)**

> 🔴 **Node.js 25 EOL is imminent** — it expires when Node.js 26 releases this week (≈ April 22, 2026). Execute this plan immediately upon Node.js 26 release.

| Phase | Timeline | Actions | Risk |
|-------|----------|---------|------|
| **Current Production** | Now (April 2026) | Node.js 25.x Current in production | 🔴 **HIGH — EOL imminent (Node 26 releasing this week)** |
| **Day 0: Node.js 26 Release** | ≈ April 22, 2026 | Update `package.json` engines, all CI/CD workflows, devcontainer | 🟡 Medium |
| **Day 0–2: Validation** | April 22–24, 2026 | Run full test suite, lint, build on Node.js 26; publish new npm version | 🟡 Medium |
| **Day 2+: Production** | April 24, 2026+ | Node.js 26 in production; Node.js 25 fully retired | 🟢 Low |
| **Node.js 26 LTS** | October 2026 | LTS promotion confirmed; 36-month runway from April 2026 | 🟢 Low |

#### **📋 Node.js 26 Upgrade Checklist (Execute on Release Day)**

```
Day 0 — Upgrade (April 22, 2026, release day):
  Step 1:  Update package.json engines: "node": ">=26.0.0"
  Step 2:  Update all GitHub Actions workflows: node-version: "26"
  Step 3:  Update .devcontainer/devcontainer.json: node version 26
  Step 4:  Update documentation: README.md, DEVELOPER_GUIDE.md, LOCAL_TESTING.md, etc.
  Step 5:  Update End-of-Life-Strategy.md: Technology Lifecycle Matrix and roadmap
  Step 6:  Update WORKFLOWS.md, FUTURE_WORKFLOWS.md
  Step 7:  Run: npm ci (rebuild any native modules)
  Step 8:  Run: npm test (full test suite — 1130+ unit tests and 71 E2E tests must pass)
  Step 9:  Run: npm run lint (zero warnings required)
  Step 10: Run: npm run build (TypeScript compilation must succeed)
  Step 11: Run: npm run knip (no unused exports)

Day 1 — Publish:
  Step 12: Publish updated npm package with Node.js 26 as minimum engine
  Step 13: Open PR with all version bumps and documentation updates
  Step 14: Merge and tag new release

Day 2 — Validation:
  Step 15: Verify npm package installs correctly on Node.js 26
  Step 16: Test MCP client connectivity (stdio transport)
  Step 17: Confirm CI/CD pipelines green on Node.js 26
```

### **📋 Node.js 26 → 27 Transition Plan**

| Phase | Timeline | Actions | Risk |
|-------|----------|---------|------|
| **Current Production** | Apr 2026 – Oct 2027 | Node.js 26 LTS in production | 🟢 Low |
| **Alpha 27 CI** | Oct 2026 – Mar 2027 | Add `27.0.0-alpha.*` to CI matrix (non-blocking) | 🟢 Low |
| **Current 27 Eval** | Apr 2027 – Oct 2027 | Test on Node.js 27.x Current; fix compatibility issues | 🟡 Medium |
| **LTS 27 Migration** | Oct 2027 | Upgrade production to Node.js 27 LTS | 🟡 Medium |
| **Node.js 26 Sunset** | Apr 2029 | Node.js 26 reaches EOL; must be fully on 27+ | 🟢 Low (if planned) |

### **🧪 Node.js 27 Alpha Integration Strategy**

Per the Node.js project's guidance, **library authors should integrate Alpha releases into CI as early as possible** to report bugs before they affect users. As an npm-published MCP server, this project will:

1. **Add alpha CI job** (non-blocking, `continue-on-error: true`) when Node.js 27 alpha opens in October 2026
2. **Report regressions** upstream to Node.js via GitHub issues
3. **Track breaking V8 changes** that may affect TypeScript compilation or runtime behavior
4. **Monitor MCP SDK compatibility** with the new Node.js version
5. **Validate Zod runtime behavior** under new V8 engine optimizations

### **📊 Full Node.js Roadmap Projections (2026–2031)**

| Year | Node.js Version | Release Date | Phase | Action for this Project |
|------|----------------|-------------|-------|-------------------------|
| **2026** | **25.x** | Oct 2025 | ⚠️ Current (EOL Apr 2026) | **CURRENT — upgrade to 26 ASAP** |
| **2026** | **26.x** | ≈ Apr 22, 2026 | Current → LTS (Oct 2026) | **Upgrade within 2 days of release** |
| **2026** | 27.x Alpha | Oct 2026 | Alpha | Add to CI matrix (non-blocking) |
| **2027** | 27.x | Apr 2027 | Current → LTS (Oct 2027) | Evaluate; new release model (every version = LTS) |
| **2027** | 28.x Alpha | Oct 2027 | Alpha | Add to CI matrix (non-blocking) |
| **2028** | 28.x | Apr 2028 | Current → LTS (Oct 2028) | Evaluate for migration from 27.x |
| **2029** | **Node.js 26 EOL** | Apr 2029 | — | Must be fully on 27+ before this date |
| **2029** | 29.x Alpha | Oct 2028 | Alpha | Add to CI matrix |
| **2030** | **Node.js 27 EOL** | Apr 2030 | — | Must be fully on 28+ before this date |
| **2031** | **Node.js 28 EOL** | Apr 2031 | — | Must be fully on 29+ before this date |

> **Note:** Starting with Node.js 27 (released April 2027), the release schedule changes to **one major release per year** with **every release becoming LTS**. See [Node.js Release Schedule Evolution](#-nodejs-release-schedule-evolution) for details.

---

## 🛡️ Dependency EOL Monitoring

### **🤖 Automated Monitoring**

| Tool | Purpose | Frequency |
|------|---------|-----------|
| Dependabot | Dependency version updates | Daily |
| npm audit | Vulnerability scanning | Per CI/CD run |
| OpenSSF Scorecard | Project health monitoring | Weekly |
| GitHub Security Advisories | CVE notifications | Real-time |

### **📋 Manual Reviews**

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Dependency audit | Quarterly | Development team |
| Node.js roadmap review | Semi-annual | Tech lead |
| MCP protocol evolution | Quarterly | Development team |
| EP API changes | Monthly | Development team |

---

## 📦 npm Package Lifecycle

### **📋 Version Strategy**

| Phase | Version Range | Support Level |
|-------|-------------|---------------|
| Active Development | Current major | Full support |
| Maintenance | Previous major | Security fixes only |
| Deprecated | Older versions | No support, deprecation notice |
| Archived | N/A | npm deprecation, GitHub archive |

### **⚠️ Deprecation Process**

1. **Notice Period:** 6 months before EOL
2. **npm Deprecation:** `npm deprecate` with migration instructions
3. **README Update:** Clear deprecation banner
4. **GitHub Archive:** Repository archived with read-only access
5. **Documentation:** Preserved for reference

---

## 🚨 EOL Trigger Criteria

The project reaches End-of-Life when any of the following occur:

| Trigger | Description | Impact |
|---------|-------------|--------|
| 🔌 MCP Protocol Obsolescence | MCP protocol replaced by successor | Architecture rewrite required |
| 🏛️ EP API Discontinued | European Parliament data API shut down | Core functionality lost |
| 📦 Node.js Platform EOL | No supported Node.js LTS available | Runtime unavailable |
| 🔒 Unresolvable Security Issue | Critical vulnerability with no fix | Security risk unacceptable |
| 👥 Maintainer Unavailability | No active maintainers for > 12 months | No security updates |

---

## 🔧 Migration Procedures

### **Node.js Version Upgrade (Current Model — Node.js 25/26)**

Node.js 25 is an **odd-numbered Current-only release** (old model). It has **no LTS phase** and expires when Node.js 26 releases. Upgrade procedure:

```
IMMEDIATE Upgrade to Node.js 26 (upon April 2026 release):
  Step 1: Update package.json engines: "node": ">=26.0.0"
  Step 2: Update GitHub Actions workflows: node-version: "26"
  Step 3: Update .devcontainer: node version 26
  Step 4: Run: npm ci (rebuild native modules if any)
  Step 5: Run: npm test (full test suite — 1130+ unit tests and 71 E2E tests)
  Step 6: Run: npm run lint (code quality check)
  Step 7: Run: npm run build (TypeScript compilation)
  Step 8: Update all documentation (README, DEVELOPER_GUIDE, this EOL Strategy)
  Step 9: Publish new npm version
  Step 10: Verify npm package installs correctly on Node.js 26
  Step 11: Test MCP client connectivity (stdio transport)
  Step 12: Monitor CI/CD for 24 hours before closing the upgrade PR
```

### **Node.js Version Upgrade (New Annual Release Model — Node.js 27+)**

Starting with Node.js 27+, upgrades follow the new **annual release cadence** with a 6-month alpha → 6-month Current → 30-month LTS lifecycle:

```
Pre-Migration (Alpha Phase, Oct–Mar):
  Step 1: Add alpha version to CI matrix as non-blocking job
  Step 2: Monitor test failures and file upstream issues
  Step 3: Track dependency compatibility reports

Migration (On LTS Promotion, October):
  Step 4: Update package.json engines field to new LTS version
  Step 5: Update GitHub Actions workflow (Node.js version matrix)
  Step 6: Run: npm install (rebuild native modules if any)
  Step 7: Run: npm test (full test suite — 1130+ unit tests and 71 E2E tests)
  Step 8: Run: npm run lint (code quality check)
  Step 9: Run: npm run build (TypeScript compilation)
  Step 10: Update documentation (README, DEVELOPER_GUIDE, End-of-Life-Strategy.md)
  Step 11: Publish new npm version

Post-Migration Validation:
  Step 12: Verify npm package installs correctly on new Node.js version
  Step 13: Test MCP client connectivity (stdio transport)
  Step 14: Monitor production for 1 week before removing old Node.js from CI
```

### **TypeScript Version Upgrade**

```
Step 1: Update typescript dependency
Step 2: Review tsconfig.json for new options
Step 3: Fix any new type errors
Step 4: Run full test suite
Step 5: Publish patch release
```

### **MCP SDK Upgrade**

```
Step 1: Review MCP SDK changelog for breaking changes
Step 2: Update @modelcontextprotocol/sdk dependency
Step 3: Update tool/resource registrations if needed
Step 4: Run E2E tests with MCP client
Step 5: Update API documentation
Step 6: Publish new version
```

---

## 📊 Archive & Preservation

### **📦 Archive Checklist**

| Item | Action | Status |
|------|--------|--------|
| npm deprecation notice | `npm deprecate` with message | On EOL |
| GitHub repository archive | Set repository to archived | On EOL |
| README deprecation banner | Add clear deprecation notice | On EOL |
| Documentation preservation | Docs remain accessible | Permanent |
| Release artifacts | GitHub releases preserved | Permanent |
| SBOM records | Final SBOM archived | On EOL |

### **🔒 GDPR Compliance**

- No personal data stored in the application
- EP data is publicly available parliamentary records
- No user accounts or tracking data to delete
- Repository archives comply with data retention policies

---

## 🔗 Policy Alignment

| ISMS Policy | Relevance | Link |
|-------------|-----------|------|
| 🔍 Vulnerability Management | "Living on the Edge" philosophy | [Vulnerability_Management.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) |
| 🔒 Secure Development | Technology lifecycle requirements | [Secure_Development_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| 🔄 Backup & Recovery | Archive and preservation | [Backup_Recovery_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Backup_Recovery_Policy.md) |
| 🏷️ Classification | Impact-driven lifecycle decisions | [CLASSIFICATION.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |
| 🌐 Open Source Policy | OSS governance and lifecycle | [Open_Source_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) |

---

## 📚 Related Documents

| Document | Description | Link |
|----------|-------------|------|
| 🛡️ Security Architecture | Current security controls | [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) |
| 🎯 Threat Model | Risk assessment | [THREAT_MODEL.md](THREAT_MODEL.md) |
| 🔄 Business Continuity Plan | Recovery procedures | [BCPPlan.md](BCPPlan.md) |
| 💰 Financial Security Plan | Cost planning | [FinancialSecurityPlan.md](FinancialSecurityPlan.md) |
| ⚡ Performance Testing | Benchmarks & analysis | [performance-testing.md](performance-testing.md) |
| 🏛️ Architecture | System design | [ARCHITECTURE.md](ARCHITECTURE.md) |

---

## 📝 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-20 | CEO | Initial EOL strategy — technology stack analysis, lifecycle matrix, dependency monitoring, migration procedures |
| 2.0 | 2026-03-12 | CEO | Major update: Node.js new release schedule (one major/year, every release LTS, alpha channel); added transition roadmap, Gantt timeline, release model comparison; updated version strategy for alpha CI integration; aligned with [nodejs/Release#1113](https://github.com/nodejs/Release/issues/1113) |
| 3.0 | 2026-03-18 | CEO | **Node.js 25 migration:** Updated current production runtime to Node.js 25.x (Current); added urgent Node.js 26 upgrade plan (≈ April 22, 2026 — 2-week target); expanded full Node.js roadmap projections 2026–2031; updated Technology Lifecycle Matrix with Node.js 25 EOL risk; added Node.js 25 → 26 transition checklist; updated Gantt chart with Node.js 25 EOL and Node.js 26 LTS timeline |
| 3.1 | 2026-04-21 | CEO | Documentation review — verified accuracy of current state; confirmed Node.js 25 EOL is imminent (Node.js 26 releasing this week, ≈ April 22, 2026); updated test count references from "2500+/2600+" to "1130+ unit tests and 71 E2E tests"; aligned references with ARCHITECTURE.md and WORKFLOWS.md |

---

<p align="center">
  <em>This EOL strategy is maintained as part of the <a href="https://github.com/Hack23/ISMS-PUBLIC">Hack23 AB ISMS</a> framework.</em><br>
  <em>Licensed under <a href="LICENSE.md">Apache-2.0</a></em>
</p>
