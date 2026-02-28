[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / YearlyStats

# Interface: YearlyStats

Defined in: [data/generatedStats.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L89)

Aggregated annual statistics for a single calendar year of EP activity.

## Properties

### adoptedTexts

> **adoptedTexts**: `number`

Defined in: [data/generatedStats.ts:111](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L111)

Texts adopted (reports, opinions, etc.)

***

### commentary

> **commentary**: `string`

Defined in: [data/generatedStats.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L127)

Notable events and key developments during the year

***

### committeeMeetings

> **committeeMeetings**: `number`

Defined in: [data/generatedStats.ts:103](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L103)

Committee meetings held

***

### declarations

> **declarations**: `number`

Defined in: [data/generatedStats.ts:121](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L121)

MEP financial/interest declarations (get_mep_declarations)

***

### documents

> **documents**: `number`

Defined in: [data/generatedStats.ts:117](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L117)

Total documents: plenary + committee + external (get_plenary_documents, get_committee_documents, get_external_documents)

***

### events

> **events**: `number`

Defined in: [data/generatedStats.ts:115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L115)

Parliamentary events (get_events)

***

### legislativeActsAdopted

> **legislativeActsAdopted**: `number`

Defined in: [data/generatedStats.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L99)

Legislative acts adopted

***

### mepCount

> **mepCount**: `number`

Defined in: [data/generatedStats.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L95)

Total number of MEPs in office

***

### mepTurnover

> **mepTurnover**: `number`

Defined in: [data/generatedStats.ts:119](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L119)

MEP turnover: incoming + outgoing (get_incoming_meps, get_outgoing_meps)

***

### monthlyActivity

> **monthlyActivity**: [`MonthlyActivity`](MonthlyActivity.md)[]

Defined in: [data/generatedStats.ts:123](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L123)

Month-by-month activity breakdown (12 entries, Jan–Dec)

***

### parliamentaryQuestions

> **parliamentaryQuestions**: `number`

Defined in: [data/generatedStats.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L105)

Parliamentary questions tabled

***

### parliamentaryTerm

> **parliamentaryTerm**: `string`

Defined in: [data/generatedStats.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L93)

Parliamentary term identifier (e.g. 'EP6', 'EP9/EP10 transition')

***

### plenarySessions

> **plenarySessions**: `number`

Defined in: [data/generatedStats.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L97)

Number of plenary sessions held

***

### politicalLandscape

> **politicalLandscape**: [`PoliticalLandscapeData`](PoliticalLandscapeData.md)

Defined in: [data/generatedStats.ts:125](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L125)

Political landscape snapshot for the year

***

### procedures

> **procedures**: `number`

Defined in: [data/generatedStats.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L113)

Legislative procedures tracked (get_procedures, get_procedure_events)

***

### resolutions

> **resolutions**: `number`

Defined in: [data/generatedStats.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L107)

Resolutions adopted

***

### rollCallVotes

> **rollCallVotes**: `number`

Defined in: [data/generatedStats.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L101)

Roll-call votes conducted

***

### speeches

> **speeches**: `number`

Defined in: [data/generatedStats.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L109)

Speeches delivered in plenary

***

### year

> **year**: `number`

Defined in: [data/generatedStats.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L91)

Calendar year (e.g. 2004)
