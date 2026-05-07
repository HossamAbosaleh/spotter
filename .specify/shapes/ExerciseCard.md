# ExerciseCard — Design Brief

Status: Draft, awaiting confirmation
Phase: P0.5 step 4 (compound primitive)
Owner: shape produced via `/impeccable shape` on 2026-05-07

---

## 1. Feature Summary

`ExerciseCard` is Spotter's workhorse compound primitive — the visual unit that represents a single exercise across four contexts: the **library** (browse/select), **daily** (mid-session execution), **summary** (post-session log), and **plan import preview** (AI-suggested confirmation). Each context surfaces a different subset of metadata and a different interaction model, but the visual chrome — surface, border, image, name, muscle, mono numerals — must read as the same object so users build a consistent mental map.

This shape covers **structure only**: compound layout, slot semantics, visual treatment, and the four explicit variants. Interactive children (SetLogger, RestTimer, swap flow, library checklist) are accepted as slots but their interaction UX is shaped separately.

## 2. Primary User Action

Different per variant, intentionally. The card is a **vehicle**, not an actor:

- **Library** → "I want to add this exercise to my plan." (toggle)
- **Daily** → "I want to log my next set without leaving the card." (forwarded to child)
- **Summary** → "I want to see what I did, fast, with no interaction." (read-only)
- **Plan import preview** → "I want to confirm the AI's pick or swap it." (binary choose/swap)

The card itself never owns these actions; it positions and frames them.

## 3. Design Direction

- **Register:** product (not brand). DESIGN.md and PRODUCT.md both anchor here.
- **Color strategy:** **Restrained**. The card is a structural container; color is conveyed by single-purpose accents inside (BadgeTS lime, BadgeMB orange, AIBadge cyan disc, destructive red on swap-confirm). Background is `bg-surface`, border is `border-default`. No tinted card surfaces; semantic state lives in inline marks, not the whole card.
- **Theme via scene sentence:** "An intermediate lifter glances at this card on a 6.1" phone screen, mid-set, sweaty hand, gym fluorescent overhead, scrolling through a daily session." → forces dark canvas (gym lighting + dark theme primary; mobile glance-density). Confirmed by DESIGN.md.
- **Anchor references:** Linear's project rows (compact, high-density information without busyness); Whoop's daily strain card (mono numerals carry hierarchy; data is the visual); Things 3 task rows (the way one structural primitive serves many contexts via composition, not flags).
- **Per-surface override:** none. Card stays restrained even on plan import preview, where the AI-suggestion is signaled by a small AIBadge inside the header, not by tinting the entire surface.

Image probes skipped: DESIGN.md §4.3 already specifies surface, border, radius, type, and slot anatomy; visual exploration would not add information at this fidelity.

## 4. Scope

| Axis            | Value                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Fidelity        | Production-ready                                                                                        |
| Breadth         | One compound primitive + three variant compositions                                                     |
| Interactivity   | Static structural shell + slot semantics. Interactive children (SetLogger, RestTimer) accepted as kids. |
| Time intent     | Ship-quality (this is a P0.5 foundation primitive — multiple downstream surfaces depend on it)          |

## 5. Compound API

### 5.1 Parts (the building blocks)

```tsx
<ExerciseCard>
  <ExerciseCard.Image src={url} alt={name} />          // see §5.3 for safe-URL handling, 16:9 default
  <ExerciseCard.Header>                                // name + muscle + AIBadge slot
    <ExerciseCard.Name />                              // reads from context
    <ExerciseCard.Muscle />                            // reads from context
    {/* AIBadge composed in here when relevant — not a dedicated card slot */}
  </ExerciseCard.Header>
  <ExerciseCard.Meta>                                  // wraps MetaPills (sets/reps/rest/RPE)
    <MetaPill>4×8</MetaPill>
    <MetaPill>RPE 7</MetaPill>
    <MetaPill>90s</MetaPill>
  </ExerciseCard.Meta>
  <ExerciseCard.Body />                                // generic content slot (working weight, set list, etc.)
  <ExerciseCard.Actions />                             // bottom-row buttons (variant decides which)
</ExerciseCard>
```

