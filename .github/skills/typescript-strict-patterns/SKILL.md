---
name: typescript-strict-patterns
description: TypeScript strict mode patterns, branded types, discriminated unions, and type-safe architecture for MCP servers
license: MIT
---

# TypeScript Strict Patterns Skill

## Context

This skill applies when:
- Writing TypeScript code with strict mode enabled
- Defining types and interfaces for European Parliament data
- Creating branded types for IDs to prevent mixing
- Implementing discriminated unions for type-safe variants
- Converting Zod schemas to TypeScript types
- Using utility types (Pick, Omit, Partial, Required)
- Handling nullable types safely
- Implementing generic type patterns
- Ensuring type safety across API boundaries

TypeScript strict mode is enabled in this project with `strictNullChecks`, `noImplicitAny`, and `noUncheckedIndexedAccess`. All code must comply with these strict rules.

## Rules

1. **Never Use `any`**: Use `unknown` for truly dynamic types, then narrow with type guards
2. **Always Define Return Types**: Explicitly type all function return values
3. **Use Branded Types for IDs**: Prevent mixing different ID types (MEP_ID vs DocumentID)
4. **Leverage `z.infer<>`**: Derive TypeScript types from Zod schemas
5. **Handle Nulls Explicitly**: Check for null/undefined before accessing properties
6. **Use Discriminated Unions**: Type-safe variants with discriminator field
7. **Prefer `interface` for Objects**: Use `type` for unions, aliases, mapped types
8. **Use Utility Types**: Leverage Pick, Omit, Partial, Required, Record
9. **Type All Parameters**: Never rely on implicit parameter types
10. **Use `as const`**: For literal types and readonly values

## Examples

### ✅ Good Pattern: Branded Types

```typescript
import { z } from 'zod';

// Branded type for MEP IDs (prevents mixing with other IDs)
const MEP_ID = z.number().int().positive().brand<'MEP_ID'>();
type MEP_ID = z.infer<typeof MEP_ID>;

// Branded type for Document IDs
const DocumentIDSchema = z.string()
  .regex(/^EP-\d{8}-\d{5}$/)
  .brand<'DocumentID'>();
type DocumentID = z.infer<typeof DocumentIDSchema>;

// Type safety: Can't mix IDs
function getMEP(id: MEP_ID): Promise<MEP> { /* ... */ }
function getDocument(id: DocumentID): Promise<Document> { /* ... */ }

const mepId: MEP_ID = MEP_ID.parse(12345);
const docId: DocumentID = DocumentIDSchema.parse('EP-20240101-00001');

await getMEP(mepId);     // ✅ Works
await getDocument(docId); // ✅ Works
// await getMEP(docId);    // ❌ Type error: DocumentID not assignable to MEP_ID
```

### ✅ Good Pattern: Discriminated Unions

```typescript
/**
 * Discriminated union for type-safe question handling
 */
interface WrittenQuestion {
  type: 'written';
  id: string;
  questionText: string;
  answerText?: string;
}

interface OralQuestion {
  type: 'oral';
  id: string;
  questionText: string;
  sessionDate: string;
}

interface PriorityQuestion {
  type: 'priority';
  id: string;
  questionText: string;
  deadline: string;
}

type ParliamentaryQuestion = WrittenQuestion | OralQuestion | PriorityQuestion;

// Type-safe handling with exhaustive checking
function processQuestion(q: ParliamentaryQuestion): string {
  switch (q.type) {
    case 'written':
      return `Written: ${q.answerText || 'pending'}`;
    case 'oral':
      return `Oral on ${q.sessionDate}`;
    case 'priority':
      return `Priority, deadline: ${q.deadline}`;
    default:
      // TypeScript ensures all cases handled
      const _exhaustive: never = q;
      return _exhaustive;
  }
}
```

### ✅ Good Pattern: Zod Schema to TypeScript Type

```typescript
import { z } from 'zod';

// Define Zod schema (runtime validation)
const MEPSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(1).max(255),
  country: z.string().length(2),
  partyGroup: z.string().min(1).max(50),
  active: z.boolean(),
  termStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  termEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  committees: z.array(z.string()).default([]),
}).strict();

// Infer TypeScript type from schema
type MEP = z.infer<typeof MEPSchema>;

// Use in function
function validateMEP(data: unknown): MEP {
  return MEPSchema.parse(data);
}
```

