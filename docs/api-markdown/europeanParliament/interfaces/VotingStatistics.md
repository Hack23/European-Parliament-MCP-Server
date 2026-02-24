[**European Parliament MCP Server API v0.7.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [europeanParliament](../README.md) / VotingStatistics

# Interface: VotingStatistics

Defined in: [types/europeanParliament.ts:495](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L495)

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
  attendanceRate: 0.92 // 92% participation
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
  attendanceRate: 0.45 // Only 45% of possible votes
};
```

## See

 - [MEPDetails](MEPDetails.md) for complete MEP profile
 - [VotingRecord](VotingRecord.md) for individual vote records

## Properties

### abstentions

> **abstentions**: `number`

Defined in: [types/europeanParliament.ts:547](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L547)

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

Defined in: [types/europeanParliament.ts:564](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L564)

Attendance rate as decimal (0.0 to 1.0).

Percentage of possible votes where the MEP participated
(voted for, against, or abstained). Does not distinguish
between physical absence and strategic non-participation.

**Calculation:** `totalVotes / possibleVotes`
**Format:** Decimal between 0.0 and 1.0
**Display:** Multiply by 100 for percentage

#### Examples

```ts
0.92 // 92% attendance
```

```ts
0.78 // 78% attendance
```

```ts
1.0  // 100% attendance (perfect record)
```

***

### totalVotes

> **totalVotes**: `number`

Defined in: [types/europeanParliament.ts:508](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L508)

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

Defined in: [types/europeanParliament.ts:534](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L534)

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

Defined in: [types/europeanParliament.ts:521](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/europeanParliament.ts#L521)

Number of votes in favor.

Count of votes where the MEP voted "FOR" or "YES" on a measure.
Indicates supportive voting behavior.

**Min Value:** 0
**Max Value:** totalVotes

#### Example

```ts
800
```
