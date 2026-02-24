/**
 * Plenary session and voting record type definitions.
 *
 * Interfaces for EP plenary sessions, roll-call votes, and vote outcomes.
 *
 * @module types/ep/plenary
 * @see https://data.europarl.europa.eu/api/v2/
 */

/**
 * Plenary session information.
 * 
 * Represents a plenary sitting of the European Parliament where MEPs debate
 * and vote on legislation. Plenary sessions typically occur in Strasbourg
 * (monthly) and Brussels (additional sessions). Each session includes
 * agenda items, voting records, attendance tracking, and associated documents.
 * 
 * **Schedule:** 
 * - Monthly plenary: 3-4 days in Strasbourg (mandatory)
 * - Additional sessions: Brussels as needed
 * - Mini-plenaries: 2-day Brussels sessions
 * 
 * **Data Source:** EP API `/plenary-sessions`
 * 
 * @interface PlenarySession
 * 
 * @example
 * ```typescript
 * const session: PlenarySession = {
 *   id: "P9-2024-11-20",
 *   date: "2024-11-20",
 *   location: "Strasbourg",
 *   agendaItems: [
 *     "Debate on climate policy",
 *     "Vote on digital services act amendments",
 *     "Question time with Commission President"
 *   ],
 *   votingRecords: [
 *     // Array of VotingRecord objects
 *   ],
 *   attendanceCount: 680,
 *   documents: ["DOC-2024-11-20-001", "DOC-2024-11-20-002"]
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Brussels mini-plenary
 * const miniPlenary: PlenarySession = {
 *   id: "P9-2024-11-15",
 *   date: "2024-11-15",
 *   location: "Brussels",
 *   agendaItems: [
 *     "Urgent resolution on humanitarian crisis",
 *     "Vote on budgetary amendment"
 *   ],
 *   attendanceCount: 450
 * };
 * ```
 * 
 * @see {@link VotingRecord} for individual vote details
 * @see {@link LegislativeDocument} for session documents
 * @see https://www.europarl.europa.eu/plenary/en/home.html
 */
export interface PlenarySession {
  /**
   * Unique session identifier.
   * 
   * Format: "{term}-{year}-{month}-{day}" where term is parliamentary term
   * (e.g., P9 for 9th term, P10 for 10th term).
   * 
   * **EP API Field:** `identifier`
   * **Format Pattern:** `P{term}-YYYY-MM-DD`
   * **Validation:** Must match `/^P\d+-\d{4}-\d{2}-\d{2}$/`
   * 
   * @example "P9-2024-11-20" // 9th term, November 20, 2024
   * @example "P10-2025-01-15" // 10th term, January 15, 2025
   */
  id: string;

  /**
   * Session date.
   * 
   * Primary date of the plenary session in ISO 8601 format.
   * Multi-day sessions use the start date. Full date range
   * available through EP API session details.
   * 
   * **EP API Field:** `date`
   * **Format:** ISO 8601 date (YYYY-MM-DD)
   * **Validation:** Must be valid date, typically between 1952 and current date + 1 year
   * 
   * @example "2024-11-20"
   * @example "2025-01-15"
   */
  date: string;

  /**
   * Session location.
   * 
   * Physical location where the plenary session takes place.
   * EU treaties mandate monthly plenaries in Strasbourg, with
   * additional sessions possible in Brussels.
   * 
   * **EP API Field:** `location`
   * 
   * **Valid Values:**
   * - "Strasbourg" - Monthly plenary sessions (treaty-mandated)
   * - "Brussels" - Additional and mini-plenary sessions
   * 
   * @example "Strasbourg"
   * @example "Brussels"
   */
  location: string;

  /**
   * Agenda items for the session.
   * 
   * Ordered list of agenda topics, debates, votes, and question times.
   * Agenda items may include legislative debates, resolutions, reports,
   * Commission statements, and question times. Order reflects
   * session schedule.
   * 
   * **EP API Field:** `agendaItems`
   * **Typical Count:** 10-30 items per session
   * 
   * @example [
   *   "Debate on climate policy framework",
   *   "Vote on Digital Services Act amendments",
   *   "Question time with Commission President",
   *   "Resolution on humanitarian crisis in Region X"
   * ]
   */
  agendaItems: string[];

