# European Parliament API - Schema Gap Analysis

**Date:** February 18, 2026  
**Analysis Type:** Current Implementation vs. Real API Structure  
**Priority:** **HIGH** - Immediate schema updates required

---

## Executive Summary

Our current Zod schemas and TypeScript types are **significantly different** from the actual European Parliament Open Data API structure. The real API uses:

1. **JSON-LD format** (we assumed plain JSON)
2. **FRBR hierarchy** for documents (Work/Expression/Manifestation)
3. **Multilingual objects** for all text fields
4. **URI-based identifiers** instead of simple strings
5. **Nested membership structures** instead of flat arrays
6. **ELI (European Legislation Identifier)** format for documents
7. **Completely different field names** and structures

### Impact Assessment

| Area | Gap Severity | Impact | Action Required |
|------|--------------|--------|-----------------|
| MEP Data | 🔴 **Critical** | Schemas will fail validation | Complete rewrite |
| Committees | 🔴 **Critical** | Missing multilingual support | Complete rewrite |
| Documents | 🔴 **Critical** | Wrong document hierarchy | Complete rewrite |
| Voting | 🟡 **High** | Missing vote detail references | Major update |
| Questions | 🟡 **High** | Wrong structure for answers | Major update |
| Plenary | 🟡 **High** | Missing activity classifications | Major update |
| Pagination | 🟢 **Low** | Compatible but needs JSON-LD wrapper | Minor update |

---

## 1. MEP Data Structure - Critical Gaps

### Current Implementation (WRONG)

```typescript
export const MEPSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  politicalGroup: z.string(),
  committees: z.array(z.string()),
  email: z.string().email().optional(),
  active: z.boolean(),
  termStart: z.string(),
  termEnd: z.string().optional()
});
```

### Real API Structure

```typescript
// JSON-LD wrapper (MISSING)
interface APIResponse<T> {
  data: T[];
  "@context": ContextDefinition[];
}

// Real MEP structure
interface RealMEP {
  id: string;                    // URI format: "person/1294"
  type: "Person";                // MISSING - required type field
  identifier: string;            // MISSING - numeric ID
  label: string;                 // MISSING - formatted name
  familyName: string;            // name → split to familyName/givenName
  givenName: string;
  sortLabel: string;             // MISSING
  upperFamilyName?: string;      // MISSING
  upperGivenName?: string;       // MISSING
  
  // Contact info (different format)
  hasEmail?: string;             // mailto: URI, not plain email
  hasGender?: string;            // MISSING - authority URI
  hasHonorificPrefix?: string;   // MISSING - authority URI
  citizenship?: string;          // MISSING - authority URI
  placeOfBirth?: string;         // MISSING
  bday?: string;                 // MISSING - date of birth
  img?: string;                  // MISSING - photo URL
  
  // Political affiliation (different from our assumptions)
  "api:country-of-representation"?: string;  // ISO code (BE, FR, etc.)
  "api:political-group"?: string;            // Abbreviation (S&D, PPE, etc.)
  
  // Membership (COMPLETELY DIFFERENT)
  hasMembership?: Membership[];  // Complex nested structure
}

interface Membership {
  id: string;
  type: "Membership";
  identifier: string;
  notation_codictFunctionId?: string;
  notation_codictMandateId?: string;
  represents?: string[];         // Country URIs
  memberDuring: {
    id: string;
    type: "PeriodOfTime";
    startDate: string;           // YYYY-MM-DD
    endDate?: string;
  };
  organization: string;          // Organization URI
  role: string;                  // Role URI
  membershipClassification: string; // Classification URI
  contactPoint?: ContactPoint[];
}
```

### Required Changes

1. **Add JSON-LD wrapper** to all responses
2. **Split name field** into familyName/givenName/label
3. **Change ID format** from simple string to URI
4. **Add type field** (always "Person")
5. **Replace committees array** with hasMembership structure
6. **Replace country string** with citizenship URI
7. **Replace politicalGroup string** with api:political-group
8. **Add missing fields**: img, sortLabel, hasGender, etc.
9. **Transform hasMembership** to extract committees
10. **Handle mailto: URIs** for email

