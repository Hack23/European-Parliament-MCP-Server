[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/document](../README.md) / DocumentStatus

# Type Alias: DocumentStatus

> **DocumentStatus** = `"DRAFT"` \| `"SUBMITTED"` \| `"IN_COMMITTEE"` \| `"PLENARY"` \| `"ADOPTED"` \| `"REJECTED"`

Defined in: [types/ep/document.ts:437](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/ep/document.ts#L437)

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
