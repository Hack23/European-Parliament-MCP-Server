#!/usr/bin/env tsx
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { EuropeanParliamentClient } from '../src/clients/europeanParliamentClient.js';
import { CommitteeSchema, MEPDetailsSchema, MEPSchema } from '../src/schemas/europeanParliament.js';
import { fetchMEPBatch } from '../src/utils/allMepFetcher.js';

type Dataset = 'meps' | 'corporate-bodies' | 'controlled-vocabularies';

interface WeeklyMetadata {
  schemaVersion: number;
  generatedAt: string;
  weekKey: string;
  source: string;
}

interface ScriptOptions {
  dataset: Dataset;
  batchSize: number;
}

interface ExistingMEPCache {
  mepDetails: Record<string, unknown>;
  missingDetailIds: string[];
}

function parseScriptArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const datasetIndex = args.findIndex((arg) => arg === '--dataset');
  const datasetValue = datasetIndex >= 0 ? args[datasetIndex + 1] : undefined;
  if (datasetValue !== 'meps' && datasetValue !== 'corporate-bodies' && datasetValue !== 'controlled-vocabularies') {
    throw new Error('Missing or invalid --dataset (expected: meps | corporate-bodies | controlled-vocabularies)');
  }

  const batchSizeIndex = args.findIndex((arg) => arg === '--batch-size');
  const batchSizeRaw = batchSizeIndex >= 0 ? args[batchSizeIndex + 1] : undefined;
  const batchSize = batchSizeRaw === undefined ? 250 : Number.parseInt(batchSizeRaw, 10);
  if (!Number.isFinite(batchSize) || batchSize < 1) {
    throw new Error('Invalid --batch-size (expected positive integer)');
  }

  return {
    dataset: datasetValue,
    batchSize,
  };
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

function getMEPLatestPath(): string {
  return path.resolve(process.cwd(), 'data', 'weekly', 'meps', 'latest.json');
}

function normalizeMepIdentifier(id: string): string {
  if (id.startsWith('MEP-')) return id.substring(4);
  if (id.startsWith('person/')) return id.substring(7);
  return id;
}

function readExistingMEPCache(): ExistingMEPCache {
  const latestPath = getMEPLatestPath();
  if (!existsSync(latestPath)) {
    return {
      mepDetails: {},
      missingDetailIds: [],
    };
  }

  try {
    const raw = readFileSync(latestPath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { mepDetails: {}, missingDetailIds: [] };
    }
    const candidate = parsed as {
      mepDetails?: unknown;
      missingDetailIds?: unknown;
    };
    const mepDetails = typeof candidate.mepDetails === 'object' && candidate.mepDetails !== null
      ? candidate.mepDetails as Record<string, unknown>
      : {};
    const missingDetailIds = Array.isArray(candidate.missingDetailIds)
      ? candidate.missingDetailIds.filter((id): id is string => typeof id === 'string')
      : [];
    return { mepDetails, missingDetailIds };
  } catch {
    return {
      mepDetails: {},
      missingDetailIds: [],
    };
  }
}

function hasCachedDetail(mepDetails: Record<string, unknown>, id: string): boolean {
  const normalized = normalizeMepIdentifier(id);
  return mepDetails[id] !== undefined
    || mepDetails[normalized] !== undefined
    || mepDetails[`MEP-${normalized}`] !== undefined
    || mepDetails[`person/${normalized}`] !== undefined;
}

function cacheMEPDetail(mepDetails: Record<string, unknown>, id: string, details: unknown): void {
  const normalized = normalizeMepIdentifier(id);
  mepDetails[id] = details;
  mepDetails[normalized] = details;
  mepDetails[`MEP-${normalized}`] = details;
  mepDetails[`person/${normalized}`] = details;
}

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { statusCode?: unknown };
  return candidate.statusCode === 404;
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

async function buildMEPDataset(client: EuropeanParliamentClient, batchSize: number): Promise<void> {
  const existing = readExistingMEPCache();
  const mepsRaw = await fetchMEPBatch(client, batchSize);
  const meps = mepsRaw.map((mep) => MEPSchema.parse(mep));
  const mepDetails: Record<string, unknown> = { ...existing.mepDetails };
  const missingDetailIds = new Set(existing.missingDetailIds);

  const activeMepIds = new Set(meps.map((mep) => mep.id));
  for (const missingId of Array.from(missingDetailIds)) {
    if (!activeMepIds.has(missingId)) {
      missingDetailIds.delete(missingId);
    }
  }

  const pending = meps.filter((mep) => !hasCachedDetail(mepDetails, mep.id) && !missingDetailIds.has(mep.id));
  const batch = pending.slice(0, batchSize);
  const failedDetailIds: string[] = [];
  let successfulFetches = 0;

  for (const mep of batch) {
    try {
      const details = MEPDetailsSchema.parse(await client.getMEPDetails(mep.id));
      cacheMEPDetail(mepDetails, mep.id, details);
      if (details.identifier !== undefined) {
        cacheMEPDetail(mepDetails, details.identifier, details);
      }
      successfulFetches += 1;
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        console.warn(`[weekly-cache] MEP details not found for ${mep.id}; skipping future retries this week.`);
        missingDetailIds.add(mep.id);
        continue;
      }
      console.warn(`[weekly-cache] Failed to fetch MEP details for ${mep.id}; will retry in a future run.`);
      failedDetailIds.push(mep.id);
    }
  }

  const pendingAfterBatch = meps.filter((mep) => !hasCachedDetail(mepDetails, mep.id) && !missingDetailIds.has(mep.id));

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
    missingDetailIds: Array.from(missingDetailIds).sort(),
    progress: {
      batchSize,
      fetchedInRun: successfulFetches,
      failedInRun: failedDetailIds.length,
      remainingDetails: pendingAfterBatch.length,
      complete: pendingAfterBatch.length === 0,
      failedDetailIds,
    },
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
  const options = parseScriptArgs();
  const client = new EuropeanParliamentClient();

  if (options.dataset === 'meps') {
    await buildMEPDataset(client, options.batchSize);
    return;
  }
  if (options.dataset === 'corporate-bodies') {
    await buildCorporateBodiesDataset(client);
    return;
  }
  await buildControlledVocabulariesDataset(client);
}

void main();
