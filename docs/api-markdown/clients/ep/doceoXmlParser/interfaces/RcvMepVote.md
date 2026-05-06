[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / RcvMepVote

# Interface: RcvMepVote

Defined in: [clients/ep/doceoXmlParser.ts:17](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L17)

Represents an individual MEP's vote from the RCV XML.

## Properties

### mepId

> **mepId**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:19](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L19)

MEP identifier from the XML (MepId attribute)

***

### name

> **name**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:21](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L21)

MEP full name

***

### politicalGroup

> **politicalGroup**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:23](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L23)

Political group abbreviation

***

### country?

> `optional` **country?**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:25](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L25)

ISO 3166-1 alpha-2 country code from the Country attribute (optional)
