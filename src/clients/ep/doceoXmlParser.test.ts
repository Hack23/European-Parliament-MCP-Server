/**
 * Tests for DOCEO XML parser
 */

import { describe, it, expect } from 'vitest';
import {
  parseRcvXml,
  parseVotXml,
  buildDoceoUrl,
  getPlenaryWeekDates,
  rcvToLatestVotes,
  votToLatestVotes,
  CURRENT_PARLIAMENTARY_TERM,
  DOCEO_BASE_URL,
} from './doceoXmlParser.js';

describe('doceoXmlParser', () => {
  describe('buildDoceoUrl', () => {
    it('builds correct RCV URL', () => {
      const url = buildDoceoUrl('2026-04-27', 'RCV');
      expect(url).toBe(`${DOCEO_BASE_URL}PV-10-2026-04-27-RCV_EN.xml`);
    });

    it('builds correct VOT URL', () => {
      const url = buildDoceoUrl('2026-04-27', 'VOT');
      expect(url).toBe(`${DOCEO_BASE_URL}PV-10-2026-04-27-VOT_EN.xml`);
    });

    it('uses custom term and language', () => {
      const url = buildDoceoUrl('2024-01-15', 'RCV', 9, 'FR');
      expect(url).toBe(`${DOCEO_BASE_URL}PV-9-2024-01-15-RCV_FR.xml`);
    });

    it('throws on invalid date format', () => {
      expect(() => buildDoceoUrl('2026/04/27', 'RCV')).toThrow('Invalid date format');
      expect(() => buildDoceoUrl('not-a-date', 'VOT')).toThrow('Invalid date format');
    });
  });

  describe('getPlenaryWeekDates', () => {
    it('returns 4 dates starting from given Monday', () => {
      const dates = getPlenaryWeekDates('2026-04-27');
      expect(dates).toHaveLength(4);
      expect(dates[0]).toBe('2026-04-27');
      expect(dates[1]).toBe('2026-04-28');
      expect(dates[2]).toBe('2026-04-29');
      expect(dates[3]).toBe('2026-04-30');
    });

    it('returns 4 dates when no start given (current week)', () => {
      const dates = getPlenaryWeekDates();
      expect(dates).toHaveLength(4);
      // Verify they are valid date strings
      for (const d of dates) {
        expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  describe('parseRcvXml', () => {
    it('parses empty XML to empty array', () => {
      expect(parseRcvXml('')).toEqual([]);
      expect(parseRcvXml('<xml></xml>')).toEqual([]);
    });

    it('parses RCV XML with vote results', () => {
      const xml = `
        <RollCallVoteResults>
          <RollCallVote.Result Identifier="1">
            <RollCallVote.Description.Text>Amendment 47 to DSA</RollCallVote.Description.Text>
            <Result.For>
              <PoliticalGroup Identifier="EPP">
                <PoliticalGroup.Member.Name MepId="12345">John Doe</PoliticalGroup.Member.Name>
                <PoliticalGroup.Member.Name MepId="12346">Jane Smith</PoliticalGroup.Member.Name>
              </PoliticalGroup>
            </Result.For>
            <Result.Against>
              <PoliticalGroup Identifier="S&amp;D">
                <PoliticalGroup.Member.Name MepId="23456">Bob Johnson</PoliticalGroup.Member.Name>
              </PoliticalGroup>
            </Result.Against>
            <Result.Abstention>
            </Result.Abstention>
          </RollCallVote.Result>
        </RollCallVoteResults>
      `;

      const results = parseRcvXml(xml);
      expect(results).toHaveLength(1);
      expect(results[0]!.voteId).toBe('1');
      expect(results[0]!.description).toBe('Amendment 47 to DSA');
      expect(results[0]!.votesFor).toHaveLength(2);
      expect(results[0]!.votesAgainst).toHaveLength(1);
      expect(results[0]!.abstentions).toHaveLength(0);
      expect(results[0]!.result).toBe('ADOPTED');
      expect(results[0]!.votesFor[0]!.mepId).toBe('12345');
      expect(results[0]!.votesFor[0]!.name).toBe('John Doe');
      expect(results[0]!.votesFor[0]!.politicalGroup).toBe('EPP');
    });

    it('handles multiple vote results', () => {
      const xml = `
        <RollCallVoteResults>
          <RollCallVote.Result Identifier="1">
            <RollCallVote.Description.Text>Vote 1</RollCallVote.Description.Text>
            <Result.For>
              <PoliticalGroup Identifier="EPP">
                <PoliticalGroup.Member.Name MepId="100">A B</PoliticalGroup.Member.Name>
              </PoliticalGroup>
            </Result.For>
            <Result.Against></Result.Against>
            <Result.Abstention></Result.Abstention>
          </RollCallVote.Result>
          <RollCallVote.Result Identifier="2">
            <RollCallVote.Description.Text>Vote 2</RollCallVote.Description.Text>
            <Result.For></Result.For>
            <Result.Against>
              <PoliticalGroup Identifier="GRN">
                <PoliticalGroup.Member.Name MepId="200">C D</PoliticalGroup.Member.Name>
                <PoliticalGroup.Member.Name MepId="201">E F</PoliticalGroup.Member.Name>
              </PoliticalGroup>
            </Result.Against>
            <Result.Abstention></Result.Abstention>
          </RollCallVote.Result>
        </RollCallVoteResults>
      `;

      const results = parseRcvXml(xml);
      expect(results).toHaveLength(2);
      expect(results[0]!.result).toBe('ADOPTED');
      expect(results[1]!.result).toBe('REJECTED');
    });
  });

  describe('parseVotXml', () => {
    it('parses empty XML to empty array', () => {
      expect(parseVotXml('')).toEqual([]);
    });

    it('parses VOT XML with vote results', () => {
      const xml = `
        <VoteResults>
          <Vote.Result Number="1">
            <Subject>Climate Action Framework</Subject>
            <Reference>A10-0042/2026</Reference>
            <For>385</For>
            <Against>210</Against>
            <Abstention>45</Abstention>
            <Result>Adopted</Result>
          </Vote.Result>
          <Vote.Result Number="2">
            <Subject>Budget Amendment</Subject>
            <Reference>B10-0001/2026</Reference>
            <For>180</For>
            <Against>420</Against>
            <Abstention>30</Abstention>
            <Result>Rejected</Result>
          </Vote.Result>
        </VoteResults>
      `;

      const results = parseVotXml(xml);
      expect(results).toHaveLength(2);
      expect(results[0]!.subject).toBe('Climate Action Framework');
      expect(results[0]!.reference).toBe('A10-0042/2026');
      expect(results[0]!.votesFor).toBe(385);
      expect(results[0]!.votesAgainst).toBe(210);
      expect(results[0]!.abstentions).toBe(45);
      expect(results[0]!.result).toBe('ADOPTED');

      expect(results[1]!.subject).toBe('Budget Amendment');
      expect(results[1]!.result).toBe('REJECTED');
    });
  });

  describe('rcvToLatestVotes', () => {
    it('converts RCV results to LatestVoteRecord format', () => {
      const rcvResults = [{
        voteId: '1',
        description: 'Test vote',
        reference: 'A10-0001/2026',
        votesFor: [
          { mepId: '100', name: 'Alice', politicalGroup: 'EPP' },
          { mepId: '101', name: 'Bob', politicalGroup: 'EPP' },
        ],
        votesAgainst: [
          { mepId: '200', name: 'Charlie', politicalGroup: 'S&D' },
        ],
        abstentions: [],
        result: 'ADOPTED' as const,
      }];

      const records = rcvToLatestVotes(rcvResults, '2026-04-27');
      expect(records).toHaveLength(1);
      expect(records[0]!.id).toBe('RCV-10-2026-04-27-001');
      expect(records[0]!.date).toBe('2026-04-27');
      expect(records[0]!.term).toBe(CURRENT_PARLIAMENTARY_TERM);
      expect(records[0]!.subject).toBe('Test vote');
      expect(records[0]!.votesFor).toBe(2);
      expect(records[0]!.votesAgainst).toBe(1);
      expect(records[0]!.abstentions).toBe(0);
      expect(records[0]!.result).toBe('ADOPTED');
      expect(records[0]!.mepVotes).toEqual({
        '100': 'FOR',
        '101': 'FOR',
        '200': 'AGAINST',
      });
      expect(records[0]!.groupBreakdown).toEqual({
        'EPP': { for: 2, against: 0, abstain: 0 },
        'S&D': { for: 0, against: 1, abstain: 0 },
      });
    });
  });

  describe('votToLatestVotes', () => {
    it('converts VOT results to LatestVoteRecord format', () => {
      const votResults = [{
        itemNumber: '1',
        subject: 'Climate resolution',
        reference: 'A10-0042/2026',
        votesFor: 385,
        votesAgainst: 210,
        abstentions: 45,
        result: 'ADOPTED' as const,
        voteType: 'single',
      }];

      const records = votToLatestVotes(votResults, '2026-04-28');
      expect(records).toHaveLength(1);
      expect(records[0]!.id).toBe('VOT-10-2026-04-28-001');
      expect(records[0]!.date).toBe('2026-04-28');
      expect(records[0]!.subject).toBe('Climate resolution');
      expect(records[0]!.votesFor).toBe(385);
      expect(records[0]!.votesAgainst).toBe(210);
      expect(records[0]!.mepVotes).toBeUndefined();
    });
  });
});
