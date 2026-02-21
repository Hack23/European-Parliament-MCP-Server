/**
 * Type definitions for European Parliament data structures
 * 
 * This module provides type-safe interfaces for European Parliament Open Data Portal.
 * All types follow strict TypeScript standards and include runtime validation schemas.
 * 
 * **Intelligence Perspective:** These types form the foundation for political intelligence
 * products—MEP profiling, voting analysis, coalition detection, and legislative monitoring.
 * Each interface maps to a distinct OSINT collection target from EP open data.
 * 
 * **Business Perspective:** Type-safe data contracts enabling reliable API products,
 * enterprise integrations, and premium data services for B2B/B2G customers.
 * 
 * **Marketing Perspective:** Well-documented types demonstrate API quality and developer
 * experience—key for developer advocacy, documentation SEO, and technical marketing.
 * 
 * **Data Source:** European Parliament Open Data Portal v2
 * @see https://data.europarl.europa.eu/api/v2/
 * 
 * **ISMS Policy:** SC-002 (Secure Coding Standards)
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 * 
 * **GDPR Compliance:** Personal data fields marked with @gdpr tag
 * @see https://gdpr-info.eu/
 * 
 * @module europeanParliament
 */

/**
 * Member of the European Parliament.
 * 
 * Contains biographical information, political affiliation, committee memberships,
 * and contact information for current and former MEPs. All dates in ISO 8601 format.
 * Personal data fields (email, phone, address) are GDPR-protected and require audit
 * logging for access per ISMS Policy AU-002.
 * 
 * **Data Source:** EP API `/meps` endpoint
 * 
 * **Identifiers:** MEP IDs follow format "person/{numeric-id}" and remain stable
 * across parliamentary terms to maintain historical continuity.
 * 
 * **Country Codes:** ISO 3166-1 alpha-2 format (e.g., "SE", "DE", "FR")
 * 
 * **Political Groups:** Abbreviations include EPP, S&D, Renew, Greens/EFA, ECR,
 * ID, The Left, NI (Non-Inscrits)
 * 
 * @interface MEP
 * 
 * @example
 * ```typescript
 * const mep: MEP = {
 *   id: "person/124936",
 *   name: "Jane Marie Andersson",
 *   country: "SE",
 *   politicalGroup: "S&D",
 *   committees: ["DEVE", "ENVI"],
 *   email: "jane.andersson@europarl.europa.eu",
 *   active: true,
 *   termStart: "2019-07-02",
 *   termEnd: undefined
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Former MEP with term end date
 * const formerMEP: MEP = {
 *   id: "person/100000",
 *   name: "John Smith",
 *   country: "UK",
 *   politicalGroup: "ECR",
 *   committees: ["AFET"],
 *   active: false,
 *   termStart: "2014-07-01",
 *   termEnd: "2020-01-31"
 * };
 * ```
 * 
 * @see {@link MEPDetails} for extended biographical information
 * @see {@link Committee} for committee data structure
 * @see {@link VotingStatistics} for voting behavior analysis
 * @see https://data.europarl.europa.eu/en/developer-corner/opendata-api
 * 
 * @gdpr Contains personal data (email) - requires audit logging
 */
export interface MEP {
  /**
   * Unique MEP identifier.
   * 
   * Format: "person/{numeric-id}" or numeric string
   * Stable across parliamentary terms for historical tracking.
   * 
   * **EP API Field:** `identifier`
   * 
   * @example "person/124936"
   * @example "197789"
   */
  id: string;

  /**
   * Full name in official format.
   * 
   * Format: "FirstName MiddleName(s) LastName"
   * May include titles in some cases.
   * 
   * **EP API Field:** `label`
   * 
   * @example "Jane Marie Andersson"
   * @example "Dr. Hans-Peter Schmidt"
   */
  name: string;

  /**
   * Country of representation.
   * 
   * ISO 3166-1 alpha-2 country code (2 uppercase letters).
   * Represents the EU member state the MEP represents.
   * 
   * **EP API Field:** `country`
   * **Validation:** Must match `/^[A-Z]{2}$/`
   * 
   * @example "SE" (Sweden)
   * @example "DE" (Germany)
   * @example "FR" (France)
   */
  country: string;

  /**
   * Political group affiliation.
   * 
   * Abbreviation of the political group in the European Parliament.
   * Groups may change during parliamentary terms due to realignments.
   * 
   * **EP API Field:** `politicalGroup`
   * 
   * **Common Values:**
   * - "EPP" - European People's Party (Christian Democrats)
   * - "S&D" - Progressive Alliance of Socialists and Democrats
   * - "Renew" - Renew Europe (Liberals)
   * - "Greens/EFA" - Greens/European Free Alliance
   * - "ECR" - European Conservatives and Reformists
   * - "ID" - Identity and Democracy
   * - "The Left" - The Left in the European Parliament
   * - "NI" - Non-Inscrits (Non-attached members)
   * 
   * @example "S&D"
   * @example "EPP"
   */
  politicalGroup: string;

  /**
   * Committee memberships.
   * 
   * Array of committee abbreviations where the MEP serves as member,
   * substitute, chair, or vice-chair. MEPs typically serve on 1-2
   * standing committees plus temporary committees/delegations.
   * 
   * **EP API Field:** `committeeRoles`
   * 
   * **Common Committees:**
   * - "AFET" - Foreign Affairs
   * - "DEVE" - Development
   * - "INTA" - International Trade
   * - "BUDG" - Budgets
   * - "CONT" - Budgetary Control
   * - "ECON" - Economic and Monetary Affairs
   * - "EMPL" - Employment and Social Affairs
   * - "ENVI" - Environment, Public Health and Food Safety
   * - "ITRE" - Industry, Research and Energy
   * - "IMCO" - Internal Market and Consumer Protection
   * - "TRAN" - Transport and Tourism
   * - "REGI" - Regional Development
   * - "AGRI" - Agriculture and Rural Development
   * - "PECH" - Fisheries
   * - "CULT" - Culture and Education
   * - "JURI" - Legal Affairs
   * - "LIBE" - Civil Liberties, Justice and Home Affairs
   * - "AFCO" - Constitutional Affairs
   * - "FEMM" - Women's Rights and Gender Equality
   * - "PETI" - Petitions
   * 
   * @example ["DEVE", "ENVI"]
   * @example ["ECON", "BUDG", "CONT"]
   * 
   * @see {@link Committee} for committee details
   */
  committees: string[];

  /**
   * Official European Parliament email address.
   * 
   * Standard format: firstname.lastname@europarl.europa.eu
   * Optional field as some MEPs may not have public email or may
   * have left office.
   * 
   * **EP API Field:** `email`
   * **Validation:** Must be valid email format
   * 
   * @example "jane.andersson@europarl.europa.eu"
   * 
   * @gdpr Personal data - requires audit logging per ISMS AU-002
   */
  email?: string;

  /**
   * Current active status.
   * 
   * Indicates if the MEP is currently serving in the European Parliament.
   * False for former MEPs or those who resigned/were replaced.
   * 
   * **EP API Field:** `active`
   * 
   * @example true  // Currently serving
   * @example false // Former MEP
   */
  active: boolean;

