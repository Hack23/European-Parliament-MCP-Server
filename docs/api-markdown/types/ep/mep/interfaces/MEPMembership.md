[**European Parliament MCP Server API v1.3.43**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/mep](../README.md) / MEPMembership

# Interface: MEPMembership

Defined in: [types/ep/mep.ts:214](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L214)

Membership returned by `GET /meps/{mep-id}`.

Function memberships use `notation_codictFunctionId`; parliamentary
mandates use `notation_codictMandateId` and may include `represents`.

## Extended by

- [`CommitteeMembership`](../../committee/interfaces/CommitteeMembership.md)

## Properties

### contactPoint

> **contactPoint**: [`MEPContactPoint`](MEPContactPoint.md)[]

Defined in: [types/ep/mep.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L225)

***

### id?

> `optional` **id?**: `string`

Defined in: [types/ep/mep.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L215)

***

### identifier?

> `optional` **identifier?**: `string`

Defined in: [types/ep/mep.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L217)

***

### memberDuring?

> `optional` **memberDuring?**: [`MEPMembershipPeriod`](MEPMembershipPeriod.md)

Defined in: [types/ep/mep.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L221)

***

### membershipClassification?

> `optional` **membershipClassification?**: `string`

Defined in: [types/ep/mep.ts:224](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L224)

***

### notation\_codictFunctionId?

> `optional` **notation\_codictFunctionId?**: `string`

Defined in: [types/ep/mep.ts:218](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L218)

***

### notation\_codictMandateId?

> `optional` **notation\_codictMandateId?**: `string`

Defined in: [types/ep/mep.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L219)

***

### organization?

> `optional` **organization?**: `string`

Defined in: [types/ep/mep.ts:222](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L222)

***

### represents?

> `optional` **represents?**: `string`[]

Defined in: [types/ep/mep.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L220)

***

### role?

> `optional` **role?**: `string`

Defined in: [types/ep/mep.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L223)

***

### type?

> `optional` **type?**: `string`

Defined in: [types/ep/mep.ts:216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L216)
