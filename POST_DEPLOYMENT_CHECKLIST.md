# Post-Deployment Checklist for GitHub Actions Workflows

This checklist ensures all workflows are properly configured and functioning after deployment.

## ⚡ Immediate Actions (Before First PR)

### 1. Enable GitHub Security Features
- [ ] Go to Settings → Security → Code security and analysis
- [ ] Enable **Dependency graph**
- [ ] Enable **Dependabot alerts**
- [ ] Enable **Dependabot security updates**
- [ ] Enable **CodeQL analysis** (will use our workflow)
- [ ] Enable **Secret scanning**
- [ ] Enable **Push protection** for secrets

### 2. Configure Branch Protection Rules
- [ ] Go to Settings → Branches → Branch protection rules
- [ ] Add rule for `main` branch:
  - ✅ Require pull request reviews before merging (1 approval)
  - ✅ Require status checks to pass before merging
    - Required checks:
      - [ ] CodeQL (Analyze TypeScript/JavaScript)
      - [ ] Dependency Review
      - [ ] Build Validation (test-and-report)
      - [ ] Scorecard analysis
      - [ ] StandardLint
  - ✅ Require conversation resolution before merging
  - ✅ Require linear history
  - ✅ Include administrators
  - ✅ Restrict pushes to main

### 3. Create Repository Labels
Run one of these options:

**Option A: Manual Creation**
Create these labels manually in Settings → Labels:

```
feature (green #0e8a16)
enhancement (green #a2eeef)
bug (red #d73a4a)
fix (red #b60205)
mcp-server (blue #0052cc)
mcp-tools (blue #1d76db)
mcp-protocol (blue #0e8a16)
data-access (yellow #fbca04)
european-parliament (yellow #f9d0c4)
security (red #ee0701)
isms-compliance (red #5319e7)
documentation (blue #0075ca)
dependencies (yellow #0366d6)
infrastructure (grey #d4c5f9)
performance (purple #5319e7)
testing (green #00ff00)
typescript (blue #007acc)
types (blue #0052cc)
error-handling (orange #ff6347)
logging (orange #ffa500)
validation (orange #ff8c00)
models (purple #9c27b0)
utilities (purple #673ab7)
caching (purple #3f51b5)
```

**Option B: Automated (Future)**
Create a label setup workflow to automatically create all required labels.

### 4. Test Workflows

**Test 1: CodeQL Scan**
```bash
# Trigger by pushing to main
git push origin main

# Or wait for weekly schedule (Mondays at 00:00 UTC)
```
Expected: Should complete in ~5 minutes, results in Security tab

**Test 2: Dependency Review**
```bash
# Create a test PR with dependency changes
echo '{"dependencies": {"test": "1.0.0"}}' >> test.json
git checkout -b test/dependency-review
git add test.json
git commit -m "test: dependency review"
git push origin test/dependency-review
# Create PR
```
Expected: Workflow runs on PR, comments if vulnerabilities found

**Test 3: PR Labeler**
```bash
# Create PR with changes to different files
git checkout -b test/labeler
echo "test" >> src/test.ts  # Should get 'typescript' label
git add src/test.ts
git commit -m "test: labeler"
git push origin test/labeler
# Create PR
```
Expected: PR automatically labeled based on changed files

**Test 4: Scorecard**
```bash
# Triggered automatically on push to main or weekly
git push origin main
```
Expected: Should complete in ~2 minutes, badge updated

## 📅 Weekly Actions

### Monday
- [ ] Review CodeQL scan results (automatic, scheduled weekly)
- [ ] Address any security findings

### Tuesday  
- [ ] Review OSSF Scorecard results (automatic, scheduled weekly)
- [ ] Check scorecard badge and address any score decreases

### Friday
- [ ] Review open PRs for security/dependency labels
- [ ] Ensure all PRs have appropriate labels

## 📆 Monthly Actions

### Security Review
- [ ] Review all CodeQL alerts (resolved and open)
- [ ] Review Dependabot alerts
- [ ] Check SBOM quality scores
- [ ] Update pinned action versions if security advisories exist

### Workflow Maintenance
- [ ] Check for action version updates
- [ ] Review workflow run times (optimize if needed)
- [ ] Check artifact storage usage
- [ ] Review and clean up old workflow runs

### Documentation Review
- [ ] Update WORKFLOWS.md if workflows changed
- [ ] Update MIGRATION_SUMMARY.md if needed
- [ ] Review and update implementation guides

## 📆 Quarterly Actions

### Security Audit
- [ ] Review all security configurations
- [ ] Test rollback procedures
- [ ] Review access controls and permissions
- [ ] Audit SBOM completeness
- [ ] Review attestation signatures

### Workflow Optimization
- [ ] Analyze workflow performance metrics
- [ ] Optimize caching strategies
- [ ] Review and update dependencies
- [ ] Check for deprecated actions

### ISMS Compliance Review
- [ ] Verify all ISMS requirements are met
- [ ] Update compliance documentation
- [ ] Review audit logs
- [ ] Test incident response procedures

## 🚀 Release Checklist

Before creating your first release:

### 1. Prepare Release
- [ ] Ensure all tests pass (or template ready)
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Review all PRs included in release
- [ ] Verify no open security vulnerabilities

### 2. Create Release
**Manual Release:**
```bash
# Via GitHub Actions UI
Go to Actions → Build, Attest and Release → Run workflow
Enter version: v0.1.0
Select prerelease: false
Click Run workflow
```

