/**
 * Parliamentary activity type definitions.
 *
 * Interfaces for speeches, procedures, adopted texts, events,
 * meeting activities, and MEP declarations.
 *
 * @module types/ep/activities
 * @see https://data.europarl.europa.eu/api/v2/
 */

/**
 * European Parliament Speech or speech-related activity.
 *
 * Represents plenary speeches, debate contributions, written statements,
 * and proceeding activities. Sourced from EP API `/speeches` endpoint.
 *
 * **Intelligence Perspective:** Speech data enables content analysis of MEP positions,
 * policy priorities, and rhetorical patterns—critical for influence assessment and
 * narrative tracking across plenary debates.
 *
 * **Business Perspective:** Speech transcripts power NLP-based products, sentiment
 * analysis dashboards, and topic monitoring services for corporate affairs teams.
 *
 * **Marketing Perspective:** Speech content creates high-engagement assets for
 * political monitoring platforms—debate highlights, speaker leaderboards, and
 * topic trend visualizations that drive user acquisition and retention.
 *
 * **Data Source:** EP API `/speeches` endpoint
 *
 * **ISMS Policy:** SC-002 (Secure Coding Standards), AU-002 (Audit Logging)
 *
 * @interface Speech
 * @see https://data.europarl.europa.eu/api/v2/speeches
 */
export interface Speech {
  /** Unique speech identifier from EP API. @example "speech/12345" */
  id: string;
  /** Speech title or topic heading. @example "Debate on AI regulation" */
  title: string;
  /**
   * MEP or speaker identifier.
   * @gdpr Personal data - MEP identifier requires audit logging per ISMS AU-002
   * @example "person/124936"
   */
  speakerId: string;
  /**
   * Speaker name.
   * @gdpr Personal data - name requires audit logging per ISMS AU-002
   * @example "Jane Andersson"
   */
  speakerName: string;
  /** Date of the speech in ISO 8601 format. @example "2024-03-15" */
  date: string;
  /** Type of speech activity. @example "DEBATE_SPEECH" */
  type: string;
  /** Language of the speech. @example "en" */
  language: string;
  /** Speech text content or summary (if available). */
  text: string;
  /** Reference to the plenary session or meeting. @example "event/MTG-PL-2024-03-15" */
  sessionReference: string;
}

/**
 * European Parliament Legislative Procedure.
 *
 * Represents a legislative procedure tracked through the EP system,
 * including ordinary legislative procedures, consultations, and consent procedures.
 * Sourced from EP API `/procedures` endpoint.
 *
 * **Intelligence Perspective:** Procedure data enables end-to-end legislative tracking,
 * outcome prediction, and timeline analysis—core intelligence product for policy monitoring.
 *
 * **Business Perspective:** Procedure tracking powers legislative intelligence products,
 * regulatory risk assessments, and compliance early-warning systems.
 *
 * **Marketing Perspective:** Procedure lifecycle dashboards and legislative progress
 * trackers are high-value features for enterprise positioning and premium tier upsells.
 *
 * **Data Source:** EP API `/procedures` endpoint
 *
 * **ISMS Policy:** SC-002 (Secure Coding Standards)
 *
 * @interface Procedure
 * @see https://data.europarl.europa.eu/api/v2/procedures
 */
export interface Procedure {
  /** Unique procedure identifier. @example "COD/2023/0123" */
  id: string;
  /** Procedure title. @example "Regulation on Artificial Intelligence" */
  title: string;
  /** Procedure reference number. @example "2023/0123(COD)" */
  reference: string;
  /** Type of legislative procedure. @example "COD" (Ordinary Legislative Procedure) */
  type: string;
  /** Subject matter or policy domain. @example "Internal Market" */
  subjectMatter: string;
  /** Current stage of the procedure. @example "Awaiting Parliament's position in 1st reading" */
  stage: string;
  /** Current status. @example "Ongoing" */
  status: string;
  /** Date the procedure was initiated. @example "2023-04-21" */
  dateInitiated: string;
  /** Date of latest activity. @example "2024-06-15" */
  dateLastActivity: string;
  /** Responsible committee. @example "IMCO" */
  responsibleCommittee: string;
  /**
   * Rapporteur name (if assigned).
   * @gdpr Personal data - MEP name requires audit logging per ISMS AU-002
   * @example "Jane Andersson"
   */
  rapporteur: string;
  /** Associated documents. */
  documents: string[];
}

/**
 * European Parliament Adopted Text.
 *
 * Represents a text adopted by the European Parliament, including legislative
 * resolutions, positions, and non-legislative resolutions. Sourced from EP API
 * `/adopted-texts` endpoint.
 *
 * **Intelligence Perspective:** Adopted texts represent final legislative outputs—
 * tracking them enables assessment of legislative productivity, policy direction,
 * and political group influence on final outcomes.
 *
 * **Business Perspective:** Adopted text monitoring powers regulatory compliance
 * products and legislative change management services.
 *
 * **Marketing Perspective:** Adopted text tracking is a premium feature that
 * demonstrates comprehensive legislative coverage—ideal for enterprise sales
 * collateral and compliance-focused marketing campaigns.
 *
 * **Data Source:** EP API `/adopted-texts` endpoint
 *
 * **ISMS Policy:** SC-002 (Secure Coding Standards)
 *
 * @interface AdoptedText
 * @see https://data.europarl.europa.eu/api/v2/adopted-texts
 */
