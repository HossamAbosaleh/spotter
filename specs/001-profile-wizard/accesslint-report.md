# AccessLint Report — Profile Wizard (T052)

- **Date:** 2026-07-22
- **Type:** Code-level static audit. No live browser, no rendered-pixel contrast sampling, no keyboard walk on a running build. Findings are inferred from source, tokens, and ARIA wiring.
- **Tool:** Impeccable `/audit` (5-dimension technical rubric), standing in for AccessLint, which is not installed in this environment.
- **Scope:** `src/components/profile/**` (wizard, 6 steps, completeness-indicator, section-row/formatters, dialogs, profile-guard), `src/pages/{Setup,Profile,Landing}.tsx`, `src/i18n/useDirection.ts`, `src/utils/digits.ts`, `src/lib/format.ts`, and the shared `src/components/ui/` primitives those files import (Button, Input, Textarea, Label, RadioGroup, Checkbox, Select, Slider, Progress, Card, Toast, AlertDialog, Form, PersistenceBanner). Supporting reads: `src/App.tsx`, `src/styles/globals.css`, `tailwind.config.ts`.

---

## Audit Health Score

| #         | Dimension                               | Score       | Key Finding                                                                                                                                                                 |
| --------- | --------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Accessibility                           | 3 / 4       | Validation errors are wired to `aria-describedby` but never announced live (no `role="alert"`/`aria-live`); radio/checkbox group labels are not programmatically associated |
| 2         | Performance                             | 3 / 4       | Lean; `Progress` animates `width` (layout property, banned by DESIGN §3.6); `StepReview` re-renders on every keystroke via `form.watch()`                                   |
| 3         | Theming                                 | 3 / 4       | Spotter tokens used consistently, but a full dead shadcn OKLCH light/dark var system ships unused and `.dark` is never applied                                              |
| 4         | Responsive Design                       | 3 / 4       | Strong mobile-first; a few functional controls fall below the 44px touch target (`size="sm"` buttons, toast close/action)                                                   |
| 5         | Code Quality (Implementation Integrity) | 3 / 4       | Coherent, product-specific system; dead `StepPlaceholder` scaffold carries a hardcoded English string and several stale "placeholder" comments                              |
| **Total** |                                         | **15 / 20** | **Good — address the weak spots in Accessibility before release**                                                                                                           |

**Rating band:** 14–17 Good (address weak dimensions).

---

## Implementation Integrity Verdict — PASS

The implementation expresses a coherent, product-specific system, not a generic template. Evidence:

- Consistent Spotter token vocabulary across every primitive (`bg-bg-surface`, `text-text-muted`, `accent-primary`, `border-border-hover`), matching DESIGN.md §3.
- Deliberate athletic identity: mono uppercase-tracked captions for the `/setup` and `/profile` route labels and the wizard step label, Bebas-Neue display headings, lime focus identity carried across Button/Input/Textarea/Select/Radio/Checkbox/Slider.
- Domain-correct composition: single shared `react-hook-form` instance via `FormProvider`, shadcn `Form*` primitives, Zod resolver — exactly the "THE pattern" the design system mandates.
- Genuine bilingual/RTL effort: logical properties throughout, `Direction.DirectionProvider` mounted at root, Arabic-Indic digit normalization (`digits.ts`), `Intl.ListFormat` for locale-aware day conjunctions, EN/AR string parity (341/341).

It does not read as any of the anti-anchors (Strong/Hevy, purple-blue AI slop, SaaS dashboard). The only integrity deductions are leftover scaffolding, not systemic drift.

---

## Executive Summary

