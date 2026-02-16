# GitHub Actions Workflows for European Parliament MCP Server

This document describes all GitHub Actions workflows configured for the European Parliament MCP Server project.

## 📋 Overview

All workflows follow ISMS compliance requirements and security best practices from the Hack23/game repository, customized for a TypeScript-based MCP (Model Context Protocol) server project.

## 🔒 Security Features

All workflows include:
- **Harden Runner**: Audits all outbound network calls using step-security/harden-runner
- **Pinned Action Versions**: All actions use SHA hashes for security
- **Minimal Permissions**: Read-only by default, elevated only when necessary
- **SBOM Generation**: Software Bill of Materials for supply chain security
- **Attestations**: Build provenance and SBOM attestations (SLSA compliance)

## 📚 Workflows

### 1. CodeQL Security Analysis
**File**: `.github/workflows/codeql.yml`  
**Triggers**: Push to main, Pull requests, Weekly schedule (Mondays)

**Purpose**: Performs static code analysis to identify security vulnerabilities in TypeScript/JavaScript code.

**Features**:
- Scans JavaScript and TypeScript code
- Uses custom CodeQL configuration (`.github/codeql-config.yml`)
- Uploads results to GitHub Security tab
- Automated security vulnerability detection

**Configuration**: `.github/codeql-config.yml`
- Ignores documentation files and configuration JSON
- Focuses analysis on source code

---

### 2. Dependency Review
**File**: `.github/workflows/dependency-review.yml`  
**Triggers**: Pull requests

**Purpose**: Scans dependency changes in PRs to identify known vulnerabilities.

**Features**:
- Blocks PRs with vulnerable dependencies
- Comments summary directly in PR
- Integrates with GitHub Advisory Database
- Required check for ISMS compliance

---

### 3. Pull Request Labeler
**File**: `.github/workflows/labeler.yml`  
**Triggers**: Pull request opened, synchronized, reopened, or edited

**Purpose**: Automatically applies labels to pull requests based on changed files and PR content.

**Features**:
- Auto-labels based on file patterns
- Checks for label existence before applying
- Provides helpful error messages if labels are missing
- Categorizes changes (MCP server, data access, security, etc.)

**Configuration**: `.github/labeler.yml`
- 20+ label categories specific to MCP server development
- Labels for European Parliament data integration
- Security, testing, infrastructure labels
- TypeScript and code quality labels

**Key Label Categories**:
- 🚀 Features & Enhancements
- 🔌 MCP Server (tools, protocol, handlers)
- 📊 Data & API Integration (European Parliament)
- 🏗️ Infrastructure & Performance
- 🔒 Security & ISMS Compliance
- 📝 Documentation
- 🐛 Bug Fixes
- 🔄 Code Quality & Testing

---

### 4. OSSF Scorecard
**File**: `.github/workflows/scorecard.yml`  
**Triggers**: Push to main, Branch protection changes, Weekly schedule (Tuesdays)

**Purpose**: Evaluates repository security posture against OSSF best practices.

**Features**:
- Comprehensive security checks (Branch Protection, SAST, etc.)
- Publishes results to OpenSSF REST API
- Generates security badge
- Uploads SARIF to GitHub Security tab
- Enhanced permissions for thorough analysis

**Metrics Evaluated**:
- Branch Protection
- Code Review
- Dependency Update Tool
- Maintained
- Signed Releases
- Token Permissions
- Vulnerabilities
- And 10+ more security checks

---

### 5. Build, Attest and Release
**File**: `.github/workflows/release.yml`  
**Triggers**: Manual workflow dispatch, Push of version tags (v*)

**Purpose**: Creates secure, attested releases with full supply chain transparency.

**Jobs**:

#### Job 1: Prepare
- TypeScript compilation validation
- Run tests (if available)
- Version bumping (for manual releases)
- Auto-commit and tag

#### Job 2: Build
- Builds MCP server package
- Creates release artifacts (ZIP)
- Generates SBOM (SPDX format)
- Creates build provenance attestation
- Creates SBOM attestation
- All artifacts signed with Sigstore

#### Job 3: Release
- Creates GitHub Release
- Uploads all artifacts:
  - MCP server package (ZIP)
  - SBOM (SPDX JSON)
  - Build attestation (in-toto)
  - SBOM attestation (in-toto)
- Generates release notes using Release Drafter

**Configuration**: `.github/release-drafter.yml`
- Automated changelog generation
- Semantic versioning (major/minor/patch)
- Category-based organization
- Contributor recognition

**SLSA Compliance**: Level 3 - Full build provenance and attestations

---

### 6. Test and Report
**File**: `.github/workflows/test-and-report.yml`  
**Triggers**: Push to main, Pull requests

**Purpose**: Template workflow for future testing implementation with TypeScript/Node.js best practices.

**Jobs**:

#### Job 1: Prepare
- Caches dependencies
- Installs Node.js and npm packages

#### Job 2: Build Validation
- TypeScript compilation check
- Linting (if configured)
- Knip unused dependency check
- SBOM generation and quality scoring
- Build artifact upload

#### Job 3: Unit Tests (Template)
- Template for Vitest/Jest implementation
- Coverage reporting setup
- Provides implementation guide

#### Job 4: Integration Tests (Template)
- Template for MCP protocol testing
- Template for European Parliament API testing
- Provides implementation guide

#### Job 5: Report
- Combines all test artifacts
- Generates GitHub Actions summary
- Provides setup instructions

**Implementation Guide Included**:
```bash
# Install Vitest
npm install -D vitest @vitest/ui

# Add scripts to package.json
"test": "vitest"
"test:ci": "vitest run --coverage"
"test:integration": "vitest run --config vitest.integration.config.ts"

# Create test files
src/**/*.test.ts
src/**/*.integration.test.ts
```

