[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/mep](../README.md) / VotingStatistics

# Interface: VotingStatistics

Defined in: [types/ep/mep.ts:419](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/mep.ts#L419)

Voting statistics for an MEP.

Aggregated metrics on an MEP's voting behavior in plenary sessions,
calculated from roll-call votes. Statistics include vote distribution
(for/against/abstain) and attendance rate. Used for transparency and
accountability reporting.

**Calculation Period:** Typically current parliamentary term
**Update Frequency:** After each plenary session (monthly)
**Data Source:** EP API `/meps/{id}/voting-statistics`

**Note:** Only includes recorded roll-call votes, not show-of-hands votes.
Attendance rate may differ from physical attendance as it only counts
voting participation.

 VotingStatistics

## Examples

```typescript
const statistics: VotingStatistics = {
  totalVotes: 1250,
  votesFor: 800,
  votesAgainst: 350,
  abstentions: 100,
  attendanceRate: 92 // 92% participation
};

// Calculate vote percentages
const forPercentage = (statistics.votesFor / statistics.totalVotes * 100).toFixed(1);
console.log(`Voted FOR: ${forPercentage}%`);
```

```typescript
// Low participation example
const lowParticipation: VotingStatistics = {
  totalVotes: 500,
  votesFor: 300,
  votesAgainst: 150,
  abstentions: 50,
  attendanceRate: 45 // Only 45% of possible votes
};
```

## See

 - [MEPDetails](MEPDetails.md) for complete MEP profile
 - VotingRecord for individual vote records

## Properties

### abstentions

> **abstentions**: `number`

Defined in: [types/ep/mep.ts:471](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/mep.ts#L471)

Number of abstentions.

Count of votes where the MEP abstained from voting.
Abstention is a recorded choice distinct from absence.

**Min Value:** 0
**Max Value:** totalVotes

#### Example

```ts
100
```

***

### attendanceRate

> **attendanceRate**: `number`

Defined in: [types/ep/mep.ts:488](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/mep.ts#L488)

Attendance rate as percentage (0 to 100).

Percentage of possible votes where the MEP participated
(voted for, against, or abstained). Does not distinguish
between physical absence and strategic non-participation.

**Calculation:** `(totalVotes / possibleVotes) * 100`
**Format:** Number between 0 and 100
**Schema:** `z.number().min(0).max(100)`

#### Examples

```ts
92.5 // 92.5% attendance
```

```ts
78   // 78% attendance
```

```ts
100  // 100% attendance (perfect record)
```

***

### totalVotes

> **totalVotes**: `number`

Defined in: [types/ep/mep.ts:432](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/mep.ts#L432)

Total number of votes cast.

Sum of all recorded votes (for + against + abstentions).
Does not include missed votes or votes without recorded position.

**Calculation:** `votesFor + votesAgainst + abstentions`
**Typical Range:** 500-2000 per term
**Min Value:** 0

#### Example

```ts
1250
```

***

### votesAgainst

> **votesAgainst**: `number`

Defined in: [types/ep/mep.ts:458](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/mep.ts#L458)

Number of votes against.

Count of votes where the MEP voted "AGAINST" or "NO" on a measure.
Indicates opposition voting behavior.

**Min Value:** 0
**Max Value:** totalVotes

#### Example

```ts
350
```

***

### votesFor

> **votesFor**: `number`

Defined in: [types/ep/mep.ts:445](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/mep.ts#L445)

Number of votes in favor.

Count of votes where the MEP voted "FOR" or "YES" on a measure.
Indicates supportive voting behavior.

**Min Value:** 0
**Max Value:** totalVotes

#### Example

```ts
800
```