**Or via Git Tags:**
```bash
git tag v0.1.0
git push origin v0.1.0
```

### 3. Verify Release
- [ ] Release appears in GitHub Releases
- [ ] All artifacts uploaded:
  - [ ] european-parliament-mcp-server-{version}.zip
  - [ ] european-parliament-mcp-server-{version}.spdx.json
  - [ ] Build attestation (.intoto.jsonl)
  - [ ] SBOM attestation (.intoto.jsonl)
- [ ] Release notes generated correctly
- [ ] SLSA badge shows Level 3
- [ ] Download and verify artifacts

### 4. Post-Release
- [ ] Verify attestations with GitHub CLI:
```bash
gh attestation verify european-parliament-mcp-server-v0.1.0.zip \
  --owner Hack23 \
  --repo European-Parliament-MCP-Server
```
- [ ] Update documentation if needed
- [ ] Announce release (if public)
- [ ] Monitor for any issues

## 🧪 Testing Implementation Checklist

When ready to implement tests:

### 1. Install Testing Framework
```bash
npm install -D vitest @vitest/ui c8
npm install -D @types/node
```

### 2. Add Test Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:watch": "vitest --watch",
    "coverage": "vitest run --coverage"
  }
}
```

### 3. Create Test Files
```bash
# Unit tests
src/tools/parliament-search.test.ts
src/api/client.test.ts
src/utils/cache.test.ts

# Integration tests
src/api/client.integration.test.ts
src/tools/parliament-search.integration.test.ts
```

### 4. Configure Vitest
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  }
});
```

### 5. Update Test Workflow
In `.github/workflows/test-and-report.yml`:
- [ ] Remove `continue-on-error: true` from test steps
- [ ] Update coverage threshold if needed
- [ ] Add test result reporting

### 6. First Test Run
```bash
npm test
npm run coverage
```
Expected: All tests pass, coverage report generated

## 📊 Monitoring Checklist

### GitHub Actions Dashboard
- [ ] Bookmark: `https://github.com/Hack23/European-Parliament-MCP-Server/actions`
- [ ] Check daily for failed workflows
- [ ] Monitor workflow run times
- [ ] Review artifact storage usage

### Security Dashboard
- [ ] Bookmark: `https://github.com/Hack23/European-Parliament-MCP-Server/security`
- [ ] Check weekly for new alerts
- [ ] Review CodeQL findings
- [ ] Monitor Dependabot PRs

### OSSF Scorecard
- [ ] Bookmark: `https://scorecard.dev/viewer/?uri=github.com/Hack23/European-Parliament-MCP-Server`
- [ ] Check monthly for score changes
- [ ] Review failing checks
- [ ] Implement recommendations

### Metrics to Track
- [ ] Workflow success rate (target: >95%)
- [ ] Average workflow duration (target: <10 min)
- [ ] OSSF Scorecard score (target: >7.0)
- [ ] SBOM quality score (target: >7.0)
- [ ] CodeQL alert resolution time (target: <7 days)
- [ ] Test coverage (target: >80% when implemented)

## 🐛 Troubleshooting Guide

### Workflow Fails

**CodeQL Fails:**
1. Check TypeScript compilation: `npm run build`
2. Review CodeQL logs in Actions tab
3. Check `.github/codeql-config.yml` for issues

**Dependency Review Fails:**
1. Review dependency changes in PR
2. Check GitHub Advisory Database for CVEs
3. Update vulnerable dependencies

**Labeler Fails:**
1. Verify labels exist in repository
2. Check `.github/labeler.yml` syntax
3. Review workflow permissions

**Release Fails:**
1. Check package.json version format
2. Verify all tests pass
3. Check Node.js version (22+)
4. Review build logs

**Scorecard Score Low:**
1. Enable branch protection (biggest impact)
2. Add CODEOWNERS file
3. Require PR reviews
4. Enable Dependabot
5. Review scorecard recommendations

### Common Issues

**Issue: "Labels not found"**
- Solution: Create labels manually or wait for first PR
- See: Section 3 "Create Repository Labels"

**Issue: "Permission denied" in workflows**
- Solution: Check workflow permissions in YAML
- Ensure minimal permissions are sufficient

**Issue: "SBOM quality score too low"**
- Solution: Ensure all dependencies in package.json
- Update package.json metadata (description, author, license)
- Run: `sbomqs score {file}.spdx.json --detailed`

**Issue: "Attestation verification fails"**
- Solution: Ensure GitHub attestation service is enabled
- Check artifact was uploaded correctly
- Verify using GitHub CLI

## 📞 Support & Resources

### Documentation
- `.github/WORKFLOWS.md` - Workflow guide
- `MIGRATION_SUMMARY.md` - Migration details
- This file - Post-deployment checklist

### External Resources
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [OSSF Scorecard](https://securityscorecards.dev/)
- [SLSA Framework](https://slsa.dev/)
- [CodeQL Docs](https://codeql.github.com/)

### Getting Help
1. Review documentation above
2. Check Hack23/game for reference implementations
3. Open GitHub Issue with `infrastructure` label
4. Contact DevOps team

## ✅ Completion Verification

After completing all immediate actions:

- [ ] All security features enabled
- [ ] Branch protection configured
- [ ] Labels created
- [ ] All workflows tested successfully
- [ ] Documentation reviewed
- [ ] Team notified of changes
- [ ] Monitoring bookmarks set up
- [ ] First release completed (optional)

**Congratulations!** Your GitHub Actions workflows are fully configured and operational.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintainer**: DevOps Team
