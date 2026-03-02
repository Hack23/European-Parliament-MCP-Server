[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [generated/ep-api-types](../README.md) / components

# Interface: components

Defined in: [generated/ep-api-types.ts:1115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1115)

## Properties

### headers

> **headers**: `never`

Defined in: [generated/ep-api-types.ts:1882](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1882)

***

### parameters

> **parameters**: `object`

Defined in: [generated/ep-api-types.ts:1719](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1719)

#### activity-type

> **activity-type**: (`"COMMITTEE_APPROVE_PROVISIONAL_AGREEMENT"` \| `"TABLING_PLENARY"` \| `"PLENARY_REFER_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS"` \| `"PLENARY_REJECT_COMMITTEE_INTERINSTUTIONAL_NEGOTIATIONS"` \| `"PLENARY_ENDORSE_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS"` \| `"SIGNATURE"` \| `"PUBLICATION_OFFICIAL_JOURNAL"` \| `"PLENARY_AMEND"` \| `"PLENARY_DECISION"` \| `"PLENARY_AMEND_COUNCIL_POSITION"` \| `"PLENARY_APPROVE_COUNCIL_POSITION"` \| `"PLENARY_REJECT_COUNCIL_POSITION"` \| `"PLENARY_ADOPT_POSITION"` \| `"PLENARY_AMEND_PROPOSAL"` \| `"PLENARY_SITTING"` \| `"PLENARY_PART_SESSION"` \| `"MEETING_PART"` \| `"PLENARY_PART_SESSION_DOSSIER"` \| `"PLENARY_DEBATE"` \| `"PLENARY_VOTE"` \| `"PLENARY_VOTE_URGENCY"` \| `"PLENARY_ACTIVITY"` \| `"PLENARY_VOTE_RESULTS"` \| `"PLENARY_OUTCOME"` \| `"REQUEST_VOTE_ROLLCALL"` \| `"REQUEST_VOTE_SPLIT"` \| `"REQUEST_VOTE_SEPARATE"` \| `"PLENARY_DEBATE_WRITTEN_STATEMENT"` \| `"PLENARY_DEBATE_SPEECH"` \| `"PLENARY_VOTE_EXPLANATIONS"`)[]

##### Description

A type of an Activity. Values are concepts of the EP Vocabulary [ep-activities](https://data.europarl.europa.eu/def/ep-activities.ttl). This is not an exhaustive list.

#### body-classification

> **body-classification**: (`"COMMITTEE_PARLIAMENTARY_STANDING"` \| `"COMMITTEE_PARLIAMENTARY_TEMPORARY"` \| `"COMMITTEE_PARLIAMENTARY_SPECIAL"` \| `"COMMITTEE_PARLIAMENTARY_SUB"` \| `"COMMITTEE_PARLIAMENTARY_JOINT"` \| `"EU_POLITICAL_GROUP"` \| `"DELEGATION_PARLIAMENTARY"` \| `"DELEGATION_PARLIAMENTARY_ASSEMBLY"` \| `"DELEGATION_JOINT_COMMITTEE"` \| `"NATIONAL_CHAMBER"` \| `"EU_INSTITUTION"` \| `"WORKING_GROUP"`)[]

##### Description

EP Corporate Body classification. Values are concepts of the EP Vocabulary [ep-entities](https://data.europarl.europa.eu/def/ep-entities.ttl).

#### body-id

> **body-id**: `string`

##### Description

Corporate Body identifier.

#### body-id-optional

> **body-id-optional**: `string`[]

##### Description

Corporate Body identifier.

#### capacity-role

> **capacity-role**: (`"PRESIDENT_VICE"` \| `"QUAESTOR"` \| `"RAPPORTEUR_SHADOW_OPINION"` \| `"MEMBER_NEGOTIATION_INTERINSTITUTIONAL"` \| `"CHAIR_DELEGATION"` \| `"CHAIR_VICE_DELEGATION"` \| `"MEMBER_DELEGATION_OFFICIAL"` \| `"CHAIR_COMMITTEE"` \| `"CHAIR_VICE_COMMITTEE"` \| `"RAPPORTEUR_SHADOW_REPORT"` \| `"RAPPORTEUR_OPINION"` \| `"RAPPORTEUR"`)[]

##### Description

Capacity Role

#### committee

> **committee**: `string`[]

##### Description

EP Committees.

#### country-of-representation

> **country-of-representation**: (`"BE"` \| `"BG"` \| `"CZ"` \| `"DK"` \| `"DE"` \| `"EE"` \| `"IE"` \| `"EL"` \| `"ES"` \| `"FR"` \| `"HR"` \| `"IT"` \| `"CY"` \| `"LV"` \| `"LT"` \| `"LU"` \| `"HU"` \| `"MT"` \| `"NL"` \| `"AT"` \| `"PL"` \| `"PT"` \| `"RO"` \| `"SI"` \| `"SK"` \| `"FI"` \| `"SE"` \| `"UK"`)[]

##### Description

27 EU Member States and UK. Values are *ISO 3166-1 alpha-2* country codes.

#### doc-id

> **doc-id**: `string`[]

##### Description

Document identifier

#### dossier-id

> **dossier-id**: `string`[]

##### Description

A unique identifier for a Dossier.

#### end-date

> **end-date**: `string`

##### Description

Range end date. This parameter, together with `start-date`, defines the date range for the resource. The format of the value is **YYYY-MM-DD**.

#### event-id

> **event-id**: `string`

##### Description

Event identifier

#### filter-output

> **filter-output**: `string`[]

##### Description

Content filter in the response

#### filter-output-bodies

> **filter-output-bodies**: (`"constitutive-body"` \| `"operational-body"`)[]

##### Description

Content filter in the response. This parameter allows the user to filter the API result for

#### filter-output-meps-declarations

> **filter-output-meps-declarations**: (`"current-version"` \| `"awareness-of-conflict"` \| `"no-awareness-of-conflict"`)[]

##### Description

Content filter in the response. This parameter allows the user to filter API results only for active declaration

#### format-all

> **format-all**: `"application/ld+json"` \| `"application/rdf+xml"` \| `"text/turtle"`

##### Description

Response format

#### format-json

> **format-json**: `"application/ld+json"`

##### Description

Response format

#### gender

> **gender**: (`"FEMALE"` \| `"MALE"` \| `"NAP"` \| `"NKN"` \| `"NST"`)[]

##### Description

Gender of the person. The non-exhaustive list of values includes concepts of the [human-sex](http://publications.europa.eu/resource/authority/human-sex) authority table maintained by the Publications Office of the European Union. .

#### include-output

> **include-output**: (`"xml_fragment"` \| `"highlighted_text"`)[]

##### Description

Enrichment of the response content. `xml_fragment` parameter will include in the response content the text of the resource in xml structure. `highlighted_text` will include in the response content the text of the resource in xml structure with the highlighted text that matches the search result. Users can select one on more parameters to include them in the response content.

#### include-output-xml-fragment

> **include-output-xml-fragment**: `"xml_fragment"`[]

##### Description

Enrichment of the response content. `xml_fragment` parameter will include in the response content the text of the resource in xml structure.

#### json-layout-all

> **json-layout-all**: `"framed-and-included"` \| `"framed"`

##### Description

Define the layaout for Json+ld

#### language

> **language**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

##### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### language-filter

> **language-filter**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

##### Description

Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU + `mul` that refers to resources in multiple languages. If no language parameter is selected, the service will return results in all the available languages.

#### limit

> **limit**: `number`

##### Description

The number of items to return.

#### limit50

> **limit50**: `number`

##### Description

The number of items to return.

#### mandate-date

> **mandate-date**: `string`[]

##### Description

This parameter lets you specify a date to retrieve the list of Members of the European Parliament (MEPs) with an active mandate on that date. If no date is selected, the default date is today. The format of the value is *YYYY-MM-DD*.

#### mep-id

> **mep-id**: `number`

##### Description

MEP identifier.

#### mep-id-optional

> **mep-id-optional**: `number`[]

##### Description

MEP identifier.

#### offset

> **offset**: `number`

##### Description

The number of items to skip before starting to collect the result set.

#### original-language

> **original-language**: (`"en"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

##### Description

Original Language of the resource. Values are *ISO 639-1* language codes identifying the 24 official languages of the EU. If no language parameter is selected, the service will return results in all the available languages.

#### parent-id

> **parent-id**: `string`

##### Description

Identifier of the parent entity that this item is part of. This parameter filters out items that belong to a higher-level entity (e.g. a session week or a document).

#### parliamentary-term-optional

> **parliamentary-term-optional**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

##### Description

Parliamentary Term from 0 to the current.

#### part-session-date

> **part-session-date**: `string`[]

##### Description

Plenary Part-Session Date. This parameter refers to the date of the first day of a given part-session. Parliament sits monthly in Strasbourg in a four-day part-session (Monday to Thursday). Additional part-sessions are held in Brussels. The format of the value is **YYYY-MM-DD**.

#### person-id

> **person-id**: `number`[]

##### Description

A unique identifier for a Person.

#### political-group

> **political-group**: (`"ECR"` \| `"ID"` \| `"NI"` \| `"PPE"` \| `"S-D"` \| `"VERTS-ALE"` \| `"RENEW"` \| `"THE-LEFT"`)[]

##### Description

EP political groups.

#### process-id

> **process-id**: `string`

##### Description

Process identifier

#### process-type

> **process-type**: (`"ACI"` \| `"APP"` \| `"AVC"` \| `"BUD"` \| `"CNS"` \| `"COD"` \| `"DEC"` \| `"NLE"` \| `"SYN"` \| `"BUI"` \| `"COS"` \| `"DEA"` \| `"DCE"` \| `"IMM"` \| `"INI"` \| `"INL"` \| `"INS"` \| `"REG"` \| `"RPS"` \| `"RSO"` \| `"RSP"` \| `"GBD"`)[]

##### Description

A type of a Process. Values are concepts of the EP Vocabulary [ep-procedure-types](https://data.europarl.europa.eu/def/ep-procedure-types.ttl).

#### provider-id

> **provider-id**: `string`[]

##### Description

Provider identifier

#### psd-itm-related-activity-type

> **psd-itm-related-activity-type**: (`"PLENARY_DEBATE"` \| `"PLENARY_VOTE"` \| `"PLENARY_ACTIVITY"` \| `"PLENARY_VOTE_RESULTS"` \| `"PLENARY_OUTCOME"` \| `"PLENARY_DEBATE_WRITTEN_STATEMENT"` \| `"PLENARY_DEBATE_SPEECH"` \| `"PLENARY_VOTE_EXPLANATIONS"` \| `"PROCEEDING_ACTIVITY"`)[]

##### Description

A type of the related activity. Values are concepts of the EP Vocabulary [ep-event-types](https://data.europarl.europa.eu/def/ep-event-types.ttl).

#### psd-itm-related-work-type

> **psd-itm-related-work-type**: (`"CRE_PLENARY"` \| `"MINUTES_PLENARY"` \| `"VOTE_RESULTS_PLENARY"` \| `"VOTE_ROLLCALL_PLENARY"`)[]

##### Description

A type of the related Work type. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### related-doc-id

> **related-doc-id**: `string`[]

##### Description

Related document identifier

#### related-process-id

> **related-process-id**: `string`[]

##### Description

Related process identifier

#### related-process-type

> **related-process-type**: (`"ACI"` \| `"APP"` \| `"AVC"` \| `"BUD"` \| `"CNS"` \| `"COD"` \| `"DEC"` \| `"NLE"` \| `"SYN"` \| `"BUI"` \| `"COS"` \| `"DEA"` \| `"DCE"` \| `"IMM"` \| `"INI"` \| `"INL"` \| `"INS"` \| `"REG"` \| `"RPS"` \| `"RSO"` \| `"RSP"` \| `"GBD"`)[]

##### Description

A type of the related process. Values are concepts of the EP Vocabulary [ep-procedure-types](https://data.europarl.europa.eu/def/ep-procedure-types.ttl).

#### search-language

> **search-language**: (`"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

##### Description

Search language for free text search. If no language is selected, the default language is `en`

#### sitting-date-end

> **sitting-date-end**: `string`

##### Description

Plenary sitting date end (range end date). This parameter, together with `sitting-date`, defines the date range for the resource. The format of the value is **YYYY-MM-DD**.

#### sitting-date-start

> **sitting-date-start**: `string`

##### Description

Plenary sitting date (range start date). This parameter, together with `sitting-date-end`, defines the date range for the resource. Note: if only `sitting-date` is selected, the range will be limited to the same day. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

#### sitting-id

> **sitting-id**: `string`

##### Description

Sitting identifier. It refers to the ID of a Plenary sitting

#### sort-by

> **sort-by**: `string`[]

##### Description

Sorting parameter. The avaliable sorting parameters are: `sitting-date`, `number`, `numbering`, `video-start-time`, `search-score` The 2 possible orders are: `asc` for ascending and `desc` for descending. The input **MUST** have the following format: `{parameter}:{order}`. Example: `sitting-date:desc`

#### speech-id

> **speech-id**: `string`

##### Description

Speech identifier.

#### start-date

> **start-date**: `string`

##### Description

Start date. This parameter defines the start date of a timeframe. The format of the value is **YYYY-MM-DD**. Example: `2024-02-07`

#### subdivision-type

> **subdivision-type**: (`"OTH"` \| `"ITM"`)[]

##### Description

A type of a Work Subdivision. The non-exhaustive list of values includes concepts of the [subdivision](http://publications.europa.eu/resource/authority/subdivision) authority table maintained by the Publications Office of the European Union.

#### subtype

> **subtype**: `string`[]

##### Description

Subtype of a document

#### text

> **text**: `string`

##### Description

A free text search in the content of the resource. For language-specific results, use the parameter `search-language`.

#### timeframe

> **timeframe**: `"custom"` \| `"today"` \| `"one-day"` \| `"one-week"` \| `"one-month"`

##### Description

The timeframe for the feed. To specify a custom timeframe, select `custom` from the list and use the parameter `start-date` . If no parameter is selected, the default timeframe is one month.

#### timeframe-start-date

> **timeframe-start-date**: `string`

##### Description

Start date for the custom range (only required if timeframe is `custom`).

#### title

> **title**: `string`

##### Description

A free text search in the title of the resource. For language-specific results, use the parameter `search-language`.

#### user-agent

> **user-agent**: `string`

##### Description

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

#### video-end-time-q

> **video-end-time-q**: `string`

##### Description

Video end time. (range end). This parameter refers to the video timestamp of a speech or a speech-related activity. Together with `video-start-time`, defines the time range for the plenary speeches videos. The format is *ISO 8601* timestamp. Example: `2024-05-08T11:04:03.399+02:00` .

#### video-start-time

> **video-start-time**: `string`

##### Description

Video start time. This parameter refers to the video timestamp of a speech or a speech-related activity (proceeding activities, debate speeches, written statements). The format is *ISO 8601* timestamp. Example: `2024-05-08T11:04:03.399+02:00` .

#### video-start-time-q

> **video-start-time-q**: `string`

##### Description

Video start time. (range start). This parameter refers to the video timestamp of a speech or a speech-related activity. Together with `video-end-time`, defines the time range for the plenary speeches videos. Note: if only `video-start-time` is selected, the range will be limited to the selected time only.  The format is *ISO 8601* timestamp. Example: `2024-05-08T11:04:03.399+02:00` .

#### view-adopted-texts

> **view-adopted-texts**: (`"uri"` \| `"adopted-texts-dsd"`)[]

##### Description

Response view.

#### view-plenary-documents

> **view-plenary-documents**: (`"uri"` \| `"plenary-documents-dsd"`)[]

##### Description

Response view.

#### voc-id

> **voc-id**: `string`

##### Description

Vocabulary identifier

#### vote-method

> **vote-method**: `string`[]

##### Description

Method of vote

#### work-type

> **work-type**: (`"QUESTION_TIME"` \| `"REPORT_PLENARY"` \| `"AMENDMENT_LIST"` \| `"RESOLUTION_MOTION"` \| `"TEXT_ADOPTED"` \| `"QUESTION_WRITTEN"` \| `"QUESTION_ORAL"` \| `"ANNEX"` \| `"CORRIGENDUM"` \| `"ERRATUM"` \| `"RESOLUTION_MOTION_JOINT"` \| `"AGENDA_PLENARY_WEEK"` \| `"AGENDA_PLENARY_DAY"` \| `"CRE_PLENARY"` \| `"MINUTES_PLENARY"` \| `"LIST_ATTEND_PLENARY"` \| `"VOTE_RESULTS_PLENARY"` \| `"VOTE_ROLLCALL_PLENARY"` \| `"INTERPELLATION_MAJOR"` \| `"INTERPELLATION_MINOR"` \| `"QUESTION_RESOLUTION_MOTION"` \| `"QUESTION_WRITTEN_PRIORITY"` \| `"QUESTION_WRITTEN_ANSWER"` \| `"INTERPELLATION_MINOR_WRITTEN_ANSWER"` \| `"AGREEMENT_PROVISIONAL"` \| `"OPINION_PARLIAMENTARY_COMMITTEE_DRAFT"` \| `"OPINION_PARLIAMENTARY_COMMITTEE"` \| `"OPINION_LETTER_PARLIAMENTARY_COMMITTEE"` \| `"REPORT_PARLIAMENTARY_COMMITTEE_DRAFT"` \| `"BUDGET_EP_DRAFT"` \| `"AMENDMENT_BUDGET_EU_DRAFT"`)[]

##### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### work-type-adopted-texts

> **work-type-adopted-texts**: (`"TEXT_ADOPTED"` \| `"BUDGET_EP_DRAFT"` \| `"AMENDMENT_BUDGET_EU_DRAFT"`)[]

##### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### work-type-committee

> **work-type-committee**: (`"AGREEMENT_PROVISIONAL"` \| `"OPINION_PARLIAMENTARY_COMMITTEE_DRAFT"` \| `"OPINION_PARLIAMENTARY_COMMITTEE"` \| `"OPINION_LETTER_PARLIAMENTARY_COMMITTEE"` \| `"REPORT_PARLIAMENTARY_COMMITTEE_DRAFT"`)[]

##### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### work-type-declarations

> **work-type-declarations**: `"MEMBER_DECLARATION_INTEREST_CONFLICT"`[]

##### Description

A type of a Work.

#### work-type-external

> **work-type-external**: `"ACT_FOLLOWUP"`[]

##### Description

A type of a Work.

#### work-type-parliamentary-questions

> **work-type-parliamentary-questions**: (`"QUESTION_TIME"` \| `"QUESTION_WRITTEN"` \| `"QUESTION_ORAL"` \| `"INTERPELLATION_MAJOR"` \| `"INTERPELLATION_MINOR"` \| `"QUESTION_WRITTEN_PRIORITY"`)[]

##### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### work-type-plenary-documents

> **work-type-plenary-documents**: (`"REPORT_PLENARY"` \| `"RESOLUTION_MOTION"` \| `"RESOLUTION_MOTION_JOINT"` \| `"QUESTION_RESOLUTION_MOTION"`)[]

##### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### work-type-plenary-session-documents

> **work-type-plenary-session-documents**: (`"AGENDA_PLENARY_WEEK"` \| `"AGENDA_PLENARY_DAY"` \| `"CRE_PLENARY"` \| `"MINUTES_PLENARY"` \| `"LIST_ATTEND_PLENARY"` \| `"VOTE_RESULTS_PLENARY"` \| `"VOTE_ROLLCALL_PLENARY"`)[]

##### Description

A type of a Work. Values are concepts of the EP Vocabulary [ep-document-types](https://data.europarl.europa.eu/def/ep-document-types.ttl).

#### ws-id

> **ws-id**: `string`

##### Description

Work subdivision identifier

#### year

> **year**: `number`[]

##### Description

Year. The format of the values is **YYYY**.

***

### pathItems

> **pathItems**: `never`

Defined in: [generated/ep-api-types.ts:1883](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1883)

***

### requestBodies

> **requestBodies**: `never`

Defined in: [generated/ep-api-types.ts:1881](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1881)

***

### responses

> **responses**: `object`

Defined in: [generated/ep-api-types.ts:1671](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1671)

#### internal-server-error

> **internal-server-error**: `object`

##### Description

Internal Server Error

##### internal-server-error.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### internal-server-error.content?

> `optional` **content**: `undefined`

#### no-content

> **no-content**: `object`

##### Description

No content

##### no-content.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### no-content.content?

> `optional` **content**: `undefined`

#### not-acceptable

> **not-acceptable**: `object`

##### Description

Not Acceptable

##### not-acceptable.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### not-acceptable.content?

> `optional` **content**: `undefined`

#### not-found

> **not-found**: `object`

##### Description

Not Found

##### not-found.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

##### not-found.content?

> `optional` **content**: `undefined`

#### ok-atom-xml

> **ok-atom-xml**: `object`

##### Description

OK

##### ok-atom-xml.content

> **content**: `object`

##### ok-atom-xml.content.application/atom+xml

> **application/atom+xml**: `object`

##### ok-atom-xml.content.application/atom+xml.author

> **author**: `object`

author

##### ok-atom-xml.content.application/atom+xml.author.name

> **name**: `string`

##### ok-atom-xml.content.application/atom+xml.entry

> **entry**: `object`

##### ok-atom-xml.content.application/atom+xml.entry.id

> **id**: `string`

Format: uri

##### ok-atom-xml.content.application/atom+xml.entry.link

> **link**: `object`[]

##### ok-atom-xml.content.application/atom+xml.entry.title

> **title**: `object`

##### ok-atom-xml.content.application/atom+xml.entry.title.type

> **type**: `string`

##### ok-atom-xml.content.application/atom+xml.entry.title.xml:lang

> **xml:lang**: `string`

##### ok-atom-xml.content.application/atom+xml.entry.updated

> **updated**: `string`

Format: date-time

##### ok-atom-xml.content.application/atom+xml.entry.category?

> `optional` **category**: `object`

##### ok-atom-xml.content.application/atom+xml.entry.category.label

> **label**: `string`

##### ok-atom-xml.content.application/atom+xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### ok-atom-xml.content.application/atom+xml.entry.category.term

> **term**: `string`

##### ok-atom-xml.content.application/atom+xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### ok-atom-xml.content.application/atom+xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### ok-atom-xml.content.application/atom+xml.id

> **id**: `string`

Format: uri

##### ok-atom-xml.content.application/atom+xml.link

> **link**: `object`[]

##### ok-atom-xml.content.application/atom+xml.title

> **title**: `object`

##### ok-atom-xml.content.application/atom+xml.title.type

> **type**: `string`

##### ok-atom-xml.content.application/atom+xml.updated

> **updated**: `string`

Format: date-time

##### ok-atom-xml.content.application/atom+xml.xml:lang

> **xml:lang**: `string`

##### ok-atom-xml.content.application/atom+xml.xmlns

> **xmlns**: `string`

Format: uri

##### ok-atom-xml.content.application/atom+xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### ok-atom-xml.content.application/atom+xml.subtitle?

> `optional` **subtitle**: `object`

##### ok-atom-xml.content.application/atom+xml.subtitle.type

> **type**: `string`

##### ok-atom-xml.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

#### ok-json-ld

> **ok-json-ld**: `object`

##### Description

OK

##### ok-json-ld.content

> **content**: `object`

##### ok-json-ld.content.application/ld+json

> **application/ld+json**: `object`

##### ok-json-ld.content.application/ld+json.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### ok-json-ld.content.application/ld+json.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### ok-json-ld.content.application/ld+json.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### ok-json-ld.content.application/ld+json.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### ok-json-ld.headers

> **headers**: `object`

###### Index Signature

\[`name`: `string`\]: `unknown`

***

### schemas

> **schemas**: `object`

Defined in: [generated/ep-api-types.ts:1116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/generated/ep-api-types.ts#L1116)

#### @context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

#### atom-xml

> **atom-xml**: `object`

feed

##### atom-xml.author

> **author**: `object`

author

##### atom-xml.author.name

> **name**: `string`

##### atom-xml.entry

> **entry**: `object`

##### atom-xml.entry.id

> **id**: `string`

Format: uri

##### atom-xml.entry.link

> **link**: `object`[]

##### atom-xml.entry.title

> **title**: `object`

##### atom-xml.entry.title.type

> **type**: `string`

##### atom-xml.entry.title.xml:lang

> **xml:lang**: `string`

##### atom-xml.entry.updated

> **updated**: `string`

Format: date-time

##### atom-xml.entry.category?

> `optional` **category**: `object`

##### atom-xml.entry.category.label

> **label**: `string`

##### atom-xml.entry.category.scheme

> **scheme**: `string`

Format: uri

##### atom-xml.entry.category.term

> **term**: `string`

##### atom-xml.entry.rdf:type?

> `optional` **rdf:type**: `object`

##### atom-xml.entry.rdf:type.rdf:resource?

> `optional` **rdf:resource**: `string`

Format: uri

##### atom-xml.id

> **id**: `string`

Format: uri

##### atom-xml.link

> **link**: `object`[]

##### atom-xml.title

> **title**: `object`

##### atom-xml.title.type

> **type**: `string`

##### atom-xml.updated

> **updated**: `string`

Format: date-time

##### atom-xml.xml:lang

> **xml:lang**: `string`

##### atom-xml.xmlns

> **xmlns**: `string`

Format: uri

##### atom-xml.xmlns:rdf

> **xmlns:rdf**: `string`

Format: uri

##### atom-xml.subtitle?

> `optional` **subtitle**: `object`

##### atom-xml.subtitle.type

> **type**: `string`

#### container\_language

> **container\_language**: `object`

##### Index Signature

\[`key`: `string`\]: `string`

#### ContextClass

> **ContextClass**: `object`

ContextClass

##### ContextClass.@base

> **@base**: `string`

Format: uri

##### ContextClass.data

> **data**: `string`

#### ContextElement

> **ContextElement**: `string` \| \{ `@base`: `string`; `data`: `string`; \}

ContextElement

##### Type Declaration

`string`

\{ `@base`: `string`; `data`: `string`; \}

#### daciSchema

> **daciSchema**: `object`

##### daciSchema.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### daciSchema.$defs

> **$defs**: `object`

##### daciSchema.$defs.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### daciSchema.$defs.container\_language

> **container\_language**: `object`

###### Index Signature

\[`key`: `string`\]: `string`

##### daciSchema.$defs.ContextClass

> **ContextClass**: `object`

ContextClass

##### daciSchema.$defs.ContextClass.@base

> **@base**: `string`

Format: uri

##### daciSchema.$defs.ContextClass.data

> **data**: `string`

##### daciSchema.$defs.ContextElement

> **ContextElement**: `string` \| \{ `@base`: `string`; `data`: `string`; \}

ContextElement

###### Type Declaration

`string`

\{ `@base`: `string`; `data`: `string`; \}

##### daciSchema.$defs.Expression

> **Expression**: `object`

##### daciSchema.$defs.Expression.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en
```

##### daciSchema.$defs.Expression.is\_embodied\_by

> **is\_embodied\_by**: `object`[]

is embodied by

##### daciSchema.$defs.Expression.language

> **language**: `string`

language
Format: iri-reference

##### daciSchema.$defs.Expression.title

> **title**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### daciSchema.$defs.Expression.type

> **type**: `string`

type
Format: iri-reference

##### daciSchema.$defs.ForeseenCapacity

> **ForeseenCapacity**: `object`

##### daciSchema.$defs.ForeseenCapacity.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### daciSchema.$defs.ForeseenCapacity.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### daciSchema.$defs.ForeseenCapacity.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### daciSchema.$defs.ForeseenCapacity.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### daciSchema.$defs.ForeseenCapacity.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### daciSchema.$defs.ForeseenCapacity.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### daciSchema.$defs.ForeseenCapacity.type

> **type**: `string`

type
Format: iri-reference

##### daciSchema.$defs.ForeseenCapacity.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### daciSchema.$defs.ForeseenCapacity.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### daciSchema.$defs.ForeseenCapacity.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### daciSchema.$defs.Hit

> **Hit**: `object`

Hit

##### daciSchema.$defs.Hit.id

> **id**: `string`

##### daciSchema.$defs.Manifestation

> **Manifestation**: `object`

##### daciSchema.$defs.Manifestation.byteSize

> **byteSize**: `string`

byte size
Format: integer

##### daciSchema.$defs.Manifestation.format

> **format**: `string`

format
Format: iri-reference

##### daciSchema.$defs.Manifestation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en/pdf
```

##### daciSchema.$defs.Manifestation.is\_exemplified\_by

> **is\_exemplified\_by**: `string`

is exemplified by

##### daciSchema.$defs.Manifestation.issued

> **issued**: `string`

issued
Format: date-time

##### daciSchema.$defs.Manifestation.media\_type

> **media\_type**: `string`

format
Format: iri-reference

##### daciSchema.$defs.Manifestation.type

> **type**: `string`

type
Format: iri-reference

##### daciSchema.$defs.Meta

> **Meta**: `object`

Meta

##### daciSchema.$defs.Meta.total

> **total**: `number`

##### daciSchema.$defs.Participation

> **Participation**: `object`

##### daciSchema.$defs.Participation.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### daciSchema.$defs.Participation.had\_participant\_person

> **had\_participant\_person**: `string`[]

had participant person

##### daciSchema.$defs.Participation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/participation/DCI-197491-2024-07-19-123456-AUTHOR
```

##### daciSchema.$defs.Participation.inCapacityOf

> **inCapacityOf**: `object`

in capacity of

###### Description

Please note that the naming of this property might change in the future (ELI Task Force decision is pending)

##### daciSchema.$defs.Participation.inCapacityOf.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### daciSchema.$defs.Participation.inCapacityOf.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### daciSchema.$defs.Participation.inCapacityOf.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### daciSchema.$defs.Participation.inCapacityOf.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### daciSchema.$defs.Participation.inCapacityOf.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### daciSchema.$defs.Participation.inCapacityOf.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### daciSchema.$defs.Participation.inCapacityOf.type

> **type**: `string`

type
Format: iri-reference

##### daciSchema.$defs.Participation.inCapacityOf.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### daciSchema.$defs.Participation.inCapacityOf.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### daciSchema.$defs.Participation.inCapacityOf.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### daciSchema.$defs.Participation.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### daciSchema.$defs.Participation.participation\_role

> **participation\_role**: `string`

participation role
Format: iri-reference

##### daciSchema.$defs.Participation.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### daciSchema.$defs.Participation.type

> **type**: `string`

type
Format: iri-reference

##### daciSchema.$defs.SearchResults

> **SearchResults**: `object`

SearchResults

##### daciSchema.$defs.SearchResults.hits

> **hits**: `object`[]

##### daciSchema.$defs.Work-DCI

> **Work-DCI**: `object`

###### Description

This node shape represents a subset of eli:Work

##### daciSchema.$defs.Work-DCI.awarenessOfConflict

> **awarenessOfConflict**: `boolean`

awareness of conflict

##### daciSchema.$defs.Work-DCI.document\_date

> **document\_date**: `string`

date document
Format: date

##### daciSchema.$defs.Work-DCI.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-256902-2025-10-27-502107
```

##### daciSchema.$defs.Work-DCI.identifier

> **identifier**: `string`

identifier

##### daciSchema.$defs.Work-DCI.identifierYear

> **identifierYear**: `string`

identifier year

##### daciSchema.$defs.Work-DCI.is\_realized\_by

> **is\_realized\_by**: `object`[]

is realized by

##### daciSchema.$defs.Work-DCI.label

> **label**: `string`

label

##### daciSchema.$defs.Work-DCI.notation\_providerId

> **notation\_providerId**: `string`

data provider identifier

##### daciSchema.$defs.Work-DCI.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### daciSchema.$defs.Work-DCI.publisher

> **publisher**: `string`

publisher
Format: iri-reference

##### daciSchema.$defs.Work-DCI.title\_dcterms

> **title\_dcterms**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### daciSchema.$defs.Work-DCI.type

> **type**: `string`

type
Format: iri-reference

##### daciSchema.$defs.Work-DCI.work\_type

> **work\_type**: `string`

work type
Format: iri-reference

##### daciSchema.$defs.Work-DCI.workHadParticipation

> **workHadParticipation**: `object`[]

work had participation

##### daciSchema.$defs.Work-DCI.alternative\_dcterms?

> `optional` **alternative\_dcterms**: `object`

alternative

###### Index Signature

\[`key`: `string`\]: `string`

##### daciSchema.$defs.Work-DCI.conflictDescription?

> `optional` **conflictDescription**: `string`

conflict description

###### Description

Present only is absenceOfConflict is false.

##### daciSchema.$defs.Work-DCI.inverse\_previousVersion?

> `optional` **inverse\_previousVersion**: `string`[]

inverse previous version

##### daciSchema.$defs.Work-DCI.notation\_dossierId?

> `optional` **notation\_dossierId**: `string`

dossier identifier

##### daciSchema.$defs.Work-DCI.previousVersion?

> `optional` **previousVersion**: `string`[]

previous version

##### daciSchema.$defs.Work-DCI.refers\_to?

> `optional` **refers\_to**: `string`[]

refers to

##### daciSchema.data

> **data**: `object`[]

##### daciSchema.meta?

> `optional` **meta**: `object`

##### daciSchema.meta.total

> **total**: `number`

##### daciSchema.searchResults?

> `optional` **searchResults**: `object`

##### daciSchema.searchResults.hits

> **hits**: `object`[]

#### Expression

> **Expression**: `object`

##### Expression.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en
```

##### Expression.is\_embodied\_by

> **is\_embodied\_by**: `object`[]

is embodied by

##### Expression.language

> **language**: `string`

language
Format: iri-reference

##### Expression.title

> **title**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### Expression.type

> **type**: `string`

type
Format: iri-reference

#### ForeseenCapacity

> **ForeseenCapacity**: `object`

##### ForeseenCapacity.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### ForeseenCapacity.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### ForeseenCapacity.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### ForeseenCapacity.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### ForeseenCapacity.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### ForeseenCapacity.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### ForeseenCapacity.type

> **type**: `string`

type
Format: iri-reference

##### ForeseenCapacity.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### ForeseenCapacity.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### ForeseenCapacity.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

#### Hit

> **Hit**: `object`

Hit

##### Hit.id

> **id**: `string`

#### json-ld

> **json-ld**: `object`

##### json-ld.data

> **data**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### json-ld.@context?

> `optional` **@context**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### json-ld.included?

> `optional` **included**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

##### json-ld.searchResults?

> `optional` **searchResults**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `never`\>

#### lang-list

> **lang-list**: `"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`

#### lang-list-24-array

> **lang-list-24-array**: (`"en"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

#### lang-list-default-en

> **lang-list-default-en**: (`"en"` \| `"mul"` \| `"bg"` \| `"es"` \| `"cs"` \| `"da"` \| `"de"` \| `"et"` \| `"el"` \| `"fr"` \| `"ga"` \| `"hr"` \| `"it"` \| `"lv"` \| `"lt"` \| `"hu"` \| `"mt"` \| `"nl"` \| `"pl"` \| `"pt"` \| `"ro"` \| `"sk"` \| `"sl"` \| `"fi"` \| `"sv"`)[]

##### Default

```ts
[
      "en"
    ]
```

##### Example

```ts
[
      "en"
    ]
```

#### Manifestation

> **Manifestation**: `object`

##### Manifestation.byteSize

> **byteSize**: `string`

byte size
Format: integer

##### Manifestation.format

> **format**: `string`

format
Format: iri-reference

##### Manifestation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en/pdf
```

##### Manifestation.is\_exemplified\_by

> **is\_exemplified\_by**: `string`

is exemplified by

##### Manifestation.issued

> **issued**: `string`

issued
Format: date-time

##### Manifestation.media\_type

> **media\_type**: `string`

format
Format: iri-reference

##### Manifestation.type

> **type**: `string`

type
Format: iri-reference

#### Meta

> **Meta**: `object`

Meta

##### Meta.total

> **total**: `number`

#### parliamentary-term-list

> **parliamentary-term-list**: (`0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10`)[]

#### Participation

> **Participation**: `object`

##### Participation.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### Participation.had\_participant\_person

> **had\_participant\_person**: `string`[]

had participant person

##### Participation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/participation/DCI-197491-2024-07-19-123456-AUTHOR
```

##### Participation.inCapacityOf

> **inCapacityOf**: `object`

in capacity of

###### Description

Please note that the naming of this property might change in the future (ELI Task Force decision is pending)

##### Participation.inCapacityOf.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### Participation.inCapacityOf.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### Participation.inCapacityOf.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### Participation.inCapacityOf.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### Participation.inCapacityOf.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### Participation.inCapacityOf.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### Participation.inCapacityOf.type

> **type**: `string`

type
Format: iri-reference

##### Participation.inCapacityOf.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### Participation.inCapacityOf.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### Participation.inCapacityOf.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### Participation.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### Participation.participation\_role

> **participation\_role**: `string`

participation role
Format: iri-reference

##### Participation.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### Participation.type

> **type**: `string`

type
Format: iri-reference

#### process-type-list

> **process-type-list**: (`"ACI"` \| `"APP"` \| `"AVC"` \| `"BUD"` \| `"CNS"` \| `"COD"` \| `"DEC"` \| `"NLE"` \| `"SYN"` \| `"BUI"` \| `"COS"` \| `"DEA"` \| `"DCE"` \| `"IMM"` \| `"INI"` \| `"INL"` \| `"INS"` \| `"REG"` \| `"RPS"` \| `"RSO"` \| `"RSP"` \| `"GBD"`)[]

#### schema

> **schema**: `object`

MEPs declarations dataset description

##### Description

MEPs declarations dataset description

##### schema.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### schema.$defs

> **$defs**: `object`

##### schema.$defs.@context

> **@context**: (`string` \| \{ `@base`: `string`; `data`: `string`; \})[]

##### schema.$defs.container\_language

> **container\_language**: `object`

###### Index Signature

\[`key`: `string`\]: `string`

##### schema.$defs.ContextClass

> **ContextClass**: `object`

ContextClass

##### schema.$defs.ContextClass.@base

> **@base**: `string`

Format: uri

##### schema.$defs.ContextClass.data

> **data**: `string`

##### schema.$defs.ContextElement

> **ContextElement**: `string` \| \{ `@base`: `string`; `data`: `string`; \}

ContextElement

###### Type Declaration

`string`

\{ `@base`: `string`; `data`: `string`; \}

##### schema.$defs.Expression

> **Expression**: `object`

##### schema.$defs.Expression.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en
```

##### schema.$defs.Expression.is\_embodied\_by

> **is\_embodied\_by**: `object`[]

is embodied by

##### schema.$defs.Expression.language

> **language**: `string`

language
Format: iri-reference

##### schema.$defs.Expression.title

> **title**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### schema.$defs.Expression.type

> **type**: `string`

type
Format: iri-reference

##### schema.$defs.ForeseenCapacity

> **ForeseenCapacity**: `object`

##### schema.$defs.ForeseenCapacity.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### schema.$defs.ForeseenCapacity.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### schema.$defs.ForeseenCapacity.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### schema.$defs.ForeseenCapacity.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### schema.$defs.ForeseenCapacity.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### schema.$defs.ForeseenCapacity.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### schema.$defs.ForeseenCapacity.type

> **type**: `string`

type
Format: iri-reference

##### schema.$defs.ForeseenCapacity.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### schema.$defs.ForeseenCapacity.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### schema.$defs.ForeseenCapacity.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### schema.$defs.Hit

> **Hit**: `object`

Hit

##### schema.$defs.Hit.id

> **id**: `string`

##### schema.$defs.Manifestation

> **Manifestation**: `object`

##### schema.$defs.Manifestation.byteSize

> **byteSize**: `string`

byte size
Format: integer

##### schema.$defs.Manifestation.format

> **format**: `string`

format
Format: iri-reference

##### schema.$defs.Manifestation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-197491-2024-07-19-123456/en/pdf
```

##### schema.$defs.Manifestation.is\_exemplified\_by

> **is\_exemplified\_by**: `string`

is exemplified by

##### schema.$defs.Manifestation.issued

> **issued**: `string`

issued
Format: date-time

##### schema.$defs.Manifestation.media\_type

> **media\_type**: `string`

format
Format: iri-reference

##### schema.$defs.Manifestation.type

> **type**: `string`

type
Format: iri-reference

##### schema.$defs.Meta

> **Meta**: `object`

Meta

##### schema.$defs.Meta.total

> **total**: `number`

##### schema.$defs.Participation

> **Participation**: `object`

##### schema.$defs.Participation.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### schema.$defs.Participation.had\_participant\_person

> **had\_participant\_person**: `string`[]

had participant person

##### schema.$defs.Participation.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/participation/DCI-197491-2024-07-19-123456-AUTHOR
```

##### schema.$defs.Participation.inCapacityOf

> **inCapacityOf**: `object`

in capacity of

###### Description

Please note that the naming of this property might change in the future (ELI Task Force decision is pending)

##### schema.$defs.Participation.inCapacityOf.activity\_date

> **activity\_date**: `string`

activity date
Format: date

##### schema.$defs.Participation.inCapacityOf.capacityPerson

> **capacityPerson**: `string`

capacity person
Format: iri-reference

##### schema.$defs.Participation.inCapacityOf.capacityRole

> **capacityRole**: `string`

capacity role
Format: iri-reference

##### schema.$defs.Participation.inCapacityOf.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/capacity/DCI-197491-2024-07-19-123456-AUTHOR
```

##### schema.$defs.Participation.inCapacityOf.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### schema.$defs.Participation.inCapacityOf.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### schema.$defs.Participation.inCapacityOf.type

> **type**: `string`

type
Format: iri-reference

##### schema.$defs.Participation.inCapacityOf.capacityActivity?

> `optional` **capacityActivity**: `string`

capacity activity
Format: iri-reference

##### schema.$defs.Participation.inCapacityOf.capacityActivityLabel?

> `optional` **capacityActivityLabel**: `string`

capacity activity label

###### Description

Parliamentary Procedure Specification (free text)

##### schema.$defs.Participation.inCapacityOf.capacityOrganization?

> `optional` **capacityOrganization**: `string`

capacity organization
Format: iri-reference

##### schema.$defs.Participation.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### schema.$defs.Participation.participation\_role

> **participation\_role**: `string`

participation role
Format: iri-reference

##### schema.$defs.Participation.politicalGroup

> **politicalGroup**: `string`

political group
Format: iri-reference

##### schema.$defs.Participation.type

> **type**: `string`

type
Format: iri-reference

##### schema.$defs.SearchResults

> **SearchResults**: `object`

SearchResults

##### schema.$defs.SearchResults.hits

> **hits**: `object`[]

##### schema.$defs.Work-DCI

> **Work-DCI**: `object`

###### Description

This node shape represents a subset of eli:Work

##### schema.$defs.Work-DCI.awarenessOfConflict

> **awarenessOfConflict**: `boolean`

awareness of conflict

##### schema.$defs.Work-DCI.document\_date

> **document\_date**: `string`

date document
Format: date

##### schema.$defs.Work-DCI.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-256902-2025-10-27-502107
```

##### schema.$defs.Work-DCI.identifier

> **identifier**: `string`

identifier

##### schema.$defs.Work-DCI.identifierYear

> **identifierYear**: `string`

identifier year

##### schema.$defs.Work-DCI.is\_realized\_by

> **is\_realized\_by**: `object`[]

is realized by

##### schema.$defs.Work-DCI.label

> **label**: `string`

label

##### schema.$defs.Work-DCI.notation\_providerId

> **notation\_providerId**: `string`

data provider identifier

##### schema.$defs.Work-DCI.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### schema.$defs.Work-DCI.publisher

> **publisher**: `string`

publisher
Format: iri-reference

##### schema.$defs.Work-DCI.title\_dcterms

> **title\_dcterms**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### schema.$defs.Work-DCI.type

> **type**: `string`

type
Format: iri-reference

##### schema.$defs.Work-DCI.work\_type

> **work\_type**: `string`

work type
Format: iri-reference

##### schema.$defs.Work-DCI.workHadParticipation

> **workHadParticipation**: `object`[]

work had participation

##### schema.$defs.Work-DCI.alternative\_dcterms?

> `optional` **alternative\_dcterms**: `object`

alternative

###### Index Signature

\[`key`: `string`\]: `string`

##### schema.$defs.Work-DCI.conflictDescription?

> `optional` **conflictDescription**: `string`

conflict description

###### Description

Present only is absenceOfConflict is false.

##### schema.$defs.Work-DCI.inverse\_previousVersion?

> `optional` **inverse\_previousVersion**: `string`[]

inverse previous version

##### schema.$defs.Work-DCI.notation\_dossierId?

> `optional` **notation\_dossierId**: `string`

dossier identifier

##### schema.$defs.Work-DCI.previousVersion?

> `optional` **previousVersion**: `string`[]

previous version

##### schema.$defs.Work-DCI.refers\_to?

> `optional` **refers\_to**: `string`[]

refers to

##### schema.data

> **data**: `object`[]

##### schema.meta?

> `optional` **meta**: `object`

##### schema.meta.total

> **total**: `number`

##### schema.searchResults?

> `optional` **searchResults**: `object`

##### schema.searchResults.hits

> **hits**: `object`[]

#### SearchResults

> **SearchResults**: `object`

SearchResults

##### SearchResults.hits

> **hits**: `object`[]

#### Work-DCI

> **Work-DCI**: `object`

##### Description

This node shape represents a subset of eli:Work

##### Work-DCI.awarenessOfConflict

> **awarenessOfConflict**: `boolean`

awareness of conflict

##### Work-DCI.document\_date

> **document\_date**: `string`

date document
Format: date

##### Work-DCI.id

> **id**: `string`

Format: iri-reference

###### Example

```ts
eli/dl/doc/DCI-256902-2025-10-27-502107
```

##### Work-DCI.identifier

> **identifier**: `string`

identifier

##### Work-DCI.identifierYear

> **identifierYear**: `string`

identifier year

##### Work-DCI.is\_realized\_by

> **is\_realized\_by**: `object`[]

is realized by

##### Work-DCI.label

> **label**: `string`

label

##### Work-DCI.notation\_providerId

> **notation\_providerId**: `string`

data provider identifier

##### Work-DCI.parliamentary\_term

> **parliamentary\_term**: `string`

parliamentary term
Format: iri-reference

##### Work-DCI.publisher

> **publisher**: `string`

publisher
Format: iri-reference

##### Work-DCI.title\_dcterms

> **title\_dcterms**: `object`

title

###### Index Signature

\[`key`: `string`\]: `string`

##### Work-DCI.type

> **type**: `string`

type
Format: iri-reference

##### Work-DCI.work\_type

> **work\_type**: `string`

work type
Format: iri-reference

##### Work-DCI.workHadParticipation

> **workHadParticipation**: `object`[]

work had participation

##### Work-DCI.alternative\_dcterms?

> `optional` **alternative\_dcterms**: `object`

alternative

###### Index Signature

\[`key`: `string`\]: `string`

##### Work-DCI.conflictDescription?

> `optional` **conflictDescription**: `string`

conflict description

###### Description

Present only is absenceOfConflict is false.

##### Work-DCI.inverse\_previousVersion?

> `optional` **inverse\_previousVersion**: `string`[]

inverse previous version

##### Work-DCI.notation\_dossierId?

> `optional` **notation\_dossierId**: `string`

dossier identifier

##### Work-DCI.previousVersion?

> `optional` **previousVersion**: `string`[]

previous version

##### Work-DCI.refers\_to?

> `optional` **refers\_to**: `string`[]

refers to
