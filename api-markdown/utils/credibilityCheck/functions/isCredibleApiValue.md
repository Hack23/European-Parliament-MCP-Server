[**European Parliament MCP Server API v1.2.15**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/credibilityCheck](../README.md) / isCredibleApiValue

# Function: isCredibleApiValue()

> **isCredibleApiValue**(`apiValue`, `storedValue`): `boolean`

Defined in: [utils/credibilityCheck.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/credibilityCheck.ts#L54)

Check whether an API value is credible enough to overwrite the stored value.

Returns false when the API clearly returned incomplete data:

**Guard 1 — tiny API value:** API value is below [MIN\_CREDIBLE\_VALUE](../variables/MIN_CREDIBLE_VALUE.md)
AND stored value is much larger (> 5× the API value).

**Guard 2 — significant drop:** Stored value is substantial
(> [MIN\_STORED\_FOR\_DROP\_CHECK](../variables/MIN_STORED_FOR_DROP_CHECK.md)) AND the API value represents a drop
of more than [MAX\_ALLOWED\_DROP\_PERCENT](../variables/MAX_ALLOWED_DROP_PERCENT.md)% from stored. This catches
scenarios where the EP API returns a plausible-looking number (e.g. 1998
speeches) that is nonetheless far below the known count (10000), indicating
incomplete pagination or partial data loads.

Both guards protect curated data from being overwritten by incomplete
EP API responses while still allowing genuine corrections (increases
and small decreases).

## Parameters

### apiValue

`number`

### storedValue

`number`

## Returns

`boolean`
