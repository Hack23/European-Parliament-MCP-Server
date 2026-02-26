[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/activities](../README.md) / EPEvent

# Interface: EPEvent

Defined in: [types/ep/activities.ts:182](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L182)

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

Defined in: [types/ep/activities.ts:188](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L188)

Event date in ISO 8601 format.

#### Example

```ts
"2024-06-15"
```

***

### endDate

> **endDate**: `string`

Defined in: [types/ep/activities.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L190)

Event end date (if multi-day).

#### Example

```ts
"2024-06-16"
```

***

### id

> **id**: `string`

Defined in: [types/ep/activities.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L184)

Unique event identifier.

#### Example

```ts
"event/EVT-2024-001"
```

***

### location

> **location**: `string`

Defined in: [types/ep/activities.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L194)

Event location.

#### Example

```ts
"Brussels"
```

***

### organizer

> **organizer**: `string`

Defined in: [types/ep/activities.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L196)

Organizing body.

#### Example

```ts
"IMCO"
```

***

### status

> **status**: `string`

Defined in: [types/ep/activities.ts:198](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L198)

Event status.

#### Example

```ts
"CONFIRMED"
```

***

### title

> **title**: `string`

Defined in: [types/ep/activities.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L186)

Event title.

#### Example

```ts
"Public hearing on AI Act implementation"
```

***

### type

> **type**: `string`

Defined in: [types/ep/activities.ts:192](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/activities.ts#L192)

Event type classification.

#### Example

```ts
"HEARING"
```