Plus two SetList children — distinct components, not one with a `mode` prop:

```tsx
<ExerciseCard.LiveSetList sets={...} currentIdx={2} />     // Daily only — has next-set affordance
<ExerciseCard.LoggedSetList sets={...} />                  // Summary only — frozen historical
```

Both internally render a private `SetRow` primitive for shared row chrome.

`WorkingWeight` is **not** an ExerciseCard part. It's a sibling primitive (`<WorkingWeightDisplay>`, already specced in DESIGN.md §4.3) that variants compose inside `<ExerciseCard.Body>` when relevant. This keeps it reusable on calibration screens, plan-edit modals, and the daily view's hero slot without dragging ExerciseCard along.

### 5.3 Image safe-URL handling (security, non-negotiable)

Constitution P5 mandates real (not theatrical) security for any user-controlled URL. `<ExerciseCard.Image>` runs `isSafeImageUrl(src)` from `src/utils/security.ts` (utility to be added during craft) before rendering. The validator allows only:

- `https:` URLs (no `http:`, no `javascript:`, no `vbscript:`, no protocol-relative `//`).
- `data:image/(png|jpeg|webp);base64,...` data URIs (whitelist: png/jpeg/webp only — no svg, which can carry script).

If validation fails (or `src` is empty/null), `<ExerciseCard.Image>` renders the empty placeholder defined in §7 and emits a one-time `console.warn` in dev only. The component **never** renders an `<img>` element with an unsafe src, even briefly during error recovery — validation runs before the `<img>` is constructed, not after a failed load. `onError` on the `<img>` is wired separately and falls back to the same placeholder for legitimate-but-broken https URLs.

### 5.2 Variants (the three opinionated compositions)

```tsx
// Library: image, name, muscle, search-out actions, plan-add toggle
<ExerciseCard.Library exercise={ex} onAddToPlan={...} isInPlan={...} />

// Daily: meta + working weight hero + live set list + log/rest controls
<ExerciseCard.Daily exercise={ex} session={session} />

// Summary: meta + logged set list + completion state
<ExerciseCard.Summary exercise={ex} session={session} />
```

Each variant is a **thin composition** over the parts — it pre-arranges children for its context. Consumers of the variants do not pass slots themselves (that's what the parts are for, used directly when a variant doesn't fit).

**There is no `Library`/`Daily`/`Summary` boolean or `variant` prop on the base `ExerciseCard`.** The variants are separate exports.

### 5.3 Plan import preview — no fourth variant

The plan import preview reuses `ExerciseCard.Library` with two differences passed as composed children:
1. An `<AIBadge variant="suggested" />` sits inside the Header (next to the muscle group).
2. Actions slot receives `<Button variant="primary">Confirm</Button> <Button>Swap</Button>` instead of the library's checklist toggle.

Why no dedicated variant: the visual structure is identical to Library; only the actions differ. Adding a `Preview` variant would duplicate composition code for one slot's worth of difference. The Library variant is reused with a different `actions={...}` arrangement.

## 6. Layout Strategy

Each variant has a deliberate spatial rhythm. Cards are a **dense card** in this product (Linear/Whoop register), not airy.

