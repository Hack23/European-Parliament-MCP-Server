/**
 * Committee type definitions.
 *
 * Interface for EP standing, special, and temporary committees.
 *
 * @module types/ep/committee
 * @see https://data.europarl.europa.eu/api/v2/
 */

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
