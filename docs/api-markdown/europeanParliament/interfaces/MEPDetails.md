[**European Parliament MCP Server API v0.7.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / MEPDetails

# Interface: MEPDetails

Defined in: [types/europeanParliament.ts:319](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L319)

Detailed MEP information including biography and social media.

Extends [MEP](MEP.md) with additional biographical information, contact details,
social media profiles, voting statistics, and parliamentary roles. This
interface represents the complete MEP profile available through the
EP API `/meps/{id}/details` endpoint.

**Personal Data:** Contains multiple GDPR-protected fields (phone, address)
requiring audit logging and data minimization practices.

**Caching:** Due to personal data, cache TTL should not exceed 15 minutes
per ISMS Policy DP-003 (Data Retention).

 MEPDetails

## Examples

```typescript
const mepDetails: MEPDetails = {
  // MEP base fields
  id: "person/124936",
  name: "Jane Marie Andersson",
  country: "SE",
  politicalGroup: "S&D",
  committees: ["DEVE", "ENVI"],
  email: "jane.andersson@europarl.europa.eu",
  active: true,
  termStart: "2019-07-02",
  
  // Extended fields
  biography: "Member of Parliament since 2019...",
  phone: "+32 2 28 45000",
  address: "European Parliament, Rue Wiertz 60, 1047 Brussels",
  website: "https://example.com",
  twitter: "@janeandersson",
  facebook: "jane.andersson.official",
  votingStatistics: {
    totalVotes: 1250,
    votesFor: 800,
    votesAgainst: 350,
    abstentions: 100,
    attendanceRate: 0.92
  },
  roles: ["Vice-Chair of DEVE Committee", "Member of ENVI Committee"]
};
```

```typescript
// Minimal details (all optional fields omitted)
const minimalDetails: MEPDetails = {
  id: "person/100000",
  name: "John Smith",
  country: "DE",
  politicalGroup: "EPP",
  committees: ["ECON"],
  active: true,
  termStart: "2024-07-16"
};
```

## See

 - [MEP](MEP.md) for base MEP interface
 - [VotingStatistics](VotingStatistics.md) for voting behavior metrics
 - https://data.europarl.europa.eu/api/v2/

## Gdpr

Contains personal data (phone, address) - requires audit logging

## Extends

- [`MEP`](MEP.md)

## Properties

### active

> **active**: `boolean`

Defined in: [types/europeanParliament.ts:216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L216)

Current active status.

Indicates if the MEP is currently serving in the European Parliament.
False for former MEPs or those who resigned/were replaced.

**EP API Field:** `active`

#### Examples

```ts
true  // Currently serving
```

```ts
false // Former MEP
```

#### Inherited from

[`MEP`](MEP.md).[`active`](MEP.md#active)

***

### committees

> **committees**: `string`[]

Defined in: [types/europeanParliament.ts:187](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L187)

Committee memberships.

Array of committee abbreviations where the MEP serves as member,
substitute, chair, or vice-chair. MEPs typically serve on 1-2
standing committees plus temporary committees/delegations.

**EP API Field:** `committeeRoles`

**Common Committees:**
- "AFET" - Foreign Affairs
- "DEVE" - Development
- "INTA" - International Trade
- "BUDG" - Budgets
- "CONT" - Budgetary Control
- "ECON" - Economic and Monetary Affairs
- "EMPL" - Employment and Social Affairs
- "ENVI" - Environment, Public Health and Food Safety
- "ITRE" - Industry, Research and Energy
- "IMCO" - Internal Market and Consumer Protection
- "TRAN" - Transport and Tourism
- "REGI" - Regional Development
- "AGRI" - Agriculture and Rural Development
- "PECH" - Fisheries
- "CULT" - Culture and Education
- "JURI" - Legal Affairs
- "LIBE" - Civil Liberties, Justice and Home Affairs
- "AFCO" - Constitutional Affairs
- "FEMM" - Women's Rights and Gender Equality
- "PETI" - Petitions

#### Examples

```ts
["DEVE", "ENVI"]
```

```ts
["ECON", "BUDG", "CONT"]
```

#### See

[Committee](Committee.md) for committee details

#### Inherited from

[`MEP`](MEP.md).[`committees`](MEP.md#committees)

***

### country

> **country**: `string`

Defined in: [types/europeanParliament.ts:126](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L126)

Country of representation.

ISO 3166-1 alpha-2 country code (2 uppercase letters).
Represents the EU member state the MEP represents.

**EP API Field:** `country`
**Validation:** Must match `/^[A-Z]{2}$/`

#### Examples

```ts
"SE" (Sweden)
```

```ts
"DE" (Germany)
```

```ts
"FR" (France)
```

#### Inherited from

[`MEP`](MEP.md).[`country`](MEP.md#country)

***

### id

> **id**: `string`

Defined in: [types/europeanParliament.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L98)

Unique MEP identifier.

Format: "person/{numeric-id}" or numeric string
Stable across parliamentary terms for historical tracking.

**EP API Field:** `identifier`

#### Examples

```ts
"person/124936"
```

```ts
"197789"
```

#### Inherited from

[`MEP`](MEP.md).[`id`](MEP.md#id)

***

### name

> **name**: `string`

Defined in: [types/europeanParliament.ts:111](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L111)

Full name in official format.

Format: "FirstName MiddleName(s) LastName"
May include titles in some cases.

**EP API Field:** `label`

#### Examples

```ts
"Jane Marie Andersson"
```

```ts
"Dr. Hans-Peter Schmidt"
```

#### Inherited from

[`MEP`](MEP.md).[`name`](MEP.md#name)

***

### politicalGroup

> **politicalGroup**: `string`

Defined in: [types/europeanParliament.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L149)

Political group affiliation.

Abbreviation of the political group in the European Parliament.
Groups may change during parliamentary terms due to realignments.

**EP API Field:** `politicalGroup`

**Common Values:**
- "EPP" - European People's Party (Christian Democrats)
- "S&D" - Progressive Alliance of Socialists and Democrats
- "Renew" - Renew Europe (Liberals)
- "Greens/EFA" - Greens/European Free Alliance
- "ECR" - European Conservatives and Reformists
- "ID" - Identity and Democracy
- "The Left" - The Left in the European Parliament
- "NI" - Non-Inscrits (Non-attached members)

#### Examples

```ts
"S&D"
```

```ts
"EPP"
```

#### Inherited from

[`MEP`](MEP.md).[`politicalGroup`](MEP.md#politicalgroup)

***

### termStart

> **termStart**: `string`

Defined in: [types/europeanParliament.ts:232](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L232)

Term start date.

Date when the MEP's term began in ISO 8601 format (YYYY-MM-DD).
For current MEPs, typically aligned with parliamentary term start.
For replacements, may be mid-term.

**EP API Field:** `termStart`
**Format:** ISO 8601 date (YYYY-MM-DD)
**Validation:** Must be valid date, typically after 1952-07-23 (first ECSC assembly)

#### Examples

```ts
"2019-07-02" // 9th parliamentary term start
```

```ts
"2024-07-16" // 10th parliamentary term start
```

#### Inherited from

[`MEP`](MEP.md).[`termStart`](MEP.md#termstart)

***

### address?

> `optional` **address**: `string`

Defined in: [types/europeanParliament.ts:365](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L365)

Official office address.

Primary office address, typically European Parliament Brussels or
Strasbourg location. May include building, floor, and office number.

**EP API Field:** `address`
**Format:** Multi-line address string

#### Examples

```ts
"European Parliament, Rue Wiertz 60, ASP 08E123, 1047 Brussels, Belgium"
```

```ts
"European Parliament, 1 Avenue du Président Robert Schuman, 67000 Strasbourg, France"
```

#### Gdpr

Personal data - requires audit logging per ISMS AU-002

***

### biography?

> `optional` **biography**: `string`

Defined in: [types/europeanParliament.ts:333](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L333)

Biographical information.

Free-text biography provided by the MEP or EP information service.
May include educational background, professional experience,
and political career highlights. Content may be in multiple languages.

**EP API Field:** `biography`
**Format:** Plain text or HTML (sanitize before display)
**Max Length:** Typically 500-2000 characters

#### Example

```ts
"Member of the European Parliament since 2019, focusing on development and environmental issues. Former municipal councillor (2010-2019)."
```

***

### email?

> `optional` **email**: `string`

Defined in: [types/europeanParliament.ts:203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L203)

Official European Parliament email address.

Standard format: firstname.lastname@europarl.europa.eu
Optional field as some MEPs may not have public email or may
have left office.

**EP API Field:** `email`
**Validation:** Must be valid email format

#### Example

```ts
"jane.andersson@europarl.europa.eu"
```

#### Gdpr

Personal data - requires audit logging per ISMS AU-002

#### Inherited from

[`MEP`](MEP.md).[`email`](MEP.md#email)

***

### facebook?

> `optional` **facebook**: `string`

Defined in: [types/europeanParliament.ts:410](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L410)

Facebook profile identifier.

Facebook profile username, page name, or numeric ID. May be
username (facebook.com/username) or numeric ID (facebook.com/12345).

**EP API Field:** `facebook`
**Format:** Username or numeric ID

#### Examples

```ts
"jane.andersson.official"
```

```ts
"100012345678901"
```

***

### phone?

> `optional` **phone**: `string`

Defined in: [types/europeanParliament.ts:349](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L349)

Contact phone number.

Primary office phone number, typically Brussels or Strasbourg office.
Format varies by country but usually includes country code.

**EP API Field:** `phone`
**Format:** International format recommended (e.g., +32 2 28 XXXXX)

#### Examples

```ts
"+32 2 28 45000" (Brussels)
```

```ts
"+33 3 88 17 5000" (Strasbourg)
```

#### Gdpr

Personal data - requires audit logging per ISMS AU-002

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [types/europeanParliament.ts:444](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L444)

Parliamentary roles and positions.

Array of official roles held within the European Parliament,
including committee positions, delegation memberships, and
special assignments. Roles are current as of data fetch.

**EP API Field:** `roles`

**Common Role Types:**
- Committee Chair/Vice-Chair
- Delegation Chair/Vice-Chair/Member
- Quaestor
- Vice-President of Parliament

#### Examples

```ts
["Vice-Chair of DEVE Committee", "Member of ENVI Committee", "Member of Delegation for relations with India"]
```

```ts
["Chair of FEMM Committee", "Quaestor"]
```

***

### termEnd?

> `optional` **termEnd**: `string`

Defined in: [types/europeanParliament.ts:248](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L248)

Term end date.

Date when the MEP's term ended in ISO 8601 format (YYYY-MM-DD).
Undefined for currently active MEPs. Set for former MEPs who
completed their term, resigned, or were replaced.

**EP API Field:** `termEnd`
**Format:** ISO 8601 date (YYYY-MM-DD)
**Validation:** Must be valid date after termStart if present

#### Examples

```ts
"2024-07-15" // End of 9th term
```

```ts
"2020-01-31" // Brexit date for UK MEPs
```

#### Inherited from

[`MEP`](MEP.md).[`termEnd`](MEP.md#termend)

***

### twitter?

> `optional` **twitter**: `string`

Defined in: [types/europeanParliament.ts:396](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L396)

Twitter/X handle.

Social media handle for Twitter/X platform (without @ prefix in data,
but typically displayed with @). Not validated against current platform
availability.

**EP API Field:** `twitter`
**Format:** Username without @ prefix
**Validation:** Alphanumeric and underscores, 1-15 characters

#### Examples

```ts
"janeandersson"
```

```ts
"Jane_Andersson_MEP"
```

***

### votingStatistics?

> `optional` **votingStatistics**: [`VotingStatistics`](VotingStatistics.md)

Defined in: [types/europeanParliament.ts:424](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L424)

Voting behavior statistics.

Aggregated statistics on the MEP's voting patterns including
attendance rate and vote distribution. Calculated from plenary
session roll-call votes.

**EP API Field:** `votingStatistics` (computed)
**Update Frequency:** Updated after each plenary session

#### See

[VotingStatistics](VotingStatistics.md) for detailed metrics

***

### website?

> `optional` **website**: `string`

Defined in: [types/europeanParliament.ts:380](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L380)

Personal or official website URL.

MEP's personal website, campaign site, or party profile page.
URL should be validated for HTTPS and accessibility.

**EP API Field:** `website`
**Format:** Full URL with protocol
**Validation:** Must be valid URL format

#### Examples

```ts
"https://www.janeanderson.eu"
```

```ts
"https://example-party.eu/members/jane-andersson"
```
