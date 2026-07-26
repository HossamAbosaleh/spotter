# Feature Specification: Profile Wizard & Local Data Foundation

**Feature Branch**: `001-profile-wizard`
**Created**: 2026-05-07
**Status**: Draft
**Input**: User description: "P1 — Data Layer + Profile Wizard"

## Clarifications

### Session 2026-05-07

- Q: How should the sex / gender field be represented? → A: Three-option enum (Male / Female / Prefer not to say). Required, with "Prefer not to say" as a real, accepted selection. The AI bridge uses the value for working-weight calibration when present and falls back to neutral defaults when "Prefer not to say."
- Q: What should the wizard do when local persistence is unavailable (private mode, quota exceeded, storage disabled)? → A: Graceful in-memory degradation with a persistent, unmistakable banner across every wizard step ("This session won't be saved — see why"). The "Saved." confirmation never fires in this mode. Banner cannot be auto-dismissed — user must explicitly acknowledge before continuing. No silent loss, no false claim of persistence.
- Q: How many wizard screens? → A: Five thematic steps + a final review screen (six screens total). Step 1: Identity. Step 2: Body & Goal. Step 3: Experience & Schedule. Step 4: Equipment & Limitations. Step 5: Language & Coach. Step 6: Review (every field editable before commit).
- Q: Goal taxonomy — fixed or extensible? → A: Closed enum of exactly five values: strength, hypertrophy, fat loss, recomposition, general fitness. Edge cases handled via a free-text "additional context" field elsewhere on the profile, not by goal sprawl. Predictable AI prompt mapping and clean translations.
- Q: Coach personality option set? → A: Three named options: Encouraging / Direct / Technical. Each maps to a distinct AI prompt-template variant. Encouraging = warmer, more affirmation. Direct = the default Spotter voice baseline. Technical = denser, more biomechanics-oriented language.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — First-time profile setup that survives reload (Priority: P1)

A new visitor opens Spotter for the first time, completes the profile setup wizard end-to-end, and refreshes the browser. Their answers are still there. They can now move on to the next part of the product knowing the app remembered who they are.

**Why this priority**: This is the entire reason P1 exists. Without persistence, every subsequent feature is built on sand — there is no "user" to coach if the user's profile evaporates on reload. This story is also the contract Spotter makes with the user about their data: it lives on the device, not on a server, and it sticks.

**Independent Test**: Open the app in a clean browser session, click the landing-page call-to-action, fill every step of the wizard with realistic answers, click finish, then hard-reload the page. The app routes back to the user's saved profile (not the wizard) and every previously entered value is intact.

**Acceptance Scenarios**:

1. **Given** a clean browser with no prior Spotter data, **When** the user clicks the landing-page primary call-to-action, **Then** the wizard begins at step one (identity) with empty fields.
2. **Given** the user has filled every required field across all wizard steps, **When** they click the final "Finish" action, **Then** their profile is saved locally, a brief "Saved." confirmation is visible, and they are routed away from the wizard.
3. **Given** a saved profile exists, **When** the user reloads the app, **Then** they are not shown the wizard again — they land on the post-setup view with all profile values present.
4. **Given** a saved profile exists, **When** the user manually navigates back to the setup route, **Then** they see their existing values pre-filled and can edit any field.

---

### User Story 2 — Resume an interrupted wizard (Priority: P2)

A user starts the wizard, fills out two or three steps, then closes the browser tab (a phone call, a meeting, the gym). When they come back later — same device, same browser — the wizard is exactly where they left it.

**Why this priority**: Spotter's primary user is filling this out on a phone, possibly between sets, possibly on the bus. Asking them to re-enter everything because they got interrupted is the kind of friction that causes users to abandon the product. Autosave on every change makes the wizard feel weightless.

**Independent Test**: Begin the wizard, fill step one and half of step two, close the tab. Reopen the app from a new tab. The wizard resumes at the same step with all previously entered values restored. No "Resume?" modal — it just continues.

**Acceptance Scenarios**:

1. **Given** the user has answered fields in step one and step two but not finished, **When** they close the tab and reopen the app, **Then** the wizard reopens at the furthest step they reached with prior answers intact.
2. **Given** the user is mid-wizard, **When** they edit any field, **Then** the change is saved within one second without blocking the UI.
3. **Given** the user has saved partial wizard state, **When** they explicitly start over (e.g., a "Start fresh" affordance), **Then** the partial state is cleared and the wizard begins from step one.

---

### User Story 3 — Bilingual experience with full RTL (Priority: P2)

A user prefers Arabic. The wizard, including labels, hints, error messages, and placeholder text, renders in Arabic with right-to-left layout. Switching language mid-wizard never loses any data they have already entered.

**Why this priority**: Bilingual EN/AR with full RTL is a constitutional requirement for Spotter, not an afterthought. The wizard is the first surface area where this discipline is tested in product context. If it fails here, the whole product is suspect.

