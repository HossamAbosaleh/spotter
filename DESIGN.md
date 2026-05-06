# Spotter — Design System

> **Status:** v1.0 (refined). This is the source of truth for visual decisions in Spotter. Sister document: `PRODUCT.md` (strategic register + principles). The `spotter-design` skill in `.claude/skills/spotter-design/SKILL.md` is a runtime summary of this file — when this file changes, update the skill to match.
>
> **Implementation contract:** `tailwind.config.ts` and `src/styles/globals.css` MUST mirror the values in this document. They are starter values today and will drift if not updated alongside this spec. Any PR that changes a token here updates both runtime files in the same commit.

---

## 1. Identity

**Spotter** is the bridge between a lifter and their AI coach.

**Tagline:** Your gym, your data, your AI coach.

**Three-word personality:** precise, athletic, engineered.

**Register:** `product` (the tracker app), with `brand` available as a per-task override for landing/marketing surfaces. See `PRODUCT.md` for the full strategic context.

**Anchor references** (the lane we're shaping toward):

- **Linear** — settings panels, keyboard-first density, calm typography, restrained palette
- **Whoop** — athletic data clarity, mono numerals, dark canvas, performance feel
- **Raycast** — tool-craft polish, command-surface tightness, dense without crowded

**Anti-anchor references** (what the SLOP detector should fire on):

- Strong / Hevy / Jefit — generic fitness-app commodity
- Purple-blue AI gradient slop (sparkle icons, lavender chrome, glassmorphic AI badges)
- Nike Training Club / Apple Fitness+ — consumer-warm, brand-led, cinematic
- Crypto / SaaS dashboards — chart-glut, donut soup, hero-metric template

Cross-check: if a screen could pass for any of those four, it's wrong.

---

## 2. Design Principles

When in doubt, return here. These are derived from `PRODUCT.md` and govern every visual and interaction decision.

### 2.1 Honesty over decoration

Every element earns its place. No icon for the sake of icons. No animation for the sake of animation. No card wrapping a card wrapping a card. If something is decorative, it's purposeful decoration; if something is functional, it's unmistakably functional.

### 2.2 Data is precise; presentation is human

Numbers and units are precise: `4 × 8 @ 80kg RPE 7`. No fuzzing, no rounding for aesthetics. Tabular figures everywhere they appear. The presentation around the data — labels, empty states, errors, confirmations — is human and conversational.

### 2.3 The user owns their data, visibly

Privacy is a design feature. The "Your Data" page exists. Export and delete are one tap away. The product looks and feels like the user is in control because they are.

### 2.4 AI is transparent, not magical

AI-generated content carries an `AIBadge`. Suggestions show what they're based on. No hidden generation, no sparkle icons, no purple-blue chrome. AI provenance is communicated through **typography and a low-chroma cyan mark**, never through gradient or glow.

### 2.5 Bilingual is a first-class concern

Arabic and English are equally supported. RTL layout is verified on every screen. Arabic copy is native, not translated. Use logical properties (`ms-*`, `pe-*`) only — never `ml-*` / `pl-*`.

### 2.6 Mobile is the primary surface

The gym is on a phone. Touch targets ≥44×44px. Forms are big and tappable. Modals respect the keyboard. Desktop is _also_ great, but it is not the primary design target.

### 2.7 Instrument, not appliance

Spotter is a tool a lifter reaches for during a set. Tool-quality precision over consumer warmth. Closer to Linear or Raycast than Strong or Hevy.

---

## 3. Design Tokens

### 3.1 Color

**Color strategy: Restrained.** Tinted neutrals form 90% of any surface; accent.primary appears on ≤10% of pixels at any time, used for the single most important call-to-action on a screen. Anything more saturated than this is wrong for the product register.

All values are expressed in OKLCH (canonical) with sRGB hex fallbacks (used in tailwind config until browser support is universal). Neutrals are tinted toward the brand hue (a cool near-neutral, hue ≈ 270) at very low chroma (≤0.005) so the surface never reads as pure gray.

#### Surface

| Token            | OKLCH                   | Hex fallback | Usage                                       |
| ---------------- | ----------------------- | ------------ | ------------------------------------------- |
| `bg.canvas`      | `oklch(0.18 0.004 270)` | `#0d0d0f`    | Body, page background                       |
| `bg.surface`     | `oklch(0.23 0.004 270)` | `#161618`    | Default container, card surface             |
| `bg.elevated`    | `oklch(0.27 0.004 270)` | `#1c1c1f`    | Popovers, modals, elevated cards            |
| `border.default` | `oklch(0.34 0.004 270)` | `#2a2a2e`    | Standard separator, default 1px card border |
| `border.muted`   | `oklch(0.27 0.004 270)` | `#1f1f22`    | Barely-there separator                      |

Hex fallbacks are pre-existing in `tailwind.config.ts`. They are visually matched, not algorithmically converted; treat OKLCH as canonical for new variants.

#### Text

| Token          | OKLCH                   | Hex       | Usage                         | On `bg.canvas` contrast                 |
| -------------- | ----------------------- | --------- | ----------------------------- | --------------------------------------- |
| `text.primary` | `oklch(0.95 0.002 270)` | `#f0f0f0` | Body, headings                | 15.3:1 — passes AAA                     |
| `text.muted`   | `oklch(0.62 0.003 270)` | `#888888` | Secondary, captions, metadata | 4.6:1 — passes AA                       |
| `text.dim`     | `oklch(0.42 0.003 270)` | `#555555` | Tertiary, placeholders        | 2.4:1 — **decorative only**, never body |

`text.dim` MUST NOT carry information that the user needs to read. Reserve for divider labels, decorative timestamps that are also encoded in another way.

#### Accent

| Token              | OKLCH                  | Hex       | Usage                                                     |
| ------------------ | ---------------------- | --------- | --------------------------------------------------------- |
| `accent.primary`   | `oklch(0.94 0.21 116)` | `#e8ff47` | Top set badge, primary CTA, focus ring, key actions       |
| `accent.secondary` | `oklch(0.71 0.18 38)`  | `#ff6b35` | Metabolic set badge, warnings, secondary emphasis         |
| `ai.indicator`     | `oklch(0.78 0.05 215)` | `#90c4d4` | AI-generated content mark (low-chroma cyan, not lavender) |

**Why these accents survive the register check:**

- `accent.primary` — a near-fluorescent yellow-green. Loud enough to function as a single attention anchor on a calm surface. Reads as athletic / instrument-grade (think a stage-lit highlighter or a status LED). Crucially **not** consumer-warm orange, **not** SaaS blue, **not** AI lavender.
- `accent.secondary` — a confident orange. Reserved for the metabolic-set badge and warnings. Never used as a CTA color (that's `accent.primary`'s job; two CTAs of equal weight is a layout mistake).
- `ai.indicator` — a desaturated cyan-teal. Distinguishable from both accents and from any neutral. Reads as "engineered status indicator," **not** "magic sparkle." Replaces the previous lavender (`#a78bfa`), which was a direct violation of the AI-slop anti-reference and is **banned** going forward.

#### Semantic states

| Token     | OKLCH                  | Hex       | Usage                                                  | Pairs with       |
| --------- | ---------------------- | --------- | ------------------------------------------------------ | ---------------- |
| `success` | `oklch(0.78 0.16 145)` | `#7bd17a` | Saved confirmations, completed sessions                | check icon       |
| `warning` | `oklch(0.71 0.18 38)`  | `#ff6b35` | Calibration weights, deload due (= `accent.secondary`) | triangle icon    |
| `error`   | `oklch(0.65 0.20 28)`  | `#e35b4d` | Validation errors, failed actions                      | x-circle icon    |
| `info`    | `oklch(0.75 0.07 235)` | `#7eb6cb` | Notifications, hints (cool blue, NOT lavender)         | info-circle icon |

Every semantic state MUST be paired with a non-color signal (icon, label, or shape). No state is communicated by color alone — both an accessibility and an AI-slop guardrail.

#### Banned colors and patterns

- **Pure black** (`#000`) and **pure gray** — every neutral is tinted, even subtly
- **Lavender / purple-blue gradients in the AI hue range (260–290°)** — the AI-slop signature, explicitly forbidden anywhere on the AI surfaces
- **Gradient text** (`background-clip: text`) — banned project-wide (Impeccable shared law)
- **High-saturation colors as backgrounds** — saturation is for accents, never for surfaces
- **Color-only state differentiation** — every color-coded state also has icon/label/shape
- **Side-stripe borders** — `border-l-4 border-accent` decorative pattern is banned (Impeccable shared law)

### 3.2 Typography

#### Type families

| Family         | Font               | Weights used       | Usage                                                                   |
| -------------- | ------------------ | ------------------ | ----------------------------------------------------------------------- |
| Display        | **Bebas Neue**     | 400                | Large headers, hero, exercise names, athletic identity                  |
| Body (English) | **DM Sans**        | 400, 500, 600      | All English UI text                                                     |
| Body (Arabic)  | **Cairo**          | 400, 500, 600, 700 | All Arabic UI text                                                      |
| Mono (data)    | **JetBrains Mono** | 400, 500           | Weights, reps, RPE, set counts, timer numerals, all `tabular-nums` data |

**Why these survive the Linear + Whoop + Raycast register check:**

- Bebas Neue — condensed sans, athletic identity. Whoop uses condensed sans for headlines; Bebas is the open-source equivalent that signals "performance."
- DM Sans — humanist geometric with character (open `a`, two-storey `g`). NOT in the Impeccable banned list (which excludes Inter, Roboto, system-ui, Arial, Space Grotesk). Linear-adjacent feel without being a Linear clone.
- Cairo — Google Sans Arabic with a full weight range. Native-quality Arabic, not a translation typeface.
- JetBrains Mono — tool-craft signal. Reads as Linear/Raycast/Vercel-tier instead of "I used a generic mono."

**Banned fonts** (explicit, per Impeccable + project rules):

- Inter, Roboto, system-ui, Arial, Helvetica, Space Grotesk, Geist (default Vercel reach), SF Pro
- Any "default" Tailwind font stack reached for without intent

#### Type scale

Mobile-first sizes; desktop scales up at the `md` breakpoint where noted. Each step satisfies the **≥1.25 ratio rule** for hierarchy.

| Use            | Mobile / Desktop | Family          | Line-height | Letter-spacing | Notes                                                           |
| -------------- | ---------------- | --------------- | ----------- | -------------- | --------------------------------------------------------------- |
| Display large  | 40 / 56px        | Bebas Neue      | 1.05        | 0.01em         | Hero only; ≤1 per page                                          |
| Display medium | 32 / 40px        | Bebas Neue      | 1.10        | 0.01em         | Section headers on landing                                      |
| H1             | 28 / 32px        | Bebas Neue      | 1.15        | 0              | Page title in app (was 24px; raised to fix 1.2 ratio violation) |
| H2             | 20 / 24px        | Bebas Neue      | 1.25        | 0              | Sub-section header                                              |
| H3             | 16 / 18px        | DM Sans 600     | 1.35        | 0              | Inline group label (no Bebas at this size — too compressed)     |
| Body large     | 16 / 18px        | DM Sans / Cairo | 1.55        | 0              | Lead paragraphs, dialog body                                    |
| Body           | 15 / 16px        | DM Sans / Cairo | 1.60        | 0              | Default body                                                    |
| Body small     | 13 / 14px        | DM Sans / Cairo | 1.50        | 0              | Secondary text, captions in lists                               |
| Caption        | 12 / 13px        | DM Sans / Cairo | 1.40        | 0.01em         | Labels, metadata                                                |
| Mono XL        | 24 / 28px        | JetBrains Mono  | 1.20        | 0              | Hero data: rest timer, current set weight                       |
| Mono large     | 18 / 20px        | JetBrains Mono  | 1.40        | 0              | Set list values, exercise card weight                           |
| Mono           | 14 / 15px        | JetBrains Mono  | 1.40        | 0              | Inline data, MetaPill                                           |
| Mono small     | 12 / 13px        | JetBrains Mono  | 1.35        | 0.02em         | Badge labels (`TS`, `MB`, `AI`)                                 |

**Step ratios:** display-lg/display-md = 1.25, display-md/h1 = 1.14 (display register; both Bebas, deliberate near-step), h1/h2 = 1.40, h2/h3 = 1.25, body-lg/body = 1.07 (deliberate near-step inside body register), body/body-sm = 1.15 (deliberate near-step), caption stands one further down.

**Body line length cap:** 65–75ch. Use `max-w-prose` or explicit `max-w-[68ch]` on any long-form body block.

**Tabular numerals:** every mono-rendered number uses `font-feature-settings: 'tnum'` so columns of weights and reps stay aligned.

**Hierarchy by weight + scale, never by color alone.** No "make it pop" via colored body text.

### 3.3 Spacing

4px base scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

In Tailwind: `space-1` through `space-24` (with the existing `space-18` and `space-22` extras for breathing-room cases). Avoid arbitrary values (`space-[7px]`) unless absolutely necessary.

**Component padding defaults:**

| Element        | Padding                               |
| -------------- | ------------------------------------- |
| Card           | `p-4` (16px)                          |
| Modal / dialog | `p-6` (24px)                          |
| Sheet          | `p-5` (20px)                          |
| Page section   | `py-8` mobile / `py-12` desktop       |
| Form field gap | `gap-4` (16px)                        |
| Page gutter    | `px-4` mobile / `px-6` md / `px-8` lg |

**Vary spacing for rhythm.** Do not pad everything identically; that produces flat, monotonous compositions. The set logger gets generous vertical padding (it's the focal task); the library list gets tighter rhythm (it's a scan task).

### 3.4 Radii

| Token         | Value | Usage                                           |
| ------------- | ----- | ----------------------------------------------- |
| `radius.sm`   | 8px   | Inline badges, small chips                      |
| `radius.md`   | 12px  | Inputs, secondary buttons, primary buttons      |
| `radius.lg`   | 16px  | Cards, modals, primary surfaces                 |
| `radius.pill` | 999px | Pills, fully-rounded badges (MetaPill, BadgeTS) |

Buttons use `radius.md`, not `radius.pill`. Pill buttons read as marketing/consumer; we're tool-register.

### 3.5 Shadows

Dark mode prefers **borders over shadow blur** for elevation, because shadows on dark surfaces are nearly invisible. Use the `border` tokens to delineate primary elevation; reserve shadow for true float.

| Token             | Value                                                                    | Usage                                            |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| `shadow.subtle`   | `0 1px 2px 0 oklch(0 0 0 / 0.40)`                                        | Hovered cards, raised list items                 |
| `shadow.elevated` | `0 4px 12px -2px oklch(0 0 0 / 0.55), inset 0 1px 0 oklch(1 0 0 / 0.04)` | Popovers, dropdowns, tooltips                    |
| `shadow.modal`    | `0 24px 48px -12px oklch(0 0 0 / 0.70)`                                  | Modals, dialogs, sheet sliding from edge         |
| `shadow.floating` | `0 8px 24px -4px oklch(0 0 0 / 0.60)`                                    | Toasts, notifications, snackbars (highest layer) |

The inset top-highlight in `shadow.elevated` (1px of 4% white) is the only "glow" we use. It signals raised surface without crossing into glassmorphism.

**Banned:** `box-shadow` glows tinted with `accent.primary` or `ai.indicator` (reads as cyberpunk SaaS, not engineered tool).

### 3.6 Motion

| Token                 | Duration | Easing       | Component-level usage                                                        |
| --------------------- | -------- | ------------ | ---------------------------------------------------------------------------- |
| `motion.micro`        | 150ms    | `standard`   | Hover, focus ring, active press, checkbox/radio toggle, tooltip show         |
| `motion.standard`     | 200ms    | `standard`   | Modal close, sheet close, toast in/out, accordion expand, popover open/close |
| `motion.emphasized`   | 300ms    | `emphasized` | Modal open, sheet open, drawer slide-in, page transition (route change)      |
| `motion.orchestrated` | 500ms    | `emphasized` | First-load hero stagger, onboarding step transitions, prompt-preview reveal  |

**Easings:**

- `standard`: `cubic-bezier(0.4, 0, 0.2, 1)` — most things
- `emphasized`: `cubic-bezier(0.16, 1, 0.3, 1)` — emphasized exits/reveals (ease-out-quart family)

**Banned easings (constitution + Impeccable):**

- Bounce, elastic, overshoot — feel dated, signal AI slop / consumer-warm reflex
- Linear easing on user-initiated transitions (acceptable only for true progress meters)

**Animated properties:** `opacity`, `transform` (translate, scale, rotate), `filter`. Never animate CSS layout properties (`width`, `height`, `top`, `left`, `padding`, `margin`) — they trigger layout and stutter on mid-tier mobile.

**Reduced motion:** `prefers-reduced-motion: reduce` is honored globally in `globals.css`. Either skip the animation entirely or shorten to <100ms. The reduced-motion case is tested as a first-class state, not an afterthought.

**No motion on data displays.** Numbers appear, they don't animate. The rest timer counts down (the digit replaces, doesn't slide); the set count updates instantly. Animating numerals reads as gamification slop.