---

## 2. Committee Data - Critical Gaps

### Current Implementation (WRONG)

```typescript
export const CommitteeSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  members: z.array(z.string()),      // WRONG - not in API
  chair: z.string().optional(),      // WRONG - not in API
  viceChairs: z.array(z.string()).optional(),
  meetingSchedule: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional()
});
```

### Real API Structure

```typescript
interface RealCommittee {
  id: string;                    // URI: "org/1"
  type: "Organization";          // MISSING
  identifier: string;            // MISSING
  isVersionOf?: string;          // MISSING - canonical org URI
  source?: string;               // MISSING
  temporal?: {                   // MISSING - validity period
    id: string;
    type: "PeriodOfTime";
    startDate: string;
    endDate?: string;
  };
  label: string;                 // abbreviation → label
  
  // Multilingual names (MISSING)
  prefLabel?: Record<string, string>;  // Full name in all languages
  altLabel?: Record<string, string>;   // Alternative names
  
  classification: string;        // MISSING - body type URI
  notation_codictBodyId?: string; // MISSING
  
  // Members NOT included - must query MEP hasMembership instead
  // Chair NOT included - must query MEP hasMembership with role filter
}
```

### Required Changes

1. **Add multilingual support** (prefLabel, altLabel)
2. **Remove members array** - not provided by API
3. **Remove chair/viceChairs** - not provided directly
4. **Add classification field** (body type)
5. **Add temporal validity** period
6. **Add isVersionOf** for versioned committees
7. **Document** that members must be fetched from MEP hasMembership

---

## 3. Document Structure - Critical Gaps

### Current Implementation (WRONG)

```typescript
export const LegislativeDocumentSchema = z.object({
  id: z.string(),
  type: DocumentTypeSchema,
  title: z.string(),
  date: z.string(),
  authors: z.array(z.string()),
  committee: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'IN_COMMITTEE', 'PLENARY', 'ADOPTED', 'REJECTED']),
  pdfUrl: z.string().url().optional(),
  xmlUrl: z.string().url().optional(),
  summary: z.string().optional()
});
```

### Real API Structure (FRBR Hierarchy)

```typescript
interface RealDocument {
  // Work level (abstract document)
  id: string;                    // ELI URI: "eli/dl/doc/A-10-0034-0034"
  type: "Work";                  // MISSING
  identifier: string;
  work_type: string;             // type → work_type (URI)
  document_date: string;         // date → document_date
  parliamentary_term?: string;   // MISSING - EP term URI
  publisher?: string;            // MISSING - org URI
  creator?: string[];            // authors → creator (URIs)
  
  // Multilingual titles (WRONG FORMAT)
  title_dcterms?: Record<string, string>;  // title → title_dcterms
  
  // FRBR Expression level (language versions)
  is_realized_by?: Expression[];  // MISSING - language versions
  
  // Metadata
  epNumber?: string;             // MISSING
  identifierYear?: string;       // MISSING
  originalLanguage?: string[];   // MISSING - language URIs
  is_about?: string[];           // MISSING - subject URIs
  workHadParticipation?: Participation[];  // MISSING
  
  // Document relationships
  foresees_change_of?: string;   // MISSING - amendment target
  adopts?: string[];             // MISSING
  inverse_answers_to?: Work[];   // MISSING - for Q&A
}

interface Expression {
  id: string;                    // "eli/dl/doc/{id}/en"
  type: "Expression";
  language: string;              // Language authority URI
  title: Record<string, string>;
  title_alternative?: Record<string, string>;
  is_embodied_by: Manifestation[];  // File formats
}

interface Manifestation {
  id: string;                    // "eli/dl/doc/{id}/en/pdf"
  type: "Manifestation";
  is_exemplified_by: string;     // Download path (pdfUrl replacement)
  media_type: string;            // IANA media type URI
  format: string;                // File type authority URI
  issued: string;                // ISO 8601 dateTime
  byteSize: string;              // File size
}
```

