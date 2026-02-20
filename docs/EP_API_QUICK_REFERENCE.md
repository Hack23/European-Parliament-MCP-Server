# European Parliament API - Quick Reference

**Last Updated:** February 18, 2026  
**API Version:** v2  
**Base URL:** `https://data.europarl.europa.eu/api/v2`

---

## 🚀 Quick Start

### Basic Request

```bash
curl -H "Accept: application/ld+json" \
     -H "User-Agent: European-Parliament-MCP-Server/1.0" \
     "https://data.europarl.europa.eu/api/v2/meps/show-current?limit=10"
```

### Response Structure

All responses use JSON-LD format:

```json
{
  "data": [...],           // Array of results
  "@context": [...]        // JSON-LD context
}
```

---

## 📚 Endpoint Reference

### MEPs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/meps` | GET | All MEPs (historical) |
| `/meps/show-current` | GET | Current MEPs only |
| `/meps/{id}` | GET | Specific MEP details |
| `/meps/show-incoming` | GET | Newly elected |
| `/meps/show-outgoing` | GET | Departing MEPs |
| `/meps/show-homonyms` | GET | MEPs with same names |

**Parameters:** `offset`, `limit`

### Committees (Corporate Bodies)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/corporate-bodies` | GET | All EP bodies |
| `/corporate-bodies/show-current` | GET | Current bodies |
| `/corporate-bodies/{id}` | GET | Specific body details |

**Parameters:** `offset`, `limit`

### Meetings (Plenary Sessions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/meetings` | GET | All meetings |
| `/meetings/{id}` | GET | Specific meeting |
| `/meetings/{id}/activities` | GET | Meeting activities |
| `/meetings/{id}/decisions` | GET | Meeting decisions |
| `/meetings/{id}/vote-results` | GET | Voting results |

**Parameters:** `offset`, `limit`

### Documents

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/documents` | GET | All documents |
| `/documents/{id}` | GET | Specific document |
| `/plenary-documents` | GET | Plenary documents |
| `/committee-documents` | GET | Committee documents |
| `/adopted-texts` | GET | Adopted texts |
| `/parliamentary-questions` | GET | All questions |
| `/parliamentary-questions/{id}` | GET | Specific question |

**Parameters:** `offset`, `limit`

### Procedures

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/procedures` | GET | All procedures |
| `/procedures/{id}` | GET | Specific procedure |
| `/procedures/{id}/events` | GET | Procedure events |

**Parameters:** `offset`, `limit`