  /**
   * Term start date.
   * 
   * Date when the MEP's term began in ISO 8601 format (YYYY-MM-DD).
   * For current MEPs, typically aligned with parliamentary term start.
   * For replacements, may be mid-term.
   * 
   * **EP API Field:** `termStart`
   * **Format:** ISO 8601 date (YYYY-MM-DD)
   * **Validation:** Must be valid date, typically after 1952-07-23 (first ECSC assembly)
   * 
   * @example "2019-07-02" // 9th parliamentary term start
   * @example "2024-07-16" // 10th parliamentary term start
   */
  termStart: string;

  /**
   * Term end date.
   * 
   * Date when the MEP's term ended in ISO 8601 format (YYYY-MM-DD).
   * Undefined for currently active MEPs. Set for former MEPs who
   * completed their term, resigned, or were replaced.
   * 
   * **EP API Field:** `termEnd`
   * **Format:** ISO 8601 date (YYYY-MM-DD)
   * **Validation:** Must be valid date after termStart if present
   * 
   * @example "2024-07-15" // End of 9th term
   * @example "2020-01-31" // Brexit date for UK MEPs
   */
  termEnd?: string;
}

/**
 * Detailed MEP information including biography and social media.
 * 
 * Extends {@link MEP} with additional biographical information, contact details,
 * social media profiles, voting statistics, and parliamentary roles. This
 * interface represents the complete MEP profile available through the
 * EP API `/meps/{id}/details` endpoint.
 * 
 * **Personal Data:** Contains multiple GDPR-protected fields (phone, address)
 * requiring audit logging and data minimization practices.
 * 
 * **Caching:** Due to personal data, cache TTL should not exceed 15 minutes
 * per ISMS Policy DP-003 (Data Retention).
 * 
 * @interface MEPDetails
 * @extends MEP
 * 
 * @example
 * ```typescript
 * const mepDetails: MEPDetails = {
 *   // MEP base fields
 *   id: "person/124936",
 *   name: "Jane Marie Andersson",
 *   country: "SE",
 *   politicalGroup: "S&D",
 *   committees: ["DEVE", "ENVI"],
 *   email: "jane.andersson@europarl.europa.eu",
 *   active: true,
 *   termStart: "2019-07-02",
 *   
 *   // Extended fields
 *   biography: "Member of Parliament since 2019...",
 *   phone: "+32 2 28 45000",
 *   address: "European Parliament, Rue Wiertz 60, 1047 Brussels",
 *   website: "https://example.com",
 *   twitter: "@janeandersson",
 *   facebook: "jane.andersson.official",
 *   votingStatistics: {
 *     totalVotes: 1250,
 *     votesFor: 800,
 *     votesAgainst: 350,
 *     abstentions: 100,
 *     attendanceRate: 0.92
 *   },
 *   roles: ["Vice-Chair of DEVE Committee", "Member of ENVI Committee"]
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Minimal details (all optional fields omitted)
 * const minimalDetails: MEPDetails = {
 *   id: "person/100000",
 *   name: "John Smith",
 *   country: "DE",
 *   politicalGroup: "EPP",
 *   committees: ["ECON"],
 *   active: true,
 *   termStart: "2024-07-16"
 * };
 * ```
 * 
 * @see {@link MEP} for base MEP interface
 * @see {@link VotingStatistics} for voting behavior metrics
 * @see https://data.europarl.europa.eu/api/v2/
 * 
 * @gdpr Contains personal data (phone, address) - requires audit logging
 */
export interface MEPDetails extends MEP {
  /**
   * Biographical information.
   * 
   * Free-text biography provided by the MEP or EP information service.
   * May include educational background, professional experience,
   * and political career highlights. Content may be in multiple languages.
   * 
   * **EP API Field:** `biography`
   * **Format:** Plain text or HTML (sanitize before display)
   * **Max Length:** Typically 500-2000 characters
   * 
   * @example "Member of the European Parliament since 2019, focusing on development and environmental issues. Former municipal councillor (2010-2019)."
   */
  biography?: string;

  /**
   * Contact phone number.
   * 
   * Primary office phone number, typically Brussels or Strasbourg office.
   * Format varies by country but usually includes country code.
   * 
   * **EP API Field:** `phone`
   * **Format:** International format recommended (e.g., +32 2 28 XXXXX)
   * 
   * @example "+32 2 28 45000" (Brussels)
   * @example "+33 3 88 17 5000" (Strasbourg)
   * 
   * @gdpr Personal data - requires audit logging per ISMS AU-002
   */
  phone?: string;

  /**
   * Official office address.
   * 
   * Primary office address, typically European Parliament Brussels or
   * Strasbourg location. May include building, floor, and office number.
   * 
   * **EP API Field:** `address`
   * **Format:** Multi-line address string
   * 
   * @example "European Parliament, Rue Wiertz 60, ASP 08E123, 1047 Brussels, Belgium"
   * @example "European Parliament, 1 Avenue du Président Robert Schuman, 67000 Strasbourg, France"
   * 
   * @gdpr Personal data - requires audit logging per ISMS AU-002
   */
  address?: string;

  /**
   * Personal or official website URL.
   * 
   * MEP's personal website, campaign site, or party profile page.
   * URL should be validated for HTTPS and accessibility.
   * 
   * **EP API Field:** `website`
   * **Format:** Full URL with protocol
   * **Validation:** Must be valid URL format
   * 
   * @example "https://www.janeanderson.eu"
   * @example "https://example-party.eu/members/jane-andersson"
   */
  website?: string;

  /**
   * Twitter/X handle.
   * 
   * Social media handle for Twitter/X platform (without @ prefix in data,
   * but typically displayed with @). Not validated against current platform
   * availability.
   * 
   * **EP API Field:** `twitter`
   * **Format:** Username without @ prefix
   * **Validation:** Alphanumeric and underscores, 1-15 characters
   * 
   * @example "janeandersson"
   * @example "Jane_Andersson_MEP"
   */
  twitter?: string;

  /**
   * Facebook profile identifier.
   * 
   * Facebook profile username, page name, or numeric ID. May be
   * username (facebook.com/username) or numeric ID (facebook.com/12345).
   * 
   * **EP API Field:** `facebook`
   * **Format:** Username or numeric ID
   * 
   * @example "jane.andersson.official"
   * @example "100012345678901"
   */
  facebook?: string;

  /**
   * Voting behavior statistics.
   * 
   * Aggregated statistics on the MEP's voting patterns including
   * attendance rate and vote distribution. Calculated from plenary
   * session roll-call votes.
   * 
   * **EP API Field:** `votingStatistics` (computed)
   * **Update Frequency:** Updated after each plenary session
   * 
   * @see {@link VotingStatistics} for detailed metrics
   */
  votingStatistics?: VotingStatistics;