### Document Type Mapping

| Our Type | Real API work_type |
|----------|-------------------|
| REPORT | def/ep-document-types/REPORT |
| RESOLUTION | def/ep-document-types/RESOLUTION |
| DECISION | def/ep-document-types/DECISION |
| DIRECTIVE | def/ep-document-types/DIRECTIVE |
| REGULATION | def/ep-document-types/REGULATION |
| OPINION | def/ep-document-types/OPINION |
| AMENDMENT | def/ep-document-types/AMENDMENT_LIST |
| ❌ MISSING | QUESTION_WRITTEN |
| ❌ MISSING | QUESTION_WRITTEN_ANSWER |
| ❌ MISSING | ADOPTED_TEXT |
| ❌ MISSING | MOTION_RESOLUTION |

### Required Changes

1. **Implement FRBR hierarchy** (Work → Expression → Manifestation)
2. **Replace simple title** with multilingual title_dcterms
3. **Replace pdfUrl/xmlUrl** with is_realized_by → is_embodied_by
4. **Add language versions** support
5. **Add document relationships** (adopts, foresees_change_of, etc.)
6. **Remove status field** - not provided by API
7. **Add missing document types**
8. **Change IDs to ELI format**
9. **Add workHadParticipation** for authors/addressees

---

## 4. Voting Records - High Priority Gaps

### Current Implementation

```typescript
export const VotingRecordSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  topic: z.string(),
  date: z.string(),
  votesFor: z.number().int().min(0),
  votesAgainst: z.number().int().min(0),
  abstentions: z.number().int().min(0),
  result: z.enum(['ADOPTED', 'REJECTED']),
  mepVotes: z.record(z.string(), z.enum(['FOR', 'AGAINST', 'ABSTAIN'])).optional()
});
```

### Real API Structure

```typescript
interface RealVoteResult {
  id: string;                    // "eli/dl/event/MTG-PL-2014-01-16-VOT-ITM-344715-3"
  type: "Activity";
  activity_id: string;
  activity_date: string;
  activity_label?: Record<string, string>;  // topic → activity_label (multilingual)
  had_activity_type: string;     // MISSING - always "def/ep-activities/PLENARY_VOTE_RESULTS"
  
  based_on_a_realization_of?: string[];  // MISSING - document URIs
  executed?: string[];           // MISSING - vote execution event URIs
  recorded_in_a_realization_of?: string[];  // MISSING - vote record doc URIs
  notation_dlvId?: string;       // MISSING
  structuredLabel?: Record<string, string>;  // MISSING - XML structured label
  inverse_consists_of?: object[];  // MISSING - parent references
  
  // Vote tallies NOT directly included - must fetch from executed/recorded_in documents
}
```

### Required Changes

1. **Add activity_label** for multilingual topic
2. **Remove direct vote tallies** - fetch from referenced documents
3. **Add had_activity_type** field
4. **Add based_on_a_realization_of** for document references
5. **Add executed** for vote execution events
6. **Add recorded_in_a_realization_of** for vote records
7. **Document** that vote counts require additional API calls
8. **Remove result enum** - not directly provided

---

## 5. Parliamentary Questions - High Priority Gaps

### Current Implementation

```typescript
export const ParliamentaryQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['WRITTEN', 'ORAL']),
  author: z.string(),
  date: z.string(),
  topic: z.string(),
  questionText: z.string(),
  answerText: z.string().optional(),
  answerDate: z.string().optional(),
  status: z.enum(['PENDING', 'ANSWERED'])
});
```

### Real API Structure

