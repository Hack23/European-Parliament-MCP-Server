[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/plenary](../README.md) / VotingRecord

# Interface: VotingRecord

Defined in: [types/ep/plenary.ts:253](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L253)

Voting record for a plenary vote.

Represents a single roll-call vote conducted during a plenary session.
Includes vote topic, timestamp, aggregate results, final outcome, and
optionally individual MEP voting positions. Roll-call votes are recorded
electronically and published for transparency.

**Vote Types:**
- Legislative votes (ordinary/special legislative procedure)
- Budget votes
- Resolution votes
- Procedural votes
- Amendments

**Quorum:** Simple majority of component MEPs (currently 353 of 705)
**Special Majorities:** Some votes require absolute majority or 2/3 majority

**Data Source:** EP API `/voting-records`

 VotingRecord

## Examples

```typescript
const vote: VotingRecord = {
  id: "VOTE-2024-11-20-001",
  sessionId: "P9-2024-11-20",
  topic: "Amendment 47 to Digital Services Act",
  date: "2024-11-20T14:30:00Z",
  votesFor: 385,
  votesAgainst: 210,
  abstentions: 45,
  result: "ADOPTED",
  mepVotes: {
    "person/124936": "FOR",
    "person/100000": "AGAINST",
    "person/198765": "ABSTAIN"
  }
};

// Calculate total participation
const totalVotes = vote.votesFor + vote.votesAgainst + vote.abstentions;
console.log(`${totalVotes} MEPs participated in this vote`);
```

```typescript
// Vote without individual MEP positions (aggregate only)
const aggregateVote: VotingRecord = {
  id: "VOTE-2024-11-21-015",
  sessionId: "P9-2024-11-21",
  topic: "Approval of 2025 Budget",
  date: "2024-11-21T18:45:00Z",
  votesFor: 420,
  votesAgainst: 180,
  abstentions: 55,
  result: "ADOPTED"
};
```

## See

 - [PlenarySession](PlenarySession.md) for session context
 - MEP for voter information
 - https://www.europarl.europa.eu/plenary/en/votes.html

## Properties

### abstentions

> **abstentions**: `number`

Defined in: [types/ep/plenary.ts:358](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L358)

Number of abstentions.

Count of MEPs who abstained from the vote. Abstention is
a recorded position distinct from absence.

**EP API Field:** `abstentions`
**Min Value:** 0
**Max Value:** Current EP size (typically 705)

#### Examples

```ts
45
```

```ts
55
```

***

### date

> **date**: `string`

Defined in: [types/ep/plenary.ts:314](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L314)

Vote timestamp.

Date and time when the vote was conducted in ISO 8601 format with
timezone (UTC). Precise timing important for procedural records
and vote sequencing.

**EP API Field:** `date` or `timestamp`
**Format:** ISO 8601 datetime with timezone (YYYY-MM-DDTHH:MM:SSZ)
**Validation:** Must be valid ISO 8601 datetime

#### Examples

```ts
"2024-11-20T14:30:00Z"
```

```ts
"2024-11-21T18:45:00Z"
```

***

### id

> **id**: `string`

Defined in: [types/ep/plenary.ts:267](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L267)

Unique voting record identifier.

Format: "VOTE-{date}-{sequence}" where sequence is vote number
within the session day.

**EP API Field:** `identifier`
**Format Pattern:** `VOTE-YYYY-MM-DD-NNN`
**Validation:** Must match `/^VOTE-\d{4}-\d{2}-\d{2}-\d{3}$/`

#### Examples

```ts
"VOTE-2024-11-20-001"
```

```ts
"VOTE-2024-11-20-042"
```

***

### result

> **result**: `"ADOPTED"` \| `"REJECTED"`

Defined in: [types/ep/plenary.ts:376](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L376)

Vote result outcome.

Final outcome of the vote based on voting rules (typically simple
majority). "ADOPTED" means the measure passed, "REJECTED" means
it failed.

**EP API Field:** `result`

**Values:**
- "ADOPTED" - Measure passed (votesFor > votesAgainst, meeting quorum)
- "REJECTED" - Measure failed (votesFor <= votesAgainst or quorum not met)

#### Examples

```ts
"ADOPTED"
```

```ts
"REJECTED"
```

***

### sessionId

> **sessionId**: `string`

Defined in: [types/ep/plenary.ts:282](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L282)

Associated plenary session ID.

References the plenary session where this vote took place.
Links vote to session context including location and broader agenda.

**EP API Field:** `sessionId`
**Format:** Matches PlenarySession.id format

#### Example

```ts
"P9-2024-11-20"
```

#### See

[PlenarySession](PlenarySession.md) for session details

***

### topic

> **topic**: `string`

Defined in: [types/ep/plenary.ts:298](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L298)

Vote topic or subject matter.

Human-readable description of what was being voted on. May include
legislative reference, amendment number, or resolution title.
Typically concise (50-200 characters).

**EP API Field:** `title` or `subject`
**Max Length:** Typically 200 characters

#### Examples

```ts
"Amendment 47 to Digital Services Act (Article 5)"
```

```ts
"Motion for resolution on climate emergency"
```

```ts
"Final vote on 2025 EU Budget"
```

***

### votesAgainst

> **votesAgainst**: `number`

Defined in: [types/ep/plenary.ts:343](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L343)

Number of votes against.

Count of MEPs who voted "AGAINST" or "NO" on the measure.

**EP API Field:** `against`
**Min Value:** 0
**Max Value:** Current EP size (typically 705)

#### Examples

```ts
210
```

```ts
180
```

***

### votesFor

> **votesFor**: `number`

Defined in: [types/ep/plenary.ts:329](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L329)

Number of votes in favor.

Count of MEPs who voted "FOR" or "YES" on the measure.
Combined with votesAgainst and abstentions determines outcome.

**EP API Field:** `for` or `favour`
**Min Value:** 0
**Max Value:** Current EP size (typically 705)

#### Examples

```ts
385
```

```ts
420
```

***

### mepVotes?

> `optional` **mepVotes**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `"FOR"` \| `"AGAINST"` \| `"ABSTAIN"`\>

Defined in: [types/ep/plenary.ts:403](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/plenary.ts#L403)

Individual MEP voting positions.

Map of MEP IDs to their vote position for this specific vote.
Optional as individual positions may not always be published or
may be available separately. Used for transparency and voting
pattern analysis.

**EP API Field:** `individualVotes`
**Key:** MEP ID (format: "person/{id}")
**Value:** Vote position enum

**Vote Positions:**
- "FOR" - Voted in favor
- "AGAINST" - Voted against
- "ABSTAIN" - Abstained from voting

#### Example

```ts
{
   *   "person/124936": "FOR",
   *   "person/100000": "AGAINST",
   *   "person/198765": "ABSTAIN"
   * }
```

#### See

MEP for MEP details