  /**
   * Parliamentary roles and positions.
   * 
   * Array of official roles held within the European Parliament,
   * including committee positions, delegation memberships, and
   * special assignments. Roles are current as of data fetch.
   * 
   * **EP API Field:** `roles`
   * 
   * **Common Role Types:**
   * - Committee Chair/Vice-Chair
   * - Delegation Chair/Vice-Chair/Member
   * - Quaestor
   * - Vice-President of Parliament
   * 
   * @example ["Vice-Chair of DEVE Committee", "Member of ENVI Committee", "Member of Delegation for relations with India"]
   * @example ["Chair of FEMM Committee", "Quaestor"]
   */
  roles?: string[];
}

/**
 * Voting statistics for an MEP.
 * 
 * Aggregated metrics on an MEP's voting behavior in plenary sessions,
 * calculated from roll-call votes. Statistics include vote distribution
 * (for/against/abstain) and attendance rate. Used for transparency and
 * accountability reporting.
 * 
 * **Calculation Period:** Typically current parliamentary term
 * **Update Frequency:** After each plenary session (monthly)
 * **Data Source:** EP API `/meps/{id}/voting-statistics`
 * 
 * **Note:** Only includes recorded roll-call votes, not show-of-hands votes.
 * Attendance rate may differ from physical attendance as it only counts
 * voting participation.
 * 
 * @interface VotingStatistics
 * 
 * @example
 * ```typescript
 * const statistics: VotingStatistics = {
 *   totalVotes: 1250,
 *   votesFor: 800,
 *   votesAgainst: 350,
 *   abstentions: 100,
 *   attendanceRate: 0.92 // 92% participation
 * };
 * 
 * // Calculate vote percentages
 * const forPercentage = (statistics.votesFor / statistics.totalVotes * 100).toFixed(1);
 * console.log(`Voted FOR: ${forPercentage}%`);
 * ```
 * 
 * @example
 * ```typescript
 * // Low participation example
 * const lowParticipation: VotingStatistics = {
 *   totalVotes: 500,
 *   votesFor: 300,
 *   votesAgainst: 150,
 *   abstentions: 50,
 *   attendanceRate: 0.45 // Only 45% of possible votes
 * };
 * ```
 * 
 * @see {@link MEPDetails} for complete MEP profile
 * @see {@link VotingRecord} for individual vote records
 */
export interface VotingStatistics {
  /**
   * Total number of votes cast.
   * 
   * Sum of all recorded votes (for + against + abstentions).
   * Does not include missed votes or votes without recorded position.
   * 
   * **Calculation:** `votesFor + votesAgainst + abstentions`
   * **Typical Range:** 500-2000 per term
   * **Min Value:** 0
   * 
   * @example 1250
   */
  totalVotes: number;

  /**
   * Number of votes in favor.
   * 
   * Count of votes where the MEP voted "FOR" or "YES" on a measure.
   * Indicates supportive voting behavior.
   * 
   * **Min Value:** 0
   * **Max Value:** totalVotes
   * 
   * @example 800
   */
  votesFor: number;

  /**
   * Number of votes against.
   * 
   * Count of votes where the MEP voted "AGAINST" or "NO" on a measure.
   * Indicates opposition voting behavior.
   * 
   * **Min Value:** 0
   * **Max Value:** totalVotes
   * 
   * @example 350
   */
  votesAgainst: number;

  /**
   * Number of abstentions.
   * 
   * Count of votes where the MEP abstained from voting.
   * Abstention is a recorded choice distinct from absence.
   * 
   * **Min Value:** 0
   * **Max Value:** totalVotes
   * 
   * @example 100
   */
  abstentions: number;

  /**
   * Attendance rate as decimal (0.0 to 1.0).
   * 
   * Percentage of possible votes where the MEP participated
   * (voted for, against, or abstained). Does not distinguish
   * between physical absence and strategic non-participation.
   * 
   * **Calculation:** `totalVotes / possibleVotes`
   * **Format:** Decimal between 0.0 and 1.0
   * **Display:** Multiply by 100 for percentage
   * 
   * @example 0.92 // 92% attendance
   * @example 0.78 // 78% attendance
   * @example 1.0  // 100% attendance (perfect record)
   */
  attendanceRate: number;
}

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

/**
 * European Parliament committee information.
 * 
 * Represents a standing committee, special committee, or temporary committee
 * of the European Parliament. Committees are responsible for preparing
 * legislation, conducting hearings, and producing reports on matters within
 * their mandate. Each committee has members, substitutes, and leadership
 * positions.
 * 
 * **Committee Types:**
 * - Standing Committees (20 permanent committees)
 * - Special Committees (temporary, specific mandate)
 * - Committees of Inquiry (investigative powers)
 * - Subcommittees (under standing committees)
 * 
 * **Data Source:** EP API `/committees`
 * 
 * @interface Committee
 * 
 * @example
 * ```typescript
 * const committee: Committee = {
 *   id: "COMM-DEVE",
 *   name: "Committee on Development",
 *   abbreviation: "DEVE",
 *   members: ["person/124936", "person/198765", "person/100000"],
 *   chair: "person/124936",
 *   viceChairs: ["person/198765"],
 *   meetingSchedule: ["2024-11-25T09:00:00Z", "2024-12-10T14:00:00Z"],
 *   responsibilities: [
 *     "Development cooperation policy",
 *     "Relations with ACP countries",
 *     "Humanitarian aid"
 *   ]
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Minimal committee (optional fields omitted)
 * const minimalCommittee: Committee = {
 *   id: "COMM-ENVI",
 *   name: "Committee on the Environment, Public Health and Food Safety",
 *   abbreviation: "ENVI",
 *   members: ["person/111111", "person/222222"]
 * };
 * ```
 * 
 * @see {@link MEP} for member information
 * @see {@link LegislativeDocument} for committee documents
 * @see https://www.europarl.europa.eu/committees/en/home
 */
export interface Committee {
  /**
   * Unique committee identifier.
   * 
   * Format: "COMM-{abbreviation}" for stable identification across terms.
   * ID remains consistent even if committee name or mandate changes.
   * 
   * **EP API Field:** `identifier`
   * **Format Pattern:** `COMM-{ABBREV}`
   * **Validation:** Must match `/^COMM-[A-Z]{4}$/`
   * 
   * @example "COMM-DEVE"
   * @example "COMM-ENVI"
   * @example "COMM-ECON"
   */
  id: string;

  /**
   * Full committee name.
   * 
   * Official committee name in English. Names may be lengthy for
   * committees with broad mandates. Other languages available through
   * EP multilingual API.
   * 
   * **EP API Field:** `label`
   * **Language:** English (other languages available in API)
   * **Max Length:** Typically 50-150 characters
   * 
   * @example "Committee on Development"
   * @example "Committee on the Environment, Public Health and Food Safety"
   * @example "Committee on Economic and Monetary Affairs"
   */
  name: string;

