[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / Brand

# Type Alias: Brand\<K, T\>

> **Brand**\<`K`, `T`\> = `K` & `object`

Defined in: [types/branded.ts:31](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/branded.ts#L31)

Branded type for compile-time type safety.
Prevents mixing of different ID types at compile time.

## Type Declaration

### \_\_brand

> **\_\_brand**: `T`

## Type Parameters

### K

`K`

The base type (e.g., string, number)

### T

`T`

The brand identifier (e.g., 'MEPID', 'SessionID')

## Example

```typescript
type UserID = Brand<number, 'UserID'>;
type ProductID = Brand<number, 'ProductID'>;

const userId: UserID = 123 as UserID;
const productId: ProductID = 456 as ProductID;

// This will cause a compile-time error:
// userId = productId; // Error: Type 'ProductID' is not assignable to type 'UserID'
```
