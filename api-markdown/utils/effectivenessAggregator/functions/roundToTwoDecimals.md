[**European Parliament MCP Server API v1.3.34**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / roundToTwoDecimals

# Function: roundToTwoDecimals()

> **roundToTwoDecimals**(`value`): `number`

Defined in: [utils/effectivenessAggregator.ts:182](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L182)

Round a number to 2 decimal places, returning `0` when the input is not
finite. Used pervasively for percentage / ratio fields so the public
envelope never emits `NaN` or `Infinity`.

## Parameters

### value

`number`

## Returns

`number`
