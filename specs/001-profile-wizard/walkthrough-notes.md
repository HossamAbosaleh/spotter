# T056 — Manual Acceptance Walkthrough

- **Date:** 2026-07-22
- **How:** Live run against the Vite dev server (`http://localhost:5173/`) driven
  through a real Chrome session (browser automation). Screenshots captured at
  each step.
- **Build under test:** branch `001-profile-wizard` after the T052/T053
  remediation commits.

## Results

| Story      | Scenario                                                                                       | Result                      |
| ---------- | ---------------------------------------------------------------------------------------------- | --------------------------- |
| **US1**    | Complete wizard (6 steps) → Save → `/profile` renders saved state                              | ✅ Pass                     |
| **US1**    | Hard reload of `/profile` — data persists (IndexedDB, not memory)                              | ✅ Pass                     |
| **US2**    | Reload mid-wizard — resumes at the same step with all answers intact                           | ✅ Pass                     |
| **US3**    | Switch language mid-wizard (EN → AR) — instant RTL flip, state preserved                       | ✅ Pass                     |
| **US4**    | Skip all optional fields — save succeeds, completeness indicator + incomplete-save toast shown | ✅ Pass                     |
| **FR-004** | Unavailable-storage banner in a private/incognito window                                       | ⏳ Not run live (see below) |

## Evidence / observations

- **US1** — Filled Identity → Body & Goal → Experience → Equipment → Language &
  Coach → Review, saved, landed on `/profile` with every value rendered. Autosave
  ("Saving…") fired between steps. After a full page reload the profile was still
  present, confirming the Dexie/IndexedDB write (not just in-memory store).
- **US2** — Navigating away and back to `/setup` mid-wizard restored **Step 6 /
  Review** with all answers, and kept the chosen language. Resume-after-close
  works with no "Resume?" modal, as designed.
- **US3** — Selecting Arabic on Step 5 flipped the entire UI to RTL immediately:
  heading right-aligned, **progress bar fills from the right**, nav buttons
  mirrored (Next moved to the left with a left-pointing arrow), all selections
  preserved across the switch. "SPOTTER" correctly stays LTR inside Arabic text.
- **US4** — With every optional field skipped (equipment notes, injuries,
  additional context, schedule via "irregular days"), Save succeeded and
  `/profile` showed the completeness indicator listing the missing optional
  fields, plus the incomplete-save toast ("…you can add the optional details
  from the profile page").
- **Rename (T053 #1)** — The `/profile` destructive trigger now reads
  **"Delete profile" / "احذف الملف"** (confirmed live in AR; EN covered by the
  updated `Profile.test.tsx` assertions), no longer colliding with the wizard's
  non-destructive "Start fresh" reset.
- **Landing copy (T053 #7)** — Positioning line renders with a comma, no em dash;
  capability badges are legibly bright (the `text-dim` → `text-muted` fix).

## Minor UX note (not a blocker)

- On `/profile`, the completeness indicator reads **"0%"** for a profile whose
  required fields are all filled — it is measuring _optional_ enrichment
  (0 of 4 optionals provided), consistent with its "a few optional details
  remain" copy, but the bare "0%" reads harsher than the reassuring tone intends.
  Worth revisiting the label/number framing.

## Remaining

- **FR-004 (unavailable storage)** was **not exercised live** — it requires a
  private/incognito window, which the automation session could not open, and the
  browser extension became flaky on repeated reloads. The persistence-banner
  logic, `detectPersistence`, and degraded-mode gating are covered by unit/
  integration tests. **Action:** a human should open the app in a private window
  (or block site storage) and confirm the banner appears and the wizard gates
  progression, per FR-004 / SC-007. Estimated 2 minutes.
- A live screen-reader (VoiceOver/NVDA) + real contrast-checker pass is still
  recommended before release sign-off, since the T052 audit was code-level.
