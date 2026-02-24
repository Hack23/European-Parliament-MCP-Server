[**European Parliament MCP Server API v0.6.2**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / DocumentStatus

# Type Alias: DocumentStatus

> **DocumentStatus** = `"DRAFT"` \| `"SUBMITTED"` \| `"IN_COMMITTEE"` \| `"PLENARY"` \| `"ADOPTED"` \| `"REJECTED"`

Defined in: [types/europeanParliament.ts:1609](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/europeanParliament.ts#L1609)

Legislative document status in the parliamentary process.

Tracks document progression through the European Parliament's legislative
workflow from initial draft to final adoption or rejection. Status values
reflect key procedural stages defined in EP Rules of Procedure.

**Typical Workflow:**
1. DRAFT - Initial document preparation
2. SUBMITTED - Tabled/registered in Parliament
3. IN_COMMITTEE - Committee examination and amendments
4. PLENARY - Scheduled for plenary vote
5. ADOPTED or REJECTED - Final outcome

**Time Between Stages:** Varies by urgency and complexity (weeks to months)

## Examples

```typescript
// Filtering documents by status
const activeDocuments = documents.filter(doc =>
  ["IN_COMMITTEE", "PLENARY"].includes(doc.status)
);
```

```typescript
// Status progression check
const statusOrder: DocumentStatus[] = [
  "DRAFT", "SUBMITTED", "IN_COMMITTEE", "PLENARY", "ADOPTED"
];

function isStatusProgressed(
  oldStatus: DocumentStatus,
  newStatus: DocumentStatus
): boolean {
  return statusOrder.indexOf(newStatus) > statusOrder.indexOf(oldStatus);
}
```

```typescript
// Check if document is finalized
function isFinalized(status: DocumentStatus): boolean {
  return ["ADOPTED", "REJECTED"].includes(status);
}
```

## See

[LegislativeDocument](../interfaces/LegislativeDocument.md) for document structure
