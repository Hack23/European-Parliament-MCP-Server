[**European Parliament MCP Server API v1.0.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / di/tokens

# di/tokens

Typed Dependency Injection tokens.

Each token is a unique Symbol used to register and resolve a service
from the DIContainer.  Centralising them here avoids "magic"
inline Symbol literals and guarantees consistent identifiers across
the whole application.

ISMS Policy: AC-003 (Least Privilege), SC-002 (Input Validation)

## Example

```typescript
import { TOKENS } from './tokens.js';
import { container } from './container.js';

const metricsService = container.resolve<MetricsService>(TOKENS.MetricsService);
```

## Type Aliases

- [DIToken](type-aliases/DIToken.md)

## Variables

- [TOKENS](variables/TOKENS.md)
