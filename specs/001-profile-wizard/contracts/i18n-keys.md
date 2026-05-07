# Contract: i18n keys (P1 additions)

**Branch**: `001-profile-wizard`
**Date**: 2026-05-07

Every string surfaced by the wizard, the upgraded landing page, the profile view, and the persistence banner is keyed. Hardcoded strings are a constitution-IV violation. Both `src/i18n/en.json` and `src/i18n/ar.json` MUST contain every key listed below before any wizard test passes.

The naming convention extends what's already in `en.json`:

- Top-level namespace per surface (`landing`, `wizard`, `profile`, `persistence`).
- Nested object per concern (`wizard.identity.fields.name.label`).
- Field-level keys group `label`, `placeholder`, `helper`, and any field-specific error variants.
- Cross-step error variants live under `wizard.errors.*`.

---

## Top-level shape (informative)

```jsonc
{
  "landing": {
    /* … upgraded copy */
  },
  "persistence": {
    /* … in-memory-mode banner */
  },
  "wizard": {
    "shell": {
      /* … nav, progress, save indicator */
    },
    "identity": {
      /* step 1 */
    },
    "bodyGoal": {
      /* step 2 */
    },
    "experienceSchedule": {
      /* step 3 */
    },
    "equipmentLimitations": {
      /* step 4 */
    },
    "languageCoach": {
      /* step 5 */
    },
    "review": {
      /* step 6 */
    },
    "errors": {
      /* shared validators */
    },
  },
  "profile": {
    "shell": {
      /* post-setup view */
    },
    "completeness": {
      /* indicator copy */
    },
  },
}
```

---

## Landing (upgrade)

| Key                           | EN intent                                 | AR intent                                         |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `landing.valueProp`           | One sentence: what Spotter is.            | Native AR equivalent (not a literal translation). |
| `landing.cta.startSetup`      | "Try it" — primary CTA.                   | AR equivalent.                                    |
| `landing.cta.continueProfile` | "Continue" — shown when a profile exists. | AR equivalent.                                    |
| `landing.privacy`             | One line affirming all-local data.        | AR equivalent.                                    |
| `landing.viewSource`          | "View on GitHub" link label.              | AR equivalent.                                    |

The `phaseLabel` and `nextPhase*` keys from P0 are removed in P1 (they were placeholders for the foundation build).

---

## Persistence banner

| Key                              | EN intent                                                                       | AR intent      |
| -------------------------------- | ------------------------------------------------------------------------------- | -------------- |
| `persistence.banner.private`     | "This is a private window — your answers won't be saved." + "Why?" link.        | AR equivalent. |
| `persistence.banner.disabled`    | "Your browser has storage disabled. Enable it to save." + how-to.               | AR equivalent. |
| `persistence.banner.quota`       | "Your device is out of space — your answers won't save until you free some up." | AR equivalent. |
| `persistence.banner.unknown`     | "We couldn't access local storage. Your answers won't be saved this session."   | AR equivalent. |
| `persistence.banner.acknowledge` | "I understand" button label.                                                    | AR equivalent. |

---

## Wizard shell

| Key                                  | EN intent                                  | AR intent      |
| ------------------------------------ | ------------------------------------------ | -------------- |
| `wizard.shell.title`                 | "Set up your profile"                      | AR equivalent. |
| `wizard.shell.stepLabel`             | "Step {{n}} of {{total}}" — interpolated.  | AR equivalent. |
| `wizard.shell.progress.{1..6}.label` | Per-step short label for the progress bar. | AR equivalent. |
| `wizard.shell.next`                  | "Next"                                     | AR equivalent. |
| `wizard.shell.back`                  | "Back"                                     | AR equivalent. |
| `wizard.shell.finish`                | "Finish"                                   | AR equivalent. |
| `wizard.shell.savedIndicator`        | "Saved." (toast).                          | AR equivalent. |
| `wizard.shell.savingIndicator`       | "Saving…" (toast).                         | AR equivalent. |
| `wizard.shell.startFresh.cta`        | "Start fresh" link in edit mode.           | AR equivalent. |
| `wizard.shell.startFresh.confirm`    | Confirm dialog body.                       | AR equivalent. |
| `wizard.shell.languageSwitch.aria`   | aria-label on the language toggle.         | AR equivalent. |

---

## Step 1 — Identity

| Key                                                 | EN intent                                                                      | AR intent      |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | -------------- |
| `wizard.identity.title`                             | "About you"                                                                    | AR equivalent. |
| `wizard.identity.subtitle`                          | One-sentence framing.                                                          | AR equivalent. |
| `wizard.identity.fields.name.label`                 | "Name"                                                                         | AR equivalent. |
| `wizard.identity.fields.name.placeholder`           | "What should we call you?"                                                     | AR equivalent. |
| `wizard.identity.fields.age.label`                  | "Age"                                                                          | AR equivalent. |
| `wizard.identity.fields.age.helper`                 | "Used to scale recommendations."                                               | AR equivalent. |
| `wizard.identity.fields.sex.label`                  | "Sex"                                                                          | AR equivalent. |
| `wizard.identity.fields.sex.options.male`           | "Male"                                                                         | AR equivalent. |
| `wizard.identity.fields.sex.options.female`         | "Female"                                                                       | AR equivalent. |
| `wizard.identity.fields.sex.options.preferNotToSay` | "Prefer not to say"                                                            | AR equivalent. |
| `wizard.identity.fields.sex.helper`                 | "Used for working-weight defaults. 'Prefer not to say' uses neutral defaults." | AR equivalent. |

