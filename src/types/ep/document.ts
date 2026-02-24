/**
 * Legislative document type definitions.
 *
 * Interfaces and types for EP legislative documents, document types, and status tracking.
 *
 * @module types/ep/document
 * @see https://data.europarl.europa.eu/api/v2/
 */

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
