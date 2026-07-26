# Phase 1: Data Model — Profile Wizard & Local Data Foundation

**Branch**: `001-profile-wizard`
**Date**: 2026-05-07

This document defines:

1. The **Profile** entity exercised by the P1 wizard (the only entity with UI in P1).
2. The wider **forward-compatibility schema** declared in Dexie v1 so later phases compose without v2 migrations.

All field types are TypeScript-flavoured; the canonical source will be Zod schemas in `src/domain/`. The repository in P1 enforces the Profile schema on every read and write.

---

## 1. Profile (P1 — exercised by wizard)

A single record per device. Stored in IndexedDB table `profile` with primary key `id` fixed to `'me'` (single-row pattern).

### Fields

| Field                    | Type                                                                                | Required      | Validation                                                  | Source                             |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------- | ---------------------------------- |
| `id`                     | `'me'` (literal)                                                                    | yes           | exactly the string `"me"`                                   | system-set                         |
| `schemaVersion`          | `number`                                                                            | yes           | exactly `1` for P1                                          | system-set                         |
| `createdAt`              | `string` (ISO 8601)                                                                 | yes           | parseable as a date, not in the future                      | system-set on first save           |
| `updatedAt`              | `string` (ISO 8601)                                                                 | yes           | parseable as a date, not earlier than `createdAt`           | system-set on every save           |
| `identity.name`          | `string`                                                                            | yes           | trimmed length 1–60                                         | wizard step 1                      |
| `identity.age`           | `number` (integer)                                                                  | yes           | 13 ≤ age ≤ 100                                              | wizard step 1                      |
| `identity.sex`           | `'male' \| 'female' \| 'prefer-not-to-say'`                                         | yes           | enum membership                                             | wizard step 1                      |
| `body.heightCm`          | `number`                                                                            | yes           | 120 ≤ heightCm ≤ 230, two decimal places max                | wizard step 2                      |
| `body.bodyweightKg`      | `number`                                                                            | yes           | 30 ≤ bodyweightKg ≤ 250, one decimal place max              | wizard step 2                      |
| `goal`                   | `'strength' \| 'hypertrophy' \| 'fat-loss' \| 'recomposition' \| 'general-fitness'` | yes           | enum membership                                             | wizard step 2                      |
| `experience.level`       | `'novice' \| 'intermediate' \| 'advanced'`                                          | yes           | enum membership                                             | wizard step 3                      |
| `schedule.preferredDays` | `Array<'mon' \| 'tue' \| 'wed' \| 'thu' \| 'fri' \| 'sat' \| 'sun'>`                | yes           | 1–7 unique values                                           | wizard step 3                      |
| `equipment.access`       | `'commercial-gym' \| 'home-full' \| 'home-minimal' \| 'bodyweight-only'`            | yes           | enum membership                                             | wizard step 4                      |
| `equipment.notes`        | `string`                                                                            | no (optional) | trimmed, length 0–500                                       | wizard step 4                      |
| `injuries`               | `string`                                                                            | no (optional) | trimmed, length 0–500                                       | wizard step 4                      |
| `language.preferred`     | `'en' \| 'ar'`                                                                      | yes           | enum membership; mirrored to `localStorage['spotter.lang']` | wizard step 5                      |
| `language.units`         | `'metric' \| 'imperial'`                                                            | yes           | enum membership; default `'metric'`                         | wizard step 5                      |
| `coachPersonality`       | `'encouraging' \| 'direct' \| 'technical'`                                          | yes           | enum membership                                             | wizard step 5                      |
| `additionalContext`      | `string`                                                                            | no (optional) | trimmed, length 0–1000                                      | derived from review step free-text |

### Invariants

- `updatedAt >= createdAt` always.
- `schemaVersion === 1` for any record persisted by P1 code.
- `identity.age` is an integer; floats are rejected with a specific bilingual error.
- `body.heightCm` and `body.bodyweightKg` are stored in metric SI units regardless of `language.units`. The unit toggle controls _input_ rendering, not storage.
- `schedule.preferredDays` has no duplicates and no fewer than one entry. Empty arrays fail validation with a "pick at least one day" message.

### Optional vs required for the completeness indicator

Per R7, the completeness percentage is computed from optional fields only. The optional set is exactly: `equipment.notes`, `injuries`, `additionalContext`. Total optional fields: **3**. Completeness rounds to nearest 5%.

### Lifecycle

1. **Create** — first successful wizard finish. `createdAt = updatedAt = now`. Repository write goes through Zod parsing first.
2. **Update** — wizard edit mode or autosave. `updatedAt = now`; `createdAt` preserved.
3. **Clear** — explicit user action ("Start fresh"). Confirmation dialog. Removes the row entirely; subsequent `get()` returns `null`.

---

## 2. Forward-compatibility schema (declared in Dexie v1, not exercised in P1)

