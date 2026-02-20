# European Parliament Open Data API - Real Data Structures Analysis

**Date:** February 18, 2026  
**API Version:** v2  
**Base URL:** `https://data.europarl.europa.eu/api/v2`

## Executive Summary

This document provides a comprehensive analysis of the **actual** data structures returned by the European Parliament Open Data API based on real API requests. The API uses **JSON-LD format** with a context-driven schema system.

### Key Findings

1. **JSON-LD Format**: All responses use JSON-LD with `@context` and `@graph` (as `data`)
2. **Rate Limiting**: 500 requests per 5 minutes (per endpoint)
3. **License**: CC BY 4.0 - Attribution 4.0 International
4. **Base Structure**: All responses follow: `{ data: [...], @context: [...] }`
5. **ID Format**: URIs using EP's base URI (e.g., `person/1294`, `eli/dl/doc/...`)

---

## 1. MEPs Endpoint

### Available Endpoints
- `GET /meps` - All MEPs (historical)
- `GET /meps/show-current` - Current MEPs only
- `GET /meps/{mep-id}` - Specific MEP details
- `GET /meps/show-incoming` - Newly elected MEPs
- `GET /meps/show-outgoing` - MEPs who left
- `GET /meps/show-homonyms` - MEPs with same names

### Real Response Structure

#### List Response (GET /meps?limit=1)
```json
{
  "data": [
    {
      "id": "person/1",
      "type": "Person",
      "identifier": "1",
      "label": "Georg JARZEMBOWSKI",
      "familyName": "Jarzembowski",
      "givenName": "Georg",
      "sortLabel": "JARZEMBOWSKI"
    }
  ],
  "@context": [
    {
      "data": "@graph",
      "@base": "https://data.europarl.europa.eu/"
    },
    "https://data.europarl.europa.eu/api/v2/context.jsonld"
  ]
}
```

#### Current MEPs Response (GET /meps/show-current?limit=2)
```json
{
  "data": [
    {
      "id": "person/1294",
      "type": "Person",
      "identifier": "1294",
      "label": "Elio DI RUPO",
      "familyName": "Di Rupo",
      "givenName": "Elio",
      "sortLabel": "DIRUPO",
      "api:country-of-representation": "BE",
      "api:political-group": "S&D"
    }
  ],
  "@context": [...]
}
```

#### Detailed MEP Response (GET /meps/{mep-id})
```json
{
  "data": [
    {
      "id": "person/1294",
      "type": "Person",
      "identifier": "1294",
      "label": "Elio DI RUPO",
      "notation_codictPersonId": "1294",
      "hasEmail": "mailto:elio.dirupo@europarl.europa.eu",
      "hasGender": "http://publications.europa.eu/resource/authority/human-sex/MALE",
      "hasHonorificPrefix": "http://publications.europa.eu/resource/authority/honorific/MR",
      "hasMembership": [
        {
          "id": "membership/1294-f-172890",
          "type": "Membership",
          "identifier": "1294-f-172890",
          "notation_codictFunctionId": "172890",
          "memberDuring": {
            "id": "time-period/20240719",
            "type": "PeriodOfTime",
            "startDate": "2024-07-19"
          },
          "organization": "org/6562",
          "role": "def/ep-roles/MEMBER",
          "membershipClassification": "def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING"
        },
        {
          "id": "membership/1294-m-16959",
          "type": "Membership",
          "represents": [
            "http://publications.europa.eu/resource/authority/country/BEL"
          ],
          "identifier": "1294-m-16959",
          "notation_codictMandateId": "16959",
          "contactPoint": [
            {
              "id": "contact-point/1294-m-16959-13G115",
              "type": "ContactPoint",
              "officeAddress": "13G115",
              "hasTelephone": {
                "id": "tel/003222845453",
                "type": "Voice",
                "hasValue": "tel:+3222845453"
              },
              "hasSite": "http://publications.europa.eu/resource/authority/site/ASP"
            }
          ],
          "memberDuring": {
            "id": "time-period/20240716",
            "type": "PeriodOfTime",
            "startDate": "2024-07-16"
          },
          "organization": "org/ep-10",
          "role": "def/ep-roles/MEMBER_PARLIAMENT"
        }
      ],
      "citizenship": "http://publications.europa.eu/resource/authority/country/BEL",
      "placeOfBirth": "Morlanwelz",
      "familyName": "Di Rupo",
      "givenName": "Elio",
      "img": "https://www.europarl.europa.eu/mepphoto/1294.jpg",
      "sortLabel": "DIRUPO",
      "upperFamilyName": "DI RUPO",
      "upperGivenName": "ELIO"
    }
  ],
  "@context": [...]
}
```

