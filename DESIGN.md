# Spotter — Design System

> **Status:** Starter document, locked decisions only. To be expanded by `/impeccable teach` during Phase P0.5. The fully refined version replaces this one when P0.5 ships.
>
> **How to use this document:** Read it before contributing UI to Spotter. It is the source of truth for design decisions. The `spotter-design` skill in `.claude/skills/spotter-design/SKILL.md` references this document for runtime guidance.

---

## 1. Identity

**Spotter** is the bridge between a lifter and their AI coach.

The name comes from the gym metaphor: a spotter watches your set, knows your limits, and steps in when you need a hand. That is what this app does — between you and whichever AI you trust to coach you.

**Tagline:** Your gym, your data, your AI coach.

**Tone:** Technical but approachable. Confident but not arrogant. Knowledgeable but not pedantic. The voice of a friend who lifts and happens to be deep into AI tools.

**Visual character:** Dark, precise, athletic. AI-native without being a parody of AI-native (no purple-blue gradients, no excessive sparkles). The visual language signals "this is a serious tool built by someone who actually trains."

---

## 2. Design Principles

These are the principles that govern every visual and interaction decision. When in doubt, return here.

### 2.1 Honesty over decoration

Every element earns its place. No icon for the sake of icons. No animation for the sake of animation. No card wrapping a card wrapping a card. If something is decorative, it is purposeful decoration; if something is functional, it is unmistakably functional.

### 2.2 Data is precise; presentation is human

Numbers and units are precise: `4 × 8 @ 80kg RPE 7` — no fuzzing, no rounding for aesthetics. The presentation around the data — labels, empty states, errors, confirmations — is human and conversational.

### 2.3 The user owns their data, visibly

Privacy is not an afterthought; it is a design feature. The "Your Data" page exists. The "All your data stays on your device" line is in the footer of the landing page. Export and delete are one tap away. The product looks and feels like the user is in control because they are.

### 2.4 AI is transparent, not magical

AI-generated or AI-suggested content is marked with the `AIBadge` primitive. Users always know what came from AI and what came from them. No hidden AI generation, no unmarked suggestions.

### 2.5 Bilingual is a first-class concern

Arabic and English are equally supported. RTL layout is verified on every screen. The Arabic copy is native, not translated; the English copy is clear, not over-engineered. Neither is treated as the default with the other as a translation.

### 2.6 Mobile is the primary surface

The gym is on a phone. Every interaction is designed for thumbs first, mouse second. Touch targets are at least 44px. Forms are big and tappable. Modals respect the keyboard. Desktop is _also_ great, but it is not the primary design target.

---

## 3. Design Tokens

### 3.1 Color

All colors are defined in `tailwind.config.ts` as semantic tokens. Use the semantic name in code, not the hex value.

#### Surface colors

| Token            | Value     | Usage                                      |
| ---------------- | --------- | ------------------------------------------ |
| `bg.canvas`      | `#0d0d0f` | Deepest background (body, page background) |
| `bg.surface`     | `#161618` | Card surface, default container background |
| `bg.elevated`    | `#1c1c1f` | Elevated cards, popovers, modals           |
| `border.default` | `#2a2a2e` | Standard separator                         |
| `border.muted`   | `#1f1f22` | Barely-there separator                     |

#### Text colors

| Token          | Value     | Usage                           |
| -------------- | --------- | ------------------------------- |
| `text.primary` | `#f0f0f0` | Body text, headings             |
| `text.muted`   | `#888`    | Secondary text, captions        |
| `text.dim`     | `#555`    | Tertiary, disabled, very subtle |

#### Accent colors

| Token              | Value       | Usage                                                                  |
| ------------------ | ----------- | ---------------------------------------------------------------------- |
| `accent.primary`   | `#e8ff47`   | Top sets, primary CTAs, key actions                                    |
| `accent.secondary` | `#ff6b35`   | Metabolic sets, warnings, secondary emphasis                           |
| `ai.indicator`     | TBD in P0.5 | Marks AI-generated content (single signature color or subtle gradient) |

#### Semantic state colors

