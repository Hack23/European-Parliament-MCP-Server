<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">🏛️ European Parliament MCP Server</h1>

<p align="center">
  <strong>Model Context Protocol Server for European Parliament Open Data</strong><br>
  <em>Providing AI assistants with structured access to parliamentary datasets</em>
</p>

<p align="center">
  <!-- npm version -->
  <a href="https://www.npmjs.com/package/european-parliament-mcp-server">
    <img src="https://img.shields.io/npm/v/european-parliament-mcp-server.svg" alt="npm version">
  </a>
  
  <!-- npm downloads -->
  <a href="https://www.npmjs.com/package/european-parliament-mcp-server">
    <img src="https://img.shields.io/npm/dm/european-parliament-mcp-server.svg" alt="npm downloads">
  </a>
  
  <!-- Build Status -->
  <a href="https://github.com/Hack23/European-Parliament-MCP-Server/actions/workflows/main.yml">
    <img src="https://github.com/Hack23/European-Parliament-MCP-Server/actions/workflows/main.yml/badge.svg" alt="Build Status">
  </a>
  
  <!-- License -->
  <a href="https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/Hack23/European-Parliament-MCP-Server.svg" alt="License">
  </a>
  
  <!-- OpenSSF Scorecard -->
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/Hack23/European-Parliament-MCP-Server">
    <img src="https://api.securityscorecards.dev/projects/github.com/Hack23/European-Parliament-MCP-Server/badge" alt="OpenSSF Scorecard">
  </a>
  
  <!-- SLSA Level 3 -->
  <a href="https://slsa.dev">
    <img src="https://slsa.dev/images/gh-badge-level3.svg" alt="SLSA 3">
  </a>
  
  <!-- SBOM -->
  <a href="https://spdx.dev">
    <img src="https://img.shields.io/badge/SBOM-SPDX-blue" alt="SBOM">
  </a>
  
  <!-- SBOM Quality -->
  <img src="https://img.shields.io/badge/SBOM%20Quality-8.5%2F10-brightgreen" alt="SBOM Quality">
  
  <!-- Code Coverage -->
  <a href="https://codecov.io/gh/Hack23/European-Parliament-MCP-Server">
    <img src="https://codecov.io/gh/Hack23/European-Parliament-MCP-Server/branch/main/graph/badge.svg" alt="Code Coverage">
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
  <a href="https://github.com/Hack23/ISMS-PUBLIC">
    <img src="https://img.shields.io/badge/ISMS-CIS%20Controls%20v8.1-success?style=flat-square" alt="CIS Controls">
  </a>
  <a href="https://gdpr.eu/">
    <img src="https://img.shields.io/badge/GDPR-Compliant-success?style=flat-square" alt="GDPR">
  </a>
</p>

---

## 📋 Overview

