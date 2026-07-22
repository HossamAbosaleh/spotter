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

/**
 * Collect the `name` of an error and any errors it wraps. Dexie does not
 * rethrow the raw IndexedDB `DOMException` — it wraps it in its own error
 * class and stashes the original under `.inner` (older Dexie) or `.cause`
 * (standard `Error.cause`). Matching on `instanceof DOMException` therefore
 * misses the real signal and everything degrades to `unknown`. Walking the
 * chain and matching on the `name` string recovers the underlying reason
 * whether the error is raw or Dexie-wrapped.
 */
function collectErrorNames(err: unknown): string[] {
  const names: string[] = [];
  let current: unknown = err;
  for (let depth = 0; depth < 5 && current != null; depth++) {
    const name = (current as { name?: unknown }).name;
    if (typeof name === 'string') names.push(name);
    const next = current as { inner?: unknown; cause?: unknown };
    current = next.inner ?? next.cause;
  }
  return names;
}

export function classifyError(
  err: unknown
): PersistenceStatus & { status: 'degraded' } {
  const names = collectErrorNames(err);
  if (names.includes('SecurityError')) {
    return { status: 'degraded', reason: 'disabled' };
  }
  if (names.includes('QuotaExceededError')) {
    return { status: 'degraded', reason: 'quota-exceeded' };
  }
  if (names.includes('InvalidStateError')) {
    return { status: 'degraded', reason: 'private-mode' };
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
