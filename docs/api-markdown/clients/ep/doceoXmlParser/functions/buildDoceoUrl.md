[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / buildDoceoUrl

# Function: buildDoceoUrl()

> **buildDoceoUrl**(`date`, `type`, `term?`, `language?`): `string`

Defined in: [clients/ep/doceoXmlParser.ts:497](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L497)

Build the DOCEO XML URL for a given date and document type.

## Parameters

### date

`string`

Date string in YYYY-MM-DD format

### type

`"RCV"` \| `"VOT"`

Document type: 'RCV' for roll-call votes, 'VOT' for vote results

### term?

`number` = `CURRENT_PARLIAMENTARY_TERM`

Parliamentary term number (defaults to current term 10)

### language?

`string` = `'EN'`

Language code (defaults to 'EN')

## Returns

`string`

Full URL to the XML document

## Example

```typescript
buildDoceoUrl('2026-04-27', 'RCV')
// => 'https://www.europarl.europa.eu/doceo/document/PV-10-2026-04-27-RCV_EN.xml'
```
