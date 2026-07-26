# Quickstart — Working on the Profile Wizard

**Branch**: `001-profile-wizard`
**Date**: 2026-05-07

A 5-minute orientation for a contributor (or future-you) opening this branch cold. Assumes P0 / P0.5 are already in your local clone and `npm install` has run.

---

## 1. Switch to the branch

```bash
git checkout 001-profile-wizard
npm install   # if any new deps land mid-phase
npm run dev   # serves on http://localhost:5173
```

The dev server should boot in ~150ms. If you see the existing landing page, the foundation is healthy.

## 2. Where to look first

```text
specs/001-profile-wizard/
├── spec.md            ← what we're building, in user terms
├── plan.md            ← this directory's overview, technical context
├── research.md        ← decisions and tradeoffs (R1–R10)
├── data-model.md      ← Profile entity + the v1 Dexie schema
├── contracts/
│   ├── persistence.md ← repository + Result + persistence detection
│   └── i18n-keys.md   ← every i18n key the wizard introduces
└── quickstart.md      ← you are here
```

Read `spec.md` first, then `data-model.md`. Skim `research.md` for the "why" behind any decision that surprises you.

## 3. The order things land in code

1. **Domain types & schemas** (`src/domain/profile.ts`) — Profile type, Zod schema, default values, completeness helper.
2. **Dexie database** (`src/data/db.ts`) — declares v1 with all 11 tables (profile + 10 forward-compat).
3. **Persistence detection** (`src/data/persistence-availability.ts`) — `detectPersistence()` returning `{ status: 'available' | 'degraded', ... }`.
4. **ProfileRepository** (`src/data/repositories/profile-repository.ts`) — `get / save / clear`, returning `Result<T, DomainError>`.
5. **shadcn primitives** (`src/components/ui/{form,input,label,select,radio-group,checkbox,slider,card,progress,toast}.tsx`) — copy from shadcn, swap classes for Spotter tokens.
6. **PersistenceBanner** (`src/components/ui/persistence-banner.tsx`) — Spotter-specific.
7. **Wizard composition** (`src/components/profile/`) — wizard shell + 6 step components.
8. **Pages** (`src/pages/Setup.tsx`, `src/pages/Profile.tsx`, `src/pages/Landing.tsx` upgrade).
9. **i18n strings** (`src/i18n/{en,ar}.json`) — every key from `contracts/i18n-keys.md`.
10. **Routing wiring** (`src/App.tsx`) — `<ProfileGuard>`, `/setup`, `/profile`.
11. **Tests** (`tests/unit/`, `tests/integration/`) — see Test plan below.

You can break this order if a slice goes faster, but Domain → Data → Primitives → Composition → Pages → i18n → Routing → Tests is a graph that minimizes "I need this thing that doesn't exist yet" backtracking.

## 4. Verifying as you go

After each step in the order above, run:

```bash
npm run check        # typecheck + lint + format + test
npm run build        # catches any prod-only issue
npx impeccable detect src/   # CI gate
```

When the wizard is mountable in the browser:

- Visit `/_design` to confirm the new shadcn primitives render in EN and AR.
- Visit `/setup` for the wizard.
- Toggle to AR via the language switch on `/_design` — every step must render RTL.
- Open Chrome DevTools → Application → IndexedDB → `spotter` → `profile` to verify writes.

## 5. The integration tests are the gate

`tests/integration/` defines the success criterion in code:

| Test                         | Spec story | Acceptance                                                         |
| ---------------------------- | ---------- | ------------------------------------------------------------------ |
| `wizard-completion.test.tsx` | US1        | Save → reload → profile present, identical to what was saved.      |
| `wizard-resume.test.tsx`     | US2        | Mid-wizard close → reopen → resumes at the same step with values.  |
| `wizard-rtl-switch.test.tsx` | US3        | EN→AR switch mid-wizard → no data loss, `dir="rtl"` applied.       |
| `wizard-no-storage.test.tsx` | FR-004     | Mocked unavailable storage → banner present, "Saved." never fires. |

A green CI run on these four tests is the minimum bar to merge `001-profile-wizard` to `main`.

## 6. Things that are easy to miss

- **First-paint RTL** — `index.html` carries an inline script (CSP-hashed) that reads `localStorage['spotter.lang']` before React mounts. If you forget, AR users see a flash of LTR. See R4.
- **Number inputs** — use `<input type="text" inputMode="decimal">`, not `type="number"`. The Arabic keypad on iOS strips characters under `type="number"`. See R6.
- **Numeric storage** — always canonical Latin digits, dot decimal, SI units. The unit toggle changes _input_ rendering only.
- **Completeness rounds to 5%** — avoids visual jitter. See R7.
- **Don't import `db` from anywhere except `src/data/`**. Repositories are the only entry point.
- **Banner must be acknowledged** — in degraded mode, the user clicks "I understand" before they can advance past step 1. Don't auto-dismiss.
- **No em dashes in product copy** — DESIGN.md §6.6.
- **Voice baseline** — knowledgeable friend who lifts. "Saved." not "Your changes have been saved." Empty states invitational. Errors specific.

## 7. Out of scope for P1 (don't accidentally build these)

- Plan generation, prompt building, exercise library UI, daily workout view, session logging — all later phases.
- Multi-profile support, sync, account creation — constitution-banned.
- Image upload (avatar) — adds file-handling complexity that isn't needed yet; lands in P6 if at all.
- Light theme — dark only per `DESIGN.md`.
- Tracking, analytics, error reporting — constitution-banned.

## 8. After P1 lands

`/speckit.tasks` will turn this plan into a numbered task list. Then `/speckit.implement` (or manual implementation following the order in section 3) fills in the code. Constitution gates re-run on every PR.

When you finish: open a PR titled `feat(p1): profile wizard + local data foundation`, link `spec.md` and the four integration tests in the description, and let CI gate it.