```typescript
interface RealParliamentaryQuestion {
  // Question is a Document (Work)
  id: string;                    // "eli/dl/doc/E-10-2024-001357"
  type: "Work";
  work_type: string;             // "def/ep-document-types/QUESTION_WRITTEN"
  identifier: string;
  document_date: string;         // date
  parliamentary_term: string;    // MISSING
  publisher: string;             // MISSING
  
  creator: string[];             // author → creator (person URIs)
  
  // Multilingual fields
  title_dcterms: Record<string, string>;  // topic → title_dcterms
  
  // Question text in PDF/DOCX (not direct text)
  is_realized_by: Expression[];  // questionText → in document files
  
  epNumber?: string;             // MISSING - EP internal number
  identifierYear: string;        // MISSING
  originalLanguage: string[];    // MISSING
  
  // Participation (author/addressee)
  workHadParticipation: Participation[];  // MISSING
  
  // Answer (separate Work document)
  inverse_answers_to?: Work[];   // MISSING - answer document if answered
}

interface Participation {
  id: string;
  type: "Participation";
  had_participant_person?: string[];
  had_participant_organization?: string[];
  participation_role: string;    // "def/ep-roles/AUTHOR" or "def/ep-roles/ADDRESSEE"
}
```

### Required Changes

1. **Remove type field** - inferred from work_type
2. **Change author to creator array** (person URIs)
3. **Remove questionText field** - text is in PDF/DOCX files
4. **Remove answerText field** - text is in separate answer document
5. **Remove status field** - inferred from inverse_answers_to presence
6. **Add workHadParticipation** for author/addressee
7. **Add inverse_answers_to** for answer document
8. **Add FRBR hierarchy** (is_realized_by)
9. **Add multilingual title_dcterms**

---

## 6. Plenary Sessions - High Priority Gaps

### Current Implementation

```typescript
export const PlenarySessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  location: z.string(),
  agendaItems: z.array(z.string()),
  votingRecords: z.array(z.string()).optional(),
  attendanceCount: z.number().int().min(0).optional(),
  documents: z.array(z.string()).optional()
});
```

### Real API Structure

```typescript
interface RealMeeting {
  id: string;                    // "eli/dl/event/MTG-PL-2014-01-13"
  type: "Activity";
  activity_id: string;           // MISSING
  
  // Date fields (different format)
  "eli-dl:activity_date"?: {     // date → eli-dl:activity_date (object)
    "@value": string;            // ISO 8601 dateTime
    type: "xsd:dateTime";
  };
  activity_start_date?: string;  // MISSING - ISO 8601 dateTime
  activity_end_date?: string;    // MISSING - ISO 8601 dateTime
  
  // Multilingual label (not just date)
  activity_label?: Record<string, string>;  // MISSING - "Monday, 13 January 2014"
  
  had_activity_type: string;     // MISSING - "def/ep-activities/PLENARY_SITTING"
  parliamentary_term?: string;   // MISSING - "org/ep-7"
  hasLocality?: string;          // location → hasLocality (authority URI)
  
  // Agenda items/voting records NOT directly included
  // Must query /meetings/{id}/activities or /meetings/{id}/vote-results
}
```

### Required Changes

1. **Change date to activity_date object** with @value and type
2. **Add activity_start_date and activity_end_date**
3. **Add activity_label** multilingual field
4. **Add had_activity_type** classification
5. **Add parliamentary_term** reference
6. **Change location to hasLocality** (authority URI)
7. **Remove agendaItems** - must fetch separately
8. **Remove votingRecords** - must fetch separately
9. **Remove attendanceCount** - not provided
10. **Remove documents** - must fetch separately

---

## 7. Common Patterns Missing

### 1. JSON-LD Context

**MISSING FROM ALL SCHEMAS**

```typescript
interface APIResponse<T> {
  data: T[];
  "@context": Array<
    | { data: "@graph"; "@base": string }
    | string
  >;
}
```

### 2. Multilingual Text

**MISSING FROM ALL TEXT FIELDS**

```typescript
type MultilingualText = Record<string, string>;

// Example:
{
  "en": "Economic and Monetary Affairs",
  "fr": "Economique, monétaire",
  "de": "Wirtschaft, Währung und Industriepolitik"
}
```

### 3. URI References

**WRONG FORMAT IN ALL IDs**

Current: `"123"` or `"ECON"`  
Real: `"person/123"` or `"org/ECON"` or full URIs

### 4. Time Periods

**MISSING FROM ALL DATE RANGES**

