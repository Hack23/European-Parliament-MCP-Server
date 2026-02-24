[**European Parliament MCP Server API v0.6.2**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / MEPDeclaration

# Interface: MEPDeclaration

Defined in: [types/europeanParliament.ts:2444](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2444)

MEP Declaration (financial interests, activities, assets).

Represents declarations of financial interests filed by MEPs as required
by the Rules of Procedure. Sourced from EP API `/meps-declarations` endpoint.

**Intelligence Perspective:** Financial declarations enable conflict-of-interest
detection, lobbying pattern analysis, and transparency assessment for MEP profiling.

**Business Perspective:** Declaration data supports compliance monitoring products
and corporate governance risk assessment services.

**Marketing Perspective:** Transparency and anti-corruption features powered by
declaration data are compelling for NGO, academic, and media customer segments.

**Data Source:** EP API `/meps-declarations` endpoint

**ISMS Policy:** SC-002 (Secure Coding Standards), AU-002 (Audit Logging)

 MEPDeclaration

## Gdpr

Contains personal financial data - requires enhanced audit logging

## See

https://data.europarl.europa.eu/api/v2/meps-declarations

## Properties

### dateFiled

> **dateFiled**: `string`

Defined in: [types/europeanParliament.ts:2464](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2464)

Date the declaration was filed.

#### Example

```ts
"2024-01-15"
```

***

### id

> **id**: `string`

Defined in: [types/europeanParliament.ts:2446](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2446)

Unique declaration document identifier.

#### Example

```ts
"dec/2024/001"
```

***

### mepId

> **mepId**: `string`

Defined in: [types/europeanParliament.ts:2454](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2454)

MEP identifier who filed the declaration.

#### Gdpr

Personal data - MEP identifier requires audit logging per ISMS AU-002

#### Example

```ts
"person/124936"
```

***

### mepName

> **mepName**: `string`

Defined in: [types/europeanParliament.ts:2460](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2460)

MEP name.

#### Gdpr

Personal data - name requires audit logging per ISMS AU-002

#### Example

```ts
"Jane Andersson"
```

***

### status

> **status**: `string`

Defined in: [types/europeanParliament.ts:2466](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2466)

Declaration status.

#### Example

```ts
"PUBLISHED"
```

***

### title

> **title**: `string`

Defined in: [types/europeanParliament.ts:2448](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2448)

Declaration title.

#### Example

```ts
"Declaration of financial interests"
```

***

### type

> **type**: `string`

Defined in: [types/europeanParliament.ts:2462](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L2462)

Type of declaration.

#### Example

```ts
"FINANCIAL_INTERESTS"
```
