[**European Parliament MCP Server API v0.6.2**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / MeetingActivity

# Interface: MeetingActivity

Defined in: [types/europeanParliament.ts:2404](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2404)

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

Defined in: [types/europeanParliament.ts:2412](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2412)

Activity date.

#### Example

```ts
"2024-03-15"
```

***

### id

> **id**: `string`

Defined in: [types/europeanParliament.ts:2406](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2406)

Unique activity identifier.

#### Example

```ts
"act/MTG-PL-2024-001-01"
```

***

### order

> **order**: `number`

Defined in: [types/europeanParliament.ts:2414](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2414)

Activity order within the sitting.

#### Example

```ts
1
```

***

### reference

> **reference**: `string`

Defined in: [types/europeanParliament.ts:2416](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2416)

Reference to related document or procedure.

#### Example

```ts
"A9-0001/2024"
```

***

### responsibleBody

> **responsibleBody**: `string`

Defined in: [types/europeanParliament.ts:2418](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2418)

Responsible body or committee.

#### Example

```ts
"IMCO"
```

***

### title

> **title**: `string`

Defined in: [types/europeanParliament.ts:2408](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2408)

Activity title or description.

#### Example

```ts
"Debate on AI regulation"
```

***

### type

> **type**: `string`

Defined in: [types/europeanParliament.ts:2410](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2410)

Type of activity.

#### Example

```ts
"DEBATE"
```
