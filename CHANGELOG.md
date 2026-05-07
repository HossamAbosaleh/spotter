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

### Coming next

- Phase P1: Data Layer + Profile Wizard