### MEP Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Person ID (e.g., `person/1294`) |
| `type` | String | ✅ | Always `"Person"` |
| `identifier` | String | ✅ | Numeric ID as string |
| `label` | String | ✅ | Full name (uppercase surname) |
| `familyName` | String | ✅ | Surname |
| `givenName` | String | ✅ | First name |
| `sortLabel` | String | ✅ | Uppercase surname for sorting |
| `upperFamilyName` | String | ❌ | Uppercase surname |
| `upperGivenName` | String | ❌ | Uppercase first name |
| `notation_codictPersonId` | String | ❌ | Internal person ID |
| `hasEmail` | String | ❌ | mailto: URI |
| `hasGender` | URI | ❌ | Authority reference |
| `hasHonorificPrefix` | URI | ❌ | Mr/Ms/etc authority reference |
| `citizenship` | URI | ❌ | Country authority reference |
| `placeOfBirth` | String | ❌ | Birth city |
| `bday` | Date | ❌ | Date of birth (xsd:date) |
| `deathDate` | Date | ❌ | Date of death if applicable |
| `img` | URL | ❌ | Photo URL |
| `api:country-of-representation` | String | ❌ | ISO country code (BE, FR, etc) |
| `api:political-group` | String | ❌ | Political group abbreviation |
| `hasMembership` | Array | ❌ | Array of Membership objects |

### Membership Object Structure

```typescript
interface Membership {
  id: string;                    // URI: "membership/{mep-id}-{type}-{func-id}"
  type: "Membership";
  identifier: string;
  notation_codictFunctionId?: string;
  notation_codictMandateId?: string;
  represents?: string[];         // Country URIs
  memberDuring: {
    id: string;
    type: "PeriodOfTime";
    startDate: string;           // ISO 8601: YYYY-MM-DD
    endDate?: string;            // Optional end date
  };
  organization: string;          // Organization ID (e.g., "org/6562")
  role: string;                  // Role URI (e.g., "def/ep-roles/MEMBER")
  membershipClassification: string; // Classification URI
  contactPoint?: ContactPoint[];
}

interface ContactPoint {
  id: string;
  type: "ContactPoint";
  officeAddress: string;
  hasTelephone?: {
    id: string;
    type: "Voice";
    hasValue: string;            // tel: URI
  };
  hasSite?: string;              // Site authority URI
}
```

### Membership Classifications
- `def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING` - Standing committee
- `def/ep-entities/COMMITTEE_PARLIAMENTARY_SUB` - Subcommittee
- `def/ep-entities/DELEGATION_PARLIAMENTARY` - Parliamentary delegation
- `def/ep-entities/DELEGATION_PARLIAMENTARY_ASSEMBLY` - Parliamentary assembly delegation
- `def/ep-entities/EU_POLITICAL_GROUP` - European political group
- `def/ep-entities/NATIONAL_POLITICAL_GROUP` - National party
- `def/ep-entities/EU_INSTITUTION` - European Parliament itself
- `def/ep-entities/WORKING_GROUP` - Working group

### Roles
- `def/ep-roles/MEMBER` - Regular member
- `def/ep-roles/MEMBER_SUBSTITUTE` - Substitute member
- `def/ep-roles/MEMBER_PARLIAMENT` - MEP mandate
- `def/ep-roles/CHAIR` - Committee chair
- `def/ep-roles/VICE_CHAIR` - Committee vice-chair

---

## 2. Corporate Bodies Endpoint (Committees)

### Available Endpoints
- `GET /corporate-bodies` - All EP bodies
- `GET /corporate-bodies/show-current` - Current bodies
- `GET /corporate-bodies/{body-id}` - Specific body details

### Real Response Structure

#### List Response
```json
{
  "data": [
    {
      "id": "org/1",
      "type": "Organization",
      "identifier": "1",
      "label": "ECON",
      "classification": "def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING"
    }
  ],
  "@context": [...]
}
```

#### Detailed Committee Response
```json
{
  "data": [
    {
      "id": "org/1",
      "type": "Organization",
      "identifier": "1",
      "isVersionOf": "org/ECON",
      "source": "EU_PARLIAMENT",
      "temporal": {
        "id": "time-period/19890726-19920114",
        "type": "PeriodOfTime",
        "endDate": "1992-01-14",
        "startDate": "1989-07-26"
      },
      "label": "ECON",
      "altLabel": {
        "nl": "Commissie economische en monetaire zaken en indust",
        "el": "Οικονομικής, Νομισματικής, Βιομηχανικής Πολιτικής",
        "en": "Economic and Monetary Affairs",
        "fr": "Economique, monétaire",
        "de": "Wirtschaft, Währung und Industriepolitik"
      },
      "notation_providerTemporalBodyId": "1",
      "notation_codictBodyId": "1",
      "prefLabel": {
        "en": "Committee on Economic and Monetary Affairs and Industrial Policy",
        "fr": "Commission économique, monétaire et de la politique industrielle",
        "de": "Ausschuß für Wirtschaft, Währung und Industriepolitik"
      },
      "classification": "def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING"
    }
  ],
  "@context": [...]
}
```