These tables are created in v1 so later phases don't need a schema bump for additive work. P1 code _does not write to them_; the Profile is the only entity touched by P1 UI. Field shapes below are derived from the data-model section of `spec-kit-input/plan.md` and locked to satisfy the P1 spec assumption that "later phases compose against this without schema rework."

> Tables are listed with Dexie index strings; full Zod schemas land in their respective phases.

### `libraryExercises`

Default exercises plus user-created customs. Loaded from `/public/library-defaults.json` in P2.

| Field                         | Notes                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `id` (primary, string)        | Stable across versions; default exercises use `lib_*` prefix, customs use `cus_*`. |
| `nameEn` (string, indexed)    | English name.                                                                      |
| `nameAr` (string, indexed)    | Arabic name.                                                                       |
| `category` (string, indexed)  | Movement category (push/pull/legs/core/etc.).                                      |
| `imageUrl` (string, optional) | https-only or sanitized data URI.                                                  |
| `isCustom` (boolean)          | `true` for user-created entries.                                                   |

Dexie index string: `id, nameEn, nameAr, category, isCustom`

### `userExercisePreferences`

Per-exercise YES/SUB/NO marking and notes. P3.

| Field                     | Notes                                 |
| ------------------------- | ------------------------------------- |
| `exerciseId` (primary)    | Foreign key to `libraryExercises.id`. |
| `mark`                    | `'yes' \| 'sub' \| 'no'`.             |
| `note` (string, optional) | Free-text.                            |

Dexie index string: `exerciseId, mark`

### `workingWeights`

Current working weight per exercise. Decoupled from any plan so it persists across plans. P4.

| Field                            | Notes                                                                  |
| -------------------------------- | ---------------------------------------------------------------------- |
| `exerciseId` (primary)           | Foreign key to `libraryExercises.id`.                                  |
| `weightKg` (number)              | Canonical kilograms.                                                   |
| `confidenceCalibrated` (boolean) | Whether the AI bridge has calibrated this weight from session history. |
| `lastUpdatedAt` (string)         | ISO 8601.                                                              |

Dexie index string: `exerciseId, lastUpdatedAt`

### `plans`, `blocks`, `trainingDays`, `plannedExercises`

The plan hierarchy. P3 / P4.

- `plans`: `id, name, createdAt, isActive` — only one `isActive=true` at a time.
- `blocks`: `id, planId, blockIndex, type` — `type ∈ {volume, intensity, peaking, deload, general}`.
- `trainingDays`: `id, blockId, dayIndex, name`.
- `plannedExercises`: `id, dayId, exerciseId, sets, targetReps, targetWeightKg, restSeconds, rpeTarget, orderIndex`.

### `sessions`

A logged workout. P5.

Dexie index string: `id, planId, trainingDayId, startedAt, finishedAt`

### `setLogs`

Individual set entries. Indexable for time-series queries. P5.

Dexie index string: `id, sessionId, exerciseId, loggedAt`

### `exportPayloads`

Export snapshots. P9.

Dexie index string: `id, createdAt`

---

## 3. Dexie schema declaration (canonical for P1)

The literal Dexie schema declared in `src/data/db.ts` for v1:

```ts
db.version(1).stores({
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
```

No `upgrade()` callback is needed for v1 (initial schema). Later phases that change an existing index call `version(N).stores({...}).upgrade(...)`.

---

## 4. Validation strategy

Every persistence boundary parses through Zod. P1 ships:

- `profileSchema` in `src/domain/profile.ts` — the full Zod schema corresponding to the field table above.
- `profileRepository.save(profile)` calls `profileSchema.parse(profile)` first. A failure throws inside the repository, which catches and returns `Result<void, 'schema-invalid'>` per R8.
- `profileRepository.get()` calls `profileSchema.safeParse(rawRecord)`. A failure returns `Result<null, 'schema-invalid'>` and the UI shows a recovery path ("Your profile data looks corrupted. Start fresh, or contact support if this is unexpected.") rather than rendering whatever raw object was in storage.

Downstream entity schemas (LibraryExercise, etc.) ship _empty stubs_ in P1 — type-only, no validation logic until their real consumers arrive. The stubs preserve type-checking discipline without committing to validation rules that may evolve.

---

## 5. Re-evaluation against Constitution

Re-running the gates from `plan.md` after data-model design:

- **I. No Server, No Backend Database** — All data lives in IndexedDB. Schema declares 11 tables, all client-side. ✓
- **II. Free Forever** — No telemetry on data shape, no analytics. ✓
- **III. Open Source** — Schema documented in this repo. ✓
- **IV. Professional Quality** — Strict types, Zod validation on every boundary, single-row pattern for Profile keeps the repository clean. ✓
- **V. Real Security** — Validation on read defends against corruption; no `dangerouslySetInnerHTML` introduced. ✓

Gate result post-design: **PASS**. No new violations.
