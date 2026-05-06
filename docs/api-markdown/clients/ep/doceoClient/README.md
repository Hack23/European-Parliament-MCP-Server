[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / clients/ep/doceoClient

# clients/ep/doceoClient

## Fileoverview

DOCEO client for fetching EP plenary vote XML documents

Fetches and parses XML documents from the European Parliament's DOCEO system
which provides roll-call votes (RCV) and vote results (VOT) for plenary sessions.

Source: https://www.europarl.europa.eu/plenary/en/votes.html

## Security

SSRF prevention via URL validation, input sanitization

## Classes

- [DoceoClient](classes/DoceoClient.md)

## Interfaces

- [GetLatestVotesParams](interfaces/GetLatestVotesParams.md)
- [LatestVotesResponse](interfaces/LatestVotesResponse.md)

## Variables

- [doceoClient](variables/doceoClient.md)
