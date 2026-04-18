---
name: contribution-guidelines
description: Contribution process with PR workflow, code review standards, commit conventions, and open source best practices
license: Apache-2.0
---

# Contribution Guidelines Skill

## Purpose

Follow proper open source contribution process including PR workflow, code review standards, and commit conventions.

## When to Use

- ✅ Submitting pull requests
- ✅ Conducting code reviews
- ✅ Contributing to open source
- ✅ Reporting bugs or requesting features

## Pull Request Process

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR-USERNAME/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server
git remote add upstream https://github.com/Hack23/European-Parliament-MCP-Server.git
```

### 2. Create Feature Branch

```bash
git checkout -b feature/new-mcp-tool
```

### 3. Make Changes

```bash
npm ci                  # Install dependencies
npm run lint            # Check code style
npm test                # Run tests
npm run build           # Verify build
```

### 4. Commit with Conventional Commits

```bash
git commit -m "feat: add search_votes MCP tool"
git commit -m "fix: handle API timeout in MEP lookup"
git commit -m "docs: update SECURITY_ARCHITECTURE.md"
git commit -m "test: add integration tests for committee API"
```

### 5. Submit PR

```bash
git push origin feature/new-mcp-tool
# Create PR via GitHub UI
```

## Code Review Checklist

### For Contributors

- ✅ All tests pass (`npm test`)
- ✅ Lint passes (`npm run lint`)
- ✅ TypeScript type check passes (`npx tsc --noEmit`)
- ✅ Code follows project conventions
- ✅ Documentation updated
- ✅ No secrets committed
- ✅ Test coverage maintained (80%+)

### For Reviewers

- ✅ Code is maintainable and well-typed
- ✅ Input validation with Zod schemas
- ✅ Error handling follows patterns
- ✅ Security implications considered
- ✅ ISMS policy compliance verified
- ✅ Performance impact acceptable

## Commit Types

| Type | Description |
|------|------------|
| feat | New functionality |
| fix | Bug fix |
| docs | Documentation only |
| style | Code style (formatting) |
| refactor | Code restructuring |
| test | Adding/updating tests |
| chore | Maintenance tasks |
| security | Security fix |

## ISMS Policy References

**Core policies:**

- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — **Primary policy**: Contribution standards, licensing, DCO, redistribution, supply chain
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — Code-review requirements, CI gates, test coverage
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Transparency, community trust
- [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) — PR workflow, approvals, reversibility

**Supporting policies (cite when applicable):**

- [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) — Contributor PII (email in git log) handling
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) — Branch protection, CODEOWNERS
- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) — Disclosure when contribution is AI-assisted
- [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) — Responsible disclosure for security-related contributions
