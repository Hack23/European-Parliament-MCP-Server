# European Parliament API - Structure Comparison

This document provides visual comparisons between our current implementation and the real API structure.

---

## 1. Response Wrapper Structure

### ❌ Current (WRONG)

```
Plain JSON Array
┌─────────────────┐
│ [               │
│   {MEP1},       │
│   {MEP2},       │
│   {MEP3}        │
│ ]               │
└─────────────────┘
```

### ✅ Real API (JSON-LD)

```
JSON-LD Structure
┌─────────────────────────────────┐
│ {                               │
│   "data": [                     │
│     {MEP1},                     │
│     {MEP2},                     │
│     {MEP3}                      │
│   ],                            │
│   "@context": [                 │
│     {                           │
│       "data": "@graph",         │
│       "@base": "https://..."    │
│     },                          │
│     "https://.../context.jsonld"│
│   ]                             │
│ }                               │
└─────────────────────────────────┘
```

---

## 2. MEP Data Structure

### ❌ Current (WRONG)

```
MEP (Flat Structure)
┌────────────────────────────┐
│ id: "1294"                 │
│ name: "Elio Di Rupo"       │ ← Single field
│ country: "BE"              │ ← Simple string
│ politicalGroup: "S&D"      │ ← Simple string
│ committees: [              │ ← Flat array
│   "ECON",                  │
│   "ENVI"                   │
│ ]                          │
│ email: "email@ep.eu"       │ ← Simple string
│ active: true               │
│ termStart: "2024-07-16"    │
└────────────────────────────┘
```

### ✅ Real API (Complex Structure)

```
MEP (Nested Structure)
┌──────────────────────────────────────────────────┐
│ id: "person/1294"                                │ ← URI format
│ type: "Person"                                   │ ← Type field
│ identifier: "1294"                               │
│ label: "Elio DI RUPO"                           │
│ familyName: "Di Rupo"                           │ ← Split name
│ givenName: "Elio"                               │ ← Split name
│ sortLabel: "DIRUPO"                             │
│ hasEmail: "mailto:elio@ep.eu"                   │ ← mailto: URI
│ citizenship: "http://.../country/BEL"           │ ← Authority URI
│ "api:country-of-representation": "BE"           │
│ "api:political-group": "S&D"                    │
│ img: "https://.../mepphoto/1294.jpg"           │
│ hasMembership: [                                │ ← Complex array
│   {                                             │
│     id: "membership/1294-f-172890"             │
│     type: "Membership"                          │
│     memberDuring: {                             │
│       type: "PeriodOfTime"                      │
│       startDate: "2024-07-19"                   │
│     }                                           │
│     organization: "org/6562"                    │
│     role: "def/ep-roles/MEMBER"                │
│     membershipClassification:                   │
│       "def/ep-entities/COMMITTEE_..."          │
│   },                                            │
│   ...                                           │
│ ]                                               │
└──────────────────────────────────────────────────┘
```

---

## 3. Committee Data Structure

### ❌ Current (WRONG)

```
Committee (Simple Structure)
┌────────────────────────────┐
│ id: "ECON"                 │
│ name: "Economic Affairs"   │ ← Single language
│ abbreviation: "ECON"       │
│ members: [                 │ ← NOT in API
│   "person1",               │
│   "person2"                │
│ ]                          │
│ chair: "person1"           │ ← NOT in API
│ viceChairs: [...]          │ ← NOT in API
└────────────────────────────┘
```

### ✅ Real API (Multilingual)

```
Committee (Multilingual Structure)
┌──────────────────────────────────────────────────┐
│ id: "org/1"                                      │ ← URI format
│ type: "Organization"                             │
│ identifier: "1"                                  │
│ label: "ECON"                                    │
│ prefLabel: {                                     │ ← Multilingual
│   "en": "Committee on Economic Affairs",        │
│   "fr": "Commission économique",                │
│   "de": "Ausschuß für Wirtschaft",             │
│   "es": "Comisión de Asuntos Económicos",      │
│   ... (24 languages)                            │
│ }                                                │
│ altLabel: {                                      │ ← Alternative names
│   "en": "Economic Affairs",                     │
│   "fr": "Economique",                           │
│   ...                                           │
│ }                                                │
│ classification:                                  │
│   "def/ep-entities/COMMITTEE_PARLIAMENTARY_..."│
│ temporal: {                                      │ ← Validity period
│   type: "PeriodOfTime"                          │
│   startDate: "1989-07-26"                       │
│   endDate: "1992-01-14"                         │
│ }                                                │
│                                                  │
│ // NO members field - fetch from MEPs           │
└──────────────────────────────────────────────────┘
```

