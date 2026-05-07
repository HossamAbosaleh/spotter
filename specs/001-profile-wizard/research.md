# Phase 0: Research — Profile Wizard & Local Data Foundation

**Branch**: `001-profile-wizard`
**Date**: 2026-05-07

This document resolves all open technical questions before Phase 1 design. Each entry follows the structure: **Decision** → **Rationale** → **Alternatives considered**.

---

## R1. Dexie schema versioning for forward-additive migrations

**Decision**: Define `SpotterDB` as a single `Dexie` subclass with one `version(1).stores(...)` block that declares the **complete v1 schema** (all eleven entities), even though only `profile` is exercised by P1 UI. Future phases add tables via `version(N).stores({...})` with `version(N).upgrade(...)` only when an _existing_ table changes. New tables in later versions never require an upgrade callback.

**Rationale**:

- Dexie's versioning model is purely additive when only adding new stores: declaring `version(2).stores({newTable: '++id'})` does not require an `upgrade()` and does not touch existing data.
- Declaring the wider schema in v1 (Plan, Block, TrainingDay, PlannedExercise, Session, SetLog, etc.) means the structure ships in the very first IndexedDB write and avoids a v2 schema bump just to add empty placeholder tables. P2–P9 only bump version when they change existing index shapes.
- Spec assumption: the wider data model is shaped in P1's foundation work so later phases compose against it without schema rework.

**Alternatives considered**:

- **A. Declare only `profile` in v1, add tables in later versions.** Cleaner per-phase narrative but forces a version bump in every later phase, including for trivial additions. Each bump is a Dexie reload event for users with installed PWAs. Rejected.
- **B. Lazy-initialize tables on first use (no Dexie schema declarations).** Not how Dexie works — schema is declared at open time, not at write time. Non-starter.
- **C. Use raw IndexedDB without Dexie.** More control, much more code, no migration helpers. The whole point of choosing Dexie at P0 was to avoid this. Rejected.

---

## R2. Multi-step form architecture: react-hook-form + Zod resolver

**Decision**: A **single root `useForm`** instance in the wizard shell, with each step rendering subset fields using `<FormField>` from the shadcn Form primitive (which is `react-hook-form` + `radix-ui` `<Slot>` underneath). Validation runs per-step using `form.trigger(['step-fields'])` on "Next" and on the final submit. Autosave subscribes to `form.watch()` and persists on a 600ms debounce to the `profile` store via `profileRepository.save()`.

**Rationale**:

- One `useForm` keeps cross-step validation trivial (e.g., "Review" step shows everything; the same source of truth drives all six screens).
- `form.trigger(['fieldA', 'fieldB'])` is the documented react-hook-form API for step-scoped validation; `mode: 'onBlur'` covers the "validate touched fields on blur" requirement (FR-009).
- `form.watch()` returns a subscription, not a re-render trigger when used in a `useEffect` — keeps autosave off the render path.
- 600ms debounce balances "Saved within 1s of typing" (US2.2) against IndexedDB write thrash on every keystroke.

**Alternatives considered**:

- **A. One `useForm` per step, merge state in a Zustand store.** Adds a second source of truth (form state vs Zustand state) and creates a sync bug surface every time fields cross steps (e.g., Review step). Rejected.
- **B. URL-driven steps with state in the URL hash.** Shareable wizard state is not a use case here (single-device, single-user), and exposing in-progress profile data in the URL is a leak risk if the user copy-pastes. Rejected.
- **C. Tanstack Form / Formik / native form state.** react-hook-form is already an established project dependency from the constitution and P0.5; introducing a second form library violates "extend, don't fork." Rejected.

---

## R3. shadcn form-primitive customization scope

**Decision**: Install the shadcn primitives needed by P1 (`Form`, `Input`, `Label`, `Select`, `RadioGroup`, `Checkbox`, `Slider`, `Card`, `Progress`, `Toast`) by copying them into `src/components/ui/`, then override two things only: (1) replace shadcn default Tailwind classes with Spotter token classes (`bg-bg-canvas`, `text-text-primary`, `text-accent-primary`, etc.); (2) ensure every interactive element meets the ≥ 44 × 44 touch target. Leave radix-ui semantics, focus management, and ARIA wiring untouched.

**Rationale**:

- shadcn primitives ship as source code in our repo (we own them per constitution III). Customization is a fork-once activity, not an ongoing dependency tax.
- Token-only overrides keep the design system as the source of truth for color/typography/spacing. Anyone reading `src/components/ui/input.tsx` sees Spotter's tokens, not Tailwind defaults.
- radix-ui already ships best-in-class keyboard nav and ARIA. Re-inventing this is a regression risk.

**Alternatives considered**:

