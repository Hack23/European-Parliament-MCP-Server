[**European Parliament MCP Server API v0.9.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/activities](../README.md) / AdoptedText

# Interface: AdoptedText

Defined in: [types/ep/activities.ts:143](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L143)

European Parliament Adopted Text.

Represents a text adopted by the European Parliament, including legislative
resolutions, positions, and non-legislative resolutions. Sourced from EP API
`/adopted-texts` endpoint.

**Intelligence Perspective:** Adopted texts represent final legislative outputs—
tracking them enables assessment of legislative productivity, policy direction,
and political group influence on final outcomes.

**Business Perspective:** Adopted text monitoring powers regulatory compliance
products and legislative change management services.

**Marketing Perspective:** Adopted text tracking is a premium feature that
demonstrates comprehensive legislative coverage—ideal for enterprise sales
collateral and compliance-focused marketing campaigns.

**Data Source:** EP API `/adopted-texts` endpoint

**ISMS Policy:** SC-002 (Secure Coding Standards)

 AdoptedText

## See

https://data.europarl.europa.eu/api/v2/adopted-texts

## Properties

### dateAdopted

> **dateAdopted**: `string`

Defined in: [types/ep/activities.ts:153](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L153)

Date of adoption.

#### Example

```ts
"2024-03-13"
```

***

### id

> **id**: `string`

Defined in: [types/ep/activities.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L145)

Unique document identifier.

#### Example

```ts
"TA-9-2024-0001"
```

***

### procedureReference

> **procedureReference**: `string`

Defined in: [types/ep/activities.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L155)

Related legislative procedure reference.

#### Example

```ts
"2023/0123(COD)"
```

***

### reference

> **reference**: `string`

Defined in: [types/ep/activities.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L149)

Document reference number.

#### Example

```ts
"P9_TA(2024)0001"
```

***

### subjectMatter

> **subjectMatter**: `string`

Defined in: [types/ep/activities.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L157)

Subject matter or policy area.

#### Example

```ts
"Internal market"
```

***

### title

> **title**: `string`

Defined in: [types/ep/activities.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L147)

Title of the adopted text.

#### Example

```ts
"European Artificial Intelligence Act"
```

***

### type

> **type**: `string`

Defined in: [types/ep/activities.ts:151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L151)

Type of adopted text.

#### Example

```ts
"LEGISLATIVE_RESOLUTION"
```
