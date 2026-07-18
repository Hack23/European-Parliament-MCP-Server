import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { z } from 'zod';
import {
  CommitteeSchema,
  MEPDetailsSchema,
  MEPSchema,
} from '../schemas/europeanParliament.js';

export const CacheMetadataSchema = z.object({
  schemaVersion: z.number().int().min(1),
  generatedAt: z.string(),
  weekKey: z.string().optional(),
  source: z.string(),
  dataset: z.enum(['meps', 'corporate-bodies', 'controlled-vocabularies']).optional(),
  scope: z.enum(['current', 'all']).optional(),
  complete: z.boolean().optional(),
  recordCount: z.number().int().min(0).optional(),
  detailCount: z.number().int().min(0).optional(),
});

export const WeeklyMEPCacheSchema = z.object({
  metadata: CacheMetadataSchema,
  meps: z.array(MEPSchema),
  mepDetails: z.record(z.string(), MEPDetailsSchema),
});

export const WeeklyCorporateBodiesCacheSchema = z.object({
  metadata: CacheMetadataSchema,
  corporateBodies: z.array(CommitteeSchema),
  corporateBodyDetails: z.record(z.string(), CommitteeSchema).optional(),
});

export const WeeklyVocabulariesCacheSchema = z.object({
  metadata: CacheMetadataSchema,
  vocabularies: z.array(z.record(z.string(), z.unknown())),
  vocabularyDetails: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
});

const CacheManifestEntrySchema = z.object({
  file: z.string(),
  generatedAt: z.string(),
  scope: z.enum(['current', 'all']),
  recordCount: z.number().int().min(0),
  detailCount: z.number().int().min(0),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u),
});

export const CacheManifestSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string(),
  source: z.string(),
  datasets: z.object({
    meps: CacheManifestEntrySchema,
    'corporate-bodies': CacheManifestEntrySchema,
    'controlled-vocabularies': CacheManifestEntrySchema,
  }),
});

export type WeeklyMEPCache = z.infer<typeof WeeklyMEPCacheSchema>;
export type WeeklyCorporateBodiesCache = z.infer<typeof WeeklyCorporateBodiesCacheSchema>;
export type WeeklyVocabulariesCache = z.infer<typeof WeeklyVocabulariesCacheSchema>;
export type CacheManifest = z.infer<typeof CacheManifestSchema>;

const validatedFileCache = new Map<string, Promise<unknown>>();

type WeeklyDataset = 'meps' | 'corporate-bodies' | 'controlled-vocabularies';

export function getCacheRoot(): string {
  const configuredRoot = process.env['EP_CACHE_DIR'] ?? process.env['EP_WEEKLY_CACHE_DIR'];
  return configuredRoot === undefined || configuredRoot.trim() === ''
    ? fileURLToPath(new URL('../../data/cache/', import.meta.url))
    : path.resolve(configuredRoot);
}

export function getWeeklyCachePath(dataset: WeeklyDataset): string {
  return path.join(getCacheRoot(), `${dataset}.json`);
}

export function getCacheManifestPath(): string {
  return path.join(getCacheRoot(), 'manifest.json');
}

function sha256(raw: Buffer): string {
  return createHash('sha256').update(raw).digest('hex');
}

export async function loadCacheManifest(): Promise<CacheManifest | null> {
  return loadAndValidateFile(getCacheManifestPath(), CacheManifestSchema);
}

async function loadAndValidateFile<T>(filePath: string, schema: z.ZodType<T>): Promise<T | null> {
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

async function loadAndValidate<T extends { metadata: { generatedAt: string } }>(
  dataset: WeeklyDataset,
  schema: z.ZodType<T>,
): Promise<T | null> {
  const filePath = getWeeklyCachePath(dataset);
  const cacheKey = `${filePath}#verified`;
  const existing = validatedFileCache.get(cacheKey);
  if (existing !== undefined) return await existing as T | null;

  const loading = (async (): Promise<T | null> => {
    try {
      const manifest = await loadCacheManifest();
      const entry = manifest?.datasets[dataset];
      if (entry?.file !== path.basename(filePath)) return null;
      const raw = await readFile(filePath);
      if (sha256(raw) !== entry.sha256) return null;
      const parsed: unknown = JSON.parse(raw.toString('utf-8'));
      const validated = schema.safeParse(parsed);
      if (!validated.success) return null;
      return validated.data.metadata.generatedAt === entry.generatedAt ? validated.data : null;
    } catch {
      return null;
    }
  })();
  validatedFileCache.set(cacheKey, loading);
  return loading;
}

export async function loadWeeklyMEPCache(): Promise<WeeklyMEPCache | null> {
  return loadAndValidate('meps', WeeklyMEPCacheSchema);
}

export async function loadWeeklyCorporateBodiesCache(): Promise<WeeklyCorporateBodiesCache | null> {
  return loadAndValidate(
    'corporate-bodies',
    WeeklyCorporateBodiesCacheSchema,
  );
}

export async function loadWeeklyVocabulariesCache(): Promise<WeeklyVocabulariesCache | null> {
  return loadAndValidate(
    'controlled-vocabularies',
    WeeklyVocabulariesCacheSchema,
  );
}
