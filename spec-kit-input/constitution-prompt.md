# Constitution Prompt

> **How to use this file:** Run `/speckit.constitution` in Claude Code with this prompt. The slash command will generate the project's `constitution.md` based on these principles. Edit the generated file if any wording feels off, but keep the principles themselves intact.

---

## Prompt to paste into `/speckit.constitution`

Generate the project constitution for **Spotter** — an open-source, free, client-side web application that helps lifters use AI assistants (Claude, ChatGPT, Gemini) as personal trainers by acting as a launchpad and tracker between the user's training data and their AI of choice. The name comes from the gym metaphor: a spotter watches your set, knows your limits, and helps you push safely — exactly what the app does between you and your AI coach.

The constitution must capture these **five non-negotiable principles** that govern every decision in the project:

### Principle 1 — No Server, No Backend Database

The application is purely client-side and static. There is no backend server, no application database we operate, and no third-party Backend-as-a-Service (Firebase, Supabase, etc.) holding user data. All user data lives in the user's own browser via IndexedDB. Vercel hosts only static files. There are no user accounts, no authentication, no sessions. Multi-device sync, if ever added, must be opt-in and either user-mediated (JSON export to their own cloud) or self-hosted (user runs the sync server themselves) — we never operate infrastructure that holds user data.

### Principle 2 — Free Forever for Users

No paid tier, no subscription, no ads, no tracking-based monetization. Total operating cost to the project owner must remain near zero at any reasonable scale. No analytics that identify users. No advertising integrations. No "premium" features behind paywalls. Privacy-respecting opt-in analytics (e.g., self-hosted Plausible) are acceptable; nothing else.

### Principle 3 — Open Source

Full codebase public on GitHub under MIT license. Repository structured to invite contribution: clear README, CONTRIBUTING guide, issue templates, code organized so new contributors can find their bearings. No proprietary code, no secrets in the repo, no obfuscation. All third-party dependencies must be permissively licensed (MIT, Apache 2.0, BSD, ISC) — no GPL or AGPL contamination. Default assets (images, exercise library) must be free to redistribute (Creative Commons or equivalent).

### Principle 4 — Professional Quality with a Real Design System

Code, UI, and documentation must all be of CV-grade quality. TypeScript with strict mode. Linting and formatting enforced. Meaningful commit messages, clean git history. Accessibility baseline: keyboard navigation, screen reader support, WCAG 2.1 AA color contrast, focus management. Performance budget: First Contentful Paint < 1.5s on mid-tier mobile, Largest Contentful Paint < 2.5s. Mobile-first responsive design.

A coherent design system is established **before** any feature work begins. The system includes design tokens (semantic colors, typography scale, spacing, radii, shadows, motion), component primitives (built on shadcn/ui foundation, customized with our tokens, following Vercel composition-patterns rules — no boolean prop proliferation, prefer compound components and explicit variants), and a design test page that renders every primitive in every state and language. UI quality is enforced by AI-assisted skills (Impeccable for design taste, AccessLint for accessibility, composition-patterns for component architecture) and a deterministic CI gate (`npx impeccable detect`) that catches AI-slop anti-patterns before merge. No UI ships that has not been through `/impeccable critique` and AccessLint contrast checks.

### Principle 5 — Real Security, Not Theatrical

Security decisions follow a documented threat model. The application must not provide a vector to compromise users' devices, data, or accounts on other services. Strict Content Security Policy via Vercel headers. All user-generated content rendered through React's auto-escaping — no `dangerouslySetInnerHTML` for user data, ever. File uploads (when supported) restricted to a whitelist with magic-byte verification, no SVG, with size limits. All AI-imported content validated against a Zod schema before being trusted. External image URLs sanitized (https or safe data: only). No `eval`, no `new Function`, no inline scripts. SRI for any CDN assets. `npm audit` must pass on every release. Dependencies pinned to exact versions.

---

## Constraints That Are NOT Principles

These are accepted realities, not commitments. They may change without violating the constitution. Include them in the generated constitution under a separate section labeled "Constraints" or "Operational Context":

- Owner availability: ~8–12 hours per week
- Target v1 timeline: ~12 weeks from project start to public launch
- Languages supported in UI: English and Arabic with full RTL support
- Primary platform: Mobile web (PWA); desktop is secondary

---

## Discipline

Include in the generated constitution a closing section that establishes the discipline:

When making any decision during implementation, ask: _"Does this comply with all five principles?"_ If the answer is no, the proposal is rejected — even if it's technically elegant, even if it would be faster. If a principle itself needs to change, that change is debated as a constitution amendment, recorded in a changelog at the bottom of the constitution file, and followed by updates to dependent documents.

---

## Project Identity (For the Constitution Header)

- **Project name:** Spotter
- **Tagline:** Your gym, your data, your AI coach.
- **Owner:** Hossam Abosaleh
- **License:** MIT
- **Repository:** Public on GitHub (final URL TBD pending availability check)
- **Hosting:** Vercel (static deployment)