---

## 4. Document Structure (FRBR Hierarchy)

### ❌ Current (WRONG - Flat)

```
Document (Flat)
┌────────────────────────────┐
│ id: "A-10-0034"           │
│ type: "REPORT"            │
│ title: "Some report"      │ ← Single language
│ date: "2024-01-15"        │
│ pdfUrl: "https://..."     │ ← Direct URL
│ xmlUrl: "https://..."     │
└────────────────────────────┘
```

### ✅ Real API (FRBR - 4 Levels)

```
Work (Abstract Document)
┌──────────────────────────────────────────────────┐
│ id: "eli/dl/doc/A-10-0034"                       │
│ type: "Work"                                     │
│ work_type: "def/ep-document-types/REPORT"       │
│ title_dcterms: {                                 │ ← Multilingual
│   "en": "Report title",                         │
│   "fr": "Titre du rapport",                     │
│   ...                                           │
│ }                                                │
│                                                  │
│ is_realized_by: [         ┌────────────────────┐│
│   ┌────────────────────┐  │ Expression (en)    ││
│   │ Expression (en)    │  │ ┌──────────────────┴┼─┐
│   │ ┌──────────────────┴┐ │ │ language: ".../ENG"│
│   │ │ language: ".../ENG│ │ │ title: {...}       │
│   │ │ title: {...}      │ │ │                    │
│   │ │                   │ │ │ is_embodied_by: [ │
│   │ │ is_embodied_by: [─┼─┼─┤  ┌──────────────┐ │
│   │ │  ┌──────────────┐ │ │ │  │ Manifestation│ │
│   │ │  │ Manifestation│ │ │ │  │ (PDF)        │ │
│   │ │  │ (PDF)        │─┼─┼─┼─▶│ format: PDF  │ │
│   │ │  └──────────────┘ │ │ │  │ byteSize:... │ │
│   │ │  ┌──────────────┐ │ │ │  │              │ │
│   │ │  │ Manifestation│ │ │ │  │ is_exemplifi-│ │
│   │ │  │ (DOCX)       │─┼─┼─┼─▶│ ed_by:       │ │
│   │ │  └──────────────┘ │ │ │  │ "dist/.../   │ │
│   │ │ ]                 │ │ │  │  report.pdf" │ │
│   │ └───────────────────┘ │ │  └──────────────┘ │
│   │                       │ │                    │
│   └───────────────────────┘ └────────────────────┘
│                                                  │
└──────────────────────────────────────────────────┘

FRBR Levels:
1. Work        → Abstract document
2. Expression  → Language version
3. Manifestation → File format (PDF/DOCX/XML)
4. Item        → Actual file path
```

---

## 5. Parliamentary Question Structure

### ❌ Current (WRONG)

```
Question (Simple)
┌────────────────────────────┐
│ id: "E-2024-001357"       │
│ type: "WRITTEN"           │
│ author: "João Oliveira"   │ ← Name string
│ questionText: "..."       │ ← Direct text
│ answerText: "..."         │ ← Direct text
│ status: "ANSWERED"        │ ← Explicit status
└────────────────────────────┘
```

### ✅ Real API (Document-based)

