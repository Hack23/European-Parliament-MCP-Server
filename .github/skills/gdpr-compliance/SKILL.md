---
name: gdpr-compliance
description: "Enforces GDPR data protection for European Parliament personal data — data minimization, audit logging, cache TTL limits, and data subject rights (access, rectification, erasure). Use when processing MEP personal data, implementing privacy controls, handling data subject requests, conducting a DPIA, applying PII anonymization, or configuring cache retention policies."
license: MIT
---

# GDPR Compliance Skill

## Context

This skill applies when:
- Processing personal data from European Parliament (MEP information)
- Implementing data minimization strategies
- Supporting data subject rights: access, rectification, erasure, consent withdrawal
- Implementing audit logging for PII and personal data access
- Designing privacy-by-design features
- Handling data retention and deletion
- Implementing consent mechanisms
- Creating data protection impact assessments (DPIA)
- Applying anonymization or pseudonymization to personal data

## Rules

1. **Data Minimization**: Only collect necessary personal data fields
2. **Purpose Limitation**: Use data only for stated purpose (parliamentary information)
3. **Storage Limitation**: Cache personal data for max 24 hours
4. **Accuracy**: Maintain data integrity, support corrections
5. **Lawful Basis**: Public interest (GDPR Art. 6(1)(e)) for MEP data
6. **Audit Logging**: Log all personal data access
7. **Right to Rectification**: Support data correction requests
8. **Right to Erasure**: Limited for public figures (GDPR Art. 17(3)(e))
9. **Data Protection by Design**: Build privacy into architecture
10. **Transparency**: Document all data processing activities

## Workflow

1. Define minimal data interface — include only public parliamentary fields (name, country, party, active status), exclude private data
2. Implement audit logging for all personal data access (GDPR Art. 30) — every read, write, and delete must be recorded
3. Configure cache with TTL (max 24h for personal data) and hourly stale-entry purge
4. Add data subject rights handlers: access (Art. 15), rectification (Art. 16), erasure (Art. 17)
5. Conduct a DPIA if introducing new processing activities or changing data flows
6. Verify: confirm audit logs capture every access path, cache entries expire correctly, and no PII leaks into unprotected stores

## Examples

### ✅ Good Pattern: Data Minimization

```typescript
interface MEPPublicData {
  id: number;
  fullName: string;
  country: string;
  partyGroup: string;
  active: boolean;
}

const DATA_PURPOSE = 'Providing public parliamentary information via MCP protocol';
```

### ✅ Good Pattern: Audit Logging

```typescript
/** GDPR Art. 30 — Records of processing activities */
function logPersonalDataAccess(
  actor: string,
  subject: string,
  purpose: string
): void {
  auditLog.record({
    timestamp: new Date().toISOString(),
    eventType: 'personal_data_access',
    actor,
    subject,
    purpose,
    legalBasis: 'GDPR_Art_6_1_e_Public_Interest',
  });
}

logPersonalDataAccess(
  'mcp_client',
  'mep:12345',
  'Parliamentary information query'
);
```

### ✅ Good Pattern: Right to Rectification

```typescript
/** GDPR Art. 16 — Right to rectification */
async function updateMEPData(
  id: number,
  corrections: Partial<MEP>
): Promise<void> {
  const validated = MEPUpdateSchema.parse(corrections);
  await updateMEP(id, validated);
  invalidateMEPCache(id);

  auditLog.record({
    eventType: 'data_rectification',
    subject: `mep:${id}`,
    action: 'update',
    details: corrections,
    legalBasis: 'GDPR_Art_16_Right_to_Rectification',
  });
}
```

### ✅ Good Pattern: Storage Limitation

```typescript
/** GDPR Art. 5(1)(e) — Personal data cached for max 24 hours */
const mepCache = new LRUCache<string, MEP>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
  allowStale: false,
});

setInterval(() => {
  mepCache.purgeStale();
}, 1000 * 60 * 60);
```

## Anti-Patterns

- **Never** access personal data without audit logging — every `getMEP()` call must be recorded
- **Never** collect private addresses, personal phones, family data, or medical records (data minimization)
- **Never** store personal data in a cache without TTL — use max 24h with `allowStale: false`

## GDPR Rights Implementation

### Right to Access (Art. 15)
```typescript
async function getPersonalData(mepId: number): Promise<PersonalDataExport> {
  return {
    data: await getMEP(mepId),
    purpose: DATA_PURPOSE,
    legalBasis: 'Public interest (Art. 6(1)(e))',
    retentionPeriod: '24 hours (cache)',
    recipients: 'MCP clients',
  };
}
```

### Right to Erasure (Art. 17)
```typescript
async function handleErasureRequest(mepId: number): Promise<ErasureResult> {
  // Current MEPs: public interest exemption (Art. 17(3)(e))
  // Cached personal contact info: eligible for erasure
  invalidateMEPCache(mepId);

  return {
    success: true,
    scope: 'cached_data_only',
    reason: 'Public figure exemption (GDPR Art. 17(3)(e))',
  };
}
```

## ISMS Compliance

- **PR-001**: Privacy by Design and Default
- **PR-002**: Data Minimization
- **PR-003**: Data Subject Rights
- **AU-002**: Audit Logging

Reference: [Hack23 Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)
