[**European Parliament MCP Server API v1.3.20**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / buildSubjectTokens

# Function: buildSubjectTokens()

> **buildSubjectTokens**(`subjectId`, `committeeMemberIds?`, `subjectName?`): `string`[]

Defined in: [utils/effectivenessAggregator.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L140)

Build the set of identifier tokens that we treat as "authored by" the
subject. For an MEP this is the MEP id plus name tokens (so rapporteur
name-based matching works); for a committee it is the union of the
committee's member IDs.

## Parameters

### subjectId

`string`

### committeeMemberIds?

readonly `string`[]

### subjectName?

`string`

## Returns

`string`[]
