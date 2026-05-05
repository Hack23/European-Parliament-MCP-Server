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
        sittingDate: '2026-04-27',
        sittingNumber: '1',
        voteType: 'normal',
        officialForCount: 385,
        officialAgainstCount: 210,
        officialAbstentionCount: 45,
        corrections: [],
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
      expect(records[0]!.dataSource).toBe('RCV');
      expect(records[0]!.sittingDate).toBe('2026-04-27');
      expect(records[0]!.sittingNumber).toBe('1');
      expect(records[0]!.voteType).toBe('normal');
      expect(records[0]!.officialCounts).toEqual({ for: 385, against: 210, abstentions: 45 });
      expect(records[0]!.corrections).toBeUndefined(); // empty array → undefined
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

    it('includes corrections when present', () => {
      const rcvResults = [{
        voteId: '2',
        description: 'Vote with corrections',
        reference: 'B10-0001/2026',
        votesFor: [],
        votesAgainst: [],
        abstentions: [],
        result: 'REJECTED' as const,
        sittingDate: '',
        sittingNumber: '',
        voteType: '',
        officialForCount: 0,
        officialAgainstCount: 0,
        officialAbstentionCount: 0,
        corrections: [{ mepId: '999', name: 'Corrector', politicalGroup: 'EPP', country: 'DE' }],
      }];

      const records = rcvToLatestVotes(rcvResults, '2026-04-28');
      expect(records[0]!.corrections).toHaveLength(1);
      expect(records[0]!.corrections?.[0]?.mepId).toBe('999');
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
        tableTitle: 'Results of votes',
        rowType: 'normal',
        officialForCount: 385,
        officialAgainstCount: 210,
        officialAbstentionCount: 45,
      }];

      const records = votToLatestVotes(votResults, '2026-04-28');
      expect(records).toHaveLength(1);
      expect(records[0]!.id).toBe('VOT-10-2026-04-28-001');
      expect(records[0]!.date).toBe('2026-04-28');
      expect(records[0]!.subject).toBe('Climate resolution');
      expect(records[0]!.votesFor).toBe(385);
      expect(records[0]!.votesAgainst).toBe(210);
      expect(records[0]!.dataSource).toBe('VOT');
      expect(records[0]!.voteType).toBe('normal');
      expect(records[0]!.officialCounts).toEqual({ for: 385, against: 210, abstentions: 45 });
      expect(records[0]!.mepVotes).toBeUndefined();
    });
  });

  describe('New XML attribute extraction', () => {
    it('extracts sittingDate, sittingNumber, voteType from RCV XML', () => {
      const xml = `
        <RollCallVoteResults>
          <RollCallVote.Result Identifier="42" Date="2026-04-27" Number.Sitting="3" Type="normal">
            <RollCallVote.Description.Text>Digital Markets Act</RollCallVote.Description.Text>
            <RollCallVote.Reference>A10-0042/2026</RollCallVote.Reference>
            <Result.For Number="385">
              <PoliticalGroup.List Identifier="EPP">
                <PoliticalGroup.Member.Name MepId="124810" Country="FR">Marie Dupont</PoliticalGroup.Member.Name>
              </PoliticalGroup.List>
            </Result.For>
            <Result.Against Number="210">
            </Result.Against>
            <Result.Abstention Number="45">
            </Result.Abstention>
            <Correction>
              <PoliticalGroup.List Identifier="S&amp;D">
                <PoliticalGroup.Member.Name MepId="99999" Country="DE">Hans Mueller</PoliticalGroup.Member.Name>
              </PoliticalGroup.List>
            </Correction>
          </RollCallVote.Result>
        </RollCallVoteResults>
      `;

      const results = parseRcvXml(xml);
      expect(results).toHaveLength(1);
      const r = results[0]!;
      expect(r.sittingDate).toBe('2026-04-27');
      expect(r.sittingNumber).toBe('3');
      expect(r.voteType).toBe('normal');
      expect(r.officialForCount).toBe(385);
      expect(r.officialAgainstCount).toBe(210);
      expect(r.officialAbstentionCount).toBe(45);
      expect(r.corrections).toHaveLength(1);
      expect(r.corrections[0]!.mepId).toBe('99999');
      expect(r.corrections[0]!.politicalGroup).toBe('S&D');
      expect(r.corrections[0]!.country).toBe('DE');
    });

    it('extracts Country attribute from MEP votes', () => {
      const xml = `
        <RollCallVoteResults>
          <RollCallVote.Result Identifier="1">
            <Result.For>
              <PoliticalGroup.List Identifier="EPP">
                <PoliticalGroup.Member.Name MepId="124810" Country="FR">Marie Dupont</PoliticalGroup.Member.Name>
                <PoliticalGroup.Member.Name MepId="124811">No Country</PoliticalGroup.Member.Name>
              </PoliticalGroup.List>
            </Result.For>
            <Result.Against></Result.Against>
            <Result.Abstention></Result.Abstention>
          </RollCallVote.Result>
        </RollCallVoteResults>
      `;

      const results = parseRcvXml(xml);
      expect(results[0]!.votesFor[0]!.country).toBe('FR');
      expect(results[0]!.votesFor[1]!.country).toBeUndefined();
    });

    it('falls back to MEP count when Number attribute absent', () => {
      const xml = `
        <RollCallVoteResults>
          <RollCallVote.Result Identifier="1">
            <Result.For>
              <PoliticalGroup.List Identifier="EPP">
                <PoliticalGroup.Member.Name MepId="100" Country="DE">Alice</PoliticalGroup.Member.Name>
                <PoliticalGroup.Member.Name MepId="101" Country="AT">Bob</PoliticalGroup.Member.Name>
              </PoliticalGroup.List>
            </Result.For>
            <Result.Against></Result.Against>
            <Result.Abstention></Result.Abstention>
          </RollCallVote.Result>
        </RollCallVoteResults>
      `;
      const results = parseRcvXml(xml);
      expect(results[0]!.officialForCount).toBe(2); // falls back to MEP count
    });

    it('parses Table/Row format in VOT XML', () => {
      const xml = `
        <Text>
          <Table Title="Results of votes - 27 April 2026">
            <Row Number="1" Type="normal">
              <Text.Object>A10-0042/2026</Text.Object>
              <Instution><Text.Object>Climate Action Framework</Text.Object></Instution>
              <Result.Group For="385" Against="210" Abst="45">+</Result.Group>
              <Row.Result>+</Row.Result>
            </Row>
            <Row Number="2" Type="amendment">
              <Result.Group For="100" Against="450" Abst="30">-</Result.Group>
              <Row.Result>-</Row.Result>
            </Row>
          </Table>
        </Text>
      `;

      const results = parseVotXml(xml);
      expect(results).toHaveLength(2);
      const r = results[0]!;
      expect(r.tableTitle).toBe('Results of votes - 27 April 2026');
      expect(r.rowType).toBe('normal');
      expect(r.officialForCount).toBe(385);
      expect(r.officialAgainstCount).toBe(210);
      expect(r.officialAbstentionCount).toBe(45);
      expect(r.votesFor).toBe(385);
      expect(r.votesAgainst).toBe(210);
      expect(r.result).toBe('ADOPTED');
      expect(results[1]!.result).toBe('REJECTED');
      expect(results[1]!.rowType).toBe('amendment');
    });

    it('VOT: prefers official Result.Group counts over tag content', () => {
      const xml = `
        <VoteResults>
          <Vote.Result Number="1">
            <Subject>Test</Subject>
            <For>100</For>
            <Against>50</Against>
            <Abstention>10</Abstention>
            <Result.Group For="400" Against="200" Abst="20">+</Result.Group>
            <Result>Adopted</Result>
          </Vote.Result>
        </VoteResults>
      `;
      const results = parseVotXml(xml);
      expect(results[0]!.votesFor).toBe(400);
      expect(results[0]!.officialForCount).toBe(400);
    });
  });
});

