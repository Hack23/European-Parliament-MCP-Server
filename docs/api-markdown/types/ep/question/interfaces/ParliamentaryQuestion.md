[**European Parliament MCP Server API v1.0.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/question](../README.md) / ParliamentaryQuestion

# Interface: ParliamentaryQuestion

Defined in: [types/ep/question.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L80)

Parliamentary question to EU institutions.

Represents questions submitted by MEPs to the European Commission, Council,
or other EU institutions. Questions are a key parliamentary scrutiny tool
ensuring accountability and transparency. Answers are published and become
part of parliamentary record.

**Question Types:**
- WRITTEN: Written questions requiring written answer (most common)
- ORAL: Oral questions answered in plenary (with or without debate)

**Rules:**
- Priority questions: 3-week answer deadline
- Standard questions: Variable deadline
- Subject to admissibility rules (EP Rules of Procedure Rule 138-139)

**Data Source:** EP API `/parliamentary-questions`

 ParliamentaryQuestion

## Examples

```typescript
const writtenQuestion: ParliamentaryQuestion = {
  id: "E-000123/2024",
  type: "WRITTEN",
  author: "person/124936",
  date: "2024-11-15",
  topic: "Implementation of Digital Services Act in Member States",
  questionText: "Can the Commission provide data on Member State implementation of the Digital Services Act...",
  answerText: "The Commission has received implementation reports from 25 Member States...",
  answerDate: "2024-12-05",
  status: "ANSWERED"
};
```

```typescript
// Pending oral question
const oralQuestion: ParliamentaryQuestion = {
  id: "O-000045/2024",
  type: "ORAL",
  author: "person/198765",
  date: "2024-11-20",
  topic: "EU response to climate emergency",
  questionText: "What measures is the Commission taking to meet 2030 climate targets?",
  status: "PENDING"
};
```

```typescript
// Priority written question
const priorityQuestion: ParliamentaryQuestion = {
  id: "P-000089/2024",
  type: "WRITTEN",
  author: "person/100000",
  date: "2024-11-10",
  topic: "Food safety incident in Country X",
  questionText: "Is the Commission aware of the food safety incident...",
  answerText: "The Commission is monitoring the situation closely...",
  answerDate: "2024-11-28",
  status: "ANSWERED"
};
```

## See

 - MEP for author information
 - https://www.europarl.europa.eu/plenary/en/parliamentary-questions.html
 - EP Rules of Procedure Rule 138-139

## Properties

### author

> **author**: `string`

Defined in: [types/ep/question.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L140)

Question author MEP ID.

MEP who submitted the question. Questions may also be tabled by
committees or political groups (represented by lead MEP ID).
All MEPs have right to ask questions (Rules of Procedure Rule 138).

**EP API Field:** `author`
**Format:** MEP ID (format: "person/{id}")

#### Example

```ts
"person/124936"
```

#### See

MEP for author details

***

### date

> **date**: `string`

Defined in: [types/ep/question.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L156)

Question submission date.

Date when the question was officially submitted/tabled in Parliament
in ISO 8601 format. Starts the answer deadline clock for priority
questions.

**EP API Field:** `date`
**Format:** ISO 8601 date (YYYY-MM-DD)
**Validation:** Must be valid date

#### Examples

```ts
"2024-11-15"
```

```ts
"2024-11-20"
```

***

### id

> **id**: `string`

Defined in: [types/ep/question.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L99)

Unique question identifier.

EP reference number following official numbering system.
Prefix indicates question type.

**EP API Field:** `reference`

**Format Patterns:**
- E-{number}/{year} - Written question
- P-{number}/{year} - Priority written question
- O-{number}/{year} - Oral question
- H-{number}/{year} - Question for Question Time

#### Examples

```ts
"E-000123/2024" // Written question
```

```ts
"P-000089/2024" // Priority question
```

```ts
"O-000045/2024" // Oral question
```

***

### questionText

> **questionText**: `string`

Defined in: [types/ep/question.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L194)

Full question text.

Complete text of the question as submitted by the MEP.
May include multiple parts, background information, and specific
queries. Questions must comply with admissibility rules (no personal
attacks, within EU competence, etc.).

**EP API Field:** `questionText`
**Format:** Plain text or HTML
**Max Length:** Typically 500-2000 characters

**Admissibility Rules (Rule 138):**
- Within EU competence
- Not already answered
- No personal attacks
- Factual basis required

#### Examples

```ts
"Can the Commission provide data on Member State implementation of the Digital Services Act, including number of designated platforms and enforcement actions taken?"
```

```ts
"What measures is the Commission taking to meet 2030 climate targets? Has the Commission assessed the impact of recent policy changes?"
```

***

### status

> **status**: `"PENDING"` \| `"ANSWERED"`

Defined in: [types/ep/question.ts:247](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L247)

Question status.

Current status indicating whether answer has been provided.
Questions remain "PENDING" until institution provides answer.

**EP API Field:** `status`

**Values:**
- "PENDING" - Question submitted, awaiting answer
- "ANSWERED" - Answer provided and published

#### Examples

```ts
"ANSWERED"
```

```ts
"PENDING"
```

***

### topic

> **topic**: `string`

Defined in: [types/ep/question.ts:171](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L171)

Question topic/subject matter.

Brief subject line describing what the question is about.
Used for categorization and searching. Typically 50-150 characters.

**EP API Field:** `subject`
**Max Length:** Typically 150 characters

#### Examples

```ts
"Implementation of Digital Services Act in Member States"
```

```ts
"EU response to climate emergency"
```

```ts
"Food safety incident in Country X"
```

***

### type

> **type**: `"WRITTEN"` \| `"ORAL"`

Defined in: [types/ep/question.ts:124](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L124)

Question type.

Determines answer format, timing, and procedural rules.
Written questions receive written answers published online.
Oral questions receive verbal answers in plenary session.

**EP API Field:** `type`

**Values:**
- "WRITTEN" - Written question with written answer (most common)
  - Standard: Variable deadline
  - Priority: 3-week deadline
  - Published in Parliamentary Questions database

- "ORAL" - Oral question with verbal answer in plenary
  - Answered during plenary session
  - May include debate
  - Verbatim answer in plenary transcript

#### Examples

```ts
"WRITTEN"
```

```ts
"ORAL"
```

***

### answerDate?

> `optional` **answerDate**: `string`

Defined in: [types/ep/question.ts:230](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L230)

Answer publication date.

Date when the answer was officially provided and published in
ISO 8601 format. Undefined if question still pending.
For priority questions, target is 3 weeks from submission.

**EP API Field:** `answerDate`
**Format:** ISO 8601 date (YYYY-MM-DD)
**Validation:** Must be after or equal to question date

**Deadlines:**
- Priority questions: 3 weeks (21 days)
- Standard questions: Variable (typically 6-8 weeks)

#### Examples

```ts
"2024-12-05"
```

```ts
"2024-11-28"
```

***

### answerText?

> `optional` **answerText**: `string`

Defined in: [types/ep/question.ts:210](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/question.ts#L210)

Answer text from institution.

Full text of the answer provided by the addressed institution
(typically European Commission). Undefined if question still pending.
Answers become public record and are published online.

**EP API Field:** `answerText`
**Format:** Plain text or HTML
**Max Length:** Variable (typically 500-5000 characters)

#### Examples

```ts
"The Commission has received implementation reports from 25 Member States. A total of 47 platforms have been designated under the DSA. Enforcement actions..."
```

```ts
"The Commission is monitoring the situation closely and has requested additional information from Member State authorities..."
```
