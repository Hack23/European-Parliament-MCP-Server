---
name: secure-code-review
description: Security code review using OWASP Top 10, input validation, and Hack23 ISMS secure development policy for TypeScript/MCP
license: Apache-2.0
---

# Secure Code Review Skill

## Purpose

Conduct thorough security code reviews for TypeScript MCP server code, identifying vulnerabilities before production.

## When to Use

- ✅ Reviewing pull requests before merge
- ✅ Conducting periodic security audits
- ✅ Implementing features that handle external API data
- ✅ Integrating third-party libraries
- ✅ Before major releases

## Security Review Checklist

### Input Validation (OWASP A03 - Injection)

```typescript
// ✅ SECURE: Zod schema validation
import { z } from 'zod';
const InputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  country: z.string().length(2)
});

// ❌ INSECURE: No validation
function getUser(id: any) { return db.query(`SELECT * FROM users WHERE id = ${id}`); }
```

### API Security (OWASP A01 - Broken Access Control)

- ✅ Validate all MCP tool inputs with Zod schemas
- ✅ Rate limit API calls to European Parliament endpoints
- ✅ Handle errors without leaking internal details
- ✅ Use HTTPS for all external API calls
- ✅ Set appropriate request timeouts

### Dependency Security (OWASP A06 - Vulnerable Components)

```bash
npm audit --audit-level=high
npx knip                    # Find unused dependencies
npm run test:licenses       # Check license compliance
```

### Error Handling

```typescript
// ✅ SECURE: Generic error messages
catch (error) {
  logger.error('Internal error details', { error });
  return { error: 'An unexpected error occurred' };
}

// ❌ INSECURE: Leaking internals
catch (error) {
  return { error: error.stack }; // Never expose stack traces
}
```

## Review Exit Criteria

- ✅ No new CodeQL alerts introduced
- ✅ All inputs validated with Zod schemas
- ✅ No secrets or credentials in code
- ✅ Error handling doesn't leak sensitive info
- ✅ Security tests added for sensitive features
- ✅ Dependencies scanned for vulnerabilities

## ISMS Policy References

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)
- [Cryptography Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Cryptography_Policy.md)
