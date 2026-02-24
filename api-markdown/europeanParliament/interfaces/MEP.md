[**European Parliament MCP Server API v0.7.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / MEP

# Interface: MEP

Defined in: [types/europeanParliament.ts:86](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L86)

Member of the European Parliament.

Contains biographical information, political affiliation, committee memberships,
and contact information for current and former MEPs. All dates in ISO 8601 format.
Personal data fields (email, phone, address) are GDPR-protected and require audit
logging for access per ISMS Policy AU-002.

**Data Source:** EP API `/meps` endpoint

**Identifiers:** MEP IDs follow format "person/{numeric-id}" and remain stable
across parliamentary terms to maintain historical continuity.

**Country Codes:** ISO 3166-1 alpha-2 format (e.g., "SE", "DE", "FR")

**Political Groups:** Abbreviations include EPP, S&D, Renew, Greens/EFA, ECR,
ID, The Left, NI (Non-Inscrits)

 MEP

## Examples

```typescript
const mep: MEP = {
  id: "person/124936",
  name: "Jane Marie Andersson",
  country: "SE",
  politicalGroup: "S&D",
  committees: ["DEVE", "ENVI"],
  email: "jane.andersson@europarl.europa.eu",
  active: true,
  termStart: "2019-07-02",
  termEnd: undefined
};
```

```typescript
// Former MEP with term end date
const formerMEP: MEP = {
  id: "person/100000",
  name: "John Smith",
  country: "UK",
  politicalGroup: "ECR",
  committees: ["AFET"],
  active: false,
  termStart: "2014-07-01",
  termEnd: "2020-01-31"
};
```

## See

 - [MEPDetails](MEPDetails.md) for extended biographical information
 - [Committee](Committee.md) for committee data structure
 - [VotingStatistics](VotingStatistics.md) for voting behavior analysis
 - https://data.europarl.europa.eu/en/developer-corner/opendata-api

## Gdpr

Contains personal data (email) - requires audit logging

## Extended by

- [`MEPDetails`](MEPDetails.md)

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
