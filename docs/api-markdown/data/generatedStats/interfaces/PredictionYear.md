[**European Parliament MCP Server API v1.3.11**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PredictionYear

# Interface: PredictionYear

Defined in: [data/generatedStats.ts:351](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L351)

Predicted activity metrics for a future year.

Values are computed using average-based extrapolation from the 2021–2025
baseline, adjusted by parliamentary term cycle factors that model the
typical ramp-up → peak → decline pattern within each five-year term.

## Properties

### confidenceInterval

> **confidenceInterval**: `string`

Defined in: [data/generatedStats.ts:381](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L381)

Confidence interval string (e.g. '±12%')

***

### methodology

> **methodology**: `string`

Defined in: [data/generatedStats.ts:383](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L383)

Description of the prediction methodology for this year

***

### predictedAdoptedTexts

> **predictedAdoptedTexts**: `number`

Defined in: [data/generatedStats.ts:369](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L369)

Predicted adopted texts

***

### predictedCommitteeMeetings

> **predictedCommitteeMeetings**: `number`

Defined in: [data/generatedStats.ts:361](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L361)

Predicted committee meetings

***

### predictedDeclarations

> **predictedDeclarations**: `number`

Defined in: [data/generatedStats.ts:379](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L379)

Predicted declarations

***

### predictedDocuments

> **predictedDocuments**: `number`

Defined in: [data/generatedStats.ts:375](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L375)

Predicted documents

***

### predictedEvents

> **predictedEvents**: `number`

Defined in: [data/generatedStats.ts:373](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L373)

Predicted events

***

### predictedLegislativeActs

> **predictedLegislativeActs**: `number`

Defined in: [data/generatedStats.ts:357](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L357)

Predicted legislative acts adopted

***

### predictedMepTurnover

> **predictedMepTurnover**: `number`

Defined in: [data/generatedStats.ts:377](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L377)

Predicted MEP turnover

***

### predictedParliamentaryQuestions

> **predictedParliamentaryQuestions**: `number`

Defined in: [data/generatedStats.ts:363](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L363)

Predicted parliamentary questions

***

### predictedPlenarySessions

> **predictedPlenarySessions**: `number`

Defined in: [data/generatedStats.ts:355](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L355)

Predicted plenary sessions

***

### predictedProcedures

> **predictedProcedures**: `number`

Defined in: [data/generatedStats.ts:371](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L371)

Predicted procedures

***

### predictedResolutions

> **predictedResolutions**: `number`

Defined in: [data/generatedStats.ts:365](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L365)

Predicted resolutions

***

### predictedRollCallVotes

> **predictedRollCallVotes**: `number`

Defined in: [data/generatedStats.ts:359](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L359)

Predicted roll-call votes

***

### predictedSpeeches

> **predictedSpeeches**: `number`

Defined in: [data/generatedStats.ts:367](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L367)

Predicted speeches

***

### year

> **year**: `number`

Defined in: [data/generatedStats.ts:353](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L353)

Predicted calendar year (2027–2031)