```
Question Work                    Answer Work
┌─────────────────────────┐     ┌─────────────────────────┐
│ id: "eli/dl/doc/        │     │ id: "eli/dl/doc/        │
│   E-10-2024-001357"     │     │   E-10-2024-001357-ASW" │
│ type: "Work"            │     │ type: "Work"            │
│ work_type:              │     │ work_type:              │
│   "QUESTION_WRITTEN"    │     │   "QUESTION_WRITTEN_    │
│                         │     │    ANSWER"              │
│ title_dcterms: {        │     │                         │
│   "en": "Suspension...",│     │ answers_to: ───────────▶│
│   "pt": "Suspensão..."  │     │   "eli/dl/doc/          │
│ }                       │     │    E-10-2024-001357"    │
│                         │     │                         │
│ creator: [              │     │ creator: [              │
│   "person/257083" ──────┼─┐   │   "org/EU_COUNCIL"      │
│ ]                       │ │   │ ]                       │
│                         │ │   │                         │
│ workHadParticipation: [ │ │   │ document_date:          │
│   {                     │ │   │   "2025-02-26"          │
│     type: "Participa... │ │   │                         │
│     had_participant_... │◀┘   │ is_realized_by: [       │
│     participation_role: │     │   {                     │
│       "AUTHOR"          │     │     language: ".../ENG" │
│   },                    │     │     is_embodied_by: [   │
│   {                     │     │       {pdf},            │
│     had_participant_... │     │       {docx}            │
│     participation_role: │     │     ]                   │
│       "ADDRESSEE"       │     │   }                     │
│   }                     │     │ ]                       │
│ ]                       │     │                         │
│                         │     │                         │
│ inverse_answers_to: [───┼─────┤                         │
│   {answer doc}          │     │                         │
│ ]                       │     │                         │
│                         │     │                         │
│ // Text in PDF/DOCX     │     │ // Answer text in       │
│ // files, not direct    │     │ // PDF/DOCX files       │
└─────────────────────────┘     └─────────────────────────┘

Status: Inferred from inverse_answers_to presence
- Has inverse_answers_to → "ANSWERED"
- No inverse_answers_to → "PENDING"
```

---

## 6. Voting Record Structure

### ❌ Current (WRONG)

```
Vote (Direct Tallies)
┌────────────────────────────┐
│ id: "vote-123"            │
│ topic: "Budget vote"      │
│ votesFor: 350             │ ← Direct count
│ votesAgainst: 200         │
│ abstentions: 50           │
│ result: "ADOPTED"         │ ← Direct result
└────────────────────────────┘
```

### ✅ Real API (Activity with References)

```
Vote Activity
┌──────────────────────────────────────────────────┐
│ id: "eli/dl/event/MTG-PL-2014-01-16-VOT-ITM-..." │
│ type: "Activity"                                 │
│ activity_date: "2014-01-16"                      │
│ activity_label: {                                │ ← Multilingual
│   "en": "Budget vote",                          │
│   "fr": "Vote sur le budget",                   │
│   ...                                           │
│ }                                                │
│ had_activity_type:                               │
│   "def/ep-activities/PLENARY_VOTE_RESULTS"      │
│                                                  │
│ based_on_a_realization_of: [  ─┐                │
│   "eli/dl/doc/A-7-2014-0012"  │ │                │
│ ]                              │ │                │
│                                │ └───────────────▶ Document being voted on
│ executed: [                   │                  │
│   "eli/dl/event/MTG-PL-...V-59" │                │
│ ]                              └─────────────────▶ Vote execution event
│                                                   │  (contains tallies)
│ recorded_in_a_realization_of: [─┐                │
│   "eli/dl/doc/PV-7-2014-..."   │ │                │
│ ]                               │ └───────────────▶ Vote record document
│                                  │                  (contains MEP votes)
│ // Vote tallies NOT here        │
│ // Must fetch from referenced   │
│ // documents                    │
└──────────────────────────────────────────────────┘

To get vote results:
1. Fetch vote activity (above)
2. Fetch executed[0] → get tallies
3. Fetch recorded_in[0] → get individual MEP votes
```

---

## 7. Meeting (Plenary Session) Structure

### ❌ Current (WRONG)

```
Meeting (Simple)
┌────────────────────────────┐
│ id: "MTG-2024-01-13"      │
│ date: "2024-01-13"        │ ← Simple date
│ location: "Strasbourg"    │ ← Simple string
│ agendaItems: [...]        │ ← Direct array
│ votingRecords: [...]      │ ← Direct array
└────────────────────────────┘
```

### ✅ Real API (Activity with DateTime)