  /**
   * Committee abbreviation.
   * 
   * Short 4-letter code used for references and citations. Abbreviations
   * are stable and widely used in EP documentation.
   * 
   * **EP API Field:** `abbreviation`
   * **Format:** 4 uppercase letters
   * **Validation:** Must match `/^[A-Z]{4}$/`
   * 
   * **Common Abbreviations:**
   * - "AFET" - Foreign Affairs
   * - "DEVE" - Development
   * - "INTA" - International Trade
   * - "BUDG" - Budgets
   * - "CONT" - Budgetary Control
   * - "ECON" - Economic and Monetary Affairs
   * - "EMPL" - Employment and Social Affairs
   * - "ENVI" - Environment, Public Health and Food Safety
   * - "ITRE" - Industry, Research and Energy
   * - "IMCO" - Internal Market and Consumer Protection
   * - "TRAN" - Transport and Tourism
   * - "REGI" - Regional Development
   * - "AGRI" - Agriculture and Rural Development
   * - "PECH" - Fisheries
   * - "CULT" - Culture and Education
   * - "JURI" - Legal Affairs
   * - "LIBE" - Civil Liberties, Justice and Home Affairs
   * - "AFCO" - Constitutional Affairs
   * - "FEMM" - Women's Rights and Gender Equality
   * - "PETI" - Petitions
   * 
   * @example "DEVE"
   * @example "ENVI"
   * @example "ECON"
   */
  abbreviation: string;

  /**
   * Committee members.
   * 
   * Array of MEP IDs representing full members (not substitutes).
   * Committee size varies by mandate, typically 25-86 members.
   * Membership reflects political group proportionality.
   * 
   * **EP API Field:** `members`
   * **Format:** Array of MEP IDs (format: "person/{id}")
   * **Typical Size:** 25-86 members per committee
   * 
   * @example ["person/124936", "person/198765", "person/100000"]
   * 
   * @see {@link MEP} for member details
   */
  members: string[];

  /**
   * Committee chair.
   * 
   * MEP ID of the committee chair/chairperson who leads the committee,
   * sets agendas, and represents the committee. Elected by committee
   * members at start of parliamentary term.
   * 
   * **EP API Field:** `chair`
   * **Format:** MEP ID (format: "person/{id}")
   * 
   * @example "person/124936"
   * 
   * @see {@link MEP} for chair details
   */
  chair?: string;

  /**
   * Committee vice-chairs.
   * 
   * Array of MEP IDs for committee vice-chairs (typically 1-4 per committee).
   * Vice-chairs assist the chair and substitute when needed. Positions
   * allocated to ensure political group representation.
   * 
   * **EP API Field:** `viceChairs`
   * **Format:** Array of MEP IDs (format: "person/{id}")
   * **Typical Size:** 1-4 vice-chairs
   * 
   * @example ["person/198765", "person/111111"]
   * 
   * @see {@link MEP} for vice-chair details
   */
  viceChairs?: string[];

  /**
   * Scheduled committee meetings.
   * 
   * Array of upcoming meeting timestamps in ISO 8601 format with timezone.
   * Regular committees typically meet 1-2 times per month in Brussels
   * during parliamentary session weeks. Extraordinary meetings may be scheduled.
   * 
   * **EP API Field:** `meetingSchedule`
   * **Format:** Array of ISO 8601 datetime strings with timezone
   * **Location:** Typically Brussels (European Parliament)
   * 
   * @example [
   *   "2024-11-25T09:00:00Z",
   *   "2024-12-10T14:00:00Z",
   *   "2025-01-20T15:30:00Z"
   * ]
   */
  meetingSchedule?: string[];

  /**
   * Committee responsibilities and mandate.
   * 
   * Array of policy areas and legislative matters within the committee's
   * jurisdiction. Responsibilities defined in EP Rules of Procedure Annex VI.
   * May include Treaty article references.
   * 
   * **EP API Field:** `responsibilities`
   * **Source:** EP Rules of Procedure Annex VI
   * 
   * @example [
   *   "Development cooperation policy",
   *   "Humanitarian aid and emergency assistance",
   *   "Relations with ACP countries",
   *   "Coherence between EU development policies and other policies"
   * ]
   * 
   * @example [
   *   "Environment policy (TFEU Article 191-193)",
   *   "Public health (TFEU Article 168)",
   *   "Food safety (TFEU Article 169)"
   * ]
   */
  responsibilities?: string[];
}

/**
 * European Parliament legislative document.
 * 
 * Represents official parliamentary documents including reports, resolutions,
 * opinions, amendments, and legislative proposals. Documents are produced by
 * committees, MEPs, or submitted by external institutions (Commission, Council).
 * All documents follow strict formatting and reference standards.
 * 
 * **Document Reference System:**
 * - A9-0123/2024: Report (A series = committee reports)
 * - B9-0456/2024: Motion for resolution (B series)
 * - P9_TA(2024)0789: Adopted text (TA = texts adopted)
 * - COM(2024)123: Commission proposal
 * 
 * **Data Source:** EP API `/documents`
 * 
 * @interface LegislativeDocument
 * 
 * @example
 * ```typescript
 * const report: LegislativeDocument = {
 *   id: "A9-0123/2024",
 *   type: "REPORT",
 *   title: "Report on the proposal for a regulation on digital services",
 *   date: "2024-11-15",
 *   authors: ["person/124936"],
 *   committee: "COMM-IMCO",
 *   status: "ADOPTED",
 *   pdfUrl: "https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.pdf",
 *   xmlUrl: "https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.xml",
 *   summary: "The committee recommends approval with amendments..."
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Commission proposal
 * const proposal: LegislativeDocument = {
 *   id: "COM(2024)789",
 *   type: "REGULATION",
 *   title: "Proposal for a Regulation on artificial intelligence",
 *   date: "2024-10-01",
 *   authors: ["European Commission"],
 *   status: "IN_COMMITTEE"
 * };
 * ```
 * 
 * @see {@link DocumentType} for document type enumeration
 * @see {@link DocumentStatus} for status values
 * @see {@link Committee} for responsible committee
 * @see https://www.europarl.europa.eu/doceo/
 */
export interface LegislativeDocument {
  /**
   * Unique document identifier.
   * 
   * EP document reference following official numbering system.
   * Format varies by document type and series.
   * 
   * **EP API Field:** `reference`
   * 
   * **Formats:**
   * - A9-{number}/{year} - Committee reports
   * - B9-{number}/{year} - Motions for resolution
   * - P9_TA({year}){number} - Adopted texts
   * - COM({year}){number} - Commission proposals
   * - {year}/{number}(COD) - Procedure references
   * 
   * @example "A9-0123/2024" // Committee report
   * @example "B9-0456/2024" // Motion for resolution
   * @example "P9_TA(2024)0789" // Adopted text
   * @example "COM(2024)123" // Commission proposal
   */
  id: string;

  /**
   * Document type classification.
   * 
   * Categorizes the document by its legal and procedural nature.
   * Determines workflow, voting requirements, and legal effect.
   * 
   * **EP API Field:** `type`
   * 
   * @see {@link DocumentType} for all valid values and descriptions
   * 
   * @example "REPORT"
   * @example "RESOLUTION"
   * @example "REGULATION"
   */
  type: DocumentType;