- **A. Install all 19 shadcn primitives listed in `plan.md` step 3.** Most aren't needed in P1 (Dialog, Drawer, Sheet, Tabs, Accordion, Tooltip, Popover, Textarea). Defer to phases that actually consume them. Rejected per "build with first real consumer" guidance from the P0.5 closeout.
- **B. Build form primitives from scratch on radix-ui directly.** Skips a layer that already exists, costs time, drifts from the documented project foundation. Rejected.

---

## R4. First-paint RTL with persisted language preference

**Decision**: Persist the user's language preference in `localStorage` under key `spotter.lang` (single-value, non-PII string `"en"` | `"ar"`). The `index.html` shell includes a tiny inline script (allowed by the existing CSP because it carries the SHA-256 hash of its bytes) that reads `localStorage.getItem('spotter.lang')` and sets `<html lang="..." dir="...">` before React mounts. The `useDirection()` hook in `src/i18n/` reconciles on hydrate.

**Rationale**:

- IndexedDB is asynchronous and unavailable until after first paint — using it for direction detection guarantees a flash-of-LTR every cold load.
- localStorage is synchronous, available in the inline script, and contains only a non-PII three-character string. The constitution permits localStorage for "tiny preferences (active day, week index)" — language preference is the same class.
- A hashed inline script remains within the existing strict CSP; no relaxation needed. The hash is computed at build time by Vite and inserted into the CSP header via `vercel.json`.

**Alternatives considered**:

- **A. Server-side direction detection via `Accept-Language`.** Would require a server. Forbidden by constitution. Rejected.
- **B. Default to one direction, flip on hydrate.** Causes a layout flash that would re-trigger every reload. Fails FR-015 ("apply it from first paint, no flash of opposite direction"). Rejected.
- **C. Cookie-based detection at edge.** No backend means no edge logic. Rejected.

---

## R5. Storage availability detection

**Decision**: A `detectPersistence()` helper runs at app start and returns one of `{ status: 'available' } | { status: 'degraded'; reason: 'private-mode' | 'quota-exceeded' | 'disabled' | 'unknown' }`. Implementation: try opening the Dexie database, perform a no-op write/read of a probe key under a dedicated `_probe` table, then delete the probe. Failures are categorized by the `name` field of the thrown `DOMException` (`SecurityError` → disabled; `QuotaExceededError` → quota-exceeded; `InvalidStateError` in Firefox private mode → private-mode; otherwise `unknown`). The result is held in a Zustand store; the wizard reads it once on mount.

**Rationale**:

- Browsers are inconsistent in how they signal "you can't persist." A real probe is more reliable than feature detection.
- Probing once at startup avoids a perf hit per write.
- Categorizing the reason lets the persistence-banner copy be specific ("This is a private window — your data won't save here") rather than generic.

**Alternatives considered**:

- **A. Trust `navigator.storage.estimate()`.** Not supported in Safari < 15.2 and doesn't surface "private mode" cleanly. Rejected.
- **B. Skip detection, let writes fail silently.** Violates FR-004 and SC-007 (no false claim of persistence). Rejected.
- **C. Detect at every write.** Wasteful and mid-wizard "you ran out of quota" handling is already covered by per-write error handling in the repository. Startup detection is for the initial banner; per-write handling catches mid-session quota exhaustion. Rejected as duplicate.

---

## R6. Numeric input with Arabic-Indic and Latin digit support

**Decision**: A small `digits.ts` utility exposes `toCanonicalDigits(input: string): string` (replaces Arabic-Indic `٠-٩` with Latin `0-9`) and `parseLocaleNumber(input: string): number | null` (canonicalizes, strips locale separators, returns `null` for invalid). Number inputs in the wizard render as `<input type="text" inputMode="decimal">` (not `type="number"`, which on mobile shows the wrong keypad in Arabic locales) and pass through `parseLocaleNumber` on blur and on autosave. Storage is always a single canonical `number` (Latin, dot decimal separator, SI units).

**Rationale**:

- `<input type="number">` strips characters that `inputMode="decimal"` allows on iOS/Android Arabic keyboards. Using `inputMode="decimal"` keeps the right keypad while letting the validator do the work.
- Storing a canonical number avoids "78.5" vs "٧٨٫٥" comparison bugs forever.
- A pure-function utility is trivial to unit-test.

**Alternatives considered**:

- **A. `Intl.NumberFormat` parser.** No standard parse counterpart in the spec. Polyfilling is heavy. Rejected.
- **B. Force users to enter Latin digits only.** Hostile to AR users, fails FR-017. Rejected.
- **C. Store the user's literal input.** Silent comparison bugs in every later phase. Rejected.

---

## R7. Profile completeness algorithm

**Decision**: Completeness is computed as `filled_optional_count / total_optional_count` where "optional" is a hardcoded list maintained in `domain/profile.ts` (initially: `injuries`, `weeklyDays.notes`, `equipment.notes`). Returns a percentage rounded to the nearest 5 to avoid jitter ("78%" → "75%"). The completeness state is _derived on read_, never persisted. If all optional fields are filled, the indicator displays a small "All set." chip and does not nag.