### ✅ Good Pattern: Utility Types

```typescript
interface MEP {
  id: number;
  fullName: string;
  country: string;
  partyGroup: string;
  email?: string;
  phone?: string;
}

// Pick specific fields
type MEPSummary = Pick<MEP, 'id' | 'fullName' | 'country'>;

// Omit sensitive fields
type PublicMEP = Omit<MEP, 'email' | 'phone'>;

// All fields optional (for updates)
type MEPUpdate = Partial<MEP>;

// All fields required
type CompleteMEP = Required<MEP>;

// Record type for mapping
type MEPMap = Record<number, MEP>;

// Readonly (immutable)
type ImmutableMEP = Readonly<MEP>;
```

### ✅ Good Pattern: Null Safety

```typescript
// Handle nullable types explicitly
function getCommitteeName(mep: MEP, committeeCode?: string): string | null {
  if (!committeeCode) {
    return null;
  }
  
  const committee = mep.committees?.find(c => c.code === committeeCode);
  
  if (!committee) {
    return null;
  }
  
  return committee.name;
}

// Non-null assertion only when certain
function getRequiredField(data: { field?: string }): string {
  // Only use ! when you're absolutely certain
  return data.field!; // Throws if field is undefined
}

// Better: Validate and throw explicit error
function getRequiredFieldSafe(data: { field?: string }): string {
  if (!data.field) {
    throw new ValidationError('field is required');
  }
  return data.field;
}
```

### ✅ Good Pattern: Generic Types

```typescript
/**
 * Generic API response wrapper
 */
interface APIResponse<T> {
  data: T;
  status: number;
  cached: boolean;
  latency: number;
}

// Usage
async function fetchMEP(id: number): Promise<APIResponse<MEP>> {
  const startTime = Date.now();
  const mep = await getMEP(id);
  
  return {
    data: mep,
    status: 200,
    cached: false,
    latency: Date.now() - startTime,
  };
}

/**
 * Generic cache interface
 */
interface Cache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
}
```

## Anti-Patterns

### ❌ Bad: Using `any`
```typescript
// NEVER - loses all type safety!
function bad(data: any): any {
  return data.something.nested.value; // No type checking!
}

// GOOD - use unknown and type guards
function good(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String(data.value);
  }
  throw new Error('Invalid data structure');
}
```

### ❌ Bad: Implicit Return Types
```typescript
// NEVER - return type unclear!
function bad(id: number) {
  return getMEP(id); // What type is returned?
}

// GOOD - explicit return type
function good(id: number): Promise<MEP> {
  return getMEP(id);
}
```

### ❌ Bad: Not Handling Nulls
```typescript
// NEVER - may crash!
function bad(mep: MEP): string {
  return mep.email.toLowerCase(); // email is optional!
}

// GOOD - handle nullable
function good(mep: MEP): string | null {
  return mep.email?.toLowerCase() ?? null;
}
```

## Type Guards

```typescript
/**
 * Type guard for MEP
 */
function isMEP(value: unknown): value is MEP {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'fullName' in value &&
    typeof value.fullName === 'string'
  );
}

// Usage
function processMEP(data: unknown): void {
  if (isMEP(data)) {
    // TypeScript knows data is MEP here
    console.log(data.fullName);
  }
}
```

## Mapped Types

```typescript
/**
 * Make all properties of T nullable
 */
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type NullableMEP = Nullable<MEP>;
// Result: { id: number | null; fullName: string | null; ... }

/**
 * Make specific properties optional
 */
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type MEPWithOptionalEmail = PartialBy<MEP, 'email' | 'phone'>;
```

## Best Practices

1. **Explicit > Implicit**: Always be explicit with types
2. **Narrow Types**: Start with narrow types, widen if needed
3. **Use `const` Assertions**: For literal types (`as const`)
4. **Avoid Type Assertions**: Use type guards instead of `as`
5. **Document Complex Types**: Add JSDoc for complex types
6. **Use Branded Types**: For IDs and sensitive values
7. **Leverage Utility Types**: Don't reinvent Pick, Omit, etc.
8. **Test Type Safety**: Use TypeScript compiler in tests

## ISMS Compliance

- **SC-002**: Type safety prevents runtime errors
- **SC-001**: Strong typing improves code quality

Reference: [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