  /**
   * Voting records from the session.
   * 
   * Array of all roll-call votes conducted during the plenary session.
   * Optional as not all sessions include votes, or votes may be
   * recorded separately. Each record includes topic, result, and
   * individual MEP votes.
   * 
   * **EP API Field:** `votingRecords`
   * **Typical Count:** 20-100 votes per session
   * 
   * @see {@link VotingRecord} for vote structure
   */
  votingRecords?: VotingRecord[];

  /**
   * Total attendance count.
   * 
   * Number of MEPs present during the session (or at peak attendance
   * for multi-day sessions). Attendance is tracked for quorum purposes
   * and transparency reporting.
   * 
   * **EP API Field:** `attendanceCount`
   * **Min Value:** 0
   * **Max Value:** 705 (current EP size, may change with expansions)
   * **Typical Range:** 400-680
   * 
   * @example 680 // High attendance
   * @example 450 // Brussels mini-plenary
   */
  attendanceCount?: number;

  /**
   * Associated document identifiers.
   * 
   * Array of document IDs related to the session (agendas, minutes,
   * verbatim reports, adopted texts). Documents available through
   * EP document API.
   * 
   * **EP API Field:** `documents`
   * 
   * **Document Types:**
   * - Session agenda (OJ C series)
   * - Minutes of proceedings
   * - Verbatim report of debates
   * - Texts adopted
   * 
   * @example ["DOC-2024-11-20-001", "A9-0123/2024", "P9_PV(2024)11-20"]
   * 
   * @see {@link LegislativeDocument} for document details
   */
  documents?: string[];
}

/**
 * Voting record for a plenary vote.
 * 
 * Represents a single roll-call vote conducted during a plenary session.
 * Includes vote topic, timestamp, aggregate results, final outcome, and
 * optionally individual MEP voting positions. Roll-call votes are recorded
 * electronically and published for transparency.
 * 
 * **Vote Types:**
 * - Legislative votes (ordinary/special legislative procedure)
 * - Budget votes
 * - Resolution votes
 * - Procedural votes
 * - Amendments
 * 
 * **Quorum:** Simple majority of component MEPs (currently 353 of 705)
 * **Special Majorities:** Some votes require absolute majority or 2/3 majority
 * 
 * **Data Source:** EP API `/voting-records`
 * 
 * @interface VotingRecord
 * 
 * @example
 * ```typescript
 * const vote: VotingRecord = {
 *   id: "VOTE-2024-11-20-001",
 *   sessionId: "P9-2024-11-20",
 *   topic: "Amendment 47 to Digital Services Act",
 *   date: "2024-11-20T14:30:00Z",
 *   votesFor: 385,
 *   votesAgainst: 210,
 *   abstentions: 45,
 *   result: "ADOPTED",
 *   mepVotes: {
 *     "person/124936": "FOR",
 *     "person/100000": "AGAINST",
 *     "person/198765": "ABSTAIN"
 *   }
 * };
 * 
 * // Calculate total participation
 * const totalVotes = vote.votesFor + vote.votesAgainst + vote.abstentions;
 * console.log(`${totalVotes} MEPs participated in this vote`);
 * ```
 * 
 * @example
 * ```typescript
 * // Vote without individual MEP positions (aggregate only)
 * const aggregateVote: VotingRecord = {
 *   id: "VOTE-2024-11-21-015",
 *   sessionId: "P9-2024-11-21",
 *   topic: "Approval of 2025 Budget",
 *   date: "2024-11-21T18:45:00Z",
 *   votesFor: 420,
 *   votesAgainst: 180,
 *   abstentions: 55,
 *   result: "ADOPTED"
 * };
 * ```
 * 
 * @see {@link PlenarySession} for session context
 * @see {@link MEP} for voter information
 * @see https://www.europarl.europa.eu/plenary/en/votes.html
 */
export interface VotingRecord {
  /**
   * Unique voting record identifier.
   * 
   * Format: "VOTE-{date}-{sequence}" where sequence is vote number
   * within the session day.
   * 
   * **EP API Field:** `identifier`
   * **Format Pattern:** `VOTE-YYYY-MM-DD-NNN`
   * **Validation:** Must match `/^VOTE-\d{4}-\d{2}-\d{2}-\d{3}$/`
   * 
   * @example "VOTE-2024-11-20-001"
   * @example "VOTE-2024-11-20-042"
   */
  id: string;

