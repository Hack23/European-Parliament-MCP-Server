[**European Parliament MCP Server API v1.0.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / validateApiUrl

# Function: validateApiUrl()

> **validateApiUrl**(`url`, `label?`): `string`

Defined in: [clients/ep/baseClient.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L77)

Validates an EP API base URL to prevent SSRF via environment variable or
constructor argument poisoning.

Enforces HTTPS-only and blocks requests to localhost, loopback addresses
(127.0.0.0/8), and known internal IP ranges (link-local 169.254.x.x,
RFC-1918 10.x.x.x / 172.16-31.x.x / 192.168.x.x, and their IPv6-mapped
IPv4 equivalents), as well as IPv6 loopback/link-local/unique-local ranges.

## Parameters

### url

`string`

The URL string to validate

### label?

`string` = `'EP_API_URL'`

Label used in error messages (defaults to `'EP_API_URL'`)

## Returns

`string`

The validated URL string (unchanged)

## Throws

If the URL uses a non-HTTPS scheme or targets an internal host

## Security

SSRF Prevention – ISMS Policy: SC-002, NE-001
