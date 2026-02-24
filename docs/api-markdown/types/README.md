[**European Parliament MCP Server API v0.7.2**](../README.md)

***

[European Parliament MCP Server API](../modules.md) / types

# types

Type Definitions for European Parliament MCP Server

This module exports all custom type definitions used throughout the server,
including branded types for compile-time safety and custom error classes
for structured error handling.

**Intelligence Perspective:** Type-safe identifiers (MEPID, SessionID, CommitteeID) ensure
data integrity across intelligence analysis pipelines and prevent cross-contamination of
different entity types in analytical products.

**Business Perspective:** Branded types and structured errors provide enterprise-grade
reliability guarantees—essential for premium API tier customers and partner integrations.

**Marketing Perspective:** Advanced TypeScript patterns demonstrate technical excellence—
key for developer advocacy and attracting TypeScript-savvy contributors and customers.

**Branded Types:**
- Prevent mixing of different ID types at compile time
- Include type guards and factory functions for validation
- Ensure type safety for European Parliament data identifiers

**Error Classes:**
- Structured error handling with proper status codes
- GDPR-compliant error sanitization
- Type-safe error formatting for MCP responses

## See

 - branded - Branded type definitions
 - errors - Custom error classes

## References

### Brand

Re-exports [Brand](branded/type-aliases/Brand.md)

***

### CommitteeID

Re-exports [CommitteeID](branded/type-aliases/CommitteeID.md)

***

### createCommitteeID

Re-exports [createCommitteeID](branded/functions/createCommitteeID.md)

***

### createDocumentID

Re-exports [createDocumentID](branded/functions/createDocumentID.md)

***

### createGroupID

Re-exports [createGroupID](branded/functions/createGroupID.md)

***

### createMEPID

Re-exports [createMEPID](branded/functions/createMEPID.md)

***

### createSessionID

Re-exports [createSessionID](branded/functions/createSessionID.md)

***

### DocumentID

Re-exports [DocumentID](branded/type-aliases/DocumentID.md)

***

### EPAPIError

Re-exports [EPAPIError](errors/classes/EPAPIError.md)

***

### formatMCPError

Re-exports [formatMCPError](errors/functions/formatMCPError.md)

***

### GDPRComplianceError

Re-exports [GDPRComplianceError](errors/classes/GDPRComplianceError.md)

***

### GroupID

Re-exports [GroupID](branded/type-aliases/GroupID.md)

***

### isCommitteeID

Re-exports [isCommitteeID](branded/functions/isCommitteeID.md)

***

### isDocumentID

Re-exports [isDocumentID](branded/functions/isDocumentID.md)

***

### isGroupID

Re-exports [isGroupID](branded/functions/isGroupID.md)

***

### isMCPServerError

Re-exports [isMCPServerError](errors/functions/isMCPServerError.md)

***

### isMEPID

Re-exports [isMEPID](branded/functions/isMEPID.md)

***

### isSessionID

Re-exports [isSessionID](branded/functions/isSessionID.md)

***

### MCPServerError

Re-exports [MCPServerError](errors/classes/MCPServerError.md)

***

### MEPID

Re-exports [MEPID](branded/type-aliases/MEPID.md)

***

### RateLimitError

Re-exports [RateLimitError](errors/classes/RateLimitError.md)

***

### SessionID

Re-exports [SessionID](branded/type-aliases/SessionID.md)

***

### ValidationError

Re-exports [ValidationError](errors/classes/ValidationError.md)
