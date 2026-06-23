[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalBlocAnalysis

# Interface: PoliticalBlocAnalysis

Defined in: [data/generatedStats.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L184)

Combined political balance analysis: 1D blocs + 2D compass + EU axis.

## Properties

### bipolarIndex

> **bipolarIndex**: `number`

Defined in: [data/generatedStats.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L194)

Bipolar index: (right - left) / (right + left); range -1 (left) to +1 (right)

***

### centreBlocShare

> **centreBlocShare**: `number`

Defined in: [data/generatedStats.ts:188](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L188)

Combined seat share of centre/liberal groups (ALDE, RE)

***

### euroscepticShare

> **euroscepticShare**: `number`

Defined in: [data/generatedStats.ts:192](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L192)

Combined seat share of far-right/eurosceptic groups (ID, PfE, ESN, etc.)

***

### leftBlocShare

> **leftBlocShare**: `number`

Defined in: [data/generatedStats.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L186)

Combined seat share of left-wing groups (S&D, GUE/NGL, Greens/EFA)

***

### politicalCompass

> **politicalCompass**: [`PoliticalCompassAnalysis`](PoliticalCompassAnalysis.md)

Defined in: [data/generatedStats.ts:197](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L197)

Three-axis political compass analysis (economic × social × EU integration)

***

### rightBlocShare

> **rightBlocShare**: `number`

Defined in: [data/generatedStats.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L190)

Combined seat share of centre-right + right groups (EPP, ECR, UEN, far-right)
