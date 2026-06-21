[**European Parliament MCP Server API v1.3.26**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / AggregatedAttributions

# Interface: AggregatedAttributions

Defined in: [utils/effectivenessAggregator.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L57)

Deterministic ordering payload returned alongside the counts so callers
(tests, downstream tools) can audit which records contributed.

Lists are sorted by stable identifier ascending so two runs over the same
input produce identical output regardless of fetch order.

## Properties

### amendmentAdoptedDocumentIds

> **amendmentAdoptedDocumentIds**: `string`[]

Defined in: [utils/effectivenessAggregator.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L65)

Document IDs counted as adopted amendments, ascending.

***

### amendmentDocumentIds

> **amendmentDocumentIds**: `string`[]

Defined in: [utils/effectivenessAggregator.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L63)

Document IDs counted as amendments tabled, ascending.

***

### opinionProcedureIds

> **opinionProcedureIds**: `string`[]

Defined in: [utils/effectivenessAggregator.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L61)

Procedure IDs counted as opinions delivered, ascending.

***

### questionIds

> **questionIds**: `string`[]

Defined in: [utils/effectivenessAggregator.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L67)

Parliamentary question IDs counted, ascending.

***

### reportProcedureIds

> **reportProcedureIds**: `string`[]

Defined in: [utils/effectivenessAggregator.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L59)

Procedure IDs counted as reports authored, ascending.
