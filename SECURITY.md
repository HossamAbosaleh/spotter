# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in Spotter, **please do not open a public issue.**

Instead, contact the maintainer privately:

- GitHub: [open a private security advisory](https://github.com/hossamabosaleh/spotter/security/advisories/new) (preferred)
- Email: TBD

Please include:

1. A description of the vulnerability
2. Steps to reproduce it
3. The potential impact
4. Any suggested fix (optional)

We aim to respond within 7 days and will keep you updated as we work on a fix.

## What counts as a vulnerability

Spotter has no server and stores no user data outside the user's browser. The threat model focuses on:

- **XSS via user-provided content** — including notes, custom exercise names, image URLs, AI-imported plans
- **Malicious file uploads** — anything that bypasses the upload whitelist or magic-byte verification
- **Image URL exploitation** — schemes other than `https:` or safe `data:image/*` slipping through validation
- **JSON import attacks** — malicious JSON bypassing schema validation
- **CSP violations** — the strict CSP in `vercel.json` should prevent inline scripts and arbitrary connections
- **Supply-chain compromise** — any dependency introducing risk

## What does _not_ count

- Reports about the user's own browser (we cannot fix browser bugs)
- Reports about external services (Claude, ChatGPT, Gemini deep links — that's the AI providers' security)
- Theoretical vulnerabilities that require physical access to the user's device

## Disclosure timeline

We follow coordinated disclosure:

1. Reporter sends the issue privately
2. We confirm receipt within 7 days
3. We work on a fix
4. We publish a fix and notify users via release notes
5. Reporter may publicly disclose 30 days after fix release (or sooner by agreement)

We credit reporters in `CHANGELOG.md` unless you prefer to remain anonymous.

## Scope

This policy applies to:

- The Spotter web app at the official deployment URL
- The source code in this repository
- Any official npm packages published from this repository

It does not apply to forks or unofficial deployments.