**Rationale**:

- Required fields are not part of the calculation — by definition they're filled (the wizard wouldn't have completed otherwise). Including them would always read 100% on the required portion and dilute the signal.
- A round-to-five reduces visual jitter when one optional field is added — moves the bar in clean steps.
- Hardcoding "which fields are optional" in the domain layer keeps the calculator beside the schema and makes review trivial.

**Alternatives considered**:

- **A. Weight optional fields by training-relevance.** "Equipment" matters more than "notes." But this is a UX-writing decision masquerading as math; the nudge copy can do the prioritization without complicating the bar. Rejected.
- **B. Persist completeness state.** Cheap to recompute, expensive to keep in sync. Rejected.

---

## R8. Repository contract shape

**Decision**: Repositories expose narrow async functions that always return `Result<T, DomainError>` (a tagged union), never throw. The `profileRepository` for P1 is:

```ts
type ProfileRepository = {
  get(): Promise<Result<Profile | null, DomainError>>;
  save(profile: Profile): Promise<Result<void, DomainError>>;
  clear(): Promise<Result<void, DomainError>>;
};
```

`DomainError` is a small union: `'storage-unavailable' | 'storage-quota-exceeded' | 'schema-invalid' | 'unknown'`. The repository validates with the Zod schema before write and after read; a corrupted record produces `schema-invalid` and is _not_ treated as authoritative — the UI surfaces a recovery path.

**Rationale**:

- React Hook Form callbacks are async; throwing exceptions across that boundary is unergonomic. A tagged Result lets the wizard branch cleanly on error type.
- Validation on read protects against corruption from a previous schema version that was hand-edited or interrupted mid-write.
- "Never throw" makes error handling visible at the call site, not implicit.

**Alternatives considered**:

- **A. Throw, catch in the wizard.** More familiar to React devs, but try/catch in async UI is where bugs live. Rejected.
- **B. Return raw `Profile | null`, no error info.** Loses the storage-unavailable distinction. Fails FR-004. Rejected.
- **C. neverthrow library.** A whole library for a 12-line type. Rejected.

---

## R9. Routing for first-visit vs returning user

**Decision**: `App.tsx` wraps the routes in a `<ProfileGuard>` component that calls `profileRepository.get()` once on mount. While loading: render a minimal skeleton on the canvas surface (no flash). Once resolved:

- `null` profile + path `/` → render Landing.
- `null` profile + path `/setup` → render Setup (wizard).
- existing profile + path `/` → render Landing (with "Continue" CTA pointing to `/profile`).
- existing profile + path `/setup` → render Setup with values pre-filled (edit mode).
- existing profile + path `/profile` → render Profile.

**Rationale**:

- The guard is the single place that touches `profileRepository.get()`, then publishes to a Zustand `profileStore`. Every component reads from the store, never directly from the repository.
- This avoids a "show wizard, then redirect" flash that happens if the routing decision is made inside individual route components.
- FR-019 ("landing routes to wizard if no profile, to profile if one exists") is satisfied by the Landing page reading the same store and rendering different CTAs.

**Alternatives considered**:

- **A. Each route fetches independently.** Causes N requests on first paint and the flash described above. Rejected.
- **B. Check via a server-side decision.** No server. Rejected.

---

## R10. Toast vs banner vs inline messaging

**Decision**: Three distinct surfaces, used for distinct purposes:

- **`Toast` (shadcn) — auto-dismissing, ~2s**: "Saved." on autosave success; "Couldn't save right now — retrying." on transient failure.
- **`PersistenceBanner` (Spotter-specific) — persistent, requires acknowledgement**: in-memory-mode warning when storage is unavailable. Sits above the wizard content, not above the navigation. Per-spec, must be explicitly acknowledged before continuing past the first step.
- **Inline `FormMessage` (shadcn) — bound to a field**: validation messages on individual inputs.

**Rationale**:

- Mixing these creates noise. The Toast is for ambient confirmation; the banner is for state the user must know about; the inline message is for the field-specific blocker.
- "Saved." appearing as a banner would pull attention disproportionate to its meaning. A 2s toast is right-sized.

**Alternatives considered**:

- **A. Single notification surface.** Becomes a god-component with mode props. Rejected per composition-patterns.
- **B. Toast for everything including the persistence banner.** Banner needs to remain visible until acknowledged; toasts are auto-dismissing. Wrong tool. Rejected.

---

## Resolved unknowns

All `NEEDS CLARIFICATION` markers from the Technical Context resolve to the decisions above:

- Dexie schema strategy → R1
- Multi-step form architecture → R2
- shadcn customization scope → R3
- First-paint RTL → R4
- Storage detection → R5
- Numeric digit support → R6
- Completeness algorithm → R7
- Repository error contract → R8
- Routing strategy → R9
- Notification surface taxonomy → R10

Phase 0 complete. Proceeding to Phase 1.
