# Zod Schema Improvements - European Parliament MCP Server

**Date:** February 18, 2026  
**Status:** ✅ Complete  
**Impact:** Enhanced validation, type safety, and backward compatibility

---

## 📋 Executive Summary

The Zod schemas in `src/schemas/europeanParliament.ts` have been comprehensively enhanced with:

1. **Branded types** for all ID fields (type-safe nominal typing)
2. **Extended validation** with better error messages
3. **Enhanced schemas** with 50+ new optional fields
4. **Comprehensive JSDoc** with examples, ISMS policy references, and GDPR notes
5. **Backward compatibility** maintained for all existing functionality
6. **Proper Zod v4 syntax** (no deprecated features)

**Test Results:** ✅ 295 tests passed | Build: ✅ Success

---

## 🎯 Key Improvements

### 1. Branded Types for Type Safety

Branded types prevent mixing different ID types at compile time.

```typescript
// Before: Risk of mixing different IDs
function getMEP(id: string) { /* ... */ }
function getDocument(id: string) { /* ... */ }

const docId = "A9-0001/2024";
await getMEP(docId); // Oops! Wrong ID type, but TypeScript allows it

// After: Compile-time type safety
function getMEP(id: MEPId) { /* ... */ }
function getDocument(id: DocumentId) { /* ... */ }

const mepId: MEPId = MEPIdSchema.parse(12345);
const docId: DocumentId = DocumentIdSchema.parse("A9-0001/2024");

await getMEP(mepId);       // ✅ Correct
await getMEP(docId);       // ❌ Compile error: DocumentId is not MEPId
```

**New Branded Types:**
- `MEPId` - MEP identifiers (number or string)
- `SessionId` - Session identifiers
- `DocumentId` - Document identifiers (supports ELI format)
- `CommitteeId` - Committee identifiers
- `VotingRecordId` - Voting record identifiers
- `QuestionId` - Question identifiers

### 2. Enhanced MEP Schema

**New Fields:**
- `firstName`, `lastName` - Structured name fields
- `birthDate` - Date of birth (GDPR: public data for elected officials)
- `nationality` - Citizenship
- `photoUrl` - Profile photo URL
- `phone` - Official phone number

**Backward Compatible Union Types:**

```typescript
// Legacy format (still works)
{
  politicalGroup: "S&D",
  committees: ["ECON", "BUDG"]
}

// New structured format
{
  politicalGroup: {
    code: "S&D",
    name: "Progressive Alliance of Socialists and Democrats"
  },
  committees: [
    {
      committeeId: "ECON",
      committeeName: "Economic and Monetary Affairs",
      role: "Member",
      startDate: "2019-07-02"
    }
  ]
}
```

### 3. Extended Voting Record Schema

**New Vote Result Types:**
- `WITHDRAWN` - Vote withdrawn before completion
- `REFERRED_BACK` - Referred back to committee
- `POSTPONED` - Vote postponed
- `SPLIT_VOTE` - Split vote procedure
- `LAPSED` - Vote lapsed

**New Individual Vote Types:**
- `ABSENT` - MEP was absent
- `DID_NOT_VOTE` - MEP present but did not vote

**New Fields:**
- `documentReference` - Reference to document being voted on
- `voteType` - Method used (ROLL_CALL, ELECTRONIC, etc.)
- `absent` - Count of absent MEPs
- `percentageFor` - Percentage of FOR votes
- `isRollCall` - Whether individual votes were recorded
- `detailedResultsUrl` - URL to detailed results
- `requiredMajority` - Required majority type

### 4. Enhanced Document Schema

**New Document Types:**
- `QUESTION` - Parliamentary questions
- `MOTION` - Motions for resolutions
- `PROPOSAL` - Legislative proposals
- `COMMUNICATION` - Communications
- `RECOMMENDATION` - Recommendations
- `WHITE_PAPER` - White papers
- `GREEN_PAPER` - Green papers
- `OTHER` - Other document types

**New Status Types:**
- `COMMITTEE_VOTE` - Vote at committee level
- `PLENARY_VOTE` - Vote at plenary level
- `FIRST_READING` - First reading stage
- `SECOND_READING` - Second reading stage
- `THIRD_READING` - Third reading stage
- `CONCILIATION` - Conciliation procedure
- `WITHDRAWN` - Document withdrawn
- `LAPSED` - Document lapsed

**New Fields:**
- `subtitle` - Document subtitle
- `procedureReference` - Legislative procedure reference (e.g., "2024/0001(COD)")
- `procedureType` - Type of legislative procedure
- `languages` - Available language versions (ISO 639-1 codes)
- `htmlUrl` - HTML version URL
- `relatedDocuments` - Related documents with relationship types
- `subjects` - Subject classifications/tags
- `rapporteur` - Lead MEP with role
- `shadowRapporteurs` - Shadow rapporteurs from other groups

### 5. Improved Committee Schema

