[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PredictionYear

# Interface: PredictionYear

Defined in: [data/generatedStats.ts:167](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L167)

Predicted activity metrics for a future year.

Values are computed using average-based extrapolation from the 2021–2025
baseline, adjusted by parliamentary term cycle factors that model the
typical ramp-up → peak → decline pattern within each five-year term.

## Properties

### confidenceInterval

> **confidenceInterval**: `string`

Defined in: [data/generatedStats.ts:197](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L197)

Confidence interval string (e.g. '±12%')

***

### methodology

> **methodology**: `string`

Defined in: [data/generatedStats.ts:199](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L199)

Description of the prediction methodology for this year

***

### predictedAdoptedTexts

> **predictedAdoptedTexts**: `number`

Defined in: [data/generatedStats.ts:185](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L185)

Predicted adopted texts

***

### predictedCommitteeMeetings

> **predictedCommitteeMeetings**: `number`

Defined in: [data/generatedStats.ts:177](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L177)

Predicted committee meetings

***

### predictedDeclarations

> **predictedDeclarations**: `number`

Defined in: [data/generatedStats.ts:195](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L195)

Predicted declarations

***

### predictedDocuments

> **predictedDocuments**: `number`

Defined in: [data/generatedStats.ts:191](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L191)

Predicted documents

***

### predictedEvents

> **predictedEvents**: `number`

Defined in: [data/generatedStats.ts:189](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L189)

Predicted events

***

### predictedLegislativeActs

> **predictedLegislativeActs**: `number`

Defined in: [data/generatedStats.ts:173](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L173)

Predicted legislative acts adopted

***

### predictedMepTurnover

> **predictedMepTurnover**: `number`

Defined in: [data/generatedStats.ts:193](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L193)

Predicted MEP turnover

***

### predictedParliamentaryQuestions

> **predictedParliamentaryQuestions**: `number`

Defined in: [data/generatedStats.ts:179](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L179)

Predicted parliamentary questions

***

### predictedPlenarySessions

> **predictedPlenarySessions**: `number`

Defined in: [data/generatedStats.ts:171](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L171)

Predicted plenary sessions

***

### predictedProcedures

> **predictedProcedures**: `number`

Defined in: [data/generatedStats.ts:187](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L187)

Predicted procedures

***

### predictedResolutions

> **predictedResolutions**: `number`

Defined in: [data/generatedStats.ts:181](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L181)

Predicted resolutions

***

### predictedRollCallVotes

> **predictedRollCallVotes**: `number`

Defined in: [data/generatedStats.ts:175](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L175)

Predicted roll-call votes

***

### predictedSpeeches

> **predictedSpeeches**: `number`

Defined in: [data/generatedStats.ts:183](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L183)

Predicted speeches

***

### year

> **year**: `number`

Defined in: [data/generatedStats.ts:169](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L169)

Predicted calendar year (2026–2030)
