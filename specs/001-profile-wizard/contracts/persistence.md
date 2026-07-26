# Contract: Persistence

**Branch**: `001-profile-wizard`
**Date**: 2026-05-07

This contract defines the shape of the persistence layer. It is the boundary between UI (`pages/`, `components/`) and storage (`data/`). Every code path that wants to read or write user data MUST go through a repository — never call Dexie directly from a component.

---

## Database

```ts
// src/data/db.ts
import Dexie, { Table } from 'dexie';
import type { Profile } from '@/domain/profile';
// (other entity types are type-only stubs in P1)

export class SpotterDB extends Dexie {
  profile!: Table<Profile, 'me'>;
  // forward-compat tables declared in v1; not exercised in P1
  libraryExercises!: Table<unknown, string>;
  userExercisePreferences!: Table<unknown, string>;
  workingWeights!: Table<unknown, string>;
  plans!: Table<unknown, string>;
  blocks!: Table<unknown, string>;
  trainingDays!: Table<unknown, string>;
  plannedExercises!: Table<unknown, string>;
  sessions!: Table<unknown, string>;
  setLogs!: Table<unknown, string>;
  exportPayloads!: Table<unknown, string>;

  constructor() {
    super('spotter');
    this.version(1).stores({
      profile: 'id',
      libraryExercises: 'id, nameEn, nameAr, category, isCustom',
      userExercisePreferences: 'exerciseId, mark',
      workingWeights: 'exerciseId, lastUpdatedAt',
      plans: 'id, name, createdAt, isActive',
      blocks: 'id, planId, blockIndex, type',
      trainingDays: 'id, blockId, dayIndex',
      plannedExercises: 'id, dayId, exerciseId, orderIndex',
      sessions: 'id, planId, trainingDayId, startedAt',
      setLogs: 'id, sessionId, exerciseId, loggedAt',
      exportPayloads: 'id, createdAt',
    });
  }
}

export const db = new SpotterDB();
```

The exported `db` singleton is **only** imported by `src/data/repositories/*` and `src/data/persistence-availability.ts`. Anywhere else, importing `db` is a violation that lint should eventually catch.

---

## Result type

All repository functions return a tagged Result. They MUST NOT throw across the boundary.

```ts
// src/data/result.ts
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type DomainError =
  | 'storage-unavailable'
  | 'storage-quota-exceeded'
  | 'schema-invalid'
  | 'unknown';
```

---

## ProfileRepository

```ts
// src/data/repositories/profile-repository.ts
import type { Profile } from '@/domain/profile';
import type { Result, DomainError } from '@/data/result';

export type ProfileRepository = {
  /** Returns the saved profile, or null if none exists. */
  get(): Promise<Result<Profile | null, DomainError>>;

  /** Persists the profile. Validates with Zod first; refuses to save invalid data. */
  save(profile: Profile): Promise<Result<void, DomainError>>;

  /** Removes the saved profile entirely. Used by "Start fresh." */
  clear(): Promise<Result<void, DomainError>>;
};

export const profileRepository: ProfileRepository = {
  /* implementation */
};
```

### Behavior contracts

- **`get()`**:
  - Reads the single row keyed by `'me'`.
  - If the row is missing → `{ ok: true, value: null }`.
  - If the row exists but fails `profileSchema.safeParse` → `{ ok: false, error: 'schema-invalid' }`. The repository does NOT auto-recover; the UI surfaces the corruption and offers a "Start fresh" path.
  - If the database is unreachable (private mode probe failed earlier) → `{ ok: false, error: 'storage-unavailable' }`.
  - Otherwise → `{ ok: true, value: <profile> }`.

- **`save(profile)`**:
  - Validates with `profileSchema.parse`. If validation fails → `{ ok: false, error: 'schema-invalid' }`. (This is a developer error — the wizard should never submit an invalid profile.)
  - Sets `updatedAt = new Date().toISOString()`. Sets `createdAt` only if the previous record had no `createdAt` (treats this as creation).
  - Single Dexie `put()` to the `profile` table.
  - On `QuotaExceededError` → `{ ok: false, error: 'storage-quota-exceeded' }`.
  - On other Dexie errors → `{ ok: false, error: 'unknown' }`.
  - On success → `{ ok: true, value: undefined }`.

- **`clear()`**:
  - Single Dexie `delete('me')` against the profile table.
  - Idempotent: clearing when no profile exists succeeds.
  - On error → `{ ok: false, error: 'unknown' }`.
  - On success → `{ ok: true, value: undefined }`.

### Error mapping at the UI

| Repository error           | UI response                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `storage-unavailable`      | `PersistenceBanner` is already mounted (detected at app start); the wizard never even reaches a save call in this mode.         |
| `storage-quota-exceeded`   | Toast: "We couldn't save right now — your device is out of space. Free up space and try again." Retains in-memory wizard state. |
| `schema-invalid` on `get`  | Full-screen recovery view: "Your profile data couldn't be read. You can start fresh, which will overwrite the existing record." |
| `schema-invalid` on `save` | Treated as a bug. Toast plus a console error. Should never happen in production.                                                |
| `unknown`                  | Toast: "Something went wrong. Try again, or reload the page."                                                                   |

---

## persistence-availability

```ts
// src/data/persistence-availability.ts
export type PersistenceStatus =
  | { status: 'available' }
  | {
      status: 'degraded';
      reason: 'private-mode' | 'quota-exceeded' | 'disabled' | 'unknown';
    };

export async function detectPersistence(): Promise<PersistenceStatus>;
```

### Behavior contract

- Opens the Dexie database. If `Dexie.open()` rejects, categorize via `DOMException.name`:
  - `SecurityError` → `disabled`
  - `QuotaExceededError` → `quota-exceeded`
  - `InvalidStateError` → `private-mode` (Firefox private mode signature)
  - Otherwise → `unknown`
- If the open succeeds, write a probe record to a transient `_probe` table (declared in v1 alongside the others, never used otherwise), read it back, then delete it. Same exception categorization on failure.
- Returns `{ status: 'available' }` only if all three of open, write, read, delete succeed.
- Called once on app mount; the result is held in a Zustand `usePersistenceStore` and read by the wizard shell to decide whether to render the persistence banner.

---

## Test contract

The integration tests in `tests/integration/` MUST exercise this contract:

1. **`wizard-completion.test.tsx`** — repository round-trip: save profile → reload (simulate by clearing React state, NOT IndexedDB) → repository returns the saved profile → wizard does not show.
2. **`wizard-resume.test.tsx`** — autosave: type into step 2 → close component tree → repository contains the partial profile → re-mount → wizard opens at step 2 with values.
3. **`wizard-no-storage.test.tsx`** — mock `detectPersistence` to return `{ status: 'degraded', reason: 'private-mode' }` → wizard renders the banner → save call is never made → no false "Saved." toast.
4. **`profile-repository.test.ts`** — direct repository tests against fake-indexeddb: invalid profile (missing field) → returns `schema-invalid`; corrupted record in storage → `get()` returns `schema-invalid`; quota simulation → returns `storage-quota-exceeded`.
