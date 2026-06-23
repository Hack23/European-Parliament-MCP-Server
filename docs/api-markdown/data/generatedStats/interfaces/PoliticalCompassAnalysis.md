[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalCompassAnalysis

# Interface: PoliticalCompassAnalysis

Defined in: [data/generatedStats.ts:164](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L164)

Multi-dimensional political compass analysis for the European Parliament.

## Properties

### authLibTension

> **authLibTension**: `number`

Defined in: [data/generatedStats.ts:176](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L176)

Authoritarian-libertarian tension: stdDev of social axis scores weighted by seats

***

### dominantQuadrant

> **dominantQuadrant**: [`PoliticalQuadrant`](../type-aliases/PoliticalQuadrant.md)

Defined in: [data/generatedStats.ts:174](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L174)

Dominant quadrant by seat share

***

### economicPolarisation

> **economicPolarisation**: `number`

Defined in: [data/generatedStats.ts:178](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L178)

Economic left-right polarisation: stdDev of economic axis scores weighted by seats

***

### euIntegrationDispersion

> **euIntegrationDispersion**: `number`

Defined in: [data/generatedStats.ts:180](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L180)

EU integration consensus: stdDev of EU integration scores weighted by seats

***

### parliamentEconomicPosition

> **parliamentEconomicPosition**: `number`

Defined in: [data/generatedStats.ts:166](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L166)

Seat-share-weighted economic position (0 = far-left, 10 = far-right)

***

### parliamentEuPosition

> **parliamentEuPosition**: `number`

Defined in: [data/generatedStats.ts:170](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L170)

Seat-share-weighted EU integration position (0 = eurosceptic, 10 = federalist)

***

### parliamentSocialPosition

> **parliamentSocialPosition**: `number`

Defined in: [data/generatedStats.ts:168](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L168)

Seat-share-weighted social position (0 = libertarian, 10 = authoritarian)

***

### quadrantDistribution

> **quadrantDistribution**: [`QuadrantDistribution`](QuadrantDistribution.md)

Defined in: [data/generatedStats.ts:172](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L172)

Seat-share distribution across the four political compass quadrants (%)
