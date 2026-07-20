[**European Parliament MCP Server API v1.4.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/committee](../README.md) / Committee

# Interface: Committee

Defined in: [types/ep/committee.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L70)

European Parliament committee information.

Represents a standing committee, special committee, or temporary committee
of the European Parliament. Committees are responsible for preparing
legislation, conducting hearings, and producing reports on matters within
their mandate. Each committee has members, substitutes, and leadership
positions.

**Committee Types:**
- Standing Committees (20 permanent committees)
- Special Committees (temporary, specific mandate)
- Committees of Inquiry (investigative powers)
- Subcommittees (under standing committees)

**Data Source:** EP API `/committees`

## Interface

Committee

## Examples

```typescript
const committee: Committee = {
  id: "COMM-DEVE",
  name: "Committee on Development",
  abbreviation: "DEVE",
  members: ["person/124936", "person/198765", "person/100000"],
  chair: "person/124936",
  viceChairs: ["person/198765"],
  meetingSchedule: ["2024-11-25T09:00:00Z", "2024-12-10T14:00:00Z"],
  responsibilities: [
    "Development cooperation policy",
    "Relations with ACP countries",
    "Humanitarian aid"
  ]
};
```

```typescript
// Minimal committee (optional fields omitted)
const minimalCommittee: Committee = {
  id: "COMM-ENVI",
  name: "Committee on the Environment, Public Health and Food Safety",
  abbreviation: "ENVI",
  members: ["person/111111", "person/222222"]
};
```

## See

 - MEP for member information
 - LegislativeDocument for committee documents
 - https://www.europarl.europa.eu/committees/en/home

## Properties

### abbreviation

> **abbreviation**: `string`

Defined in: [types/ep/committee.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L140)

Committee abbreviation.

Short 4-letter code used for references and citations. Abbreviations
are stable and widely used in EP documentation.

**EP API Field:** `abbreviation`
**Format:** 4 uppercase letters
**Validation:** Must match `/^[A-Z]{4}$/`

**Common Abbreviations:**
- "AFET" - Foreign Affairs
- "DEVE" - Development
- "INTA" - International Trade
- "BUDG" - Budgets
- "CONT" - Budgetary Control
- "ECON" - Economic and Monetary Affairs
- "EMPL" - Employment and Social Affairs
- "ENVI" - Environment, Public Health and Food Safety
- "ITRE" - Industry, Research and Energy
- "IMCO" - Internal Market and Consumer Protection
- "TRAN" - Transport and Tourism
- "REGI" - Regional Development
- "AGRI" - Agriculture and Rural Development
- "PECH" - Fisheries
- "CULT" - Culture and Education
- "JURI" - Legal Affairs
- "LIBE" - Civil Liberties, Justice and Home Affairs
- "AFCO" - Constitutional Affairs
- "FEMM" - Women's Rights and Gender Equality
- "PETI" - Petitions

#### Examples

```ts
"DEVE"
```

```ts
"ENVI"
```

```ts
"ECON"
```

***

### id

> **id**: `string`

Defined in: [types/ep/committee.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L85)

Unique committee identifier.

Format: "COMM-{abbreviation}" for stable identification across terms.
ID remains consistent even if committee name or mandate changes.

**EP API Field:** `identifier`
**Format Pattern:** `COMM-{ABBREV}`
**Validation:** Must match `/^COMM-[A-Z]{4}$/`

#### Examples

```ts
"COMM-DEVE"
```

```ts
"COMM-ENVI"
```

```ts
"COMM-ECON"
```

***

### members

> **members**: `string`[]

Defined in: [types/ep/committee.ts:158](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L158)

Committee members.

Array of MEP IDs representing full members (not substitutes).
Committee size varies by mandate, typically 25-86 members.
Membership reflects political group proportionality and is derived from
MEP membership relations when available.

**EP API Field:** `members`
**Format:** Array of MEP IDs (format: "person/{id}")
**Typical Size:** 25-86 members per committee

#### Example

```ts
["person/124936", "person/198765", "person/100000"]
```

#### See

MEP for member details

***

### name

> **name**: `string`

Defined in: [types/ep/committee.ts:102](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L102)

Full committee name.

Official committee name in English. Names may be lengthy for
committees with broad mandates. Other languages available through
EP multilingual API.

**EP API Field:** `label`
**Language:** English (other languages available in API)
**Max Length:** Typically 50-150 characters

#### Examples

```ts
"Committee on Development"
```

```ts
"Committee on the Environment, Public Health and Food Safety"
```

```ts
"Committee on Economic and Monetary Affairs"
```

***

### chair?

> `optional` **chair?**: `string`

Defined in: [types/ep/committee.ts:177](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L177)

Committee chair.

MEP ID of the committee chair/chairperson who leads the committee,
sets agendas, and represents the committee. Elected by committee
members at start of parliamentary term.

**EP API Field:** `chair`
**Format:** MEP ID (format: "person/{id}")

#### Example

```ts
"person/124936"
```

#### See

MEP for chair details

***

### meetingSchedule?

> `optional` **meetingSchedule?**: `string`[]

Defined in: [types/ep/committee.ts:213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L213)

Scheduled committee meetings.

Array of upcoming meeting timestamps in ISO 8601 format with timezone.
Regular committees typically meet 1-2 times per month in Brussels
during parliamentary session weeks. Extraordinary meetings may be scheduled.

**EP API Field:** `meetingSchedule`
**Format:** Array of ISO 8601 datetime strings with timezone
**Location:** Typically Brussels (European Parliament)

#### Example

```ts
[
  "2024-11-25T09:00:00Z",
  "2024-12-10T14:00:00Z",
  "2025-01-20T15:30:00Z"
]
```

***

### memberships?

> `optional` **memberships?**: [`CommitteeMembership`](CommitteeMembership.md)[]

Defined in: [types/ep/committee.ts:161](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L161)

Complete current membership records used to derive the committee roster.

***

### responsibilities?

> `optional` **responsibilities?**: `string`[]

Defined in: [types/ep/committee.ts:238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L238)

Committee responsibilities and mandate.

Array of policy areas and legislative matters within the committee's
jurisdiction. Responsibilities defined in EP Rules of Procedure Annex VI.
May include Treaty article references.

**EP API Field:** `responsibilities`
**Source:** EP Rules of Procedure Annex VI

#### Examples

```ts
[
  "Development cooperation policy",
  "Humanitarian aid and emergency assistance",
  "Relations with ACP countries",
  "Coherence between EU development policies and other policies"
]
```

```ts
[
  "Environment policy (TFEU Article 191-193)",
  "Public health (TFEU Article 168)",
  "Food safety (TFEU Article 169)"
]
```

***

### viceChairs?

> `optional` **viceChairs?**: `string`[]

Defined in: [types/ep/committee.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L194)

Committee vice-chairs.

Array of MEP IDs for committee vice-chairs (typically 1-4 per committee).
Vice-chairs assist the chair and substitute when needed. Positions
allocated to ensure political group representation.

**EP API Field:** `viceChairs`
**Format:** Array of MEP IDs (format: "person/{id}")
**Typical Size:** 1-4 vice-chairs

#### Example

```ts
["person/198765", "person/111111"]
```

#### See

MEP for vice-chair details
