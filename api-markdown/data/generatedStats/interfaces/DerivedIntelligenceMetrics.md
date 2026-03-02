[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / DerivedIntelligenceMetrics

# Interface: DerivedIntelligenceMetrics

Defined in: [data/generatedStats.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L219)

Derived OSINT intelligence metrics computed from raw EP activity data.

## Properties

### committeeToPlenaryRatio

> **committeeToPlenaryRatio**: `number`

Defined in: [data/generatedStats.ts:292](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L292)

Committee meetings per plenary session (preparatory work depth)

***

### debateIntensityPerSession

> **debateIntensityPerSession**: `number`

Defined in: [data/generatedStats.ts:240](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L240)

Speeches per plenary session (debate intensity)

***

### declarationCoverageRatio

> **declarationCoverageRatio**: `number`

Defined in: [data/generatedStats.ts:276](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L276)

Declarations per MEP — transparency/accountability indicator

***

### documentBurdenPerAct

> **documentBurdenPerAct**: `number`

Defined in: [data/generatedStats.ts:232](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L232)

Documents produced per legislative act adopted

***

### dominanceRatio

> **dominanceRatio**: `number`

Defined in: [data/generatedStats.ts:252](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L252)

Largest group seat share / second-largest group seat share

***

### effectiveOppositionParties

> **effectiveOppositionParties**: `number`

Defined in: [data/generatedStats.ts:262](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L262)

Effective opposition parties: ENPP minus 1

***

### fragmentationVelocity

> **fragmentationVelocity**: `number` \| `null`

Defined in: [data/generatedStats.ts:282](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L282)

YoY change in ENPP (fragmentation velocity)

***

### grandCoalitionSurplusDeficit

> **grandCoalitionSurplusDeficit**: `number`

Defined in: [data/generatedStats.ts:258](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L258)

Top-2 groups combined seat share minus 50 (positive = surplus, negative = deficit)

***

### herfindahlHirschmanIndex

> **herfindahlHirschmanIndex**: `number`

Defined in: [data/generatedStats.ts:250](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L250)

Herfindahl-Hirschman Index — standard market concentration metric

***

### institutionalMemoryRisk

> **institutionalMemoryRisk**: `"HIGH"` \| `"MEDIUM"` \| `"LOW"`

Defined in: [data/generatedStats.ts:274](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L274)

Institutional memory risk classification

***

### legislativeOutputChange

> **legislativeOutputChange**: `number` \| `null`

Defined in: [data/generatedStats.ts:280](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L280)

YoY percentage change in legislative acts adopted

***

### legislativeOutputPerMEP

> **legislativeOutputPerMEP**: `number`

Defined in: [data/generatedStats.ts:224](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L224)

Legislative acts adopted per MEP (per-capita productivity)

***

### legislativeOutputPerSession

> **legislativeOutputPerSession**: `number`

Defined in: [data/generatedStats.ts:222](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L222)

Legislative acts adopted per plenary session

***

### majorityThresholdGap

> **majorityThresholdGap**: `number`

Defined in: [data/generatedStats.ts:254](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L254)

Percentage points the largest group is from 50% majority

***

### mepOversightIntensity

> **mepOversightIntensity**: `number`

Defined in: [data/generatedStats.ts:236](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L236)

Parliamentary questions per MEP (oversight intensity)

***

### mepSpeechRate

> **mepSpeechRate**: `number`

Defined in: [data/generatedStats.ts:238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L238)

Speeches per MEP (debate participation rate)

***

### mepStabilityIndex

> **mepStabilityIndex**: `number`

Defined in: [data/generatedStats.ts:270](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L270)

Stability index: 1 - (turnover / mepCount); below 0.5 = election year

***

### minimumWinningCoalitionSize

> **minimumWinningCoalitionSize**: `number`

Defined in: [data/generatedStats.ts:256](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L256)

Fewest groups needed to form a majority (cumulative > 50%)

***

### nonAttachedShare

> **nonAttachedShare**: `number`

Defined in: [data/generatedStats.ts:260](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L260)

Non-attached (NI) members seat share (%) — parliamentary marginalization

***

### oversightPerSession

> **oversightPerSession**: `number`

Defined in: [data/generatedStats.ts:242](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L242)

Parliamentary questions per plenary session (oversight tempo)

***

### oversightToLegislationBalance

> **oversightToLegislationBalance**: `number`

Defined in: [data/generatedStats.ts:288](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L288)

Parliamentary questions per legislative act (oversight vs. lawmaking)

***

### politicalBlocAnalysis

> **politicalBlocAnalysis**: [`PoliticalBlocAnalysis`](PoliticalBlocAnalysis.md)

Defined in: [data/generatedStats.ts:266](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L266)

Political bloc analysis with left/centre/right seat shares

***

### procedureCompletionRate

> **procedureCompletionRate**: `number`

Defined in: [data/generatedStats.ts:228](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L228)

Fraction of procedures resulting in adopted legislation (%)

***

### questionsChange

> **questionsChange**: `number` \| `null`

Defined in: [data/generatedStats.ts:284](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L284)

YoY percentage change in parliamentary questions

***

### resolutionToLegislationRatio

> **resolutionToLegislationRatio**: `number`

Defined in: [data/generatedStats.ts:230](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L230)

Ratio of resolutions (non-binding) to legislative acts (binding)

***

### rollCallVoteYield

> **rollCallVoteYield**: `number`

Defined in: [data/generatedStats.ts:226](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L226)

Fraction of roll-call votes producing legislation (%)

***

### speechToVoteRatio

> **speechToVoteRatio**: `number`

Defined in: [data/generatedStats.ts:290](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L290)

Speeches per roll-call vote (debate intensity relative to decisions)

***

### topThreeGroupsConcentration

> **topThreeGroupsConcentration**: `number`

Defined in: [data/generatedStats.ts:248](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L248)

Top-3 groups combined seat share (%) — minimum viable coalition

***

### topTwoGroupsConcentration

> **topTwoGroupsConcentration**: `number`

Defined in: [data/generatedStats.ts:246](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L246)

Top-2 groups combined seat share (%) — grand coalition viability

***

### turnoverRate

> **turnoverRate**: `number`

Defined in: [data/generatedStats.ts:272](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L272)

Turnover rate as percentage of total MEPs
