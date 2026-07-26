# Implementation Plan: Profile Wizard & Local Data Foundation

**Branch**: `001-profile-wizard` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-profile-wizard/spec.md`

## Summary

P1 ships two interlocking pieces:

1. The **local data foundation** — a Dexie/IndexedDB schema (version 1) covering the wider data model (Profile, LibraryExercise, UserExercisePreference, CustomExercise, WorkingWeight, Plan, Block, TrainingDay, PlannedExercise, Session, SetLog, ExportPayload), Zod schemas matching every type, and a `profileRepository` exposing get/save/clear. The schema is shaped now so P2–P9 add tables without breaking v1 data.
2. The **profile wizard** — a six-screen bilingual flow (Identity → Body & Goal → Experience & Schedule → Equipment & Limitations → Language & Coach → Review) built on `react-hook-form` + Zod, with per-change autosave, per-step validation on blur, and a persistent in-memory-mode banner when local storage is unavailable. The landing page is upgraded to route the user to the wizard on first visit and to their saved profile thereafter.

Success criterion (from spec SC-002): a profile saved through the wizard is still present and unchanged after a hard browser reload, 100% of the time.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode, `noImplicitAny`, `noUncheckedIndexedAccess`)
**Primary Dependencies**: React 18, react-router-dom 6, Tailwind 3, react-i18next 15, Dexie 4, react-hook-form 7, Zod 3, Zustand 5, shadcn/ui primitives (Form, Input, Label, Select, RadioGroup, Checkbox, Slider, Progress, Toast, Card), lucide-react, radix-ui (under shadcn), tailwind-merge
**Storage**: IndexedDB via Dexie 4 (sole persistence; localStorage reserved for tiny non-PII preferences only — language, active-step pointer, banner-acknowledged flag)
**Testing**: Vitest 3 + React Testing Library 16 + fake-indexeddb 6 (component tests, repository round-trip tests, schema validation tests)
**Target Platform**: Modern evergreen browsers (Chromium, Firefox, Safari) ≥ 2 versions; PWA-installable; primary surface is mobile web; desktop is secondary
**Project Type**: Web application — single-project, frontend-only static SPA (constitution forbids backend)
**Performance Goals**: FCP < 1.5s, LCP < 2.5s on mid-tier mobile over 4G (constitution); wizard end-to-end completion < 4 minutes for a new user on a phone (SC-001); autosave latency < 1s perceived (acceptance scenario US2.2)
**Constraints**: dark theme only, locked palette per `DESIGN.md` §3.1, ≥ 44 × 44 logical pixel touch targets, WCAG 2.1 AA contrast (4.5:1), EN + AR with full RTL including first-paint, no `dangerouslySetInnerHTML` on user data, all imports Zod-validated, no analytics SDKs, no calls leaving the device
**Scale/Scope**: single profile per device, six wizard screens, ~25 form fields total across all steps, schema seeded for 11 future entities

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Constitution version: 1.0.0. Five principles, all hard gates.

### I. No Server, No Backend Database — PASS

- All P1 persistence is client-side IndexedDB via Dexie. No serverless function, no third-party BaaS, no auth.
- No user accounts, no sessions managed by the project.
- No telemetry on form interaction, no remote logging.
- Forward-compatibility: schema versioning baked in (Dexie `version(1).stores(...)` pattern) so v2 additive migrations work without server-side coordination.

### II. Free Forever for Users — PASS

- Zero monetization paths added. No paywall on any wizard step. No "premium" branching.
- No advertising integrations.
- No analytics SDKs of any kind. Privacy-respecting opt-in aggregate analytics (e.g., self-hosted Plausible) deferred to a later phase if at all.
- All chosen runtime dependencies (Dexie, react-hook-form, Zod, Zustand, react-i18next, lucide-react, radix-ui, tailwind-merge, class-variance-authority) are licensed MIT/Apache 2.0/BSD/ISC — confirmed at install during P0 (`npm audit` clean).

### III. Open Source — PASS

- No new proprietary dependencies introduced.
- README, CONTRIBUTING, issue/PR templates already in place from P0.
- Default exercise library (added in a later phase) will use CC0/CC-BY assets; not exercised in P1.

### IV. Professional Quality with a Real Design System — PASS

- TypeScript strict mode already enforced via `tsconfig.json`. No `any` introduced.
- ESLint + Prettier + simple-git-hooks pre-commit already wired. CI runs `npm run check` and `impeccable detect`.
- Wizard composes from existing primitives (`Button`, plus shadcn form primitives installed during this phase) with Spotter tokens. No bespoke styling outside the token system.
- All new shadcn primitives (Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Input, Label, Select, RadioGroup, Checkbox, Slider, Progress, Toast, Card) added to `/_design` showcase route in EN + AR before merge.
- AA contrast holds — wizard surfaces use only locked tokens whose contrast is documented in `DESIGN.md` §3.1.
- Mobile-first; ≥ 44 × 44 touch targets enforced in primitive variants.
- Performance budget: wizard bundle additions tracked; lazy-loading the wizard route is allowed if it helps land Landing-page LCP under budget.
- `/impeccable critique` runs on the new primitives and the wizard before merge. AccessLint contrast scan on `/_design` post-update.
- `npx impeccable detect src/` remains green (CI gate).

### V. Real Security, Not Theatrical — PASS

- CSP headers already strict from P0; no relaxation needed (no inline scripts, no `unsafe-eval`).
- All user input rendered through React auto-escaping. No `dangerouslySetInnerHTML`.
- Zod schemas validate every persistence boundary: profile reads from IndexedDB go through schema parsing; profile writes go through schema parsing first. Anything malformed in storage is treated as a corruption signal, never trusted.
- No file uploads in P1 (image upload lands later); allow-list helper exists in `src/utils/security.ts` from P0.
- No `eval`, no `new Function`, no dynamic `import()` of untrusted strings.
- `npm audit` clean enforced via CI; lockfile pinned.
- Numeric input parsing (Arabic-Indic vs Latin digits) uses an explicit, locale-aware converter — never `parseFloat` on raw user text without a normalization pass.

**Gate result: PASS for all five principles. No violations to track.** No entries in the Complexity Tracking section.

## Project Structure

### Documentation (this feature)

```text
specs/001-profile-wizard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── persistence.md   # Dexie schema + repository function signatures
│   └── i18n-keys.md     # i18n key contract for the wizard
└── checklists/
    └── requirements.md  # Spec quality checklist (already exists)
