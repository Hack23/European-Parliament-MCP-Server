---
name: secrets-management
description: Secure credential handling using environment variables, GitHub secrets, and never committing secrets to source code
license: Apache-2.0
---

# Secrets Management Skill

## Purpose

Ensure secure handling of API keys, tokens, and credentials in MCP server development. Zero tolerance for hardcoded secrets.

## When to Use

- ✅ Adding external API integrations
- ✅ Configuring CI/CD pipelines with secrets
- ✅ Setting up MCP server authentication
- ✅ Managing GitHub tokens for MCP servers
- ✅ Reviewing code for credential exposure

## Golden Rules

### Rule 1: Never Commit Secrets

```typescript
// ❌ NEVER: Hardcoded credentials
const API_KEY = "sk_live_abc123def456";

// ✅ CORRECT: Environment variables
const API_KEY = process.env['EP_API_KEY'] ?? '';
```

### Rule 2: Use Environment Variables

```typescript
// MCP server configuration
const config = {
  timeout: Number.parseInt(process.env['EP_REQUEST_TIMEOUT_MS'] ?? '10000'),
  baseUrl: process.env['EP_BASE_URL'] ?? 'https://data.europarl.europa.eu/api/v2',
};
```

### Rule 3: GitHub Secrets for CI/CD

```yaml
# .github/workflows/ci.yml
env:
  EP_API_KEY: ${{ secrets.EP_API_KEY }}
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Rule 4: MCP Server Token Security

MCP server tokens are injected at runtime by the GitHub Copilot environment via `.github/copilot-mcp.json`. Secrets are never stored in configuration files — GitHub resolves `${{ secrets.* }}` references during workflow execution:

```yaml
# .github/copilot-mcp.json uses secret references (resolved by GitHub at runtime)
# The MCP client receives actual token values — never template strings
# See .github/copilot-mcp.json for the canonical configuration
```

Environment variables for local development:
```bash
export GITHUB_TOKEN="ghp_your_token_here"  # Set in shell, never in code
```

## Detection and Prevention

### .gitignore Must Include

```gitignore
.env
.env.local
.env.production
*.key
*.pem
secrets/
credentials/
```

### Pre-commit Scanning

```bash
# GitHub enables secret scanning automatically
# Additional: npm audit, CodeQL analysis
```

## Incident Response

If a secret is committed:
1. ✅ Rotate the compromised secret immediately
2. ✅ Revoke old secret from all systems
3. ✅ Review access logs for unauthorized access
4. ✅ Clean git history if possible
5. ✅ Document incident

## ISMS Policy References

- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md) - Key management
- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) - Secrets access
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) - Never commit secrets