### Corporate Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Organization ID (e.g., `org/1`) |
| `type` | String | ✅ | Always `"Organization"` |
| `identifier` | String | ✅ | Numeric ID |
| `label` | String | ✅ | Abbreviated name (e.g., "ECON") |
| `classification` | URI | ✅ | Body type classification |
| `isVersionOf` | URI | ❌ | Reference to canonical org |
| `source` | String | ❌ | Data source (e.g., "EU_PARLIAMENT") |
| `temporal` | Object | ❌ | Time period validity |
| `prefLabel` | Object | ❌ | Multilingual full names |
| `altLabel` | Object | ❌ | Multilingual alternative names |
| `notation_codictBodyId` | String | ❌ | Internal body ID |
| `hasSubOrganization` | Array | ❌ | Sub-organizations URIs |

### Committee Classifications
- `COMMITTEE_PARLIAMENTARY_STANDING` - Permanent committee
- `COMMITTEE_PARLIAMENTARY_SPECIAL` - Special/temporary committee
- `COMMITTEE_PARLIAMENTARY_SUB` - Subcommittee
- `DELEGATION_PARLIAMENTARY` - Delegation
- `EU_POLITICAL_GROUP` - Political group

---

## 3. Meetings Endpoint (Plenary Sessions)

### Available Endpoints
- `GET /meetings` - All meetings
- `GET /meetings/{event-id}` - Specific meeting
- `GET /meetings/{sitting-id}/activities` - Meeting activities
- `GET /meetings/{sitting-id}/decisions` - Meeting decisions
- `GET /meetings/{sitting-id}/foreseen-activities` - Planned activities
- `GET /meetings/{sitting-id}/vote-results` - Voting results

### Real Response Structure

#### Meeting List
```json
{
  "data": [
    {
      "id": "eli/dl/event/MTG-PL-2014-01-13",
      "type": "Activity",
      "eli-dl:activity_date": {
        "@value": "2014-01-13T00:00:00+01:00",
        "type": "xsd:dateTime"
      },
      "activity_end_date": "2014-01-13T23:00:00+01:00",
      "activity_id": "MTG-PL-2014-01-13",
      "activity_label": {
        "es": "Lunes 13 de enero de 2014",
        "en": "Monday, 13 January 2014",
        "fr": "Lundi 13 janvier 2014",
        "de": "Montag, 13. Januar 2014"
      },
      "activity_start_date": "2014-01-13T01:00:00+01:00",
      "had_activity_type": "def/ep-activities/PLENARY_SITTING",
      "parliamentary_term": "org/ep-7",
      "hasLocality": "http://publications.europa.eu/resource/authority/place/FRA_SXB"
    }
  ],
  "@context": [...]
}
```

### Meeting Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Event ID (e.g., `eli/dl/event/MTG-PL-2014-01-13`) |
| `type` | String | ✅ | Always `"Activity"` |
| `activity_id` | String | ✅ | Meeting ID |
| `activity_date` | DateTime | ❌ | Meeting date (xsd:dateTime) |
| `activity_start_date` | DateTime | ❌ | Start timestamp |
| `activity_end_date` | DateTime | ❌ | End timestamp |
| `activity_label` | Object | ❌ | Multilingual labels |
| `had_activity_type` | URI | ✅ | Activity type |
| `parliamentary_term` | URI | ❌ | EP term (e.g., `org/ep-7`) |
| `hasLocality` | URI | ❌ | Location authority reference |

### Activity Types
- `def/ep-activities/PLENARY_SITTING` - Plenary session
- `def/ep-activities/COMMITTEE_MEETING` - Committee meeting
- `def/ep-activities/DELEGATION_MEETING` - Delegation meeting

---

## 4. Vote Results Endpoint

### Available Endpoints
- `GET /meetings/{sitting-id}/vote-results` - All votes in a sitting

### Real Response Structure

```json
{
  "data": [
    {
      "id": "eli/dl/event/MTG-PL-2014-01-16-VOT-ITM-344715-3",
      "type": "Activity",
      "activity_date": "2014-01-16",
      "activity_id": "MTG-PL-2014-01-16-VOT-ITM-344715-3",
      "activity_label": {
        "fr": "Modification du règlement du Parlement européen concernant la levée et la défense de l'immunité parlementaire"
      },
      "based_on_a_realization_of": [
        "eli/dl/doc/A-7-2014-0012"
      ],
      "executed": [
        "eli/dl/event/MTG-PL-2014-01-16-OJ-ITM-V-59"
      ],
      "had_activity_type": "def/ep-activities/PLENARY_VOTE_RESULTS",
      "recorded_in_a_realization_of": [
        "eli/dl/doc/PV-7-2014-01-16-VOT-ITM-003"
      ],
      "notation_dlvId": "344715",
      "structuredLabel": {
        "fr": "<structuredLabel><title>...</title><label>Rapport: Anneli Jäätteenmäki (A7-0012/2014) (majorité qualifiée requise)</label></structuredLabel>"
      },
      "inverse_consists_of": [
        {
          "id": "eli/dl/event/MTG-PL-2014-01-16",
          "consists_of": [
            "eli/dl/event/MTG-PL-2014-01-16-VOT-ITM-344715-3"
          ]
        },
        {
          "id": "eli/dl/proc/2013-2031",
          "consists_of": [
            "eli/dl/event/MTG-PL-2014-01-16-VOT-ITM-344715-3"
          ]
        }
      ]
    }
  ],
  "@context": [...]
}
```