```
┌─ Library ───────────────────────────┐    ┌─ Daily ─────────────────────────┐    ┌─ Summary ───────────────────────┐
│ [16:9 image]                        │    │ Header  Bench Press  • Chest    │    │ Header  Bench Press  • Chest    │
│                                     │    │ Meta    4×8 · 80kg · 90s · RPE7 │    │ Meta    4×8 · target            │
│ Header  Bench Press  • Chest        │    │                                 │    │                                 │
│         (•AI suggested?)            │    │ Body                            │    │ Body                            │
│                                     │    │   ┌─ WorkingWeightDisplay ─┐   │    │   ┌ LoggedSetList ──────────┐   │
│ Meta    4×8 · ●●○○ in plan          │    │   │     80 kg               │   │    │   │ Set 1  80kg × 8  RPE 7  │   │
│                                     │    │   └─────────────────────────┘   │    │   │ Set 2  80kg × 8  RPE 7  │   │
│ Actions [add toggle]                │    │   ┌ LiveSetList ──────────┐    │    │   │ Set 3  80kg × 7  RPE 8  │   │
└─────────────────────────────────────┘    │   │ ✓ Set 1  80kg×8 RPE7  │    │    │   │ Set 4  80kg × 6  RPE 9  │   │
                                            │   │ ► Set 2  …            │    │    │   └─────────────────────────┘   │
                                            │   │   Set 3               │    │    │                                 │
                                            │   │   Set 4               │    │    │ Actions  (none — read-only)     │
                                            │   └───────────────────────┘    │    └─────────────────────────────────┘
                                            │                                 │
                                            │ Actions  [Log set]  [Rest 90s] │
                                            └─────────────────────────────────┘
```

- **Library:** image-led (the visual anchor for browsing). Image is `aspect-video` (16:9), card width-bounded.
- **Daily:** the **working weight is the visual hero** (mono-xl, 24px). Everything else orbits it. No image (image distracts mid-set; the user already knows what bench press looks like).
- **Summary:** **list-led** (the logged data is what the user came for). No image. Sets stack with mono numerals tabular-aligned.

**Spacing rhythm inside the card:** `p-4` outer padding (16px), `gap-3` (12px) between major regions (Header → Meta → Body → Actions), `gap-2` (8px) between MetaPills, `gap-1.5` between Header text and inline AIBadge. Variation is intentional — not the same gap everywhere — to read as engineered, not template.

**Border + radius:** `border border-border-default rounded-lg` (16px per DESIGN.md §3.4). No shadow (DESIGN.md §3.5: dark mode uses borders, not shadow blur, for elevation).

## 7. Key States

| State                       | Variant(s)         | Visual treatment                                                                                                                |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Default (default)           | All                | As specced above                                                                                                                |
| Empty exercise (no image)   | Library            | Image slot renders a `bg-elevated` placeholder with a subtle dumbbell icon (lucide), `text-text-dim`. Never the broken-image UI |
| Image load fails            | Library            | Same placeholder as empty                                                                                                       |
| AI-suggested                | Library (preview)  | `<AIBadge variant="suggested" />` inline in Header after the muscle pill                                                        |
| AI-calibrated working weight| Daily              | `<AIBadge variant="generated" />` inline next to the WorkingWeightDisplay (not in Header — the badge marks the value, not the exercise) |
| Uncalibrated working weight | Daily              | WorkingWeightDisplay shows its own `accent.secondary` disc (per its spec). Card chrome unchanged                                |
| In-progress set             | Daily              | LiveSetList highlights the current row with `bg-elevated` surface; previous rows show `text-text-muted` weight, RPE filled      |
| Skipped set                 | Daily, Summary     | Set row renders weight as `—` and RPE row as `text-text-dim`; `aria-label` says "skipped"                                       |
| In plan (already added)     | Library            | Actions checkbox in checked state; muscle-group secondary indicator says "in plan"                                              |
| Pending swap (preview)      | Library (preview)  | Card opacity 0.85 while swap modal is open above; not a card-internal state                                                     |
| Loading (initial render)    | All                | See **Skeleton spec** below                                                                                                     |
| RTL                         | All                | Card flows mirror automatically via logical properties (`ms-`, `pe-`); set numerals stay LTR (`dir="ltr"` on numeric spans) per DESIGN.md §5 |

