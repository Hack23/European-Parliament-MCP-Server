[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/mep](../README.md) / MEP

# Interface: MEP

Defined in: [types/ep/mep.ts:10](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L10)

## Extended by

- [`MEPDetails`](MEPDetails.md)

## Properties

### active

> **active**: `boolean`

Defined in: [types/ep/mep.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L140)

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

Defined in: [types/ep/mep.ts:111](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L111)

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

Committee for committee details

***

### country

> **country**: `string`

Defined in: [types/ep/mep.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L50)

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

Defined in: [types/ep/mep.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L22)

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

Defined in: [types/ep/mep.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L35)

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

Defined in: [types/ep/mep.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L73)

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

Defined in: [types/ep/mep.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L156)

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

Defined in: [types/ep/mep.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L127)

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

Defined in: [types/ep/mep.ts:172](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/mep.ts#L172)

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
