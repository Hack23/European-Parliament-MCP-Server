/**
 * Unit tests for reportBuilders.ts
 *
 * Tests all branch paths in each report section builder function.
 * All tests are deterministic — no external API calls.
 */

import { describe, it, expect } from 'vitest';
import {
  createVotingSection,
  createCommitteeSection,
  createParliamentaryQuestionsSection,
  createMeetingActivitySection,
  createLegislativeOutputSection,
  createMemberParticipationSection,
  createOverallVotingSection,
  createAdoptionRatesSection,
  createPoliticalGroupSection,
  createNewProposalsSection,
  createCompletedProceduresSection,
  createOngoingProceduresSection,
} from './reportBuilders.js';
import type { MEPDetails } from '../../types/europeanParliament.js';

// ─── Fixture ──────────────────────────────────────────────────────────────────

function makeMEP(overrides: Partial<MEPDetails> = {}): MEPDetails {
  return {
    id: 'MEP-123',
    name: 'Test MEP',
    country: 'SE',
    politicalGroup: 'EPP',
    active: true,
    committees: ['ENVI'],
    termStart: '2019-07-02',
    ...overrides,
  };
}

// ─── createVotingSection ──────────────────────────────────────────────────────

describe('createVotingSection', () => {
  it('returns section with vote count in content', () => {
    const section = createVotingSection(500, null);
    expect(section.title).toBe('Voting Activity');
    expect(section.content).toContain('500');
  });

  it('does not include data when mep is null', () => {
    const section = createVotingSection(100, null);
    expect(section.data).toBeUndefined();
  });

  it('does not include data when mep has no votingStatistics', () => {
    const mep = makeMEP({ votingStatistics: undefined });
    const section = createVotingSection(100, mep);
    expect(section.data).toBeUndefined();
  });

  it('includes votingStatistics data when mep has votingStatistics', () => {
    const mep = makeMEP({
      votingStatistics: {
        totalVotes: 1000,
        votesFor: 700,
        votesAgainst: 200,
        abstentions: 100,
        attendanceRate: 95.0,
      },
    });
    const section = createVotingSection(1000, mep);
    expect(section.data).toBeDefined();
    expect(section.data?.votingStatistics).toEqual(mep.votingStatistics);
  });
});

// ─── createCommitteeSection ───────────────────────────────────────────────────

describe('createCommitteeSection', () => {
  it('returns section with committee count in content', () => {
    const section = createCommitteeSection(3, null);
    expect(section.title).toBe('Committee Involvement');
    expect(section.content).toContain('3');
  });

  it('includes null committees data when mep is null', () => {
    const section = createCommitteeSection(0, null);
    expect(section.data?.committees).toBeUndefined();
  });

  it('includes committees from mep when provided', () => {
    const mep = makeMEP({ committees: ['ENVI', 'ITRE'] });
    const section = createCommitteeSection(2, mep);
    expect(section.data?.committees).toEqual(['ENVI', 'ITRE']);
  });
});

// ─── createParliamentaryQuestionsSection ─────────────────────────────────────

describe('createParliamentaryQuestionsSection', () => {
  it('includes count when questionsCount is a number', () => {
    const section = createParliamentaryQuestionsSection(42);
    expect(section.title).toBe('Parliamentary Questions');
    expect(section.content).toContain('42');
  });

  it('uses not-available message when questionsCount is null', () => {
    const section = createParliamentaryQuestionsSection(null);
    expect(section.content).toContain('not available');
  });

  it('works with 0 questions', () => {
    const section = createParliamentaryQuestionsSection(0);
    expect(section.content).toContain('0');
  });
});

// ─── createMeetingActivitySection ────────────────────────────────────────────

describe('createMeetingActivitySection', () => {
  it('includes meeting count when meetingsCount > 0', () => {
    const section = createMeetingActivitySection(10);
    expect(section.title).toBe('Meeting Activity');
    expect(section.content).toContain('10');
  });

  it('uses not-available message when meetingsCount is 0', () => {
    const section = createMeetingActivitySection(0);
    expect(section.content).toContain('not available');
  });
});