### Vote Result Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Vote event ID |
| `type` | String | ✅ | `"Activity"` |
| `activity_id` | String | ✅ | Vote ID |
| `activity_date` | Date | ✅ | Vote date (xsd:date) |
| `activity_label` | Object | ❌ | Multilingual vote subject |
| `had_activity_type` | URI | ✅ | `def/ep-activities/PLENARY_VOTE_RESULTS` |
| `based_on_a_realization_of` | Array | ❌ | Document URIs being voted on |
| `executed` | Array | ❌ | Vote execution event URIs |
| `recorded_in_a_realization_of` | Array | ❌ | Vote record document URIs |
| `notation_dlvId` | String | ❌ | Internal vote ID |
| `structuredLabel` | Object | ❌ | XML-structured vote label |
| `inverse_consists_of` | Array | ❌ | Parent meeting/procedure references |

**Note:** Individual vote tallies (for/against/abstentions) and MEP-level votes are stored in separate documents referenced by `executed` and `recorded_in_a_realization_of` fields.

---

## 5. Documents Endpoint

### Available Endpoints
- `GET /documents` - All documents
- `GET /documents/{doc-id}` - Specific document
- `GET /plenary-documents` - Plenary documents
- `GET /committee-documents` - Committee documents
- `GET /adopted-texts` - Adopted texts
- `GET /parliamentary-questions` - Parliamentary questions

### Real Response Structure

#### Document List
```json
{
  "data": [
    {
      "id": "eli/dl/doc/A-10-0034-0034-AM-001-001",
      "type": "Work",
      "work_type": "def/ep-document-types/AMENDMENT_LIST",
      "identifier": "A-10-0034-0034-AM-001-001"
    }
  ],
  "@context": [...]
}
```

#### Detailed Document
```json
{
  "data": [
    {
      "id": "eli/dl/doc/A-10-0034-0034-AM-001-001",
      "type": "Work",
      "foresees_change_of": "eli/dl/doc/A-10-0034-0034",
      "parliamentary_term": "org/ep-10",
      "document_date": "2025-03-27",
      "is_realized_by": [
        {
          "id": "eli/dl/doc/A-10-0034-0034-AM-001-001/el",
          "type": "Expression",
          "is_embodied_by": [
            {
              "id": "eli/dl/doc/A-10-0034-0034-AM-001-001/el/docx",
              "type": "Manifestation",
              "is_exemplified_by": "distribution/reds_iPlRp_Amd/A-10-0034-0034-AM-001-001/A-10-0034-0034-AM-001-001_el.docx",
              "media_type": "https://www.iana.org/assignments/media-types/application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "format": "http://publications.europa.eu/resource/authority/file-type/DOCX",
              "issued": "2025-03-27T15:46:00+01:00",
              "byteSize": "54504"
            },
            {
              "id": "eli/dl/doc/A-10-0034-0034-AM-001-001/el/pdf",
              "type": "Manifestation",
              "is_exemplified_by": "distribution/reds_iPlRp_Amd/A-10-0034-0034-AM-001-001/A-10-0034-0034-AM-001-001_el.pdf",
              "media_type": "https://www.iana.org/assignments/media-types/application/pdf",
              "format": "http://publications.europa.eu/resource/authority/file-type/PDF",
              "issued": "2025-03-27T15:46:00+01:00",
              "byteSize": "54504"
            }
          ],
          "language": "http://publications.europa.eu/resource/authority/language/ELL",
          "title": {
            "el": "Τροπολογία  - Bernd Lange - Δασμοί στις εισαγωγές..."
          },
          "title_alternative": {
            "el": "Τροπολογία  - Bernd Lange - Δασμοί στις εισαγωγές..."
          }
        }
      ],
      "number": "001-001",
      "work_type": "def/ep-document-types/AMENDMENT_LIST",
      "identifier": "A-10-0034-0034-AM-001-001",
      "publisher": "org/EU_PARLIAMENT",
      "title_dcterms": {
        "el": "Τροπολογία  - Bernd Lange - Δασμοί στις εισαγωγές..."
      },
      "identifierYear": "0034",
      "itemNumberBegin": 1,
      "itemNumberEnd": 1,
      "numbering": 1
    }
  ],
  "@context": [...]
}
```