```

### Source Code (repository root)

```text
src/
├── App.tsx                                  # Routes: /, /setup, /profile (P1 additions)
├── main.tsx
├── components/
│   ├── ui/                                  # shadcn-derived primitives
│   │   ├── ai-badge.tsx                     # existing (P0.5)
│   │   ├── button.tsx                       # existing (P0.5)
│   │   ├── card.tsx                         # NEW — shadcn Card
│   │   ├── checkbox.tsx                     # NEW
│   │   ├── exercise-card.tsx                # existing (P0.5)
│   │   ├── form.tsx                         # NEW — shadcn Form + Field/Item/Label/Control/Description/Message
│   │   ├── input.tsx                        # NEW
│   │   ├── label.tsx                        # NEW
│   │   ├── meta-pill.tsx                    # existing (P0.5)
│   │   ├── progress.tsx                     # NEW — wizard progress + completeness indicator
│   │   ├── radio-group.tsx                  # NEW
│   │   ├── select.tsx                       # NEW
│   │   ├── slider.tsx                       # NEW
│   │   ├── toast.tsx                        # NEW — "Saved." confirmations + autosave failure
│   │   ├── working-weight-display.tsx       # existing (P0.5)
│   │   └── persistence-banner.tsx           # NEW — in-memory-mode banner (Spotter-specific)
│   └── profile/                             # NEW — wizard composition
│       ├── wizard.tsx                       # Wizard shell: routing, progress, persistence-mode banner
│       ├── steps/
│       │   ├── step-identity.tsx
│       │   ├── step-body-goal.tsx
│       │   ├── step-experience-schedule.tsx
│       │   ├── step-equipment-limitations.tsx
│       │   ├── step-language-coach.tsx
│       │   └── step-review.tsx
│       ├── completeness-indicator.tsx       # post-completion nudge
│       └── use-profile-form.ts              # react-hook-form bootstrap + Zod resolver
├── data/                                    # NEW — Dexie database
│   ├── db.ts                                # SpotterDB class, version(1), tables
│   ├── persistence-availability.ts          # detectPersistence() helper
│   └── repositories/
│       ├── profile-repository.ts            # get/save/clear
│       └── (placeholders for later phases — see data-model.md)
├── domain/
│   ├── exercise.ts                          # existing (P0.5)
│   ├── profile.ts                           # NEW — Profile type + Zod schema
│   ├── plan.ts                              # NEW — type stubs for forward compatibility
│   ├── session.ts                           # NEW — type stubs
│   ├── library.ts                           # NEW — type stubs
│   └── working-weight.ts                    # NEW — type stubs
├── pages/
│   ├── Design.tsx                           # existing — extended in P1 with new primitives in EN+AR
│   ├── Landing.tsx                          # P1: upgraded with value prop, CTA, GitHub link, privacy line
│   ├── Profile.tsx                          # NEW — post-setup view with completeness indicator
│   └── Setup.tsx                            # NEW — mounts Wizard
├── i18n/
│   ├── ar.json                              # P1: extended with wizard + profile keys
│   ├── en.json                              # P1: extended with wizard + profile keys
│   ├── index.ts                             # existing
│   └── useDirection.ts                      # existing
├── lib/
│   └── utils.ts                             # existing (cn helper)
├── styles/
│   ├── globals.css                          # existing
│   └── tokens.css                           # existing
└── utils/
    ├── digits.ts                            # NEW — Arabic-Indic ↔ Latin digit normalization
    └── security.ts                          # existing (P0)

tests/
├── unit/
│   ├── digits.test.ts                       # NEW
│   ├── format.test.ts                       # existing
│   ├── Landing.test.tsx                     # existing — updated for new copy
│   ├── profile-schema.test.ts               # NEW — Zod round-trip
│   ├── profile-repository.test.ts           # NEW — fake-indexeddb round-trip
│   └── security.test.ts                     # existing
└── integration/                             # NEW
    ├── wizard-completion.test.tsx           # End-to-end: clean session → finish → reload → still saved
    ├── wizard-resume.test.tsx               # Mid-wizard close → reopen → resume at last step
    ├── wizard-rtl-switch.test.tsx           # EN→AR mid-wizard, no data loss, RTL applied
    └── wizard-no-storage.test.tsx           # Storage unavailable → banner present, no false "Saved."
```

**Structure Decision**: Single-project frontend-only SPA, organized by feature concern (`profile/` colocates wizard-specific composition; `data/` owns the Dexie layer; `domain/` is type+schema source of truth). The constitution forbids a backend, so no `api/` or `backend/` tree exists or will exist.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Section intentionally empty.