| Token     | Value                                    | Usage                                   |
| --------- | ---------------------------------------- | --------------------------------------- |
| `success` | TBD                                      | Saved confirmations, completed sessions |
| `warning` | `#ff6b35` (shared with accent.secondary) | Calibration weights, deload due         |
| `error`   | TBD                                      | Validation errors, failed actions       |
| `info`    | TBD                                      | Notifications, hints                    |

(TBD values are filled in during P0.5 by `/impeccable teach`.)

#### Banned colors and patterns

- **Pure black** (`#000`) and **pure gray** — always tinted, even subtly
- **Purple-to-blue gradients** — the AI-slop signature, explicitly forbidden
- **High-saturation colors as backgrounds** — saturation is reserved for accents
- **Color-only state differentiation** — every color-coded state must also have an icon, label, or shape change for accessibility

### 3.2 Typography

#### Type families

| Family         | Font                           | Usage                                                  |
| -------------- | ------------------------------ | ------------------------------------------------------ |
| Display        | Bebas Neue                     | Large headers, hero, exercise names, athletic identity |
| Body (English) | DM Sans                        | All English UI text                                    |
| Body (Arabic)  | Cairo                          | All Arabic UI text                                     |
| Mono           | JetBrains Mono (or Geist Mono) | Data values: weights, reps, RPE, set counts            |

#### Banned fonts (per Impeccable anti-patterns)

- Inter, Roboto, system-ui, Arial, Space Grotesk
- Any "default" font Claude reaches for without intent

#### Type scale

To be fully defined in P0.5 by `/impeccable teach`. Starter hierarchy:

| Use            | Approx. size (mobile / desktop) | Family          |
| -------------- | ------------------------------- | --------------- |
| Display large  | 40 / 56px                       | Bebas Neue      |
| Display medium | 32 / 40px                       | Bebas Neue      |
| H1             | 24 / 32px                       | Bebas Neue      |
| H2             | 20 / 24px                       | Bebas Neue      |
| Body large     | 16 / 18px                       | DM Sans / Cairo |
| Body           | 15 / 16px                       | DM Sans / Cairo |
| Body small     | 13 / 14px                       | DM Sans / Cairo |
| Caption        | 12 / 13px                       | DM Sans / Cairo |
| Mono large     | 18 / 20px                       | Mono            |
| Mono           | 14 / 15px                       | Mono            |

### 3.3 Spacing

4px base scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

In Tailwind: `space-1` through `space-24`. Avoid arbitrary values (`space-[7px]` etc.) unless absolutely necessary.

**Component padding defaults:**

- Card: `p-4` (16px)
- Modal/dialog: `p-6` (24px)
- Page section: `py-8` (32px) on mobile, `py-12` (48px) on desktop
- Form field gap: `gap-4` (16px)

### 3.4 Radii

| Token         | Value | Usage                              |
| ------------- | ----- | ---------------------------------- |
| `radius.sm`   | 8px   | Small elements, badges, pills      |
| `radius.md`   | 12px  | Inputs, secondary buttons          |
| `radius.lg`   | 16px  | Cards, modals, primary surfaces    |
| `radius.pill` | 999px | Pills, fully-rounded badges, chips |

### 3.5 Shadows

To be fully defined in P0.5. Starter hierarchy: `subtle` (cards in dark mode use border instead), `card` (light elevation), `elevated` (modal/popover), `floating` (highest priority overlays).

Dark mode prefers borders to shadows (shadows on dark surfaces are nearly invisible). Use the `border.default` token to delineate elevation, not shadow blur.

### 3.6 Motion

| Token                 | Duration | Easing     | Usage                                     |
| --------------------- | -------- | ---------- | ----------------------------------------- |
| `motion.micro`        | 150ms    | standard   | Hover states, focus rings, micro-feedback |
| `motion.standard`     | 200ms    | standard   | Most transitions, modal open/close        |
| `motion.emphasized`   | 300ms    | emphasized | Page transitions, drawer slide-ins        |
| `motion.orchestrated` | 500ms    | emphasized | Hero reveals, page-load staggers          |

**Easings:**

- `standard`: `cubic-bezier(0.4, 0, 0.2, 1)` — most things
- `emphasized`: `cubic-bezier(0.16, 1, 0.3, 1)` — emphasized exits/reveals

**Banned easings:**

