#!/usr/bin/env tsx
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EuropeanParliamentClient } from '../src/clients/europeanParliamentClient.js';
import { CommitteeSchema, MEPDetailsSchema, MEPSchema } from '../src/schemas/europeanParliament.js';

type Dataset = 'meps' | 'corporate-bodies' | 'controlled-vocabularies';

interface WeeklyMetadata {
  schemaVersion: number;
  generatedAt: string;
  weekKey: string;
  source: string;
}

function parseDatasetArg(): Dataset {
  const args = process.argv.slice(2);
  const datasetIndex = args.findIndex((arg) => arg === '--dataset');
  const datasetValue = datasetIndex >= 0 ? args[datasetIndex + 1] : undefined;
  if (datasetValue === 'meps' || datasetValue === 'corporate-bodies' || datasetValue === 'controlled-vocabularies') {
    return datasetValue;
  }
  throw new Error('Missing or invalid --dataset (expected: meps | corporate-bodies | controlled-vocabularies)');
}

function getIsoWeekInfo(date: Date): { year: number; week: number; weekKey: string } {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return {
    year: utc.getUTCFullYear(),
    week,
    weekKey: `${String(utc.getUTCFullYear())}-W${String(week).padStart(2, '0')}`,
  };
}

async function writeDataset(dataset: Dataset, payload: unknown): Promise<void> {
  const now = new Date();
  const iso = getIsoWeekInfo(now);
  const baseDir = path.resolve(process.cwd(), 'data', 'weekly', dataset);
  const weeklyDir = path.join(baseDir, String(iso.year), `week-${String(iso.week).padStart(2, '0')}`);
  await mkdir(weeklyDir, { recursive: true });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await writeFile(path.join(weeklyDir, 'index.json'), json, 'utf-8');
  await writeFile(path.join(baseDir, 'latest.json'), json, 'utf-8');
}

async function fetchAllMEPs(client: EuropeanParliamentClient): Promise<unknown[]> {
  const result: unknown[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await client.getMEPs({ active: false, limit, offset });
    result.push(...page.data);
    if (!page.hasMore) break;
    offset += limit;
  }
  return result;
}

async function fetchAllCorporateBodies(client: EuropeanParliamentClient): Promise<unknown[]> {
  const result: unknown[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await client.getCorporateBodies({ limit, offset });
    result.push(...page.data);
    if (!page.hasMore) break;
    offset += limit;
  }
  return result;
}

async function fetchAllVocabularies(client: EuropeanParliamentClient): Promise<Record<string, unknown>[]> {
  const result: Record<string, unknown>[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await client.getControlledVocabularies({ limit, offset });
    result.push(...page.data);
    if (!page.hasMore) break;
    offset += limit;
  }
  return result;
}

async function buildMEPDataset(client: EuropeanParliamentClient): Promise<void> {
  const mepsRaw = await fetchAllMEPs(client);
  const meps = mepsRaw.map((mep) => MEPSchema.parse(mep));
  const mepDetails: Record<string, unknown> = {};

  for (const mep of meps) {
    const details = MEPDetailsSchema.parse(await client.getMEPDetails(mep.id));
    mepDetails[mep.id] = details;
    if (details.identifier !== undefined) {
      mepDetails[details.identifier] = details;
      mepDetails[`MEP-${details.identifier}`] = details;
      mepDetails[`person/${details.identifier}`] = details;
    }
  }

  const metadata: WeeklyMetadata = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    weekKey: getIsoWeekInfo(new Date()).weekKey,
    source: 'EP Open Data Portal API v2',
  };

  await writeDataset('meps', {
    metadata,
    meps,
    mepDetails,
  });
}

async function buildCorporateBodiesDataset(client: EuropeanParliamentClient): Promise<void> {
  const bodiesRaw = await fetchAllCorporateBodies(client);
  const corporateBodies = bodiesRaw.map((body) => CommitteeSchema.parse(body));
  const corporateBodyDetails: Record<string, unknown> = {};
  for (const body of corporateBodies) {
    corporateBodyDetails[body.id] = CommitteeSchema.parse(await client.getCorporateBodyById(body.id));
    corporateBodyDetails[body.abbreviation] = corporateBodyDetails[body.id];
  }
  const metadata: WeeklyMetadata = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    weekKey: getIsoWeekInfo(new Date()).weekKey,
    source: 'EP Open Data Portal API v2',
  };
  await writeDataset('corporate-bodies', { metadata, corporateBodies, corporateBodyDetails });
}

async function buildControlledVocabulariesDataset(client: EuropeanParliamentClient): Promise<void> {
  const vocabularies = await fetchAllVocabularies(client);
  const vocabularyDetails: Record<string, Record<string, unknown>> = {};
  for (const vocabulary of vocabularies) {
    const id = vocabulary['id'];
    if (typeof id !== 'string' || id.trim() === '') continue;
    vocabularyDetails[id] = await client.getControlledVocabularyById(id);
  }
  const metadata: WeeklyMetadata = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    weekKey: getIsoWeekInfo(new Date()).weekKey,
    source: 'EP Open Data Portal API v2',
  };
  await writeDataset('controlled-vocabularies', { metadata, vocabularies, vocabularyDetails });
}

async function main(): Promise<void> {
  const dataset = parseDatasetArg();
  const client = new EuropeanParliamentClient();

  if (dataset === 'meps') {
    await buildMEPDataset(client);
    return;
  }
  if (dataset === 'corporate-bodies') {
    await buildCorporateBodiesDataset(client);
    return;
  }
  await buildControlledVocabulariesDataset(client);
}

void main();
