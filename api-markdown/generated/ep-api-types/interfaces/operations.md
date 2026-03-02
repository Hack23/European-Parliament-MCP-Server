[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [generated/ep-api-types](../README.md) / operations

# Interface: operations

Defined in: [generated/ep-api-types.ts:1886](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1886)

## Properties

### get\_active\_meps

> **get\_active\_meps**: `object`

Defined in: [generated/ep-api-types.ts:1973](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1973)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.country-of-representation?

> `optional` **country-of-representation**: (`"BE"` \| `"BG"` \| `"CZ"` \| `"DK"` \| `"DE"` \| `"EE"` \| `"IE"` \| `"EL"` \| `"ES"` \| `"FR"` \| `"HR"` \| `"IT"` \| `"CY"` \| `"LV"` \| `"LT"` \| `"LU"` \| `"HU"` \| `"MT"` \| `"NL"` \| `"AT"` \| `"PL"` \| `"PT"` \| `"RO"` \| `"SI"` \| `"SK"` \| `"FI"` \| `"SE"` \| `"UK"`)[]

###### Description

27 EU Member States and UK. Values are *ISO 3166-1 alpha-2* country codes.

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.gender?

> `optional` **gender**: (`"FEMALE"` \| `"MALE"` \| `"NAP"` \| `"NKN"` \| `"NST"`)[]

###### Description

Gender of the person. The non-exhaustive list of values includes concepts of the [human-sex](http://publications.europa.eu/resource/authority/human-sex) authority table maintained by the Publications Office of the European Union. .

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.mandate-date?

> `optional` **mandate-date**: `string`[]

###### Description

This parameter lets you specify a date to retrieve the list of Members of the European Parliament (MEPs) with an active mandate on that date. If no date is selected, the default date is today. The format of the value is *YYYY-MM-DD*.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.political-group?

> `optional` **political-group**: (`"ECR"` \| `"ID"` \| `"NI"` \| `"PPE"` \| `"S-D"` \| `"VERTS-ALE"` \| `"RENEW"` \| `"THE-LEFT"`)[]

###### Description

EP political groups.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_adopted\_texts

> **get\_adopted\_texts**: `object`

Defined in: [generated/ep-api-types.ts:3577](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3577)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.doc-id?

> `optional` **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.parliamentary-term?

> `optional` **parliamentary-term**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

###### Description

Parliamentary Term from 0 to the current.

##### parameters.query.related-doc-id?

> `optional` **related-doc-id**: `string`[]

###### Description

Related document identifier

##### parameters.query.related-process-id?

> `optional` **related-process-id**: `string`[]

###### Description

Related process identifier

##### parameters.query.related-process-type?

> `optional` **related-process-type**: (`"ACI"` \| `"APP"` \| `"AVC"` \| `"BUD"` \| `"CNS"` \| `"COD"` \| `"DEC"` \| `"NLE"` \| `"SYN"` \| `"BUI"` \| `"COS"` \| `"DEA"` \| `"DCE"` \| `"IMM"` \| `"INI"` \| `"INL"` \| `"INS"` \| `"REG"` \| `"RPS"` \| `"RSO"` \| `"RSP"` \| `"GBD"`)[]

###### Description

A type of the related process. Values are concepts of the EP Vocabulary [ep-procedure-types](https://data.europarl.europa.eu/def/ep-procedure-types.ttl).

##### parameters.query.search-language?

> `optional` **search-language**: (`"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

###### Description

Search language for free text search. If no language is selected, the default language is `en`

##### parameters.query.sitting-date?

> `optional` **sitting-date**: `string`

###### Description

Plenary sitting date (range start date). This parameter, together with `sitting-date-end`, defines the date range for the resource. Note: if only `sitting-date` is selected, the range will be limited to the same day. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.sitting-date-end?

> `optional` **sitting-date-end**: `string`

###### Description

Plenary sitting date end (range end date). This parameter, together with `sitting-date`, defines the date range for the resource. The format of the value is **YYYY-MM-DD**.

##### parameters.query.sort-by?

> `optional` **sort-by**: `string`[]

###### Description

Sorting parameter. The avaliable sorting parameters are: `sitting-date`, `date`, `doc-id` `search-score` The 2 possible orders are: `asc` for ascending and `desc` for descending. The input **MUST** have the following format: `{parameter}:{order}`. Example: `date:desc`

##### parameters.query.text?

> `optional` **text**: `string`

###### Description

A free text search in the content of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.title?

> `optional` **title**: `string`

###### Description

A free text search in the title of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.view?

> `optional` **view**: (`"uri"` \| `"adopted-texts-dsd"`)[]

###### Description

Response view.

##### parameters.query.work-type?

> `optional` **work-type**: (`"TEXT_ADOPTED"` \| `"BUDGET_EP_DRAFT"` \| `"AMENDMENT_BUDGET_EU_DRAFT"`)[]

###### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

##### parameters.query.year?

> `optional` **year**: `number`[]

###### Description

Year. The format of the values is **YYYY**.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_adopted\_texts\_by\_id

> **get\_adopted\_texts\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:3647](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3647)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_adopted\_texts\_feed

> **get\_adopted\_texts\_feed**: `object`

Defined in: [generated/ep-api-types.ts:3687](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3687)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.start-date?

> `optional` **start-date**: `string`

###### Description

Start date. This parameter defines the start date of a timeframe. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.timeframe?

> `optional` **timeframe**: `"custom"` \| `"today"` \| `"one-day"` \| `"one-week"` \| `"one-month"`

###### Description

The timeframe for the feed. To specify a custom timeframe, select `custom` from the list and use the parameter `start-date` . If no parameter is selected, the default timeframe is one month.

##### parameters.query.work-type?

> `optional` **work-type**: (`"TEXT_ADOPTED"` \| `"BUDGET_EP_DRAFT"` \| `"AMENDMENT_BUDGET_EU_DRAFT"`)[]

###### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_all\_decisions\_by\_event\_id

> **get\_all\_decisions\_by\_event\_id**: `object`

Defined in: [generated/ep-api-types.ts:2430](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2430)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.sitting-id

> **sitting-id**: `string`

###### Description

Sitting identifier. It refers to the ID of a Plenary sitting

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.filter-output?

> `optional` **filter-output**: `string`[]

###### Description

Content filter in the response

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"`

###### Description

Response format

##### parameters.query.json-layout?

> `optional` **json-layout**: `"framed-and-included"` \| `"framed"`

###### Description

Define the layaout for Json+ld

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.vote-method?

> `optional` **vote-method**: `string`[]

###### Description

Method of vote

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_bodies

> **get\_bodies**: `object`

Defined in: [generated/ep-api-types.ts:2193](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2193)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.body-classification?

> `optional` **body-classification**: (`"COMMITTEE_PARLIAMENTARY_STANDING"` \| `"COMMITTEE_PARLIAMENTARY_TEMPORARY"` \| `"COMMITTEE_PARLIAMENTARY_SPECIAL"` \| `"COMMITTEE_PARLIAMENTARY_SUB"` \| `"COMMITTEE_PARLIAMENTARY_JOINT"` \| `"EU_POLITICAL_GROUP"` \| `"DELEGATION_PARLIAMENTARY"` \| `"DELEGATION_PARLIAMENTARY_ASSEMBLY"` \| `"DELEGATION_JOINT_COMMITTEE"` \| `"NATIONAL_CHAMBER"` \| `"EU_INSTITUTION"` \| `"WORKING_GROUP"`)[]

###### Description

EP Corporate Body classification. Values are concepts of the EP Vocabulary [ep-entities](https://data.europarl.europa.eu/def/ep-entities.ttl).

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_body\_by\_id

> **get\_body\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:2268](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2268)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.body-id

> **body-id**: `string`

###### Description

Corporate Body identifier.

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_body\_feed

> **get\_body\_feed**: `object`

Defined in: [generated/ep-api-types.ts:2235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2235)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `undefined`

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_committee\_documents

> **get\_committee\_documents**: `object`

Defined in: [generated/ep-api-types.ts:3727](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3727)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.committee?

> `optional` **committee**: `string`[]

###### Description

EP Committees.

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.parliamentary-term?

> `optional` **parliamentary-term**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

###### Description

Parliamentary Term from 0 to the current.

##### parameters.query.work-type?

> `optional` **work-type**: (`"AGREEMENT_PROVISIONAL"` \| `"OPINION_PARLIAMENTARY_COMMITTEE_DRAFT"` \| `"OPINION_PARLIAMENTARY_COMMITTEE"` \| `"OPINION_LETTER_PARLIAMENTARY_COMMITTEE"` \| `"REPORT_PARLIAMENTARY_COMMITTEE_DRAFT"`)[]

###### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_committee\_documents\_by\_id

> **get\_committee\_documents\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:3773](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3773)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_committee\_documents\_feed

> **get\_committee\_documents\_feed**: `object`

Defined in: [generated/ep-api-types.ts:3811](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3811)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `undefined`

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_controlled\_vocabularies\_feed

> **get\_controlled\_vocabularies\_feed**: `object`

Defined in: [generated/ep-api-types.ts:4170](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L4170)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `undefined`

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_current\_bodies

> **get\_current\_bodies**: `object`

Defined in: [generated/ep-api-types.ts:2308](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2308)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_documents

> **get\_documents**: `object`

Defined in: [generated/ep-api-types.ts:3041](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3041)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.work-type?

> `optional` **work-type**: (`"QUESTION_TIME"` \| `"REPORT_PLENARY"` \| `"AMENDMENT_LIST"` \| `"RESOLUTION_MOTION"` \| `"TEXT_ADOPTED"` \| `"QUESTION_WRITTEN"` \| `"QUESTION_ORAL"` \| `"ANNEX"` \| `"CORRIGENDUM"` \| `"ERRATUM"` \| `"RESOLUTION_MOTION_JOINT"` \| `"AGENDA_PLENARY_WEEK"` \| `"AGENDA_PLENARY_DAY"` \| `"CRE_PLENARY"` \| `"MINUTES_PLENARY"` \| `"LIST_ATTEND_PLENARY"` \| `"VOTE_RESULTS_PLENARY"` \| `"VOTE_ROLLCALL_PLENARY"` \| `"INTERPELLATION_MAJOR"` \| `"INTERPELLATION_MINOR"` \| `"QUESTION_RESOLUTION_MOTION"` \| `"QUESTION_WRITTEN_PRIORITY"` \| `"QUESTION_WRITTEN_ANSWER"` \| `"INTERPELLATION_MINOR_WRITTEN_ANSWER"` \| `"AGREEMENT_PROVISIONAL"` \| `"OPINION_PARLIAMENTARY_COMMITTEE_DRAFT"` \| `"OPINION_PARLIAMENTARY_COMMITTEE"` \| `"OPINION_LETTER_PARLIAMENTARY_COMMITTEE"` \| `"REPORT_PARLIAMENTARY_COMMITTEE_DRAFT"` \| `"BUDGET_EP_DRAFT"` \| `"AMENDMENT_BUDGET_EU_DRAFT"`)[]

###### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_documents\_by\_id

> **get\_documents\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:3116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3116)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_documents\_feed

> **get\_documents\_feed**: `object`

Defined in: [generated/ep-api-types.ts:3083](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3083)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `undefined`

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_event\_by\_event\_id\_proc

> **get\_event\_by\_event\_id\_proc**: `object`

Defined in: [generated/ep-api-types.ts:3001](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3001)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.event-id

> **event-id**: `string`[]

###### Description

Event identifier

##### parameters.path.process-id

> **process-id**: `string`

###### Description

Process identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_events

> **get\_events**: `object`

Defined in: [generated/ep-api-types.ts:2608](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2608)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.activity-type?

> `optional` **activity-type**: (`"COMMITTEE_APPROVE_PROVISIONAL_AGREEMENT"` \| `"TABLING_PLENARY"` \| `"PLENARY_REFER_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS"` \| `"PLENARY_REJECT_COMMITTEE_INTERINSTUTIONAL_NEGOTIATIONS"` \| `"PLENARY_ENDORSE_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS"` \| `"SIGNATURE"` \| `"PUBLICATION_OFFICIAL_JOURNAL"` \| `"PLENARY_AMEND"` \| `"PLENARY_DECISION"` \| `"PLENARY_AMEND_COUNCIL_POSITION"` \| `"PLENARY_APPROVE_COUNCIL_POSITION"` \| `"PLENARY_REJECT_COUNCIL_POSITION"` \| `"PLENARY_ADOPT_POSITION"` \| `"PLENARY_AMEND_PROPOSAL"` \| `"PLENARY_SITTING"` \| `"PLENARY_PART_SESSION"` \| `"MEETING_PART"` \| `"PLENARY_PART_SESSION_DOSSIER"` \| `"PLENARY_DEBATE"` \| `"PLENARY_VOTE"` \| `"PLENARY_VOTE_URGENCY"` \| `"PLENARY_ACTIVITY"` \| `"PLENARY_VOTE_RESULTS"` \| `"PLENARY_OUTCOME"` \| `"REQUEST_VOTE_ROLLCALL"` \| `"REQUEST_VOTE_SPLIT"` \| `"REQUEST_VOTE_SEPARATE"` \| `"PLENARY_DEBATE_WRITTEN_STATEMENT"` \| `"PLENARY_DEBATE_SPEECH"` \| `"PLENARY_VOTE_EXPLANATIONS"`)[]

###### Description

A type of an Activity. Values are concepts of the EP Vocabulary [ep-activities](https://data.europarl.europa.eu/def/ep-activities.ttl). This is not an exhaustive list.

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_events\_by\_id

> **get\_events\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:2650](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2650)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.event-id

> **event-id**: `string`

###### Description

Event identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.json-layout?

> `optional` **json-layout**: `"framed-and-included"` \| `"framed"`

###### Description

Define the layaout for Json+ld

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_events\_by\_proc\_id

> **get\_events\_by\_proc\_id**: `object`

Defined in: [generated/ep-api-types.ts:2962](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2962)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.process-id

> **process-id**: `string`

###### Description

Process identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_events\_feed

> **get\_events\_feed**: `object`

Defined in: [generated/ep-api-types.ts:2690](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2690)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.activity-type?

> `optional` **activity-type**: (`"COMMITTEE_APPROVE_PROVISIONAL_AGREEMENT"` \| `"TABLING_PLENARY"` \| `"PLENARY_REFER_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS"` \| `"PLENARY_REJECT_COMMITTEE_INTERINSTUTIONAL_NEGOTIATIONS"` \| `"PLENARY_ENDORSE_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS"` \| `"SIGNATURE"` \| `"PUBLICATION_OFFICIAL_JOURNAL"` \| `"PLENARY_AMEND"` \| `"PLENARY_DECISION"` \| `"PLENARY_AMEND_COUNCIL_POSITION"` \| `"PLENARY_APPROVE_COUNCIL_POSITION"` \| `"PLENARY_REJECT_COUNCIL_POSITION"` \| `"PLENARY_ADOPT_POSITION"` \| `"PLENARY_AMEND_PROPOSAL"` \| `"PLENARY_SITTING"` \| `"PLENARY_PART_SESSION"` \| `"MEETING_PART"` \| `"PLENARY_PART_SESSION_DOSSIER"` \| `"PLENARY_DEBATE"` \| `"PLENARY_VOTE"` \| `"PLENARY_VOTE_URGENCY"` \| `"PLENARY_ACTIVITY"` \| `"PLENARY_VOTE_RESULTS"` \| `"PLENARY_OUTCOME"` \| `"REQUEST_VOTE_ROLLCALL"` \| `"REQUEST_VOTE_SPLIT"` \| `"REQUEST_VOTE_SEPARATE"` \| `"PLENARY_DEBATE_WRITTEN_STATEMENT"` \| `"PLENARY_DEBATE_SPEECH"` \| `"PLENARY_VOTE_EXPLANATIONS"`)[]

###### Description

A type of an Activity. Values are concepts of the EP Vocabulary [ep-activities](https://data.europarl.europa.eu/def/ep-activities.ttl). This is not an exhaustive list.

##### parameters.query.start-date?

> `optional` **start-date**: `string`

###### Description

Start date. This parameter defines the start date of a timeframe. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.timeframe?

> `optional` **timeframe**: `"custom"` \| `"today"` \| `"one-day"` \| `"one-week"` \| `"one-month"`

###### Description

The timeframe for the feed. To specify a custom timeframe, select `custom` from the list and use the parameter `start-date` . If no parameter is selected, the default timeframe is one month.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_external\_documents

> **get\_external\_documents**: `object`

Defined in: [generated/ep-api-types.ts:4010](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L4010)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.work-type?

> `optional` **work-type**: `"ACT_FOLLOWUP"`[]

###### Description

A type of a Work.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_external\_documents\_by\_id

> **get\_external\_documents\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:4052](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L4052)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_external\_documents\_feed

> **get\_external\_documents\_feed**: `object`

Defined in: [generated/ep-api-types.ts:4090](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L4090)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.start-date?

> `optional` **start-date**: `string`

###### Description

Start date. This parameter defines the start date of a timeframe. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.timeframe?

> `optional` **timeframe**: `"custom"` \| `"today"` \| `"one-day"` \| `"one-week"` \| `"one-month"`

###### Description

The timeframe for the feed. To specify a custom timeframe, select `custom` from the list and use the parameter `start-date` . If no parameter is selected, the default timeframe is one month.

##### parameters.query.work-type?

> `optional` **work-type**: `"ACT_FOLLOWUP"`[]

###### Description

A type of a Work.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_homonyms\_meps

> **get\_homonyms\_meps**: `object`

Defined in: [generated/ep-api-types.ts:2113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2113)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.parliamentary-term?

> `optional` **parliamentary-term**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

###### Description

Parliamentary Term from 0 to the current.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_incoming\_meps

> **get\_incoming\_meps**: `object`

Defined in: [generated/ep-api-types.ts:2021](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2021)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.country-of-representation?

> `optional` **country-of-representation**: (`"BE"` \| `"BG"` \| `"CZ"` \| `"DK"` \| `"DE"` \| `"EE"` \| `"IE"` \| `"EL"` \| `"ES"` \| `"FR"` \| `"HR"` \| `"IT"` \| `"CY"` \| `"LV"` \| `"LT"` \| `"LU"` \| `"HU"` \| `"MT"` \| `"NL"` \| `"AT"` \| `"PL"` \| `"PT"` \| `"RO"` \| `"SI"` \| `"SK"` \| `"FI"` \| `"SE"` \| `"UK"`)[]

###### Description

27 EU Member States and UK. Values are *ISO 3166-1 alpha-2* country codes.

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.gender?

> `optional` **gender**: (`"FEMALE"` \| `"MALE"` \| `"NAP"` \| `"NKN"` \| `"NST"`)[]

###### Description

Gender of the person. The non-exhaustive list of values includes concepts of the [human-sex](http://publications.europa.eu/resource/authority/human-sex) authority table maintained by the Publications Office of the European Union. .

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.political-group?

> `optional` **political-group**: (`"ECR"` \| `"ID"` \| `"NI"` \| `"PPE"` \| `"S-D"` \| `"VERTS-ALE"` \| `"RENEW"` \| `"THE-LEFT"`)[]

###### Description

EP political groups.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meetings

> **get\_meetings**: `object`

Defined in: [generated/ep-api-types.ts:2348](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2348)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.year?

> `optional` **year**: `number`[]

###### Description

Year. The format of the values is **YYYY**.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meetings\_activities

> **get\_meetings\_activities**: `object`

Defined in: [generated/ep-api-types.ts:2565](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2565)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.sitting-id

> **sitting-id**: `string`

###### Description

Sitting identifier. It refers to the ID of a Plenary sitting

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meetings\_by\_id

> **get\_meetings\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:2390](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2390)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.event-id

> **event-id**: `string`[]

###### Description

Event identifier. It refers to the ID of a Plenary session or a Plenary sitting .

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meetings\_foreseen\_activities

> **get\_meetings\_foreseen\_activities**: `object`

Defined in: [generated/ep-api-types.ts:2522](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2522)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.sitting-id

> **sitting-id**: `string`

###### Description

Sitting identifier. It refers to the ID of a Plenary sitting

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_mep\_by\_id

> **get\_mep\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:1935](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1935)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.mep-id

> **mep-id**: `number`

###### Description

MEP identifier.

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meps

> **get\_meps**: `object`

Defined in: [generated/ep-api-types.ts:1887](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1887)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.country-of-representation?

> `optional` **country-of-representation**: (`"BE"` \| `"BG"` \| `"CZ"` \| `"DK"` \| `"DE"` \| `"EE"` \| `"IE"` \| `"EL"` \| `"ES"` \| `"FR"` \| `"HR"` \| `"IT"` \| `"CY"` \| `"LV"` \| `"LT"` \| `"LU"` \| `"HU"` \| `"MT"` \| `"NL"` \| `"AT"` \| `"PL"` \| `"PT"` \| `"RO"` \| `"SI"` \| `"SK"` \| `"FI"` \| `"SE"` \| `"UK"`)[]

###### Description

27 EU Member States and UK. Values are *ISO 3166-1 alpha-2* country codes.

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.gender?

> `optional` **gender**: (`"FEMALE"` \| `"MALE"` \| `"NAP"` \| `"NKN"` \| `"NST"`)[]

###### Description

Gender of the person. The non-exhaustive list of values includes concepts of the [human-sex](http://publications.europa.eu/resource/authority/human-sex) authority table maintained by the Publications Office of the European Union. .

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.parliamentary-term?

> `optional` **parliamentary-term**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

###### Description

Parliamentary Term from 0 to the current.

##### parameters.query.political-group?

> `optional` **political-group**: (`"ECR"` \| `"ID"` \| `"NI"` \| `"PPE"` \| `"S-D"` \| `"VERTS-ALE"` \| `"RENEW"` \| `"THE-LEFT"`)[]

###### Description

EP political groups.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meps\_declarations

> **get\_meps\_declarations**: `object`

Defined in: [generated/ep-api-types.ts:3844](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3844)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.body-id?

> `optional` **body-id**: `string`[]

###### Description

Corporate Body identifier.

##### parameters.query.capacity-role?

> `optional` **capacity-role**: (`"PRESIDENT_VICE"` \| `"QUAESTOR"` \| `"RAPPORTEUR_SHADOW_OPINION"` \| `"MEMBER_NEGOTIATION_INTERINSTITUTIONAL"` \| `"CHAIR_DELEGATION"` \| `"CHAIR_VICE_DELEGATION"` \| `"MEMBER_DELEGATION_OFFICIAL"` \| `"CHAIR_COMMITTEE"` \| `"CHAIR_VICE_COMMITTEE"` \| `"RAPPORTEUR_SHADOW_REPORT"` \| `"RAPPORTEUR_OPINION"` \| `"RAPPORTEUR"`)[]

###### Description

Capacity Role

##### parameters.query.doc-id?

> `optional` **doc-id**: `string`[]

###### Description

Document identifier. For this type of document, the format of the values is as follows: `{document code}-{MEP identifier}-{date of signature of the document}-{a numerical identifier from 4-7 digits}`. Example: `DCI-197491-2024-07-19-123456`

##### parameters.query.dossier-id?

> `optional` **dossier-id**: `string`[]

###### Description

A unique identifier for a Dossier.

##### parameters.query.filter-output?

> `optional` **filter-output**: (`"current-version"` \| `"awareness-of-conflict"` \| `"no-awareness-of-conflict"`)[]

###### Description

Content filter in the response. This parameter allows the user to filter API results only for active declaration

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.parliamentary-term?

> `optional` **parliamentary-term**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

###### Description

Parliamentary Term from 0 to the current.

##### parameters.query.person-id?

> `optional` **person-id**: `number`[]

###### Description

A unique identifier for a Person.

##### parameters.query.provider-id?

> `optional` **provider-id**: `string`[]

###### Description

Provider identifier

##### parameters.query.related-process-id?

> `optional` **related-process-id**: `string`[]

###### Description

Related process identifier

##### parameters.query.related-process-type?

> `optional` **related-process-type**: (`"ACI"` \| `"APP"` \| `"AVC"` \| `"BUD"` \| `"CNS"` \| `"COD"` \| `"DEC"` \| `"NLE"` \| `"SYN"` \| `"BUI"` \| `"COS"` \| `"DEA"` \| `"DCE"` \| `"IMM"` \| `"INI"` \| `"INL"` \| `"INS"` \| `"REG"` \| `"RPS"` \| `"RSO"` \| `"RSP"` \| `"GBD"`)[]

###### Description

A type of the related process. Values are concepts of the EP Vocabulary [ep-procedure-types](https://data.europarl.europa.eu/def/ep-procedure-types.ttl).

##### parameters.query.search-language?

> `optional` **search-language**: (`"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

###### Description

Search language for free text search. If no language is selected, the default language is `en`

##### parameters.query.text?

> `optional` **text**: `string`

###### Description

A free text search in the content of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.title?

> `optional` **title**: `string`

###### Description

A free text search in the title of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.work-type?

> `optional` **work-type**: `"MEMBER_DECLARATION_INTEREST_CONFLICT"`[]

###### Description

A type of a Work.

##### parameters.query.year?

> `optional` **year**: `number`[]

###### Description

Year. The format of the values is **YYYY**.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

###### Description

OK

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### responses.200.content.application/ld+json.$defs

> **$defs**: `object`

##### responses.200.content.application/ld+json.$defs.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### responses.200.content.application/ld+json.$defs.container\_language

> **container\_language**: `object`

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.ContextClass

> **ContextClass**: `object`

ContextClass

##### responses.200.content.application/ld+json.$defs.ContextClass.@base

> **@base**: `string`

Format: uri

##### responses.200.content.application/ld+json.$defs.ContextClass.data

> **data**: `string`

##### responses.200.content.application/ld+json.$defs.ContextElement

> **ContextElement**: `string` \| \{ `@base`: `string`; `data`: `string`; \}

ContextElement

###### Type Declaration

`string`

\{ `@base`: `string`; `data`: `string`; \}

##### responses.200.content.application/ld+json.$defs.Expression

> **Expression**: `object`

##### responses.200.content.application/ld+json.$defs.Expression.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en
```

##### responses.200.content.application/ld+json.$defs.Expression.is\_embodied\_by

> **is\_embodied\_by**: `object`[]

is embodied by

##### responses.200.content.application/ld+json.$defs.Expression.language

> **language**: `string`

language
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Expression.title

> **title**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.Expression.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity

> **ForeseenCapacity**: `object`

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Hit

> **Hit**: `object`

Hit

##### responses.200.content.application/ld+json.$defs.Hit.id

> **id**: `string`

##### responses.200.content.application/ld+json.$defs.Manifestation

> **Manifestation**: `object`

##### responses.200.content.application/ld+json.$defs.Manifestation.byteSize

> **byteSize**: `string`

byte size
Format: integer

##### responses.200.content.application/ld+json.$defs.Manifestation.format

> **format**: `string`

format
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Manifestation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en/pdf
```

##### responses.200.content.application/ld+json.$defs.Manifestation.is\_exemplified\_by

> **is\_exemplified\_by**: `string`

is exemplified by

##### responses.200.content.application/ld+json.$defs.Manifestation.issued

> **issued**: `string`

issued
Format: date-time

##### responses.200.content.application/ld+json.$defs.Manifestation.media\_type

> **media\_type**: `string`

format
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Manifestation.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Meta

> **Meta**: `object`

Meta

##### responses.200.content.application/ld+json.$defs.Meta.total

> **total**: `number`

##### responses.200.content.application/ld+json.$defs.Participation

> **Participation**: `object`

##### responses.200.content.application/ld+json.$defs.Participation.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### responses.200.content.application/ld+json.$defs.Participation.had\_participant\_person

> **had\_participant\_person**: `string`[]

had participant person

##### responses.200.content.application/ld+json.$defs.Participation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/participation/DCI-197491-2024-07-19-123456-AUTHOR
```

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf

> **inCapacityOf**: `object`

in capacity of

###### Description

Please note that the naming of this property might change in the future (ELI Task Force decision is pending)

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.participation\_role

> **participation\_role**: `string`

participation role
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.SearchResults

> **SearchResults**: `object`

SearchResults

##### responses.200.content.application/ld+json.$defs.SearchResults.hits

> **hits**: `object`[]

##### responses.200.content.application/ld+json.$defs.Work-DCI

> **Work-DCI**: `object`

###### Description

This node shape represents a subset of eli:Work

##### responses.200.content.application/ld+json.$defs.Work-DCI.awarenessOfConflict

> **awarenessOfConflict**: `boolean`

awareness of conflict

##### responses.200.content.application/ld+json.$defs.Work-DCI.document\_date

> **document\_date**: `string`

date document
Format: date

##### responses.200.content.application/ld+json.$defs.Work-DCI.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-256902-2025-10-27-502107
```

##### responses.200.content.application/ld+json.$defs.Work-DCI.identifier

> **identifier**: `string`

identifier

##### responses.200.content.application/ld+json.$defs.Work-DCI.identifierYear

> **identifierYear**: `string`

identifier year

##### responses.200.content.application/ld+json.$defs.Work-DCI.is\_realized\_by

> **is\_realized\_by**: `object`[]

is realized by

##### responses.200.content.application/ld+json.$defs.Work-DCI.label

> **label**: `string`

label

##### responses.200.content.application/ld+json.$defs.Work-DCI.notation\_providerId

> **notation\_providerId**: `string`

data provider identifier

##### responses.200.content.application/ld+json.$defs.Work-DCI.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.publisher

> **publisher**: `string`

publisher
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.title\_dcterms

> **title\_dcterms**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.Work-DCI.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.work\_type

> **work\_type**: `string`

work type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.workHadParticipation

> **workHadParticipation**: `object`[]

work had participation

##### responses.200.content.application/ld+json.$defs.Work-DCI.alternative\_dcterms?

> `optional` **alternative\_dcterms**: `object`

alternative

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.Work-DCI.conflictDescription?

> `optional` **conflictDescription**: `string`

conflict description

###### Description

Present only is absenceOfConflict is false.

##### responses.200.content.application/ld+json.$defs.Work-DCI.inverse\_previousVersion?

> `optional` **inverse\_previousVersion**: `string`[]

inverse previous version

##### responses.200.content.application/ld+json.$defs.Work-DCI.notation\_dossierId?

> `optional` **notation\_dossierId**: `string`

dossier identifier

##### responses.200.content.application/ld+json.$defs.Work-DCI.previousVersion?

> `optional` **previousVersion**: `string`[]

previous version

##### responses.200.content.application/ld+json.$defs.Work-DCI.refers\_to?

> `optional` **refers\_to**: `string`[]

refers to

##### responses.200.content.application/ld+json.data

> **data**: `object`[]

##### responses.200.content.application/ld+json.meta?

> `optional` **meta**: `object`

##### responses.200.content.application/ld+json.meta.total

> **total**: `number`

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: `object`

##### responses.200.content.application/ld+json.searchResults.hits

> **hits**: `object`[]

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meps\_declarations\_by\_id

> **get\_meps\_declarations\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:3924](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3924)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

###### Description

OK

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### responses.200.content.application/ld+json.$defs

> **$defs**: `object`

##### responses.200.content.application/ld+json.$defs.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### responses.200.content.application/ld+json.$defs.container\_language

> **container\_language**: `object`

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.ContextClass

> **ContextClass**: `object`

ContextClass

##### responses.200.content.application/ld+json.$defs.ContextClass.@base

> **@base**: `string`

Format: uri

##### responses.200.content.application/ld+json.$defs.ContextClass.data

> **data**: `string`

##### responses.200.content.application/ld+json.$defs.ContextElement

> **ContextElement**: `string` \| \{ `@base`: `string`; `data`: `string`; \}

ContextElement

###### Type Declaration

`string`

\{ `@base`: `string`; `data`: `string`; \}

##### responses.200.content.application/ld+json.$defs.Expression

> **Expression**: `object`

##### responses.200.content.application/ld+json.$defs.Expression.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en
```

##### responses.200.content.application/ld+json.$defs.Expression.is\_embodied\_by

> **is\_embodied\_by**: `object`[]

is embodied by

##### responses.200.content.application/ld+json.$defs.Expression.language

> **language**: `string`

language
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Expression.title

> **title**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.Expression.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity

> **ForeseenCapacity**: `object`

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### responses.200.content.application/ld+json.$defs.ForeseenCapacity.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Hit

> **Hit**: `object`

Hit

##### responses.200.content.application/ld+json.$defs.Hit.id

> **id**: `string`

##### responses.200.content.application/ld+json.$defs.Manifestation

> **Manifestation**: `object`

##### responses.200.content.application/ld+json.$defs.Manifestation.byteSize

> **byteSize**: `string`

byte size
Format: integer

##### responses.200.content.application/ld+json.$defs.Manifestation.format

> **format**: `string`

format
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Manifestation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en/pdf
```

##### responses.200.content.application/ld+json.$defs.Manifestation.is\_exemplified\_by

> **is\_exemplified\_by**: `string`

is exemplified by

##### responses.200.content.application/ld+json.$defs.Manifestation.issued

> **issued**: `string`

issued
Format: date-time

##### responses.200.content.application/ld+json.$defs.Manifestation.media\_type

> **media\_type**: `string`

format
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Manifestation.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Meta

> **Meta**: `object`

Meta

##### responses.200.content.application/ld+json.$defs.Meta.total

> **total**: `number`

##### responses.200.content.application/ld+json.$defs.Participation

> **Participation**: `object`

##### responses.200.content.application/ld+json.$defs.Participation.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### responses.200.content.application/ld+json.$defs.Participation.had\_participant\_person

> **had\_participant\_person**: `string`[]

had participant person

##### responses.200.content.application/ld+json.$defs.Participation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/participation/DCI-197491-2024-07-19-123456-AUTHOR
```

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf

> **inCapacityOf**: `object`

in capacity of

###### Description

Please note that the naming of this property might change in the future (ELI Task Force decision is pending)

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### responses.200.content.application/ld+json.$defs.Participation.inCapacityOf.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.participation\_role

> **participation\_role**: `string`

participation role
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Participation.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.SearchResults

> **SearchResults**: `object`

SearchResults

##### responses.200.content.application/ld+json.$defs.SearchResults.hits

> **hits**: `object`[]

##### responses.200.content.application/ld+json.$defs.Work-DCI

> **Work-DCI**: `object`

###### Description

This node shape represents a subset of eli:Work

##### responses.200.content.application/ld+json.$defs.Work-DCI.awarenessOfConflict

> **awarenessOfConflict**: `boolean`

awareness of conflict

##### responses.200.content.application/ld+json.$defs.Work-DCI.document\_date

> **document\_date**: `string`

date document
Format: date

##### responses.200.content.application/ld+json.$defs.Work-DCI.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-256902-2025-10-27-502107
```

##### responses.200.content.application/ld+json.$defs.Work-DCI.identifier

> **identifier**: `string`

identifier

##### responses.200.content.application/ld+json.$defs.Work-DCI.identifierYear

> **identifierYear**: `string`

identifier year

##### responses.200.content.application/ld+json.$defs.Work-DCI.is\_realized\_by

> **is\_realized\_by**: `object`[]

is realized by

##### responses.200.content.application/ld+json.$defs.Work-DCI.label

> **label**: `string`

label

##### responses.200.content.application/ld+json.$defs.Work-DCI.notation\_providerId

> **notation\_providerId**: `string`

data provider identifier

##### responses.200.content.application/ld+json.$defs.Work-DCI.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.publisher

> **publisher**: `string`

publisher
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.title\_dcterms

> **title\_dcterms**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.Work-DCI.type

> **type**: `string`

type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.work\_type

> **work\_type**: `string`

work type
Format: iri-reference

##### responses.200.content.application/ld+json.$defs.Work-DCI.workHadParticipation

> **workHadParticipation**: `object`[]

work had participation

##### responses.200.content.application/ld+json.$defs.Work-DCI.alternative\_dcterms?

> `optional` **alternative\_dcterms**: `object`

alternative

###### Index Signature

\[`key`: `string`\]: `string`

##### responses.200.content.application/ld+json.$defs.Work-DCI.conflictDescription?

> `optional` **conflictDescription**: `string`

conflict description

###### Description

Present only is absenceOfConflict is false.

##### responses.200.content.application/ld+json.$defs.Work-DCI.inverse\_previousVersion?

> `optional` **inverse\_previousVersion**: `string`[]

inverse previous version

##### responses.200.content.application/ld+json.$defs.Work-DCI.notation\_dossierId?

> `optional` **notation\_dossierId**: `string`

dossier identifier

##### responses.200.content.application/ld+json.$defs.Work-DCI.previousVersion?

> `optional` **previousVersion**: `string`[]

previous version

##### responses.200.content.application/ld+json.$defs.Work-DCI.refers\_to?

> `optional` **refers\_to**: `string`[]

refers to

##### responses.200.content.application/ld+json.data

> **data**: `object`[]

##### responses.200.content.application/ld+json.meta?

> `optional` **meta**: `object`

##### responses.200.content.application/ld+json.meta.total

> **total**: `number`

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: `object`

##### responses.200.content.application/ld+json.searchResults.hits

> **hits**: `object`[]

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meps\_declarations\_feed

> **get\_meps\_declarations\_feed**: `object`

Defined in: [generated/ep-api-types.ts:3970](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3970)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.start-date?

> `optional` **start-date**: `string`

###### Description

Start date. This parameter defines the start date of a timeframe. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.timeframe?

> `optional` **timeframe**: `"custom"` \| `"today"` \| `"one-day"` \| `"one-week"` \| `"one-month"`

###### Description

The timeframe for the feed. To specify a custom timeframe, select `custom` from the list and use the parameter `start-date` . If no parameter is selected, the default timeframe is one month.

##### parameters.query.work-type?

> `optional` **work-type**: `"MEMBER_DECLARATION_INTEREST_CONFLICT"`[]

###### Description

A type of a Work.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_meps\_feed

> **get\_meps\_feed**: `object`

Defined in: [generated/ep-api-types.ts:2155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2155)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.start-date?

> `optional` **start-date**: `string`

###### Description

Start date. This parameter defines the start date of a timeframe. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.timeframe?

> `optional` **timeframe**: `"custom"` \| `"today"` \| `"one-day"` \| `"one-week"` \| `"one-month"`

###### Description

The timeframe for the feed. To specify a custom timeframe, select `custom` from the list and use the parameter `start-date` . If no parameter is selected, the default timeframe is one month.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_outgoing\_meps

> **get\_outgoing\_meps**: `object`

Defined in: [generated/ep-api-types.ts:2067](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2067)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.country-of-representation?

> `optional` **country-of-representation**: (`"BE"` \| `"BG"` \| `"CZ"` \| `"DK"` \| `"DE"` \| `"EE"` \| `"IE"` \| `"EL"` \| `"ES"` \| `"FR"` \| `"HR"` \| `"IT"` \| `"CY"` \| `"LV"` \| `"LT"` \| `"LU"` \| `"HU"` \| `"MT"` \| `"NL"` \| `"AT"` \| `"PL"` \| `"PT"` \| `"RO"` \| `"SI"` \| `"SK"` \| `"FI"` \| `"SE"` \| `"UK"`)[]

###### Description

27 EU Member States and UK. Values are *ISO 3166-1 alpha-2* country codes.

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.gender?

> `optional` **gender**: (`"FEMALE"` \| `"MALE"` \| `"NAP"` \| `"NKN"` \| `"NST"`)[]

###### Description

Gender of the person. The non-exhaustive list of values includes concepts of the [human-sex](http://publications.europa.eu/resource/authority/human-sex) authority table maintained by the Publications Office of the European Union. .

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.political-group?

> `optional` **political-group**: (`"ECR"` \| `"ID"` \| `"NI"` \| `"PPE"` \| `"S-D"` \| `"VERTS-ALE"` \| `"RENEW"` \| `"THE-LEFT"`)[]

###### Description

EP political groups.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_plenary\_docs

> **get\_plenary\_docs**: `object`

Defined in: [generated/ep-api-types.ts:3156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3156)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.work-type?

> `optional` **work-type**: (`"REPORT_PLENARY"` \| `"RESOLUTION_MOTION"` \| `"RESOLUTION_MOTION_JOINT"` \| `"QUESTION_RESOLUTION_MOTION"`)[]

###### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

##### parameters.query.year?

> `optional` **year**: `number`[]

###### Description

Year. The format of the values is **YYYY**.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_plenary\_docs\_by\_id

> **get\_plenary\_docs\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:3200](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3200)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_plenary\_docs\_feed

> **get\_plenary\_docs\_feed**: `object`

Defined in: [generated/ep-api-types.ts:3240](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3240)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `undefined`

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_plenary\_session\_documents\_items

> **get\_plenary\_session\_documents\_items**: `object`

Defined in: [generated/ep-api-types.ts:3507](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3507)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.doc-id?

> `optional` **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.include-output?

> `optional` **include-output**: `"xml_fragment"`[]

###### Description

Enrichment of the response content. `xml_fragment` parameter will include in the response content the text of the resource in xml structure.

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.parent-id?

> `optional` **parent-id**: `string`

###### Description

Identifier of the parent entity that this item is part of. This parameter filters out items that belong to a higher-level entity (e.g. a session week or a document).

##### parameters.query.parliamentary-term?

> `optional` **parliamentary-term**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

###### Description

Parliamentary Term from 0 to the current.

##### parameters.query.related-activity-type?

> `optional` **related-activity-type**: (`"PLENARY_DEBATE"` \| `"PLENARY_VOTE"` \| `"PLENARY_ACTIVITY"` \| `"PLENARY_VOTE_RESULTS"` \| `"PLENARY_OUTCOME"` \| `"PLENARY_DEBATE_WRITTEN_STATEMENT"` \| `"PLENARY_DEBATE_SPEECH"` \| `"PLENARY_VOTE_EXPLANATIONS"` \| `"PROCEEDING_ACTIVITY"`)[]

###### Description

A type of the related activity. Values are concepts of the EP Vocabulary [ep-event-types](https://data.europarl.europa.eu/def/ep-event-types.ttl).

##### parameters.query.related-work-type?

> `optional` **related-work-type**: (`"CRE_PLENARY"` \| `"MINUTES_PLENARY"` \| `"VOTE_RESULTS_PLENARY"` \| `"VOTE_ROLLCALL_PLENARY"`)[]

###### Description

A type of the related Work type. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

##### parameters.query.search-language?

> `optional` **search-language**: (`"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

###### Description

Search language for free text search. If no language is selected, the default language is `en`

##### parameters.query.sitting-date?

> `optional` **sitting-date**: `string`

###### Description

Plenary sitting date (range start date). This parameter, together with `sitting-date-end`, defines the date range for the resource. Note: if only `sitting-date` is selected, the range will be limited to the same day. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.sitting-date-end?

> `optional` **sitting-date-end**: `string`

###### Description

Plenary sitting date end (range end date). This parameter, together with `sitting-date`, defines the date range for the resource. The format of the value is **YYYY-MM-DD**.

##### parameters.query.sort-by?

> `optional` **sort-by**: `string`[]

###### Description

Sorting parameter. The avaliable sorting parameters are: `sitting-date`, `number`, `numbering`, `search-score` The 2 possible orders are: `asc` for ascending and `desc` for descending. The input **MUST** have the following format: `{parameter}:{order}`. Example: `date:desc`

##### parameters.query.subdivision-type?

> `optional` **subdivision-type**: (`"OTH"` \| `"ITM"`)[]

###### Description

A type of a Work Subdivision. The non-exhaustive list of values includes concepts of the [subdivision](http://publications.europa.eu/resource/authority/subdivision) authority table maintained by the Publications Office of the European Union.

##### parameters.query.text?

> `optional` **text**: `string`

###### Description

A free text search in the content of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.title?

> `optional` **title**: `string`

###### Description

A free text search in the title of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.year?

> `optional` **year**: `number`[]

###### Description

Year. The format of the values is **YYYY**.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_procedures

> **get\_procedures**: `object`

Defined in: [generated/ep-api-types.ts:2842](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2842)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.process-type?

> `optional` **process-type**: (`"ACI"` \| `"APP"` \| `"AVC"` \| `"BUD"` \| `"CNS"` \| `"COD"` \| `"DEC"` \| `"NLE"` \| `"SYN"` \| `"BUI"` \| `"COS"` \| `"DEA"` \| `"DCE"` \| `"IMM"` \| `"INI"` \| `"INL"` \| `"INS"` \| `"REG"` \| `"RPS"` \| `"RSO"` \| `"RSP"` \| `"GBD"`)[]

###### Description

A type of a Process. Values are concepts of the EP Vocabulary [ep-procedure-types](https://data.europarl.europa.eu/def/ep-procedure-types.ttl).

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_procedures\_by\_id

> **get\_procedures\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:2924](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2924)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.process-id

> **process-id**: `string`

###### Description

Process identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_procedures\_feed

> **get\_procedures\_feed**: `object`

Defined in: [generated/ep-api-types.ts:2884](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2884)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.process-type?

> `optional` **process-type**: (`"ACI"` \| `"APP"` \| `"AVC"` \| `"BUD"` \| `"CNS"` \| `"COD"` \| `"DEC"` \| `"NLE"` \| `"SYN"` \| `"BUI"` \| `"COS"` \| `"DEA"` \| `"DCE"` \| `"IMM"` \| `"INI"` \| `"INL"` \| `"INS"` \| `"REG"` \| `"RPS"` \| `"RSO"` \| `"RSP"` \| `"GBD"`)[]

###### Description

A type of a Process. Values are concepts of the EP Vocabulary [ep-procedure-types](https://data.europarl.europa.eu/def/ep-procedure-types.ttl).

##### parameters.query.start-date?

> `optional` **start-date**: `string`

###### Description

Start date. This parameter defines the start date of a timeframe. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.timeframe?

> `optional` **timeframe**: `"custom"` \| `"today"` \| `"one-day"` \| `"one-week"` \| `"one-month"`

###### Description

The timeframe for the feed. To specify a custom timeframe, select `custom` from the list and use the parameter `start-date` . If no parameter is selected, the default timeframe is one month.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_ps\_doc

> **get\_ps\_doc**: `object`

Defined in: [generated/ep-api-types.ts:3390](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3390)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.part-session-date?

> `optional` **part-session-date**: `string`[]

###### Description

Plenary Part-Session Date. This parameter refers to the date of the first day of a given part-session. Parliament sits monthly in Strasbourg in a four-day part-session (Monday to Thursday). Additional part-sessions are held in Brussels. The format of the value is **YYYY-MM-DD**.

##### parameters.query.work-type?

> `optional` **work-type**: (`"AGENDA_PLENARY_WEEK"` \| `"AGENDA_PLENARY_DAY"` \| `"CRE_PLENARY"` \| `"MINUTES_PLENARY"` \| `"LIST_ATTEND_PLENARY"` \| `"VOTE_RESULTS_PLENARY"` \| `"VOTE_ROLLCALL_PLENARY"`)[]

###### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_ps\_doc\_by\_id

> **get\_ps\_doc\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:3434](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3434)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_ps\_doc\_feed

> **get\_ps\_doc\_feed**: `object`

Defined in: [generated/ep-api-types.ts:3474](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3474)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `undefined`

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_questions

> **get\_questions**: `object`

Defined in: [generated/ep-api-types.ts:3273](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3273)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.work-type?

> `optional` **work-type**: (`"QUESTION_TIME"` \| `"QUESTION_WRITTEN"` \| `"QUESTION_ORAL"` \| `"INTERPELLATION_MAJOR"` \| `"INTERPELLATION_MINOR"` \| `"QUESTION_WRITTEN_PRIORITY"`)[]

###### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

##### parameters.query.year?

> `optional` **year**: `number`[]

###### Description

Year. The format of the values is **YYYY**.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_questions\_by\_id

> **get\_questions\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:3317](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3317)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.doc-id

> **doc-id**: `string`[]

###### Description

Document identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_questions\_feed

> **get\_questions\_feed**: `object`

Defined in: [generated/ep-api-types.ts:3357](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L3357)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `undefined`

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/atom+xml

> **application/atom+xml**: `object`

##### responses.200.content.application/atom+xml.author

> **author**: `object`

author

##### responses.200.content.application/atom+xml.author.name

> **name**: `string`

##### responses.200.content.application/atom+xml.entry

> **entry**: `object`

##### responses.200.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.entry.title

> **title**: `object`

##### responses.200.content.application/atom+xml.entry.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### responses.200.content.application/atom+xml.entry.category.label

> **label**: `string`

##### responses.200.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### responses.200.content.application/atom+xml.entry.category.term

> **term**: `string`

##### responses.200.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### responses.200.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### responses.200.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### responses.200.content.application/atom+xml.link

> **link**: `object`[]

##### responses.200.content.application/atom+xml.title

> **title**: `object`

##### responses.200.content.application/atom+xml.title.type

> **type**: `string`

##### responses.200.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### responses.200.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### responses.200.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### responses.200.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### responses.200.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### responses.200.content.application/atom+xml.subtitle.type

> **type**: `string`

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_speeches

> **get\_speeches**: `object`

Defined in: [generated/ep-api-types.ts:2730](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2730)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.activity-type?

> `optional` **activity-type**: (`"PLENARY_DEBATE_WRITTEN_STATEMENT"` \| `"PLENARY_DEBATE_SPEECH"` \| `"PROCEEDING_ACTIVITY"` \| `"MEETING_NAME_CHAIR"`)[]

###### Description

A type of an Activity. Values are concepts of the EP Vocabulary [ep-activities](https://data.europarl.europa.eu/def/ep-activities.ttl).

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.include-output?

> `optional` **include-output**: (`"xml_fragment"` \| `"highlighted_text"`)[]

###### Description

Enrichment of the response content. `xml_fragment` parameter will include in the response content the text of the resource in xml structure. `highlighted_text` will include in the response content the text of the resource in xml structure with the highlighted text that matches the search result. Users can select one on more parameters to include them in the response content.

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

##### parameters.query.parliamentary-term?

> `optional` **parliamentary-term**: (`9` \| `10`)[]

###### Description

Parliamentary Term limited to the 10th.

##### parameters.query.person-id?

> `optional` **person-id**: `number`[]

###### Description

A unique identifier for a Person.

##### parameters.query.search-language?

> `optional` **search-language**: (`"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

###### Description

Search language for free text search. If no language is selected, the default language is `en`

##### parameters.query.sitting-date?

> `optional` **sitting-date**: `string`

###### Description

Plenary sitting date (range start date). This parameter, together with `sitting-date-end`, defines the date range for the resource. Note: if only `sitting-date` is selected, the range will be limited to the same day. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

##### parameters.query.sitting-date-end?

> `optional` **sitting-date-end**: `string`

###### Description

Plenary sitting date end (range end date). This parameter, together with `sitting-date`, defines the date range for the resource. The format of the value is **YYYY-MM-DD**.

##### parameters.query.sort-by?

> `optional` **sort-by**: `string`[]

###### Description

Sorting parameter. The avaliable sorting parameters are: `sitting-date`, `number`, `numbering`, `video-start-time`, `search-score` The 2 possible orders are: `asc` for ascending and `desc` for descending. The input **MUST** have the following format: `{parameter}:{order}`. Example: `sitting-date:desc`

##### parameters.query.text?

> `optional` **text**: `string`

###### Description

A free text search in the content of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.title?

> `optional` **title**: `string`

###### Description

A free text search in the title of the resource. For language-specific results, use the parameter `search-language`.

##### parameters.query.video-end-time?

> `optional` **video-end-time**: `string`

###### Description

Video end time. (range end). This parameter refers to the video timestamp of a speech or a speech-related activity. Together with `video-start-time`, defines the time range for the plenary speeches videos. The format is *ISO 8601* timestamp. Example: `2024-05-08T11:04:03.399+02:00` .

##### parameters.query.video-start-time?

> `optional` **video-start-time**: `string`

###### Description

Video start time. (range start). This parameter refers to the video timestamp of a speech or a speech-related activity. Together with `video-end-time`, defines the time range for the plenary speeches videos. Note: if only `video-start-time` is selected, the range will be limited to the selected time only.  The format is *ISO 8601* timestamp. Example: `2024-05-08T11:04:03.399+02:00` .

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_speeches\_by\_id

> **get\_speeches\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:2796](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2796)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.speech-id

> **speech-id**: `string`

###### Description

Speech identifier.

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.include-output?

> `optional` **include-output**: (`"xml_fragment"` \| `"highlighted_text"`)[]

###### Description

Enrichment of the response content. `xml_fragment` parameter will include in the response content the text of the resource in xml structure. `highlighted_text` will include in the response content the text of the resource in xml structure with the highlighted text that matches the search result. Users can select one on more parameters to include them in the response content.

##### parameters.query.language?

> `optional` **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

###### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

##### parameters.query.search-language?

> `optional` **search-language**: (`"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

###### Description

Search language for free text search. If no language is selected, the default language is `en`

##### parameters.query.text?

> `optional` **text**: `string`

###### Description

A free text search in the content of the resource. For language-specific results, use the parameter `search-language`.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_vocabularies

> **get\_vocabularies**: `object`

Defined in: [generated/ep-api-types.ts:4130](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L4130)

#### parameters

> **parameters**: `object`

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.path?

> `optional` **path**: `undefined`

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_vocabularies\_by\_id

> **get\_vocabularies\_by\_id**: `object`

Defined in: [generated/ep-api-types.ts:4203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L4203)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.voc-id

> **voc-id**: `string`

###### Description

Vocabulary identifier

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

###### Description

Response format

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`

***

### get\_vote\_results

> **get\_vote\_results**: `object`

Defined in: [generated/ep-api-types.ts:2479](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L2479)

#### parameters

> **parameters**: `object`

##### parameters.path

> **path**: `object`

##### parameters.path.sitting-id

> **sitting-id**: `string`

###### Description

Sitting identifier. It refers to the ID of a Plenary sitting

##### parameters.cookie?

> `optional` **cookie**: `undefined`

##### parameters.header?

> `optional` **header**: `object`

##### parameters.header.User-Agent?

> `optional` **User-Agent**: `string`

###### Description

A User-Agent header identifying the user, environment, and version. <br>
    Suggested formats: <br>

    | Format                          | Examples                          |
    |----------------------------------|----------------------------------|
    | `{user-id}-{environment}-{version}` | `Project1-prd-1.0.0` `UNIresearch-dev-4.2.0`                  |
    <br>
    Including a recognizable project or organisation name helps us provide better
    production support and estimate reuser diversity (for platform monitoring and
    improvement reporting).
    To comply with [Regulation (EU) 2018/1725](https://eur-lex.europa.eu/eli/reg/2018/1725/oj), do **not** include non-public personal data (e.g., names or emails) in this parameter string. <br><br>
    **Note:** The use of at least the `user-id` is strongly recommended. <br>
    <br>

##### parameters.query?

> `optional` **query**: `object`

##### parameters.query.format?

> `optional` **format**: `"application/ld+json"`

###### Description

Response format

##### parameters.query.limit?

> `optional` **limit**: `number`

###### Description

The number of items to return.

##### parameters.query.offset?

> `optional` **offset**: `number`

###### Description

The number of items to skip before starting to collect the result set.

#### responses

> **responses**: `object`

##### responses.200

> **200**: `object`

##### responses.200.content

> **content**: `object`

##### responses.200.content.application/ld+json

> **application/ld+json**: `object`

##### responses.200.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### responses.200.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204

> **204**: `object`

##### responses.204.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.204.content?

> `optional` **content**: `undefined`

##### responses.404

> **404**: `object`

##### responses.404.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.404.content?

> `optional` **content**: `undefined`

##### responses.406

> **406**: `object`

##### responses.406.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.406.content?

> `optional` **content**: `undefined`

##### responses.500

> **500**: `object`

##### responses.500.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### responses.500.content?

> `optional` **content**: `undefined`

#### requestBody?

> `optional` **requestBody**: `undefined`