### Document Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Document ID (ELI format) |
| `type` | String | ✅ | `"Work"` or `"WorkSubdivision"` |
| `identifier` | String | ✅ | Document identifier |
| `work_type` | URI | ✅ | Document type classification |
| `document_date` | Date | ❌ | Document date (xsd:date) |
| `parliamentary_term` | URI | ❌ | EP term reference |
| `publisher` | URI | ❌ | Publisher organization |
| `creator` | Array | ❌ | Creator person/org URIs |
| `title_dcterms` | Object | ❌ | Multilingual titles |
| `identifierYear` | String | ❌ | Year from identifier |
| `number` | String | ❌ | Document number |
| `epNumber` | String | ❌ | EP internal number |
| `originalLanguage` | Array | ❌ | Original language URIs |
| `is_realized_by` | Array | ❌ | Language expressions |
| `is_about` | Array | ❌ | Subject EuroVoc URIs |
| `workHadParticipation` | Array | ❌ | Participation records |

### Document Expression Structure (is_realized_by)

```typescript
interface Expression {
  id: string;                    // e.g., "eli/dl/doc/{doc-id}/en"
  type: "Expression";
  language: string;              // Language authority URI
  title: Record<string, string>; // Multilingual title
  title_alternative?: Record<string, string>;
  is_embodied_by: Manifestation[];
}

interface Manifestation {
  id: string;                    // e.g., "eli/dl/doc/{doc-id}/en/pdf"
  type: "Manifestation";
  is_exemplified_by: string;     // Download path
  media_type: string;            // IANA media type URI
  format: string;                // File type authority URI
  issued: string;                // ISO 8601 dateTime
  byteSize: string;              // File size in bytes
}
```

### Document Types
- `AMENDMENT_LIST` - Amendment list
- `REPORT` - Committee report
- `RESOLUTION` - Parliamentary resolution
- `QUESTION_WRITTEN` - Written question
- `QUESTION_WRITTEN_ANSWER` - Answer to written question
- `MOTION_RESOLUTION` - Motion for resolution
- `ADOPTED_TEXT` - Adopted text

---

## 6. Parliamentary Questions Endpoint

### Available Endpoints
- `GET /parliamentary-questions` - All questions
- `GET /parliamentary-questions/{doc-id}` - Specific question

### Real Response Structure

```json
{
  "data": [
    {
      "id": "eli/dl/doc/E-10-2024-001357",
      "type": "Work",
      "parliamentary_term": "org/ep-10",
      "document_date": "2024-07-16",
      "is_realized_by": [
        {
          "id": "eli/dl/doc/E-10-2024-001357/en",
          "type": "Expression",
          "is_embodied_by": [
            {
              "id": "eli/dl/doc/E-10-2024-001357/en/docx",
              "type": "Manifestation",
              "is_exemplified_by": "distribution/reds_iMaQp/E-10-2024-001357/E-10-2024-001357_en.docx",
              "media_type": "https://www.iana.org/assignments/media-types/application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "format": "http://publications.europa.eu/resource/authority/file-type/DOCX",
              "issued": "2024-07-25T18:51:58+02:00",
              "byteSize": "10723"
            },
            {
              "id": "eli/dl/doc/E-10-2024-001357/en/pdf",
              "type": "Manifestation",
              "is_exemplified_by": "distribution/reds_iMaQp/E-10-2024-001357/E-10-2024-001357_en.pdf",
              "media_type": "https://www.iana.org/assignments/media-types/application/pdf",
              "format": "http://publications.europa.eu/resource/authority/file-type/PDF",
              "issued": "2024-07-25T18:51:58+02:00",
              "byteSize": "10723"
            }
          ],
          "language": "http://publications.europa.eu/resource/authority/language/ENG",
          "title": {
            "en": "Suspension of the EU-Israel Association Agreement and recognition of the State of Palestine"
          },
          "title_alternative": {
            "en": "Question for written answer E-001357/2024 - to the Council - Rule 144 - João Oliveira (The Left)"
          }
        }
      ],
      "work_type": "def/ep-document-types/QUESTION_WRITTEN",
      "creator": [
        "person/257083"
      ],
      "identifier": "E-10-2024-001357",
      "publisher": "org/EU_PARLIAMENT",
      "title_dcterms": {
        "pt": "Suspensão do Acordo de Associação UE-Israel e o reconhecimento do Estado da Palestina",
        "en": "Suspension of the EU-Israel Association Agreement and recognition of the State of Palestine"
      },
      "epNumber": "PE763.351",
      "identifierYear": "2024",
      "originalLanguage": [
        "http://publications.europa.eu/resource/authority/language/POR"
      ],
      "workHadParticipation": [
        {
          "id": "eli/dl/participation/E-10-2024-001357_257083",
          "type": "Participation",
          "had_participant_person": [
            "person/257083"
          ],
          "participation_role": "def/ep-roles/AUTHOR"
        },
        {
          "id": "eli/dl/participation/E-10-2024-001357_CS",
          "type": "Participation",
          "had_participant_organization": [
            "org/CS"
          ],
          "participation_role": "def/ep-roles/ADDRESSEE"
        }
      ],
      "inverse_answers_to": [
        {
          "id": "eli/dl/doc/E-10-2024-001357-ASW",
          "type": "Work",
          "answers_to": "eli/dl/doc/E-10-2024-001357",
          "parliamentary_term": "org/ep-10",
          "document_date": "2025-02-26",
          "is_realized_by": [...],
          "work_type": "def/ep-document-types/QUESTION_WRITTEN_ANSWER",
          "creator": [
            "org/EU_COUNCIL"
          ],
          "identifier": "E-10-2024-001357-ASW",
          "publisher": "org/EU_PARLIAMENT",
          "title_dcterms": {
            "pt": "Answer for question E-001357/24",
            "en": "Answer for question E-001357/24"
          },
          "identifierYear": "2024",
          "workHadParticipation": [...]
        }
      ]
    }
  ],
  "@context": [...]
}
```

