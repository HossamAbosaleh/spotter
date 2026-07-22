# Changelog

All notable changes to Spotter are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase P0: Project foundation
  - Vite + React + TypeScript + Tailwind scaffold
  - GitHub Actions CI (typecheck, lint, format, test, build, audit)
  - Vercel deployment config with strict CSP and security headers
  - PWA configuration via vite-plugin-pwa
  - Initial Landing page placeholder
  - Smoke test for Landing page
  - README, CONTRIBUTING, SECURITY, LICENSE (MIT)
  - Issue templates and PR template
  - Spotter design skill (`.claude/skills/spotter-design/`)
  - Starter design system (`DESIGN.md`)
  - Spec Kit input files (`spec-kit-input/`)

- Phase P0.5: Design System Foundation
  - `DESIGN.md` and `PRODUCT.md` refined via `/impeccable teach`
  - Token system encoded in `tailwind.config.ts` + `src/styles/tokens.css`
    (locked accent palette: lime `#e8ff47`, orange `#ff6b35`, AI cyan-teal `#90c4d4`)
  - shadcn `Button` primitive customized with Spotter tokens
  - Spotter-specific primitives: `AIBadge`, `MetaPill`, `WorkingWeightDisplay`
  - `ExerciseCard` compound primitive with Library / Daily / Summary variants
  - Tailwind-merge utility preserving custom font-size classes
  - `/_design` showcase route (dev-only) covering every primitive in EN + AR

- Phase P1: Data Layer + Profile Wizard
  - Local-first data layer: Dexie-backed `SpotterDB` (v1, 11-table schema),
    `ProfileRepository` (read/write/clear) behind a `Result`/`DomainError`
    boundary, `classifyDexieError`, and `detectPersistence` for storage health
  - `Profile` domain entity with a Zod `profileSchema`, `defaultProfile()`,
    and a `profileCompleteness()` scorer
  - Six-step profile wizard (`wizard.tsx` + `useProfileForm`): Identity,
    Body & Goal, Experience & Schedule, Equipment & Limitations,
    Language & Coach, Review — with per-step validation and Back/Next/Finish
  - Draft autosave, resume-after-close, and a Start-fresh reset flow
  - Bilingual EN/AR content with full RTL support: `useDirection`
    (`<html lang>`/`<html dir>` sync), Arabic-Indic digit conversion,
    locale-aware number formatting, and an EN/AR key-parity test
  - `CompletenessIndicator` (Progress bar + missing-field nudge) mounted on
    `/profile`, with a dismiss/acknowledge flow
  - `PersistenceBanner` + `ProfileGuard` covering the unavailable-storage
    case (FR-004)
  - Upgraded Landing, Setup (wizard host), and Profile (view/edit) pages
  - Toast system (store + primitives) and confirmation dialogs
    (Start-fresh, Delete-profile)

### Deferred from P0.5 (intentional)

The plan listed additional shadcn primitives (Input, Label, Textarea, Select,
Checkbox, RadioGroup, Slider, Dialog, Drawer, Sheet, Toast, Badge, Card, Tabs,
Accordion, Tooltip, Popover, Progress) and domain primitives (`BadgeTS`,
`BadgeMB`, `RestTimer`, `SetLogger`, `LangSwitch`, `RTLProvider`, `CopyButton`,
`DeepLinkButton`). These will land alongside their first real consumer in P1–P4
rather than being built speculatively in isolation. The token system, the
ExerciseCard family, and the `/_design` audit surface are the load-bearing
parts of the design system — those are in place and govern every later phase.

### P0.5 closeout checks

- `npm run check` (typecheck, lint, format, test) — passing
- `npm run build` — passing
- `npx impeccable detect src/` — zero anti-patterns
- AccessLint live audit — deferred (no Chrome on the closeout machine);
  static contrast verified against the AA-documented tokens in
  `DESIGN.md` §3.1. Live audit to run on the next CI environment with
  Chrome available.

### Deferred from P1 (intentional)

- Imperial unit **display** for height/bodyweight. Units (metric/imperial) are
  captured and stored, but Step 2 renders metric only; the imperial path needs
  bidirectional conversion (parse imperial → store metric; read metric →
  display imperial) and lands in a follow-up. See the TODO in
  `src/components/profile/steps/step-body-goal.tsx`.

### P1 closeout checks

- `npm run check` (typecheck, lint, format, test) — passing (157 tests)
- `npm run build` — passing (main bundle ~587 kB; wizard route not yet
  code-split — revisit if landing-page LCP regresses)
- `npx impeccable detect src/` — passing (zero anti-patterns)
- `/impeccable critique` on profile components — done (30/40); critical +
  serious findings fixed, minor deferred (see `accesslint-report.md`)
- Accessibility audit — done via Impeccable `/audit` (AccessLint is not an
  installable package); 15/20, all P1/P2 addressed, documented in
  `specs/001-profile-wizard/accesslint-report.md`. Code-level pass — live
  screen-reader/contrast confirmation still recommended before release.
- Manual EN/AR acceptance walkthrough (T056) — pending (human step)

### Coming next

- Phase P2: Library + Working Weights
