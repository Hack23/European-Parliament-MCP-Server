[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCommitteeInfo](../README.md) / handleGetCommitteeInfo

# Function: handleGetCommitteeInfo()

> **handleGetCommitteeInfo**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getCommitteeInfo.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/getCommitteeInfo.ts#L51)

Handles the get_committee_info MCP tool request.

Retrieves European Parliament committee (corporate body) information including
composition, chair, vice-chairs, members, meeting schedules, and policy areas.
Supports lookup by committee ID, abbreviation, or listing all current active bodies.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetCommitteeInfoSchema](../../../schemas/ep/committee/variables/GetCommitteeInfoSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing committee details or a list of current active corporate bodies

## Throws

If `args` fails schema validation (e.g., missing required fields or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Lookup by abbreviation
const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
// Returns detailed info for the Environment Committee

// List all current active bodies
const all = await handleGetCommitteeInfo({ showCurrent: true });
// Returns all currently active EP corporate bodies
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getCommitteeInfoToolMetadata](../variables/getCommitteeInfoToolMetadata.md) for MCP schema registration
 - handleGetCommitteeDocuments for retrieving documents produced by committees