### Speeches

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/speeches` | GET | All speeches |
| `/speeches/{id}` | GET | Specific speech |

**Parameters:** `offset`, `limit`

---

## 🔑 Common Patterns

### Pagination

All endpoints support:
- `offset` - Starting index (default: 0)
- `limit` - Results per page (default: 10)

```bash
?offset=0&limit=50
```

### Filtering

Some endpoints support filters (check OpenAPI spec):

```bash
?activity_type=PLENARY_SITTING
?country=BE
```

---

## 💾 Data Structures

### MEP

```typescript
{
  id: "person/1294",                          // URI format
  type: "Person",
  identifier: "1294",
  label: "Elio DI RUPO",
  familyName: "Di Rupo",
  givenName: "Elio",
  hasEmail: "mailto:elio@europarl.europa.eu", // mailto: URI
  citizenship: "http://.../country/BEL",      // Authority URI
  "api:country-of-representation": "BE",      // ISO code
  "api:political-group": "S&D",               // Abbreviation
  img: "https://.../mepphoto/1294.jpg",
  hasMembership: [...]                        // Array of memberships
}
```

### Committee

```typescript
{
  id: "org/1",                                // URI format
  type: "Organization",
  identifier: "1",
  label: "ECON",
  prefLabel: {                                // Multilingual
    "en": "Committee on Economic Affairs",
    "fr": "Commission économique",
    "de": "Ausschuß für Wirtschaft"
  },
  classification: "def/ep-entities/COMMITTEE_...",
  temporal: {                                 // Validity period
    type: "PeriodOfTime",
    startDate: "1989-07-26",
    endDate: "1992-01-14"
  }
}
```

### Document

```typescript
{
  id: "eli/dl/doc/A-10-0034",                // ELI format
  type: "Work",
  work_type: "def/ep-document-types/REPORT",
  document_date: "2024-01-15",
  title_dcterms: {                           // Multilingual
    "en": "Report title",
    "fr": "Titre du rapport"
  },
  is_realized_by: [                          // Language versions
    {
      id: "eli/dl/doc/A-10-0034/en",
      type: "Expression",
      language: "http://.../language/ENG",
      is_embodied_by: [                      // File formats
        {
          id: "eli/dl/doc/A-10-0034/en/pdf",
          type: "Manifestation",
          format: "http://.../file-type/PDF",
          is_exemplified_by: "distribution/.../doc.pdf",
          byteSize: "12345"
        }
      ]
    }
  ]
}
```

### Meeting

```typescript
{
  id: "eli/dl/event/MTG-PL-2014-01-13",
  type: "Activity",
  activity_id: "MTG-PL-2014-01-13",
  "eli-dl:activity_date": {                  // DateTime object
    "@value": "2014-01-13T00:00:00+01:00",
    "type": "xsd:dateTime"
  },
  activity_label: {                          // Multilingual
    "en": "Monday, 13 January 2014",
    "fr": "Lundi 13 janvier 2014"
  },
  had_activity_type: "def/ep-activities/PLENARY_SITTING",
  parliamentary_term: "org/ep-7",
  hasLocality: "http://.../place/FRA_SXB"
}
```

### Vote Result

```typescript
{
  id: "eli/dl/event/MTG-PL-2014-01-16-VOT-ITM-...",
  type: "Activity",
  activity_date: "2014-01-16",
  activity_label: {                          // Multilingual
    "en": "Budget vote",
    "fr": "Vote sur le budget"
  },
  had_activity_type: "def/ep-activities/PLENARY_VOTE_RESULTS",
  based_on_a_realization_of: [               // Document URIs
    "eli/dl/doc/A-7-2014-0012"
  ],
  executed: [                                // Vote execution
    "eli/dl/event/MTG-PL-...V-59"
  ],
  recorded_in_a_realization_of: [            // Vote records
    "eli/dl/doc/PV-7-2014-..."
  ]
}
```

### Parliamentary Question

```typescript
{
  id: "eli/dl/doc/E-10-2024-001357",
  type: "Work",
  work_type: "def/ep-document-types/QUESTION_WRITTEN",
  document_date: "2024-07-16",
  title_dcterms: {
    "en": "Question title",
    "pt": "Título da pergunta"
  },
  creator: ["person/257083"],
  workHadParticipation: [
    {
      type: "Participation",
      had_participant_person: ["person/257083"],
      participation_role: "def/ep-roles/AUTHOR"
    },
    {
      type: "Participation",
      had_participant_organization: ["org/CS"],
      participation_role: "def/ep-roles/ADDRESSEE"
    }
  ],
  inverse_answers_to: [                      // Answer if exists
    {
      id: "eli/dl/doc/E-10-2024-001357-ASW",
      type: "Work",
      work_type: "def/ep-document-types/QUESTION_WRITTEN_ANSWER"
    }
  ]
}
```

---

## 🏷️ Common URIs

### Classifications

| Type | URI |
|------|-----|
| Standing Committee | `def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING` |
| Subcommittee | `def/ep-entities/COMMITTEE_PARLIAMENTARY_SUB` |
| Delegation | `def/ep-entities/DELEGATION_PARLIAMENTARY` |
| Political Group | `def/ep-entities/EU_POLITICAL_GROUP` |
| National Party | `def/ep-entities/NATIONAL_POLITICAL_GROUP` |

### Roles

| Role | URI |
|------|-----|
| Member | `def/ep-roles/MEMBER` |
| Substitute | `def/ep-roles/MEMBER_SUBSTITUTE` |
| MEP Mandate | `def/ep-roles/MEMBER_PARLIAMENT` |
| Author | `def/ep-roles/AUTHOR` |
| Addressee | `def/ep-roles/ADDRESSEE` |

### Activity Types

| Activity | URI |
|----------|-----|
| Plenary Sitting | `def/ep-activities/PLENARY_SITTING` |
| Vote Results | `def/ep-activities/PLENARY_VOTE_RESULTS` |
| Committee Meeting | `def/ep-activities/COMMITTEE_MEETING` |
| Speech | `def/ep-activities/PROCEEDING_ACTIVITY` |

### Document Types

| Document | URI |
|----------|-----|
| Report | `def/ep-document-types/REPORT` |
| Resolution | `def/ep-document-types/RESOLUTION` |
| Amendment | `def/ep-document-types/AMENDMENT_LIST` |
| Written Question | `def/ep-document-types/QUESTION_WRITTEN` |
| Question Answer | `def/ep-document-types/QUESTION_WRITTEN_ANSWER` |
| Adopted Text | `def/ep-document-types/ADOPTED_TEXT` |

---

## 🌍 Language Codes (24 EU Languages)

| Code | Language | Code | Language |
|------|----------|------|----------|
| `bg` | Bulgarian | `mt` | Maltese |
| `cs` | Czech | `nl` | Dutch |
| `da` | Danish | `pl` | Polish |
| `de` | German | `pt` | Portuguese |
| `el` | Greek | `ro` | Romanian |
| `en` | English | `sk` | Slovak |
| `es` | Spanish | `sl` | Slovenian |
| `et` | Estonian | `sv` | Swedish |
| `fi` | Finnish | `hr` | Croatian |
| `fr` | French | `ga` | Irish |
| `hu` | Hungarian | `it` | Italian |
| `lt` | Lithuanian | `lv` | Latvian |

---

## ⚠️ Rate Limits

- **Limit:** 500 requests per 5 minutes per endpoint
- **HTTP Status:** 429 (Too Many Requests)
- **Header:** `Retry-After` (seconds to wait)

### Rate Limit Strategy

```typescript
async function fetchWithRateLimit(url: string) {
  const response = await fetch(url);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return fetchWithRateLimit(url); // Retry
  }
  
  return response;
}
```

---

## 🔍 Common Tasks

### Get Current Belgian MEPs

```bash
curl -H "Accept: application/ld+json" \
  "https://data.europarl.europa.eu/api/v2/meps/show-current" \
  | jq '.data[] | select(."api:country-of-representation" == "BE")'
