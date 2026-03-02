[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / YearlyStats

# Interface: YearlyStats

Defined in: [data/generatedStats.ts:296](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L296)

Aggregated annual statistics for a single calendar year of EP activity.

## Properties

### adoptedTexts

> **adoptedTexts**: `number`

Defined in: [data/generatedStats.ts:318](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L318)

Texts adopted (reports, opinions, etc.)

***

### commentary

> **commentary**: `string`

Defined in: [data/generatedStats.ts:334](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L334)

Notable events and key developments during the year

***

### committeeMeetings

> **committeeMeetings**: `number`

Defined in: [data/generatedStats.ts:310](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L310)

Committee meetings held

***

### declarations

> **declarations**: `number`

Defined in: [data/generatedStats.ts:328](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L328)

MEP financial/interest declarations (get_mep_declarations)

***

### derivedIntelligence

> **derivedIntelligence**: [`DerivedIntelligenceMetrics`](DerivedIntelligenceMetrics.md)

Defined in: [data/generatedStats.ts:336](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L336)

OSINT-derived intelligence metrics computed from raw activity data

***

### documents

> **documents**: `number`

Defined in: [data/generatedStats.ts:324](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L324)

Total documents: plenary + committee + external (get_plenary_documents, get_committee_documents, get_external_documents)

***

### events

> **events**: `number`

Defined in: [data/generatedStats.ts:322](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L322)

Parliamentary events (get_events)

***

### legislativeActsAdopted

> **legislativeActsAdopted**: `number`

Defined in: [data/generatedStats.ts:306](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L306)

Legislative acts adopted

***

### mepCount

> **mepCount**: `number`

Defined in: [data/generatedStats.ts:302](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L302)

Total number of MEPs in office

***

### mepTurnover

> **mepTurnover**: `number`

Defined in: [data/generatedStats.ts:326](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L326)

MEP turnover: incoming + outgoing (get_incoming_meps, get_outgoing_meps)

***

### monthlyActivity

> **monthlyActivity**: [`MonthlyActivity`](MonthlyActivity.md)[]

Defined in: [data/generatedStats.ts:330](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L330)

Month-by-month activity breakdown (12 entries, Jan–Dec)

***

### parliamentaryQuestions

> **parliamentaryQuestions**: `number`

Defined in: [data/generatedStats.ts:312](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L312)

Parliamentary questions tabled

***

### parliamentaryTerm

> **parliamentaryTerm**: `string`

Defined in: [data/generatedStats.ts:300](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L300)

Parliamentary term identifier (e.g. 'EP6', 'EP9/EP10 transition')

***

### plenarySessions

> **plenarySessions**: `number`

Defined in: [data/generatedStats.ts:304](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L304)

Number of plenary sessions held

***

### politicalLandscape

> **politicalLandscape**: [`PoliticalLandscapeData`](PoliticalLandscapeData.md)

Defined in: [data/generatedStats.ts:332](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L332)

Political landscape snapshot for the year

***

### procedures

> **procedures**: `number`

Defined in: [data/generatedStats.ts:320](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L320)

Legislative procedures tracked (get_procedures, get_procedure_events)

***

### resolutions

> **resolutions**: `number`

Defined in: [data/generatedStats.ts:314](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L314)

Resolutions adopted

***

### rollCallVotes

> **rollCallVotes**: `number`

Defined in: [data/generatedStats.ts:308](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L308)

Roll-call votes conducted

***

### speeches

> **speeches**: `number`

Defined in: [data/generatedStats.ts:316](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L316)

Speeches delivered in plenary

***

### year

> **year**: `number`

Defined in: [data/generatedStats.ts:298](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L298)

Calendar year (e.g. 2004)
