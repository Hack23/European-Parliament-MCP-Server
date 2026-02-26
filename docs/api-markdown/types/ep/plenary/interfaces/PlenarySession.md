[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/plenary](../README.md) / PlenarySession

# Interface: PlenarySession

Defined in: [types/ep/plenary.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L65)

Plenary session information.

Represents a plenary sitting of the European Parliament where MEPs debate
and vote on legislation. Plenary sessions typically occur in Strasbourg
(monthly) and Brussels (additional sessions). Each session includes
agenda items, voting records, attendance tracking, and associated documents.

**Schedule:** 
- Monthly plenary: 3-4 days in Strasbourg (mandatory)
- Additional sessions: Brussels as needed
- Mini-plenaries: 2-day Brussels sessions

**Data Source:** EP API `/plenary-sessions`

 PlenarySession

## Examples

```typescript
const session: PlenarySession = {
  id: "P9-2024-11-20",
  date: "2024-11-20",
  location: "Strasbourg",
  agendaItems: [
    "Debate on climate policy",
    "Vote on digital services act amendments",
    "Question time with Commission President"
  ],
  votingRecords: [
    // Array of VotingRecord objects
  ],
  attendanceCount: 680,
  documents: ["DOC-2024-11-20-001", "DOC-2024-11-20-002"]
};
```

```typescript
// Brussels mini-plenary
const miniPlenary: PlenarySession = {
  id: "P9-2024-11-15",
  date: "2024-11-15",
  location: "Brussels",
  agendaItems: [
    "Urgent resolution on humanitarian crisis",
    "Vote on budgetary amendment"
  ],
  attendanceCount: 450
};
```

## See

 - [VotingRecord](VotingRecord.md) for individual vote details
 - LegislativeDocument for session documents
 - https://www.europarl.europa.eu/plenary/en/home.html

## Properties

### agendaItems

> **agendaItems**: `string`[]

Defined in: [types/ep/plenary.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L133)

Agenda items for the session.

Ordered list of agenda topics, debates, votes, and question times.
Agenda items may include legislative debates, resolutions, reports,
Commission statements, and question times. Order reflects
session schedule.

**EP API Field:** `agendaItems`
**Typical Count:** 10-30 items per session

#### Example

```ts
[
  "Debate on climate policy framework",
  "Vote on Digital Services Act amendments",
  "Question time with Commission President",
  "Resolution on humanitarian crisis in Region X"
]
```

***

### date

> **date**: `string`

Defined in: [types/ep/plenary.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L95)

Session date.

Primary date of the plenary session in ISO 8601 format.
Multi-day sessions use the start date. Full date range
available through EP API session details.

**EP API Field:** `date`
**Format:** ISO 8601 date (YYYY-MM-DD)
**Validation:** Must be valid date, typically between 1952 and current date + 1 year

#### Examples

```ts
"2024-11-20"
```

```ts
"2025-01-15"
```

***

### id

> **id**: `string`

Defined in: [types/ep/plenary.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L79)

Unique session identifier.

Format: "{term}-{year}-{month}-{day}" where term is parliamentary term
(e.g., P9 for 9th term, P10 for 10th term).

**EP API Field:** `identifier`
**Format Pattern:** `P{term}-YYYY-MM-DD`
**Validation:** Must match `/^P\d+-\d{4}-\d{2}-\d{2}$/`

#### Examples

```ts
"P9-2024-11-20" // 9th term, November 20, 2024
```

```ts
"P10-2025-01-15" // 10th term, January 15, 2025
```

***

### location

> **location**: `string`

Defined in: [types/ep/plenary.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L113)

Session location.

Physical location where the plenary session takes place.
EU treaties mandate monthly plenaries in Strasbourg, with
additional sessions possible in Brussels.

**EP API Field:** `location`

**Valid Values:**
- "Strasbourg" - Monthly plenary sessions (treaty-mandated)
- "Brussels" - Additional and mini-plenary sessions

#### Examples

```ts
"Strasbourg"
```

```ts
"Brussels"
```

***

### attendanceCount?

> `optional` **attendanceCount**: `number`

Defined in: [types/ep/plenary.ts:165](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L165)

Total attendance count.

Number of MEPs present during the session (or at peak attendance
for multi-day sessions). Attendance is tracked for quorum purposes
and transparency reporting.

**EP API Field:** `attendanceCount`
**Min Value:** 0
**Max Value:** 705 (current EP size, may change with expansions)
**Typical Range:** 400-680

#### Examples

```ts
680 // High attendance
```

```ts
450 // Brussels mini-plenary
```

***

### documents?

> `optional` **documents**: `string`[]

Defined in: [types/ep/plenary.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L186)

Associated document identifiers.

Array of document IDs related to the session (agendas, minutes,
verbatim reports, adopted texts). Documents available through
EP document API.

**EP API Field:** `documents`

**Document Types:**
- Session agenda (OJ C series)
- Minutes of proceedings
- Verbatim report of debates
- Texts adopted

#### Example

```ts
["DOC-2024-11-20-001", "A9-0123/2024", "P9_PV(2024)11-20"]
```

#### See

LegislativeDocument for document details

***

### votingRecords?

> `optional` **votingRecords**: [`VotingRecord`](VotingRecord.md)[]

Defined in: [types/ep/plenary.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/plenary.ts#L148)

Voting records from the session.

Array of all roll-call votes conducted during the plenary session.
Optional as not all sessions include votes, or votes may be
recorded separately. Each record includes topic, result, and
individual MEP votes.

**EP API Field:** `votingRecords`
**Typical Count:** 20-100 votes per session

#### See

[VotingRecord](VotingRecord.md) for vote structure
