[**European Parliament MCP Server API v1.0.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/activities](../README.md) / MeetingActivity

# Interface: MeetingActivity

Defined in: [types/ep/activities.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L223)

Meeting activity linked to an EP plenary sitting.

Represents an individual activity item (debate, vote, presentation) within
a plenary sitting. Sourced from EP API `/meetings/{sitting-id}/activities` endpoint.

**Intelligence Perspective:** Activity-level granularity enables precise tracking of
plenary agenda items, time allocation analysis, and priority assessment.

**Business Perspective:** Activity-level data powers detailed meeting analytics
and agenda monitoring services for government affairs teams.

**Marketing Perspective:** Granular agenda tracking differentiates from competitors
offering only session-level data—key selling point for premium tiers.

**Data Source:** EP API `/meetings/{sitting-id}/activities` endpoint

**ISMS Policy:** SC-002 (Secure Coding Standards)

 MeetingActivity

## See

https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/activities

## Properties

### date

> **date**: `string`

Defined in: [types/ep/activities.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L231)

Activity date.

#### Example

```ts
"2024-03-15"
```

***

### id

> **id**: `string`

Defined in: [types/ep/activities.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L225)

Unique activity identifier.

#### Example

```ts
"act/MTG-PL-2024-001-01"
```

***

### order

> **order**: `number`

Defined in: [types/ep/activities.ts:233](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L233)

Activity order within the sitting.

#### Example

```ts
1
```

***

### reference

> **reference**: `string`

Defined in: [types/ep/activities.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L235)

Reference to related document or procedure.

#### Example

```ts
"A9-0001/2024"
```

***

### responsibleBody

> **responsibleBody**: `string`

Defined in: [types/ep/activities.ts:237](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L237)

Responsible body or committee.

#### Example

```ts
"IMCO"
```

***

### title

> **title**: `string`

Defined in: [types/ep/activities.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L227)

Activity title or description.

#### Example

```ts
"Debate on AI regulation"
```

***

### type

> **type**: `string`

Defined in: [types/ep/activities.ts:229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L229)

Type of activity.

#### Example

```ts
"DEBATE"
```