```
Meeting Activity
┌──────────────────────────────────────────────────┐
│ id: "eli/dl/event/MTG-PL-2014-01-13"            │
│ type: "Activity"                                 │
│ activity_id: "MTG-PL-2014-01-13"                │
│                                                  │
│ "eli-dl:activity_date": {      ← Object!        │
│   "@value": "2014-01-13T00:00:00+01:00",       │
│   "type": "xsd:dateTime"                        │
│ }                                                │
│                                                  │
│ activity_start_date: "2014-01-13T01:00:00+01:00"│
│ activity_end_date: "2014-01-13T23:00:00+01:00"  │
│                                                  │
│ activity_label: {              ← Multilingual    │
│   "en": "Monday, 13 January 2014",              │
│   "fr": "Lundi 13 janvier 2014",                │
│   "de": "Montag, 13. Januar 2014",              │
│   ...                                           │
│ }                                                │
│                                                  │
│ had_activity_type:                               │
│   "def/ep-activities/PLENARY_SITTING"           │
│                                                  │
│ parliamentary_term: "org/ep-7"                   │
│                                                  │
│ hasLocality:                                     │
│   "http://.../authority/place/FRA_SXB"          │
│                                                  │
│ // Agenda/votes NOT included                     │
│ // Fetch from:                                   │
│ //   /meetings/{id}/activities                   │
│ //   /meetings/{id}/vote-results                 │
└──────────────────────────────────────────────────┘
```

---

## 8. Data Flow Comparison

### ❌ Current (Direct Access)

```
Client Request
     │
     ▼
┌─────────┐
│ GET     │
│ /meps   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ [               │
│   {mep},        │ ← Direct array
│   {mep}         │
│ ]               │
└────┬────────────┘
     │
     ▼
Parse & Use
```

### ✅ Real API (JSON-LD Processing)

```
Client Request
     │
     ▼
┌──────────────┐
│ GET          │
│ /meps        │
│ Accept:      │
│ application/ │
│ ld+json      │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ {                    │
│   "data": [...],     │ ← Extract data
│   "@context": [...]  │ ← Process context
│ }                    │
└──────┬───────────────┘
       │
       ├───▶ Parse Context
       │     (resolve URIs, types)
       │
       └───▶ Extract Data
             │
             ▼
      ┌──────────────┐
      │ Transform    │
      │ - URIs       │
      │ - Multilang  │
      │ - Nested     │
      └──────┬───────┘
             │
             ▼
      Simplified Types
      (backward compatible)
```

---

## 9. Committee Membership Resolution

### ❌ Current (Direct Access)

```
GET /committees/ECON
         │
         ▼
┌─────────────────────┐
│ {                   │
│   id: "ECON",       │
│   members: [        │ ← Direct list
│     "MEP1",         │
│     "MEP2"          │
│   ]                 │
│ }                   │
└─────────────────────┘
         │
         ▼
     Use members
```

### ✅ Real API (Indirect Resolution)

```
GET /corporate-bodies/ECON
         │
         ▼
┌─────────────────────┐
│ {                   │
│   id: "org/1",      │
│   label: "ECON",    │
│   // NO members     │ ← Must resolve
│ }                   │
└─────────────────────┘
         │
         │
GET /meps ◀────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ [{                              │
│   id: "person/1",               │
│   hasMembership: [              │
│     {                           │
│       organization: "org/1", ◀──┼─ Match ECON
│       role: "MEMBER",           │
│       memberDuring: {...}       │
│     }                           │
│   ]                             │
│ }]                              │
└─────────────────────────────────┘
         │
         ▼
Filter MEPs by organization: "org/1"
         │
         ▼
┌─────────────────────┐
│ Committee Members:  │
│ - person/1          │
│ - person/2          │
│ - ...               │
└─────────────────────┘
```

---

## 10. Summary of Structural Differences

| Aspect | Current | Real API | Complexity |
|--------|---------|----------|------------|
| Response Format | Plain JSON | JSON-LD | 🔴 High |
| Text Fields | String | Multilingual Object | 🔴 High |
| Identifiers | Simple String | URI | 🟡 Medium |
| Documents | Flat | FRBR (4 levels) | 🔴 High |
| Dates | String | DateTime Object | 🟡 Medium |
| Memberships | Array | Nested Structure | 🔴 High |
| Vote Results | Direct Tallies | Referenced Documents | 🔴 High |
| Committee Members | Direct List | Resolved from MEPs | 🟡 Medium |
| Question Answers | Direct Text | Separate Document | 🔴 High |

---

**Key Takeaway:** The real API is significantly more complex than our current implementation, requiring a complete architectural redesign with proper JSON-LD handling, multilingual support, and indirect data resolution patterns.

