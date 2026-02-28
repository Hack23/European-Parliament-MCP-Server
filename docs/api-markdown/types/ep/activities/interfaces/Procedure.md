[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/activities](../README.md) / Procedure

# Interface: Procedure

Defined in: [types/ep/activities.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L87)

European Parliament Legislative Procedure.

Represents a legislative procedure tracked through the EP system,
including ordinary legislative procedures, consultations, and consent procedures.
Sourced from EP API `/procedures` endpoint.

**Intelligence Perspective:** Procedure data enables end-to-end legislative tracking,
outcome prediction, and timeline analysis—core intelligence product for policy monitoring.

**Business Perspective:** Procedure tracking powers legislative intelligence products,
regulatory risk assessments, and compliance early-warning systems.

**Marketing Perspective:** Procedure lifecycle dashboards and legislative progress
trackers are high-value features for enterprise positioning and premium tier upsells.

**Data Source:** EP API `/procedures` endpoint

**ISMS Policy:** SC-002 (Secure Coding Standards)

 Procedure

## See

https://data.europarl.europa.eu/api/v2/procedures

## Properties

### dateInitiated

> **dateInitiated**: `string`

Defined in: [types/ep/activities.ts:103](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L103)

Date the procedure was initiated.

#### Example

```ts
"2023-04-21"
```

***

### dateLastActivity

> **dateLastActivity**: `string`

Defined in: [types/ep/activities.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L105)

Date of latest activity.

#### Example

```ts
"2024-06-15"
```

***

### documents

> **documents**: `string`[]

Defined in: [types/ep/activities.ts:115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L115)

Associated documents.

***

### id

> **id**: `string`

Defined in: [types/ep/activities.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L89)

Unique procedure identifier.

#### Example

```ts
"COD/2023/0123"
```

***

### rapporteur

> **rapporteur**: `string`

Defined in: [types/ep/activities.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L113)

Rapporteur name (if assigned).

#### Gdpr

Personal data - MEP name requires audit logging per ISMS AU-002

#### Example

```ts
"Jane Andersson"
```

***

### reference

> **reference**: `string`

Defined in: [types/ep/activities.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L93)

Procedure reference number.

#### Example

```ts
"2023/0123(COD)"
```

***

### responsibleCommittee

> **responsibleCommittee**: `string`

Defined in: [types/ep/activities.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L107)

Responsible committee.

#### Example

```ts
"IMCO"
```

***

### stage

> **stage**: `string`

Defined in: [types/ep/activities.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L99)

Current stage of the procedure.

#### Example

```ts
"Awaiting Parliament's position in 1st reading"
```

***

### status

> **status**: `string`

Defined in: [types/ep/activities.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L101)

Current status.

#### Example

```ts
"Ongoing"
```

***

### subjectMatter

> **subjectMatter**: `string`

Defined in: [types/ep/activities.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L97)

Subject matter or policy domain.

#### Example

```ts
"Internal Market"
```

***

### title

> **title**: `string`

Defined in: [types/ep/activities.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L91)

Procedure title.

#### Example

```ts
"Regulation on Artificial Intelligence"
```

***

### type

> **type**: `string`

Defined in: [types/ep/activities.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L95)

Type of legislative procedure.

#### Example

```ts
"COD" (Ordinary Legislative Procedure)
```