- Bounce, elastic, overshoot — feel dated, signal AI slop

**Reduced motion:** All animations respect `prefers-reduced-motion: reduce`. Either skip the animation entirely or shorten to <100ms.

---

## 4. Component System

### 4.1 Foundation: shadcn/ui

Spotter's component foundation is shadcn/ui. shadcn is **not a library** — it is a set of accessible, headless component implementations that you copy into your project and own. We customize each shadcn primitive with our design tokens during P0.5.

**Where shadcn primitives live:** `src/components/ui/`

**Primitives we install:** Button, Input, Label, Textarea, Select, Checkbox, Radio Group, Slider, Dialog, Drawer, Sheet, Toast, Badge, Card, Tabs, Accordion, Tooltip, Popover, Progress, Alert, Form (with react-hook-form integration).

### 4.2 Spotter-specific primitives

These are domain primitives unique to Spotter, built from shadcn foundations + design tokens. Where they live: `src/components/`.

| Component              | Purpose                                              | Used in                              |
| ---------------------- | ---------------------------------------------------- | ------------------------------------ |
| `ExerciseCard`         | The workhorse — exercise visual + metadata + actions | Library, Daily View, Session Summary |
| `ExerciseCard.Library` | Library variant (checklist, image, search buttons)   | Library                              |
| `ExerciseCard.Daily`   | Daily view variant (sets/reps/rest, timer, log)      | Daily View                           |
| `ExerciseCard.Summary` | Session summary variant (logged values, RPE)         | Session Summary                      |
| `BadgeTS` / `BadgeMB`  | Top set / Metabolic set badges                       | Exercise cards                       |
| `MetaPill`             | Sets/reps/rest pills                                 | Exercise cards                       |
| `RestTimer`            | Per-exercise stateful timer                          | Daily View                           |
| `SetLogger`            | Weight + reps + RPE + notes per set                  | Daily View                           |
| `LangSwitch`           | EN/AR language toggle                                | Settings, header                     |
| `RTLProvider`          | Wraps content with correct lang/dir                  | Root                                 |
| `MixedLang`            | Inline mixed-language content                        | Anywhere                             |
| `CopyButton`           | Copy with success feedback                           | Prompt screens                       |
| `DeepLinkButton`       | "Open in Claude/ChatGPT/Gemini"                      | Prompt screens, session summary      |
| `AIBadge`              | Marks AI-generated content                           | Anywhere AI touched the content      |
| `WorkingWeightDisplay` | Standard weight display with calibration indicator   | Multiple screens                     |
| `RPEScale`             | RPE input/display (1-10 scale)                       | Set logger                           |

### 4.3 Composition rules

**No boolean prop proliferation.** Use compound components or explicit variants instead.

```tsx
// ❌ Don't
<ExerciseCard isCompact hasImage showActions isHighlighted />

// ✅ Do (compound)
<ExerciseCard>
  <ExerciseCard.Image />
  <ExerciseCard.Header />
  <ExerciseCard.Meta />
  <ExerciseCard.Actions />
</ExerciseCard>

// ✅ Or (explicit variant)
<ExerciseCard.Library exercise={ex} />
<ExerciseCard.Daily exercise={ex} />
<ExerciseCard.Summary exercise={ex} />
```

**Children over render props.** Pass children, not functions, for composition.

**Provider for context-heavy components.** Plan, Block, TrainingDay use provider patterns to avoid 3-deep prop drilling.

**Forms:** react-hook-form + Zod always. Use shadcn's Form primitives (Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage).

---

## 5. Bilingual & RTL

### 5.1 The two-axis model

UI language and prompt-response language are **independent settings**:

- `Profile.uiLanguage` — `en` or `ar` — controls the entire UI
- `Profile.promptResponseLanguage` — `en`, `ar`, or `bilingual` — controls only what we ask the AI to respond in

Why: AIs are dramatically better at understanding English instructions. We always send English prompts. We tell the AI to respond in the user's chosen language, with technical terms (`RPE`, `sets`, `kg`, exercise names) preserved in their original form.

### 5.2 RTL implementation

