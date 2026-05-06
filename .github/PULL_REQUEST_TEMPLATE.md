# Pull Request

## What does this change?

Brief summary.

## Why?

What problem does this solve? Link to issue if relevant.

## Phase

Which phase from `spec-kit-input/plan.md` does this fall under?

## Constitution compliance

This PR has been reviewed against the [Spotter Constitution](./.specify/memory/constitution.md). Tick what applies; explain anything that needs justification.

**I. No Server, No Backend Database**

- [ ] No backend, server, or third-party data service added

**II. Free Forever for Users**

- [ ] No paid features, ads, or tracking-based monetization introduced

**III. Open Source**

- [ ] No GPL/AGPL/SSPL/BUSL dependencies added
- [ ] No secrets committed

**IV. Professional Quality with Design System**

- [ ] TypeScript strict mode passes
- [ ] UI changes use existing design system primitives (or extend them per composition rules)
- [ ] `/impeccable critique` and AccessLint contrast checks pass (if UI-touching)

**V. Real Security, Not Theatrical**

- [ ] No `dangerouslySetInnerHTML` on user/AI data
- [ ] Image URLs validated for safe schemes
- [ ] No inline scripts (CSP-safe)
- [ ] AI-imported content validated against Zod schema (if applicable)

**Impact summary** (one or two sentences): What's the net effect of this PR on the principles?

---

## Design system check (P1+)

- [ ] Uses existing primitives or extends them per composition rules
- [ ] No banned colors, fonts, or easings introduced
- [ ] Components added to `/_design` test page (if applicable)
- [ ] Tested in EN LTR and AR RTL (if UI-touching)
- [ ] AccessLint contrast checks pass
- [ ] `npx impeccable detect` passes

## Tests

- [ ] Added or updated tests
- [ ] All tests pass locally (`npm run check`)

## Screenshots / videos

If UI-touching.