**Independent Test**: Open the wizard in English, fill step one, switch to Arabic via the language toggle. The interface flips to RTL with Arabic copy; the data the user entered in step one is still in the same fields, untouched. Continue and finish the wizard in Arabic. Reload — the saved profile reflects the Arabic preference.

**Acceptance Scenarios**:

1. **Given** the wizard is open in English, **When** the user toggles language to Arabic, **Then** all visible text becomes Arabic, layout flips to RTL, and any data the user has already entered is preserved in the same fields.
2. **Given** Arabic is selected, **When** the user reloads the app, **Then** the app starts in Arabic with RTL layout from the first paint (no flash of LTR).
3. **Given** a numeric field (e.g., bodyweight), **When** entered in Arabic locale, **Then** the value is interpreted correctly (Arabic-Indic digits or Latin digits both accepted) and stored in a canonical numeric form.

---

### User Story 4 — Skip optional fields without losing the product (Priority: P3)

A user does not want to disclose injuries or doesn't have specific equipment notes. They skip those fields. The wizard does not block them, completes successfully, and the post-setup view shows a quiet, non-judgmental indicator that the profile is, say, 78% complete with a gentle pointer to fill in the rest later.

**Why this priority**: Forced fields produce abandoned wizards or fake answers. The product gets more value from a real partial profile than a coerced complete one. The completeness indicator nudges over time without being a guilt-trip.

**Independent Test**: Complete the wizard while skipping every optional field. The wizard succeeds, the profile is saved, and the post-setup view displays a profile-completeness indicator below 100% with a polite invitation to fill in the rest.

**Acceptance Scenarios**:

1. **Given** the user is on a wizard step containing only optional fields, **When** they advance without filling any of them, **Then** the wizard moves to the next step with no error.
2. **Given** the user finished the wizard with some optional fields skipped, **When** they view their post-setup state, **Then** they see a completeness indicator under 100% with a clear, non-blocking prompt to add the missing pieces.
3. **Given** the completeness indicator is visible, **When** the user dismisses or ignores it, **Then** it does not block any other action and does not re-appear within the same session unless the user opens their profile.

---

### Edge Cases

- The user opens Spotter in a private/incognito window where local persistence is unavailable or quota-restricted: the wizard either completes for the session and the user is told their data won't persist after the window closes, or the wizard is gracefully degraded — never silently lost.
- The user clears site data while a profile exists: on next visit, the app behaves as a first-time visit (no error, no orphan state).
- The user's device runs out of storage during autosave: a non-alarming notice appears, retries once, and surfaces the failure honestly with a recovery suggestion (free up space, export current state).
- The user enters extreme values for numeric fields (negative bodyweight, 999 years old, unrealistic height): validation rejects with a human, specific message, never a stack trace.
- The user navigates back to a previous step while editing: their current step's unsaved-but-typed state is preserved; navigating forward returns them to the same field with the same value.
- The user opens two Spotter tabs and edits in both: changes from the most recently saved tab win on the next read; no data corruption.
- The user has accessibility tools active (screen reader, large text, voice control): every wizard control is reachable, labeled, and operable without a mouse.

## Requirements _(mandatory)_

### Functional Requirements

#### Data persistence

- **FR-001**: System MUST persist a user's profile entirely on the user's device. No profile data leaves the device under any circumstance during P1.
- **FR-002**: System MUST autosave wizard state on every meaningful change (e.g., on field blur or after a short typing pause), so an interrupted session resumes at the same point with the same values.
- **FR-003**: System MUST survive a hard reload: a saved profile must be available on the next visit without any user action.
- **FR-004**: System MUST handle the case where local persistence is unavailable (private mode, quota exceeded, browser disabled storage) by gracefully degrading to an in-memory session and rendering a persistent, unmistakable banner across every wizard step that explains the data will not be saved. In this mode, the "Saved." confirmation MUST NOT appear, and the banner MUST require explicit user acknowledgement before continuing — no silent loss, no false claim of persistence.
- **FR-005**: System MUST allow a user to start a fresh profile by explicitly clearing prior data; the action is destructive and confirmed once.

#### Wizard flow

- **FR-006**: System MUST present a six-screen wizard with the following grouping:
  - **Step 1 — Identity**: name, age, sex (three-option enum: Male / Female / Prefer not to say; the third option is a real selection that triggers neutral working-weight defaults downstream).
  - **Step 2 — Body & Goal**: height, bodyweight, goal (closed enum of exactly five values: strength, hypertrophy, fat loss, recomposition, general fitness — no "Other" escape hatch on the goal field itself).
  - **Step 3 — Experience & Schedule**: experience level, preferred weekly training days.
  - **Step 4 — Equipment & Limitations**: equipment access, injuries / movement limitations (optional).
  - **Step 5 — Language & Coach**: language preferences, coach personality (three named options: Encouraging, Direct, Technical — each maps to a distinct prompt-template variant for the AI bridge).
  - **Step 6 — Review**: a recap screen with every field editable in place before final commit.
