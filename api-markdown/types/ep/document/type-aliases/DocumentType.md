[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/document](../README.md) / DocumentType

# Type Alias: DocumentType

> **DocumentType** = `"REPORT"` \| `"RESOLUTION"` \| `"DECISION"` \| `"DIRECTIVE"` \| `"REGULATION"` \| `"OPINION"` \| `"AMENDMENT"`

Defined in: [types/ep/document.ts:278](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/types/ep/document.ts#L278)

Legislative document type classification.

Categorizes European Parliament documents by their legal nature and
procedural purpose. Each type has specific formatting, voting requirements,
and legal effects. Document types follow EU legislative framework and
EP Rules of Procedure.

**Legislative vs. Non-Legislative:**
- Legislative: REGULATION, DIRECTIVE, DECISION (binding legal acts)
- Non-Legislative: REPORT, RESOLUTION, OPINION, AMENDMENT (political/procedural)

**Legal Effect:**
- Binding: REGULATION, DIRECTIVE, DECISION (after adoption)
- Non-binding: RESOLUTION, OPINION

## Examples

```typescript
// Using in document filtering
const legislativeTypes: DocumentType[] = ["REGULATION", "DIRECTIVE", "DECISION"];
const documents = allDocuments.filter(doc => 
  legislativeTypes.includes(doc.type)
);
```

```typescript
// Type guard for legislative documents
function isLegislative(type: DocumentType): boolean {
  return ["REGULATION", "DIRECTIVE", "DECISION"].includes(type);
}

if (isLegislative(document.type)) {
  console.log("This is binding legislation");
}
```

## See

 - [LegislativeDocument](../interfaces/LegislativeDocument.md) for document structure
 - https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12016E288 (TFEU Article 288 - Legal Acts)
