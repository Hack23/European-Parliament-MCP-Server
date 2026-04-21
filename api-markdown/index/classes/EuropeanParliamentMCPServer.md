[**European Parliament MCP Server API v1.2.11**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [index](../README.md) / EuropeanParliamentMCPServer

# Class: EuropeanParliamentMCPServer

Defined in: [index.ts:130](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/index.ts#L130)

Main MCP Server class for European Parliament data access

Implements the Model Context Protocol (MCP) to provide AI assistants,
IDEs, and other MCP clients with structured access to European Parliament
open data, including information about MEPs, plenary sessions, committees,
legislative documents, and parliamentary questions.

**Features:**
- MCP protocol implementation with tools, resources, and prompts
- Type-safe TypeScript implementation with strict mode
- GDPR-compliant data handling
- Rate limiting and security controls
- Comprehensive error handling

**Data Sources:**
- European Parliament Open Data Portal (https://data.europarl.europa.eu/)
- API v2: https://data.europarl.europa.eu/api/v2/

## Example

```typescript
const server = new EuropeanParliamentMCPServer();
await server.start();
```

## See

 - https://spec.modelcontextprotocol.io/ - MCP specification
 - https://data.europarl.europa.eu/ - EP Open Data Portal
 - https://github.com/Hack23/ISMS-PUBLIC - ISMS compliance policies

## Constructors

### Constructor

> **new EuropeanParliamentMCPServer**(): `EuropeanParliamentMCPServer`

Defined in: [index.ts:135](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/index.ts#L135)

#### Returns

`EuropeanParliamentMCPServer`

## Properties

### server

> `private` `readonly` **server**: `Server`

Defined in: [index.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/index.ts#L133)

## Methods

### dispatchToolCall()

> `private` **dispatchToolCall**(`name`, `args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [index.ts:249](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/index.ts#L249)

**`Internal`**

Dispatch tool calls to appropriate handlers

#### Parameters

##### name

`string`

Tool name

##### args

`unknown`

Tool arguments

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Tool execution result

***

### setupHandlers()

> `private` **setupHandlers**(): `void`

Defined in: [index.ts:172](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/index.ts#L172)

**`Internal`**

Set up MCP protocol handlers

Registers handlers for:
- Tool listing: Returns available tools with schemas
- Tool execution: Routes tool calls to appropriate handlers

**Security:**
- All inputs validated before processing
- Rate limiting applied per client
- GDPR compliance enforced
- Audit logging for all data access

#### Returns

`void`

#### Throws

If handler registration fails

***

### start()

> **start**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [index.ts:282](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/index.ts#L282)

Start the MCP server

Initializes the server with stdio transport and begins listening for
MCP protocol messages. The server communicates via standard input/output
following the MCP specification.

**Lifecycle:**
1. Create stdio transport
2. Connect server to transport
3. Log startup message to stderr
4. Begin handling MCP requests

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when server is started

#### Throws

If server initialization fails

#### Example

```typescript
const server = new EuropeanParliamentMCPServer();
await server.start();
// Server now listening on stdio
```

#### See

https://spec.modelcontextprotocol.io/specification/architecture/
