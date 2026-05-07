# Tasks: Profile Wizard & Local Data Foundation

**Input**: Design documents from `/specs/001-profile-wizard/`
**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/persistence.md, contracts/i18n-keys.md

**Tests**: Integration tests are part of the merge gate per `quickstart.md` §5; unit tests are co-located with the foundational layers they cover. They are not optional.

**Organization**: Tasks are grouped by user story so each story is implementable, testable, and demonstrable on its own. MVP = User Story 1.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Required for user-story phase tasks (US1 / US2 / US3 / US4)
- Setup, Foundational, and Polish tasks have no `[Story]` label

## Path Conventions

Single-project frontend SPA. All paths are repo-root relative:

- Source: `src/`
- Tests: `tests/unit/`, `tests/integration/`
- Spec artifacts: `specs/001-profile-wizard/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the P0 / P0.5 substrate is sufficient for P1; install nothing new unless a gap is found.

- [x] T001 Verify P1 runtime dependencies are present in `package.json` (`dexie@^4`, `react-hook-form@^7`, `zod@^3`, `zustand@^5`, `react-i18next@^15`, `lucide-react`, `radix-ui`, `tailwind-merge`, `class-variance-authority`) and dev deps (`fake-indexeddb@^6`, `@testing-library/react`, `@testing-library/user-event`, `vitest`, `jsdom`). If any are missing, install at the pinned major versions. Confirm `npm audit --audit-level=high` is clean.
- [x] T002 [P] Verify `tsconfig.json` path aliases resolve `@/*` → `src/*` correctly so new modules under `src/data/`, `src/domain/`, `src/stores/` import cleanly.

**Checkpoint**: Stack ready. No code changes expected unless a gap surfaces.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the data layer, primitives, stores, routing guard, first-paint RTL plumbing, and shared i18n keys that every user story depends on.

**⚠️ CRITICAL**: No user-story work begins until this phase completes.

### Result types & utilities

- [x] T003 [P] Create `src/data/result.ts` exporting `Result<T, E>` tagged-union type and `DomainError` union (`'storage-unavailable' | 'storage-quota-exceeded' | 'schema-invalid' | 'unknown'`) per `contracts/persistence.md`.
- [x] T004 [P] Create `src/utils/digits.ts` with `toCanonicalDigits(input: string): string` and `parseLocaleNumber(input: string): number | null` per research §R6. Add unit tests in `tests/unit/digits.test.ts` covering: Latin-only input, Arabic-Indic-only input, mixed input, invalid input, locale-separator stripping.

### Domain types & schemas

- [x] T005 [P] Create `src/domain/profile.ts` with `Profile` TypeScript type, `profileSchema` Zod schema (every field, every constraint per `data-model.md` §1), `defaultProfile()` factory, and `profileCompleteness(profile: Profile): { percent: number; missingOptional: Array<'equipmentNotes' | 'injuries' | 'additionalContext'> }` helper per research §R7.
- [x] T006 [P] Create forward-compatibility type stubs (type-only, no Zod schemas yet): `src/domain/library.ts`, `src/domain/working-weight.ts`, `src/domain/plan.ts`, `src/domain/session.ts`. Stubs declare exported types matching `data-model.md` §2 so future phases compose without redefinition.

### Dexie database & repositories

- [x] T007 Create `src/data/db.ts` with the `SpotterDB` Dexie class declaring v1 schema for all 11 tables (profile + 10 forward-compat) per `contracts/persistence.md`. Export the `db` singleton. Document in a top-of-file comment that `db` MUST only be imported by repositories and `persistence-availability.ts`.
- [x] T008 Create `src/data/persistence-availability.ts` with `detectPersistence(): Promise<PersistenceStatus>` per research §R5 and `contracts/persistence.md`. Categorize failures by `DOMException.name`. Depends on T007.
- [x] T009 Create `src/data/repositories/profile-repository.ts` implementing the `ProfileRepository` contract. Add unit tests in `tests/unit/profile-repository.test.ts` (round-trip via `fake-indexeddb`: get when empty → null; save → get returns same; corrupted record → schema-invalid; quota simulation → storage-quota-exceeded) and `tests/unit/profile-schema.test.ts` (Zod parses valid profile; rejects out-of-range age; rejects empty preferredDays; canonicalizes ISO dates). Depends on T005, T007.

### Zustand stores

- [x] T010 [P] Create `src/stores/profile-store.ts` exporting `useProfileStore` (Zustand) holding `{ profile: Profile | null, status: 'loading' | 'ready', setProfile, clearProfile }`. Depends on T005.
- [x] T011 [P] Create `src/stores/persistence-store.ts` exporting `usePersistenceStore` holding the `PersistenceStatus` plus a `bannerAcknowledged: boolean` flag mirrored to `localStorage['spotter.persistenceAcknowledged']`. Depends on T008.

### shadcn primitives (token-customized)

- [ ] T012 Install shadcn primitives via `npx shadcn add input label form select radio-group checkbox slider card progress sonner` into `src/components/ui/`. For each new file, replace shadcn default Tailwind classes with Spotter token classes (`bg-bg-canvas`, `bg-bg-surface`, `bg-bg-elevated`, `text-text-primary`, `text-text-muted`, `border-border`, `bg-accent-primary` for CTAs, etc.). Verify every interactive element meets `min-h-[44px]` and `min-w-[44px]` per FR-022. Leave radix-ui semantics, focus management, and ARIA wiring untouched.
- [ ] T013 [P] Create `src/components/ui/persistence-banner.tsx` — Spotter-specific banner that renders above wizard content, takes `reason: 'private-mode' | 'disabled' | 'quota-exceeded' | 'unknown'`, displays the matching i18n key from the `persistence.banner.*` namespace, and exposes an "I understand" acknowledgement button that flips `usePersistenceStore.bannerAcknowledged`. Depends on T011, T012.

### Routing guard

- [x] T014 Create `src/components/profile/profile-guard.tsx` — calls `profileRepository.get()` once on mount, sets `useProfileStore.profile` and `.status`. Renders a minimal canvas-coloured skeleton while `status === 'loading'` (no spinner, no flash). Children render after status flips to `'ready'`.
- [x] T015 Update `src/App.tsx` — wrap `<Routes>` in `<ProfileGuard>`, mount `<Toaster>` (sonner) at the root, add `<Route path="/setup">` and `<Route path="/profile">` declarations. Lazy-load Setup and Profile pages if needed for landing-page LCP budget.

### First-paint RTL detector

- [x] T016 Add inline first-paint script to `index.html`: reads `localStorage.getItem('spotter.lang')`, if value is `'ar'` sets `document.documentElement.lang = 'ar'` and `document.documentElement.dir = 'rtl'`, otherwise leaves the defaults. Compute the SHA-256 hash of the script bytes and add it to the `script-src` directive in `vercel.json`'s CSP header (per research §R4). Verify CSP still passes Vercel's header validator.

### Shared i18n keys

- [x] T017 Add wizard shell + shared error i18n keys (EN) to `src/i18n/en.json` per `contracts/i18n-keys.md` "Wizard shell" and "Errors (shared)" sections.
- [x] T018 [P] Add wizard shell + shared error i18n keys (AR) to `src/i18n/ar.json`. Native AR phrasing per voice constraints.
- [x] T019 [P] Add persistence-banner i18n keys (EN + AR) to `src/i18n/{en,ar}.json` per `contracts/i18n-keys.md` "Persistence banner".

### Design audit surface

- [ ] T020 Extend `src/pages/Design.tsx` to render every new shadcn primitive (Input, Label, Form/FormField/FormItem/FormLabel/FormControl/FormDescription/FormMessage, Select, RadioGroup, Checkbox, Slider, Card, Progress, Toast invocation, PersistenceBanner) in EN and AR. Required for the design discipline gate per the P0.5 closeout and constitution principle IV.

**Checkpoint**: Foundation complete. Data layer round-trips, primitives render in `/_design`, banner mounts in degraded mode, store wiring works. User-story phases can begin.

---

## Phase 3: User Story 1 — First-time setup that survives reload (Priority: P1) 🎯 MVP

**Goal**: A new user opens Spotter, completes the six-step wizard, finishes, and reloads. Their profile is still there.

**Independent Test**: Clean browser session → click landing CTA → fill every required field across all six steps → click Finish → hard-reload the page → app routes to the saved-profile view (not the wizard) → all entered values are visible and unchanged.

### Wizard substrate

- [ ] T021 [US1] Create `src/components/profile/use-profile-form.ts` exporting `useProfileForm()` — bootstraps `useForm<Profile>` with `zodResolver(profileSchema)`, `mode: 'onBlur'`, `defaultValues: defaultProfile()`. Reads `useProfileStore.profile` and pre-fills if present (edit mode). Depends on T005, T010.
- [ ] T022 [US1] Create `src/components/profile/wizard.tsx` — the wizard shell. Manages `activeStep` state (1–6), renders the progress indicator, the persistence-banner (only when degraded + not acknowledged), the active step component, and Back / Next / Finish navigation. Calls `form.trigger(stepFields)` on Next; `form.handleSubmit` on Finish. Depends on T021, T013, T012.

### EN i18n keys for wizard steps

- [ ] T023 [US1] Add wizard step i18n keys (EN) for steps 1–6 to `src/i18n/en.json` per `contracts/i18n-keys.md` (Identity, Body & Goal, Experience & Schedule, Equipment & Limitations, Language & Coach, Review). One commit, all six step namespaces.

### Step components

- [ ] T024 [P] [US1] Create `src/components/profile/steps/step-identity.tsx` — name (text), age (numeric, `inputMode="decimal"`, `parseLocaleNumber` on blur), sex (RadioGroup, three options). Depends on T021, T012, T004, T023.
- [ ] T025 [P] [US1] Create `src/components/profile/steps/step-body-goal.tsx` — height + bodyweight (numeric, unit label localized), goal (RadioGroup, five options with descriptions). Depends on T021, T012, T004, T023.
- [ ] T026 [P] [US1] Create `src/components/profile/steps/step-experience-schedule.tsx` — experience level (RadioGroup, three options), preferred training days (Checkbox group, seven options, ≥1 required). Depends on T021, T012, T023.
- [ ] T027 [P] [US1] Create `src/components/profile/steps/step-equipment-limitations.tsx` — equipment access (RadioGroup, four options), equipment notes (optional textarea), injuries (optional textarea). Depends on T021, T012, T023.
- [ ] T028 [P] [US1] Create `src/components/profile/steps/step-language-coach.tsx` — language (Select EN/AR), units (Select metric/imperial), coach personality (RadioGroup, three options with descriptions). Selecting a language writes through to `localStorage['spotter.lang']` and triggers `useDirection` re-evaluation. Depends on T021, T012, T023.
- [ ] T029 [P] [US1] Create `src/components/profile/steps/step-review.tsx` — read-only recap of every entered value with inline edit affordance (clicking a value jumps to that step), the optional `additionalContext` textarea, and a primary "Save my profile" CTA that triggers final form submit. Depends on T021, T012, T023.

### Pages

- [ ] T030 [US1] Create `src/pages/Setup.tsx` — mounts `<Wizard />`. If a saved profile exists in `useProfileStore`, the wizard opens in edit mode with values pre-filled. Depends on T022, T010.
- [ ] T031 [US1] Create `src/pages/Profile.tsx` — minimal post-setup view. Renders the profile fields grouped by wizard step, an "Edit profile" link to `/setup`, and a "Start fresh" link with a confirmation dialog (calls `profileRepository.clear()` + `useProfileStore.clearProfile()`). Depends on T009, T010, T012.
- [ ] T032 [US1] Upgrade `src/pages/Landing.tsx` per FR-018: one-sentence value prop, primary CTA (label switches between "Try it" and "Continue" based on `useProfileStore.profile`), GitHub link, single-line privacy affirmation. Add the new EN keys to `src/i18n/en.json` under `landing.*`. Remove obsolete `landing.phaseLabel` / `landing.nextPhase*` keys. Depends on T010, T017.

### Save wiring

- [ ] T033 [US1] In `src/components/profile/wizard.tsx`, on `form.handleSubmit` success, call `profileRepository.save(profile)`. On `Result.ok` → fire `wizard.shell.savedIndicator` toast, update `useProfileStore.setProfile`, navigate to `/profile`. On `Result.error` → branch by `DomainError` per `contracts/persistence.md` "Error mapping at the UI". Depends on T009, T010, T022.

### Integration test

- [ ] T034 [US1] Create `tests/integration/wizard-completion.test.tsx` exercising US1 acceptance scenarios 1–4: clean session → wizard renders at step 1 with empty values; fill all required fields → Finish → "Saved." toast → navigate to `/profile`; unmount/remount tree → `<ProfileGuard>` finds the profile and routes to `/profile` (not wizard); navigate to `/setup` → wizard opens with values pre-filled. Uses `fake-indexeddb` for isolation. Depends on T033, T030, T031, T032.

**Checkpoint**: User Story 1 complete. The MVP works end-to-end. Ship-quality at this point even if US2–US4 don't land.

---

## Phase 4: User Story 2 — Resume an interrupted wizard (Priority: P2)

**Goal**: A user starts the wizard, fills part of it, closes the tab, and returns later to find the wizard exactly where they left it.

**Independent Test**: Begin wizard → fill step 1 and half of step 2 → unmount component tree (simulating tab close) → repository contains a partial profile → remount → wizard resumes at step 2 with values intact. No "Resume?" modal.

### Autosave & resume

- [ ] T035 [US2] In `src/components/profile/wizard.tsx`, subscribe to `form.watch()` inside a `useEffect`, debounce 600ms, and call `profileRepository.save(profile)` on every change. Show `wizard.shell.savingIndicator` toast on save start, switch to `savedIndicator` on success. On transient failure, log + retry once silently before surfacing `wizard.errors.saveFailed.unknown`. Depends on T033.
- [ ] T036 [US2] Persist `activeStep` to `localStorage['spotter.wizardStep']` on every change. On wizard mount, restore from localStorage if a partial profile exists in the store. Clear the localStorage key on successful Finish. Depends on T022.
- [ ] T037 [US2] Add a "Start fresh" affordance to the wizard shell (visible from step 2 onward) that opens a destructive confirmation, then on confirm calls `profileRepository.clear()`, clears `localStorage['spotter.wizardStep']`, resets `useForm` defaults, and routes to step 1. Uses `wizard.shell.startFresh.{cta,confirm}` keys. Depends on T022, T009.

### Integration test

- [ ] T038 [US2] Create `tests/integration/wizard-resume.test.tsx` exercising US2 acceptance scenarios 1–3: type into steps 1 and 2 → assert repository contains partial profile within 1s of last edit; unmount → remount → wizard at step 2 with values; trigger Start fresh → confirm → wizard at step 1 with empty values + repository empty. Depends on T035, T036, T037.

**Checkpoint**: User Stories 1 + 2 work independently and together.

---

## Phase 5: User Story 3 — Bilingual EN/AR with full RTL (Priority: P2)

**Goal**: A user prefers Arabic. The wizard renders in Arabic with RTL layout, and switching language mid-wizard preserves all entered data.

**Independent Test**: Open wizard in EN → fill step 1 → toggle language to AR → all visible text becomes Arabic, layout flips to RTL, step-1 values still in their fields → continue and finish in AR → reload → app starts in AR with no LTR flash → saved profile reflects the AR preference.

### AR translations

- [ ] T039 [US3] Add wizard step i18n keys (AR) for steps 1–6 to `src/i18n/ar.json` mirroring every key added in T023. Native AR phrasing — not literal translation — per voice constraints. Modern Standard Arabic for instructions; common gym terminology where natural.
- [ ] T040 [US3] Add landing + profile + completeness i18n keys (AR) to `src/i18n/ar.json` mirroring T032's EN landing keys and T031's profile keys.

### Mid-wizard switching

- [ ] T041 [US3] In `src/components/profile/wizard.tsx`, ensure the language switch in step 5 (and any header-level toggle) does not call `form.reset()` or otherwise discard form values. Verify `useDirection` hook reapplies `dir` to `<html>` and that progress indicator + nav buttons swap order correctly under RTL (logical properties only — `ms-*`, `me-*`, `ps-*`, `pe-*`).

### Digit handling exercised in product

- [ ] T042 [US3] In numeric step components (Identity age, Body & Goal height/bodyweight), confirm Arabic-Indic input is accepted: rendering uses `inputMode="decimal"`, blur handler runs `parseLocaleNumber`, validation shows the localized error message on out-of-range. Add a focused unit test in `tests/unit/wizard-numeric-input.test.tsx` covering Arabic-Indic entry + canonicalization on submit.

### Parity test

- [ ] T043 [US3] Add `tests/unit/i18n-parity.test.ts` — recursively walks `en.json` and `ar.json` and fails if any key path exists in one file but not the other. Wires into `npm run check` so missing translations break CI.

### Integration test

- [ ] T044 [US3] Create `tests/integration/wizard-rtl-switch.test.tsx` exercising US3 acceptance scenarios 1–3: open wizard EN → fill step 1 → toggle AR → assert Arabic copy rendered, `<html dir="rtl">` set, step-1 values preserved; reload (with `localStorage['spotter.lang'] = 'ar'`) → assert no flash of LTR (initial DOM has `dir="rtl"`); enter Arabic-Indic digits in age field → assert canonical number stored. Depends on T039, T040, T041, T042.

**Checkpoint**: User Stories 1 + 2 + 3 work. The product is bilingual end-to-end.

---

## Phase 6: User Story 4 — Skip optional fields with completeness indicator (Priority: P3)

**Goal**: A user skips optional fields and finishes anyway. The post-setup view shows a polite, non-blocking completeness indicator with an invitation to fill in the rest.

**Independent Test**: Complete the wizard while skipping every optional field (`equipment.notes`, `injuries`, `additionalContext`) → wizard succeeds, profile saves → `/profile` shows a completeness indicator under 100% with a non-blocking nudge listing the missing fields → indicator does not block any other action.

### Completeness UI

- [ ] T045 [US4] Create `src/components/profile/completeness-indicator.tsx` — small Card-styled chip showing a Progress bar (rounded to nearest 5%) plus the localized invitation copy and a list of missing-field names. If percent is 100, render the `profile.completeness.complete` chip and no nudge. Reads `profileCompleteness()` from `domain/profile.ts`. Depends on T005, T012.
- [ ] T046 [US4] Add `profile.completeness.*` i18n keys (EN + AR) to `src/i18n/{en,ar}.json` per `contracts/i18n-keys.md`.
- [ ] T047 [US4] Mount `<CompletenessIndicator />` in `src/pages/Profile.tsx` above the field list. Hide entirely when percent is 100 unless the user explicitly opens a "what's missing" detail view. Depends on T045, T046, T031.

### Optional-field regression test

- [ ] T048 [US4] Add `tests/unit/wizard-optional-fields.test.tsx` — renders the wizard, fills only required fields across all steps (skipping all three optional fields), submits, asserts the save succeeds and `profileCompleteness()` returns `< 100`. Depends on T034 patterns + T045.

**Checkpoint**: All four user stories pass their independent tests.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates, audits, documentation, and removal of stale P0 artifacts before merge.

- [ ] T049 [P] Run `npm run check` (typecheck, lint, format, test) — must pass with zero warnings.
- [ ] T050 [P] Run `npm run build` — must succeed; verify wizard route is code-split if landing-page LCP regresses.
- [ ] T051 [P] Run `npx impeccable detect src/` — must report zero anti-patterns.
- [ ] T052 Run AccessLint live audit on `/`, `/_design`, `/setup` (all six wizard steps), and `/profile` in both EN and AR. Document results in `specs/001-profile-wizard/accesslint-report.md`. Fix any contrast, keyboard, or focus issues; re-audit until clean.
- [ ] T053 [P] Invoke `/impeccable critique` on `src/components/profile/` and `src/pages/{Setup,Profile,Landing}.tsx`. Address every critical and serious finding; document deferred minor findings in the PR description.
- [ ] T054 Update `CHANGELOG.md` `[Unreleased]` section with a P1 block: shipped (data layer, profile wizard, six steps, bilingual + RTL, completeness indicator, persistence banner) and any deferred items with reasoning.
- [ ] T055 Remove stale P0 placeholder copy from `src/i18n/{en,ar}.json` (`landing.phaseLabel`, `landing.nextPhase`, `landing.nextPhaseName`, `landing.runCommand`, `landing.toBegin`, `landing.introBody`) now that `Landing.tsx` is upgraded. Verify no remaining call sites via grep.
- [ ] T056 Manual acceptance walkthrough on the dev server in both EN and AR: complete US1 (finish + reload), US2 (resume after close), US3 (mid-switch), US4 (skip optionals + see indicator), and the FR-004 unavailable-storage case (test in a private/incognito window). Document evidence (screenshots or short notes) in the PR description.

---

## Dependencies

### Setup → Foundational

T001, T002 must complete before any other phase.

### Foundational → User Stories

All Foundational tasks (T003–T020) must complete before any user-story phase begins.

### Within Foundational

- T007 (db) blocks T008, T009, T011
- T005 (profile schema) blocks T009, T010, T021, T024–T029
- T012 (shadcn primitives) blocks T013, T014's children, T020, all step components
- T013 (PersistenceBanner) blocks T022 (wizard shell mounts banner)
- T015 (App.tsx routing) blocks T030, T031, T032 page mounts (they need routes to exist)
- T016 (RTL inline script) is independent and can land any time after T011 — it only matters at first paint

### User-story dependencies

- US1 → standalone MVP. No dependencies on US2–US4.
- US2 → depends on US1's wizard shell (T022) and save wiring (T033).
- US3 → depends on US1's i18n keys (T023, T032) for AR mirroring.
- US4 → depends on US1's Profile page (T031) for the completeness mount point.

US2, US3, US4 do not depend on each other and can land in any order after US1.

### Test dependencies

- T034 (US1 integration) gates US1 merge.
- T038 (US2 integration) gates US2 merge.
- T044 (US3 integration) gates US3 merge.
- T048 (US4 unit) gates US4 merge.
- All four must be green for the full P1 PR to merge.

---

## Parallel Execution Examples

### Foundational substrate

T003, T004, T005, T006, T010, T011 are all `[P]`-marked and operate on different files with no inter-dependencies (T010 / T011 depend on prior tasks but don't conflict with each other). A developer can open six branches' worth of work simultaneously, or split across a pair-programming session.

T017, T018, T019 (i18n shell + persistence keys) — three files, three parallel commits.

### US1 step components

T024, T025, T026, T027, T028, T029 are all `[P]`-marked: six independent step files. After T021 (form hook) and T023 (EN keys) land, all six step files can be implemented in parallel by separate contributors or in any order.

### Polish

T049, T050, T051, T053 run independently and in parallel. T052 (AccessLint) is sequential because it logs findings the others don't read.

---

## Implementation Strategy

### MVP path (US1 only)

T001 → T002 → all of Phase 2 Foundational (T003–T020) → US1 (T021–T034) → T049–T052 partial polish on US1 surfaces only. This produces a working profile wizard in EN that survives reload — sufficient to demonstrate the data foundation and unblock P2 phases that aren't in this branch.

### Incremental delivery

After MVP lands and is verified:

1. Add **US2** (T035–T038) — same branch, separate commit. Autosave + resume.
2. Add **US3** (T039–T044) — separate commit. AR translations + RTL switching + parity gate.
3. Add **US4** (T045–T048) — separate commit. Completeness indicator + optional-field regression test.
4. Run final **Polish** (T049–T056) on the full bundle.

Each story increment can be merged to main independently if desired (each leaves the product in a deployable, demoable state).

### Estimated breakdown

| Phase        | Tasks  | Approx. hours (P1 budget = ~10h per plan.md)                                                    |
| ------------ | ------ | ----------------------------------------------------------------------------------------------- |
| Setup        | 2      | 0.25h                                                                                           |
| Foundational | 18     | 4h                                                                                              |
| US1 (MVP)    | 14     | 3.5h                                                                                            |
| US2          | 4      | 1h                                                                                              |
| US3          | 6      | 1.5h                                                                                            |
| US4          | 4      | 0.75h                                                                                           |
| Polish       | 8      | 1h                                                                                              |
| **Total**    | **56** | **~12h** (slightly over the 10h plan estimate; acceptable per the plan.md "stretch is OK" note) |

The first three phases (Setup + Foundational + US1) deliver the MVP at ~7.75h; the remaining four phases land incrementally inside the same branch.

---

## Format Validation

All 56 tasks above conform to the required format: `- [ ] [TaskID] [P?] [Story?] Description with file path`. Every task has a checkbox, sequential ID, optional `[P]` only when parallelizable, story label only on user-story phase tasks, and a concrete file path.
