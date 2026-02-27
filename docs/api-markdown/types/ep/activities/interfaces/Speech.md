[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/activities](../README.md) / Speech

# Interface: Speech

Defined in: [types/ep/activities.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L35)

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

Defined in: [types/ep/activities.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L53)

Date of the speech in ISO 8601 format.

#### Example

```ts
"2024-03-15"
```

***

### id

> **id**: `string`

Defined in: [types/ep/activities.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L37)

Unique speech identifier from EP API.

#### Example

```ts
"speech/12345"
```

***

### language

> **language**: `string`

Defined in: [types/ep/activities.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L57)

Language of the speech.

#### Example

```ts
"en"
```

***

### sessionReference

> **sessionReference**: `string`

Defined in: [types/ep/activities.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L61)

Reference to the plenary session or meeting.

#### Example

```ts
"event/MTG-PL-2024-03-15"
```

***

### speakerId

> **speakerId**: `string`

Defined in: [types/ep/activities.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L45)

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

Defined in: [types/ep/activities.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L51)

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

Defined in: [types/ep/activities.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L59)

Speech text content or summary (if available).

***

### title

> **title**: `string`

Defined in: [types/ep/activities.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L39)

Speech title or topic heading.

#### Example

```ts
"Debate on AI regulation"
```

***

### type

> **type**: `string`

Defined in: [types/ep/activities.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/activities.ts#L55)

Type of speech activity.

#### Example

```ts
"DEBATE_SPEECH"
```
