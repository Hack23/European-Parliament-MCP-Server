[**European Parliament MCP Server API v1.2.18**](../../../../README.md)

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

Defined in: [types/ep/common.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L303)

Indicates if more items may exist beyond the current page.

Boolean flag for "load more" / "next page" logic. When `true`,
another page may exist and the caller should fetch it. When `false`,
the current page is definitively the last one.

For **server-paginated** results this is a heuristic based on the
underlying server page fullness, not always on the filtered
`data.length` returned to the caller:
- For ordinary server-paginated endpoints, `hasMore` is typically
  derived from server page fullness (effectively whether the server
  returned `limit` items). A full page suggests more data may follow,
  but can be a **false positive** when the dataset size is an exact
  multiple of `limit`.
- For **client-filtered server endpoints** (e.g. `getPlenarySessions`,
  `getParliamentaryQuestions`), `hasMore` is derived from the
  **unfiltered server page size** before client-side filtering. This
  means `hasMore` can be `true` even when the filtered `data` array
  contains fewer than `limit` items or is empty.
- **Exception — `searchDocuments`:** `hasMore` still reflects pre-filter
  server page fullness (so callers continue paginating for more matches),
  but `total` is derived from the post-filter `data.length` — guaranteeing
  the identity `total === offset + data.length + (hasMore ? 1 : 0)`.

Callers should paginate until `hasMore` is `false`. For **in-memory
paginated** results, `hasMore` is exact: `(offset + data.length) < total`.

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

Defined in: [types/ep/common.ts:239](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L239)

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

Defined in: [types/ep/common.ts:258](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L258)

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

Defined in: [types/ep/common.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/common.ts#L220)

Total number of items matching the query (exact or heuristic estimate).

For **in-memory paginated** results (e.g. `getCurrentMEPs` with filters,
`getVotingRecords`), this is the **exact** count of all matching items.

For **server-paginated** results where the EP API does not return a total
count header, this is a **heuristic sentinel**:
- On the **last page** (`hasMore === false`): the value is exact
  (`offset + data.length`), **assuming `offset` is within the actual
  result range**. If the caller requests an out-of-range `offset`
  (beyond the dataset), the EP API returns an empty page and `total`
  becomes `offset`, which may overestimate the real count.
- On **earlier pages** (`hasMore === true`): the value is
  `offset + data.length + 1`. This signals that more data may exist
  but may **overestimate by 1** when the dataset size is an exact
  multiple of `limit` (i.e., the last server page is exactly full).

For **client-filtered server endpoints** (e.g. `getPlenarySessions` with
location, `getParliamentaryQuestions` with author/topic), `total` and
`hasMore` are derived from the **unfiltered server page size**, not
from `data.length` after client-side filtering. This means `hasMore` can
be `true` even when the filtered `data` array is empty, and `total` will
not reflect the count of filtered matches.

**Exception — `searchDocuments`:** `total` is derived from the
**post-filter** `data.length`, not the unfiltered server page size.
Concretely, this endpoint guarantees the envelope identity
`total === offset + data.length + (hasMore ? 1 : 0)` while `hasMore`
remains pre-filter (server page fullness). Note that `total` here is a
**pagination-envelope sentinel**, not a count of items matching the
post-filter query: because `offset` is the raw server offset (not a
cumulative count of filtered matches across previous pages), `total`
may exceed the true number of matches. Its role is purely to keep the
envelope internally consistent. This prevents misleading responses such
as `data:[] total:21 hasMore:true` when a full server page is
eliminated by keyword/committee/date filters (the new envelope in that
case is `data:[] total:1 hasMore:true`). Callers should still paginate
until `hasMore === false` to enumerate all matches.

**Do not** use this value for exact "X of Y" UI or page-count
calculations on server-paginated endpoints. Instead, iterate all
pages (using `hasMore`) to determine the true dataset size.

**Min Value:** 0 (no matches)

#### Examples

```ts
705 // Exact total from in-memory pagination
```

```ts
51  // Heuristic: offset=0, data.length=50, hasMore=true (may overestimate by 1)
```

```ts
23  // Exact on last page: offset=20, data.length=3, hasMore=false
```

```ts
0   // No matches found
```
