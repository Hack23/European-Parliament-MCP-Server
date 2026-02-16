/**
 * Type definitions for European Parliament data structures
 * 
 * ISMS Policy: SC-002 (Secure Coding Standards)
 */

/**
 * Member of European Parliament
 */
export interface MEP {
  id: string;
  name: string;
  country: string;
  politicalGroup: string;
  committees: string[];
  email?: string;
  active: boolean;
  termStart: string;
  termEnd?: string;
}

/**
 * Detailed MEP information including biography
 */
export interface MEPDetails extends MEP {
  biography?: string;
  phone?: string;
  address?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  votingStatistics?: VotingStatistics;
  roles?: string[];
}

/**
 * Voting statistics for an MEP
 */
export interface VotingStatistics {
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  attendanceRate: number;
}

/**
 * Plenary session information
 */
export interface PlenarySession {
  id: string;
  date: string;
  location: string;
  agendaItems: string[];
  votingRecords?: VotingRecord[];
  attendanceCount?: number;
  documents?: string[];
}

/**
 * Voting record for a plenary vote
 */
export interface VotingRecord {
  id: string;
  sessionId: string;
  topic: string;
  date: string;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  result: 'ADOPTED' | 'REJECTED';
  mepVotes?: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>;
}

/**
 * Committee information
 */
export interface Committee {
  id: string;
  name: string;
  abbreviation: string;
  members: string[];
  chair?: string;
  viceChairs?: string[];
  meetingSchedule?: string[];
  responsibilities?: string[];
}

/**
 * Legislative document
 */
export interface LegislativeDocument {
  id: string;
  type: DocumentType;
  title: string;
  date: string;
  authors: string[];
  committee?: string;
  status: DocumentStatus;
  pdfUrl?: string;
  xmlUrl?: string;
  summary?: string;
}

/**
 * Document types
 */
export type DocumentType = 
  | 'REPORT' 
  | 'RESOLUTION' 
  | 'DECISION' 
  | 'DIRECTIVE' 
  | 'REGULATION' 
  | 'OPINION'
  | 'AMENDMENT';

/**
 * Document status
 */
export type DocumentStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'IN_COMMITTEE' 
  | 'PLENARY' 
  | 'ADOPTED' 
  | 'REJECTED';

/**
 * Parliamentary question
 */
export interface ParliamentaryQuestion {
  id: string;
  type: 'WRITTEN' | 'ORAL';
  author: string;
  date: string;
  topic: string;
  questionText: string;
  answerText?: string;
  answerDate?: string;
  status: 'PENDING' | 'ANSWERED';
}

/**
 * API error response
 */
export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
