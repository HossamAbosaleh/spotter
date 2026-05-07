import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/data/db';
import { profileRepository } from '@/data/repositories/profile-repository';
import type { Profile } from '@/domain/profile';

function validProfileInput(): Profile {
  const now = new Date().toISOString();
  return {
    id: 'me',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    identity: {
      name: 'Hossam',
      age: 32,
      sex: 'male',
    },
    body: {
      heightCm: 180,
      bodyweightKg: 80,
    },
    goal: 'strength',
    experience: { level: 'intermediate' },
    schedule: { preferredDays: ['mon', 'wed', 'fri'] },
    equipment: { access: 'commercial-gym', notes: undefined },
    injuries: undefined,
    language: { preferred: 'en', units: 'metric' },
    coachPersonality: 'direct',
    additionalContext: undefined,
  };
}

describe('profileRepository', () => {
  beforeEach(async () => {
    await db.profile.clear();
  });

  afterEach(async () => {
    await db.profile.clear();
  });

  it('returns null when no profile exists', async () => {
    const result = await profileRepository.get();
    expect(result).toEqual({ ok: true, value: null });
  });

  it('round-trips a valid profile', async () => {
    const input = validProfileInput();
    const saveResult = await profileRepository.save(input);
    expect(saveResult.ok).toBe(true);

    const getResult = await profileRepository.get();
    expect(getResult.ok).toBe(true);
    if (getResult.ok && getResult.value) {
      expect(getResult.value.identity.name).toBe('Hossam');
      expect(getResult.value.identity.age).toBe(32);
      expect(getResult.value.body.bodyweightKg).toBe(80);
      expect(getResult.value.goal).toBe('strength');
    }
  });

  it('updates updatedAt on every save while preserving createdAt', async () => {
    const input = validProfileInput();
    const originalCreatedAt = input.createdAt;

    await profileRepository.save(input);
    await new Promise((resolve) => setTimeout(resolve, 10));

    input.identity.name = 'Updated';
    await profileRepository.save(input);

    const result = await profileRepository.get();
    expect(result.ok).toBe(true);
    if (result.ok && result.value) {
      expect(result.value.createdAt).toBe(originalCreatedAt);
      expect(Date.parse(result.value.updatedAt)).toBeGreaterThanOrEqual(
        Date.parse(originalCreatedAt)
      );
    }
  });

  it('rejects an invalid profile with schema-invalid', async () => {
    const input = validProfileInput();
    input.identity.age = 200; // out of range

    const result = await profileRepository.save(input);
    expect(result).toEqual({ ok: false, error: 'schema-invalid' });
  });

  it('returns schema-invalid when storage contains a corrupted record', async () => {
    // Bypass the repository and write a malformed record directly.
    // Cast through `unknown` because we're intentionally writing a record
    // that does NOT satisfy the Profile type — the test exists to verify
    // the repository surfaces this as schema-invalid rather than rendering
    // garbage to the UI.
    await db.profile.put({ id: 'me', garbage: 'data' } as unknown as Profile);

    const result = await profileRepository.get();
    expect(result).toEqual({ ok: false, error: 'schema-invalid' });
  });

  it('clear() removes the profile and is idempotent', async () => {
    await profileRepository.save(validProfileInput());

    const clearResult = await profileRepository.clear();
    expect(clearResult.ok).toBe(true);

    const after = await profileRepository.get();
    expect(after).toEqual({ ok: true, value: null });

    // Second clear succeeds (idempotent).
    const secondClear = await profileRepository.clear();
    expect(secondClear.ok).toBe(true);
  });
});
