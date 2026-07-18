import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { z } from 'zod';
import {
  CommitteeSchema,
  MEPDetailsSchema,
  MEPSchema,
} from '../schemas/europeanParliament.js';

const WeeklyMetadataSchema = z.object({
  schemaVersion: z.number().int().min(1),
  generatedAt: z.string(),
  weekKey: z.string(),
  source: z.string(),
  dataset: z.enum(['meps', 'corporate-bodies', 'controlled-vocabularies']).optional(),
  scope: z.enum(['current', 'all']).optional(),
});

const WeeklyMEPCacheSchema = z.object({
  metadata: WeeklyMetadataSchema,
  meps: z.array(MEPSchema),
  mepDetails: z.record(z.string(), MEPDetailsSchema),
});

const WeeklyCorporateBodiesCacheSchema = z.object({
  metadata: WeeklyMetadataSchema,
  corporateBodies: z.array(CommitteeSchema),
  corporateBodyDetails: z.record(z.string(), CommitteeSchema).optional(),
});

const WeeklyVocabulariesCacheSchema = z.object({
  metadata: WeeklyMetadataSchema,
  vocabularies: z.array(z.record(z.string(), z.unknown())),
  vocabularyDetails: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
});

export type WeeklyMEPCache = z.infer<typeof WeeklyMEPCacheSchema>;
export type WeeklyCorporateBodiesCache = z.infer<typeof WeeklyCorporateBodiesCacheSchema>;
export type WeeklyVocabulariesCache = z.infer<typeof WeeklyVocabulariesCacheSchema>;

const validatedFileCache = new Map<string, Promise<unknown>>();

type WeeklyDataset = 'meps' | 'corporate-bodies' | 'controlled-vocabularies';

export function getWeeklyCachePath(dataset: WeeklyDataset): string {
  const configuredRoot = process.env['EP_WEEKLY_CACHE_DIR'];
  const cacheRoot = configuredRoot === undefined || configuredRoot.trim() === ''
    ? fileURLToPath(new URL('../../data/weekly/', import.meta.url))
    : path.resolve(configuredRoot);
  return path.join(cacheRoot, dataset, 'latest.json');
}

async function loadAndValidate<T>(filePath: string, schema: z.ZodType<T>): Promise<T | null> {
  const existing = validatedFileCache.get(filePath);
  if (existing !== undefined) return await existing as T | null;

  const loading = (async (): Promise<T | null> => {
    try {
      const raw = await readFile(filePath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      const validated = schema.safeParse(parsed);
      return validated.success ? validated.data : null;
    } catch {
      return null;
    }
  })();
  validatedFileCache.set(filePath, loading);
  return loading;
}

export async function loadWeeklyMEPCache(): Promise<WeeklyMEPCache | null> {
  return loadAndValidate(getWeeklyCachePath('meps'), WeeklyMEPCacheSchema);
}

export async function loadWeeklyCorporateBodiesCache(): Promise<WeeklyCorporateBodiesCache | null> {
  return loadAndValidate(
    getWeeklyCachePath('corporate-bodies'),
    WeeklyCorporateBodiesCacheSchema,
  );
}

export async function loadWeeklyVocabulariesCache(): Promise<WeeklyVocabulariesCache | null> {
  return loadAndValidate(
    getWeeklyCachePath('controlled-vocabularies'),
    WeeklyVocabulariesCacheSchema,
  );
}