  /**
   * Document title.
   * 
   * Full official title in English. Titles follow standardized format
   * based on document type. May include procedure reference and
   * committee abbreviation. Other languages available through EP API.
   * 
   * **EP API Field:** `title`
   * **Language:** English (multilingual in API)
   * **Max Length:** Typically 100-500 characters
   * 
   * @example "Report on the proposal for a regulation of the European Parliament and of the Council on digital services (Digital Services Act)"
   * @example "Motion for a resolution on the situation of human rights in Country X"
   * @example "Draft opinion on the 2025 budget"
   */
  title: string;

  /**
   * Document publication date.
   * 
   * Date when the document was officially published or submitted in
   * ISO 8601 format. For reports, this is typically the adoption date
   * by the committee.
   * 
   * **EP API Field:** `date`
   * **Format:** ISO 8601 date (YYYY-MM-DD)
   * **Validation:** Must be valid date, typically after 1952-07-23
   * 
   * @example "2024-11-15"
   * @example "2024-10-01"
   */
  date: string;

  /**
   * Document authors.
   * 
   * Array of author identifiers (MEP IDs for parliamentary documents,
   * institution names for external documents). For committee reports,
   * includes rapporteur and shadow rapporteurs. For resolutions,
   * includes co-signers.
   * 
   * **EP API Field:** `authors`
   * **Format:** MEP IDs (format: "person/{id}") or institution names
   * 
   * @example ["person/124936", "person/198765"] // MEP authors
   * @example ["European Commission"] // Institutional author
   * @example ["person/124936"] // Single rapporteur
   * 
   * @see {@link MEP} for MEP author details
   */
  authors: string[];

  /**
   * Responsible committee.
   * 
   * Committee ID of the responsible committee handling the document.
   * For legislative procedures, this is the lead committee. Documents
   * may also have opinion-giving committees (not captured here).
   * 
   * **EP API Field:** `committee`
   * **Format:** Committee ID (format: "COMM-{ABBREV}")
   * 
   * @example "COMM-IMCO" // Internal Market committee
   * @example "COMM-ENVI" // Environment committee
   * 
   * @see {@link Committee} for committee details
   */
  committee?: string;

  /**
   * Document status in legislative process.
   * 
   * Current procedural status indicating where the document is in
   * the legislative workflow. Status progression varies by document
   * type and legislative procedure.
   * 
   * **EP API Field:** `status`
   * 
   * @see {@link DocumentStatus} for all valid values and workflow
   * 
   * @example "ADOPTED"
   * @example "IN_COMMITTEE"
   * @example "PLENARY"
   */
  status: DocumentStatus;

  /**
   * PDF document URL.
   * 
   * Direct link to PDF version of the document. PDFs are the official
   * format for archival and legal purposes. URLs point to EP document
   * repository (doceo).
   * 
   * **EP API Field:** `pdfUrl`
   * **Format:** Full HTTPS URL
   * **Domain:** www.europarl.europa.eu/doceo/
   * 
   * @example "https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.pdf"
   * @example "https://www.europarl.europa.eu/doceo/document/B-9-2024-0456_EN.pdf"
   */
  pdfUrl?: string;

  /**
   * XML document URL.
   * 
   * Direct link to structured XML version of the document. XML format
   * enables programmatic processing, text extraction, and metadata parsing.
   * Follows EP XML schema.
   * 
   * **EP API Field:** `xmlUrl`
   * **Format:** Full HTTPS URL
   * **Domain:** www.europarl.europa.eu/doceo/
   * **Schema:** EP Akoma Ntoso XML
   * 
   * @example "https://www.europarl.europa.eu/doceo/document/A-9-2024-0123_EN.xml"
   */
  xmlUrl?: string;

  /**
   * Document summary or abstract.
   * 
   * Brief summary of document content, recommendations, or key points.
   * Typically 100-500 characters. For reports, may include committee
   * recommendation. For resolutions, includes main demands.
   * 
   * **EP API Field:** `summary`
   * **Format:** Plain text
   * **Max Length:** Typically 500 characters
   * 
   * @example "The committee recommends approval of the Commission proposal with 47 amendments, focusing on strengthening user protections and platform accountability."
   * @example "Resolution calling for immediate humanitarian access and cessation of hostilities."
   */
  summary?: string;
}

/**
 * Legislative document type classification.
 * 
 * Categorizes European Parliament documents by their legal nature and
 * procedural purpose. Each type has specific formatting, voting requirements,
 * and legal effects. Document types follow EU legislative framework and
 * EP Rules of Procedure.
 * 
 * **Legislative vs. Non-Legislative:**
 * - Legislative: REGULATION, DIRECTIVE, DECISION (binding legal acts)
 * - Non-Legislative: REPORT, RESOLUTION, OPINION, AMENDMENT (political/procedural)
 * 
 * **Legal Effect:**
 * - Binding: REGULATION, DIRECTIVE, DECISION (after adoption)
 * - Non-binding: RESOLUTION, OPINION
 * 
 * @typedef {string} DocumentType
 * 
 * @example
 * ```typescript
 * // Using in document filtering
 * const legislativeTypes: DocumentType[] = ["REGULATION", "DIRECTIVE", "DECISION"];
 * const documents = allDocuments.filter(doc => 
 *   legislativeTypes.includes(doc.type)
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Type guard for legislative documents
 * function isLegislative(type: DocumentType): boolean {
 *   return ["REGULATION", "DIRECTIVE", "DECISION"].includes(type);
 * }
 * 
 * if (isLegislative(document.type)) {
 *   console.log("This is binding legislation");
 * }
 * ```
 * 
 * @see {@link LegislativeDocument} for document structure
 * @see https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12016E288 (TFEU Article 288 - Legal Acts)
 */
