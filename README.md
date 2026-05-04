# Spotter

> Your gym, your data, your AI coach.

Spotter is a free, open-source, client-side web app that bridges lifters to their AI assistant of choice. It helps you turn ChatGPT, Claude, or Gemini into a real personal trainer by producing structured prompts from your training data — and then tracks your sessions so you can send daily reports back to the AI for ongoing coaching.

**Status:** Phase P0 (foundation). The project is in active early development.

## Why Spotter exists

Articles like ["Turn Claude into the Ultimate Personal Trainer"](https://www.example.com) require 30+ minutes of manual setup: pasting templates, filling working weights by hand, marking up an exercise library line by line. Most people abandon before finishing.

Once set up, the AI doesn't know your training history without manual re-entry. After workouts, sending session data to the AI is tedious. The result: AI coaching potential goes wasted because the human-side workflow is too painful to sustain.

Spotter removes that friction. It is the form that makes AI fitness coaching actually usable.

## What Spotter does

- **Profile setup → AI prompt** (5 minutes)
- **Paste plan back from AI → structured tracker** (1 minute)
- **Daily logging with rest timer, sets, reps, RPE** (during workout)
- **Session log → back to AI for coaching** (after workout)

All client-side. No server. No account. No tracking. Your data lives on your device.

## What Spotter doesn't do

- Run an AI itself (you bring your own — Claude, ChatGPT, Gemini)
- Store your data on a server (we have no server)
- Charge you anything (it is free, forever)
- Track you (no analytics that identify users)
- Lock you in (full JSON export at any time)

## Tech stack

- **Build:** Vite 5
- **Framework:** React 18 + TypeScript 5 (strict)
- **Styling:** Tailwind CSS 3 + custom design tokens
- **Components:** shadcn/ui foundation, customized
- **Storage:** IndexedDB via Dexie 4
- **Routing:** React Router 6
- **Forms:** react-hook-form + Zod
- **i18n:** react-i18next (English + Arabic, full RTL support)
- **PWA:** vite-plugin-pwa with Workbox
- **Testing:** Vitest + React Testing Library
- **Hosting:** Vercel (static)

## Run locally

You'll need [Node.js 20+](https://nodejs.org/) installed.

```bash
git clone https://github.com/hossamabosaleh/spotter.git
cd spotter
npm install
npm run dev
```

Open `http://localhost:5173`.

### Useful commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (output in dist/)
npm run preview      # Preview the production build locally
npm run typecheck    # TypeScript strict-mode check
npm run lint         # ESLint
npm run format       # Prettier auto-format
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run check        # Run all checks (typecheck + lint + format + test)
```

## Project structure

```
spotter/
├── .claude/skills/         # Claude Code project-specific skills
│   └── spotter-design/     # Design rules + composition patterns
├── .github/                # CI workflows, issue templates
├── public/                 # Static assets
├── spec-kit-input/         # Spec Kit workflow input files
│   ├── plan.md             # Master phase plan
│   └── constitution-prompt.md  # Constitution generator prompt
├── spec/                   # Spec Kit-generated artifacts (filled during work)
├── src/
│   ├── components/         # Spotter-specific components
│   ├── components/ui/      # shadcn/ui primitives (added in P0.5)
│   ├── data/               # Dexie database + repositories
│   ├── domain/             # Business logic (prompt builder, importer, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Translation strings
│   ├── pages/              # Route pages
│   ├── styles/             # Global styles + tokens
│   └── utils/              # Pure utilities
├── tests/                  # Unit + integration tests
├── docs/                   # Architecture, security, prompt format
├── DESIGN.md               # Design system source of truth
├── plan.md                 # → see spec-kit-input/plan.md
├── tailwind.config.ts      # Design tokens
└── vercel.json             # CSP + security headers
```

## How development works

Spotter is built using the **Spec-Driven Development** workflow via [Spec Kit](https://github.com/github/spec-kit). The full road map (v1, v2, v3) lives in [`spec-kit-input/plan.md`](./spec-kit-input/plan.md).

Within Claude Code:

1. `/speckit.constitution` — generates the constitution from `spec-kit-input/constitution-prompt.md`
2. `/speckit.specify` — specs the next phase from `plan.md`
3. `/speckit.clarify` — captures phase-specific decisions
4. `/speckit.plan` — generates the technical plan for the phase
5. `/speckit.tasks` — granular task list
6. `/speckit.implement` — executes the tasks

Design decisions are governed by [`DESIGN.md`](./DESIGN.md). The `spotter-design` Claude skill (in `.claude/skills/spotter-design/`) auto-loads when working on Spotter UI, providing project context to the broader design tools (Impeccable, AccessLint, Vercel composition-patterns).

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full workflow.

## Contributing

Contributions are welcome. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a PR — it covers the workflow, the design system, and the rules every change must pass.

Quick start:

1. Open an issue describing what you want to add or fix
2. Fork, branch, change, test
3. Open a PR using the template
4. CI must pass (lint, typecheck, tests, build, security audit)
5. UI changes also need design system checks

## License

[MIT](./LICENSE) — use it however you want.

## Security

If you find a security issue, please **do not** open a public issue. See [`SECURITY.md`](./SECURITY.md) for responsible disclosure.

---

Built with care by Hossam Abosaleh and contributors. 💪