---

## 4. Component System

### 4.1 Foundation: shadcn/ui

shadcn primitives live in `src/components/ui/` and are owned (copied, not imported as a library). Each is customized with Spotter tokens during P0.5.

**Primitives in scope:** Button, Input, Label, Textarea, Select, Checkbox, Radio Group, Slider, Dialog, Drawer, Sheet, Toast, Badge, Card, Tabs, Accordion, Tooltip, Popover, Progress, Alert, Form (with react-hook-form integration).

### 4.2 Spotter-specific primitives

Live in `src/components/`. Built from shadcn primitives + Spotter tokens.

| Component              | Purpose                                            | Used in                              |
| ---------------------- | -------------------------------------------------- | ------------------------------------ |
| `ExerciseCard`         | Workhorse — exercise visual + metadata + actions   | Library, Daily View, Session Summary |
| `ExerciseCard.Library` | Library variant (checklist, image, search buttons) | Library                              |
| `ExerciseCard.Daily`   | Daily variant (sets/reps/rest, timer, log)         | Daily View                           |
| `ExerciseCard.Summary` | Summary variant (logged values, RPE)               | Session Summary                      |
| `BadgeTS` / `BadgeMB`  | Top-set / Metabolic-set markers                    | Exercise cards                       |
| `MetaPill`             | Sets/reps/rest pills                               | Exercise cards                       |
| `RestTimer`            | Per-exercise stateful timer                        | Daily View                           |
| `SetLogger`            | Weight + reps + RPE + notes per set                | Daily View                           |
| `LangSwitch`           | EN/AR language toggle                              | Settings, header                     |
| `RTLProvider`          | Wraps content with correct lang/dir                | Root                                 |
| `MixedLang`            | Inline mixed-language content                      | Anywhere                             |
| `CopyButton`           | Copy with success feedback                         | Prompt screens                       |
| `DeepLinkButton`       | "Open in Claude/ChatGPT/Gemini"                    | Prompt screens, session summary      |
| `AIBadge`              | Marks AI-generated content                         | Anywhere AI touched the content      |
| `WorkingWeightDisplay` | Standard weight display with calibration indicator | Multiple screens                     |
| `RPEScale`             | RPE input/display (1-10)                           | Set logger                           |

