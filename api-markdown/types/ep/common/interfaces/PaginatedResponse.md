[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/common](../README.md) / PaginatedResponse

# Interface: PaginatedResponse\<T\>

Defined in: [types/ep/common.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L129)

Generic paginated response wrapper for API results.

Standard pagination format used across all European Parliament MCP Server
endpoints. Wraps arrays of data with pagination metadata enabling
efficient iteration through large datasets. Implements offset-based
pagination pattern.

**Pagination Strategy:** Offset-based (not cursor-based)
- Predictable page jumps
- Total count available
- Direct page access
- May miss/duplicate items if data changes during pagination

**Performance Considerations:**
- Cached responses (15 min TTL) for better performance
- Large offsets may have slower query performance
- Recommended limit: 50-100 items per page
- Maximum limit: 100 items per page

## Examples

```typescript
// Basic pagination usage
const response: PaginatedResponse<MEP> = {
  data: [
    { id: "person/124936", name: "Jane Andersson", country: "SE", ... },
    { id: "person/198765", name: "Hans Schmidt", country: "DE", ... }
  ],
  total: 705,
  limit: 50,
  offset: 0,
  hasMore: true
};

console.log(`Showing ${response.data.length} of ${response.total} MEPs`);
console.log(`Current page: ${Math.floor(response.offset / response.limit) + 1}`);
```

```typescript
// Iterating through all pages
async function getAllMEPs(): Promise<MEP[]> {
  const allMEPs: MEP[] = [];
  let offset = 0;
  const limit = 50;
  
  while (true) {
    const response: PaginatedResponse<MEP> = await getMEPs({ 
      limit, 
      offset 
    });
    
    allMEPs.push(...response.data);
    
    if (!response.hasMore) {
      break;
    }
    
    offset += limit;
  }
  
  return allMEPs;
}
```

```typescript
// Calculating pagination metadata
function getPaginationInfo<T>(response: PaginatedResponse<T>) {
  const currentPage = Math.floor(response.offset / response.limit) + 1;
  const totalPages = Math.ceil(response.total / response.limit);
  const itemsOnPage = response.data.length;
  const startItem = response.offset + 1;
  const endItem = response.offset + itemsOnPage;
  
  return {
    currentPage,      // e.g., 3
    totalPages,       // e.g., 15
    startItem,        // e.g., 101
    endItem,          // e.g., 150
    hasNext: response.hasMore,
    hasPrevious: response.offset > 0
  };
}
```

```typescript
// Empty result set
const emptyResponse: PaginatedResponse<MEP> = {
  data: [],
  total: 0,
  limit: 50,
  offset: 0,
  hasMore: false
};
```

```typescript
// Last page (partial page)
const lastPageResponse: PaginatedResponse<MEP> = {
  data: [
    // 5 items only
  ],
  total: 705,
  limit: 50,
  offset: 700,  // Last page
  hasMore: false
};
```

## See

 - MEP for MEP data example
 - VotingRecord for voting record pagination
 - LegislativeDocument for document pagination

## Type Parameters

### T

`T`

The type of items in the data array
 PaginatedResponse

## Properties

### data

> **data**: `T`[]

Defined in: [types/ep/common.ts:167](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L167)

Array of items for current page.

Contains the actual data items for the current page/offset.
Array length may be less than limit on last page or when
fewer items match the query.

**Type:** Array of generic type T
**Min Length:** 0 (empty result set)
**Max Length:** limit value (typically 50-100)

#### Examples

```typescript
// Full page
data: [
  { id: "person/1", name: "MEP 1", ... },
  { id: "person/2", name: "MEP 2", ... },
  // ... 48 more items for limit=50
]
```

```typescript
// Partial page (last page)
data: [
  { id: "person/701", name: "MEP 701", ... },
  { id: "person/702", name: "MEP 702", ... },
  // Only 5 items on last page
]
```

```typescript
// Empty result
data: []
```

***

### hasMore

> **hasMore**: `boolean`

Defined in: [types/ep/common.ts:249](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L249)

Indicates if more items exist beyond current page.

Boolean flag for easy "load more" / "next page" logic. True if
there are more items to fetch after the current page. False on
last page or when all results fit on current page.

**Calculation:** `(offset + data.length) < total`

#### Examples

```ts
true  // More pages available
```

```ts
false // Last page or all results shown
```

```typescript
// Using hasMore for navigation
if (response.hasMore) {
  console.log("Click 'Next' to see more results");
  const nextOffset = response.offset + response.limit;
  // Fetch next page with new offset
} else {
  console.log("You've reached the end of results");
}
```

***

### limit

> **limit**: `number`

Defined in: [types/ep/common.ts:204](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L204)

Maximum items per page (requested page size).

The limit value that was requested for this query. Determines
maximum array size for data field. Actual data length may be
less on last page or with filtered queries.

**EP API Field:** Query parameter `limit`
**Min Value:** 1
**Max Value:** 100 (enforced by API)
**Default:** 50
**Recommended:** 50-100 for performance

#### Examples

```ts
50  // Default page size
```

```ts
100 // Maximum page size
```

```ts
20  // Custom smaller page size
```

***

### offset

> **offset**: `number`

Defined in: [types/ep/common.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L223)

Number of items skipped (pagination offset).

Number of items to skip from the beginning of the result set.
Used for offset-based pagination. To get page N, use
`offset = (N - 1) * limit`.

**EP API Field:** Query parameter `offset`
**Min Value:** 0 (first page)
**Max Value:** total - 1
**Calculation:** `(currentPage - 1) * limit`

#### Examples

```ts
0    // First page
```

```ts
50   // Second page (if limit=50)
```

```ts
100  // Third page (if limit=50)
```

```ts
700  // Page 15 (if limit=50)
```

***

### total

> **total**: `number`

Defined in: [types/ep/common.ts:185](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L185)

Total number of items matching the query.

Total count of all items across all pages that match the current
query/filter criteria. Used for calculating total pages and showing
"X of Y results" displays. Count includes items on all pages, not
just current page.

**Calculation:** `SELECT COUNT(*) FROM ... WHERE ...`
**Min Value:** 0 (no matches)
**Performance:** Cached for efficiency

#### Examples

```ts
705 // Total MEPs in current term
```

```ts
143 // MEPs matching filter (e.g., country="DE")
```

```ts
0   // No matches found
```
