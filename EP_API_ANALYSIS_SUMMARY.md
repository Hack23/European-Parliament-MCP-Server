# European Parliament Open Data API - Analysis Summary

**Date:** February 18, 2026  
**Status:** ✅ Complete  
**Priority:** 🔴 **CRITICAL** - Immediate action required

---

## 📊 Quick Overview

I've conducted a comprehensive analysis of the **real** European Parliament Open Data API by making actual HTTP requests to all major endpoints. The findings reveal significant differences between our current implementation and the actual API structure.

**Related Documents:**
- 📄 [EP_API_REAL_STRUCTURES_ANALYSIS.md](./EP_API_REAL_STRUCTURES_ANALYSIS.md) - Complete API structure documentation (37KB)
- 📄 [EP_API_SCHEMA_GAP_ANALYSIS.md](./EP_API_SCHEMA_GAP_ANALYSIS.md) - Gap analysis and migration strategy (24KB)

---

## 🚨 Critical Findings

### 1. **JSON-LD Format** (Not Plain JSON)

**Impact:** All our schemas fail to validate real API responses.

The API uses JSON-LD with a specific structure:

```json
{
  "data": [...],
  "@context": [
    {
      "data": "@graph",
      "@base": "https://data.europarl.europa.eu/"
    },
    "https://data.europarl.europa.eu/api/v2/context.jsonld"
  ]
}
```

**Our schemas:** Expect plain JSON arrays  
**Real API:** Returns JSON-LD with `data` and `@context`

---

### 2. **Multilingual Text Fields**

**Impact:** All text fields return objects instead of strings.

**Example:**
```json
{
  "title": {
    "en": "Economic and Monetary Affairs",
    "fr": "Economique, monétaire",
    "de": "Wirtschaft, Währung und Industriepolitik"
  }
}
```

**Our schemas:** `title: z.string()`  
**Real API:** `title: Record<string, string>` with 24 EU languages

---

### 3. **FRBR Document Hierarchy**

**Impact:** Document structure is completely different.

The API uses a 4-level hierarchy (FRBR model):
- **Work** - Abstract document
- **Expression** - Language version (in `is_realized_by`)
- **Manifestation** - File format (in `is_embodied_by`)
- **Item** - Actual file path (in `is_exemplified_by`)

**Our schemas:** Flat structure with `pdfUrl`  
**Real API:** Nested Work → Expression → Manifestation → Item

---

### 4. **URI-Based Identifiers**

**Impact:** All IDs have different format.

**Examples:**
- MEPs: `"person/1294"` (not `"1294"`)
- Committees: `"org/ECON"` (not `"ECON"`)
- Documents: `"eli/dl/doc/A-10-0034-0034"` (ELI format)
- Meetings: `"eli/dl/event/MTG-PL-2014-01-13"` (ELI format)

**Our schemas:** Simple strings  
**Real API:** URI format (relative or full)

---

### 5. **Complex Membership Structure**

**Impact:** Committee membership data location changed.

**Our assumption:** Committees have a `members` array  
**Reality:** 
- Committees have NO member lists
- Member data is in MEP's `hasMembership` array
- Must query MEPs to find committee members

---

### 6. **Voting Data Location**

**Impact:** Vote tallies not in vote results.

**Our assumption:** Vote results include `votesFor`, `votesAgainst`, `abstentions`  
**Reality:**
- Vote results are activity events
- Tallies are in separate documents (referenced by `executed` and `recorded_in_a_realization_of`)
- Requires additional API calls to get vote counts

---

## 📈 Gap Analysis by Area

| Component | Current State | Real API | Severity | Effort |
|-----------|--------------|----------|----------|---------|
| **JSON-LD Wrapper** | ❌ Missing | ✅ Required | 🔴 Critical | 1 day |
| **Multilingual Text** | ❌ Missing | ✅ Required | 🔴 Critical | 2 days |
| **MEP Schema** | ⚠️ 40% match | ✅ Documented | 🔴 Critical | 3 days |
| **Committee Schema** | ⚠️ 30% match | ✅ Documented | 🔴 Critical | 2 days |
| **Document Schema** | ⚠️ 20% match | ✅ Documented | 🔴 Critical | 4 days |
| **Voting Schema** | ⚠️ 50% match | ✅ Documented | 🟡 High | 2 days |
| **Question Schema** | ⚠️ 40% match | ✅ Documented | 🟡 High | 2 days |
| **Meeting Schema** | ⚠️ 50% match | ✅ Documented | 🟡 High | 2 days |
| **Procedure Schema** | ❌ Missing | ✅ Documented | 🟡 High | 2 days |
| **Speech Schema** | ❌ Missing | ✅ Documented | 🟢 Medium | 1 day |