**No hover state on mobile.** On desktop, library cards get a subtle `hover:border-hover` using the `border.hover` token defined in DESIGN.md §3.1 (`#3a3a3e`, oklch 0.41 — one sanctioned step above `border.default`). Transition: `border-color` over `duration-micro` `ease-standard`. Daily and Summary cards do not respond to hover (they're not buttons).

### Skeleton spec

Skeleton renders `bg-elevated` blocks at the variant's layout positions, with opacity transitioning between 0.6 and 1.0 over 1200ms via a custom keyframe (`spotter-skeleton-pulse`) using `ease-standard`. **No gradient shimmer, no shimmer-sweep** — those read as consumer-app polish, not engineered tool. The pulse is a single opacity step, not a moving highlight.

Per-variant placeholders match the actual layout sizes — skeleton must not cause a layout shift when real content arrives:

- **Library skeleton:** 16:9 image block + header text block (60% width × `text-h3` height) + muscle pill block + 2 MetaPill blocks + actions toggle block.
- **Daily skeleton:** header text block + 3 MetaPill blocks + WorkingWeight placeholder (sized to `text-mono-xl`, ~80×40px) + LiveSetList rows × set count (each row matches SetRow height) + 2 action button blocks.
- **Summary skeleton:** header text block + 2 MetaPill blocks + LoggedSetList rows × set count.

Reduced-motion: skeleton pulse is suppressed (`prefers-reduced-motion: reduce`); the static `bg-elevated` block stands alone. The skeleton is informational ("content is loading"), not decorative — preserve it but freeze the animation.

The keyframe lives in `src/styles/tokens.css` (added during craft):

```css
@keyframes spotter-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
```

Exposed in tailwind as `animate-skeleton-pulse` with a 1200ms duration.

## 8. Interaction Model

The card itself is **not a button** in any variant. Click targets are explicit children:

- **Library:** the checklist toggle is a 44px tappable region; tapping the image opens a detail sheet (planned, not in this shape). Card body is non-interactive.
- **Daily:** the [Log set] and [Rest] buttons are explicit. Long-press on a set row in LiveSetList opens a sheet (delete/duplicate/note) — that interaction lives in SetRow, not card.
- **Summary:** read-only. No hover, no tap.
- **Preview:** Confirm/Swap buttons in Actions; card is otherwise non-interactive.

Keyboard: card is `<article>`, not `<button>`. Children carry their own focus. Tab order: Image (if `<a>` wraps it for detail sheet) → Header → interactive parts in source order. Focus ring is the spec lime ring on each interactive child; no card-level focus.

Touch: every interactive child meets 44px hitbox per DESIGN.md and the just-shipped Button primitive.

## 9. Content Requirements

All strings flow through `i18n` keys. Hardcoded English in this primitive is a CI-rejectable lint (per spotter-design rule #5).

| Slot                      | Key path                              | EN example                       | Notes                                                                                       |
| ------------------------- | ------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| Empty image alt           | `exerciseCard.image.empty`            | "No image available"             | Spoken by SR; not visible                                                                   |
| Image fail alt            | `exerciseCard.image.failed`           | "Image unavailable"              | Same                                                                                        |
| Library: add label        | `exerciseCard.library.addToPlan`      | "Add to plan"                    | Tooltip + `aria-label` on toggle                                                            |
| Library: in-plan label    | `exerciseCard.library.inPlan`         | "In plan"                        |                                                                                             |
| Daily: log set            | `exerciseCard.daily.logSet`           | "Log set"                        | Primary CTA                                                                                 |
| Daily: rest               | `exerciseCard.daily.rest`             | "Rest"                           | Followed by mono duration `90s`                                                             |
| Summary: skipped row a11y | `exerciseCard.summary.skipped`        | "Skipped"                        | `aria-label` on a `—` cell                                                                  |
| Preview: confirm          | `exerciseCard.preview.confirm`        | "Use this"                       | Primary CTA — *not* "Confirm" (less robotic per voice rules)                                |
| Preview: swap             | `exerciseCard.preview.swap`           | "Swap"                           | Default (neutral) variant                                                                   |
| AI-suggested label        | `exerciseCard.ai.suggested`           | "AI · suggested"                 | Inside AIBadge                                                                              |
| AI-calibrated label       | `exerciseCard.ai.calibrated`          | "AI · based on your last 4 sessions" | Inside AIBadge, after middle dot                                                        |

**Numerical formatting** (kg/lb, RPE, sets×reps) is fixed per DESIGN.md §4.3 MetaPill spec — `4×8`, `80kg`, `90s`, `RPE 7`. Format helpers live in `src/lib/format.ts` (to be added during implementation), not in the component.

**RTL exception:** numeric spans force LTR with `dir="ltr"` and use `tabular-nums` so columns align in both languages.

## 10. Accessibility

- Card root is `<article aria-labelledby={headerId}>`.
- Image has `alt` from the exercise name in the active UI language; falls back to muscle group + "exercise image" if name is missing.
- Set list rows in LoggedSetList are `<li>` inside an `<ol>` for reading order; LiveSetList is the same but the current row has `aria-current="step"`.
- AI provenance is conveyed in text inside AIBadge, not by color alone (the cyan disc is reinforcement, not the only signal).
- Color contrast verified via AccessLint after build. Anticipated risk areas: `text-text-muted` on `bg-surface` (4.5:1 minimum) and the AIBadge cyan label on `bg-elevated`.

## 11. Recommended impeccable references for craft

When this brief moves to `/impeccable craft`:

- **spatial-design.md** — the variant-specific layout rhythm needs careful spacing decisions
- **interaction-design.md** — for the Library checkbox + Preview Confirm/Swap pairing
- **typeset.md** — mono numerals as visual hero (Daily) is the biggest typographic opportunity
- spotter-design (project skill, auto-loads)
- composition-patterns (auto-activates on React work)

## 12. Open Questions (defer to craft, not now)

1. **Image source for library.** PRODUCT.md doesn't specify whether exercise images come from a bundled asset library or user-supplied URLs. If user-supplied, `isSafeImageUrl` validation runs at every render. Defer: assume bundled for v1, validate at the loader level if user-supplied lands later.
2. **LiveSetList "next set" affordance shape.** Is the next set tappable (focus + scroll into view) or is it just visually highlighted? Decide in SetLogger shape, not here.
3. **MetaPill in Daily.** When the working weight is the hero, do we still show the `80kg` MetaPill? Risk of duplication. Proposal: in Daily variant, the MetaPills omit weight (it's already the hero) and show only `4×8`, `RPE 7`, `90s`. Confirm during craft when we have a real layout to look at.
4. **Swap flow in preview.** The Swap button opens what — modal? inline card replace? sheet? Out of scope here; shape it when we shape Plan import.
5. **Long-press sheet on SetRow.** Belongs in SetLogger / SetRow shape. Not here.

## 13. Summary of resolved choices

- **Compound parts:** Image, Header (with Name, Muscle), Meta, Body, Actions, LiveSetList, LoggedSetList. Plus a private SetRow.
- **Variants (separate exports, not boolean prop):** Library, Daily, Summary. Plan import preview reuses Library.
- **WorkingWeight:** sibling primitive, not an ExerciseCard part.
- **AIBadge:** composed inside Header (when card-level) or next to specific values (when value-level). Never a dedicated card slot.
- **AIBadge collision rule:** when both card-level and value-level apply (e.g., AI-suggested exercise with AI-calibrated working weight in plan preview), only the **value-level** badge shows. The card-level marker is redundant context — if any value inside the card is itself marked AI, the card's AI provenance is already conveyed. Two badges on one card reads as decoration, not transparency.
- **No `mode` prop on SetList.** Two distinct components share a private SetRow.
- **Card surface:** `bg-surface` + `border-border-default` + `rounded-lg`, no shadow.
- **i18n:** all strings keyed; no hardcoded English.
- **a11y:** `<article>`, semantic lists, `aria-current` on live row, color is reinforcement not signal.

---

**Confirmation requested.** Reply with approval, edits, or questions before I move to `/impeccable craft` (which will write the actual component code).