### 4.3 Component-level execution specs

#### Focus indicator (project-wide)

Two patterns, both equally valid:

- **Outline pattern** (default for most elements): `:focus-visible { outline: 2px solid var(--accent-primary); outline-offset: 2px; }` — already wired in `globals.css`.
- **Ring pattern** (use when `outline-offset` would clip inside a tight container, e.g., inside an input within a card): `:focus-visible { box-shadow: 0 0 0 2px var(--bg-canvas), 0 0 0 4px var(--accent-primary); }` — produces the same visual but renders inside the container's bounding box.

Focus is **never** removed. `outline: none` without an equivalent replacement is a CI-level reject.

#### Buttons

| Variant       | Surface                                   | Text                                          | Border                         | Use                                        |
| ------------- | ----------------------------------------- | --------------------------------------------- | ------------------------------ | ------------------------------------------ |
| `primary`     | `bg-accent-primary`                       | `text-bg-canvas`                              | none                           | One per screen — the most-important action |
| `secondary`   | `bg-bg-elevated`                          | `text-text-primary`                           | `border border-border-default` | Standard actions                           |
| `ghost`       | `bg-transparent` → hover `bg-bg-elevated` | `text-text-primary`                           | none                           | In-card secondary actions, nav items       |
| `destructive` | `bg-error`                                | `text-bg-canvas`                              | none                           | Delete confirmations only                  |
| `icon`        | as ghost                                  | `text-text-muted` → hover `text-text-primary` | none                           | 40px touch wrapper around 24px icon        |