### Parliamentary Question Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Question ID (ELI format) |
| `type` | String | ✅ | `"Work"` |
| `work_type` | URI | ✅ | `QUESTION_WRITTEN` |
| `identifier` | String | ✅ | Question reference (e.g., E-10-2024-001357) |
| `document_date` | Date | ✅ | Submission date |
| `parliamentary_term` | URI | ✅ | EP term |
| `creator` | Array | ✅ | Author MEP person URIs |
| `publisher` | URI | ✅ | Always `org/EU_PARLIAMENT` |
| `title_dcterms` | Object | ✅ | Multilingual question subject |
| `epNumber` | String | ❌ | EP internal number |
| `identifierYear` | String | ✅ | Year |
| `originalLanguage` | Array | ✅ | Original language URIs |
| `is_realized_by` | Array | ✅ | Language expressions with PDFs |
| `workHadParticipation` | Array | ✅ | Author/Addressee participation |
| `inverse_answers_to` | Array | ❌ | Answer document (if answered) |

### Participation Structure

```typescript
interface Participation {
  id: string;
  type: "Participation";
  had_participant_person?: string[];      // Person URIs
  had_participant_organization?: string[]; // Organization URIs
  participation_role: string;             // Role URI
}
```

### Participation Roles
- `def/ep-roles/AUTHOR` - Question author
- `def/ep-roles/ADDRESSEE` - Question recipient (Commission/Council)

### Question Addressees
- `org/CE` - European Commission
- `org/CS` - Council of the European Union
- `org/VP` - VP/High Representative

---

## 7. Procedures Endpoint

### Available Endpoints
- `GET /procedures` - All procedures
- `GET /procedures/{process-id}` - Specific procedure
- `GET /procedures/{process-id}/events` - Procedure events

### Real Response Structure

#### Procedure List
```json
{
  "data": [
    {
      "id": "eli/dl/proc/1972-0003",
      "type": "Process",
      "process_id": "1972-0003",
      "process_type": "def/ep-procedure-types/COD",
      "label": "1972/0003(COD)"
    }
  ],
  "@context": [...]
}
```

#### Detailed Procedure
```json
{
  "data": [
    {
      "id": "eli/dl/proc/1972-0003",
      "type": "Process",
      "consists_of": [
        {
          "id": "eli/dl/event/1972-0003-ANPRO-1972-11-06",
          "type": "Activity",
          "activity_date": "1972-11-06",
          "activity_id": "1972-0003-ANPRO-1972-11-06",
          "had_activity_type": "def/ep-activities/REFERRAL",
          "occured_at_stage": "http://publications.europa.eu/resource/authority/procedure-phase/RDG1"
        },
        {
          "id": "eli/dl/event/1972-0003-DEC-DCPL-1991-07-10",
          "type": "Decision",
          "activity_date": "1991-07-10",
          "activity_id": "1972-0003-DEC-DCPL-1991-07-10",
          "had_activity_type": "def/ep-activities/PLENARY_AMEND_PROPOSAL",
          "occured_at_stage": "http://publications.europa.eu/resource/authority/procedure-phase/RDG1"
        }
      ],
      "created_a_realization_of": [
        "eli/dl/doc/C-3-1993-0369"
      ],
      "current_stage": "http://publications.europa.eu/resource/authority/procedure-phase/RDG2",
      "process_id": "1972-0003",
      "process_title": {
        "en": "Legal barriers to acquisition undertakings by means of TOBs - company structure: second amendment to fifth directive",
        "fr": "Obstacles jurid. acquisition entrepr. biais OPA  - structure des S.A.: 2ème modif. 5ème dir.)",
        "de": "Rechtliche Hindernisse betr. Unternehmenserwerb durch OPA - Struktur der AG: 2. Änderung der 5. Richtlinie"
      },
      "process_type": "def/ep-procedure-types/COD",
      "label": "1972/0003(COD)",
      "identifierYear": "1972"
    }
  ],
  "@context": [...]
}
```

