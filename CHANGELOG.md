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

### Coming next

- Phase P0.5: Design System Foundation
  - `/impeccable teach` to refine `DESIGN.md`
  - Encode tokens into `tailwind.config.ts` and `src/styles/tokens.css`
  - Install shadcn/ui base primitives
  - Build Spotter-specific component primitives
  - Build `/_design` test page
