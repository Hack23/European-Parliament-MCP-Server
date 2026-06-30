[**European Parliament MCP Server API v1.3.32**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / LegislativeMetrics

# Interface: LegislativeMetrics

Defined in: [utils/effectivenessAggregator.ts:32](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L32)

Effectiveness metrics computed from real EP data.

Each field is a count derived from a single EP API source; the
`legislativeSuccessRate` is the only derived ratio.

## Properties

### amendmentsAdopted

> **amendmentsAdopted**: `number`

Defined in: [utils/effectivenessAggregator.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L40)

Amendment-typed document items authored by the subject that reached an ADOPTED status.

***

### amendmentsTabled

> **amendmentsTabled**: `number`

Defined in: [utils/effectivenessAggregator.ts:38](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L38)

Plenary-session document items authored by the subject.

***

### legislativeSuccessRate

> **legislativeSuccessRate**: `number`

Defined in: [utils/effectivenessAggregator.ts:47](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L47)

Percentage of subject-attributed procedures that resulted in an
adopted text (0-100, two-decimal precision).

***

### opinionsDelivered

> **opinionsDelivered**: `number`

Defined in: [utils/effectivenessAggregator.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L36)

Procedures where the subject acts as shadow- or opinion-rapporteur.

***

### questionsAsked

> **questionsAsked**: `number`

Defined in: [utils/effectivenessAggregator.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L42)

Parliamentary questions filed by the subject.

***

### reportsAuthored

> **reportsAuthored**: `number`

Defined in: [utils/effectivenessAggregator.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L34)

Procedures where the subject appears as rapporteur.