The **European Parliament MCP Server** implements the [Model Context Protocol (MCP)](https://spec.modelcontextprotocol.io/) to provide AI assistants, IDEs, and other MCP clients with structured access to European Parliament open datasets. Access information about MEPs, plenary sessions, committees, legislative documents, and parliamentary questions through a secure, type-safe TypeScript/Node.js implementation.

### 🎯 Key Features

- 🔌 **Full MCP Implementation**: Tools, Resources, and Prompts for comprehensive data access
- 🏛️ **European Parliament Data**: Access to 5 core parliamentary datasets
- 🔒 **Security First**: ISMS-compliant, GDPR-ready, SLSA Level 3 provenance
- 🚀 **High Performance**: <200ms API responses, intelligent caching, rate limiting
- 📊 **Type Safety**: TypeScript strict mode + Zod runtime validation
- 🧪 **Well-Tested**: 80%+ code coverage (95% for security-critical code)
- 📚 **Complete Documentation**: Architecture, API docs, security guidelines

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
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

**[📖 Complete Documentation Site](https://hack23.github.io/European-Parliament-MCP-Server/docs/)** - Live documentation portal with:
- 📖 **API Reference** - TypeDoc generated API documentation
- 📊 **Coverage Reports** - Test coverage analysis
- ✅ **Test Reports** - Unit and E2E test results
- 🔐 **Build Attestations** - SLSA Level 3 provenance
- 📦 **SBOM** - Software Bill of Materials

> 💡 **Note**: Documentation is automatically generated and deployed with each release

### Core Documentation

- [**API Usage Guide**](./API_USAGE_GUIDE.md) - Complete tool documentation with examples
- [**Architecture Diagrams**](./ARCHITECTURE_DIAGRAMS.md) - C4 model diagrams and data flows
- [**Troubleshooting Guide**](./TROUBLESHOOTING.md) - Common issues and solutions
- [**Developer Guide**](./DEVELOPER_GUIDE.md) - Development workflow and contributing
- [**Deployment Guide**](./DEPLOYMENT_GUIDE.md) - Claude Desktop, VS Code, Docker setup
- [**Performance Guide**](./PERFORMANCE_GUIDE.md) - Optimization strategies
- [**Documentation as Code Guide**](./DOCUMENTATION_AS_CODE.md) - How documentation is generated

### Additional Documentation

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Complete architecture and design documentation
- [**SECURITY.md**](./SECURITY.md) - Security policy and vulnerability disclosure
- [**SECURITY_HEADERS.md**](./SECURITY_HEADERS.md) - API security headers implementation
- [**docs/SBOM.md**](./docs/SBOM.md) - Software Bill of Materials documentation
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) - Contribution guidelines
- [**CODE_OF_CONDUCT.md**](./CODE_OF_CONDUCT.md) - Community code of conduct
- [**.github/copilot-instructions.md**](./.github/copilot-instructions.md) - Development guidelines for GitHub Copilot
- [**.github/agents/README.md**](./.github/agents/README.md) - Custom GitHub Copilot agents
- [**.github/skills/README.md**](./.github/skills/README.md) - Reusable skill patterns

---

## 🔌 MCP Tools

### Quick Reference

| Tool | Description | Key Parameters | Response |
|------|-------------|----------------|----------|
| [`get_meps`](./API_USAGE_GUIDE.md#tool-get_meps) | List MEPs with filters | country, group, committee, limit | Paginated list |
| [`get_mep_details`](./API_USAGE_GUIDE.md#tool-get_mep_details) | Detailed MEP information | id (required) | Single object |
| [`get_plenary_sessions`](./API_USAGE_GUIDE.md#tool-get_plenary_sessions) | List plenary sessions | dateFrom, dateTo, limit | Paginated list |
| [`get_voting_records`](./API_USAGE_GUIDE.md#tool-get_voting_records) | Retrieve voting records | mepId, sessionId, topic, dateFrom | Paginated list |
| [`search_documents`](./API_USAGE_GUIDE.md#tool-search_documents) | Search legislative documents | keywords (required), docType, author | Paginated list |
| [`get_committee_info`](./API_USAGE_GUIDE.md#tool-get_committee_info) | Committee information | id or abbreviation (required) | Single object |
| [`get_parliamentary_questions`](./API_USAGE_GUIDE.md#tool-get_parliamentary_questions) | Parliamentary Q&A | author, topic, questionType, dateFrom | Paginated list |
| [`analyze_voting_patterns`](./API_USAGE_GUIDE.md#tool-analyze_voting_patterns) | Analyze MEP voting behavior | mepId (required), dateFrom, compareWithGroup | Analysis object |
| [`track_legislation`](./API_USAGE_GUIDE.md#tool-track_legislation) | Track legislative procedure | procedureId (required) | Procedure object |
| [`generate_report`](./API_USAGE_GUIDE.md#tool-generate_report) | Generate analytical reports | reportType (required), subjectId, dateFrom | Report object |

📖 **[Complete API documentation with examples →](./API_USAGE_GUIDE.md)**

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

🎯 **[More use cases and examples →](./API_USAGE_GUIDE.md#common-use-cases)**

---

## 🏛️ European Parliament Datasets

### Available Data

1. **MEPs**: Current and historical member information
2. **Plenary**: Sessions, votes, attendance, debates
3. **Committees**: Meetings, documents, membership
4. **Documents**: Legislative texts, reports, amendments
5. **Questions**: Parliamentary questions and answers

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

See [**ATTESTATIONS.md**](docs/ATTESTATIONS.md) for verification instructions and security benefits.

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

### Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

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

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Pull request guidelines
- Coding standards
- Testing requirements

### GitHub Copilot Integration

This repository includes custom agents and skills for GitHub Copilot:

- **Agents**: Specialized AI assistants for development, testing, security, and documentation
- **Skills**: Reusable patterns for MCP development, security, testing, and performance
- See [.github/agents/README.md](./.github/agents/README.md) and [.github/skills/README.md](./.github/skills/README.md)

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

For detailed workflow documentation, see [.github/WORKFLOWS.md](./.github/WORKFLOWS.md).

---

## 📜 License

This project is licensed under the **Apache License 2.0** - see [LICENSE.md](./LICENSE.md) for details.

---

## 🔗 Links

### Project Resources
- [GitHub Repository](https://github.com/Hack23/European-Parliament-MCP-Server)
- [Issue Tracker](https://github.com/Hack23/European-Parliament-MCP-Server/issues)
- [Discussions](https://github.com/Hack23/European-Parliament-MCP-Server/discussions)
- [Security Policy](./SECURITY.md)

### European Parliament
- [Open Data Portal](https://data.europarl.europa.eu/)
- [Developer Corner](https://data.europarl.europa.eu/en/developer-corner)
- [Data Privacy Policy](https://www.europarl.europa.eu/portal/en/legal-notice)

### MCP Protocol
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [MCP Documentation](https://modelcontextprotocol.io/docs)

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
