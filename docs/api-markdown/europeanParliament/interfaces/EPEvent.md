[**European Parliament MCP Server API v0.7.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / EPEvent

# Interface: EPEvent

Defined in: [types/europeanParliament.ts:2363](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2363)

European Parliament Event.

Represents EP events including hearings, conferences, seminars,
and institutional events. Sourced from EP API `/events` endpoint.

**Intelligence Perspective:** Event monitoring enables early detection of emerging
policy priorities and stakeholder engagement patterns.

**Business Perspective:** Event data powers calendar integration and stakeholder
engagement tracking products.

**Marketing Perspective:** Event calendars and hearing notifications are
high-engagement features that drive daily active usage and newsletter signups.

**Data Source:** EP API `/events` endpoint

**ISMS Policy:** SC-002 (Secure Coding Standards)

 EPEvent

## See

https://data.europarl.europa.eu/api/v2/events

## Properties

### date

> **date**: `string`

Defined in: [types/europeanParliament.ts:2369](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2369)

Event date in ISO 8601 format.

#### Example

```ts
"2024-06-15"
```

***

### endDate

> **endDate**: `string`

Defined in: [types/europeanParliament.ts:2371](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2371)

Event end date (if multi-day).

#### Example

```ts
"2024-06-16"
```

***

### id

> **id**: `string`

Defined in: [types/europeanParliament.ts:2365](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2365)

Unique event identifier.

#### Example

```ts
"event/EVT-2024-001"
```

***

### location

> **location**: `string`

Defined in: [types/europeanParliament.ts:2375](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2375)

Event location.

#### Example

```ts
"Brussels"
```

***

### organizer

> **organizer**: `string`

Defined in: [types/europeanParliament.ts:2377](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2377)

Organizing body.

#### Example

```ts
"IMCO"
```

***

### status

> **status**: `string`

Defined in: [types/europeanParliament.ts:2379](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2379)

Event status.

#### Example

```ts
"CONFIRMED"
```

***

### title

> **title**: `string`

Defined in: [types/europeanParliament.ts:2367](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2367)

Event title.

#### Example

```ts
"Public hearing on AI Act implementation"
```

***

### type

> **type**: `string`

Defined in: [types/europeanParliament.ts:2373](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2373)

Event type classification.

#### Example

```ts
"HEARING"
```
