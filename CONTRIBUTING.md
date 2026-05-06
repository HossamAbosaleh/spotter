# Contributing to Spotter

Thanks for your interest. Spotter is a community-driven open-source project, and contributions of all sizes are welcome — bug reports, feature ideas, translations, documentation, and code.

## Before you start

1. **Read the [constitution](./.specify/memory/constitution.md).** Every change must comply with the five principles

2. **Read the [plan](./spec-kit-input/plan.md).** Make sure your contribution fits into a phase. Out-of-scope contributions get postponed, not merged.

3. **Read [`DESIGN.md`](./DESIGN.md).** UI contributions must follow the design system.

4. **Check existing issues.** Someone may already be working on what you have in mind.

## Workflow

### For bug fixes

1. Open a bug report issue (or comment on an existing one)
2. Fork the repo
3. Create a branch: `git checkout -b fix/short-description`
4. Make the fix; add a test that catches the bug
5. Run `npm run check` locally — must pass
6. Open a PR using the template
7. Address review feedback
8. CI must pass before merge

### For new features

1. Open a feature request issue first — discuss before building
2. Wait for confirmation that the feature is in scope
3. Fork, branch, build (same flow as bugs)
4. PR includes tests and any relevant docs

### For UI changes

In addition to the above:

1. Use existing design system primitives — don't invent new ones lightly
2. If a new primitive is genuinely needed, add it to `src/components/`, document it in `DESIGN.md`, and add it to the `/_design` test page
3. Test in both English LTR and Arabic RTL
4. Run AccessLint contrast checks on any new color combinations
5. Run `npx impeccable detect` locally — must pass

### For translations

1. Translation strings live in `src/i18n/{lang}.json`
2. Translate into your target language; preserve placeholder syntax (`{{name}}`)
3. For Arabic specifically: translations are cultural, not literal. Use Modern Standard Arabic; gym terminology where natural
4. PR title format: `[i18n] Update Arabic translations` (or your language)

## Code standards

- TypeScript strict mode (no `any` without justification)
- Functional components only
- No class components
- No default exports for components (named exports only) — except for page components which use default exports
- Hooks at the top of components; no conditional hooks
- Forms use react-hook-form + Zod
- All user-facing strings go through i18n — no hardcoded English
- Logical Tailwind properties for RTL support: `ms-4` not `ml-4`, `pe-2` not `pr-2`
- Tests use Vitest + React Testing Library
- Format with Prettier (CI enforces)

## Commit messages

Use conventional commits:

- `feat(scope): description` — new feature
- `fix(scope): description` — bug fix
- `docs(scope): description` — docs only
- `style(scope): description` — formatting, no code change
- `refactor(scope): description` — refactor without behavior change
- `test(scope): description` — adding/fixing tests
- `chore(scope): description` — tooling, deps, build

Examples:

- `feat(library): add custom exercise creation flow`
- `fix(timer): resolve shared-state bug across cards`
- `i18n(ar): update workout view translations`

## Getting help

- Open a discussion on GitHub for general questions
- Open an issue for bugs and feature requests
- Tag your PR with relevant labels

## Code of Conduct

Be respectful. Assume good faith. We're building this for the same reason you're contributing — because we love training and we love good software. Let's keep it that way.