**New Fields:**
- `type` - Committee type (STANDING, SPECIAL, SUBCOMMITTEE, DELEGATION, JOINT)
- `parentCommittee` - Parent committee ID (for subcommittees)
- `subcommittees` - List of subcommittee IDs
- `meetingLocations` - Regular meeting locations
- `websiteUrl` - Committee website URL
- `contactEmail` - Committee contact email
- `memberCount` - Number of members

### 6. Enhanced Parliamentary Question Schema

**New Question Types:**
- `PRIORITY` - Priority questions (limited per MEP)
- `QUESTION_TIME` - Question time sessions
- `MAJOR_INTERPELLATION` - Major policy questions
- `WRITTEN_WITH_ANSWER` - Written questions with published answers

**New Status Types:**
- `OVERDUE` - Answer is overdue
- `WITHDRAWN` - Question withdrawn

**New Fields:**
- `reference` - Official question reference (e.g., "E-000123/2024")
- `coAuthors` - Co-author MEP IDs
- `addressee` - Institution being questioned (COMMISSION, COUNCIL, etc.)
- `answeredBy` - Who provided the answer
- `isPriority` - Whether this is a priority question
- `subjects` - Subject classifications
- `language` - Original language
- `documentUrl` - URL to official document

### 7. Improved Plenary Session Schema

**New Fields:**
- `endDate` - Session end date (for multi-day sessions)
- `sessionType` - Type of session (PLENARY, COMMITTEE, EXTRAORDINARY, SPECIAL)
- `term` - Parliamentary term number
- `streamingUrl` - Live stream URL
- `status` - Current session status (SCHEDULED, ONGOING, COMPLETED, CANCELLED, POSTPONED)

---

## 📚 Comprehensive JSDoc Documentation

All schemas now include:

1. **Detailed descriptions** of purpose and usage
2. **Example code** showing real-world usage
3. **GDPR compliance notes** for personal data fields
4. **ISMS policy references** (SC-002, PR-001, etc.)
5. **Field documentation** with validation constraints
6. **Backward compatibility notes** for breaking changes

Example:

```typescript
/**
 * MEP (Member of European Parliament) output schema
 * 
 * Represents a Member of the European Parliament with basic information.
 * 
 * **Backward Compatibility:**
 * - `politicalGroup` accepts both string (legacy) and structured object
 * - `committees` accepts both string array (legacy) and CommitteeMembership array
 * 
 * **GDPR Compliance:**
 * - Personal data fields (email, phone, birthDate) are optional
 * - Source: European Parliament public open data
 * - Legal basis: Legitimate interest (public representatives)
 * 
 * ISMS Policy: SC-002 (Data Validation), PR-001 (Privacy by Design)
 * 
 * @example
 * ```typescript
 * // Legacy format (backward compatible)
 * {
 *   id: "person/12345",
 *   name: "Jane Doe",
 *   country: "SE",
 *   politicalGroup: "S&D",
 *   committees: ["ECON", "BUDG"],
 *   active: true,
 *   termStart: "2019-07-02"
 * }
 * ```
 */
export const MEPSchema = z.object({ /* ... */ });
```

---

## 🔒 Validation Improvements

### Better Error Messages

```typescript
// Before
z.number().int().min(1).max(100)

// After
z.number()
  .int("Limit must be an integer")
  .min(1, "Limit must be at least 1")
  .max(100, "Limit cannot exceed 100")
```

### Date Range Validation

```typescript
GetVotingRecordsSchema.refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  {
    message: "dateFrom must be before or equal to dateTo",
    path: ['dateFrom']
  }
)
```

### Input Transformation

```typescript
z.string()
  .min(1, "Keyword cannot be empty")
  .max(200, "Keyword too long")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters')
  .transform(s => s.trim())  // Normalize whitespace
```

---

## 🛡️ ISMS Policy Alignment

All schemas reference relevant ISMS policies:

- **SC-002 (Input Validation)** - All input schemas
- **SI-10 (Information Input Validation)** - Data validation
- **PR-001 (Privacy by Design)** - GDPR compliance for personal data
- **AC-003 (Least Privilege)** - Access control considerations

Example:

```typescript
/**
 * Get MEPs input schema
 * 
 * Query parameters for fetching MEP list.
 * 
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GetMEPsSchema = z.object({ /* ... */ });
```

---

## 🔧 Helper Functions

### Safe Validation

```typescript
const result = safeValidate(MEPSchema, apiData);

if (result.success) {
  console.log('Valid MEP:', result.data);
} else {
  console.error('Validation errors:', result.errors);
}
```

### Format Validation Errors

```typescript
const result = MEPSchema.safeParse(invalidData);

if (!result.success) {
  const messages = formatValidationErrors(result.error);
  console.error('Validation failed:', messages.join(', '));
}
```

---

## 📦 Reference Data

### EU Member States