**One primary per screen.** Two equally-weighted CTAs is a layout mistake.

**Sizes:** `sm` 32px (compact toolbar), `md` 40px (default), `lg` 48px (hero CTA on landing). Touch target: the `md` button has `py-2 px-4` and a `min-h-11` (44px) hitbox via padding.

#### `BadgeTS` (Top Set)

```
┌────┐
│ TS │   bg-accent-primary, text-bg-canvas, font-mono uppercase tracking-wide
└────┘   text-mono-sm, px-1.5 py-0.5, radius-sm
```

#### `BadgeMB` (Metabolic Set)

Same shape as BadgeTS, surface `bg-accent-secondary`, text `text-bg-canvas`. Label `MB`.

Top-set and metabolic-set badges always appear in **the same slot** within an `ExerciseCard.Daily` (top-right of the card header), so they read as switchable states, not as competing decorations.

#### `MetaPill`

```
┌─────────────────┐
│ 4×8             │   bg-bg-elevated, border border-border-muted,
└─────────────────┘   text-text-muted, font-mono text-mono-sm,
                      px-3 py-1, radius-pill
```

Multiple MetaPills appear inline with a `gap-2` between them. Format strictly:

- Sets×Reps: `4×8` (lowercase `×`, no spaces)
- Weight: `80kg` or `175lb` (no space; unit lowercase)
- Rest: `90s` or `2min` (no space; unit lowercase)
- RPE: `RPE 7` (uppercase RPE, space, integer)