export type DocumentType = 
  /**
   * Committee report on legislative proposal or own-initiative.
   * 
   * Committee's analysis and recommendations on a legislative proposal
   * or policy matter. Reports include amendments, explanatory statements,
   * and voting recommendations. Prepared by rapporteur(s).
   * 
   * **Reference Format:** A9-{number}/{year}
   * **Voting:** Simple majority in committee and plenary
   * **Legal Effect:** Non-binding (recommendations only)
   * 
   * @example "REPORT"
   */
  | 'REPORT'
  
  /**
   * Motion for a resolution (non-legislative).
   * 
   * Political statement or position on current events, policy matters,
   * or external affairs. Non-binding expression of Parliament's view.
   * May be tabled by MEPs, committees, or political groups.
   * 
   * **Reference Format:** B9-{number}/{year}
   * **Voting:** Simple majority in plenary
   * **Legal Effect:** Non-binding (political statement)
   * 
   * @example "RESOLUTION"
   */
  | 'RESOLUTION'
  
  /**
   * Decision (binding legal act).
   * 
   * Binding legal act addressed to specific recipients (member states,
   * organizations, individuals). Binding in its entirety on those addressed.
   * Used for specific situations (e.g., comitology, budget).
   * 
   * **Reference Format:** Varies by procedure
   * **Voting:** Depends on legal base (simple, absolute, or qualified majority)
   * **Legal Effect:** Binding on addressees (TFEU Article 288)
   * 
   * @example "DECISION"
   */
  | 'DECISION'
  
  /**
   * Directive (binding legal act on objectives).
   * 
   * Binding legal act requiring member states to achieve specific results
   * but allowing flexibility in implementation methods. Member states must
   * transpose into national law within deadline.
   * 
   * **Reference Format:** Varies by procedure
   * **Voting:** Ordinary legislative procedure (co-decision with Council)
   * **Legal Effect:** Binding on member states (TFEU Article 288)
   * **Transposition:** Member states implement via national law
   * 
   * @example "DIRECTIVE"
   */
  | 'DIRECTIVE'
  
  /**
   * Regulation (directly applicable binding law).
   * 
   * Binding legal act with direct effect in all member states without
   * need for national implementation. Most powerful EU legal instrument.
   * Applies uniformly across EU.
   * 
   * **Reference Format:** Varies by procedure
   * **Voting:** Ordinary legislative procedure (co-decision with Council)
   * **Legal Effect:** Directly applicable binding law (TFEU Article 288)
   * **Implementation:** Automatic (no national transposition needed)
   * 
   * @example "REGULATION"
   */
  | 'REGULATION'
  
  /**
   * Opinion on another committee's report.
   * 
   * Opinion provided by an opinion-giving committee on a legislative
   * proposal or matter led by another committee. Contains suggested
   * amendments from opinion committee's perspective.
   * 
   * **Reference Format:** Committee working documents
   * **Voting:** Simple majority in opinion committee
   * **Legal Effect:** Non-binding (advisory to lead committee)
   * 
   * @example "OPINION"
   */
  | 'OPINION'
  
  /**
   * Amendment to legislative text or report.
   * 
   * Proposed change to draft legislation, report, or other document.
   * Amendments may be tabled by committees, MEPs, or political groups.
   * Voted individually or in blocks.
   * 
   * **Reference Format:** Amendment number within document
   * **Voting:** Simple majority (unless legal base requires more)
   * **Legal Effect:** If adopted, modifies text
   * 
   * @example "AMENDMENT"
   */
  | 'AMENDMENT';

/**
 * Legislative document status in the parliamentary process.
 * 
 * Tracks document progression through the European Parliament's legislative
 * workflow from initial draft to final adoption or rejection. Status values
 * reflect key procedural stages defined in EP Rules of Procedure.
 * 
 * **Typical Workflow:**
 * 1. DRAFT - Initial document preparation
 * 2. SUBMITTED - Tabled/registered in Parliament
 * 3. IN_COMMITTEE - Committee examination and amendments
 * 4. PLENARY - Scheduled for plenary vote
 * 5. ADOPTED or REJECTED - Final outcome
 * 
 * **Time Between Stages:** Varies by urgency and complexity (weeks to months)
 * 
 * @typedef {string} DocumentStatus
 * 
 * @example
 * ```typescript
 * // Filtering documents by status
 * const activeDocuments = documents.filter(doc =>
 *   ["IN_COMMITTEE", "PLENARY"].includes(doc.status)
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Status progression check
 * const statusOrder: DocumentStatus[] = [
 *   "DRAFT", "SUBMITTED", "IN_COMMITTEE", "PLENARY", "ADOPTED"
 * ];
 * 
 * function isStatusProgressed(
 *   oldStatus: DocumentStatus,
 *   newStatus: DocumentStatus
 * ): boolean {
 *   return statusOrder.indexOf(newStatus) > statusOrder.indexOf(oldStatus);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Check if document is finalized
 * function isFinalized(status: DocumentStatus): boolean {
 *   return ["ADOPTED", "REJECTED"].includes(status);
 * }
 * ```
 * 
 * @see {@link LegislativeDocument} for document structure
 */
export type DocumentStatus = 
  /**
   * Draft stage - document being prepared.
   * 
   * Initial stage where rapporteur and committee staff prepare the
   * document. Not yet officially tabled. May include draft amendments
   * and shadow rapporteur input.
   * 
   * **Next Status:** SUBMITTED (after committee approval to table)
   * **Typical Duration:** 2-8 weeks
   * **Public Availability:** Limited (committee working documents)
   * 
   * @example "DRAFT"
   */
  | 'DRAFT'
  
  /**
   * Submitted/tabled - officially registered.
   * 
   * Document has been officially submitted/tabled in Parliament and
   * registered. Assigned to responsible committee. Public document
   * available in doceo system.
   * 
   * **Next Status:** IN_COMMITTEE (for examination)
   * **Typical Duration:** 1-2 weeks
   * **Public Availability:** Full (published in doceo)
   * 
   * @example "SUBMITTED"
   */
  | 'SUBMITTED'
  
  /**
   * In committee - examination and amendment phase.
   * 
   * Committee is examining the document, hearing experts, and preparing
   * amendments. Most substantive work occurs at this stage. May include
   * compromise amendment negotiations.
   * 
   * **Next Status:** PLENARY (after committee vote) or DRAFT (if rejected)
   * **Typical Duration:** 2-6 months (varies widely)
   * **Activities:** 
   * - Expert hearings
   * - Amendment tabling deadline
   * - Amendment voting in committee
   * - Final committee vote
   * 
   * @example "IN_COMMITTEE"
   */
  | 'IN_COMMITTEE'
  
  /**
   * Plenary stage - scheduled for full Parliament vote.
   * 
   * Document has been approved by committee and is scheduled for plenary
   * session vote. Debate and final amendments possible before vote.
   * 
   * **Next Status:** ADOPTED or REJECTED (after plenary vote)
   * **Typical Duration:** 1-4 weeks (waiting for session)
   * **Activities:**
   * - Plenary debate
   * - Final amendments tabled
   * - Final vote
   * 
   * @example "PLENARY"
   */
  | 'PLENARY'
  
  /**
   * Adopted - approved by Parliament.
   * 
   * Document has been adopted by Parliament in plenary vote. For
   * legislative acts, may proceed to Council or inter-institutional
   * negotiations. For resolutions, represents final position.
   * 
   * **Final Status:** No further status changes
   * **Publication:** Official Journal (for legal acts)
   * **Effect:** 
   * - Legislative acts: Proceed to Council/trilogue
   * - Resolutions: Published as Parliament position
   * 
   * @example "ADOPTED"
   */
  | 'ADOPTED'
  
  /**
   * Rejected - not approved by Parliament.
   * 
   * Document has been rejected in committee or plenary vote. Does not
   * proceed further. For legislative proposals, may be re-submitted
   * in modified form. For reports/resolutions, ends the process.
   * 
   * **Final Status:** No further status changes
   * **Common Reasons:**
   * - Insufficient votes in plenary
   * - Committee rejection
   * - Withdrawal by author
   * 
   * @example "REJECTED"
   */
  | 'REJECTED';

