**European Parliament MCP Server API v0.8.2**

***

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">🏛️ European Parliament MCP Server</h1>

<p align="center">
  <strong>Model Context Protocol Server for European Parliament Open Data</strong><br>
  <em>Providing AI assistants with structured access to parliamentary datasets and OSINT Intelligence Capabilities</em>
</p>

<table>
  <tr>
    <td width="120" align="center">
      <img src="https://img.shields.io/badge/MCP-Server-6366F1?style=for-the-badge&logo=typescript&logoColor=white" width="80" alt="European Parliament MCP Server"/>
      <div>
        <a href="https://www.npmjs.com/package/european-parliament-mcp-server">
          <img src="https://img.shields.io/npm/v/european-parliament-mcp-server.svg" alt="npm version">
        </a>
      </div>
    </td>
    <td>
      <p><strong>Model Context Protocol Server for European Parliament Open Data</strong> — providing AI assistants with structured access to MEPs, plenary sessions, committees, legislative documents, and parliamentary questions through a secure, type-safe TypeScript implementation.</p>
      <p>MEP influence scoring (5-dimension model), Coalition cohesion & stress analysis, Party defection & anomaly detection, Cross-group comparative analysis, MEP/committee legislative scoring, Pipeline status & bottleneck detection, Committee workload & engagement analysis, MEP attendance patterns & trends, Country delegation voting & composition, Parliament-wide political landscape</p>
      <div>
        <a href="https://github.com/Hack23/European-Parliament-MCP-Server"><strong>📂 Repository</strong></a> •
        <a href="https://hack23.com/european-parliament-mcp-features.html"><strong>✨ Features</strong></a> •
        <a href="https://hack23.com/european-parliament-mcp-docs.html"><strong>📚 Documentation</strong></a> •
        <a href="https://www.npmjs.com/package/european-parliament-mcp-server"><strong>📦 npm</strong></a>
      </div>
    </td>
  </tr>
</table>