```typescript
interface TimePeriod {
  id: string;
  type: "PeriodOfTime";
  startDate: string;  // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}
```

### 5. Pagination

**COMPATIBLE BUT NEEDS WRAPPER**

Our pagination works, but responses need JSON-LD wrapper:

```typescript
interface PaginatedAPIResponse<T> {
  data: T[];
  "@context": Context[];
  meta?: {              // OPTIONAL - not always present
    total: number;
  };
  searchResults?: {     // OPTIONAL - for search endpoints
    hits: Array<{ id: string }>;
  };
}
```

---

## 8. Endpoint Mapping Corrections

### MEPs

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| `/meps` | `/meps` | ✅ Correct |
| `/meps/current` | `/meps/show-current` | ❌ Wrong path |
| `/meps/{id}` | `/meps/{id}` | ✅ Correct |
| ❌ Missing | `/meps/show-incoming` | New endpoint |
| ❌ Missing | `/meps/show-outgoing` | New endpoint |
| ❌ Missing | `/meps/show-homonyms` | New endpoint |

### Committees

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| `/committees` | `/corporate-bodies` | ❌ Wrong path |
| `/committees/{id}` | `/corporate-bodies/{id}` | ❌ Wrong path |
| ❌ Missing | `/corporate-bodies/show-current` | New endpoint |

### Plenary Sessions

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| `/plenary-sessions` | `/meetings` | ❌ Wrong path |
| `/plenary-sessions/{id}` | `/meetings/{id}` | ❌ Wrong path |
| ❌ Missing | `/meetings/{id}/activities` | New endpoint |
| ❌ Missing | `/meetings/{id}/decisions` | New endpoint |
| ❌ Missing | `/meetings/{id}/vote-results` | New endpoint |

### Voting

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| `/votes` | `/meetings/{id}/vote-results` | ❌ Completely different |

### Documents

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| `/documents` | `/documents` | ✅ Correct |
| ❌ Missing | `/plenary-documents` | New endpoint |
| ❌ Missing | `/committee-documents` | New endpoint |
| ❌ Missing | `/adopted-texts` | New endpoint |

### Questions

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| `/questions` | `/parliamentary-questions` | ❌ Wrong path |

### Procedures

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| ❌ Missing | `/procedures` | New endpoint |
| ❌ Missing | `/procedures/{id}` | New endpoint |
| ❌ Missing | `/procedures/{id}/events` | New endpoint |

### Speeches

| Our Endpoint | Real Endpoint | Notes |
|--------------|---------------|-------|
| ❌ Missing | `/speeches` | New endpoint |
| ❌ Missing | `/speeches/{id}` | New endpoint |

---

## 9. Priority Action Items

### Immediate (Week 1) - Critical

1. ✅ **Create base JSON-LD schemas**
   - APIResponse wrapper
   - Context schema
   - URI validation

2. ✅ **Create multilingual text schema**
   - Record<string, string> type
   - Language code validation (24 EU languages)

3. ✅ **Update MEP schemas**
   - Add JSON-LD wrapper
   - Split name fields
   - Add hasMembership structure
   - Handle URI IDs

4. ✅ **Update Committee schemas**
   - Add multilingual prefLabel/altLabel
   - Remove members/chair (document alternative approach)
   - Add classification

5. ✅ **Update Document schemas**
   - Implement FRBR hierarchy
   - Add Expression/Manifestation types
   - Handle ELI identifiers

### Short-term (Week 2) - High Priority

6. ✅ **Update Voting schemas**
   - Add activity structure
   - Document vote tally fetching process
   - Add referenced document URIs

7. ✅ **Update Question schemas**
   - Convert to Work document type
   - Add workHadParticipation
   - Handle answer documents

8. ✅ **Update Meeting/Plenary schemas**
   - Add activity classification
   - Handle dateTime objects
   - Document agenda/vote fetching

9. ✅ **Create Procedure schemas**
   - New schema for legislative procedures
   - Process events structure

10. ✅ **Create Speech schemas**
    - New schema for plenary speeches

### Medium-term (Week 3-4) - Medium Priority