```

### Get ECON Committee Details

```bash
curl -H "Accept: application/ld+json" \
  "https://data.europarl.europa.eu/api/v2/corporate-bodies/ECON"
```

### Get Recent Plenary Votes

```bash
curl -H "Accept: application/ld+json" \
  "https://data.europarl.europa.eu/api/v2/meetings/MTG-PL-2024-01-15/vote-results?limit=10"
```

### Get Parliamentary Question with Answer

```bash
curl -H "Accept: application/ld+json" \
  "https://data.europarl.europa.eu/api/v2/parliamentary-questions/E-10-2024-001357"
```

### Download Document PDF

```bash
# 1. Get document
curl -H "Accept: application/ld+json" \
  "https://data.europarl.europa.eu/api/v2/documents/A-10-0034" \
  > doc.json

# 2. Extract PDF URL
PDF_PATH=$(jq -r '.data[0].is_realized_by[0].is_embodied_by[] | select(.format | contains("PDF")).is_exemplified_by' doc.json)

# 3. Download PDF
curl "https://data.europarl.europa.eu/$PDF_PATH" -o document.pdf
```

---

## 🛠️ Utilities

### Extract Multilingual Text

```typescript
function getTranslation(
  multilingual: Record<string, string>,
  preferredLanguage: string = 'en'
): string {
  return multilingual[preferredLanguage] 
    || multilingual['en'] 
    || Object.values(multilingual)[0] 
    || '';
}
```

### Parse ELI Identifier

```typescript
// ELI format: eli/dl/doc/A-10-0034-0034-AM-001-001
function parseELI(eli: string) {
  const parts = eli.split('/');
  return {
    scheme: parts[0],        // "eli"
    domain: parts[1],        // "dl"
    type: parts[2],          // "doc" or "event"
    identifier: parts.slice(3).join('/')
  };
}
```

### Get Committee Members

```typescript
// Committees don't have member lists - must resolve from MEPs
async function getCommitteeMembers(committeeId: string) {
  const meps = await fetch('/api/v2/meps/show-current').then(r => r.json());
  
  return meps.data.filter(mep =>
    mep.hasMembership?.some(m =>
      m.organization === committeeId &&
      m.membershipClassification === 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING'
    )
  );
}
```

---

## 📖 Resources

- **API Portal:** https://data.europarl.europa.eu/
- **OpenAPI Spec:** https://data.europarl.europa.eu/api/v2/
- **JSON-LD Spec:** https://www.w3.org/TR/json-ld/
- **ELI Ontology:** https://eur-lex.europa.eu/eli-register/about.html
- **FRBR Model:** https://www.ifla.org/publications/node/11240

---

## 📝 Notes

1. **Always use JSON-LD Accept header:** `Accept: application/ld+json`
2. **All text fields are multilingual objects** - not simple strings
3. **IDs are URIs** - relative or full format
4. **Documents use FRBR hierarchy** - Work → Expression → Manifestation
5. **Committee members are NOT in committee data** - fetch from MEPs
6. **Vote tallies are NOT in vote results** - fetch from referenced documents
7. **Question text is in PDF/DOCX files** - not direct text field
8. **Dates can be objects** - check for `@value` and `type` fields

---

**Last Updated:** February 18, 2026  
**Maintained by:** European Parliament Specialist Agent
