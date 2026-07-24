[**European Parliament MCP Server API v1.4.5**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/committee](../README.md) / CommitteeMembership

# Interface: CommitteeMembership

Defined in: [types/ep/committee.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L13)

Complete EP membership record associated with a committee member.

## Extends

- [`MEPMembership`](../../mep/interfaces/MEPMembership.md)

## Properties

### contactPoint

> **contactPoint**: [`MEPContactPoint`](../../mep/interfaces/MEPContactPoint.md)[]

Defined in: [types/ep/mep.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L225)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`contactPoint`](../../mep/interfaces/MEPMembership.md#contactpoint)

***

### member

> **member**: `string`

Defined in: [types/ep/committee.ts:15](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/committee.ts#L15)

MEP identifier owning this membership record.

***

### id?

> `optional` **id?**: `string`

Defined in: [types/ep/mep.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L215)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`id`](../../mep/interfaces/MEPMembership.md#id)

***

### identifier?

> `optional` **identifier?**: `string`

Defined in: [types/ep/mep.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L217)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`identifier`](../../mep/interfaces/MEPMembership.md#identifier)

***

### memberDuring?

> `optional` **memberDuring?**: [`MEPMembershipPeriod`](../../mep/interfaces/MEPMembershipPeriod.md)

Defined in: [types/ep/mep.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L221)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`memberDuring`](../../mep/interfaces/MEPMembership.md#memberduring)

***

### membershipClassification?

> `optional` **membershipClassification?**: `string`

Defined in: [types/ep/mep.ts:224](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L224)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`membershipClassification`](../../mep/interfaces/MEPMembership.md#membershipclassification)

***

### notation\_codictFunctionId?

> `optional` **notation\_codictFunctionId?**: `string`

Defined in: [types/ep/mep.ts:218](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L218)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`notation_codictFunctionId`](../../mep/interfaces/MEPMembership.md#notation_codictfunctionid)

***

### notation\_codictMandateId?

> `optional` **notation\_codictMandateId?**: `string`

Defined in: [types/ep/mep.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L219)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`notation_codictMandateId`](../../mep/interfaces/MEPMembership.md#notation_codictmandateid)

***

### organization?

> `optional` **organization?**: `string`

Defined in: [types/ep/mep.ts:222](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L222)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`organization`](../../mep/interfaces/MEPMembership.md#organization)

***

### represents?

> `optional` **represents?**: `string`[]

Defined in: [types/ep/mep.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L220)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`represents`](../../mep/interfaces/MEPMembership.md#represents)

***

### role?

> `optional` **role?**: `string`

Defined in: [types/ep/mep.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L223)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`role`](../../mep/interfaces/MEPMembership.md#role)

***

### type?

> `optional` **type?**: `string`

Defined in: [types/ep/mep.ts:216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/mep.ts#L216)

#### Inherited from

[`MEPMembership`](../../mep/interfaces/MEPMembership.md).[`type`](../../mep/interfaces/MEPMembership.md#type)
