---
name: gdpr-compliance
description: GDPR and data protection patterns for handling European Parliament personal data with privacy by design
license: MIT
---

# GDPR Compliance Skill

## Context

This skill applies when:
- Processing personal data from European Parliament (MEP information)
- Implementing data minimization strategies
- Supporting GDPR rights (access, rectification, erasure)
- Implementing audit logging for personal data access
- Designing privacy-by-design features
- Handling data retention and deletion
- Implementing consent mechanisms
- Creating data protection impact assessments

GDPR (EU Regulation 2016/679) applies to all processing of EU citizens' personal data. Even though MEP data is public, GDPR principles still apply.

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

## Examples

### ✅ Good Pattern: Data Minimization

```typescript
// GOOD: Only public information
interface MEPPublicData {
  id: number;
  fullName: string;
  country: string;
  partyGroup: string;
  active: boolean;
  // DO NOT collect: private addresses, personal phones, family data
}

// Define data purpose
const DATA_PURPOSE = 'Providing public parliamentary information via MCP protocol';
```

### ✅ Good Pattern: Audit Logging

```typescript
/**
 * GDPR-compliant audit logging
 * Requirement: GDPR Art. 30 (Records of processing activities)
 */
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

// Usage
logPersonalDataAccess(
  'mcp_client',
  'mep:12345',
  'Parliamentary information query'
);
```

### ✅ Good Pattern: Right to Rectification

```typescript
/**
 * Support GDPR Art. 16 (Right to rectification)
 */
async function updateMEPData(
  id: number,
  corrections: Partial<MEP>
): Promise<void> {
  // Validate corrections
  const validated = MEPUpdateSchema.parse(corrections);
  
  // Update data
  await updateMEP(id, validated);
  
  // Invalidate cache
  invalidateMEPCache(id);
  
  // Audit log
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
/**
 * GDPR Art. 5(1)(e): Storage limitation
 * Personal data cached for max 24 hours
 */
const mepCache = new LRUCache<string, MEP>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours max
  allowStale: false,
});

// Auto-purge expired entries
setInterval(() => {
  mepCache.purgeStale();
}, 1000 * 60 * 60); // Hourly cleanup
```

## Anti-Patterns

### ❌ Bad: No Audit Logging
```typescript
// NEVER - GDPR requires audit logs!
async function bad(mepId: number) {
  return await getMEP(mepId); // No logging!
}
```

### ❌ Bad: Excessive Data Collection
```typescript
// NEVER - violates data minimization!
interface MEPBad {
  id: number;
  fullName: string;
  privateAddress: string;      // Excessive!
  personalPhone: string;        // Excessive!
  familyMembers: string[];      // Excessive!
  medicalRecords: string;       // Excessive!
}
```

### ❌ Bad: Indefinite Storage
```typescript
// NEVER - violates storage limitation!
const cache = new Map(); // No TTL = indefinite storage!
```

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
  // For current MEPs: Cannot erase (public interest exemption)
  // CAN erase: Cached personal contact information
  
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