/**
 * Parliamentary question to EU institutions.
 * 
 * Represents questions submitted by MEPs to the European Commission, Council,
 * or other EU institutions. Questions are a key parliamentary scrutiny tool
 * ensuring accountability and transparency. Answers are published and become
 * part of parliamentary record.
 * 
 * **Question Types:**
 * - WRITTEN: Written questions requiring written answer (most common)
 * - ORAL: Oral questions answered in plenary (with or without debate)
 * 
 * **Rules:**
 * - Priority questions: 3-week answer deadline
 * - Standard questions: Variable deadline
 * - Subject to admissibility rules (EP Rules of Procedure Rule 138-139)
 * 
 * **Data Source:** EP API `/parliamentary-questions`
 * 
 * @interface ParliamentaryQuestion
 * 
 * @example
 * ```typescript
 * const writtenQuestion: ParliamentaryQuestion = {
 *   id: "E-000123/2024",
 *   type: "WRITTEN",
 *   author: "person/124936",
 *   date: "2024-11-15",
 *   topic: "Implementation of Digital Services Act in Member States",
 *   questionText: "Can the Commission provide data on Member State implementation of the Digital Services Act...",
 *   answerText: "The Commission has received implementation reports from 25 Member States...",
 *   answerDate: "2024-12-05",
 *   status: "ANSWERED"
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Pending oral question
 * const oralQuestion: ParliamentaryQuestion = {
 *   id: "O-000045/2024",
 *   type: "ORAL",
 *   author: "person/198765",
 *   date: "2024-11-20",
 *   topic: "EU response to climate emergency",
 *   questionText: "What measures is the Commission taking to meet 2030 climate targets?",
 *   status: "PENDING"
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Priority written question
 * const priorityQuestion: ParliamentaryQuestion = {
 *   id: "P-000089/2024",
 *   type: "WRITTEN",
 *   author: "person/100000",
 *   date: "2024-11-10",
 *   topic: "Food safety incident in Country X",
 *   questionText: "Is the Commission aware of the food safety incident...",
 *   answerText: "The Commission is monitoring the situation closely...",
 *   answerDate: "2024-11-28",
 *   status: "ANSWERED"
 * };
 * ```
 * 
 * @see {@link MEP} for author information
 * @see https://www.europarl.europa.eu/plenary/en/parliamentary-questions.html
 * @see EP Rules of Procedure Rule 138-139
 */
export interface ParliamentaryQuestion {
  /**
   * Unique question identifier.
   * 
   * EP reference number following official numbering system.
   * Prefix indicates question type.
   * 
   * **EP API Field:** `reference`
   * 
   * **Format Patterns:**
   * - E-{number}/{year} - Written question
   * - P-{number}/{year} - Priority written question
   * - O-{number}/{year} - Oral question
   * - H-{number}/{year} - Question for Question Time
   * 
   * @example "E-000123/2024" // Written question
   * @example "P-000089/2024" // Priority question
   * @example "O-000045/2024" // Oral question
   */
  id: string;

  /**
   * Question type.
   * 
   * Determines answer format, timing, and procedural rules.
   * Written questions receive written answers published online.
   * Oral questions receive verbal answers in plenary session.
   * 
   * **EP API Field:** `type`
   * 
   * **Values:**
   * - "WRITTEN" - Written question with written answer (most common)
   *   - Standard: Variable deadline
   *   - Priority: 3-week deadline
   *   - Published in Parliamentary Questions database
   * 
   * - "ORAL" - Oral question with verbal answer in plenary
   *   - Answered during plenary session
   *   - May include debate
   *   - Verbatim answer in plenary transcript
   * 
   * @example "WRITTEN"
   * @example "ORAL"
   */
  type: 'WRITTEN' | 'ORAL';

  /**
   * Question author MEP ID.
   * 
   * MEP who submitted the question. Questions may also be tabled by
   * committees or political groups (represented by lead MEP ID).
   * All MEPs have right to ask questions (Rules of Procedure Rule 138).
   * 
   * **EP API Field:** `author`
   * **Format:** MEP ID (format: "person/{id}")
   * 
   * @example "person/124936"
   * 
   * @see {@link MEP} for author details
   */
  author: string;

  /**
   * Question submission date.
   * 
   * Date when the question was officially submitted/tabled in Parliament
   * in ISO 8601 format. Starts the answer deadline clock for priority
   * questions.
   * 
   * **EP API Field:** `date`
   * **Format:** ISO 8601 date (YYYY-MM-DD)
   * **Validation:** Must be valid date
   * 
   * @example "2024-11-15"
   * @example "2024-11-20"
   */
  date: string;

  /**
   * Question topic/subject matter.
   * 
   * Brief subject line describing what the question is about.
   * Used for categorization and searching. Typically 50-150 characters.
   * 
   * **EP API Field:** `subject`
   * **Max Length:** Typically 150 characters
   * 
   * @example "Implementation of Digital Services Act in Member States"
   * @example "EU response to climate emergency"
   * @example "Food safety incident in Country X"
   */
  topic: string;

  /**
   * Full question text.
   * 
   * Complete text of the question as submitted by the MEP.
   * May include multiple parts, background information, and specific
   * queries. Questions must comply with admissibility rules (no personal
   * attacks, within EU competence, etc.).
   * 
   * **EP API Field:** `questionText`
   * **Format:** Plain text or HTML
   * **Max Length:** Typically 500-2000 characters
   * 
   * **Admissibility Rules (Rule 138):**
   * - Within EU competence
   * - Not already answered
   * - No personal attacks
   * - Factual basis required
   * 
   * @example "Can the Commission provide data on Member State implementation of the Digital Services Act, including number of designated platforms and enforcement actions taken?"
   * @example "What measures is the Commission taking to meet 2030 climate targets? Has the Commission assessed the impact of recent policy changes?"
   */
  questionText: string;

  /**
   * Answer text from institution.
   * 
   * Full text of the answer provided by the addressed institution
   * (typically European Commission). Undefined if question still pending.
   * Answers become public record and are published online.
   * 
   * **EP API Field:** `answerText`
   * **Format:** Plain text or HTML
   * **Max Length:** Variable (typically 500-5000 characters)
   * 
   * @example "The Commission has received implementation reports from 25 Member States. A total of 47 platforms have been designated under the DSA. Enforcement actions..."
   * @example "The Commission is monitoring the situation closely and has requested additional information from Member State authorities..."
   */
  answerText?: string;

  /**
   * Answer publication date.
   * 
   * Date when the answer was officially provided and published in
   * ISO 8601 format. Undefined if question still pending.
   * For priority questions, target is 3 weeks from submission.
   * 
   * **EP API Field:** `answerDate`
   * **Format:** ISO 8601 date (YYYY-MM-DD)
   * **Validation:** Must be after or equal to question date
   * 
   * **Deadlines:**
   * - Priority questions: 3 weeks (21 days)
   * - Standard questions: Variable (typically 6-8 weeks)
   * 
   * @example "2024-12-05"
   * @example "2024-11-28"
   */
  answerDate?: string;

