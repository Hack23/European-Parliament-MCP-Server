[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalCompassAnalysis

# Interface: PoliticalCompassAnalysis

Defined in: [data/generatedStats.ts:180](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L180)

Multi-dimensional political compass analysis for the European Parliament.

## Properties

### authLibTension

> **authLibTension**: `number`

Defined in: [data/generatedStats.ts:192](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L192)

Authoritarian-libertarian tension: stdDev of social axis scores weighted by seats

***

### dominantQuadrant

> **dominantQuadrant**: [`PoliticalQuadrant`](../type-aliases/PoliticalQuadrant.md)

Defined in: [data/generatedStats.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L190)

Dominant quadrant by seat share

***

### economicPolarisation

> **economicPolarisation**: `number`

Defined in: [data/generatedStats.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L194)

Economic left-right polarisation: stdDev of economic axis scores weighted by seats

***

### euIntegrationDispersion

> **euIntegrationDispersion**: `number`

Defined in: [data/generatedStats.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L196)

EU integration consensus: stdDev of EU integration scores weighted by seats

***

### parliamentEconomicPosition

> **parliamentEconomicPosition**: `number`

Defined in: [data/generatedStats.ts:182](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L182)

Seat-share-weighted economic position (0 = far-left, 10 = far-right)

***

### parliamentEuPosition

> **parliamentEuPosition**: `number`

Defined in: [data/generatedStats.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L186)

Seat-share-weighted EU integration position (0 = eurosceptic, 10 = federalist)

***

### parliamentSocialPosition

> **parliamentSocialPosition**: `number`

Defined in: [data/generatedStats.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L184)

Seat-share-weighted social position (0 = libertarian, 10 = authoritarian)

***

### quadrantDistribution

> **quadrantDistribution**: [`QuadrantDistribution`](QuadrantDistribution.md)

Defined in: [data/generatedStats.ts:188](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L188)

Seat-share distribution across the four political compass quadrants (%)
