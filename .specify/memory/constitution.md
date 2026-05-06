<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0
Bump rationale: Initial ratification of the Spotter constitution. All five core
principles defined for the first time; previous file was an unfilled template.

Modified principles: N/A (initial adoption)
  - Added: I. No Server, No Backend Database
  - Added: II. Free Forever for Users
  - Added: III. Open Source
  - Added: IV. Professional Quality with a Real Design System
  - Added: V. Real Security, Not Theatrical

Added sections:
  - Project Identity (header block)
  - Operational Context (constraints that are not principles)
  - Discipline (decision rule for every implementation choice)
  - Governance (amendment, versioning, compliance review)
  - Amendment Changelog

Removed sections: None.

Templates requiring updates:
  - ✅ .specify/memory/constitution.md (this file)
  - ⚠ .specify/templates/plan-template.md — "Constitution Check" section is a
    generic placeholder ("[Gates determined based on constitution file]"); will
    need concrete gates wired during /speckit.plan runs (no structural change
    required at adoption time).
  - ✅ .specify/templates/spec-template.md — no constitutional conflict; no
    edits needed at adoption.
  - ✅ .specify/templates/tasks-template.md — no constitutional conflict; no
    edits needed at adoption.
  - ⚠ README.md / CONTRIBUTING.md — should reference this constitution and the
    five principles once written (Principle III work item).

Follow-up TODOs: None deferred. All placeholders resolved.
-->

# Spotter Constitution

> **Tagline:** Your gym, your data, your AI coach.
>
> **Owner:** Hossam Abosaleh
> **License:** MIT
> **Repository:** Public on GitHub (final URL TBD pending availability check)
> **Hosting:** Vercel (static deployment)

Spotter is a free, open-source, client-side web application that helps lifters
use general-purpose AI assistants (Claude, ChatGPT, Gemini) as personal trainers.
It acts as a launchpad and tracker between a user's training data and the AI of
their choice. The name comes from the gym metaphor: a spotter watches your set,
knows your limits, and helps you push safely — exactly what this app does
between you and your AI coach.

This constitution defines the non-negotiable rules that govern every technical,
product, and contribution decision in the project. The five Core Principles
below are not aspirations; they are gates. Any change that violates a principle
is rejected unless the principle itself is formally amended.

## Core Principles

### I. No Server, No Backend Database

The application MUST be purely client-side and statically served. The project
MUST NOT operate a backend server, application database, or third-party
Backend-as-a-Service (Firebase, Supabase, AWS Amplify, or equivalent) that
holds user data.

- All user data MUST live in the user's own browser, primarily via IndexedDB.
- Vercel hosts static files only. No serverless functions that persist user
  state. Edge/serverless endpoints, if ever introduced, MUST be stateless and
  MUST NOT receive personally identifying or training data.
- There MUST be no user accounts, no authentication, and no sessions managed
  by the project.
- Multi-device sync, if added, MUST be opt-in and either user-mediated (e.g.,
  JSON export the user uploads to their own cloud) or self-hosted (the user
  runs the sync server themselves). The project MUST NEVER operate
  infrastructure that holds user data.

**Rationale:** Eliminating server-side data storage removes entire classes of
risk (breaches, subpoenas, vendor lock-in, ongoing operating cost) and aligns
the trust model with the user — their data stays on their device.

### II. Free Forever for Users

Spotter MUST remain free of charge to end users in perpetuity.

- No paid tier, no subscription, no in-app purchases.
- No advertising and no advertising integrations.
- No tracking-based monetization. No analytics SDKs that identify users or
  share behavior with third parties.
- No "premium" or gated features behind a paywall.
- Privacy-respecting, opt-in, aggregate analytics (e.g., self-hosted Plausible
  with no cookies and no PII) are permitted; no other telemetry is.
- Total operating cost to the project owner MUST remain near zero at any
  reasonable scale. Architectural decisions that cannot satisfy this at the
  free tier of mainstream static hosts are rejected.

**Rationale:** A free, ad-free, telemetry-light tool keeps incentives aligned
with the user instead of with growth, retention, or monetization metrics.

### III. Open Source

Spotter MUST be developed in the open under a permissive license.

- The full codebase MUST be public on GitHub under the **MIT License**.
- The repository MUST be structured to invite contribution: a clear README,
  a CONTRIBUTING guide, issue and PR templates, and code organized so a new
  contributor can find their bearings within minutes.
- No proprietary code, no obfuscation, and no secrets committed to the
  repository at any point in its history.
- All third-party runtime dependencies MUST be permissively licensed (MIT,
  Apache 2.0, BSD-2/3-Clause, ISC). GPL, LGPL, AGPL, SSPL, BUSL, or other
  copyleft / source-available licenses are prohibited in shipped code.
- Default assets (images, exercise library, illustrations) MUST be free to
  redistribute (Creative Commons CC0 / CC-BY / CC-BY-SA where compatible, or
  equivalent) with provenance recorded.

**Rationale:** Open source under MIT with permissive dependencies maximizes
trust, auditability, and the ability of others to fork, self-host, or extend
the project without legal friction.

### IV. Professional Quality with a Real Design System

Code, UI, and documentation MUST be of CV-grade quality. "Good enough for a
side project" is not the standard; the standard is a portfolio piece.

**Engineering baseline:**

- TypeScript with `strict` mode enabled. No `any` escape hatches without an
  explicit, justified comment.
- Linting and formatting (ESLint + Prettier or equivalent) enforced in CI.
- Meaningful commit messages and a clean git history. Squash or curate before
  merge; do not ship "wip" or "fix" as final messages.
