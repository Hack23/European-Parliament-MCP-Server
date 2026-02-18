# npm Publishing Guide

This document describes the npm publishing process for the European Parliament MCP Server package.

## 📦 Package Configuration

### Package Name and Scope

- **Package name**: `european-parliament-mcp-server`
- **Scope**: Public (no organization scope)
- **Registry**: https://registry.npmjs.org/
- **Provenance**: Enabled (SLSA Level 3)

### Package Contents

The npm package includes:
- ✅ Compiled TypeScript (`dist/` directory)
- ✅ TypeScript type definitions (`.d.ts` files)
- ✅ Essential documentation (README, LICENSE, SECURITY, CHANGELOG)
- ❌ Source code (excluded)
- ❌ Tests (excluded)
- ❌ Development configurations (excluded)

## 🔐 Security & Provenance

### npm Provenance

This package is published with **npm provenance** enabled, providing:

- 🔒 **Cryptographic proof** of build integrity
- 🔍 **Transparent build process** (GitHub Actions)
- ✅ **SLSA Level 3 compliance** for supply chain security
- 🛡️ **Verifiable artifacts** with attestations

### Verifying Package Integrity

To verify the published package:

```bash
# Install the package
npm install european-parliament-mcp-server

# Verify provenance signatures
npm audit signatures

# View package provenance
npm view european-parliament-mcp-server --json | jq '.dist.attestations'
```

### GitHub Attestations

All published packages include GitHub attestations:

```bash
# Verify GitHub attestation
gh attestation verify european-parliament-mcp-server@<version> \
  --owner Hack23 \
  --repo European-Parliament-MCP-Server
```

## 🚀 Publishing Process

### Automated Publishing (Recommended)

Publishing is automated via GitHub Actions release workflow:

1. **Create a release** (manual or via Release Drafter)
   - Release tags trigger the workflow automatically
   - Workflow dispatch allows manual version specification

2. **Workflow executes**:
   - ✅ Runs linting (`npm run lint`)
   - ✅ Checks for unused dependencies (`npm run knip`)
   - ✅ Runs unit tests (`npm run test:unit`)
   - ✅ Builds package (`npm run build`)
   - ✅ Generates SBOM and attestations
   - ✅ Creates GitHub release with artifacts
   - ✅ Publishes to npm with provenance

3. **Package is published** to npm registry
   - Available at: https://www.npmjs.com/package/european-parliament-mcp-server
   - Includes cryptographic provenance

### Manual Publishing (Emergency Only)

For emergency hotfixes, manual publishing is possible:

```bash
# 1. Ensure you're on the correct branch
git checkout main
git pull origin main

# 2. Update version in package.json
npm version patch  # or minor, or major

# 3. Run pre-publish checks
npm run prepublishOnly

# 4. Publish with provenance (requires npm 9.5.0+)
npm publish --provenance --access public

# 5. Create git tag and push
git push origin main --tags
```

**⚠️ Important**: Manual publishing should only be used in emergencies. Always prefer automated publishing for full attestation support.

## 🔑 Required Secrets

### npm Token

The `NPM_TOKEN` secret must be configured in GitHub repository settings:

1. **Generate npm token**:
   - Login to https://www.npmjs.com/
   - Go to Account Settings → Access Tokens
   - Generate new **Automation** token (not Classic)
   - Copy the token (starts with `npm_`)

2. **Add to GitHub**:
   - Go to repository Settings → Secrets and variables → Actions
   - Create new secret: `NPM_TOKEN`
   - Paste the npm token

3. **Token permissions**:
   - ✅ Publish packages
   - ✅ Access public packages
   - ❌ No access to private packages needed

## 📋 Pre-publish Checklist

Before publishing a new version:

- [ ] All tests passing (`npm test`)
- [ ] Linting clean (`npm run lint`)
- [ ] No unused dependencies (`npm run knip`)
- [ ] License compliance verified (`npm run test:licenses`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] README updated (if needed)
- [ ] SECURITY.md reviewed (if changes affect security)

## 🔄 Version Management

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes (e.g., API incompatible changes)
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, backward compatible

### Version Bumping

The release workflow automatically handles version bumping:

```yaml
# Workflow extracts version from git tag
# Format: v1.2.3 → 1.2.3
```

Manual version bumping:

```bash
npm version patch   # 0.0.1 → 0.0.2
npm version minor   # 0.0.1 → 0.1.0
npm version major   # 0.0.1 → 1.0.0
```

## 📦 Package Testing

### Test Package Locally

Before publishing, test the package:

```bash
# Create package
npm pack

# Inspect contents
tar -tzf european-parliament-mcp-server-*.tgz

# Test installation
npm install ./european-parliament-mcp-server-*.tgz

# Test in another project
cd /tmp/test-project
npm install /path/to/european-parliament-mcp-server-*.tgz
```

### Test Package from npm

After publishing:

```bash
# Install latest version
npm install european-parliament-mcp-server

# Test CLI
npx european-parliament-mcp-server --version

# Test in MCP client
# Add to claude_desktop_config.json and restart Claude
```

## 🛡️ Security Considerations

### Package Integrity

- ✅ **npm provenance** enabled for build transparency
- ✅ **SLSA Level 3** compliance for supply chain security
- ✅ **Cryptographic attestations** for all artifacts
- ✅ **SBOM** (Software Bill of Materials) included
- ✅ **Dependency scanning** via Dependabot

### Security Scanning

Published packages are automatically scanned:

- **npm audit**: Dependency vulnerability scanning
- **Snyk**: Continuous vulnerability monitoring
- **OpenSSF Scorecard**: Supply chain security assessment
- **GitHub CodeQL**: Static code analysis

### Dependency Management

- ✅ Only production dependencies in published package
- ✅ All dependencies license-compliant
- ✅ Regular security updates via Dependabot
- ✅ Minimal dependency footprint (4 runtime dependencies)

## 📚 Additional Resources

### npm Documentation

- [npm publish](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
- [npm audit signatures](https://docs.npmjs.com/cli/v10/commands/npm-audit)

### SLSA Documentation

- [SLSA Levels](https://slsa.dev/spec/v1.0/levels)
- [npm and SLSA](https://slsa.dev/spec/v1.0/verifying-artifacts#npm)
- [GitHub Attestations](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds)

### Hack23 ISMS Policies

- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Supply Chain Security](https://github.com/Hack23/ISMS-PUBLIC)

## 🐛 Troubleshooting

### Publishing Fails

**Error: "You do not have permission to publish"**
- Verify npm token is valid and not expired
- Check token has "Automation" permission
- Ensure you're a maintainer of the package

**Error: "Version already exists"**
- npm does not allow overwriting published versions
- Bump version and publish again
- For mistakes, use `npm deprecate` (don't unpublish)

**Error: "Provenance generation failed"**
- Ensure GitHub Actions has `id-token: write` permission
- Verify npm version >= 9.5.0
- Check `NODE_AUTH_TOKEN` secret is set

### Verification Fails

**Error: "Signature verification failed"**
- Ensure package was published with provenance
- Check npm version >= 9.5.0 for verification
- Verify using `npm view` to check attestations

**Error: "GitHub attestation not found"**
- Package must be published via GitHub Actions
- Check workflow logs for attestation generation
- Verify `attestations: write` permission in workflow

## 📞 Support

For npm publishing issues:

1. Check this guide first
2. Review GitHub Actions workflow logs
3. Check npm registry status: https://status.npmjs.org/
4. Contact repository maintainers via GitHub Issues

---

**Last Updated**: 2026-02-18  
**Version**: 1.0.0  
**Maintained by**: Hack23 AB