- Use **logical properties** in Tailwind: `ms-4` (margin-start) not `ml-4` (margin-left); `pe-2` not `pr-2`; `start-0` not `left-0`
- Set `dir` and `lang` at the document root via `RTLProvider`
- Test every screen in both directions before merging
- Icons that imply direction (back arrow, forward arrow, send button) must mirror in RTL — use lucide-react which handles this when wrapped properly

### 5.3 i18n strings

Every user-facing string lives in `src/i18n/en.json` and `src/i18n/ar.json`. Including "OK" and "Cancel". No hardcoded strings.

```tsx
// ❌ Don't
<Button>Save</Button>

// ✅ Do
<Button>{t('common.save')}</Button>
```

---

## 6. Voice & Tone

Spotter's voice is **the voice of a knowledgeable friend who lifts**. Not a coach. Not a chatbot. Not a brand.

### 6.1 Empty states

Empty states are **invitations**, not absences.

> ❌ "No data."
> ✅ "No sessions logged yet. Your first one starts your history."

### 6.2 Errors

Errors are **human**, not technical.

> ❌ "ERR_IMG_404: Failed to fetch resource at URL."
> ✅ "Couldn't load that image. Try a different URL?"

### 6.3 Confirmations

Confirmations are **brief and confident**. Don't over-explain.

> ❌ "Your changes have been successfully saved to your local browser storage."
> ✅ "Saved."

### 6.4 AI-generated disclaimers

AI provenance is **clear and present**, not buried.

> ❌ (no indication that the suggestion came from AI)
> ✅ "AI suggestion, based on your last 4 sessions." — visible alongside the suggestion, not in a tooltip

### 6.5 Arabic copy

Arabic translations are **cultural**, not literal. The Arabic version should feel native, not like translated English. Use Modern Standard Arabic for written instructions; common gym terminology where natural.

---

## 7. Accessibility (Baseline, Non-Negotiable)

- WCAG 2.1 AA color contrast: 4.5:1 for normal text, 3:1 for large text
- All interactive elements keyboard-accessible
- Visible focus indicators on every focusable element
- ARIA labels on icon-only buttons
- `prefers-reduced-motion` respected in all animations
- Touch targets minimum 44×44px
- Form labels properly associated with inputs
- Errors announced via `aria-live` regions
- No color-only state differentiation
- Heading hierarchy correct (no skipping levels)

AccessLint runs as a CI gate. Issues block merge.

---

## 8. Anti-Patterns (Project-Wide)

In addition to all of Impeccable's anti-patterns, these are Spotter-specific things to avoid:

1. Don't use `dangerouslySetInnerHTML` on user data, ever
2. Don't render external image URLs without scheme validation (`https:` or safe `data:image/*` only)
3. Don't store user images as base64 in localStorage (IndexedDB only)
4. Don't make UI assume an API response — Spotter has no backend
5. Don't hardcode strings — even "OK" goes through i18n
6. Don't ignore RTL layout — logical properties always
7. Don't use emoji as functional icons — lucide SVGs only
8. Don't mix sets/reps/weight notation — the format is `Sets × Reps @ Weight RPE`
9. Don't surface AI provider names as design elements — Spotter is provider-agnostic
10. Don't add motion to data displays — numbers appear, they don't animate

---

## 9. Workflow

When designing or modifying any UI in Spotter:

1. **`spotter-design` skill auto-loads** with project context
2. **Invoke `/impeccable shape`** for larger pieces (a screen, a primitive); skip for small fixes
3. **Build**, using shadcn primitives + design tokens; follow composition rules
4. **Add to `/_design`** test page in both languages
5. **Run `/impeccable critique`** for review
6. **Run AccessLint** for accessibility checks
7. **Run `npx impeccable detect` locally** before commit
8. **CI gates the PR** with the same detector

Don't skip steps. The cost of skipping a step in P3 is finding the issue in P9.

---

## 10. This Document Evolves

This is a starter design system. The full version replaces it during P0.5 after `/impeccable teach` runs and we commit the refined token values, motion tables, and detailed examples.

When this document is updated, the `spotter-design` skill in `.claude/skills/spotter-design/SKILL.md` should be updated to match. The skill's token reference is a summary; this document is the source of truth.

---

_End of design system v0.1 (starter). To be expanded in Phase P0.5._