  /**
   * Associated plenary session ID.
   * 
   * References the plenary session where this vote took place.
   * Links vote to session context including location and broader agenda.
   * 
   * **EP API Field:** `sessionId`
   * **Format:** Matches PlenarySession.id format
   * 
   * @example "P9-2024-11-20"
   * 
   * @see {@link PlenarySession} for session details
   */
  sessionId: string;

  /**
   * Vote topic or subject matter.
   * 
   * Human-readable description of what was being voted on. May include
   * legislative reference, amendment number, or resolution title.
   * Typically concise (50-200 characters).
   * 
   * **EP API Field:** `title` or `subject`
   * **Max Length:** Typically 200 characters
   * 
   * @example "Amendment 47 to Digital Services Act (Article 5)"
   * @example "Motion for resolution on climate emergency"
   * @example "Final vote on 2025 EU Budget"
   */
  topic: string;

  /**
   * Vote timestamp.
   * 
   * Date and time when the vote was conducted in ISO 8601 format with
   * timezone (UTC). Precise timing important for procedural records
   * and vote sequencing.
   * 
   * **EP API Field:** `date` or `timestamp`
   * **Format:** ISO 8601 datetime with timezone (YYYY-MM-DDTHH:MM:SSZ)
   * **Validation:** Must be valid ISO 8601 datetime
   * 
   * @example "2024-11-20T14:30:00Z"
   * @example "2024-11-21T18:45:00Z"
   */
  date: string;

  /**
   * Number of votes in favor.
   * 
   * Count of MEPs who voted "FOR" or "YES" on the measure.
   * Combined with votesAgainst and abstentions determines outcome.
   * 
   * **EP API Field:** `for` or `favour`
   * **Min Value:** 0
   * **Max Value:** Current EP size (typically 705)
   * 
   * @example 385
   * @example 420
   */
  votesFor: number;

  /**
   * Number of votes against.
   * 
   * Count of MEPs who voted "AGAINST" or "NO" on the measure.
   * 
   * **EP API Field:** `against`
   * **Min Value:** 0
   * **Max Value:** Current EP size (typically 705)
   * 
   * @example 210
   * @example 180
   */
  votesAgainst: number;

  /**
   * Number of abstentions.
   * 
   * Count of MEPs who abstained from the vote. Abstention is
   * a recorded position distinct from absence.
   * 
   * **EP API Field:** `abstentions`
   * **Min Value:** 0
   * **Max Value:** Current EP size (typically 705)
   * 
   * @example 45
   * @example 55
   */
  abstentions: number;

  /**
   * Vote result outcome.
   * 
   * Final outcome of the vote based on voting rules (typically simple
   * majority). "ADOPTED" means the measure passed, "REJECTED" means
   * it failed.
   * 
   * **EP API Field:** `result`
   * 
   * **Values:**
   * - "ADOPTED" - Measure passed (votesFor > votesAgainst, meeting quorum)
   * - "REJECTED" - Measure failed (votesFor <= votesAgainst or quorum not met)
   * 
   * @example "ADOPTED"
   * @example "REJECTED"
   */
  result: 'ADOPTED' | 'REJECTED';

  /**
   * Individual MEP voting positions.
   * 
   * Map of MEP IDs to their vote position for this specific vote.
   * Optional as individual positions may not always be published or
   * may be available separately. Used for transparency and voting
   * pattern analysis.
   * 
   * **EP API Field:** `individualVotes`
   * **Key:** MEP ID (format: "person/{id}")
   * **Value:** Vote position enum
   * 
   * **Vote Positions:**
   * - "FOR" - Voted in favor
   * - "AGAINST" - Voted against
   * - "ABSTAIN" - Abstained from voting
   * 
   * @example {
   *   "person/124936": "FOR",
   *   "person/100000": "AGAINST",
   *   "person/198765": "ABSTAIN"
   * }
   * 
   * @see {@link MEP} for MEP details
   */
  mepVotes?: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>;
}