#### `AIBadge`

Inline mark. Replaces the previous purple lavender chip.

```
┌────────────────────────────────────────────────┐
│ ●  AI · based on your last 4 sessions          │
└────────────────────────────────────────────────┘
```

- Shape: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill`
- Surface: `bg-bg-elevated`, `border border-ai-indicator/40` (40% alpha cyan)
- Mark: a 6px filled disc in `ai.indicator` (the leading `●`)
- Label: `font-mono text-mono-sm uppercase tracking-wide text-ai-indicator` for `AI`
- Provenance text (after a middle dot): `font-body text-body-sm text-text-muted`
- **No icon**, **no sparkle**, **no gradient**. The cyan disc is the entire visual signal.

The badge is small and sits inline next to the AI-touched element, not floating in a corner. When provenance text is empty, the label collapses to just `● AI`.

#### `RestTimer`

The single most prominent component during a workout. Specs:

- **Display:** `font-mono` `text-mono-xl` (24px mobile / 28px desktop) `text-text-primary`, `tabular-nums`. Format `M:SS` until 0, then turns to `accent.primary` and pulses once at zero (a single 200ms `motion.standard` opacity step from 0.6 → 1, no bounce).
- **Progress bar:** thin `h-1` bar below the digits, `bg-bg-elevated` rail, `bg-accent-primary` fill, decreasing linearly. The bar is the only animated element; the digits replace, they don't tick or fade.
- **Controls:** Pause / Reset / Skip buttons. Each is `icon` variant with a `min-w-11 min-h-11` (44px) hitbox.
- **No alarm sound by default.** A vibration pulse (where supported) at 0:00. Sound is opt-in.
- **Reduced-motion:** the progress bar still animates (it's a true progress meter, not decoration). The pulse-at-zero is suppressed.

#### `SetLogger`

The set logger is a focused row, not a card. Format:

```
┌─────────────────────────────────────────────────┐
│ Set 3       80 kg    × 8 reps     RPE  ●●●●●●●○○○ │
│             ────────  ──────────                  │
└─────────────────────────────────────────────────┘
```

- Set number: `font-mono` `text-mono`, `text-text-muted`
- Weight input + reps input: bare `Input` with bottom-border-only treatment, `font-mono text-mono-lg`, `tabular-nums`. Underline color is `border.default` → `accent.primary` on focus.
- RPE: 10-dot scale, 8px discs in `text-text-dim`, filled in `accent.primary` up to the selected value. Tap any dot to set.
- Save is implicit on blur. No "Save" button — the implicit-save pattern is the interaction.
- Tap-and-hold on the set row reveals secondary actions (delete, duplicate, add note) in a sheet.

#### `WorkingWeightDisplay`

Inline mono numeral with optional calibration indicator:

```
80kg              calibrated        ○ 80kg uncalibrated (warning)
└─ accent.primary  └─ text.muted     └─ accent.secondary disc
```

When the weight is uncalibrated (user has not validated working weight in N sessions), a 6px disc in `accent.secondary` appears as a leading dot, plus a tooltip on hover/long-press explaining "Calibrate this weight."

#### `RPEScale`

10-dot scale, see `SetLogger`. As a standalone read-only display, the scale renders the same way but is not interactive (`pointer-events: none`, `aria-label="RPE 7 of 10"`).

### 4.4 Composition rules

**No boolean prop proliferation.** Use compound components or explicit variants.

```tsx
// ❌ Don't
<ExerciseCard isCompact hasImage showActions isHighlighted />