---

## Step 2 — Body & Goal

| Key                                                  | EN intent                                              | AR intent      |
| ---------------------------------------------------- | ------------------------------------------------------ | -------------- |
| `wizard.bodyGoal.title`                              | "Body & goal"                                          | AR equivalent. |
| `wizard.bodyGoal.fields.height.label`                | "Height"                                               | AR equivalent. |
| `wizard.bodyGoal.fields.height.unit.metric`          | "cm"                                                   | "سم".          |
| `wizard.bodyGoal.fields.height.unit.imperial`        | "in"                                                   | AR equivalent. |
| `wizard.bodyGoal.fields.bodyweight.label`            | "Bodyweight"                                           | AR equivalent. |
| `wizard.bodyGoal.fields.bodyweight.unit.metric`      | "kg"                                                   | "كجم".         |
| `wizard.bodyGoal.fields.bodyweight.unit.imperial`    | "lb"                                                   | AR equivalent. |
| `wizard.bodyGoal.fields.goal.label`                  | "What are you training for?"                           | AR equivalent. |
| `wizard.bodyGoal.fields.goal.options.strength`       | "Strength"                                             | AR equivalent. |
| `wizard.bodyGoal.fields.goal.options.hypertrophy`    | "Hypertrophy"                                          | AR equivalent. |
| `wizard.bodyGoal.fields.goal.options.fatLoss`        | "Fat loss"                                             | AR equivalent. |
| `wizard.bodyGoal.fields.goal.options.recomposition`  | "Recomposition"                                        | AR equivalent. |
| `wizard.bodyGoal.fields.goal.options.generalFitness` | "General fitness"                                      | AR equivalent. |
| `wizard.bodyGoal.fields.goal.descriptions.{enum}`    | One-line description per option (helps the user pick). | AR equivalent. |

---

## Step 3 — Experience & Schedule

| Key                                                                | EN intent                          | AR intent      |
| ------------------------------------------------------------------ | ---------------------------------- | -------------- |
| `wizard.experienceSchedule.title`                                  | "How you train"                    | AR equivalent. |
| `wizard.experienceSchedule.fields.experience.label`                | "Experience level"                 | AR equivalent. |
| `wizard.experienceSchedule.fields.experience.options.novice`       | "Novice (less than 1 year)"        | AR equivalent. |
| `wizard.experienceSchedule.fields.experience.options.intermediate` | "Intermediate (1–3 years)"         | AR equivalent. |
| `wizard.experienceSchedule.fields.experience.options.advanced`     | "Advanced (3+ years)"              | AR equivalent. |
| `wizard.experienceSchedule.fields.preferredDays.label`             | "Which days do you usually train?" | AR equivalent. |
| `wizard.experienceSchedule.fields.preferredDays.options.{day}`     | Localized day name.                | AR equivalent. |

---

## Step 4 — Equipment & Limitations

| Key                                                                   | EN intent                                                    | AR intent      |
| --------------------------------------------------------------------- | ------------------------------------------------------------ | -------------- |
| `wizard.equipmentLimitations.title`                                   | "Equipment & limitations"                                    | AR equivalent. |
| `wizard.equipmentLimitations.fields.equipment.label`                  | "What do you have access to?"                                | AR equivalent. |
| `wizard.equipmentLimitations.fields.equipment.options.commercialGym`  | "Commercial gym (full equipment)"                            | AR equivalent. |
| `wizard.equipmentLimitations.fields.equipment.options.homeFull`       | "Home gym (rack + barbell + plates)"                         | AR equivalent. |
| `wizard.equipmentLimitations.fields.equipment.options.homeMinimal`    | "Home minimal (dumbbells / bands / kettlebell)"              | AR equivalent. |
| `wizard.equipmentLimitations.fields.equipment.options.bodyweightOnly` | "Bodyweight only"                                            | AR equivalent. |
| `wizard.equipmentLimitations.fields.equipmentNotes.label`             | "Notes (optional)"                                           | AR equivalent. |
| `wizard.equipmentLimitations.fields.equipmentNotes.placeholder`       | "Anything specific about your setup?"                        | AR equivalent. |
| `wizard.equipmentLimitations.fields.injuries.label`                   | "Injuries or movement limitations (optional)"                | AR equivalent. |
| `wizard.equipmentLimitations.fields.injuries.placeholder`             | "Anything we should keep in mind?"                           | AR equivalent. |
| `wizard.equipmentLimitations.fields.injuries.helper`                  | "Stays on this device. Used to filter exercise suggestions." | AR equivalent. |

---

## Step 5 — Language & Coach

