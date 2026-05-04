# Pull Request

## What does this change?

Brief summary.

## Why?

What problem does this solve? Link to issue if relevant.

## Phase

Which phase from `spec-kit-input/plan.md` does this fall under?

## Constitution check

This PR complies with the constitution:

- [ ] No server, no backend, no third-party data services added
- [ ] No paid features or tracking introduced
- [ ] No GPL/AGPL dependencies added
- [ ] TypeScript strict mode passes
- [ ] No `dangerouslySetInnerHTML` on user data
- [ ] Image URLs validated for safe schemes
- [ ] No inline scripts (CSP-safe)

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