---

### 7. StandardLint
**File**: `.github/workflows/main.yml`  
**Triggers**: Push to any branch

**Purpose**: Validates repository follows GitHub Community Standards.

**Features**:
- Checks for required files (README, LICENSE, etc.)
- Validates ISMS documentation
- Uses standardlint tool
- Quick validation (< 30 seconds)

---

## 🔧 Configuration Files

### `.github/codeql-config.yml`
CodeQL analysis configuration:
- Ignores docs, markdown, JSON, GitHub configs
- Focuses on source code security

### `.github/labeler.yml`
Label definitions for automatic PR labeling:
- 20+ label patterns
- MCP server specific labels
- European Parliament data labels
- Security and compliance labels

### `.github/release-drafter.yml`
Release notes configuration:
- Changelog categorization
- Semantic versioning rules
- Contributor attribution
- Security badge integration

---

## 🚀 Getting Started

### Required Setup

1. **Enable GitHub Actions**
   - Actions are enabled by default for this repository

2. **Configure Branch Protection**
   - Protect `main` branch
   - Require status checks:
     - CodeQL
     - Dependency Review
     - Build Validation
     - OSSF Scorecard

3. **Create Repository Labels**
   Run the labeler workflow once to ensure all labels exist, or manually create:
   - feature, enhancement
   - bug, fix
   - mcp-server, mcp-tools, mcp-protocol
   - data-access, european-parliament
   - security, isms-compliance
   - documentation
   - infrastructure, performance
   - testing, types, typescript

4. **Enable Security Features**
   - Enable Dependabot alerts
   - Enable Code scanning (CodeQL)
   - Enable Secret scanning

### Testing Workflows

```bash
# Trigger CodeQL scan
git push origin main

# Trigger dependency review
# Create a PR with dependency changes

# Trigger release workflow (manual)
# Go to Actions → Build, Attest and Release → Run workflow

# Check scorecard
# Wait for scheduled run or push to main
```

---

## 📊 Metrics and Reporting

### Security Dashboards
- **GitHub Security Tab**: CodeQL and Scorecard results
- **OSSF Scorecard Badge**: Public security posture
- **Dependency Graph**: Automated vulnerability tracking

### Release Artifacts
Every release includes:
- ✅ MCP Server package (ZIP)
- ✅ SBOM (SPDX JSON format)
- ✅ Build provenance attestation
- ✅ SBOM attestation
- ✅ Automated changelog

### Test Reports (Future)
When tests are implemented:
- Unit test coverage reports
- Integration test results
- Combined test summary

---

## 🔄 Workflow Dependencies

```
CodeQL ─────────────┐
                    ├─→ Security Dashboard
OSSF Scorecard ─────┤
                    │
Dependency Review ──┘

Labeler ──────────→ Pull Requests

Test & Report ─────┐
                   ├─→ Quality Gates
Build Validation ──┘

Release ───────────→ GitHub Releases + Attestations
```

---

## 🛡️ ISMS Compliance

All workflows comply with Hack23 ISMS requirements:

✅ **Secure Development Policy**
- Automated security scanning
- Dependency vulnerability checks
- Code quality validation

✅ **Supply Chain Security**
- SBOM generation (SPDX format)
- Build attestations (SLSA Level 3)
- Pinned action versions
- Harden Runner audit

✅ **Access Control**
- Minimal permissions (read-only default)
- Elevated only when necessary
- Token-based authentication

✅ **Audit Trail**
- All network calls audited
- Complete build provenance
- Signed artifacts

---

## 📝 Customization Guide

### Adding New Labels
Edit `.github/labeler.yml`:
```yaml
my-new-label:
  - changed-files:
      - any-glob-to-any-file:
          - "src/my-feature/**"
  - title: "my-feature:*"
```

### Implementing Tests
Follow the guide in `test-and-report.yml`:
1. Install Vitest: `npm install -D vitest @vitest/ui`
2. Add test scripts to `package.json`
3. Create test files: `src/**/*.test.ts`
4. Run locally: `npm test`

### Custom Release Notes
Edit `.github/release-drafter.yml`:
- Add new categories under `categories`
- Adjust version resolution rules
- Customize template

### CodeQL Queries
Edit `.github/codeql-config.yml`:
```yaml
queries:
  - uses: security-extended
  - uses: security-and-quality
```

---

## 🐛 Troubleshooting

### Labeler Issues
If labels aren't applying:
1. Check labels exist in repository
2. Verify `.github/labeler.yml` syntax
3. Check workflow permissions

### Build Failures
If release build fails:
1. Check TypeScript compilation: `npm run build`
2. Verify package.json version format
3. Check Node.js version compatibility (22+)

### Scorecard Low Score
Improve score by:
1. Enabling branch protection
2. Adding CODEOWNERS file
3. Requiring PR reviews
4. Enabling Dependabot

### Test Workflow Template
The test workflow is intentionally a template:
1. It won't fail if tests aren't implemented
2. Follow the implementation guide
3. Remove `continue-on-error: true` when tests are ready

---

## 🔗 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [OSSF Scorecard](https://securityscorecards.dev/)
- [CodeQL Documentation](https://codeql.github.com/)
- [SLSA Framework](https://slsa.dev/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Hack23 ISMS](https://github.com/Hack23/ISMS)

---

## 📧 Support

For issues or questions:
1. Open a GitHub Issue
2. Check existing workflows in [Hack23/game](https://github.com/Hack23/game)
3. Review ISMS documentation

---

**Last Updated**: January 2025  
**Workflows Version**: 1.0.0  
**Based on**: Hack23/game workflows (adapted for MCP Server)
