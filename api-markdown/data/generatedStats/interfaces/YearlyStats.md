[**European Parliament MCP Server API v1.3.6**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / YearlyStats

# Interface: YearlyStats

Defined in: [data/generatedStats.ts:271](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L271)

Aggregated annual statistics for a single calendar year of EP activity.

## Properties

### adoptedTexts

> **adoptedTexts**: `number`

Defined in: [data/generatedStats.ts:293](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L293)

Texts adopted (reports, opinions, etc.)

***

### commentary

> **commentary**: `string`

Defined in: [data/generatedStats.ts:309](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L309)

Notable events and key developments during the year

***

### committeeMeetings

> **committeeMeetings**: `number`

Defined in: [data/generatedStats.ts:285](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L285)

Committee meetings held

***

### declarations

> **declarations**: `number`

Defined in: [data/generatedStats.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L303)

MEP financial/interest declarations (get_mep_declarations)

***

### derivedIntelligence

> **derivedIntelligence**: [`DerivedIntelligenceMetrics`](DerivedIntelligenceMetrics.md)

Defined in: [data/generatedStats.ts:311](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L311)

OSINT-derived intelligence metrics computed from raw activity data

***

### documents

> **documents**: `number`

Defined in: [data/generatedStats.ts:299](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L299)

Total documents: plenary + committee + external (get_plenary_documents, get_committee_documents, get_external_documents)

***

### events

> **events**: `number`

Defined in: [data/generatedStats.ts:297](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L297)

Parliamentary events (get_events)

***

### legislativeActsAdopted

> **legislativeActsAdopted**: `number`

Defined in: [data/generatedStats.ts:281](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L281)

Legislative acts adopted

***

### mepCount

> **mepCount**: `number`

Defined in: [data/generatedStats.ts:277](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L277)

Total number of MEPs in office

***

### mepTurnover

> **mepTurnover**: `number`

Defined in: [data/generatedStats.ts:301](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L301)

MEP turnover: incoming + outgoing (get_incoming_meps, get_outgoing_meps)

***

### monthlyActivity

> **monthlyActivity**: [`MonthlyActivity`](MonthlyActivity.md)[]

Defined in: [data/generatedStats.ts:305](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L305)

Month-by-month activity breakdown (12 entries, Jan–Dec)

***

### parliamentaryQuestions

> **parliamentaryQuestions**: `number`

Defined in: [data/generatedStats.ts:287](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L287)

Parliamentary questions tabled

***

### parliamentaryTerm

> **parliamentaryTerm**: `string`

Defined in: [data/generatedStats.ts:275](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L275)

Parliamentary term identifier (e.g. 'EP6', 'EP9/EP10 transition')

***

### plenarySessions

> **plenarySessions**: `number`

Defined in: [data/generatedStats.ts:279](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L279)

Number of plenary sessions held

***

### politicalLandscape

> **politicalLandscape**: [`PoliticalLandscapeData`](PoliticalLandscapeData.md)

Defined in: [data/generatedStats.ts:307](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L307)

Political landscape snapshot for the year

***

### procedures

> **procedures**: `number`

Defined in: [data/generatedStats.ts:295](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L295)

Legislative procedures tracked (get_procedures, get_procedure_events)

***

### resolutions

> **resolutions**: `number`

Defined in: [data/generatedStats.ts:289](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L289)

Resolutions adopted

***

### rollCallVotes

> **rollCallVotes**: `number`

Defined in: [data/generatedStats.ts:283](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L283)

Roll-call votes conducted

***

### speeches

> **speeches**: `number`

Defined in: [data/generatedStats.ts:291](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L291)

Speeches delivered in plenary

***

### year

> **year**: `number`

Defined in: [data/generatedStats.ts:273](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L273)

Calendar year (e.g. 2004)