export interface AdoptedText {
  /** Unique document identifier. @example "TA-9-2024-0001" */
  id: string;
  /** Title of the adopted text. @example "European Artificial Intelligence Act" */
  title: string;
  /** Document reference number. @example "P9_TA(2024)0001" */
  reference: string;
  /** Type of adopted text. @example "LEGISLATIVE_RESOLUTION" */
  type: string;
  /** Date of adoption. @example "2024-03-13" */
  dateAdopted: string;
  /** Related legislative procedure reference. @example "2023/0123(COD)" */
  procedureReference: string;
  /** Subject matter or policy area. @example "Internal market" */
  subjectMatter: string;
}

/**
 * European Parliament Event.
 *
 * Represents EP events including hearings, conferences, seminars,
 * and institutional events. Sourced from EP API `/events` endpoint.
 *
 * **Intelligence Perspective:** Event monitoring enables early detection of emerging
 * policy priorities and stakeholder engagement patterns.
 *
 * **Business Perspective:** Event data powers calendar integration and stakeholder
 * engagement tracking products.
 *
 * **Marketing Perspective:** Event calendars and hearing notifications are
 * high-engagement features that drive daily active usage and newsletter signups.
 *
 * **Data Source:** EP API `/events` endpoint
 *
 * **ISMS Policy:** SC-002 (Secure Coding Standards)
 *
 * @interface EPEvent
 * @see https://data.europarl.europa.eu/api/v2/events
 */
export interface EPEvent {
  /** Unique event identifier. @example "event/EVT-2024-001" */
  id: string;
  /** Event title. @example "Public hearing on AI Act implementation" */
  title: string;
  /** Event date in ISO 8601 format. @example "2024-06-15" */
  date: string;
  /** Event end date (if multi-day). @example "2024-06-16" */
  endDate: string;
  /** Event type classification. @example "HEARING" */
  type: string;
  /** Event location. @example "Brussels" */
  location: string;
  /** Organizing body. @example "IMCO" */
  organizer: string;
  /** Event status. @example "CONFIRMED" */
  status: string;
}

/**
 * Meeting activity linked to an EP plenary sitting.
 *
 * Represents an individual activity item (debate, vote, presentation) within
 * a plenary sitting. Sourced from EP API `/meetings/{sitting-id}/activities` endpoint.
 *
 * **Intelligence Perspective:** Activity-level granularity enables precise tracking of
 * plenary agenda items, time allocation analysis, and priority assessment.
 *
 * **Business Perspective:** Activity-level data powers detailed meeting analytics
 * and agenda monitoring services for government affairs teams.
 *
 * **Marketing Perspective:** Granular agenda tracking differentiates from competitors
 * offering only session-level data—key selling point for premium tiers.
 *
 * **Data Source:** EP API `/meetings/{sitting-id}/activities` endpoint
 *
 * **ISMS Policy:** SC-002 (Secure Coding Standards)
 *
 * @interface MeetingActivity
 * @see https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/activities
 */
export interface MeetingActivity {
  /** Unique activity identifier. @example "act/MTG-PL-2024-001-01" */
  id: string;
  /** Activity title or description. @example "Debate on AI regulation" */
  title: string;
  /** Type of activity. @example "DEBATE" */
  type: string;
  /** Activity date. @example "2024-03-15" */
  date: string;
  /** Activity order within the sitting. @example 1 */
  order: number;
  /** Reference to related document or procedure. @example "A9-0001/2024" */
  reference: string;
  /** Responsible body or committee. @example "IMCO" */
  responsibleBody: string;
}

/**
 * MEP Declaration (financial interests, activities, assets).
 *
 * Represents declarations of financial interests filed by MEPs as required
 * by the Rules of Procedure. Sourced from EP API `/meps-declarations` endpoint.
 *
 * **Intelligence Perspective:** Financial declarations enable conflict-of-interest
 * detection, lobbying pattern analysis, and transparency assessment for MEP profiling.
 *
 * **Business Perspective:** Declaration data supports compliance monitoring products
 * and corporate governance risk assessment services.
 *
 * **Marketing Perspective:** Transparency and anti-corruption features powered by
 * declaration data are compelling for NGO, academic, and media customer segments.
 *
 * **Data Source:** EP API `/meps-declarations` endpoint
 *
 * **ISMS Policy:** SC-002 (Secure Coding Standards), AU-002 (Audit Logging)
 *
 * @interface MEPDeclaration
 * @gdpr Contains personal financial data - requires enhanced audit logging
 * @see https://data.europarl.europa.eu/api/v2/meps-declarations
 */
export interface MEPDeclaration {
  /** Unique declaration document identifier. @example "dec/2024/001" */
  id: string;
  /** Declaration title. @example "Declaration of financial interests" */
  title: string;
  /**
   * MEP identifier who filed the declaration.
   * @gdpr Personal data - MEP identifier requires audit logging per ISMS AU-002
   * @example "person/124936"
   */
  mepId: string;
  /**
   * MEP name.
   * @gdpr Personal data - name requires audit logging per ISMS AU-002
   * @example "Jane Andersson"
   */
  mepName: string;
  /** Type of declaration. @example "FINANCIAL_INTERESTS" */
  type: string;
  /** Date the declaration was filed. @example "2024-01-15" */
  dateFiled: string;
  /** Declaration status. @example "PUBLISHED" */
  status: string;
}