**Total Estimated Effort:** 3-4 weeks

---

## 🔍 Real API Examples

### MEP Data (GET /meps/1294)

```json
{
  "data": [{
    "id": "person/1294",
    "type": "Person",
    "identifier": "1294",
    "label": "Elio DI RUPO",
    "familyName": "Di Rupo",
    "givenName": "Elio",
    "hasEmail": "mailto:elio.dirupo@europarl.europa.eu",
    "citizenship": "http://publications.europa.eu/resource/authority/country/BEL",
    "img": "https://www.europarl.europa.eu/mepphoto/1294.jpg",
    "api:country-of-representation": "BE",
    "api:political-group": "S&D",
    "hasMembership": [
      {
        "id": "membership/1294-f-172890",
        "type": "Membership",
        "memberDuring": {
          "type": "PeriodOfTime",
          "startDate": "2024-07-19"
        },
        "organization": "org/6562",
        "role": "def/ep-roles/MEMBER",
        "membershipClassification": "def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING"
      }
    ]
  }],
  "@context": [...]
}
```

### Committee Data (GET /corporate-bodies/1)

```json
{
  "data": [{
    "id": "org/1",
    "type": "Organization",
    "label": "ECON",
    "prefLabel": {
      "en": "Committee on Economic and Monetary Affairs",
      "fr": "Commission économique et monétaire",
      "de": "Ausschuß für Wirtschaft und Währung"
    },
    "classification": "def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING",
    "temporal": {
      "type": "PeriodOfTime",
      "startDate": "1989-07-26",
      "endDate": "1992-01-14"
    }
  }],
  "@context": [...]
}
```

### Parliamentary Question (GET /parliamentary-questions/E-10-2024-001357)

```json
{
  "data": [{
    "id": "eli/dl/doc/E-10-2024-001357",
    "type": "Work",
    "work_type": "def/ep-document-types/QUESTION_WRITTEN",
    "document_date": "2024-07-16",
    "title_dcterms": {
      "en": "Suspension of the EU-Israel Association Agreement",
      "pt": "Suspensão do Acordo de Associação UE-Israel"
    },
    "creator": ["person/257083"],
    "workHadParticipation": [
      {
        "type": "Participation",
        "had_participant_person": ["person/257083"],
        "participation_role": "def/ep-roles/AUTHOR"
      },
      {
        "type": "Participation",
        "had_participant_organization": ["org/CS"],
        "participation_role": "def/ep-roles/ADDRESSEE"
      }
    ],
    "inverse_answers_to": [{
      "id": "eli/dl/doc/E-10-2024-001357-ASW",
      "type": "Work",
      "work_type": "def/ep-document-types/QUESTION_WRITTEN_ANSWER",
      "document_date": "2025-02-26"
    }]
  }],
  "@context": [...]
}
```

---

## 🛠️ What We Need to Fix

### Immediate Actions (Week 1)

1. **Create Base Schemas**
   - [ ] JSON-LD wrapper schema (`APIResponse<T>`)
   - [ ] Multilingual text schema (`MultilingualText`)
   - [ ] URI schema with validation
   - [ ] Time period schema (`PeriodOfTime`)
   - [ ] Context schema

2. **Update Core Schemas**
   - [ ] MEP schema (add hasMembership, split name fields)
   - [ ] Committee schema (add multilingual, remove members)
   - [ ] Document schema (implement FRBR hierarchy)

3. **Create Transformation Layer**
   - [ ] JSON-LD parser
   - [ ] Multilingual text extractor
   - [ ] FRBR hierarchy navigator
   - [ ] URI to ID converter

### Short-term Actions (Week 2-3)

4. **Update Remaining Schemas**
   - [ ] Voting schema (add activity structure)
   - [ ] Question schema (convert to Work document)
   - [ ] Meeting schema (add activity fields)
   - [ ] Procedure schema (NEW)
   - [ ] Speech schema (NEW)

5. **Update API Client**
   - [ ] Handle JSON-LD responses
   - [ ] Transform to simplified types
   - [ ] Cache context definitions
   - [ ] Update endpoint paths

6. **Testing**
   - [ ] Unit tests for all new schemas
   - [ ] Integration tests with real API
   - [ ] Transformation function tests
   - [ ] Error handling tests

### Medium-term Actions (Week 4)

