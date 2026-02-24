/**
 * MEP (Member of European Parliament) type definitions.
 *
 * Interfaces for MEP biographical data, voting statistics, and extended profiles.
 *
 * @module types/ep/mep
 * @see https://data.europarl.europa.eu/api/v2/
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
 *     attendanceRate: 92 // 92% participation
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
 *   attendanceRate: 92 // 92% participation
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
 *   attendanceRate: 45 // Only 45% of possible votes
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
   * Attendance rate as percentage (0 to 100).
   * 
   * Percentage of possible votes where the MEP participated
   * (voted for, against, or abstained). Does not distinguish
   * between physical absence and strategic non-participation.
   * 
   * **Calculation:** `(totalVotes / possibleVotes) * 100`
   * **Format:** Number between 0 and 100
   * **Schema:** `z.number().min(0).max(100)`
   * 
   * @example 92.5 // 92.5% attendance
   * @example 78   // 78% attendance
   * @example 100  // 100% attendance (perfect record)
   */
  attendanceRate: number;
}