- **Audit Health Score: 15 / 20 (Good).**
- **Issue counts:** P0: 0 · P1: 2 · P2: 7 · P3: 8.
- **Top issues:**
  1. **(P1, A11y)** Form validation errors are not announced to assistive tech. `FormMessage` renders plain `<p>` with no `role="alert"`/`aria-live`; DESIGN.md §7 explicitly requires "Errors announced via aria-live regions."
  2. **(P1, A11y/i18n)** Numeric-field validation messages are Zod's untranslated English strings. An Arabic (RTL) user who enters an out-of-range age/height/weight sees an English error — a bilingual-first-class violation (DESIGN §2.5).
  3. **(P2, A11y)** RadioGroup/Checkbox-group container has no accessible name. `FormLabel htmlFor={formItemId}` targets the Radix `radiogroup` div, which `<label for>` cannot name, so screen readers announce the group ("Sex", "Goal", "Experience", "Equipment", "Language", "Units", "Coach") without its label.
  4. **(P2, A11y/Theming)** Informational text rendered in `text-text-dim` (#555 ≈ 2.4:1 on canvas) — the wizard "Saved." autosave state and the four Landing capability badges. DESIGN §3.1 marks `text.dim` decorative-only, never information.
  5. **(P2, Perf)** `Progress` animates `width`, a layout-triggering property DESIGN §3.6 bans ("Never animate `width`… they trigger layout and stutter on mid-tier mobile").
- **Recommended next steps:** run `/impeccable harden` for the two P1 a11y gaps and the group-labeling and touch-target set, then `/impeccable optimize` for the Progress animation, then `/impeccable polish` to sweep the P3 residue (dead scaffold, stale comments, dead theme vars).

---

## Detailed Findings by Severity

### P1 — Major (fix before release)

#### [P1] Validation errors are not announced to assistive technology

- **Location:** `src/components/ui/form.tsx:166-188` (`FormMessage`); consumed by every step field.
- **Category:** Accessibility
- **Impact:** On `onBlur` validation, the error text appears visually and is linked via `aria-describedby`, but there is no live region, so a screen-reader user who has already moved focus past the field is never told the field is invalid. They discover it only on the next focus or on a failed submit.
- **WCAG/Standard:** WCAG 2.1 AA 4.1.3 Status Messages; DESIGN.md §7 ("Errors announced via aria-live regions").
- **Recommendation:** Give `FormMessage` `role="alert"` (or wrap in an `aria-live="assertive"`/`"polite"` region that is always mounted). Because the element mounts only when an error exists, `role="alert"` is the simplest reliable fix.

#### [P1] Numeric validation messages are untranslated English

- **Location:** `src/components/profile/steps/step-body-goal.tsx:145-149` (documented in-code), `NumericInput`; `src/components/profile/steps/step-identity.tsx` `AgeInput`. Root cause: Zod schema uses default English messages surfaced verbatim by `FormMessage`.
- **Category:** Accessibility / i18n
- **Impact:** Arabic UI users (RTL, Cairo font) receive English error strings for age/height/bodyweight range and invalid-number errors, breaking the bilingual contract and leaving RTL readers with LTR English mid-form.
- **WCAG/Standard:** WCAG 3.3.1/3.3.3 (error identification/suggestion in the page language); DESIGN.md §2.5, §5.3 ("No hardcoded strings … even 'OK'").
- **Recommendation:** Localize schema messages (Zod `errorMap` keyed to i18n) or map error codes to `t()` keys in the field wrappers before passing to `FormMessage`.

### P2 — Minor (fix in next pass)

#### [P2] Radio/checkbox group has no programmatic label

- **Location:** `src/components/ui/form.tsx:119-151` (`FormLabel`/`FormControl`); every `RadioGroup` step (`step-identity.tsx:86-114`, `step-body-goal.tsx:90-133`, `step-experience-schedule.tsx:62-98`, `step-equipment-limitations.tsx:59-95`, `step-language-coach.tsx:67-184`) and the `PreferredDaysField` checkbox group.
- **Category:** Accessibility
- **Impact:** `FormLabel` uses `htmlFor={formItemId}`, and `FormControl` forwards that id onto the Radix `role="radiogroup"` div. `<label for>` only names labelable form controls, not a group div, so the group is announced without "Sex"/"Goal"/etc. Individual radios keep their own labels, but the grouping prompt is lost.
- **WCAG/Standard:** WCAG 1.3.1, 4.1.2 (Name, Role, Value).
- **Recommendation:** Add `aria-labelledby` on the group pointing at the label's element id (give `FormLabel` a stable id and stop relying on `htmlFor` for group controls), or wrap groups in `<fieldset><legend>`.

#### [P2] Informational text uses decorative-only `text-dim` (contrast ≈ 2.4:1)

- **Location:** `src/components/profile/wizard.tsx:300-302` (autosave "Saved." → `text-text-dim`); `src/pages/Landing.tsx:45-58` (four capability badges container `text-body-sm text-text-dim`).
- **Category:** Accessibility / Theming
- **Impact:** `#555555` on `#0d0d0f` is ~2.4:1, below the 4.5:1 AA floor for the 13px text used. The Landing badges ("No server", "Free forever", "Open source", "All data local") are substantive positioning copy, not decoration; the "Saved." confirmation is informational.
- **WCAG/Standard:** WCAG 1.4.3 Contrast (Minimum); DESIGN.md §3.1 (`text.dim` "MUST NOT carry information the user needs to read").
- **Recommendation:** Use `text-text-muted` (#888, 4.6:1 AA-pass) for both. Reserve `text-dim` for the decorative `◦` bullets (correct usage in `completeness-indicator.tsx:91`).

#### [P2] `Progress` animates `width` (layout property)

- **Location:** `src/components/ui/progress.tsx:45` (`transition-[width]`), fill set via inline `style={{ width }}`.
- **Category:** Performance
- **Impact:** Animating `width` triggers layout on each step advance; DESIGN §3.6 bans it in favor of `transform`. Low visible cost here (thin bar), but it is a documented anti-pattern and a mid-tier-mobile stutter risk if reused on larger bars.
- **Recommendation:** Keep the RTL-correct approach but animate `transform: scaleX()` with `transform-origin: inline-start` instead of `width`; or accept the trade-off and note the exception in the component docstring.

#### [P2] Wizard step titles are not headings

- **Location:** `src/components/ui/card.tsx:50-61` (`CardTitle` renders a `<div>`); used as the per-step title in all six steps and in Setup recovery cards.
- **Category:** Accessibility
- **Impact:** Each wizard step's title is the primary "where am I" cue, but it is a `<div>`, so screen-reader users cannot navigate steps by heading and there is no `h2` under the page `h1`. `CompletenessIndicator` correctly uses `<h2>`, and `AlertDialogTitle` is a real heading — the inconsistency makes the wizard the weak spot.
- **WCAG/Standard:** WCAG 1.3.1; DESIGN.md §7 ("Heading hierarchy correct").
- **Recommendation:** Allow `CardTitle` to render `as="h2"` (or render step titles through a heading), keeping one `h1` per page and `h2` for step/section titles.

#### [P2] Live region for autosave status is conditionally mounted

- **Location:** `src/components/profile/wizard.tsx:293-308`.
- **Category:** Accessibility
- **Impact:** The `aria-live="polite"` paragraph is only in the DOM when `autosaveStatus !== 'idle'`. Several screen readers do not announce a live region that is inserted together with its content; the region should pre-exist and only its text should change. "Saving…/Saved." may go unspoken.
- **Recommendation:** Render the live region container unconditionally and toggle only its text content.

#### [P2] Functional buttons below the 44px touch target

- **Location:** `src/components/ui/persistence-banner.tsx:102-104` (`Button size="sm"` → `h-8`, 32px); `src/components/ui/toast.tsx:117` (`ToastAction` `min-h-9`, 36px) and `:142` (`ToastClose` `size-8`, 32px).
- **Category:** Responsive / Accessibility
- **Impact:** The persistence acknowledge button is a primary decision control in degraded-storage mode yet is 32px tall on a phone-first surface, under the ≥44px constitution rule (DESIGN §2.6). Toast controls are transient but still tappable affordances under 44px.
- **WCAG/Standard:** WCAG 2.5.5 (AAA) / 2.5.8 (AA Target Size, 24px min — passes AA but fails Spotter's own 44px bar).
- **Recommendation:** Use `size="default"` (min-h-11) for the persistence acknowledge button; consider padding the toast close hitbox to 44px even if the icon stays 16px.

#### [P2] Bidi: mono numerals in review summaries are not isolated with `dir="ltr"`

- **Location:** `src/components/profile/section-formatters.tsx:57` (`formatBodyGoal` → `"180 cm, 80 kg, …"`), and `formatExperienceSchedule`/`formatIdentity` string joins; rendered in `step-review.tsx` and `Profile.tsx`.
- **Category:** Accessibility / i18n (RTL)
- **Impact:** `lib/format.ts` explicitly instructs wrapping numerics in `<span dir="ltr">` in RTL contexts, but the review/profile summaries concatenate Latin numbers, units, and Arabic labels into one bare string. Under `dir="rtl"` the number+unit sequences can reorder (bidi), e.g. displaying units before values or splitting "180 cm".
- **Recommendation:** Emit the numeric+unit fragments inside `<bdi>` or `<span dir="ltr">` in the formatter output, or format via a component rather than a plain string join.

### P3 — Polish

#### [P3] Global reduced-motion rule is a blanket 0.01ms kill

- **Location:** `src/styles/globals.css:141-150`.
- **Category:** Accessibility
- **Impact:** The rubric flags a global `0.01ms` override as destroying useful feedback. DESIGN §3.6 wants reduced motion to "preserve state change and hierarchy" (e.g. true progress meters like `RestTimer` should still animate). The blanket rule also nukes the wizard `Progress` transition. Acceptable for the wizard today, but the pattern will over-suppress once the timer ships.
- **Recommendation:** Scope exceptions for true progress meters; keep instantaneous state changes but allow the sanctioned progress-fill.

#### [P3] Dead scaffold with a hardcoded English string

- **Location:** `src/components/profile/wizard.tsx:417-432` (`StepPlaceholder`), reachable-branch guard at `:194`.
- **Category:** Code Quality / i18n
- **Impact:** All six steps are mapped in `STEP_COMPONENTS`, so `StepPlaceholder` is dead code, yet it renders a hardcoded, untranslated `"Step X placeholder. The real step component lands in T0…"` string — a direct "no hardcoded strings" violation if it ever renders.
- **Recommendation:** Delete `StepPlaceholder` and the `stepHasRealFields` guard now that steps 1–6 exist.

#### [P3] Stale "placeholder / logs to console" comments

- **Location:** `src/components/profile/steps/step-review.tsx:43-46` (claims Confirm "logs to console"; `handleFinish` is fully wired in `wizard.tsx:206-261`).
- **Category:** Code Quality
- **Impact:** Misleading docs for future maintainers.
- **Recommendation:** Update the docstring to reflect the shipped save flow.

#### [P3] Unused shadcn OKLCH theme variables; `.dark` never applied

- **Location:** `src/styles/globals.css:56-88` (light `:root` oklch set) and `:155-187` (`.dark` block); `darkMode: ['class']` in `tailwind.config.ts` but no code adds a `dark` class (verified: no `.dark`/`classList` usage in `src/`).
- **Category:** Theming
- **Impact:** Two parallel token systems ship: the live Spotter hex tokens (Tailwind config) and a dead shadcn OKLCH var system whose light defaults (`--background: white`) never take effect because components reference the hex tokens and `.dark` is never toggled. Confusing and bloats the stylesheet.
- **Recommendation:** Remove the unused shadcn light/dark var blocks, or wire `.dark` intentionally and delete the hex duplication — pick one source of truth.

#### [P3] Pure-black dialog overlay

- **Location:** `src/components/ui/alert-dialog.tsx:42` (`bg-black/60`).
- **Category:** Theming
- **Impact:** DESIGN §3.1/§8 bans pure black; every neutral should be tinted. A 60% scrim is low-risk but off-spec.
- **Recommendation:** Use a tinted scrim token (e.g. canvas at reduced alpha) instead of `bg-black`.

#### [P3] Duplicate labeling around option rows

- **Location:** `step-body-goal.tsx:105-127` and `step-language-coach.tsx:154-178` — the outer `<label htmlFor={id}>` wraps both the inner `<Label htmlFor={id}>` and the description `<p>`.
- **Category:** Accessibility
- **Impact:** The radio ends up with two associated labels and the description text folds into its accessible name, producing verbose announcements ("Strength, Build maximal…"). Not incorrect, but noisy.
- **Recommendation:** Keep the wrapper `<label>` for the touch target but drop the redundant inner `htmlFor`, or move the description out of the labelable region and reference it with `aria-describedby`.

#### [P3] Autosave live announcement fires on every debounced edit

- **Location:** `src/components/profile/wizard.tsx:154-181, 293-308`.
- **Category:** Accessibility
- **Impact:** Combined with the mount issue above, frequent "Saving…/Saved." announcements can be chatty for screen-reader users during typing.
- **Recommendation:** Debounce the announced state or announce only the settled "Saved." transition.

#### [P3] `Select` items and `Slider` thumb under 44px

- **Location:** `src/components/ui/select.tsx:144` (`py-2` items ≈ 40px), `src/components/ui/slider.tsx:87` (20px thumb).
- **Category:** Responsive
- **Impact:** Not used by the wizard today (steps use RadioGroup/Checkbox), but these shared primitives fall under the 44px bar and are documented as such in their own docstrings. Flagged for when they enter a mobile flow.
- **Recommendation:** Revisit item/thumb sizing before adopting either in a phone-critical path.

#### [P3] `ring-offset-background` mismatches card surface

- **Location:** shared focus classes on Button/Input/Textarea/Select/Radio/Checkbox/Slider (e.g. `input.tsx:41`).
- **Category:** Theming (visual polish)
- **Impact:** `ring-offset-background` paints a canvas-dark (#0d0d0f) 2px gap around focused controls that actually sit on a card surface (#161618), so the focus offset ring shows a slightly darker halo than the surface. Cosmetic only; focus visibility (lime ring) is intact.
- **Recommendation:** Consider a surface-aware offset for in-card controls, or accept as negligible.

---

## Patterns & Systemic Issues

- **Error announcement is systemically missing.** The visual error path (destructive border + destructive label + message text — a good non-color-only design) is complete, but the _assistive_ path stops at `aria-describedby`. One `role="alert"` fix in `FormMessage` closes it for every field at once.
- **Group-labeling gap repeats across all six radio/checkbox groups** — a single fix in the `Form` primitive's group handling resolves every occurrence.
- **`text-dim` for information recurs** in at least two surfaces (autosave, Landing badges); worth a lint rule that flags `text-text-dim` on anything other than decorative elements.
- **Two token systems coexist** (live Spotter hex + dead shadcn OKLCH vars). Not harmful today but a drift hazard.

## Positive Findings (keep and replicate)

- **Focus identity is consistent and correct.** Lime `ring-ring` (`#e8ff47`) focus ring is wired uniformly across Button/Input/Textarea/Select/Radio/Checkbox/Slider, with a global `:focus-visible` lime outline fallback and a documented inset-ring escape hatch. No `outline: none` without replacement.
- **Touch targets are handled deliberately** for the wizard's own controls: 20px radio/checkbox visuals wrapped in `min-h-11 cursor-pointer` labels; `Input`/`Textarea`/`Select` at `min-h-11`; default `Button` min-h-11. The pattern is documented in each primitive's docstring.
- **RTL is genuinely first-class:** logical properties throughout, `Direction.DirectionProvider` at root synced to locale, `useDirection` sets `<html lang/dir>`, `Progress` uses `start-0` + width (RTL-safe), directional icons `rtl:rotate-180`, Arabic-Indic digit normalization, and `Intl.ListFormat` day conjunctions.
- **Non-color-only error signaling** (border + label color + message text) satisfies FR-023 / DESIGN §3.1.
- **`PersistenceBanner` is a model a11y component:** `role="alert"`, `aria-live="polite"`, icon `aria-hidden`, message carries the meaning.
- **AlertDialog flows are solid:** Radix title/description association, checkbox-gated destructive delete, `min-h-11` labeled checkbox, focus-trapped, Esc-dismissable.
- **EN/AR string parity (341/341)** with no hardcoded UI strings in the shipping step components.

---

## Recommended Actions (priority order)

1. **[P1] `/impeccable harden`** — add `role="alert"` to `FormMessage`; localize Zod validation messages via i18n; give radio/checkbox groups a programmatic name (`aria-labelledby`/`fieldset`); make the autosave live region persistent; bump the persistence acknowledge button to `min-h-11`.
2. **[P2] `/impeccable optimize`** — switch `Progress` from `width` animation to `transform: scaleX`; reduce `StepReview`'s `form.watch()` re-render surface.
3. **[P2] `/impeccable colorize`** — replace informational `text-text-dim` with `text-text-muted` on the autosave "Saved." state and Landing badges; retint the AlertDialog `bg-black/60` scrim.
4. **[P2] `/impeccable typeset`** — promote wizard step `CardTitle` to a real `h2` and align heading hierarchy across surfaces.
5. **[P3] `/impeccable polish`** — delete the dead `StepPlaceholder` + hardcoded string, correct stale docstrings, remove the unused shadcn OKLCH theme vars, isolate mono numerals with `<bdi>`/`dir="ltr"`, and scope the reduced-motion exception for true progress meters.

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/impeccable audit` after fixes to see your score improve.

---

_Note: This is a code-level pass. Actual contrast ratios were computed from documented token hex values (DESIGN.md §3.1), not sampled from rendered pixels; keyboard order and screen-reader announcements were inferred from ARIA wiring, not verified on a running build. Confirm the P1 items against a live screen reader (VoiceOver/NVDA) and a real AA contrast checker before sign-off._
