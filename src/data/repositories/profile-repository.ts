/**
 * Profile repository — the only entry point for reading or writing the
 * Profile entity. Validates with Zod on every boundary; never throws.
 *
 * See contracts/persistence.md for the full contract and error mapping.
 */

import { type Profile, profileSchema } from '@/domain/profile';
import { db } from '@/data/db';
import { type DomainError, type Result, err, ok } from '@/data/result';

export type ProfileRepository = {
  get(): Promise<Result<Profile | null, DomainError>>;
  save(profile: Profile): Promise<Result<void, DomainError>>;
  clear(): Promise<Result<void, DomainError>>;
};

function classifyDexieError(error: unknown): DomainError {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') return 'storage-quota-exceeded';
    if (
      error.name === 'SecurityError' ||
      error.name === 'InvalidStateError' ||
      error.name === 'NotFoundError'
    ) {
      return 'storage-unavailable';
    }
  }
  if (error && typeof error === 'object' && 'name' in error) {
    const name = (error as { name?: unknown }).name;
    if (name === 'QuotaExceededError') return 'storage-quota-exceeded';
    if (name === 'OpenFailedError' || name === 'NoSuchDatabaseError') {
      return 'storage-unavailable';
    }
  }
  return 'unknown';
}

async function readProfile(): Promise<Result<Profile | null, DomainError>> {
  try {
    const raw = await db.profile.get('me');
    if (raw === undefined) {
      return ok(null);
    }
    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success) {
      return err('schema-invalid');
    }
    return ok(parsed.data);
  } catch (error) {
    return err(classifyDexieError(error));
  }
}

async function writeProfile(
  profile: Profile
): Promise<Result<void, DomainError>> {
  const now = new Date().toISOString();
  const next: Profile = {
    ...profile,
    id: 'me',
    schemaVersion: 1,
    createdAt: profile.createdAt ?? now,
    updatedAt: now,
  };

  const validated = profileSchema.safeParse(next);
  if (!validated.success) {
    return err('schema-invalid');
  }

  try {
    await db.profile.put(validated.data);
    return ok(undefined);
  } catch (error) {
    return err(classifyDexieError(error));
  }
}

async function clearProfile(): Promise<Result<void, DomainError>> {
  try {
    await db.profile.delete('me');
    return ok(undefined);
  } catch (error) {
    return err(classifyDexieError(error));
  }
}

export const profileRepository: ProfileRepository = {
  get: readProfile,
  save: writeProfile,
  clear: clearProfile,
};