- Accessibility baseline: full keyboard navigation, screen reader support,
  WCAG 2.1 AA color contrast, and managed focus on every interactive surface.
- Performance budget on a mid-tier mobile device on 4G:
  - First Contentful Paint < 1.5s
  - Largest Contentful Paint < 2.5s
  Regressions beyond budget MUST block release.
- Mobile-first responsive design.

**Design system (established before any feature work begins):**

- Design tokens for semantic colors, typography scale, spacing, radii,
  shadows, and motion.
- Component primitives built on a shadcn/ui foundation, customized with the
  project's tokens, following Vercel composition-patterns rules: no boolean
  prop proliferation, prefer compound components and explicit variants over
  flag soup.
- A dedicated design test page that renders every primitive in every state and
  in every supported language (English and Arabic with RTL).

**Quality gates for UI:**

- Every UI change MUST pass `/impeccable` critique and AccessLint contrast
  checks before merge.
- A deterministic CI gate (`npx impeccable detect`) MUST run on every PR and
  block on AI-slop anti-patterns.
- AI-assisted skills (Impeccable for design taste, AccessLint for
  accessibility, composition-patterns for component architecture) are
  required reviewers for UI work, not optional.

**Rationale:** This is the project's portfolio. Quality is the product, not a
later optimization.

### V. Real Security, Not Theatrical

Security decisions MUST follow a documented threat model maintained in the
repository. The application MUST NOT provide a vector to compromise users'
devices, their local data, or their accounts on other services.

- A strict Content Security Policy MUST be delivered via Vercel response
  headers. No `unsafe-inline`, no `unsafe-eval`. SRI MUST be applied to any
  CDN-loaded assets.
- All user-generated and AI-imported content MUST be rendered through React's
  auto-escaping. `dangerouslySetInnerHTML` is prohibited for any user, AI, or
  externally sourced data — no exceptions.
- File uploads (when supported) MUST be restricted to an explicit allow-list
  with magic-byte verification, MUST reject SVG, and MUST enforce size limits.
- All AI-imported content MUST be validated against a Zod schema before being
  trusted by any other code path.
- External image URLs MUST be sanitized: only `https:` or a constrained
  `data:` allow-list is permitted.
- `eval`, `new Function`, dynamic `import()` of untrusted strings, and inline
  scripts are prohibited.
- `npm audit` (or equivalent) MUST pass on every release. Dependencies MUST
  be pinned to exact versions in lockfiles; lockfile changes are reviewed.

**Rationale:** Because all user data lives on the user's device, the
application is the attack surface. A lapse here directly harms users in a way
that no server-side mitigation can repair.

## Operational Context

The following are accepted realities of this project, not commitments. They
may change without violating the constitution and do not require an amendment.

- **Owner availability:** approximately 8–12 hours per week.
- **Target v1 timeline:** approximately 12 weeks from project start to public
  launch.
- **Languages supported in UI:** English and Arabic, with full RTL support.
- **Primary platform:** mobile web, delivered as a Progressive Web App (PWA).
  Desktop is a secondary, supported but non-driving target.

These constraints inform scope and prioritization but do not override any
principle. If a deadline pressure conflicts with a principle, the principle
wins and the deadline slips.

## Discipline

When making any decision during implementation — choosing a dependency, a
data flow, a UI pattern, a hosting feature, an analytics tool, anything — the
contributor MUST ask:

> **"Does this comply with all five principles?"**

If the answer is no, the proposal is rejected, even if it is technically
elegant, even if it would be faster, even if "everyone else does it."

If a principle itself needs to change, that change is debated as a
constitution amendment (see Governance below), recorded in the Amendment
Changelog at the bottom of this file, and followed immediately by updates to
all dependent documents (templates, README, CONTRIBUTING, threat model,
design system docs).

## Governance

This constitution supersedes any conflicting practice, convention, or
preference elsewhere in the repository. In the event of conflict between this
file and any other document, this file controls until amended.

**Amendment procedure**

1. Open a pull request that modifies `.specify/memory/constitution.md` and
   includes:
   - The specific text change (diff).
   - The motivation, including which real decision forced the question.
   - The proposed new version per the versioning policy below.
   - A migration / propagation list of every dependent document that must be
     updated in the same PR or in tracked follow-up issues.
2. The amendment is reviewed against the Discipline test: does the change
   leave all remaining principles internally coherent and enforceable?
3. On merge, the Amendment Changelog at the bottom of this file MUST be
   updated in the same commit, and dependent docs MUST be updated within the
   same PR or under tracked follow-up issues created at merge time.

**Versioning policy (semantic)**

- **MAJOR** — A principle is removed, redefined in a backward-incompatible
  way, or governance rules are materially loosened.
- **MINOR** — A new principle or section is added, or existing guidance is
  materially expanded.
- **PATCH** — Clarifications, wording fixes, typo fixes, or non-semantic
  refinements.

**Compliance review**

- Every PR description MUST state how the change relates to each of the five
  principles, even if the answer is "no impact."
- Reviewers MUST refuse to approve PRs that violate a principle without a
  paired amendment PR.
- A constitution review is performed at every release tag: confirm that the
  shipped artifact still satisfies all five principles, and record the
  result in the release notes.

**Version**: 1.0.0 | **Ratified**: 2026-05-06 | **Last Amended**: 2026-05-06

## Amendment Changelog

- **1.0.0 — 2026-05-06** — Initial ratification. Established Project Identity,
  five Core Principles (No Server / Free Forever / Open Source / Professional
  Quality with Design System / Real Security), Operational Context,
  Discipline rule, and Governance with semantic versioning and amendment
  procedure.
