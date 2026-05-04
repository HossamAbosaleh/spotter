# Spotter — Master Plan

> **Project tagline:** Your gym, your data, your AI coach.
>
> **Project context:** "Spotter" is a fresh repository superseding the personal-use `gym-guide-v3` project (vanilla JS, hardcoded for one athlete). The new project is a generic AI-launchpad and tracker for any lifter, built professionally for open-source distribution.

> **How to use this file with Spec Kit:**
>
> 1. First, run `/speckit.constitution` with the prompt in `constitution-prompt.md`. This generates the project's constitution.
> 2. For each phase below, in order: run `/speckit.specify` referencing this file and the phase number. Then `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, and `/speckit.implement` for that same phase.
> 3. Move to the next phase only after the previous one passes its success criterion.
> 4. v2 phases begin only after v1.0.0 is in production for at least 2-4 weeks.
> 5. v3 phases are speculative — re-evaluate scope and re-spec from scratch when approaching them.

---

## Project Overview

### What we're building

A free, open-source, client-side web application that bridges a lifter's training data to their AI assistant of choice. The app produces structured prompts that turn Claude/ChatGPT/Gemini into a personal trainer, then tracks the resulting workouts and generates session reports the user can send back to the AI for ongoing coaching.

### Who it's for

Primary user: **intermediate lifters who already use AI tools.** Mid-20s to mid-40s, lifts consistently for 1–5 years, uses Claude or ChatGPT regularly, owns a smartphone, trains 3–5 days per week at a commercial gym. Has used a tracker app before (Strong, Hevy, MyFitnessPal) and found something missing.

The app must be welcoming to beginners but design tradeoffs favor the intermediate user.

### Why this exists

Articles like "Turn Claude into the Ultimate Personal Trainer" require 30+ minutes of manual setup (pasting templates, filling working weights, marking up an exercise library). Most users abandon before finishing. Once set up, the AI doesn't know the user's training history without manual re-entry. After workouts, sending session data to the AI is tedious.

This app removes that friction. It's the form that makes AI fitness coaching actually usable.

---

## Tech Stack (Locked)

- **Build:** Vite 5
- **Framework:** React 18
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 3 with custom design tokens (dark theme, lime accent `#e8ff47`, orange accent `#ff6b35` — final tokens defined by `/impeccable teach` in P0.5)
- **Component foundation:** shadcn/ui (copy-pasted into `src/components/ui/`, customized with design tokens — we own all component code)
- **Storage:** IndexedDB via Dexie.js 4
- **Routing:** React Router 6 (decide alternative in P0 if needed)
- **State:** Zustand for cross-component state, React local state otherwise
- **Forms:** react-hook-form + Zod for validation
- **Validation:** Zod
- **i18n:** react-i18next (decide alternative in P0 if needed)
- **PWA:** vite-plugin-pwa with Workbox
- **Icons:** lucide-react
- **Testing:** Vitest + React Testing Library + fake-indexeddb
- **Lint/Format:** ESLint + Prettier
- **Hosting:** Vercel (static)
- **License:** MIT

### Design & UX Skills (installed in P0)

These are AI-assisted design tools layered into the development workflow, not runtime dependencies:

- **Impeccable** ([impeccable.style](https://impeccable.style)) — comprehensive design skill with 23 commands (`/impeccable teach`, `/impeccable craft`, `/impeccable critique`, `/impeccable polish`, etc.) and 7 domain references (typography, color, motion, spatial, interaction, responsive, UX writing). Includes a deterministic CLI anti-pattern detector (`npx impeccable detect`) used as a CI quality gate.
- **AccessLint** (accesslint/claude-marketplace) — accessibility-focused skill stack (contrast checker, refactor, use-of-color, link-purpose) with bundled MCP server for programmatic WCAG analysis.
- **Vercel composition-patterns** (vercel-labs/agent-skills) — enforces clean component API patterns (no boolean prop proliferation, compound components, explicit variants, children-over-render-props).

All dependencies must be MIT/Apache 2.0/BSD/ISC. No GPL.

---

## Architecture (One-Paragraph Summary)

A React Single Page Application served as static files from Vercel. All data lives in IndexedDB via Dexie. No backend, no server-side processing. AI integration in v1 is via deep links to claude.ai / chatgpt.com / gemini.google.com (the user pastes the generated prompt or follows a one-tap link with the prompt URL-encoded). v2 adds optional bring-your-own API key mode with encrypted local key storage. PWA for offline shell and installability. Bilingual EN/AR with full RTL support. Strict CSP, secure file upload validation, schema-validated JSON imports.

---

## Data Model (High-Level)

The Spec Kit `/speckit.plan` command should generate a detailed data model in TypeScript when running on P1. Key entities:

- **Profile** — single record per device (id: 'me'). Body composition, goals, schedule, equipment, injuries, language preferences, coach personality.
- **LibraryExercise** — defaults loaded from `/public/library-defaults.json` (~80 entries, EN + AR names, categories, default image URLs) plus user-created customs.
- **UserExercisePreference** — user's YES/SUB/NO marking and notes per library exercise.
- **WorkingWeight** — current working weight per exercise, decoupled from any plan so it persists across plans.
- **Plan** — a programme with 1–N flexible blocks (volume / intensity / peaking / deload / general). Each block has training days; each day has planned exercises with sets/reps/RPE/rest.
- **Session** — an actual logged workout, references a plan and training day. Has perceived RPE, notes, and a list of SetLogs.
- **SetLog** — individual set entry: exerciseId, setNumber, weightKg, reps, rpe, optional note. Separate table from Session for indexable time-series queries.

Schema is designed so v2 features (charts, body composition tracking, multi-plan management) require only additive migrations, never breaking changes. v3 adds tables for nutrition, body measurements, and recovery as needed.

---

## Security Model (Summary)

Threat model lives in `/speckit.plan` output for P9. Key mitigations:

- React auto-escapes all user-rendered strings; no `dangerouslySetInnerHTML` for user data
- Strict CSP via `vercel.json`: `default-src 'self'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'`
- File uploads: whitelist (JPG/PNG/WebP/GIF only, no SVG), magic-byte verification on first 12 bytes, 5 MB cap
- URL validation: only `https:` and safe `data:image/*` schemes accepted
- All AI-imported JSON validated against Zod schemas in a single transaction before any database write
- v2 API keys: AES-256-GCM encryption with PBKDF2-derived key (600k+ iterations) or Argon2id; user passphrase never stored
- v2 CSP relaxation only for user-configured AI provider domains
- `npm audit` clean on every release
- Dependencies pinned to exact versions

---

## v1 Phases — Ship in ~13 weeks at 8–12 hrs/week (~132 hours total, including P0.5 design system foundation)

### Phase P0 — Foundation (~10 hours)

**Objective:** Working, deployable, contributor-friendly project skeleton exists, with design skills installed.

**Scope:**

- Initialize Vite + React + TypeScript + Tailwind project with strict mode
- Set up ESLint, Prettier, simple-git-hooks pre-commit hooks
- Configure Vitest + React Testing Library + fake-indexeddb
- Create initial repo structure (folders for pages, components, components/ui (shadcn), domain logic, data, i18n, hooks, utils, styles, tests, docs)
- Set up GitHub Actions CI: lint, typecheck, test, build, npm audit
- **Install Impeccable skill** (download from impeccable.style or copy from repo into `.claude/skills/`); verify `/impeccable` commands work; verify CLI: `npx impeccable detect` runs
- **Install AccessLint plugin** via Claude Code plugin marketplace; verify all four skills load; verify MCP server connects
- **Install Vercel composition-patterns skill** (clone vercel-labs/agent-skills, copy into `.claude/skills/`); verify it activates on React component work
- **Read every SKILL.md before activating.** Per the security guidance in the source articles, verify each skill's `allowed-tools` and bundled scripts are safe before installation
- Configure Vercel deployment from GitHub
- Configure `vercel.json` with strict CSP and security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Write README scaffold (description, run instructions, license badge, contributing pointer)
- Add LICENSE (MIT), CONTRIBUTING.md, .github issue templates and PR template
- Add Impeccable CLI detector to GitHub Actions CI as a quality gate

**Dependencies:** None.

**Success criterion:** A fresh clone runs locally with `npm install && npm run dev`. CI passes on a test PR including the Impeccable detector. CSP headers visible in production response. All three design skills installed and verified working with Claude Code.

---

### Phase P0.5 — Design System Foundation (~12 hours)

**Objective:** A complete, opinionated design system exists in code before any feature is written. Every later phase composes from this foundation rather than inventing visual decisions.

**Why this phase exists:** Without a design system in place at the start, every feature invents its own buttons, spacing, colors. By month three, the app has visual chaos. Building this _first_ means every screen Spotter ever has will look like it belongs in the same product. This is the discipline that separates a real product from a prototype.

**Scope:**

_Step 1 — Design context (`/impeccable teach`)_

- Run `/impeccable teach` interactively. The command gathers design context for Spotter: target audience (intermediate AI-using lifters), tone (technical but approachable, AI-native but not parody), constraints (mobile-first, dark theme primary, EN/AR bilingual with RTL, 8-12 hrs/week solo dev), differentiation (gym tracker + AI prompt builder hybrid)
- The command outputs `PRODUCT.md` and `DESIGN.md` at the repo root. Review and refine both. These become the source of truth alongside the Spec Kit artifacts.

_Step 2 — Encode design tokens_

- Translate the `DESIGN.md` decisions into concrete tokens
- Configure `tailwind.config.ts` with the full token system: semantic colors (`bg.surface`, `bg.elevated`, `text.primary`, `text.muted`, `text.dim`, `accent.primary`, `accent.secondary`, `border.default`, `border.subtle`), typography scale (display/heading/body/mono with sizes, weights, line heights), spacing scale (4px base), border radii (sm/md/lg/pill), shadow scale (subtle/card/elevated/floating), motion tokens (durations, easings — strictly no bounce/elastic per Impeccable anti-patterns)
- Write `src/styles/tokens.css` with CSS custom properties for runtime theming
- Document the token reasoning in `DESIGN.md` so contributors know _why_ each value exists, not just _what_ it is

_Step 3 — shadcn/ui base + customization_

- Initialize shadcn/ui in the project (`npx shadcn@latest init`); configure to use our token system
- Install base primitives we'll need: Button, Input, Label, Textarea, Select, Checkbox, Radio Group, Slider, Dialog, Drawer, Sheet, Toast, Badge, Card, Tabs, Accordion, Tooltip, Popover, Progress
- Customize each shadcn primitive to use our design tokens (override the default Tailwind classes with our semantic color names)
- These primitives become _our_ components in `src/components/ui/` — we own the code

_Step 4 — Composition-patterns discipline_

- Use Vercel composition-patterns guidance throughout: no boolean prop proliferation, prefer compound components, prefer explicit variants over modes, children over render props
- Document composition rules in `DESIGN.md` so contributors follow the same patterns

_Step 5 — Domain primitives (Spotter-specific)_

- Build the domain-specific primitives that don't exist in shadcn but are reused throughout Spotter:
  - `ExerciseCard` (the workhorse component — used in library, daily view, session summary)
  - `BadgeTS`, `BadgeMB` (top set vs metabolic badges, replacing the dot system)
  - `MetaPill` (sets/reps/rest pills)
  - `RestTimer` (per-exercise stateful component)
  - `SetLogger` (weight + reps + RPE + notes per set)
  - `LangSwitch`, `RTLProvider` (i18n primitives that wrap content with correct lang/dir)
  - `CopyButton` (for prompts and session logs)
  - `DeepLinkButton` (Open in Claude/ChatGPT/Gemini)
  - `AIBadge` (small visual marker for AI-generated content — transparency feature)
- Each is built using shadcn primitives + design tokens + composition-patterns rules

_Step 6 — Test page and design audit_

- Build a `/_design` test page (development-only route) that renders every primitive in every variant: all button states, all input states, both themes (even though we're dark-first, support light for contrast), all empty/loading/error states, both EN LTR and AR RTL
- Run `/impeccable critique` on the test page and address feedback
- Run `/impeccable audit` for technical quality (a11y, performance, responsive)
- Run AccessLint contrast checker on every color combination — fix any failures
- Run `npx impeccable detect src/` — must pass with no anti-patterns

**Dependencies:** P0 complete (skills installed and verified).

**Success criterion:** All primitives render on the design test page in both languages, both themes, all states. Passes Impeccable detector with zero anti-patterns. Passes AccessLint contrast check (4.5:1 minimum, 7:1 for body text where possible). Passes Lighthouse a11y audit on the test page. `DESIGN.md` and `PRODUCT.md` exist and are complete.

**Risk:** This phase is the longest setup phase and may stretch to ~14-16 hours if design discussions take time. **That stretch is acceptable.** Cutting corners here means paying the cost in every later phase. Take the time.

---

## Design Discipline — Applies to Every Phase from P1 Onward

Every UI-touching task from P1 onward must comply with the design system established in P0.5:

1. **Use existing primitives.** If a screen needs a button, use the `Button` primitive. If it needs a card, use `ExerciseCard` or extend `Card`. Don't reinvent.
2. **Extend, don't fork.** If an existing primitive needs a new variant, extend it following composition-patterns rules (compound component or explicit variant — never a boolean prop).
3. **All new components run through `/impeccable critique`** before being merged.
4. **All new color combinations run through AccessLint** for contrast.
5. **All new components added to the design test page** so the system stays browsable.
6. **Document new primitives in `DESIGN.md`** as they're added.
7. **CI runs `npx impeccable detect` on every PR** — anti-patterns block merge.

A phase is not complete until its UI passes these checks. This is non-negotiable, the same way the constitution is non-negotiable.

---

### Phase P1 — Data Layer + Profile Wizard (~10 hours)

**Objective:** A user can complete profile setup and see their data persisted.

**Scope:**

- Define all TypeScript types: Profile, LibraryExercise, UserExercisePreference, CustomExercise, WorkingWeight, Plan, Block, TrainingDay, PlannedExercise, Session, SetLog, ExportPayload
- Define Zod schemas matching every type
- Set up Dexie database (version 1) with profile, customExercises, preferences, workingWeights, plans, sessions, setLogs tables
- Build profileRepository (get/save/clear)
- Build profile wizard as multi-step form using react-hook-form + Zod (identity, body composition, goal, experience, schedule, equipment, injuries, language preferences, coach personality)
- Add profile completeness indicator (subtle progress bar, gentle nudges for skipped optional fields)
- Build public landing page (one-sentence value prop, "Try it" CTA, "View on GitHub" link, privacy line)

**Dependencies:** P0 complete.

**Success criterion:** A user completes profile setup, refreshes the page, and sees their data persisted. Landing page routes correctly to setup.

---

### Phase P2 — Library + Working Weights (~10 hours, may stretch to ~12)

**Objective:** A user can complete library setup with all defaults visible, mark them, add customs, and replace any image.

**Scope:**

- Curate the 80 default exercises from the personal-trainer article into `public/library-defaults.json` with EN+AR names, slug, category, primary muscles
- Find and verify default image URLs for all 80 exercises (Wikimedia Commons, Unsplash, Pexels — must allow hotlinking and be CC-or-free)
- Create `image-sources.json` with full attribution
- Build customExerciseRepository and preferenceRepository
- Build library checklist UI (swipeable card per exercise, YES/SUB/NO buttons, optional note)
- Build "Add custom exercise" form (name EN+AR, category, image URL)
- Build secure image upload flow: whitelist (JPG/PNG/WebP/GIF, no SVG), magic-byte verification, 5 MB cap, render only via `<img>`
- Build URL paste flow with strict scheme validation (`https:` and safe `data:image/*` only)
- Build external search buttons: YouTube (video), Google Images, Google GIFs (open new tab with prefilled queries). Visible on library page; behind "More" menu on daily view (added in P4)
- Build working weights form (skippable per major lift)
- Build Data Sources page rendering `image-sources.json`

**Dependencies:** P1 complete.

**Success criterion:** All 80 defaults visible with working images, marking persists, custom exercises addable, image overrides work via URL and upload, working weights form persists.

**Risk:** Image curation is the time risk. If quality URLs aren't found in the budget, accept placeholder illustrations for some entries and file a v1.1 cleanup task.

---

### Phase P3 — Prompt Generation (~10 hours)

**Objective:** A user with a complete profile can generate a paste-ready prompt and successfully send it to at least one AI via deep link.

**Scope:**

- Build `promptBuilder.ts` for workout prompt: template per the personal-trainer article structure (IDENTITY, ATHLETE PROFILE, CURRENT WORKING WEIGHTS, LIFT LOG, PROGRAMMING RULES, HOW TO RESPOND), filled with profile + library + working weights, with a response-language instruction appended (EN/AR/Bilingual; technical terms always English)
- Build `promptBuilder.ts` for nutrition advisor prompt (Mifflin-St Jeor maintenance, goal-adjusted calories, protein 1.6–2.2g/kg lean mass, macro splits, diet style preference, weekly meal plan + shopping list + macro breakdown table requested)
- Build live prompt preview component that updates as user fills fields
- Build copy-to-clipboard button with success feedback ("Copied ✓"); fall back gracefully if Clipboard API unavailable
- Build deep-link buttons: Claude (`https://claude.ai/new?q=`), ChatGPT (`https://chatgpt.com/?q=`), Gemini (no documented `?q=`; fall back to "Open Gemini" navigation only)
- Handle URL length limits (~8 KB Chrome, less Safari): if prompt > 4 KB, show "the prompt is long — copy and paste manually" hint
- Build visual setup guide: illustrated step-by-step walkthrough for first-time Claude Project setup (mobile-readable, concise)

**Dependencies:** P1 + P2 complete.

**Success criterion:** Manual test — generate prompt, send to Claude.ai, receive a coherent training plan back. Same for ChatGPT.

---

### Phase P4 — Plan Import + Daily Workout View (~20 hours)

**Objective:** A user can import an AI-generated plan and start a tracked workout.

**Scope:**

- Define and document the strict plan JSON schema in `docs/PROMPT_FORMAT.md` (matches Plan/Block/TrainingDay/PlannedExercise types from P1)
- Build `planImporter.ts` for strict JSON path: Zod validation, transactional write, clear error messages on invalid JSON
- Build `planImporter.ts` for freeform text path: regex/heuristic parser for common AI output patterns ("Exercise — sets x reps @ weight", "RPE 7-8", etc.)
- Build `matcher.ts`: fuzzy match exercise names to library entries with similarity threshold; user confirmation UI for ambiguous cases ("'Belt Squat' isn't in your library — add as new, or pick a substitute?")
- Build plan import UI: paste field, parse preview, match-confirmation flow
- Build daily workout view: cards per planned exercise with image, name, badge (TS/MB), sets/reps/rest pills, notes
- Add per-exercise rest timer using state isolated per exercise (fix v3-vanilla's shared-state bug); persists across visibility changes; audio chime on completion
- Add demo mode: "Try demo mode" button on landing populates sample profile, sample plan, 2 weeks of session logs; jumps user straight to a populated daily view; user can convert to real profile any time
- Add first-session guided tour: coach marks fire on first daily-view visit, dismissible, doesn't reappear
- Add "More" menu on daily view holding the search buttons (YouTube/Google Images/Google GIFs)

**Dependencies:** P3 complete.

**Success criterion:** Import an AI-generated plan (JSON or freeform text), see today's workout cards rendered correctly, rest timer works, demo mode produces a realistic-feeling experience.

**Risk:** Text-import parsing accuracy. If freeform parsing is unreliable on real Claude/ChatGPT outputs, fall back to "JSON-only" import in v1 with text parsing as a v1.1 enhancement. Don't block the phase on parser perfection.

---

### Phase P5 — Set Logging + Quick Log (~10 hours)

**Objective:** A user can complete a full workout and log every set.

**Scope:**

- Build set logger UI per exercise: weight (kg/lbs per profile.units), reps, optional RPE, optional per-set note. Inputs sized for thumbs. Auto-fill from previous session for that exercise.
- Add session-level auto-save on every input change so closing the tab mid-session preserves data
- Add quick log mode: "Quick log" button opens exercise picker (any library entry), captures sets, marks `isOffPlan: true` in the SetLog
- Add "Finish session" button: prompts for overall perceived RPE and optional session notes, sets `endedAt`, returns to summary

**Dependencies:** P4 complete.

**Success criterion:** Closing the tab mid-session and reopening preserves all logged sets. Auto-fill suggests last session's weight + reps. Quick log entries correctly tagged off-plan. Finish session captures session-level RPE and notes.

---

### Phase P6 — Feedback Loop (~10 hours)

**Objective:** A user finishes a session, copies the log to their AI, and sees smart-prompt suggestions when patterns warrant.

**Scope:**

- Build `sessionLogGenerator.ts` that produces a session log in the exact article format: `[DD/MM/YYYY] — Day N: Name`, `Week X | Block Y`, `Exercise | Sets x Reps | Weight | RPE | Notes`, session notes
- Build session summary screen with copy-to-clipboard and deep-link buttons (Claude / ChatGPT / Gemini)
- Build `smartPrompts.ts`: pattern detection for at least four patterns — stalled lift (2+ consecutive sessions, unchanged weight at high RPE), deload due (4+ weeks since last deload), adherence drift (significant gap between planned and logged volume), new PR detected. Each pattern produces a tailored question prompt.
- Surface smart prompts on session summary and (later) weekly view: "Ask your coach this week" section with one-tap copy

**Dependencies:** P5 complete.

**Success criterion:** Generated session log matches snapshot tests of the article format. Smart prompts fire correctly for fixture data covering all four patterns. Manual test: copy session log to Claude PT, get useful coaching feedback.

---

### Phase P7 — Data Portability + PWA (~10 hours)

**Objective:** Users can fully export, fully import, install the app to home screen, and use it offline.

**Scope:**

- Build `exportImport.ts` for full JSON export (all entities, versioned via `exportVersion: 1`, includes appVersion and exportedAt timestamp)
- Build JSON import flow with full Zod schema validation, transactional write, clear errors on invalid file
- Build "Your Data" page showing every IndexedDB table name and row count, with "Export all" and "Delete everything" buttons (delete requires double confirmation)
- Configure `vite-plugin-pwa`: manifest with theme color, icons (192, 512), display `standalone`; service worker with stale-while-revalidate for static assets, network-first for `library-defaults.json` and `image-sources.json`
- Subtle PWA install button in settings (no aggressive nag banners)
- Add migration from legacy v3-vanilla `localStorage` keys: detect on first launch, prompt user to import, map legacy `wlog-<exId>` to a Session with three SetLogs, map legacy images to `customImageUrl`. Preserve legacy keys (do not delete) for rollback safety. **Cross-domain note:** if Spotter deploys to a different URL than the original gym-guide-v3 deployment, browser security prevents reading the old localStorage directly. Solution: ship a one-time export tool on the old deployment (a small "Export my data" button) that downloads the legacy JSON; the new app accepts that file in its import flow.

**Dependencies:** P5 complete (P6 not strictly required but recommended).

**Success criterion:** Round-trip: export → wipe IndexedDB → import → all data restored. App installs to home screen on iOS Safari and Chrome Android. App shell loads offline after first visit. Lighthouse PWA audit passes.

---

### Phase P8 — i18n + Polish (~10 hours)

**Objective:** App is fully bilingual with correct RTL handling.

**Scope:**

- Add i18n library (react-i18next preferred) wired to `Profile.uiLanguage`; switch flips HTML `lang` and `dir` attributes at document root
- Translate all UI strings to Arabic in `src/i18n/ar.json`
- Verify RTL layout on every page (logical properties: `ms-4` not `ml-4`, `pe-2` not `pr-2`)
- Format numbers, dates, units via `Intl.NumberFormat` and `Intl.DateTimeFormat` with active locale
- Build print-friendly view for daily workout: `@media print` stylesheet producing clean paper output
- Audit all UI copy: ensure "Nutrition advisor" naming throughout (not "Diet plan")

**Dependencies:** All previous phases (i18n affects every screen).

**Success criterion:** Grep for `[missing]` strings returns zero. Each page renders correctly in both EN LTR and AR RTL on real device. Print preview produces useful paper version. No "Diet" terminology in user-facing copy.

---

### Phase P9 — Security Hardening + Public Launch (~20 hours)

**Objective:** App is publicly launched as v1.0.0 with all docs written and no high or critical security issues.

**Scope:**

- Full accessibility audit: axe DevTools, keyboard navigation walkthrough, screen reader pass; target Lighthouse a11y ≥ 95
- Lighthouse performance pass: target Performance ≥ 90, Best Practices ≥ 95, SEO ≥ 90 on mobile
- CSP audit: verify no inline scripts, no `eval`, no unsafe sources in production build; browser console reports no CSP violations on any page
- Security review: walk every threat in the threat model, document mitigation evidence in `docs/SECURITY.md`
- Cross-browser smoke test on Safari iOS, Chrome Android, Firefox, Edge (last 2 versions each)
- Edge case bug fixing from accessibility, performance, and cross-browser reviews
- Write SECURITY.md (threat model summary, vulnerability disclosure process)
- Finalize CHANGELOG.md, README with screenshots, CONTRIBUTING.md
- Tag v1.0.0, post launch announcement (Reddit, dev.to, Hacker News, fitness communities)

**Dependencies:** All previous phases complete.

**Success criterion:** All Lighthouse targets met. Zero CSP violations. Threat model fully mitigated and documented. v1.0.0 tagged on GitHub. Launch announcement live.

---

## v2 Phases — Begin ~2-4 weeks after v1.0.0 ships in production

v2 transforms the app from a great launchpad into a great launchpad with insight. Estimated total: ~80–100 hours over 8–12 weeks. **Do not start v2 until v1 has been live with real users for at least 2 weeks** — bug surface compounds otherwise.

### Phase P10 — v2 Foundation (Schema Migration + Analytics Repo) (~10 hours)

**Objective:** Schema migration in place, analytics layer ready.

**Scope:**

- Add Dexie version 2 migration with compound index `[exerciseId+sessionId]` on setLogs (for fast time-series queries)
- Add Dexie version 2 stores for `bodyComp` table
- Build `analyticsRepo` with strength history per exercise, volume by muscle group, PR detection, estimated 1RM via Epley/Brzycki
- Add Recharts dependency and chart primitives wrapped with project design tokens
- Round-trip backup test: v1 backup imports cleanly under v2 schema

**Dependencies:** v1.0.0 shipped, in production ≥2 weeks.

**Success criterion:** Migration runs non-destructively on v1 fixtures. Analytics queries return aggregates in under 100ms for 1000+ logs.

---

### Phase P11 — v2 Analytics UI (~12 hours)

**Objective:** Users with 4+ weeks of data see their progression visualized clearly.

**Scope:**

- Per-exercise progress chart screen (open from any exercise card): weight × reps over time with estimated 1RM trendline, PR annotations
- Volume-per-muscle dashboard: stacked bar by week, date range filter
- Body composition entry form (manual: weight, BF%, lean mass, optional notes) and timeline chart with goal line
- Adherence dashboard: sessions completed vs planned per week
- Optional streak counter (default OFF, opt-in via settings, never push notifications, gentle UI not aggressive gamification)

**Dependencies:** P10 complete.

**Success criterion:** Charts render correctly with sparse (1 session) and dense (100+ sessions) data. Mobile rendering verified on iOS Safari and Chrome Android.

---

### Phase P12 — v2 API Key Mode (~14 hours)

**Objective:** Power users can use the AI loop without any copy/paste.

**Scope:**

- Encrypted API key storage: AES-256-GCM with PBKDF2 (600k+ iterations) or Argon2id KDF; user passphrase derives encryption key; passphrase never stored
- Passphrase entry UI: initial setup, per-launch unlock with optional "remember for this session" toggle, change passphrase, clear UX for "wrong passphrase"
- `AIProvider` interface with three implementations: Anthropic (Claude API), OpenAI, Google (Gemini API). Methods: `generatePlan`, `generateNutritionPlan`, streaming `chat`
- CSP relaxation: only user-configured AI provider domains added to `connect-src`, conditional via runtime config
- Cost meter: per-call token counts and estimated cost stored in `AIUsage` table; display rolling 7d and 30d spend per provider
- Automatic plan import: when API-key mode is on, generate plan → directly produce structured Plan → present diff → user accepts

**Dependencies:** P10 complete (P11 not strictly required).

**Success criterion:** External security review of crypto implementation passes (community contributor or paid review). No plaintext keys in IndexedDB. CSP correctly limits outbound to user's chosen providers only. Cost meter accuracy within 10% of actual provider billing.

**Risk:** API key mode is the most security-sensitive feature in the entire project. If the security gate fails, ship v2 without it and tag v2.5 once the implementation is bulletproof.

---

### Phase P13 — v2 Plan Management (~8 hours)

**Objective:** Multi-plan support; AI-suggested changes are reviewable, not blind-applied.

**Scope:**

- Multi-plan support: archive old plans, switch between active plans, archived plans hidden but data preserved
- Plan diff generator: structured diff showing added, removed, modified exercises with reasons
- Side-by-side review UI: user accepts or rejects diff atomically (no partial application)
- Programme template generator: from a single 4-week plan, expand into a 12-week schedule with progression rules baked in (4+4+3+1 block structure visualization)

**Dependencies:** P10 complete; P12 enhances but is not required.

**Success criterion:** Switching active plans does not corrupt session history. Diff UI shows changes clearly. Template expansion produces sane week-over-week progression.

---

### Phase P14 — v2 Recovery & Deload Intelligence (~6 hours)

**Objective:** Smart prompts and deload suggestions account for recovery and fatigue.

**Scope:**

- Add `recoveryEntries` table; build optional daily 3-slider check-in (sleep hours, stress 1-5, soreness 1-5). Default OFF.
- Extend `smartPrompts` engine with deload suggestions based on RPE trends + volume + recovery data
- Build fatigue heat map per muscle group with last-trained timestamps (graceful degradation if no recovery data)

**Dependencies:** P10 complete.

**Success criterion:** Recovery features completely opt-in. Deload suggestions fire correctly for fixture data showing genuine fatigue patterns.

---

### Phase P15 — v2 Community & Templates (~8 hours)

**Objective:** v2 is contribution-friendly with clear paths for community input.

**Scope:**

- Add `community-exercises.json` loading; UI flag for community-sourced entries (badge)
- Update CONTRIBUTING.md with exercise submission guidelines: PR template, example entry, review checklist (each entry needs EN+AR names, CC-licensed image URL, primary muscle classification)
- Add `public/plan-templates/` folder with 3-5 starter templates (Push/Pull/Legs, 5/3/1, Upper/Lower) — JSON files importable as plans even without AI

**Dependencies:** P2 complete (library architecture); ideally after P11.

**Success criterion:** At least one external contributor successfully merges a community exercise PR before formal launch (test the workflow). Plan templates work without any AI involvement.

---

### v2.0.0 Launch

After P15 ships, tag v2.0.0. Same launch discipline as v1: full security audit, cross-browser test, README/CHANGELOG updates, public announcement.

---

## v3 Phases — Speculative, 12+ months after v1

v3 phases are intentionally less detailed because the world will have changed by then. Each phase below is **a placeholder for future spec work** — when approaching, re-spec from scratch using `/speckit.specify` rather than treating the description below as the spec.

**Decision discipline before starting any v3 phase:** verify the technical assumptions still hold, that user demand exists, and that v2 has produced enough adoption to justify continued investment.

### Phase P16 — Multi-AI Ensemble (~12 hours estimated)

Send the same coaching question to multiple AIs in parallel. Surface consensus and disagreement via a fourth summarizing call. Useful when AIs differ on technique advice. Builds on v2 API key mode infrastructure.

**Decision point:** Are users actually requesting this, or is it owner-imagined?

### Phase P17 — Vision-Based Form Check (~16 hours estimated)

User uploads short video clip (≤30s, ≤25 MB, locally only). App extracts key frames and sends to vision-capable AI with explicit user confirmation each time. Returns structured form notes. Strong "form coaching, not medical advice" disclaimer.

**Decision point:** Are vision-capable AIs reliable enough at the time? What's the liability stance on incorrect advice?

### Phase P18 — Nutrition Tracking (~25 hours estimated)

Beyond the v1 nutrition advisor prompt: actual food logging with a database of common foods, macros, calories. Becomes a real cut/bulk tracker. **May warrant a sibling project rather than expanding the gym app — re-evaluate scope before committing.**

### Phase P19 — Body Measurements + Photo Progress (~10 hours estimated)

Tape-measure measurements (chest, waist, hips, arms) over time. Optional private photo log with local-only storage. Photo storage at scale may force File System Access API approach instead of IndexedDB Blobs.

### Phase P20 — Wearables Integration (~15 hours estimated)

Read-only import from Apple Health, Google Fit, Garmin Connect via JSON file export from each platform. No live sync, no OAuth. Same pattern as v1 backup import.

### Phase P21 — Apple Watch / Wear OS Companion (~30+ hours estimated)

Native watch app for in-session logging. **Leaves the PWA-only world; may violate constitution P3 in spirit due to App Store distribution.** Re-examine before committing. Likely a sibling project.

### Phase P22 — Voice Logging (~8 hours estimated)

Web Speech API integration: "log eighty kilos eight reps R-P-E seven." Pattern recognition. Privacy disclaimer about browser-provider audio processing.

### Phase P23 — Self-Hosted Sync (~25 hours estimated)

Optional end-to-end encrypted sync via user-hosted server (Docker, ~50 MB). Server stores only ciphertext. We never run this server; users do. Significant cryptography work — only pursue with experienced contributor leading.

### Phase P24+ — Federated Communities, Plugin Architecture

Coach/team workspaces hosted by users. Plugin architecture for third-party extensions. **Both likely become separate projects rather than living inside the gym app.**

---

## Cross-Version Discipline

**At v1 → v2 boundary:** v1 must have been in production ≥2 weeks; v1 bug backlog reasonable; retrospective informs v2 plan refinements.

**At v2 → v3 boundary:** v2 must show user adoption (10+ regular users, 50+ GitHub stars, or equivalent); v2 codebase maintainable by at least one external contributor; full re-spec before v3 phases begin.

**Throughout the lifetime:**

- Constitution does not change without deliberate amendment in its changelog
- Every phase boundary triggers an `/speckit.analyze` run
- Decisions get logged (use `/speckit.clarify` to capture them as they arise)
- The "Won't Have At Any Version" list (in spec) is a contract, not a wishlist

---

## What's Explicitly Out of Scope (At Any Version)

These are project-wide rejections, not "later, maybe":

- User accounts on a server we run
- Cloud database we operate
- Centralized real-time sync we host
- Social features requiring shared databases (leaderboards, public profiles, friends-on-our-platform)
- Direct video uploads stored on our infrastructure
- Built-in proprietary AI (the AI is always external)
- Native iOS/Android apps in app stores (PWA is the mobile app; v3 watch companion may be the only exception, reconsidered at the time)
- Paid features of any kind
- Tracking, ads, monetization based on user data

---

## How to Use Spec Kit With This Plan

1. **Constitution first:** `/speckit.constitution` with the prompt in `constitution-prompt.md`. Run once at project start.
2. **For each phase, in order, run the full cycle:**
   - `/speckit.specify` — point it at this plan and the phase number; generates the spec for that phase
   - `/speckit.clarify` — captures the questions and decisions specific to that phase
   - `/speckit.plan` — generates the technical plan for the phase (data model details, threat model updates, etc.)
   - `/speckit.tasks` — granular task list for the phase
   - `/speckit.implement` — execute the tasks; spec stays the source of truth
3. **At each phase boundary:** run `/speckit.analyze` to catch contradictions before moving on
4. **Don't skip phases.** Don't start P3 before P2 ships. Don't start v2 before v1 is in production. Don't pre-spec v3.
5. **When the world changes:** amend the constitution explicitly, re-run analyze, update this plan with a changelog entry.

---

## Total Project Effort Estimate

| Phase set                                | Hours        | Calendar at 10 hrs/week                                |
| ---------------------------------------- | ------------ | ------------------------------------------------------ |
| v1 (P0–P9, including P0.5 design system) | ~132         | ~13 weeks                                              |
| v2 (P10–P15)                             | ~80–100      | ~8–12 weeks                                            |
| v3 (partial, speculative)                | ~100–200     | ~10–20 weeks                                           |
| **Lifetime estimate**                    | **~312–432** | **~13+ months active dev across ~18+ months calendar** |

Calendar time exceeds active dev time due to phase boundaries, post-launch maintenance, and bug fixes that aren't in the task list. Plan for ~1.5x calendar vs active.