// ✅ Compound
<ExerciseCard>
  <ExerciseCard.Image />
  <ExerciseCard.Header />
  <ExerciseCard.Meta />
  <ExerciseCard.Actions />
</ExerciseCard>

// ✅ Explicit variant
<ExerciseCard.Library exercise={ex} />
<ExerciseCard.Daily exercise={ex} />
<ExerciseCard.Summary exercise={ex} />
```

**Children over render props.** Pass children, not functions.

**Provider for context-heavy components.** `Plan`, `Block`, `TrainingDay` use provider patterns to avoid 3-deep prop drilling.

**Forms:** react-hook-form + Zod always. Use shadcn's Form primitives (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`).

---

## 5. Bilingual & RTL

### 5.1 The two-axis model

UI language and prompt-response language are **independent settings**:

- `Profile.uiLanguage` — `en` or `ar` — controls the entire UI
- `Profile.promptResponseLanguage` — `en`, `ar`, or `bilingual` — controls only what we ask the AI to respond in

We always send English prompts (AIs handle English instructions far better) and tell the AI to respond in the user's chosen language with technical terms preserved (`RPE`, `kg`, exercise names).

### 5.2 RTL implementation

- **Logical properties only:** `ms-4` (margin-start), `pe-2` (padding-end), `start-0` (inset-start). Never `ml-*`, `pr-*`, `left-0`.
- `dir` and `lang` set at the document root via `RTLProvider`.
- Test every screen in both directions before merging.
- Direction-implying icons (back arrow, forward arrow, send button) mirror in RTL — use lucide-react inside an RTL-aware wrapper.
- **Mono-numeric data does not flip.** `4 × 8 @ 80kg` reads the same in both directions; only its container flips.

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

