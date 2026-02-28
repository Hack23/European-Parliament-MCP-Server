[**European Parliament MCP Server API v0.9.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/document](../README.md) / LegislativeDocument

# Interface: LegislativeDocument

Defined in: [types/ep/document.ts:62](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L62)

European Parliament legislative document.

Represents official parliamentary documents including reports, resolutions,
opinions, amendments, and legislative proposals. Documents are produced by
committees, MEPs, or submitted by external institutions (Commission, Council).
All documents follow strict formatting and reference standards.

**Document Reference System:**
- A9-0123/2024: Report (A series = committee reports)
- B9-0456/2024: Motion for resolution (B series)
- P9_TA(2024)0789: Adopted text (TA = texts adopted)
- COM(2024)123: Commission proposal

**Data Source:** EP API `/documents`

 LegislativeDocument

## Examples

```typescript
const report: LegislativeDocument = {
  id: "A9-0123/2024",
  type: "REPORT",
  title: "Report on the proposal for a regulation on digital services",
  date: "2024-11-15",
  authors: ["person/124936"],
  committee: "COMM-IMCO",
  status: "ADOPTED",
  pdfUrl: "https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.pdf",
  xmlUrl: "https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.xml",
  summary: "The committee recommends approval with amendments..."
};
```

```typescript
// Commission proposal
const proposal: LegislativeDocument = {
  id: "COM(2024)789",
  type: "REGULATION",
  title: "Proposal for a Regulation on artificial intelligence",
  date: "2024-10-01",
  authors: ["European Commission"],
  status: "IN_COMMITTEE"
};
```

## See

 - [DocumentType](../type-aliases/DocumentType.md) for document type enumeration
 - [DocumentStatus](../type-aliases/DocumentStatus.md) for status values
 - Committee for responsible committee
 - https://www.europarl.europa.eu/doceo/

## Properties

### authors

> **authors**: `string`[]

Defined in: [types/ep/document.ts:151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L151)

Document authors.

Array of author identifiers (MEP IDs for parliamentary documents,
institution names for external documents). For committee reports,
includes rapporteur and shadow rapporteurs. For resolutions,
includes co-signers.

**EP API Field:** `authors`
**Format:** MEP IDs (format: "person/{id}") or institution names

#### Examples

```ts
["person/124936", "person/198765"] // MEP authors
```

```ts
["European Commission"] // Institutional author
```

```ts
["person/124936"] // Single rapporteur
```

#### See

MEP for MEP author details

***

### date

> **date**: `string`

Defined in: [types/ep/document.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L132)

Document publication date.

Date when the document was officially published or submitted in
ISO 8601 format. For reports, this is typically the adoption date
by the committee.

**EP API Field:** `date`
**Format:** ISO 8601 date (YYYY-MM-DD)
**Validation:** Must be valid date, typically after 1952-07-23

#### Examples

```ts
"2024-11-15"
```

```ts
"2024-10-01"
```

***

### id

> **id**: `string`

Defined in: [types/ep/document.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L83)

Unique document identifier.

EP document reference following official numbering system.
Format varies by document type and series.

**EP API Field:** `reference`

**Formats:**
- A9-{number}/{year} - Committee reports
- B9-{number}/{year} - Motions for resolution
- P9_TA({year}){number} - Adopted texts
- COM({year}){number} - Commission proposals
- {year}/{number}(COD) - Procedure references

#### Examples

```ts
"A9-0123/2024" // Committee report
```

```ts
"B9-0456/2024" // Motion for resolution
```

```ts
"P9_TA(2024)0789" // Adopted text
```

```ts
"COM(2024)123" // Commission proposal
```

***

### status

> **status**: [`DocumentStatus`](../type-aliases/DocumentStatus.md)

Defined in: [types/ep/document.ts:185](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L185)

Document status in legislative process.

Current procedural status indicating where the document is in
the legislative workflow. Status progression varies by document
type and legislative procedure.

**EP API Field:** `status`

#### See

[DocumentStatus](../type-aliases/DocumentStatus.md) for all valid values and workflow

#### Examples

```ts
"ADOPTED"
```

```ts
"IN_COMMITTEE"
```

```ts
"PLENARY"
```

***

### title

> **title**: `string`

Defined in: [types/ep/document.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L116)

Document title.

Full official title in English. Titles follow standardized format
based on document type. May include procedure reference and
committee abbreviation. Other languages available through EP API.

**EP API Field:** `title`
**Language:** English (multilingual in API)
**Max Length:** Typically 100-500 characters

#### Examples

```ts
"Report on the proposal for a regulation of the European Parliament and of the Council on digital services (Digital Services Act)"
```

```ts
"Motion for a resolution on the situation of human rights in Country X"
```

```ts
"Draft opinion on the 2025 budget"
```

***

### type

> **type**: [`DocumentType`](../type-aliases/DocumentType.md)

Defined in: [types/ep/document.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L99)

Document type classification.

Categorizes the document by its legal and procedural nature.
Determines workflow, voting requirements, and legal effect.

**EP API Field:** `type`

#### See

[DocumentType](../type-aliases/DocumentType.md) for all valid values and descriptions

#### Examples

```ts
"REPORT"
```

```ts
"RESOLUTION"
```

```ts
"REGULATION"
```

***

### committee?

> `optional` **committee**: `string`

Defined in: [types/ep/document.ts:168](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L168)

Responsible committee.

Committee ID of the responsible committee handling the document.
For legislative procedures, this is the lead committee. Documents
may also have opinion-giving committees (not captured here).

**EP API Field:** `committee`
**Format:** Committee ID (format: "COMM-{ABBREV}")

#### Examples

```ts
"COMM-IMCO" // Internal Market committee
```

```ts
"COMM-ENVI" // Environment committee
```

#### See

Committee for committee details

***

### pdfUrl?

> `optional` **pdfUrl**: `string`

Defined in: [types/ep/document.ts:201](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L201)

PDF document URL.

Direct link to PDF version of the document. PDFs are the official
format for archival and legal purposes. URLs point to EP document
repository (doceo).

**EP API Field:** `pdfUrl`
**Format:** Full HTTPS URL
**Domain:** www.europarl.europa.eu/doceo/

#### Examples

```ts
"https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.pdf"
```

```ts
"https://www.europarl.europa.eu/doceo/document/B-9-2024-0456_EN.pdf"
```

***

### summary?

> `optional` **summary**: `string`

Defined in: [types/ep/document.ts:233](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L233)

Document summary or abstract.

Brief summary of document content, recommendations, or key points.
Typically 100-500 characters. For reports, may include committee
recommendation. For resolutions, includes main demands.

**EP API Field:** `summary`
**Format:** Plain text
**Max Length:** Typically 500 characters

#### Examples

```ts
"The committee recommends approval of the Commission proposal with 47 amendments, focusing on strengthening user protections and platform accountability."
```

```ts
"Resolution calling for immediate humanitarian access and cessation of hostilities."
```

***

### xmlUrl?

> `optional` **xmlUrl**: `string`

Defined in: [types/ep/document.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/document.ts#L217)

XML document URL.

Direct link to structured XML version of the document. XML format
enables programmatic processing, text extraction, and metadata parsing.
Follows EP XML schema.

**EP API Field:** `xmlUrl`
**Format:** Full HTTPS URL
**Domain:** www.europarl.europa.eu/doceo/
**Schema:** EP Akoma Ntoso XML

#### Example

```ts
"https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.xml"
```