11. ✅ **Add authority URI resolvers**
    - Country codes → URIs
    - Language codes → URIs
    - Classification URIs

12. ✅ **Create transformation utilities**
    - JSON-LD to simplified types
    - Multilingual text extraction
    - URI to ID conversion

13. ✅ **Update client code**
    - Handle new endpoints
    - Transform responses
    - Cache JSON-LD context

14. ✅ **Update documentation**
    - API structure guide
    - Schema migration guide
    - Examples

### Long-term (Month 2) - Lower Priority

15. ✅ **Implement JSON-LD context caching**
16. ✅ **Add ELI identifier utilities**
17. ✅ **Create schema validators for all endpoints**
18. ✅ **Add type guards and narrow functions**
19. ✅ **Performance optimization**
20. ✅ **Comprehensive test coverage**

---

## 10. Breaking Changes Summary

**All existing code using these schemas will break:**

### Type Changes
- `MEP.name` → `MEP.familyName + MEP.givenName`
- `MEP.committees` → Must extract from `MEP.hasMembership`
- `Committee.members` → No longer provided (fetch from MEPs)
- `Document.pdfUrl` → `Document.is_realized_by[0].is_embodied_by.find(pdf).is_exemplified_by`
- `VotingRecord.result` → Must fetch from referenced documents
- `ParliamentaryQuestion.questionText` → In PDF/DOCX files only
- `PlenarySession.date` → `PlenarySession.activity_date["@value"]`

### Structural Changes
- All responses wrapped in JSON-LD structure
- All text fields now multilingual objects
- All IDs now URI format
- Documents now FRBR hierarchy
- Votes now activity events with references

### Endpoint Changes
- `/meps/current` → `/meps/show-current`
- `/committees` → `/corporate-bodies`
- `/plenary-sessions` → `/meetings`
- `/votes` → `/meetings/{id}/vote-results`
- `/questions` → `/parliamentary-questions`

---

## 11. Migration Strategy

### Phase 1: New Schemas (1 week)
- Create new schema files alongside existing ones
- Suffix with `V2` (e.g., `MEPSchemaV2`)
- No breaking changes yet

### Phase 2: Transformation Layer (1 week)
- Create transformation functions
- Convert real API → our current types
- Maintain backward compatibility

### Phase 3: Gradual Migration (2 weeks)
- Update one tool at a time
- Test thoroughly
- Document changes

### Phase 4: Deprecation (1 week)
- Mark old schemas as deprecated
- Update all internal code
- Release major version

### Phase 5: Cleanup (1 week)
- Remove old schemas
- Remove transformation layer
- Final documentation update

---

## 12. Testing Requirements

### New Test Coverage Needed

1. **JSON-LD parsing**
   - Context resolution
   - Graph extraction
   - URI resolution

2. **Multilingual handling**
   - Language fallback
   - Missing translations
   - Language code validation

3. **FRBR hierarchy**
   - Work → Expression navigation
   - Expression → Manifestation navigation
   - File format selection

4. **URI handling**
   - Relative URIs
   - Full URIs
   - Authority URIs

5. **Transformation functions**
   - Real API → simplified types
   - Error handling
   - Missing field handling

---

## 13. Documentation Updates Required

1. **API Structure Guide** - New document explaining JSON-LD
2. **Schema Migration Guide** - Breaking changes and migration path
3. **FRBR Hierarchy Guide** - Working with document structures
4. **Multilingual Guide** - Handling 24 EU languages
5. **URI Reference Guide** - Understanding EP URI system
6. **Examples** - Real API request/response examples
7. **Troubleshooting** - Common issues and solutions

---

## Conclusion

Our current schemas are **fundamentally incompatible** with the real European Parliament API. A complete rewrite is required, but we can maintain backward compatibility through a transformation layer during migration.

**Estimated Effort:** 4-6 weeks for complete migration  
**Risk Level:** High (breaking changes)  
**Mitigation:** Phased rollout with transformation layer

---

**Next Step:** Review analysis with team and approve migration strategy.