- **FR-007**: Users MUST be able to navigate forward and backward between wizard steps without losing entered data.
- **FR-008**: System MUST validate user input contextually: numeric fields enforce realistic ranges, required fields prevent advance, optional fields advance freely.
- **FR-009**: System MUST validate touched fields on blur and all fields on attempted advance / submit. Validation messages are specific, human, and bilingual.
- **FR-010**: System MUST display a brief, non-blocking "Saved." confirmation when the wizard's autosave succeeds, and a clearer notice if autosave fails.
- **FR-011**: System MUST present a profile-completeness indicator after wizard completion, calculated from filled-vs-skipped optional fields, with an invitation to complete missing pieces.
- **FR-012**: Users MUST be able to revisit and edit any saved profile field after completion without re-doing the whole wizard.

#### Bilingual / RTL

- **FR-013**: System MUST present the entire wizard, including all labels, helper text, validation messages, and confirmations, in both English and Arabic.
- **FR-014**: System MUST flip layout direction to right-to-left when Arabic is active, including form alignment, navigation order, progress indicator direction, and any iconography that has a directional meaning.
- **FR-015**: System MUST persist the user's language preference across reloads and apply it from first paint (no flash of opposite direction).
- **FR-016**: System MUST preserve all entered data when the user switches language mid-wizard.
- **FR-017**: System MUST accept either Arabic-Indic digits or Latin digits for numeric input fields and store the value in a single canonical form.

#### Landing page upgrade

- **FR-018**: System MUST present a public landing page that states what Spotter is in one sentence, offers a primary call-to-action that leads to the wizard, links to the public source repository, and includes a single line affirming privacy / local-only data.
- **FR-019**: Landing page MUST route to the wizard if the user has no saved profile, and to the user's existing profile view if a profile already exists.

#### Voice & accessibility

- **FR-020**: All copy in the wizard MUST follow the documented voice (knowledgeable, warm, technical, never chatty; empty states are invitational; errors are human; confirmations are brief).
- **FR-021**: Every interactive control MUST be reachable and operable without a mouse, with visible focus indicators on every focusable element.
- **FR-022**: Touch targets in the wizard MUST be sized so that a thumb can hit any actionable control without precision (industry baseline: ≥ 44 × 44 logical pixels per control).
- **FR-023**: Color MUST never be the sole signal for state (e.g., field error must also have an icon and / or label change, not only a color shift).

### Key Entities

- **Profile**: A single record per device representing the human using the app. Fields cover identity, body composition, training goal, experience, weekly schedule, equipment access, injuries, language preferences, and coach-tone preference. The profile is the root of every later feature (plan generation, prompt building, session logging) so its shape is locked early.
- **Profile completeness state**: A derived view over the profile that reports which optional fields are unfilled and what percentage of the optional surface is complete. Not a stored entity; recalculated on read.

The wider data model documented in the project's plan (LibraryExercise, UserExercisePreference, CustomExercise, WorkingWeight, Plan, Block, TrainingDay, PlannedExercise, Session, SetLog, ExportPayload) is established as part of P1's foundation work but is not exercised by the wizard in P1. P1 lays the schema and the persistence layer for those entities so subsequent phases can compose against them without schema rework.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can complete the wizard end-to-end in under four minutes on a phone, without external help.
- **SC-002**: 100% of profiles successfully saved through the wizard are still present and unchanged after a hard browser reload.
- **SC-003**: 100% of in-progress wizard sessions resume at the user's last reached step on the next visit, with previously entered values intact, when the same device and browser are used.
- **SC-004**: Switching the wizard language mid-session loses zero entered values, in either direction.
- **SC-005**: A user who skips every optional field still completes the wizard and sees a profile-completeness indicator under 100% with a polite, non-blocking invitation to fill in the rest.
- **SC-006**: All wizard steps, in both English and Arabic, pass an independent accessibility check for keyboard reachability, focus visibility, color-independent state communication, and minimum touch-target sizing.
- **SC-007**: When local persistence is unavailable, no user reaches a state where the app falsely claims their profile was saved.
- **SC-008**: A user can find and edit any previously entered field after wizard completion in three taps or fewer from the post-setup view.

## Assumptions

- The product remains entirely local-first during P1: there is no sign-in, no account, no synchronization. The "user" is anonymous to anyone outside their device.
- The user accesses Spotter from a modern mobile or desktop browser. Browsers that do not support persistent local storage are out of scope.
- A single profile per device is sufficient for v1. Multiple profiles, profile sharing, and cross-device portability are out of scope for P1 (export / import lands later).
- The wider data model (library, plans, sessions, set logs) is shaped in P1's foundation work so later phases can build on it without schema rework, but no UI exercises those entities during P1.
- The coach-personality preference is the closed three-option set Encouraging / Direct / Technical. Each maps to a distinct AI prompt-template variant in P3 (the AI bridge). Adding a fourth option later is an additive schema change, not a breaking one.
- Default unit system is metric. Imperial unit support is implemented as an explicit toggle in the wizard so users in imperial-default regions can switch once and have all subsequent numeric fields render in their chosen system.
