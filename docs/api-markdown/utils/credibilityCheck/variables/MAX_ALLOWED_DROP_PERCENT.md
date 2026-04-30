[**European Parliament MCP Server API v1.2.18**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/credibilityCheck](../README.md) / MAX\_ALLOWED\_DROP\_PERCENT

# Variable: MAX\_ALLOWED\_DROP\_PERCENT

> `const` **MAX\_ALLOWED\_DROP\_PERCENT**: `50` = `50`

Defined in: [utils/credibilityCheck.ts:25](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/credibilityCheck.ts#L25)

Maximum allowed percentage drop from stored value before the API value
is treated as incomplete/unreliable.

EP API endpoints sometimes return partial datasets due to:
- Server-side pagination issues or timeouts
- Data reorganisation or migration
- Incomplete database loads

Set to 50% to catch clearly incomplete data (e.g. 80% drops in speeches,
73% drops in documents) while still allowing genuine corrections.