// ─── Edge cases and branch coverage ──────────────────────────────────────────

describe('Edge cases and branch coverage', () => {
  // A. pickVoteType — rowType empty, voteType non-empty (lines 276-277)
  describe('pickVoteType via votToLatestVotes', () => {
    it('uses voteType when rowType is empty', () => {
      const votResults = [{
        itemNumber: '1', subject: 'X', reference: '', votesFor: 10, votesAgainst: 5,
        abstentions: 1, result: 'ADOPTED' as const, voteType: 'single', tableTitle: '',
        rowType: '', officialForCount: 10, officialAgainstCount: 5, officialAbstentionCount: 1,
      }];
      const records = votToLatestVotes(votResults, '2026-05-01');
      expect(records[0]!.voteType).toBe('single');
    });

    it('omits voteType when both rowType and voteType are empty', () => {
      const votResults = [{
        itemNumber: '1', subject: 'X', reference: '', votesFor: 10, votesAgainst: 5,
        abstentions: 1, result: 'ADOPTED' as const, voteType: '', tableTitle: '',
        rowType: '', officialForCount: 10, officialAgainstCount: 5, officialAbstentionCount: 1,
      }];
      const records = votToLatestVotes(votResults, '2026-05-01');
      expect(records[0]!.voteType).toBeUndefined();
    });
  });

  // B. buildGroupBreakdown — abstain path (lines 560-562)
  describe('buildGroupBreakdown abstentions', () => {
    it('counts abstentions in groupBreakdown', () => {
      const rcvResults = [{
        voteId: '1', description: 'Test', reference: '',
        votesFor: [], votesAgainst: [],
        abstentions: [{ mepId: '300', name: 'Eve', politicalGroup: 'Greens/EFA' }],
        result: 'REJECTED' as const, sittingDate: '', sittingNumber: '', voteType: '',
        officialForCount: 0, officialAgainstCount: 1, officialAbstentionCount: 1, corrections: [],
      }];
      const records = rcvToLatestVotes(rcvResults, '2026-05-01');
      expect(records[0]!.groupBreakdown?.['Greens/EFA']?.abstain).toBe(1);
      expect(records[0]!.groupBreakdown?.['Greens/EFA']?.for).toBe(0);
    });
  });

  // C. decodeXmlEntities — S&D group identifier
  describe('decodeXmlEntities via parseRcvXml', () => {
    it('decodes XML entities in group identifiers', () => {
      const xml = `<RollCallVoteResults>
        <RollCallVote.Result Identifier="1">
          <Result.For>
            <PoliticalGroup Identifier="S&amp;D">
              <PoliticalGroup.Member.Name MepId="100">Alice</PoliticalGroup.Member.Name>
            </PoliticalGroup>
          </Result.For>
          <Result.Against></Result.Against>
          <Result.Abstention></Result.Abstention>
        </RollCallVote.Result>
      </RollCallVoteResults>`;
      const results = parseRcvXml(xml);
      expect(results[0]!.votesFor[0]!.politicalGroup).toBe('S&D');
    });
  });

  // D. parseSingleRcvVote — reference present, no description
  describe('parseSingleRcvVote fallback', () => {
    it('falls back to reference when description is empty', () => {
      const xml = `<RollCallVoteResults>
        <RollCallVote.Result Identifier="5">
          <RollCallVote.Reference>A10-0099/2026</RollCallVote.Reference>
          <Result.For></Result.For>
          <Result.Against></Result.Against>
          <Result.Abstention></Result.Abstention>
        </RollCallVote.Result>
      </RollCallVoteResults>`;
      const results = parseRcvXml(xml);
      expect(results[0]!.reference).toBe('A10-0099/2026');
      expect(results[0]!.description).toBe('');
    });
  });

  // E. rcvToLatestVotes — subject fallback chain
  describe('rcvToLatestVotes subject fallback', () => {
    it('uses reference as subject fallback when description is empty', () => {
      const rcvResults = [{
        voteId: '1', description: '', reference: 'A10-0005/2026',
        votesFor: [], votesAgainst: [], abstentions: [],
        result: 'REJECTED' as const, sittingDate: '', sittingNumber: '', voteType: '',
        officialForCount: 0, officialAgainstCount: 0, officialAbstentionCount: 0, corrections: [],
      }];
      const records = rcvToLatestVotes(rcvResults, '2026-05-01');
      expect(records[0]!.subject).toBe('A10-0005/2026');
    });

    it('uses Vote #N as subject when both description and reference are empty', () => {
      const rcvResults = [{
        voteId: '1', description: '', reference: '',
        votesFor: [], votesAgainst: [], abstentions: [],
        result: 'REJECTED' as const, sittingDate: '', sittingNumber: '', voteType: '',
        officialForCount: 0, officialAgainstCount: 0, officialAbstentionCount: 0, corrections: [],
      }];
      const records = rcvToLatestVotes(rcvResults, '2026-05-01');
      expect(records[0]!.subject).toBe('Vote #1');
    });
  });

  // F. votToLatestVotes — subject fallback chain
  describe('votToLatestVotes subject fallback', () => {
    it('uses reference as subject fallback when subject is empty in VOT', () => {
      const votResults = [{
        itemNumber: '3', subject: '', reference: 'B10-0002/2026',
        votesFor: 5, votesAgainst: 3, abstentions: 1,
        result: 'ADOPTED' as const, voteType: '', tableTitle: '', rowType: '',
        officialForCount: 5, officialAgainstCount: 3, officialAbstentionCount: 1,
      }];
      const records = votToLatestVotes(votResults, '2026-05-01');
      expect(records[0]!.subject).toBe('B10-0002/2026');
    });

    it('uses Vote item #N as subject when both subject and reference are empty in VOT', () => {
      const votResults = [{
        itemNumber: '7', subject: '', reference: '',
        votesFor: 0, votesAgainst: 1, abstentions: 0,
        result: 'REJECTED' as const, voteType: '', tableTitle: '', rowType: '',
        officialForCount: 0, officialAgainstCount: 1, officialAbstentionCount: 0,
      }];
      const records = votToLatestVotes(votResults, '2026-05-01');
      expect(records[0]!.subject).toBe('Vote item #7');
    });
  });

  // G. parseVotXml — fallback to Result elements when no Vote.Result elements
  describe('parseVotXml fallback element names', () => {
    it('falls back to Result elements when Vote.Result is absent', () => {
      const xml = `<VoteResults>
        <Result Number="1">
          <Subject>Direct result format</Subject>
          <Reference>C10-0001/2026</Reference>
          <For>300</For>
          <Against>50</Against>
          <Abstention>20</Abstention>
          <Result>Adopted</Result>
        </Result>
      </VoteResults>`;
      const results = parseVotXml(xml);
      expect(results).toHaveLength(1);
      expect(results[0]!.subject).toBe('Direct result format');
    });
  });

  // H. parseRcvXml — fallback to RollCallVote when RollCallVote.Result is absent
  describe('parseRcvXml fallback element names', () => {
    it('falls back to RollCallVote elements when RollCallVote.Result is absent', () => {
      const xml = `<RollCallVoteResults>
        <RollCallVote Identifier="99">
          <RollCallVote.Description.Text>Fallback element</RollCallVote.Description.Text>
          <Result.For>
            <PoliticalGroup Identifier="EPP">
              <PoliticalGroup.Member.Name MepId="1">A</PoliticalGroup.Member.Name>
            </PoliticalGroup>
          </Result.For>
          <Result.Against></Result.Against>
          <Result.Abstention></Result.Abstention>
        </RollCallVote>
      </RollCallVoteResults>`;
      const results = parseRcvXml(xml);
      expect(results).toHaveLength(1);
      expect(results[0]!.description).toBe('Fallback element');
    });
  });
});
