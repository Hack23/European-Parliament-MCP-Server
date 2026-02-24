[**European Parliament MCP Server API v0.7.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / Speech

# Interface: Speech

Defined in: [types/europeanParliament.ts:2216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2216)

European Parliament Speech or speech-related activity.

Represents plenary speeches, debate contributions, written statements,
and proceeding activities. Sourced from EP API `/speeches` endpoint.

**Intelligence Perspective:** Speech data enables content analysis of MEP positions,
policy priorities, and rhetorical patterns—critical for influence assessment and
narrative tracking across plenary debates.

**Business Perspective:** Speech transcripts power NLP-based products, sentiment
analysis dashboards, and topic monitoring services for corporate affairs teams.

**Marketing Perspective:** Speech content creates high-engagement assets for
political monitoring platforms—debate highlights, speaker leaderboards, and
topic trend visualizations that drive user acquisition and retention.

**Data Source:** EP API `/speeches` endpoint

**ISMS Policy:** SC-002 (Secure Coding Standards), AU-002 (Audit Logging)

 Speech

## See

https://data.europarl.europa.eu/api/v2/speeches

## Properties

### date

> **date**: `string`

Defined in: [types/europeanParliament.ts:2234](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2234)

Date of the speech in ISO 8601 format.

#### Example

```ts
"2024-03-15"
```

***

### id

> **id**: `string`

Defined in: [types/europeanParliament.ts:2218](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2218)

Unique speech identifier from EP API.

#### Example

```ts
"speech/12345"
```

***

### language

> **language**: `string`

Defined in: [types/europeanParliament.ts:2238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2238)

Language of the speech.

#### Example

```ts
"en"
```

***

### sessionReference

> **sessionReference**: `string`

Defined in: [types/europeanParliament.ts:2242](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2242)

Reference to the plenary session or meeting.

#### Example

```ts
"event/MTG-PL-2024-03-15"
```

***

### speakerId

> **speakerId**: `string`

Defined in: [types/europeanParliament.ts:2226](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2226)

MEP or speaker identifier.

#### Gdpr

Personal data - MEP identifier requires audit logging per ISMS AU-002

#### Example

```ts
"person/124936"
```

***

### speakerName

> **speakerName**: `string`

Defined in: [types/europeanParliament.ts:2232](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2232)

Speaker name.

#### Gdpr

Personal data - name requires audit logging per ISMS AU-002

#### Example

```ts
"Jane Andersson"
```

***

### text

> **text**: `string`

Defined in: [types/europeanParliament.ts:2240](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2240)

Speech text content or summary (if available).

***

### title

> **title**: `string`

Defined in: [types/europeanParliament.ts:2220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2220)

Speech title or topic heading.

#### Example

```ts
"Debate on AI regulation"
```

***

### type

> **type**: `string`

Defined in: [types/europeanParliament.ts:2236](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L2236)

Type of speech activity.

#### Example

```ts
"DEBATE_SPEECH"
```
