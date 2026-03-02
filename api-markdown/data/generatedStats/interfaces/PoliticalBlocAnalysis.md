[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalBlocAnalysis

# Interface: PoliticalBlocAnalysis

Defined in: [data/generatedStats.ts:200](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L200)

Combined political balance analysis: 1D blocs + 2D compass + EU axis.

## Properties

### bipolarIndex

> **bipolarIndex**: `number`

Defined in: [data/generatedStats.ts:211](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L211)

Bipolar index: (right - left) / (right + left); range -1 (left) to +1 (right)

***

### centreBlocShare

> **centreBlocShare**: `number`

Defined in: [data/generatedStats.ts:205](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L205)

Combined seat share of centre/liberal groups (ALDE, RE)

***

### euroscepticShare

> **euroscepticShare**: `number`

Defined in: [data/generatedStats.ts:209](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L209)

Combined seat share of far-right/eurosceptic groups (ID, PfE, ESN, etc.)

***

### leftBlocShare

> **leftBlocShare**: `number`

Defined in: [data/generatedStats.ts:203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L203)

Combined seat share of left-wing groups (S&D, GUE/NGL, Greens/EFA)

***

### politicalCompass

> **politicalCompass**: [`PoliticalCompassAnalysis`](PoliticalCompassAnalysis.md)

Defined in: [data/generatedStats.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L215)

Three-axis political compass analysis (economic × social × EU integration)

***

### rightBlocShare

> **rightBlocShare**: `number`

Defined in: [data/generatedStats.ts:207](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L207)

Combined seat share of centre-right + right groups (EPP, ECR, UEN, far-right)