| Key                                                     | EN intent                  | AR intent      |
| ------------------------------------------------------- | -------------------------- | -------------- |
| `wizard.languageCoach.title`                            | "How Spotter talks to you" | AR equivalent. |
| `wizard.languageCoach.fields.language.label`            | "Language"                 | "اللغة".       |
| `wizard.languageCoach.fields.language.options.en`       | "English"                  | "الإنجليزية".  |
| `wizard.languageCoach.fields.language.options.ar`       | "Arabic"                   | "العربية".     |
| `wizard.languageCoach.fields.units.label`               | "Units"                    | "الوحدات".     |
| `wizard.languageCoach.fields.units.options.metric`      | "Metric (kg, cm)"          | AR equivalent. |
| `wizard.languageCoach.fields.units.options.imperial`    | "Imperial (lb, in)"        | AR equivalent. |
| `wizard.languageCoach.fields.coach.label`               | "Coaching tone"            | AR equivalent. |
| `wizard.languageCoach.fields.coach.options.encouraging` | "Encouraging"              | AR equivalent. |
| `wizard.languageCoach.fields.coach.options.direct`      | "Direct"                   | AR equivalent. |
| `wizard.languageCoach.fields.coach.options.technical`   | "Technical"                | AR equivalent. |
| `wizard.languageCoach.fields.coach.descriptions.{enum}` | One-line tone description. | AR equivalent. |

---

## Step 6 — Review

| Key                                      | EN intent                             | AR intent      |
| ---------------------------------------- | ------------------------------------- | -------------- |
| `wizard.review.title`                    | "Look right?"                         | AR equivalent. |
| `wizard.review.subtitle`                 | "Tap any field to edit."              | AR equivalent. |
| `wizard.review.editAria`                 | "Edit {{field}}" — interpolated.      | AR equivalent. |
| `wizard.review.confirmCta`               | "Save my profile"                     | AR equivalent. |
| `wizard.review.additionalContext.label`  | "Anything else? (optional)"           | AR equivalent. |
| `wizard.review.additionalContext.helper` | "Goes into the AI prompt as context." | AR equivalent. |

---

## Errors (shared)

| Key                                   | EN intent                                                               | AR intent      |
| ------------------------------------- | ----------------------------------------------------------------------- | -------------- |
| `wizard.errors.required`              | "This field is required."                                               | AR equivalent. |
| `wizard.errors.numeric`               | "Enter a number."                                                       | AR equivalent. |
| `wizard.errors.outOfRange.age`        | "Age must be between 13 and 100."                                       | AR equivalent. |
| `wizard.errors.outOfRange.height`     | "Height must be between 120 and 230 cm." (units localized at render)    | AR equivalent. |
| `wizard.errors.outOfRange.bodyweight` | "Bodyweight must be between 30 and 250 kg." (units localized at render) | AR equivalent. |
| `wizard.errors.tooLong`               | "Please keep this under {{max}} characters."                            | AR equivalent. |
| `wizard.errors.atLeastOneDay`         | "Pick at least one day."                                                | AR equivalent. |
| `wizard.errors.saveFailed.quota`      | "We couldn't save — your device is out of space."                       | AR equivalent. |
| `wizard.errors.saveFailed.unknown`    | "We couldn't save right now. Try again, or reload the page."            | AR equivalent. |
| `wizard.errors.corruptProfile.title`  | "Your profile data couldn't be read."                                   | AR equivalent. |
| `wizard.errors.corruptProfile.body`   | "You can start fresh — this overwrites the existing record."            | AR equivalent. |
| `wizard.errors.corruptProfile.cta`    | "Start fresh"                                                           | AR equivalent. |

---

## Profile (post-setup view)

| Key                                                                                    | EN intent                                                         | AR intent                                                             |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `profile.shell.title`                                                                  | "Your profile"                                                    | AR equivalent.                                                        |
| `profile.shell.editCta`                                                                | "Edit profile"                                                    | AR equivalent.                                                        |
| `profile.shell.startFreshCta`                                                          | "Start fresh"                                                     | AR equivalent.                                                        |
| `profile.completeness.title`                                                           | "Profile completeness"                                            | AR equivalent.                                                        |
| `profile.completeness.percent`                                                         | "{{percent}}%"                                                    | AR equivalent (Arabic-Indic digits if `language.preferred === 'ar'`). |
| `profile.completeness.invitation`                                                      | "A few optional details left — they help the AI coach calibrate." | AR equivalent.                                                        |
| `profile.completeness.complete`                                                        | "All set."                                                        | AR equivalent.                                                        |
| `profile.completeness.missingFields.{equipmentNotes \| injuries \| additionalContext}` | Field-name labels for the nudge.                                  | AR equivalent.                                                        |

---

## Voice constraints (apply across all keys)

- No em dashes (DESIGN.md §6.6).
- No exclamation marks except in success confirmations.
- Errors are specific and human (e.g., "Enter a number" beats "Invalid input").
- Confirmations are brief ("Saved." not "Your changes have been saved.").
- AR copy is native, not literal — handled at translation time, not by the developer.
- Bilingual: every key MUST have a corresponding entry in both `en.json` and `ar.json`. A unit test (`tests/unit/i18n-parity.test.ts`) MUST fail if any key exists in one file but not the other.
