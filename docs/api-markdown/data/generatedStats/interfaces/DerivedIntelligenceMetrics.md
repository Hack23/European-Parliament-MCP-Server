[**European Parliament MCP Server API v1.3.39**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / DerivedIntelligenceMetrics

# Interface: DerivedIntelligenceMetrics

Defined in: [data/generatedStats.ts:201](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L201)

Derived OSINT intelligence metrics computed from raw EP activity data.

## Properties

### committeeToPlenaryRatio

> **committeeToPlenaryRatio**: `number`

Defined in: [data/generatedStats.ts:267](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L267)

Committee meetings per plenary session (preparatory work depth)

***

### debateIntensityPerSession

> **debateIntensityPerSession**: `number`

Defined in: [data/generatedStats.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L220)

Speeches per plenary session (debate intensity)

***

### declarationCoverageRatio

> **declarationCoverageRatio**: `number`

Defined in: [data/generatedStats.ts:253](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L253)

Declarations per MEP — transparency/accountability indicator

***

### documentBurdenPerAct

> **documentBurdenPerAct**: `number`

Defined in: [data/generatedStats.ts:213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L213)

Documents produced per legislative act adopted

***

### dominanceRatio

> **dominanceRatio**: `number`

Defined in: [data/generatedStats.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L231)

Largest group seat share / second-largest group seat share

***

### effectiveOppositionParties

> **effectiveOppositionParties**: `number`

Defined in: [data/generatedStats.ts:241](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L241)

Effective opposition parties: ENPP minus 1

***

### fragmentationVelocity

> **fragmentationVelocity**: `number` \| `null`

Defined in: [data/generatedStats.ts:258](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L258)

YoY change in ENPP (fragmentation velocity)

***

### grandCoalitionSurplusDeficit

> **grandCoalitionSurplusDeficit**: `number`

Defined in: [data/generatedStats.ts:237](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L237)

Top-2 groups combined seat share minus 50 (positive = surplus, negative = deficit)

***

### herfindahlHirschmanIndex

> **herfindahlHirschmanIndex**: `number`

Defined in: [data/generatedStats.ts:229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L229)

Herfindahl-Hirschman Index — standard market concentration metric

***

### institutionalMemoryRisk

> **institutionalMemoryRisk**: `"HIGH"` \| `"MEDIUM"` \| `"LOW"`

Defined in: [data/generatedStats.ts:251](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L251)

Institutional memory risk classification

***

### legislativeOutputChange

> **legislativeOutputChange**: `number` \| `null`

Defined in: [data/generatedStats.ts:256](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L256)

YoY percentage change in legislative acts adopted

***

### legislativeOutputPerMEP

> **legislativeOutputPerMEP**: `number`

Defined in: [data/generatedStats.ts:205](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L205)

Legislative acts adopted per MEP (per-capita productivity)

***

### legislativeOutputPerSession

> **legislativeOutputPerSession**: `number`

Defined in: [data/generatedStats.ts:203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L203)

Legislative acts adopted per plenary session

***

### majorityThresholdGap

> **majorityThresholdGap**: `number`

Defined in: [data/generatedStats.ts:233](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L233)

Percentage points the largest group is from 50% majority

***

### mepOversightIntensity

> **mepOversightIntensity**: `number`

Defined in: [data/generatedStats.ts:216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L216)

Parliamentary questions per MEP (oversight intensity)

***

### mepSpeechRate

> **mepSpeechRate**: `number`

Defined in: [data/generatedStats.ts:218](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L218)

Speeches per MEP (debate participation rate)

***

### mepStabilityIndex

> **mepStabilityIndex**: `number`

Defined in: [data/generatedStats.ts:247](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L247)

Stability index: 1 - (turnover / mepCount); below 0.5 = election year

***

### minimumWinningCoalitionSize

> **minimumWinningCoalitionSize**: `number`

Defined in: [data/generatedStats.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L235)

Fewest groups needed to form a majority (cumulative > 50%)

***

### nonAttachedShare

> **nonAttachedShare**: `number`

Defined in: [data/generatedStats.ts:239](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L239)

Non-attached (NI) members seat share (%) — parliamentary marginalization

***

### oversightPerSession

> **oversightPerSession**: `number`

Defined in: [data/generatedStats.ts:222](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L222)

Parliamentary questions per plenary session (oversight tempo)

***

### oversightToLegislationBalance

> **oversightToLegislationBalance**: `number`

Defined in: [data/generatedStats.ts:263](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L263)

Parliamentary questions per legislative act (oversight vs. lawmaking)

***

### politicalBlocAnalysis

> **politicalBlocAnalysis**: [`PoliticalBlocAnalysis`](PoliticalBlocAnalysis.md)

Defined in: [data/generatedStats.ts:244](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L244)

Political bloc analysis with left/centre/right seat shares

***

### procedureCompletionRate

> **procedureCompletionRate**: `number`

Defined in: [data/generatedStats.ts:209](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L209)

Fraction of procedures resulting in adopted legislation (%)

***

### questionsChange

> **questionsChange**: `number` \| `null`

Defined in: [data/generatedStats.ts:260](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L260)

YoY percentage change in parliamentary questions

***

### resolutionToLegislationRatio

> **resolutionToLegislationRatio**: `number`

Defined in: [data/generatedStats.ts:211](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L211)

Ratio of resolutions (non-binding) to legislative acts (binding)

***

### rollCallVoteYield

> **rollCallVoteYield**: `number`

Defined in: [data/generatedStats.ts:207](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L207)

Fraction of roll-call votes producing legislation (%)

***

### speechToVoteRatio

> **speechToVoteRatio**: `number`

Defined in: [data/generatedStats.ts:265](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L265)

Speeches per roll-call vote (debate intensity relative to decisions)

***

### topThreeGroupsConcentration

> **topThreeGroupsConcentration**: `number`

Defined in: [data/generatedStats.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L227)

Top-3 groups combined seat share (%) — minimum viable coalition

***

### topTwoGroupsConcentration

> **topTwoGroupsConcentration**: `number`

Defined in: [data/generatedStats.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L225)

Top-2 groups combined seat share (%) — grand coalition viability

***

### turnoverRate

> **turnoverRate**: `number`

Defined in: [data/generatedStats.ts:249](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L249)

Turnover rate as percentage of total MEPs