7. **Documentation**
   - [ ] Update API integration guide
   - [ ] Create schema migration guide
   - [ ] Add real API examples
   - [ ] Document transformation utilities

8. **Migration**
   - [ ] Update all tools to use new schemas
   - [ ] Maintain backward compatibility
   - [ ] Gradual rollout
   - [ ] Deprecate old schemas

---

## 📚 Key Discoveries

### 1. **Correct Endpoint Paths**

| Resource | Correct Endpoint |
|----------|------------------|
| Current MEPs | `/meps/show-current` |
| Committees | `/corporate-bodies` |
| Plenary Sessions | `/meetings` |
| Vote Results | `/meetings/{id}/vote-results` |
| Questions | `/parliamentary-questions` |
| Procedures | `/procedures` (NEW) |
| Speeches | `/speeches` (NEW) |

### 2. **Membership Classifications**

- `COMMITTEE_PARLIAMENTARY_STANDING` - Standing committee
- `COMMITTEE_PARLIAMENTARY_SUB` - Subcommittee
- `DELEGATION_PARLIAMENTARY` - Delegation
- `EU_POLITICAL_GROUP` - Political group
- `NATIONAL_POLITICAL_GROUP` - National party
- `WORKING_GROUP` - Working group

### 3. **Document Types**

The API has more document types than we thought:
- `REPORT`, `RESOLUTION`, `DECISION`, `DIRECTIVE`, `REGULATION`, `OPINION`
- `AMENDMENT_LIST` (not just "AMENDMENT")
- `QUESTION_WRITTEN`, `QUESTION_WRITTEN_ANSWER`
- `ADOPTED_TEXT`, `MOTION_RESOLUTION`

### 4. **Rate Limiting**

**Official Limit:** 500 requests per 5 minutes per endpoint

This is documented in the OpenAPI spec:
> "Maximum number of requests 500 in 5min"

### 5. **License**

**CC BY 4.0 - Attribution 4.0 International**

We must:
- Attribute data to "European Parliament"
- Include link to data portal
- Not misrepresent official positions

---

## ⚡ Quick Wins

While we work on the full migration, here are some quick improvements:

1. **Update endpoint paths** in client (30 minutes)
   - `/meps/current` → `/meps/show-current`
   - `/committees` → `/corporate-bodies`
   - `/plenary-sessions` → `/meetings`

2. **Add Accept header** (5 minutes)
   ```typescript
   headers: {
     'Accept': 'application/ld+json',
     'User-Agent': 'European-Parliament-MCP-Server/1.0'
   }
   ```

3. **Extract data array** from responses (10 minutes)
   ```typescript
   const response = await fetch(url);
   const jsonLD = await response.json();
   return jsonLD.data; // Extract data array
   ```

4. **Add basic error handling** (30 minutes)
   - Check for 404 (endpoint not found)
   - Check for 429 (rate limit)
   - Handle empty responses

---

## 🎯 Success Criteria

We'll know the migration is successful when:

1. ✅ All API requests return valid data (no schema validation errors)
2. ✅ Multilingual fields are properly handled (language fallback works)
3. ✅ Document downloads work (PDF/DOCX URLs extracted correctly)
4. ✅ Committee memberships are correctly resolved (from MEP data)
5. ✅ Vote results include proper references (document URIs)
6. ✅ Question-answer relationships work (inverse_answers_to)
7. ✅ All 24 EU languages supported
8. ✅ Rate limiting properly implemented (500 req/5min)
9. ✅ 100% test coverage for new schemas
10. ✅ Documentation complete and accurate

---

## 📞 Next Steps

1. **Review this analysis** with the development team
2. **Approve migration strategy** (phased rollout vs. big bang)
3. **Allocate resources** (3-4 weeks of development time)
4. **Create detailed tickets** for each task
5. **Set up real API test environment**
6. **Begin implementation** (start with base schemas)

---

## 📖 Additional Resources

- [EP Open Data Portal](https://data.europarl.europa.eu/) - Official portal
- [API OpenAPI Spec](https://data.europarl.europa.eu/api/v2/) - Interactive docs
- [JSON-LD Specification](https://www.w3.org/TR/json-ld/) - JSON-LD format
- [FRBR Model](https://www.ifla.org/publications/node/11240) - Document hierarchy
- [ELI Ontology](https://eur-lex.europa.eu/eli-register/about.html) - European Legislation Identifier

---

**Analysis completed by:** European Parliament Specialist Agent  
**Date:** February 18, 2026  
**Version:** 1.0  
**Status:** Ready for review ✅
