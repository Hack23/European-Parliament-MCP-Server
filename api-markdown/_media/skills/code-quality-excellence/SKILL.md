---
name: code-quality-excellence
description: Enforce code quality with ESLint, TypeScript strict mode, Knip unused detection, and quality gates for MCP servers
license: Apache-2.0
---

# Code Quality Excellence Skill

## Purpose

Maintain high code quality through automated static analysis, TypeScript strict mode, and quality gates for MCP server projects.

## When to Use

- ✅ Before committing TypeScript code
- ✅ In CI/CD pipeline quality checks
- ✅ During code reviews
- ✅ Regular quality audits

## TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## ESLint Configuration

```javascript
// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.strictTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
    }
  }
);
```

## Quality Gates

| Metric | Threshold |
|--------|-----------|
| Test coverage | ≥80% lines, ≥70% branches |
| Security coverage | ≥95% for security-critical code |
| TypeScript errors | 0 |
| ESLint errors | 0 |
| Unused exports (Knip) | 0 |
| License violations | 0 |

## Quality Commands

```bash
npm run lint          # ESLint check
npx tsc --noEmit      # Type checking
npm run knip          # Unused detection
npm test              # Unit tests
npm run test:coverage # Coverage report
npm run test:licenses # License compliance
```

## ISMS Policy References

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) - Code quality standards
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) - License compliance