### Procedure Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Procedure ID (ELI format) |
| `type` | String | ✅ | `"Process"` |
| `process_id` | String | ✅ | Procedure identifier |
| `process_type` | URI | ✅ | Procedure type |
| `label` | String | ✅ | Procedure label |
| `identifierYear` | String | ✅ | Year |
| `process_title` | Object | ❌ | Multilingual title |
| `current_stage` | URI | ❌ | Current procedure stage |
| `consists_of` | Array | ❌ | Procedure events/decisions |
| `created_a_realization_of` | Array | ❌ | Related document URIs |

### Procedure Types
- `def/ep-procedure-types/COD` - Ordinary legislative procedure
- `def/ep-procedure-types/CNS` - Consultation procedure
- `def/ep-procedure-types/APP` - Consent procedure
- `def/ep-procedure-types/NLE` - Non-legislative procedure

### Procedure Stages
- `RDG1` - First reading
- `RDG2` - Second reading
- `RDG3` - Third reading
- `CON` - Conciliation

---

## 8. Speeches Endpoint

### Available Endpoints
- `GET /speeches` - All speeches
- `GET /speeches/{speech-id}` - Specific speech

### Real Response Structure

```json
{
  "data": [
    {
      "id": "eli/dl/event/MTG-PL-2022-04-05-OTH-20680000",
      "type": "Activity",
      "activity_date": "2022-04-05",
      "activity_id": "MTG-PL-2022-04-05-OTH-20680000",
      "activity_label": {
        "en": "EU Protection of children and young people fleeing the war against Ukraine (debate)",
        "fr": "Protection accordée par l'Union européenne aux enfants et aux jeunes qui fuient en raison de la guerre en Ukraine (débat)",
        "de": "Schutz von Kindern und jungen Menschen, die vor dem Krieg gegen die Ukraine fliehen, durch die EU (Aussprache)"
      },
      "had_activity_type": "def/ep-activities/PROCEEDING_ACTIVITY",
      "recorded_in_a_realization_of": [
        {
          "id": "eli/dl/doc/CRE-9-2022-04-05-OTH-20680000",
          "type": "WorkSubdivision",
          "is_part_of": "eli/dl/doc/CRE-9-2022-04-05-ITM-003",
          "number": "2-068-0000",
          "type_subdivision": "http://publications.europa.eu/resource/authority/subdivision/OTH",
          "identifier": "CRE-9-2022-04-05-OTH-20680000",
          "notation_speechId": "20680000",
          "numbering": 62,
          "originalLanguage": [
            "http://publications.europa.eu/resource/authority/language/SLK"
          ]
        }
      ],
      "inverse_consists_of": [
        "eli/dl/event/MTG-PL-2022-04-05-PVCRE-ITM-3"
      ]
    }
  ],
  "@context": [...],
  "searchResults": {
    "hits": [
      {
        "id": "eli/dl/event/MTG-PL-2022-04-05-OTH-20680000"
      }
    ]
  },
  "meta": {
    "total": 10000
  }
}
```

### Speech Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | URI | ✅ | Speech event ID |
| `type` | String | ✅ | `"Activity"` |
| `activity_id` | String | ✅ | Speech identifier |
| `activity_date` | Date | ✅ | Speech date |
| `activity_label` | Object | ❌ | Multilingual speech subject |
| `had_activity_type` | URI | ✅ | Activity type |
| `recorded_in_a_realization_of` | Array | ❌ | Document references |
| `inverse_consists_of` | Array | ❌ | Parent meeting references |

---

## JSON-LD Context

The API uses a shared JSON-LD context available at:
`https://data.europarl.europa.eu/api/v2/context.jsonld`

### Key Context Mappings

```json
{
  "@context": {
    "id": "@id",
    "type": "@type",
    "identifier": { "@id": "dcterms:identifier" },
    "activity_id": { "@id": "eli-dl:activity_id" },
    "process_id": { "@id": "eli-dl:process_id" },
    "document_date": { "@id": "eli:date_document", "@type": "xsd:date" },
    "issued": { "@id": "dcterms:issued", "@type": "xsd:dateTime" },
    "activity_date": { "@id": "eli-dl:activity_date", "@type": "xsd:date" },
    "startDate": { "@id": "dcat:startDate", "@type": "xsd:date" },
    "endDate": { "@id": "dcat:endDate", "@type": "xsd:date" },
    "title": { "@id": "eli:title", "@container": "@language" },
    "title_dcterms": { "@id": "dcterms:title", "@container": "@language" },
    "prefLabel": { "@id": "skos:prefLabel", "@container": "@language" },
    "altLabel": { "@id": "skos:altLabel", "@container": "@language" },
    "language": { "@id": "eli:language", "@type": "@id" },
    "classification": { "@id": "org:classification", "@type": "@id" },
    "work_type": { "@id": "eli:work_type", "@type": "@id" },
    "process_type": { "@id": "eli-dl:process_type", "@type": "@id" }
  }
}
```