[![ISMS](https://img.shields.io/badge/Hack23-ISMS-blue)](https://github.com/Hack23/ISMS-PUBLIC)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Hack23/European-Parliament-MCP-Server)

## 📊 Quality Metrics & Documentation

<p align="center">
  <!-- Test Coverage -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/coverage/">
    <img src="https://img.shields.io/badge/Test%20Coverage-80%25%2B-brightgreen?style=flat-square&logo=vitest" alt="Test Coverage">
  </a>
  
  <!-- Unit Tests -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/test-results/">
    <img src="https://img.shields.io/badge/Unit%20Tests-1130%20Passing-brightgreen?style=flat-square&logo=vitest" alt="Unit Test Results">
  </a>
  
  <!-- E2E Tests -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/e2e-results/">
    <img src="https://img.shields.io/badge/E2E%20Tests-23%20Passing-brightgreen?style=flat-square&logo=playwright" alt="E2E Test Results">
  </a>
  
  <!-- API Documentation -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/api/">
    <img src="https://img.shields.io/badge/API%20Docs-TypeDoc-blue?style=flat-square&logo=typescript" alt="API Documentation">
  </a>
  
  <!-- Documentation Portal -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/">
    <img src="https://img.shields.io/badge/📚%20Documentation-Portal-blue?style=flat-square" alt="Documentation Portal">
  </a>
</p>

## 📋 Overview

The **European Parliament MCP Server** implements the [Model Context Protocol (MCP)](https://spec.modelcontextprotocol.io/) to provide AI assistants, IDEs, and other MCP clients with structured access to European Parliament open datasets. Access information about MEPs, plenary sessions, committees, legislative documents, and parliamentary questions through a secure, type-safe TypeScript/Node.js implementation.

### 🎯 Key Features

- 🔌 **Full MCP Implementation**: 45 tools (7 MEP + 7 plenary & meeting + 2 committee + 7 document + 3 legislative + 3 advanced analysis + 14 OSINT intelligence), 9 Resources, and 7 Prompts
- 🏛️ **Complete EP API v2 Coverage**: All European Parliament Open Data API endpoints covered
- 🕵️ **OSINT Intelligence**: MEP influence scoring, coalition analysis, anomaly detection
- 🔒 **Security First**: ISMS-compliant, GDPR-ready, SLSA Level 3 provenance
- 🚀 **High Performance**: <200ms API responses, intelligent caching, rate limiting
- 📊 **Type Safety**: TypeScript strict mode + Zod runtime validation
- 🧪 **Well-Tested**: 80%+ code coverage, 1130+ unit tests, 23 E2E tests
- 📚 **Complete Documentation**: Architecture, TypeDoc API (HTML + Markdown), security guidelines

---

## 🌍 Hack23 Political Intelligence Ecosystem

This MCP server is part of **[Hack23's](https://hack23.com/)** mission to **disrupt journalism with AI-generated news coverage and real-time analysis of democratic governments** — increasing transparency and accountability through open-source intelligence.

### 🎯 Vision: AI-Powered Democratic Transparency

Hack23 builds **open-source intelligence platforms** that enable citizens, journalists, and researchers to monitor democratic institutions in real-time. By combining MCP servers, AI analysis, and open parliamentary data, we create automated intelligence products that were previously only available to well-funded lobbying organizations.

> *"Democratizing access to political intelligence — what used to require a team of analysts can now be done by any citizen with an AI assistant."*

### 🔗 Hack23 Projects

### 🇪🇺 EU Parliament Monitor

<table>
  <tr>
    <td width="120" align="center">
      <img src="https://img.shields.io/badge/EU-Parliament-003399?style=for-the-badge&logo=european-union&logoColor=FFCC00" width="80" alt="EU Parliament Monitor"/>
      <div>
        <a href="https://github.com/Hack23/euparliamentmonitor">
          <img src="https://img.shields.io/github/v/release/Hack23/euparliamentmonitor" alt="Release">
        </a>
      </div>
    </td>
    <td>
      <p><strong>European Parliament Intelligence Platform</strong> — an automated multi-language news platform that monitors EU Parliament activities with 14-language support, covering plenary sessions, committee reports, propositions, and breaking news.</p>
      <div>
        <a href="https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor">
          <img src="https://api.securityscorecards.dev/projects/github.com/Hack23/euparliamentmonitor/badge" alt="OpenSSF Scorecard">
        </a>
        <a href="https://github.com/Hack23/euparliamentmonitor/attestations">
          <img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA 3">
        </a>
        <a href="https://github.com/Hack23/euparliamentmonitor/license">
          <img src="https://img.shields.io/github/license/Hack23/euparliamentmonitor" alt="License">
        </a>
      </div>
      <div>
        <a href="https://euparliamentmonitor.com"><strong>EU Parliament Monitor - News</strong></a> •
        <a href="https://github.com/Hack23/euparliamentmonitor"><strong>📂 Repository</strong></a> •
        <a href="https://hack23.com/euparliamentmonitor-features.html"><strong>✨ Features</strong></a> •
        <a href="https://hack23.com/euparliamentmonitor-docs.html"><strong>📚 Documentation</strong></a>
      </div>
    </td>
  </tr>
</table>

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/Hack23/euparliamentmonitor/badge)](https://scorecard.dev/viewer/?uri=github.com/Hack23/euparliamentmonitor)
[![SLSA 3](https://slsa.dev/images/gh-badge-level3.svg)](https://github.com/Hack23/euparliamentmonitor/attestations)
[![News Generation](https://github.com/Hack23/euparliamentmonitor/actions/workflows/news-generation.yml/badge.svg)](https://github.com/Hack23/euparliamentmonitor/actions/workflows/news-generation.yml)
[![Test and Report](https://github.com/Hack23/euparliamentmonitor/actions/workflows/test-and-report.yml/badge.svg)](https://github.com/Hack23/euparliamentmonitor/actions/workflows/test-and-report.yml)
[![License](https://img.shields.io/github/license/Hack23/euparliamentmonitor)](https://github.com/Hack23/euparliamentmonitor/blob/main/LICENSE)
[![ISMS](https://img.shields.io/badge/Hack23-ISMS-blue)](https://github.com/Hack23/ISMS-PUBLIC)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Hack23/euparliamentmonitor)

### 🗳️ Riksdagsmonitor

<table>
  <tr>
    <td width="120" align="center">
      <img src="https://img.shields.io/badge/Riksdag-Monitor-00338D?style=for-the-badge&logo=swedish&logoColor=FECC00" width="80" alt="Riksdagsmonitor"/>
      <div>
        <a href="https://riksdagsmonitor.com">
          <img src="https://img.shields.io/website?url=https://riksdagsmonitor.com" alt="Website Status">
        </a>
      </div>
    </td>
    <td>
      <p><strong>Swedish Parliament Intelligence Platform</strong> monitoring political activity in Sweden's Riksdag with systematic transparency through real-time analysis and 50+ years of historical data (1971-2024).</p>
      <div>
        <a href="https://scorecard.dev/viewer/?uri=github.com/Hack23/riksdagsmonitor">
          <img src="https://api.securityscorecards.dev/projects/github.com/Hack23/riksdagsmonitor/badge" alt="OpenSSF Scorecard">
        </a>
        <a href="https://github.com/Hack23/riksdagsmonitor/actions/workflows/quality-checks.yml">
          <img src="https://github.com/Hack23/riksdagsmonitor/actions/workflows/quality-checks.yml/badge.svg" alt="Quality Checks">
        </a>
        <a href="https://github.com/Hack23/riksdagsmonitor/license">
          <img src="https://img.shields.io/github/license/Hack23/riksdagsmonitor" alt="License">
        </a>
      </div>
      <div>
        <a href="https://riksdagsmonitor.com"><strong>🌐 Riksdags Monitor</strong></a> •
        <a href="https://riksdagsmonitor.com/news/"><strong>🌐 Riksdags Monitor News</strong></a> •
        <a href="https://github.com/Hack23/riksdagsmonitor"><strong>📂 Repository</strong></a> •
        <a href="https://hack23.com/riksdagsmonitor-features.html"><strong>✨ Features</strong></a> •
        <a href="https://hack23.com/riksdagsmonitor-docs.html"><strong>📚 Documentation</strong></a>
      </div>
    </td>
  </tr>
</table>

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/Hack23/riksdagsmonitor/badge)](https://scorecard.dev/viewer/?uri=github.com/Hack23/riksdagsmonitor)
[![Quality Checks](https://github.com/Hack23/riksdagsmonitor/actions/workflows/quality-checks.yml/badge.svg)](https://github.com/Hack23/riksdagsmonitor/actions/workflows/quality-checks.yml)
[![Dependency Review](https://github.com/Hack23/riksdagsmonitor/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/Hack23/riksdagsmonitor/actions/workflows/dependency-review.yml)
[![License](https://img.shields.io/github/license/Hack23/riksdagsmonitor)](https://github.com/Hack23/riksdagsmonitor/blob/main/LICENSE)
[![ISMS](https://img.shields.io/badge/Hack23-ISMS-blue)](https://github.com/Hack23/ISMS-PUBLIC)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Hack23/riksdagsmonitor)

### 🔍 Citizen Intelligence Agency

<table>
  <tr>
    <td width="120" align="center">
      <img src="https://raw.githubusercontent.com/Hack23/cia/refs/heads/master/citizen-intelligence-agency/src/main/webapp/VAADIN/themes/cia/cia-logo.png" width="80" height="80" alt="CIA Logo"/>
      <div>
        <a href="https://github.com/Hack23/cia">
          <img src="https://img.shields.io/github/v/release/Hack23/cia" alt="Release">
        </a>
      </div>
    </td>
    <td>
      <p><strong>Political transparency platform</strong> monitoring Swedish political activity with data-driven insights, analytics, dashboard visualizations, and accountability metrics.</p>
      <div>
        <a href="https://bestpractices.coreinfrastructure.org/projects/770">
          <img src="https://bestpractices.coreinfrastructure.org/projects/770/badge" alt="CII Best Practices">
        </a>
        <a href="[https://slsa.dev/spec/v1.0/levels](https://github.com/Hack23/cia/attestations)">
          <img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA 3">
        </a>
        <a href="https://sonarcloud.io/summary/new_code?id=Hack23_cia">
          <img src="https://sonarcloud.io/api/project_badges/measure?project=Hack23_cia&metric=security_rating" alt="Security Rating">
        </a>
      </div>
      <div>
        <a href="https://github.com/Hack23/cia"><strong>📂 Repository</strong></a> •
        <a href="https://hack23.com/cia-features.html"><strong>✨ Features</strong></a> •
        <a href="https://hack23.com/cia-docs.html"><strong>📚 Documentation</strong></a>
      </div>
    </td>
  </tr>
</table>

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/770/badge)](https://bestpractices.coreinfrastructure.org/projects/770)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/Hack23/cia/badge)](https://scorecard.dev/viewer/?uri=github.com/Hack23/cia)
[![SLSA 3](https://slsa.dev/images/gh-badge-level3.svg)](https://slsa.dev/spec/v1.0/levels)
[![Verify & Deploy](https://github.com/Hack23/cia/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/Hack23/cia/actions/workflows/release.yml)
[![Scorecard supply-chain security](https://github.com/Hack23/cia/actions/workflows/scorecards.yml/badge.svg?branch=master)](https://github.com/Hack23/cia/actions/workflows/scorecards.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Hack23_cia&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Hack23_cia)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Hack23_cia&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Hack23_cia)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Hack23/cia)

---

<p align="center">
  <!-- Security Architecture -->
  <a href="_media/SECURITY_ARCHITECTURE.md">
    <img src="https://img.shields.io/badge/🛡️%20Security-Architecture-blue?style=flat-square" alt="Security Architecture">
  </a>
  
  <!-- Architecture Diagrams -->
  <a href="_media/ARCHITECTURE_DIAGRAMS.md">
    <img src="https://img.shields.io/badge/🏗️%20Architecture-Diagrams-blue?style=flat-square" alt="Architecture Diagrams">
  </a>
  
  <!-- Workflows Documentation -->
  <a href="_media/WORKFLOWS.md">
    <img src="https://img.shields.io/badge/⚙️%20CI%2FCD-Workflows-blue?style=flat-square" alt="Workflows Documentation">
  </a>
  
  <!-- Performance Guide -->
  <a href="_media/PERFORMANCE_GUIDE.md">
    <img src="https://img.shields.io/badge/⚡%20Performance-Guide-blue?style=flat-square" alt="Performance Guide">
  </a>
</p>

## 🔐 Security & Compliance

<p align="center">
  <!-- OpenSSF Scorecard -->
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/Hack23/European-Parliament-MCP-Server">
    <img src="https://api.securityscorecards.dev/projects/github.com/Hack23/European-Parliament-MCP-Server/badge?style=flat-square" alt="OpenSSF Scorecard">
  </a>
  
  <!-- SLSA Level 3 -->
  <a href="https://github.com/Hack23/European-Parliament-MCP-Server/attestations/">
    <img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA 3">
  </a>
  
  <!-- SBOM -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/SBOM.md">
    <img src="https://img.shields.io/badge/SBOM-SPDX%202.3-blue?style=flat-square" alt="SBOM">
  </a>
  
  <!-- SBOM Quality -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/SBOM.md">
    <img src="https://img.shields.io/badge/SBOM%20Quality-8.5%2F10-brightgreen?style=flat-square" alt="SBOM Quality">
  </a>
  
  <!-- Attestations -->
  <a href="https://hack23.github.io/European-Parliament-MCP-Server/ATTESTATIONS.md">
    <img src="https://img.shields.io/badge/Attestations-Available-success?style=flat-square" alt="Build Attestations">
  </a>
</p>

<p align="center">
  <!-- ISMS Compliance -->
  <a href="https://github.com/Hack23/ISMS-PUBLIC">
    <img src="https://img.shields.io/badge/ISMS-ISO%2027001-success?style=flat-square" alt="ISO 27001">
  </a>
  <a href="https://github.com/Hack23/ISMS-PUBLIC">
    <img src="https://img.shields.io/badge/ISMS-NIST%20CSF%202.0-success?style=flat-square" alt="NIST CSF 2.0">
  </a>
<a href="https://app.fossa.com/projects/git%2Bgithub.com%2FHack23%2FEuropean-Parliament-MCP-Server?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2FHack23%2FEuropean-Parliament-MCP-Server.svg?type=shield"/></a>
  <a href="https://github.com/Hack23/ISMS-PUBLIC">
    <img src="https://img.shields.io/badge/ISMS-CIS%20Controls%20v8.1-success?style=flat-square" alt="CIS Controls">
  </a>
  <a href="https://gdpr.eu/">
    <img src="https://img.shields.io/badge/GDPR-Compliant-success?style=flat-square" alt="GDPR">
  </a>
</p>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 24.x or higher
- npm 10.x or higher
- Git

### Installation

#### Option 1: Install from npm (Recommended)

```bash
# Install the package globally
npm install -g european-parliament-mcp-server

# Or install as a dependency in your project
npm install european-parliament-mcp-server
```

#### Option 2: Install from source

```bash
# Clone the repository
git clone https://github.com/Hack23/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Usage with MCP Client

#### Claude Desktop Configuration (npm install)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "npx",
      "args": ["european-parliament-mcp-server"],
      "env": {
        "EP_API_KEY": "your-api-key-if-needed"
      }
    }
  }
}
```

#### Claude Desktop Configuration (source install)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": ["/path/to/European-Parliament-MCP-Server/dist/index.js"],
      "env": {
        "EP_API_KEY": "your-api-key-if-needed"
      }
    }
  }
}
```

#### VS Code Extension

Configure in `.vscode/mcp.json`:

```json
{
  "servers": {
    "european-parliament": {
      "type": "stdio",
      "command": "node",
      "args": ["./dist/index.js"]
    }
  }
}
```

---

## 📚 Documentation

### 🌐 Documentation Portal

**[📖 Complete Documentation Site](https://hack23.github.io/European-Parliament-MCP-Server/)** - Live documentation portal with:
- 📖 **[API Reference (HTML)](https://hack23.github.io/European-Parliament-MCP-Server/api/)** - TypeDoc generated API documentation with search, hierarchy navigation, and full type information
- 📖 **[API Reference (Markdown)](https://hack23.github.io/European-Parliament-MCP-Server/api-markdown/)** - SEO-friendly Markdown API documentation
- 📊 **[Coverage Reports](https://hack23.github.io/European-Parliament-MCP-Server/coverage/)** - Test coverage analysis
- ✅ **[Test Reports](https://hack23.github.io/European-Parliament-MCP-Server/test-results/)** - Unit and E2E test results
- 🔐 **Build Attestations** - SLSA Level 3 provenance
- 📦 **SBOM** - Software Bill of Materials
- 🗺️ **[Sitemap](https://hack23.github.io/European-Parliament-MCP-Server/api/sitemap.xml)** - Auto-generated sitemap for search engines

> 💡 **Note**: Documentation is automatically generated and committed with each release via `npm run docs:build`

### Generated API Documentation

The API documentation is generated using [TypeDoc](https://typedoc.org/) with the following plugins:

| Plugin | Purpose |
|--------|---------|
| **typedoc** | Core HTML documentation generator |
| **typedoc-plugin-markdown** | Generates SEO-friendly Markdown alongside HTML |
| **typedoc-plugin-mdn-links** | Links TypeScript built-in types to MDN documentation |
| **typedoc-plugin-zod** | Renders Zod schema definitions as readable type documentation |

Generate documentation locally:
```bash
npm run docs          # HTML API docs → docs/api/
npm run docs:md       # Markdown API docs → docs/api-markdown/
npm run docs:build    # Full documentation build (HTML + MD + coverage + test reports)
```

### Core Documentation

- [**API Usage Guide**](_media/API_USAGE_GUIDE.md) - Complete tool documentation with examples
- [**Architecture Diagrams**](_media/ARCHITECTURE_DIAGRAMS.md) - C4 model diagrams and data flows
- [**Troubleshooting Guide**](./TROUBLESHOOTING.md) - Common issues and solutions
- [**Developer Guide**](_media/DEVELOPER_GUIDE.md) - Development workflow and contributing
- [**Deployment Guide**](_media/DEPLOYMENT_GUIDE.md) - Claude Desktop, VS Code, Docker setup
- [**Performance Guide**](_media/PERFORMANCE_GUIDE.md) - Optimization strategies
- [**Documentation as Code Guide**](./DOCUMENTATION_AS_CODE.md) - How documentation is generated

### Additional Documentation

- [**ARCHITECTURE.md**](_media/ARCHITECTURE.md) - Complete architecture and design documentation
- [**SECURITY.md**](_media/SECURITY.md) - Security policy and vulnerability disclosure
- [**SECURITY_HEADERS.md**](_media/SECURITY_HEADERS.md) - API security headers implementation
- [**docs/SBOM.md**](_media/SBOM.md) - Software Bill of Materials documentation
- [**CONTRIBUTING.md**](_media/CONTRIBUTING.md) - Contribution guidelines
- [**CODE_OF_CONDUCT.md**](_media/CODE_OF_CONDUCT.md) - Community code of conduct
- [**.github/copilot-instructions.md**](_media/copilot-instructions.md) - Development guidelines for GitHub Copilot
- [**.github/agents/README.md**](_media/README.md) - Custom GitHub Copilot agents
- [**.github/skills/README.md**](_media/README-1.md) - Reusable skill patterns

---

## 🔌 MCP Tools (45 Total)

All tools are organized below by functional area. Each tool includes input validation via Zod schemas, caching, and rate limiting.

### 👤 MEP Tools (7)

| Tool | Description | Key Parameters | EP API Endpoint |
|------|-------------|----------------|-----------------|
| [`get_meps`](_media/API_USAGE_GUIDE.md#tool-get_meps) | List MEPs with filters | country, group, committee, limit | `GET /meps` |
| [`get_mep_details`](_media/API_USAGE_GUIDE.md#tool-get_mep_details) | Detailed MEP information | id (required) | `GET /meps/{id}` |
| [`get_current_meps`](_media/API_USAGE_GUIDE.md#tool-get_current_meps) | Currently active MEPs with active mandates | limit, offset | `GET /meps/show-current` |
| [`get_incoming_meps`](_media/API_USAGE_GUIDE.md#tool-get_incoming_meps) | Newly arriving MEPs for current term | limit, offset | `GET /meps/show-incoming` |
| [`get_outgoing_meps`](_media/API_USAGE_GUIDE.md#tool-get_outgoing_meps) | Departing MEPs for current term | limit, offset | `GET /meps/show-outgoing` |
| [`get_homonym_meps`](_media/API_USAGE_GUIDE.md#tool-get_homonym_meps) | MEPs with identical names (disambiguation) | limit, offset | `GET /meps/show-homonyms` |
| [`get_mep_declarations`](_media/API_USAGE_GUIDE.md#tool-get_mep_declarations) | MEP financial interest declarations | docId, year, limit | `GET /meps-declarations`, `GET /meps-declarations/{id}` |

### 🏛️ Plenary & Meeting Tools (7)

| Tool | Description | Key Parameters | EP API Endpoint |
|------|-------------|----------------|-----------------|
| [`get_plenary_sessions`](_media/API_USAGE_GUIDE.md#tool-get_plenary_sessions) | List plenary sessions/meetings, or single by eventId | dateFrom, dateTo, eventId, limit | `GET /meetings`, `GET /meetings/{id}` |
| [`get_voting_records`](_media/API_USAGE_GUIDE.md#tool-get_voting_records) | Retrieve aggregate voting records (no per‑MEP positions) | sessionId, topic, dateFrom | `GET /meetings/{id}/vote-results` |
| [`get_speeches`](_media/API_USAGE_GUIDE.md#tool-get_speeches) | Plenary speeches and debate contributions | speechId, dateFrom, dateTo, limit | `GET /speeches`, `GET /speeches/{id}` |
| [`get_events`](_media/API_USAGE_GUIDE.md#tool-get_events) | EP events (hearings, conferences, seminars) | eventId, dateFrom, dateTo, limit | `GET /events`, `GET /events/{id}` |
| [`get_meeting_activities`](_media/API_USAGE_GUIDE.md#tool-get_meeting_activities) | Activities linked to a plenary sitting | sittingId (required), limit | `GET /meetings/{id}/activities` |
| [`get_meeting_decisions`](_media/API_USAGE_GUIDE.md#tool-get_meeting_decisions) | Decisions made in a plenary sitting | sittingId (required), limit | `GET /meetings/{id}/decisions` |
| [`get_meeting_foreseen_activities`](_media/API_USAGE_GUIDE.md#tool-get_meeting_foreseen_activities) | Planned agenda items for upcoming meetings | sittingId (required), limit | `GET /meetings/{id}/foreseen-activities` |

### 🏢 Committee Tools (2)

| Tool | Description | Key Parameters | EP API Endpoint |
|------|-------------|----------------|-----------------|
| [`get_committee_info`](_media/API_USAGE_GUIDE.md#tool-get_committee_info) | Committee/corporate body info, or all current bodies | id, abbreviation, showCurrent | `GET /corporate-bodies`, `GET /corporate-bodies/show-current` |
| [`get_committee_documents`](_media/API_USAGE_GUIDE.md#tool-get_committee_documents) | Committee documents and drafts | docId, year, limit | `GET /committee-documents`, `GET /committee-documents/{id}` |

### 📄 Document Tools (7)

| Tool | Description | Key Parameters | EP API Endpoint |
|------|-------------|----------------|-----------------|
| [`search_documents`](_media/API_USAGE_GUIDE.md#tool-search_documents) | Search documents or get single by docId | keyword, docId, documentType, dateFrom | `GET /documents`, `GET /documents/{id}` |
| [`get_adopted_texts`](_media/API_USAGE_GUIDE.md#tool-get_adopted_texts) | Adopted legislative texts and resolutions | docId, year, limit | `GET /adopted-texts`, `GET /adopted-texts/{id}` |
| [`get_plenary_documents`](_media/API_USAGE_GUIDE.md#tool-get_plenary_documents) | Plenary legislative documents | docId, year, limit | `GET /plenary-documents`, `GET /plenary-documents/{id}` |
| [`get_plenary_session_documents`](_media/API_USAGE_GUIDE.md#tool-get_plenary_session_documents) | Session agendas, minutes, voting lists | docId, limit | `GET /plenary-session-documents`, `GET /plenary-session-documents/{id}` |
| [`get_plenary_session_document_items`](_media/API_USAGE_GUIDE.md#tool-get_plenary_session_document_items) | Individual items within session documents | limit, offset | `GET /plenary-session-documents-items` |
| [`get_external_documents`](_media/API_USAGE_GUIDE.md#tool-get_external_documents) | Non-EP documents (Council, Commission) | docId, year, limit | `GET /external-documents`, `GET /external-documents/{id}` |
| [`get_parliamentary_questions`](_media/API_USAGE_GUIDE.md#tool-get_parliamentary_questions) | Parliamentary Q&A, or single by docId | type, author, topic, docId | `GET /parliamentary-questions`, `GET /parliamentary-questions/{id}` |

### ⚖️ Legislative Procedure Tools (3)

| Tool | Description | Key Parameters | EP API Endpoint |
|------|-------------|----------------|-----------------|
| [`get_procedures`](_media/API_USAGE_GUIDE.md#tool-get_procedures) | Legislative procedures, or single by processId | processId, year, limit | `GET /procedures`, `GET /procedures/{id}` |
| [`get_procedure_events`](_media/API_USAGE_GUIDE.md#tool-get_procedure_events) | Timeline events for a legislative procedure | processId (required), limit | `GET /procedures/{id}/events` |
| [`get_controlled_vocabularies`](_media/API_USAGE_GUIDE.md#tool-get_controlled_vocabularies) | Standardized classification terms | vocId, limit | `GET /controlled-vocabularies`, `GET /controlled-vocabularies/{id}` |

### 📊 Advanced Analysis Tools (3)

| Tool | Description | Key Parameters | Output |
|------|-------------|----------------|--------|
| [`analyze_voting_patterns`](_media/API_USAGE_GUIDE.md#tool-analyze_voting_patterns) | Analyze MEP voting behavior | mepId (required), dateFrom, compareWithGroup | Analysis object |
| [`track_legislation`](_media/API_USAGE_GUIDE.md#tool-track_legislation) | Track legislative procedure | procedureId (required) | Procedure object |
| [`generate_report`](_media/API_USAGE_GUIDE.md#tool-generate_report) | Generate analytical reports | reportType (required), subjectId, dateFrom | Report object |

### 🕵️ OSINT Intelligence Tools (10)

| Tool | Description | Key Parameters | Output |
|------|-------------|----------------|--------|
| [`assess_mep_influence`](_media/API_USAGE_GUIDE.md#tool-assess_mep_influence) | MEP influence scoring (5-dimension model) | mepId (required), dateFrom, dateTo | Influence scorecard |
| [`analyze_coalition_dynamics`](_media/API_USAGE_GUIDE.md#tool-analyze_coalition_dynamics) | Coalition cohesion & stress analysis | politicalGroups, dateFrom, dateTo | Coalition metrics |
| [`detect_voting_anomalies`](_media/API_USAGE_GUIDE.md#tool-detect_voting_anomalies) | Party defection & anomaly detection | mepId, politicalGroup, dateFrom | Anomaly report |
| [`compare_political_groups`](_media/API_USAGE_GUIDE.md#tool-compare_political_groups) | Cross-group comparative analysis | groups (required), metrics, dateFrom | Comparison matrix |
| [`analyze_legislative_effectiveness`](_media/API_USAGE_GUIDE.md#tool-analyze_legislative_effectiveness) | MEP/committee legislative scoring | subjectId (required), subjectType, dateFrom | Effectiveness score |
| [`monitor_legislative_pipeline`](_media/API_USAGE_GUIDE.md#tool-monitor_legislative_pipeline) | Pipeline status & bottleneck detection | committeeId, status, dateFrom | Pipeline status |
| [`analyze_committee_activity`](_media/API_USAGE_GUIDE.md#tool-analyze_committee_activity) | Committee workload & engagement analysis | committeeId (required), dateFrom, dateTo | Activity report |
| [`track_mep_attendance`](_media/API_USAGE_GUIDE.md#tool-track_mep_attendance) | MEP attendance patterns & trends | mepId, country, groupId, dateFrom, dateTo, limit | Attendance report |
| [`analyze_country_delegation`](_media/API_USAGE_GUIDE.md#tool-analyze_country_delegation) | Country delegation voting & composition | country (required), dateFrom, dateTo | Delegation analysis |
| [`generate_political_landscape`](_media/API_USAGE_GUIDE.md#tool-generate_political_landscape) | Parliament-wide political landscape | dateFrom, dateTo | Landscape overview |

📖 **[Complete TypeDoc API documentation →](https://hack23.github.io/European-Parliament-MCP-Server/api/)** · **[Markdown API docs →](https://hack23.github.io/European-Parliament-MCP-Server/api-markdown/)**

### Common Use Cases

**Research a specific MEP**:
```
1. Find MEP: get_meps → {country: "SE"}
2. Get details: get_mep_details → {id: "MEP-123"}
3. Analyze voting: analyze_voting_patterns → {mepId: "MEP-123"}
4. Generate report: generate_report → {reportType: "MEP_ACTIVITY", subjectId: "MEP-123"}
```

**Track legislation**:
```
1. Search documents: search_documents → {keywords: "climate change"}
2. Track procedure: track_legislation → {procedureId: "2024/0001(COD)"}
3. Get voting records: get_voting_records → {topic: "climate"}
```

**Committee analysis**:
```
1. Get committee: get_committee_info → {abbreviation: "ENVI"}
2. List members: get_meps → {committee: "ENVI"}
3. Generate report: generate_report → {reportType: "COMMITTEE_PERFORMANCE", subjectId: "COMM-ENVI"}
```

**OSINT Intelligence analysis**:
```
1. Score MEP influence: assess_mep_influence → {mepId: "MEP-123"}
2. Detect anomalies: detect_voting_anomalies → {mepId: "MEP-123"}
3. Analyze coalitions: analyze_coalition_dynamics → {politicalGroups: ["EPP", "S&D"]}
4. Compare groups: compare_political_groups → {groups: ["EPP", "S&D", "Renew"]}
5. Pipeline status: monitor_legislative_pipeline → {committeeId: "ENVI"}
6. Country delegation: analyze_country_delegation → {country: "SE"}
7. Political landscape: generate_political_landscape → {}
```

🎯 **[More use cases and examples →](_media/API_USAGE_GUIDE.md#common-use-cases)**

### 📝 MCP Prompts

Pre-built intelligence analysis prompt templates:

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| `mep_briefing` | Comprehensive MEP intelligence briefing | mepId (required), period? |
| `coalition_analysis` | Coalition dynamics and voting bloc analysis | policyArea?, period? |
| `legislative_tracking` | Legislative procedure tracking report | procedureId?, committee? |
| `political_group_comparison` | Multi-dimensional group comparison | groups? |
| `committee_activity_report` | Committee workload and engagement | committeeId (required) |
| `voting_pattern_analysis` | Voting pattern trend detection | topic?, mepId? |
| `country_delegation_analysis` | Country delegation composition and activity | country (required), period? |

### 📦 MCP Resources

Direct data access via EP resource URIs:

| Resource URI | Description |
|-------------|-------------|
| `ep://meps` | List of all current MEPs |
| `ep://meps/{mepId}` | Individual MEP profile |
| `ep://committees/{committeeId}` | Committee information |
| `ep://plenary-sessions` | Recent plenary sessions |
| `ep://votes/{sessionId}` | Voting records for a session |
| `ep://political-groups` | Political group listing |
| `ep://procedures/{procedureId}` | Legislative procedure details |
| `ep://plenary/{plenaryId}` | Single plenary session details |
| `ep://documents/{documentId}` | Legislative document details |

---

## 🗺️ Global Political MCP Servers & OSINT Coverage

The European Parliament MCP Server is part of a growing ecosystem of **political and government open data MCP servers** enabling AI-powered OSINT analysis of democratic institutions worldwide. Below is the most comprehensive directory of political and government MCP servers available.

### 🏛️ Parliamentary & Legislative MCP Servers

| Country | Server | Data Source | Coverage |
|---------|--------|-------------|----------|
| 🇪🇺 **European Union** | [**European Parliament MCP Server**](https://github.com/Hack23/European-Parliament-MCP-Server) | data.europarl.europa.eu | MEPs, votes, legislation, committees, questions — **20 OSINT tools** |
| 🇺🇸 **United States** | [Congress.gov API MCP Server](https://github.com/bsmi021/mcp-congress_gov_server) | congress.gov | Bills, members, votes, committees (TypeScript, v3 API) |
| 🇺🇸 **United States** | [CongressMCP](https://github.com/amurshak/congressMCP) | congress.gov | Real-time Congress data — bills, votes, members |
| 🇺🇸 **United States** | [Congress.gov MCP](https://github.com/AshwinSundar/congress_gov_mcp) | congress.gov | Unofficial Congress.gov API access |
| 🇬🇧 **United Kingdom** | [Parliament MCP](https://github.com/i-dot-ai/parliament-mcp) | parliament.uk | Hansard, members, debates, divisions |
| 🇸🇪 **Sweden** | [Riksdag & Regering MCP](https://github.com/isakskogstad/Riksdag-Regering-MCP) | riksdagen.se | Swedish Parliament & Government data (used by [riksdagsmonitor.com](https://riksdagsmonitor.com/)) |
| 🇳🇱 **Netherlands** | [OpenTK MCP](https://github.com/r-huijts/opentk-mcp) | tweedekamer.nl | Dutch Parliament (Tweede Kamer) documents |
| 🇵🇱 **Poland** | [Parliament of Poland MCP](https://github.com/pkolawa/parliament-poland-mcp-server) | sejm.gov.pl | Members, votes, committees |
| 🇵🇱 **Poland** | [Sejm MCP](https://github.com/janisz/sejm-mcp) | api.sejm.gov.pl | Parliament data + legislation |
| 🇮🇱 **Israel** | [Knesset MCP Server](https://github.com/zohar/knesset-mcp) | knesset.gov.il | Knesset parliament API |
| 🇧🇷 **Brazil** | [Senado BR MCP](https://mcpservers.org/servers/sidneybissoli/senado-br-mcp) | senado.leg.br | Federal Senate — members, proposals, votes |

### 📊 Government Open Data MCP Servers

| Country | Server | Data Source | Coverage |
|---------|--------|-------------|----------|
| 🇺🇸 **United States** | [USA Spending MCP](https://github.com/thsmale/usaspending-mcp-server) | usaspending.gov | Federal spending data |
| 🇺🇸 **United States** | [Open Census MCP](https://mcpservers.org/servers/brockwebb/open-census-mcp-server) | census.gov | Demographics & statistics (natural language) |
| 🇺🇸 **United States** | [Data.gov MCP Server](https://github.com/melaodoidao/datagov-mcp-server) | data.gov | Federal dataset catalog |
| 🇺🇸 **United States** | [CMS Data.gov MCP](https://github.com/clarifyhealth/cms-datagov-mcp-server) | data.cms.gov | Healthcare data — search/filter/pagination |
| 🇺🇸 **United States** | [SEC EDGAR MCP](https://github.com/stefanoamorelli/sec-edgar-mcp) | sec.gov | SEC filings — annual reports, insider data |
| 🇺🇸 **United States** | [NPS MCP](https://github.com/amysatterlee/nps_mcp) | nps.gov | National Park Service API |
| 🇸🇪 **Sweden** | [SCB MCP Server](https://mcpservers.org/servers/isakskogstad/scb-mcp) | scb.se | Official Swedish statistics |
| 🇸🇪 **Sweden** | [Skolverket MCP](https://mcpservers.org/servers/ksaklfszf921/skolverket-mcp) | skolverket.se | Swedish National Agency for Education |
| 🇫🇷 **France** | [data.gouv.fr MCP](https://github.com/datagouv/datagouv-mcp) | data.gouv.fr | National open data platform |
| 🇫🇷 **France** | [Data Gouv MCP Server](https://mcpservers.org/servers/csonigo/datagouv-mcp-server) | data.gouv.fr | Companies & organizations search |
| 🇬🇧 **United Kingdom** | [Planning Data MCP](https://github.com/alizoli/planningdatagovuk-api) | planning.data.gov.uk | Planning & land use data |
| 🇬🇧 **United Kingdom** | [Property Prices MCP](https://github.com/joemclo/property-prices-mcp) | landregistry.data.gov.uk | Housing price search |
| 🇳🇱 **Netherlands** | [CBS Open Data MCP](https://github.com/dstotijn/mcp-cbs-cijfers-open-data) | cbs.nl | Dutch statistics bureau |
| 🇮🇱 **Israel** | [Data.gov.il MCP](https://github.com/DavidOsherProceed/data-gov-il-mcp) | data.gov.il | National CKAN data portal |
| 🇮🇱 **Israel** | [DataGov Israel MCP](https://github.com/aviveldan/datagov-mcp) | data.gov.il | Alternative implementation + visualization |
| 🇮🇱 **Israel** | [Israel Statistics MCP](https://github.com/reuvenaor/israel-statistics-mcp) | cbs.gov.il | CPI & economic time series |
| 🇮🇱 **Israel** | [BudgetKey MCP](https://github.com/OpenBudget/budgetkey-mcp) | open-budget.org.il | State budget, contracts, grants |
| 🇹🇷 **Turkey** | [Mevzuat MCP](https://mcpservers.org/servers/MCP-Mirror/saidsurucu_mevzuat-mcp) | mevzuat.gov.tr | Legislation system — search/retrieve laws |
| 🇭🇰 **Hong Kong** | [HK Data.gov.hk MCP](https://github.com/hkopenai/hk-datagovhk-mcp-server) | data.gov.hk | Hong Kong open data portal |
| 🇲🇾 **Malaysia** | [Data.gov.my MCP](https://github.com/manfye/data-dosm-mcp-nodejs) | data.gov.my | National data portal |
| 🇮🇳 **India** | [Data.gov.in MCP](https://github.com/adwait-ai/mcp_data_gov_in) | data.gov.in | Semantic search + dataset access |
| 🇸🇬 **Singapore** | [Gahmen MCP Server](https://github.com/aniruddha-adhikary/gahmen-mcp) | data.gov.sg | Government datasets + CKAN search |
| 🇸🇬 **Singapore** | [Singapore Data MCPs](https://github.com/prezgamer/Singapore-Data-MCPs) | data.gov.sg | Multiple servers (parking, health, datasets) |
| 🇦🇺 **Australia** | [ABS MCP Server](https://github.com/seansoreilly/mcp-server-abs) | abs.gov.au | Bureau of Statistics (SDMX-ML) |

### 🌍 Multi-Portal & Generic MCP Servers

| Scope | Server | Platform | Coverage |
|-------|--------|----------|----------|
| 🌐 **Global (CKAN)** | [CKAN MCP Server](https://github.com/ondata/ckan-mcp-server) | CKAN portals | Generic server for any CKAN-based open data portal |
| 🌐 **Global (Socrata)** | [OpenGov MCP Server](https://github.com/srobbin/opengov-mcp-server) | Socrata portals | City/county/state/federal Socrata-powered portals |

### 🕵️ OSINT Intelligence Capabilities Comparison

| Capability | 🇪🇺 EU Parliament MCP | 🇺🇸 Congress.gov MCP | 🇬🇧 UK Parliament MCP | 🇸🇪 Riksdag MCP |
|------------|----------------------|---------------------|----------------------|-----------------|
| Member profiling | ✅ 5-dimension influence model | ✅ Basic profiles | ✅ Basic profiles | ✅ Basic profiles |
| Voting analysis | ✅ Anomaly detection + patterns | ✅ Roll call votes | ✅ Division records | ✅ Vote records |
| Coalition dynamics | ✅ Cohesion & stress analysis | ❌ | ❌ | ❌ |
| Committee intelligence | ✅ Workload & engagement metrics | ✅ Committee data | ✅ Committee data | ❌ |
| Legislative pipeline | ✅ Bottleneck detection + forecasting | ✅ Bill tracking | ✅ Bill tracking | ✅ Bill tracking |
| Country delegation analysis | ✅ National cohesion metrics | N/A | N/A | N/A |
| Political landscape | ✅ Parliament-wide situational awareness | ❌ | ❌ | ❌ |
| Attendance tracking | ✅ Trend detection + engagement scoring | ❌ | ❌ | ❌ |
| GDPR compliance | ✅ Privacy-first design | N/A | N/A | ✅ |
| MCP prompts & resources | ✅ 7 prompts + 9 resources | ❌ | ❌ | ❌ |
| OSINT tool count | **45 tools** | ~5 tools | ~5 tools | ~4 tools |

> 💡 **The European Parliament MCP Server offers the most comprehensive OSINT intelligence capabilities** of any political MCP server, with **45 specialized tools** including advanced analytics like coalition stress analysis, voting anomaly detection, and political landscape generation. It is the only political MCP server with built-in MCP prompts, resources, and a 5-dimension MEP influence scoring model.

---

## 🏛️ European Parliament Datasets

### Complete EP API v2 Coverage

All [European Parliament Open Data API v2](https://data.europarl.europa.eu/en/developer-corner/opendata-api) endpoint categories are fully covered:

| Category | Endpoints | MCP Tools |
|----------|-----------|-----------|
| **MEPs** | `/meps`, `/meps/{id}`, `/meps/show-current`, `/meps/show-incoming`, `/meps/show-outgoing`, `/meps/show-homonyms` | `get_meps`, `get_mep_details`, `get_current_meps`, `get_incoming_meps`, `get_outgoing_meps`, `get_homonym_meps` |
| **MEP Documents** | `/meps-declarations`, `/meps-declarations/{id}` | `get_mep_declarations` |
| **Corporate Bodies** | `/corporate-bodies`, `/corporate-bodies/{id}`, `/corporate-bodies/show-current` | `get_committee_info` |
| **Events** | `/events`, `/events/{id}` | `get_events` |
| **Meetings** | `/meetings`, `/meetings/{id}`, `/meetings/{id}/activities`, `/meetings/{id}/decisions`, `/meetings/{id}/foreseen-activities`, `/meetings/{id}/vote-results` | `get_plenary_sessions`, `get_meeting_activities`, `get_meeting_decisions`, `get_meeting_foreseen_activities`, `get_voting_records` |
| **Speeches** | `/speeches`, `/speeches/{id}` | `get_speeches` |
| **Procedures** | `/procedures`, `/procedures/{id}`, `/procedures/{id}/events` | `get_procedures`, `get_procedure_events` |
| **Documents** | `/documents`, `/documents/{id}`, `/adopted-texts`, `/adopted-texts/{id}`, `/committee-documents`, `/committee-documents/{id}`, `/plenary-documents`, `/plenary-documents/{id}`, `/plenary-session-documents`, `/plenary-session-documents/{id}`, `/plenary-session-documents-items` | `search_documents`, `get_adopted_texts`, `get_committee_documents`, `get_plenary_documents`, `get_plenary_session_documents`, `get_plenary_session_document_items` |
| **Questions** | `/parliamentary-questions`, `/parliamentary-questions/{id}` | `get_parliamentary_questions` |
| **External Documents** | `/external-documents`, `/external-documents/{id}` | `get_external_documents` |
| **Vocabularies** | `/controlled-vocabularies`, `/controlled-vocabularies/{id}` | `get_controlled_vocabularies` |

### Data Source

- **API**: https://data.europarl.europa.eu/api/v2/
- **Documentation**: https://data.europarl.europa.eu/en/developer-corner
- **Format**: JSON-LD, RDF/XML, Turtle
- **License**: European Parliament Open Data License

---

## 🔒 Security & Compliance

### ISMS Compliance

This project aligns with [Hack23 AB's Information Security Management System (ISMS)](https://github.com/Hack23/ISMS-PUBLIC):

- ✅ **ISO 27001:2022** - Information security management
- ✅ **NIST CSF 2.0** - Cybersecurity framework
- ✅ **CIS Controls v8.1** - Security best practices
- ✅ **GDPR** - EU data protection compliance

### Security Features

- 🔐 **Authentication**: API key + OAuth 2.0 (planned)
- 🛡️ **Input Validation**: Zod schemas for all inputs
- ⚡ **Rate Limiting**: 100 requests per 15 minutes per IP
- 🔒 **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- 📝 **Audit Logging**: All data access logged
- 🔍 **Vulnerability Scanning**: CodeQL, Dependabot, OSSF Scorecard

### Supply Chain Security

This project achieves **SLSA Level 3** compliance:
- ✅ **Build Provenance** - Cryptographic proof of build integrity
- ✅ **Attestations** - All artifacts cryptographically signed
- ✅ **Verification** - `gh attestation verify <artifact> --owner Hack23 --repo European-Parliament-MCP-Server`
- ✅ **npm Provenance** - Published with provenance for package integrity
- ✅ **SBOM** - SPDX-format Software Bill of Materials
- ✅ **Dependency Review** - Automated vulnerability scanning
- ✅ **License Compliance** - Only MIT, Apache-2.0, BSD, ISC allowed

See [**ATTESTATIONS.md**](_media/ATTESTATIONS.md) for verification instructions and security benefits.

---

## 🧪 Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Project Structure

```
European-Parliament-MCP-Server/
├── src/                      # Source code
│   ├── server.ts            # MCP server entry point
│   ├── tools/               # MCP tool implementations
│   ├── resources/           # MCP resource handlers
│   ├── prompts/             # MCP prompt templates
│   ├── clients/             # European Parliament API client
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── tests/                   # Test files
├── .github/                 # GitHub configuration
│   ├── agents/             # Custom Copilot agents
│   ├── skills/             # Reusable skill patterns
│   └── workflows/          # CI/CD workflows
└── docs/                    # Additional documentation
```

### Documentation

#### 📚 Developer Documentation

- **[JSDoc Coverage Report](./JSDOC_COVERAGE_REPORT.md)** - Detailed analysis of JSDoc documentation coverage across all source files
- **[JSDoc Quick Reference](_media/JSDOC_QUICK_REFERENCE.md)** - Quick reference guide for writing comprehensive JSDoc comments
- **[JSDoc Coverage Summary](./JSDOC_COVERAGE_SUMMARY.md)** - Executive summary of documentation status and priorities
- **[JSDoc Coverage Visualization](_media/JSDOC_COVERAGE_VISUALIZATION.md)** - Visual representation of documentation coverage with charts and graphs

#### 🏗️ Architecture & Design

- **[Architecture Documentation](_media/ARCHITECTURE.md)** - System architecture and design patterns
- **[Data Model](_media/DATA_MODEL.md)** - Data structures and type definitions
- **[API Usage Guide](_media/API_USAGE_GUIDE.md)** - Guide for using the MCP server API

#### 🧪 Testing & Quality

- **[Test Coverage Report](./TEST_COVERAGE_REPORT.md)** - Test coverage statistics and analysis
- **[Developer Guide](_media/DEVELOPER_GUIDE.md)** - Development setup and guidelines
- **[Performance Guide](_media/PERFORMANCE_GUIDE.md)** - Performance optimization strategies

#### 🔒 Security & Compliance

- **[Security Policy](_media/SECURITY.md)** - Vulnerability reporting and security practices
- **[Security Architecture](_media/SECURITY_ARCHITECTURE.md)** - Security controls and architecture
- **[Secure Development Policy](./Secure_Development_Policy.md)** - Secure coding standards
- **[Open Source Policy](./Open_Source_Policy.md)** - Open source compliance guidelines

#### 📦 Deployment & Operations

- **[Deployment Guide](_media/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[NPM Publishing Guide](./NPM_PUBLISHING.md)** - Package publishing workflow

### Testing

```bash
# Unit tests
npm test

# Integration tests (requires EP_INTEGRATION_TESTS=true)
EP_INTEGRATION_TESTS=true npm run test:integration

# Integration tests with fixture capture
EP_INTEGRATION_TESTS=true EP_SAVE_FIXTURES=true npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

**Integration Testing**: When `EP_INTEGRATION_TESTS=true`, all 45 MCP tools are tested against the real European Parliament API endpoints. All tools return real data — no mock or placeholder data is used. Live API tests are disabled by default to respect rate limits (100 req/15min). See [**INTEGRATION_TESTING.md**](_media/INTEGRATION_TESTING.md) for the complete guide.

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check for unused dependencies
npm run knip

# Security audit
npm audit

# License compliance
npm run test:licenses
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](_media/CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Pull request guidelines
- Coding standards
- Testing requirements

### GitHub Copilot Integration

This repository includes custom agents and skills for GitHub Copilot:

- **Agents**: Specialized AI assistants for development, testing, security, and documentation
- **Skills**: Reusable patterns for MCP development, security, testing, and performance
- See [.github/agents/README.md](_media/README.md) and [.github/skills/README.md](_media/README-1.md)

### Release Process

We follow [Semantic Versioning](https://semver.org/) and use automated release management:

**Version Types:**
- **Major** (x.0.0): Breaking changes (e.g., API incompatible changes)
- **Minor** (0.x.0): New features, backward compatible (e.g., new MCP tools)
- **Patch** (0.0.x): Bug fixes, security updates, backward compatible

**Automated Release Workflow:**
1. Develop features in feature branches
2. Create PR with descriptive title using [Conventional Commits](https://www.conventionalcommits.org/)
3. Labels are automatically applied based on changed files
4. After merge to main, release draft is automatically created
5. Review and publish release (creates git tag automatically)

**Release Notes Include:**
- Categorized changes by feature area
- Security badges (OpenSSF Scorecard, SLSA)
- Technology stack and compatibility
- ISMS compliance status
- Full changelog link

For detailed workflow documentation, see [.github/WORKFLOWS.md](_media/WORKFLOWS.md).

---

## 📜 License

This project is licensed under the **Apache License 2.0** - see [LICENSE.md](_media/LICENSE.md) for details.

---

## 🔗 Links

### Project Resources
- [GitHub Repository](https://github.com/Hack23/European-Parliament-MCP-Server)
- [Issue Tracker](https://github.com/Hack23/European-Parliament-MCP-Server/issues)
- [Discussions](https://github.com/Hack23/European-Parliament-MCP-Server/discussions)
- [Security Policy](_media/SECURITY.md)

### Hack23 Ecosystem
- [Hack23](https://hack23.com/) — AI-powered democratic transparency platform
- [EU Parliament Monitor](https://github.com/Hack23/euparliamentmonitor) — European Parliament monitoring dashboard
- [Riksdagsmonitor](https://riksdagsmonitor.com/) · [GitHub](https://github.com/Hack23/riksdagsmonitor) — Swedish Parliament monitoring
- [Citizen Intelligence Agency](https://github.com/Hack23/cia) — Comprehensive political intelligence platform

### European Parliament
- [Open Data Portal](https://data.europarl.europa.eu/)
- [Developer Corner](https://data.europarl.europa.eu/en/developer-corner)
- [Data Privacy Policy](https://www.europarl.europa.eu/portal/en/legal-notice)

### MCP Protocol
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [MCP Documentation](https://modelcontextprotocol.io/docs)

### Political & Government MCP Servers
- [Congress.gov API MCP Server](https://github.com/bsmi021/mcp-congress_gov_server) — US Congress data (TypeScript)
- [UK Parliament MCP](https://github.com/i-dot-ai/parliament-mcp) — UK Hansard, members, debates
- [Riksdag & Regering MCP](https://github.com/isakskogstad/Riksdag-Regering-MCP) — Swedish Parliament data
- [Parliament of Poland MCP](https://github.com/pkolawa/parliament-poland-mcp-server) — Polish Parliament data
- [OpenTK MCP](https://github.com/r-huijts/opentk-mcp) — Dutch Parliament (Tweede Kamer) documents
- [Knesset MCP](https://github.com/zohar/knesset-mcp) — Israeli Parliament data
- [CKAN MCP Server](https://github.com/ondata/ckan-mcp-server) — Generic CKAN portal access
- [OpenGov MCP Server](https://github.com/srobbin/opengov-mcp-server) — Socrata-powered portals

### Hack23 ISMS
- [ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)

---

## 🙏 Acknowledgments

- **European Parliament** for providing open data access
- **Model Context Protocol** team for the MCP specification
- **Hack23 AB** for ISMS policies and security standards
- **OpenSSF** for supply chain security tools
- **Contributors** who help improve this project

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>Demonstrating security excellence through transparent open source</em>
</p>