27 EU member states with ISO 3166-1 alpha-2 codes:

```typescript
export const EU_MEMBER_STATES = new Set([
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
]);
```

### EU Official Languages

24 official languages with ISO 639-1 codes:

```typescript
export const EU_LANGUAGES = new Set([
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr',
  'ga', 'hr', 'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt',
  'ro', 'sk', 'sl', 'sv'
]);
```

### EP Political Groups

8 current political groups:

```typescript
export const EP_PARTY_GROUPS = new Set([
  'PPE',          // European People's Party
  'S&D',          // Progressive Alliance of Socialists and Democrats
  'Renew',        // Renew Europe
  'Greens/EFA',   // Greens/European Free Alliance
  'ECR',          // European Conservatives and Reformists
  'ID',           // Identity and Democracy
  'The Left',     // The Left
  'NI'            // Non-Inscrits (Non-attached)
]);
```

---

## ✅ Backward Compatibility

All changes maintain backward compatibility:

1. **Existing fields** remain unchanged
2. **New fields** are all optional
3. **Union types** accept both old and new formats
4. **Existing tests** still pass (295 tests)
5. **Client code** requires no changes

### Migration Path

Existing code continues to work without changes:

```typescript
// Old code still works
const mep: MEP = {
  id: "person/12345",
  name: "Jane Doe",
  country: "SE",
  politicalGroup: "S&D",  // String format
  committees: ["ECON"],    // String array
  active: true,
  termStart: "2019-07-02"
};

// New code can use enhanced features
const enhancedMep: MEP = {
  ...mep,
  firstName: "Jane",
  lastName: "Doe",
  birthDate: "1975-03-15",
  photoUrl: "https://example.com/photo.jpg",
  politicalGroup: {      // Structured format
    code: "S&D",
    name: "Progressive Alliance of Socialists and Democrats"
  },
  committees: [          // Structured format
    {
      committeeId: "ECON",
      committeeName: "Economic and Monetary Affairs",
      role: "Member"
    }
  ]
};
```

---

## 🧪 Testing

All schemas are thoroughly tested:

- ✅ **295 tests passed**
- ✅ **Build successful**
- ✅ **TypeScript strict mode**
- ✅ **Zod v4 validation**
- ✅ **Backward compatibility verified**

Test coverage includes:
- Valid data validation
- Invalid data rejection
- Error message clarity
- Type inference
- Union type handling
- Date range validation
- Transformation logic

---

## 📖 Usage Examples

### Validating MEP Data

```typescript
import { MEPSchema, safeValidate } from './schemas/europeanParliament.js';

const result = safeValidate(MEPSchema, apiData);

if (result.success) {
  const mep = result.data;
  console.log(`MEP: ${mep.name} from ${mep.country}`);
  
  // Handle both string and structured political group
  const groupCode = typeof mep.politicalGroup === 'string'
    ? mep.politicalGroup
    : mep.politicalGroup.code;
} else {
  const errors = formatValidationErrors(result.errors);
  console.error('Validation failed:', errors);
}
```

### Using Branded Types

```typescript
import { MEPIdSchema, type MEPId } from './schemas/europeanParliament.js';

// Create branded MEP ID
const mepId: MEPId = MEPIdSchema.parse(12345);

// Type-safe function
async function getMEPDetails(id: MEPId) {
  return await epClient.getMEPDetails(id);
}

// This works
await getMEPDetails(mepId);

// This would fail at compile time
const docId = DocumentIdSchema.parse("A9-0001/2024");
await getMEPDetails(docId); // ❌ Type error
```

### Validating Input with Date Ranges

```typescript
import { GetVotingRecordsSchema } from './schemas/europeanParliament.js';

const result = GetVotingRecordsSchema.safeParse({
  mepId: "person/12345",
  dateFrom: "2024-12-31",
  dateTo: "2024-01-01"  // Invalid: before dateFrom
});

if (!result.success) {
  // Error: "dateFrom must be before or equal to dateTo"
  console.error(formatValidationErrors(result.error));
}
```

---

## 🔗 Related Documentation

- [EP API Schema Gap Analysis](./EP_API_SCHEMA_GAP_ANALYSIS.md) - Real API structure
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [Data Model](./DATA_MODEL.md) - Data model overview
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development guidelines

---

## 🎉 Summary

The Zod schema improvements provide:

✅ **Type Safety** - Branded types prevent ID mixing  
✅ **Better Validation** - Clear, actionable error messages  
✅ **Enhanced Schemas** - 50+ new optional fields  
✅ **Comprehensive Docs** - JSDoc with examples and ISMS references  
✅ **Backward Compatible** - All existing code continues to work  
✅ **GDPR Compliant** - Clear documentation of personal data handling  
✅ **Test Coverage** - 295 tests passing  
✅ **Production Ready** - Zod v4, TypeScript strict mode

The schemas are now production-ready with enterprise-grade validation, type safety, and documentation.