The voice is **a knowledgeable friend who lifts**. Not a coach. Not a chatbot. Not a brand.

### 6.1 Empty states — invitations, not absences

> ❌ "No data."
> ✅ "No sessions logged yet. Your first one starts your history."

### 6.2 Errors — human, not technical

> ❌ "ERR_IMG_404: Failed to fetch resource at URL."
> ✅ "Couldn't load that image. Try a different URL?"

### 6.3 Confirmations — brief, confident

> ❌ "Your changes have been successfully saved to your local browser storage."
> ✅ "Saved."

### 6.4 AI provenance — clear, present

> ❌ (no indication a suggestion came from AI)
> ✅ "● AI · based on your last 4 sessions" — visible alongside the suggestion, not in a tooltip

### 6.5 Arabic copy — cultural, not literal

The Arabic version feels native. Modern Standard Arabic for written instructions; common gym terminology where natural. The Arabic translator never just runs the English through a translation engine.

### 6.6 No em dashes in product copy

Em dashes are banned in user-facing UX copy (Impeccable shared law). Use commas, colons, semicolons, periods, parentheses. Also no `--`. (This document is a spec and uses em dashes for editorial clarity; product copy does not.)

---

## 7. Accessibility (Baseline, Non-Negotiable)

Sourced from constitution Principle IV + design laws.

- **WCAG 2.1 AA** color contrast: 4.5:1 normal text, 3:1 large text. Verified per token in §3.1.
- All interactive elements keyboard-accessible.
- Visible focus indicators on every focusable element (see §4.3).
- ARIA labels on icon-only buttons.
- `prefers-reduced-motion` respected globally.
- Touch targets ≥ 44×44px.
- Form labels properly associated with inputs.
- Errors announced via `aria-live` regions.
- No color-only state differentiation.
- Heading hierarchy correct (no skipping levels).

**AccessLint runs as a CI gate. Issues block merge.**

---

## 8. Anti-Patterns (Project-Wide)

In addition to all of Impeccable's banned-by-default patterns:

