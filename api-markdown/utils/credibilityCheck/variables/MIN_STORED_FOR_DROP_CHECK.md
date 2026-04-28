[**European Parliament MCP Server API v1.2.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/credibilityCheck](../README.md) / MIN\_STORED\_FOR\_DROP\_CHECK

# Variable: MIN\_STORED\_FOR\_DROP\_CHECK

> `const` **MIN\_STORED\_FOR\_DROP\_CHECK**: `100` = `100`

Defined in: [utils/credibilityCheck.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/credibilityCheck.ts#L33)

Minimum stored value before the "significant drop" guard activates.

Small stored values (≤ 100) are allowed to fluctuate freely since
even large percentage changes represent small absolute differences.
