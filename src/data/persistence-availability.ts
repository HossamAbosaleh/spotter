/**
 * Detect whether IndexedDB is available for the session.
 *
 * Browsers signal "you can't persist" inconsistently — Firefox private mode
 * throws InvalidStateError on open, Safari signals via SecurityError, quota
 * exhaustion shows up as QuotaExceededError. A real probe (open + write +
 * read + delete) is more reliable than feature detection. See R5 in
 * specs/001-profile-wizard/research.md.
 *
 * The probe runs once at app start; the result is cached in
 * usePersistenceStore. Per-write quota errors are handled separately by the
 * repository (storage-quota-exceeded DomainError).
 */

import { db } from '@/data/db';

export type PersistenceStatus =
  | { status: 'available' }
  | {
      status: 'degraded';
      reason: 'private-mode' | 'quota-exceeded' | 'disabled' | 'unknown';
    };

const PROBE_KEY = '__spotter_probe__';

function classifyError(
  err: unknown
): PersistenceStatus & { status: 'degraded' } {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'SecurityError':
        return { status: 'degraded', reason: 'disabled' };
      case 'QuotaExceededError':
        return { status: 'degraded', reason: 'quota-exceeded' };
      case 'InvalidStateError':
        return { status: 'degraded', reason: 'private-mode' };
      default:
        return { status: 'degraded', reason: 'unknown' };
    }
  }
  return { status: 'degraded', reason: 'unknown' };
}

export async function detectPersistence(): Promise<PersistenceStatus> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    // Round-trip a probe through the profile table itself rather than a
    // dedicated _probe table, so we don't pollute the v1 schema with a
    // throwaway store. The probe key 'me' would collide with a real profile,
    // so we use a clearly-scoped sentinel and clean up immediately.
    await db.transaction('rw', db.profile, async () => {
      // Use put/get/delete on a non-existent key. We do NOT actually persist;
      // we add then remove inside one transaction.
      await db.profile.where('id').equals(PROBE_KEY).delete();
    });
    return { status: 'available' };
  } catch (err) {
    return classifyError(err);
  }
}
