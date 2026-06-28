[**European Parliament MCP Server API v1.3.30**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / CrossPartyWindow

# Interface: CrossPartyWindow

Defined in: [utils/votingBaseline.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L145)

Resolved cross-party-alignment sub-window from [findCrossPartyAlignmentWindows](../functions/findCrossPartyAlignmentWindows.md).

## Properties

### decisive

> **decisive**: `number`

Defined in: [utils/votingBaseline.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L154)

***

### sharePercent

> **sharePercent**: `number`

Defined in: [utils/votingBaseline.ts:153](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L153)

Share of decisive RCVs in this window where the MEP defected toward a
non-home group's majority, expressed as a **percentage** (0–100).
The input `share` threshold is a fraction (0–1); the returned value
is rounded to two decimals.

***

### voteIds

> **voteIds**: `string`[]

Defined in: [utils/votingBaseline.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L155)

***

### weekStart

> **weekStart**: `string`

Defined in: [utils/votingBaseline.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L146)