  /**
   * Question status.
   * 
   * Current status indicating whether answer has been provided.
   * Questions remain "PENDING" until institution provides answer.
   * 
   * **EP API Field:** `status`
   * 
   * **Values:**
   * - "PENDING" - Question submitted, awaiting answer
   * - "ANSWERED" - Answer provided and published
   * 
   * @example "ANSWERED"
   * @example "PENDING"
   */
  status: 'PENDING' | 'ANSWERED';
}

/**
 * Generic paginated response wrapper for API results.
 * 
 * Standard pagination format used across all European Parliament MCP Server
 * endpoints. Wraps arrays of data with pagination metadata enabling
 * efficient iteration through large datasets. Implements offset-based
 * pagination pattern.
 * 
 * **Pagination Strategy:** Offset-based (not cursor-based)
 * - Predictable page jumps
 * - Total count available
 * - Direct page access
 * - May miss/duplicate items if data changes during pagination
 * 
 * **Performance Considerations:**
 * - Cached responses (15 min TTL) for better performance
 * - Large offsets may have slower query performance
 * - Recommended limit: 50-100 items per page
 * - Maximum limit: 100 items per page
 * 
 * @template T The type of items in the data array
 * @interface PaginatedResponse
 * 
 * @example
 * ```typescript
 * // Basic pagination usage
 * const response: PaginatedResponse<MEP> = {
 *   data: [
 *     { id: "person/124936", name: "Jane Andersson", country: "SE", ... },
 *     { id: "person/198765", name: "Hans Schmidt", country: "DE", ... }
 *   ],
 *   total: 705,
 *   limit: 50,
 *   offset: 0,
 *   hasMore: true
 * };
 * 
 * console.log(`Showing ${response.data.length} of ${response.total} MEPs`);
 * console.log(`Current page: ${Math.floor(response.offset / response.limit) + 1}`);
 * ```
 * 
 * @example
 * ```typescript
 * // Iterating through all pages
 * async function getAllMEPs(): Promise<MEP[]> {
 *   const allMEPs: MEP[] = [];
 *   let offset = 0;
 *   const limit = 50;
 *   
 *   while (true) {
 *     const response: PaginatedResponse<MEP> = await getMEPs({ 
 *       limit, 
 *       offset 
 *     });
 *     
 *     allMEPs.push(...response.data);
 *     
 *     if (!response.hasMore) {
 *       break;
 *     }
 *     
 *     offset += limit;
 *   }
 *   
 *   return allMEPs;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Calculating pagination metadata
 * function getPaginationInfo<T>(response: PaginatedResponse<T>) {
 *   const currentPage = Math.floor(response.offset / response.limit) + 1;
 *   const totalPages = Math.ceil(response.total / response.limit);
 *   const itemsOnPage = response.data.length;
 *   const startItem = response.offset + 1;
 *   const endItem = response.offset + itemsOnPage;
 *   
 *   return {
 *     currentPage,      // e.g., 3
 *     totalPages,       // e.g., 15
 *     startItem,        // e.g., 101
 *     endItem,          // e.g., 150
 *     hasNext: response.hasMore,
 *     hasPrevious: response.offset > 0
 *   };
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Empty result set
 * const emptyResponse: PaginatedResponse<MEP> = {
 *   data: [],
 *   total: 0,
 *   limit: 50,
 *   offset: 0,
 *   hasMore: false
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Last page (partial page)
 * const lastPageResponse: PaginatedResponse<MEP> = {
 *   data: [
 *     // 5 items only
 *   ],
 *   total: 705,
 *   limit: 50,
 *   offset: 700,  // Last page
 *   hasMore: false
 * };
 * ```
 * 
 * @see {@link MEP} for MEP data example
 * @see {@link VotingRecord} for voting record pagination
 * @see {@link LegislativeDocument} for document pagination
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items for current page.
   * 
   * Contains the actual data items for the current page/offset.
   * Array length may be less than limit on last page or when
   * fewer items match the query.
   * 
   * **Type:** Array of generic type T
   * **Min Length:** 0 (empty result set)
   * **Max Length:** limit value (typically 50-100)
   * 
   * @example
   * ```typescript
   * // Full page
   * data: [
   *   { id: "person/1", name: "MEP 1", ... },
   *   { id: "person/2", name: "MEP 2", ... },
   *   // ... 48 more items for limit=50
   * ]
   * ```
   * 
   * @example
   * ```typescript
   * // Partial page (last page)
   * data: [
   *   { id: "person/701", name: "MEP 701", ... },
   *   { id: "person/702", name: "MEP 702", ... },
   *   // Only 5 items on last page
   * ]
   * ```
   * 
   * @example
   * ```typescript
   * // Empty result
   * data: []
   * ```
   */
  data: T[];

  /**
   * Total number of items matching the query.
   * 
   * Total count of all items across all pages that match the current
   * query/filter criteria. Used for calculating total pages and showing
   * "X of Y results" displays. Count includes items on all pages, not
   * just current page.
   * 
   * **Calculation:** `SELECT COUNT(*) FROM ... WHERE ...`
   * **Min Value:** 0 (no matches)
   * **Performance:** Cached for efficiency
   * 
   * @example 705 // Total MEPs in current term
   * @example 143 // MEPs matching filter (e.g., country="DE")
   * @example 0   // No matches found
   */
  total: number;

  /**
   * Maximum items per page (requested page size).
   * 
   * The limit value that was requested for this query. Determines
   * maximum array size for data field. Actual data length may be
   * less on last page or with filtered queries.
   * 
   * **EP API Field:** Query parameter `limit`
   * **Min Value:** 1
   * **Max Value:** 100 (enforced by API)
   * **Default:** 50
   * **Recommended:** 50-100 for performance
   * 
   * @example 50  // Default page size
   * @example 100 // Maximum page size
   * @example 20  // Custom smaller page size
   */
  limit: number;

  /**
   * Number of items skipped (pagination offset).
   * 
   * Number of items to skip from the beginning of the result set.
   * Used for offset-based pagination. To get page N, use
   * `offset = (N - 1) * limit`.
   * 
   * **EP API Field:** Query parameter `offset`
   * **Min Value:** 0 (first page)
   * **Max Value:** total - 1
   * **Calculation:** `(currentPage - 1) * limit`
   * 
   * @example 0    // First page
   * @example 50   // Second page (if limit=50)
   * @example 100  // Third page (if limit=50)
   * @example 700  // Page 15 (if limit=50)
   */
  offset: number;

  /**
   * Indicates if more items exist beyond current page.
   * 
   * Boolean flag for easy "load more" / "next page" logic. True if
   * there are more items to fetch after the current page. False on
   * last page or when all results fit on current page.
   * 
   * **Calculation:** `(offset + data.length) < total`
   * 
   * @example true  // More pages available
   * @example false // Last page or all results shown
   * 
   * @example
   * ```typescript
   * // Using hasMore for navigation
   * if (response.hasMore) {
   *   console.log("Click 'Next' to see more results");
   *   const nextOffset = response.offset + response.limit;
   *   // Fetch next page with new offset
   * } else {
   *   console.log("You've reached the end of results");
   * }
   * ```
   */
  hasMore: boolean;
}