1. Don't use `dangerouslySetInnerHTML` on user data, ever (constitution P5).
2. Don't render external image URLs without scheme validation (`https:` or safe `data:image/*` only).
3. Don't store user images as base64 in localStorage (IndexedDB only).
4. Don't make UI assume an API response — Spotter has no backend (constitution P1).
5. Don't hardcode strings — even "OK" goes through i18n.
6. Don't ignore RTL — logical properties always.
7. Don't use emoji as functional icons — lucide SVGs only.
8. Don't mix sets/reps/weight notation — the format is `Sets × Reps @ Weight RPE`.
9. Don't surface AI provider names as design elements — Spotter is provider-agnostic.
10. Don't add motion to data displays — numbers appear, they don't animate.
11. **Don't use lavender / purple-blue (hue 260–290°) for AI surfaces.** That hue is reserved for "do not enter" — using it triggers `npx impeccable detect`.
12. **Don't use sparkle icons for AI provenance.** The cyan disc is the only AI signal.
13. **Don't pad everything identically.** Vary spacing for rhythm; flat padding is monotony.
14. **Don't reach for a card by reflex.** Cards are the lazy answer to layout. Use only when truly the best affordance. Nested cards are always wrong.
15. **Don't write `outline: none` without a focus replacement.** CI rejects it.

---

## 9. Workflow

When designing or modifying any UI:

1. **`spotter-design` skill auto-loads** with project context.
2. **Run `/impeccable shape`** for larger pieces (a screen, a primitive); skip for small fixes.
3. **Build** using shadcn primitives + design tokens; follow composition rules.
4. **Add to `/_design`** test page in both languages.
5. **Run `/impeccable critique`** for review.
6. **Run AccessLint** for accessibility checks.
7. **Run `npx impeccable detect`** locally before commit.
8. **CI gates the PR** with the same detector + AccessLint.

Don't skip steps. The cost of skipping a step in P3 is finding the issue in P9.

---

## 10. Implementation gaps (resolve in P0.5)

This document is the source of truth, but the runtime files are still on starter values. Reconciliation list:

| File                     | Current state                              | Required change                                                                                                                                                     |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tailwind.config.ts`     | `ai.DEFAULT: '#a78bfa'` (lavender)         | Update to `ai.indicator: '#90c4d4'` (cyan). Rename key `DEFAULT` → `indicator`.                                                                                     |
| `tailwind.config.ts`     | `h1: '1.5rem'` (24px)                      | Bump to `h1: '1.75rem'` (28px) to satisfy ≥1.25 step ratio.                                                                                                         |
| `tailwind.config.ts`     | No `h3`, no `mono-xl`, no `mono-sm`        | Add: `h3: ['1rem', { lineHeight: '1.35' }]`, `mono-xl: ['1.5rem', { lineHeight: '1.2' }]`, `mono-sm: ['0.75rem', { lineHeight: '1.35', letterSpacing: '0.02em' }]`. |
| `tailwind.config.ts`     | No `success`, `error`, `info` color tokens | Add per §3.1.                                                                                                                                                       |
| `tailwind.config.ts`     | No `boxShadow` extension                   | Add `subtle`, `elevated`, `modal`, `floating` per §3.5.                                                                                                             |
| `src/styles/globals.css` | `--color-ai: 167 139 250` (lavender)       | Update to `--color-ai-indicator: 144 196 212` (cyan); rename custom property.                                                                                       |
| `src/styles/globals.css` | No `--color-success`, `-error`, `-info`    | Add.                                                                                                                                                                |
| `src/styles/globals.css` | Focus uses bare `outline`                  | Keep outline pattern as default; add ring-pattern utility for clipped contexts.                                                                                     |

These reconciliations are mandatory for P0.5 completion. Open the PR that updates this DESIGN.md alongside the PR that updates `tailwind.config.ts` and `globals.css` — they ship together or the spec drifts.

---

## 11. This document evolves

When this document is updated:

1. Update `tailwind.config.ts` and `src/styles/globals.css` in the same PR (see §10).
2. Update `.claude/skills/spotter-design/SKILL.md` to match — the skill is a runtime summary; this file is the source of truth.
3. Bump the version line below.
4. Note the change in the PR description.

---

**Version:** v1.0 (refined) · **Last refined:** 2026-05-06 · **Sister doc:** `PRODUCT.md`