---

## Common Patterns

### 1. Multilingual Fields
All text fields use language objects:
```json
{
  "title": {
    "en": "English title",
    "fr": "Titre français",
    "de": "Deutscher Titel"
  }
}
```

### 2. Time Periods
```json
{
  "memberDuring": {
    "id": "time-period/20240716",
    "type": "PeriodOfTime",
    "startDate": "2024-07-16",
    "endDate": "2025-12-31"  // Optional
  }
}
```

### 3. URI References
All IDs and classifications use URIs:
- **Relative URIs**: `person/1294`, `org/ECON`
- **Full URIs**: `http://publications.europa.eu/resource/authority/country/BEL`
- **Def URIs**: `def/ep-roles/MEMBER`

### 4. Document Hierarchy (FRBR Model)
The API uses FRBR (Functional Requirements for Bibliographic Records):
- **Work** (`type: "Work"`) - Abstract document
- **Expression** (within `is_realized_by`) - Language version
- **Manifestation** (within `is_embodied_by`) - File format (PDF, DOCX, XML)
- **Item** (`is_exemplified_by`) - Actual file path

---

## Missing/Changed from Original Assumptions

### What Changed

1. **No direct voting tallies in vote-results**: Vote counts (for/against/abstentions) are in separate documents
2. **Committee members not in corporate-bodies**: Member lists come from MEP memberships
3. **JSON-LD format**: All responses use JSON-LD, not plain JSON
4. **ELI identifiers**: Documents use European Legislation Identifier format
5. **Multilingual everywhere**: Almost all text fields are multilingual objects
6. **FRBR hierarchy**: Documents have Work/Expression/Manifestation layers
7. **No direct "plenary-sessions"**: Use `/meetings` with activity_type filter

### Not Found

- Direct voting tallies (need to fetch referenced documents)
- Committee member lists (use MEP hasMembership instead)
- Direct "questions answered/pending" status field
- Aggregate statistics endpoints

---

## Recommendations for Zod Schemas

### 1. Create Base Schemas

```typescript
// Multilingual text
const MultilingualTextSchema = z.record(z.string(), z.string());

// URI reference
const URISchema = z.string().url().or(z.string().regex(/^[a-z-]+\/[a-zA-Z0-9-]+$/));

// Time period
const TimePeriodSchema = z.object({
  id: z.string(),
  type: z.literal("PeriodOfTime"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// JSON-LD context
const ContextSchema = z.array(
  z.union([
    z.object({
      data: z.literal("@graph"),
      "@base": z.string().url(),
    }),
    z.string().url(),
  ])
);
```

### 2. Make Most Fields Optional

The API returns different field sets based on:
- List vs. detail endpoints
- Historical vs. current data
- Data completeness

### 3. Handle Nested Arrays

Many fields are arrays that may be empty:
- `hasMembership: []`
- `is_realized_by: []`
- `consists_of: []`

### 4. Support URI Formats

IDs can be:
- Relative: `person/123`
- Full: `https://data.europarl.europa.eu/person/123`
- Authority: `http://publications.europa.eu/resource/authority/...`

---

## API Rate Limiting

**Documented Limit:** 500 requests per 5 minutes per endpoint

**HTTP Headers to Monitor:**
- `Retry-After` - Seconds to wait before retry (if 429 response)

**Best Practices:**
- Implement exponential backoff
- Cache responses appropriately
- Use pagination (`offset` and `limit` parameters)

---

## Pagination

All list endpoints support:
- `?offset=0` - Starting index (default: 0)
- `?limit=10` - Number of results (default: 10, max: varies)

Example:
```
GET /meps?offset=0&limit=50
```

---

## Complete Example Requests

### Get Current MEPs from Belgium
```bash
curl -H "Accept: application/ld+json" \
  "https://data.europarl.europa.eu/api/v2/meps/show-current" \
  | jq '.data[] | select(."api:country-of-representation" == "BE")'
```

### Get Specific Committee Details
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

---

## Next Steps

1. **Update Zod Schemas** to match real API structure
2. **Implement JSON-LD context parsing** for type safety
3. **Add FRBR hierarchy support** for documents
4. **Create helper functions** for multilingual text extraction
5. **Implement proper rate limiting** (500 req/5min)
6. **Add caching layer** with appropriate TTLs
7. **Support ELI identifier parsing** and validation
8. **Add URI resolver** for authority references
9. **Implement pagination** for large result sets
10. **Add response transformers** from JSON-LD to simplified types

---

**End of Analysis**