// ─── createLegislativeOutputSection ──────────────────────────────────────────

describe('createLegislativeOutputSection', () => {
  it('uses not-available message when both are null', () => {
    const section = createLegislativeOutputSection(null, null);
    expect(section.title).toBe('Legislative Output');
    expect(section.content).toContain('not available');
  });

  it('includes reportsCount when provided and documentsCount is null', () => {
    const section = createLegislativeOutputSection(5, null);
    expect(section.content).toContain('5 adopted texts');
    expect(section.content).not.toContain('committee documents');
  });

  it('includes documentsCount when provided and reportsCount is null', () => {
    const section = createLegislativeOutputSection(null, 10);
    expect(section.content).toContain('10 committee documents');
    expect(section.content).not.toContain('adopted texts');
  });

  it('includes both counts when both are provided', () => {
    const section = createLegislativeOutputSection(5, 10);
    expect(section.content).toContain('5 adopted texts');
    expect(section.content).toContain('10 committee documents');
  });
});

// ─── createMemberParticipationSection ────────────────────────────────────────

describe('createMemberParticipationSection', () => {
  it('includes member count in content', () => {
    const section = createMemberParticipationSection(705);
    expect(section.title).toBe('Member Participation');
    expect(section.content).toContain('705');
  });
});

// ─── createOverallVotingSection ──────────────────────────────────────────────

describe('createOverallVotingSection', () => {
  it('includes session count when provided', () => {
    const section = createOverallVotingSection(12);
    expect(section.title).toBe('Overall Voting Activity');
    expect(section.content).toContain('12');
  });

  it('uses not-available message when sessionCount is null', () => {
    const section = createOverallVotingSection(null);
    expect(section.content).toContain('not available');
  });
});

// ─── createAdoptionRatesSection ───────────────────────────────────────────────

describe('createAdoptionRatesSection', () => {
  it('includes adopted count when provided', () => {
    const section = createAdoptionRatesSection(50);
    expect(section.title).toBe('Adoption Rates');
    expect(section.content).toContain('50');
  });

  it('uses not-available message when adoptedCount is null', () => {
    const section = createAdoptionRatesSection(null);
    expect(section.content).toContain('not available');
  });
});

// ─── createPoliticalGroupSection ─────────────────────────────────────────────

describe('createPoliticalGroupSection', () => {
  it('returns section about political group alignment', () => {
    const section = createPoliticalGroupSection();
    expect(section.title).toBe('Political Group Alignment');
    expect(section.content).toBeTruthy();
  });
});

// ─── createNewProposalsSection ────────────────────────────────────────────────

describe('createNewProposalsSection', () => {
  it('includes procedure count when provided', () => {
    const section = createNewProposalsSection(25);
    expect(section.title).toBe('New Proposals');
    expect(section.content).toContain('25');
  });

  it('uses not-available message when procedureCount is null', () => {
    const section = createNewProposalsSection(null);
    expect(section.content).toContain('not available');
  });
});

// ─── createCompletedProceduresSection ────────────────────────────────────────

describe('createCompletedProceduresSection', () => {
  it('includes completed count when provided', () => {
    const section = createCompletedProceduresSection(30);
    expect(section.title).toBe('Completed Procedures');
    expect(section.content).toContain('30');
  });

  it('uses not-available message when completedCount is null', () => {
    const section = createCompletedProceduresSection(null);
    expect(section.content).toContain('not available');
  });
});

// ─── createOngoingProceduresSection ──────────────────────────────────────────

describe('createOngoingProceduresSection', () => {
  it('includes ongoing count when provided', () => {
    const section = createOngoingProceduresSection(100);
    expect(section.title).toBe('Ongoing Procedures');
    expect(section.content).toContain('100');
  });

  it('uses not-available message when ongoingCount is null', () => {
    const section = createOngoingProceduresSection(null);
    expect(section.content).toContain('not available');
  });
});
