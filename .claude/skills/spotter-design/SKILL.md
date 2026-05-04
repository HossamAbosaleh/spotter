---
name: spotter-design
description: Project-specific design and UI/UX rules for the Spotter app — a free, open-source, client-side gym tracker that bridges users to their AI coach. Use this skill whenever building, designing, reviewing, or modifying any UI in the Spotter project — including components, screens, design tokens, prompts, accessibility, motion, layout, copy, EN/AR bilingual content, or composition patterns. Auto-trigger on any work involving Spotter UI, even if the user does not say "design" — they may say "build the profile wizard," "fix the exercise card," "the timer button feels off," "create the prompt preview," and this skill should still load. Also invoke explicitly when the user types `/spotter-design` or asks to apply Spotter's design system. This skill coordinates Impeccable, AccessLint, and Vercel composition-patterns to produce work aligned with Spotter's identity rather than generic AI-app output.
---

# Spotter Design Skill

## What this skill is

This skill is the **integration layer** between Spotter's specific identity and the generic design tools used in the project (Impeccable, AccessLint, Vercel composition-patterns, shadcn/ui). It does not replace those skills — it tells you how to use them in a way that produces a _Spotter_ result, not a generic AI-app result.

## What this skill is not

- Not a design-taste skill (Impeccable owns that — invoke `/impeccable craft`, `/impeccable critique`, etc.)
- Not an accessibility checker (AccessLint owns that — use AccessLint for WCAG, contrast, keyboard nav)
- Not a component-architecture authority (Vercel composition-patterns owns that — let it activate when designing component APIs)
- Not a substitute for `DESIGN.md` (read `DESIGN.md` at the repo root for the full design system documentation)

---

## When to invoke each tool

When designing or modifying UI for Spotter, route the work through these tools in order:

```
1. spotter-design (this skill) — applies project context and rules (auto-loads)
2. Impeccable           — shapes how it looks and feels
3. composition-patterns — shapes the component API (auto-activates on React work)
4. AccessLint           — verifies accessibility
5. Impeccable detect    — runs as CI gate before merge (npx impeccable detect)
```

Do not invoke these tools sequentially as separate steps unless the task is large. For small tasks (a button variant, a microcopy fix), the rules below carry enough Spotter context to proceed directly. For larger tasks (a new screen, a new domain primitive), explicitly call `/impeccable shape` first to plan, then `/impeccable craft` to build, then `/impeccable critique` to review.

---

## Project context (essential)

Spotter is an open-source web app (PWA) that helps lifters use AI assistants (Claude, ChatGPT, Gemini) as personal trainers. Users fill out their profile and exercise preferences, the app generates a structured prompt they paste into their AI of choice, and the resulting plan flows back into Spotter as a tracker. After each session, a structured log goes back to the AI for ongoing coaching.

**Key positioning words:** AI-launchpad, tracker, bridge, coach, spotter (the gym metaphor). Avoid: "fitness," "workout app," "gym tracker" alone — those words don't carry Spotter's differentiator (the AI bridge).

**Primary user:** intermediate lifters who already use AI tools daily for work or personal life. Mid-20s to mid-40s. Lifts 3–5 days/week at a commercial gym. Has used Strong/Hevy/MyFitnessPal before and found something missing. Uses a smartphone primarily but may use desktop occasionally.

**Constitution (non-negotiable):**

- No server, no backend database — all data lives in the user's IndexedDB
- Free forever, no ads, no tracking
- Open source, MIT license
- Real security, not theatrical (CSP, input validation, no `dangerouslySetInnerHTML` on user data, file upload whitelist)
- Mobile-first, PWA, dark theme primary, EN/AR bilingual with full RTL

**See:** `DESIGN.md` for the full design system, `plan.md` for project roadmap, `constitution.md` for the principles.

---

## Spotter design tokens (reference summary)

These are reference values. The runtime source of truth is `tailwind.config.ts` and `src/styles/tokens.css`. If those disagree with this skill, those win.

**Color (dark theme primary):**

- `bg.canvas` — deepest background, `#0d0d0f`
- `bg.surface` — card surface, `#161618`
- `bg.elevated` — elevated cards, popovers, `#1c1c1f`
- `border.default` — subtle separators, `#2a2a2e`
- `border.muted` — barely-there separators
- `text.primary` — main body text, `#f0f0f0`
- `text.muted` — secondary, `#888`
- `text.dim` — tertiary, `#555`
- `accent.primary` — lime, `#e8ff47` — used for top sets, primary CTAs
- `accent.secondary` — orange, `#ff6b35` — used for metabolic sets, warnings
- `ai.indicator` — a single signature color/gradient for AI-generated content (defined in `DESIGN.md` after `/impeccable teach` runs in P0.5)

**Banned colors:**

- Pure black `#000` or pure gray (always tint per Impeccable anti-patterns)
- Purple-to-blue gradients (the AI-slop signature — explicitly avoid)
- High-saturation primary colors used for backgrounds

**Typography:**

- `display` — Bebas Neue (large headers, athletic feel — Spotter's distinctive choice)
- `body` — DM Sans (English body text)
- `body-ar` — Cairo (Arabic body text)
- `mono` — JetBrains Mono or similar (used for data: `RPE 8`, `5×8 @ 80kg`, `Set 3` — signals precision, common in AI-native UIs)

**Banned fonts:** Inter, Roboto, system-ui, Arial, Space Grotesk (per Impeccable — overused by AI).

**Spacing:** 4px base scale (4, 8, 12, 16, 24, 32, 48, 64).

**Motion:**

- Allowed easings: standard cubic-bezier(0.4, 0, 0.2, 1) for most things; cubic-bezier(0.16, 1, 0.3, 1) for emphasized exits
- **Banned easings:** bounce, elastic, overshoot — feel dated, signal AI slop
- Durations: 150ms (micro), 200ms (standard), 300ms (emphasized), 500ms (orchestrated reveals)
- Reduced motion respected always (`prefers-reduced-motion`)

**Border radii:** 8 / 12 / 16 / 999 (pill).

---

## Spotter-specific composition rules

These extend Vercel composition-patterns with Spotter-specific applications. The general rule (no boolean prop proliferation, prefer compound components and explicit variants) always applies — these are project-specific examples.

**ExerciseCard — the workhorse component:**

- Used in: library page, daily workout view, session summary, plan import preview
- Built from shadcn `Card` primitive + Spotter design tokens
- Compound API, not boolean props:
  - ✅ `<ExerciseCard><ExerciseCard.Image /><ExerciseCard.Header /><ExerciseCard.Meta /><ExerciseCard.Actions /></ExerciseCard>`
  - ❌ `<ExerciseCard hasImage hasMeta hasActions isCompact />`
- Variants are explicit: `<ExerciseCard.Library />`, `<ExerciseCard.Daily />`, `<ExerciseCard.Summary />` — each pre-arranges the right children for its context

**Plan / Block / TrainingDay hierarchy:**

- `<Plan>{children}</Plan>` provides plan context (active plan, blocks, current block index)
- `<Block>` reads from Plan context
- `<TrainingDay>` reads from Block context
- Avoids prop drilling 3 levels deep

**Bilingual content:**

- Wrap any text content in `<I18n keyPath="profile.weight" />` — never inline strings
- `<RTLProvider>` wraps any branch that needs to switch direction (the whole app, normally)
- For mixed-language content (e.g., "Bench Press <span lang='en'>Press</span>"), use the `<MixedLang>` primitive

**AI-generated content marking (transparency):**

- Anywhere a value is AI-generated (a working weight suggestion, a plan exercise selection, a smart-prompt question), wrap with `<AIBadge variant="generated|suggested|matched" />`
- This is a Spotter-specific transparency feature. The AIBadge uses the `ai.indicator` color and a small sparkle icon (used sparingly — once per AI-touched section, not per word)

**Forms:**

- `react-hook-form` + Zod schemas always (not the only-pattern, but THE pattern in Spotter — don't introduce alternatives without a strong reason)
- Use shadcn form primitives (Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage)
- Validate on blur for fields the user has touched, on submit for everything

**State persistence:**

- Form state auto-saves to IndexedDB on every change for any form longer than one screen
- Show a small "Saved" indicator briefly on save; never block UI

---

## Spotter-specific anti-patterns

In addition to all of Impeccable's anti-patterns and Vercel's React rules, these are project-specific things to avoid:

1. **Don't use `dangerouslySetInnerHTML` on user data.** Ever. Even for "trusted" content. React auto-escaping is mandatory for anything that touched user input or AI output.

2. **Don't render external image URLs without scheme validation.** Only `https:` and safe `data:image/*` URIs. Use the `isSafeImageUrl` helper from `src/utils/security.ts`.

3. **Don't store user images as base64 in localStorage.** IndexedDB only, via Dexie. localStorage is for tiny preferences (active day, week index).

4. **Don't make UI assume an API response.** Spotter has no backend. Every UI state must work without network — including offline.

5. **Don't hardcode strings.** Even "OK" and "Cancel" go through i18n. This catches a class of bugs early.

6. **Don't ignore RTL layout.** Use logical properties (`ms-4` not `ml-4`, `pe-2` not `pr-2`). Test every screen in AR direction before considering it done.

7. **Don't use emoji as functional icons.** Use lucide-react SVGs. Emoji are decoration only, never affordance (per Impeccable + UI/UX Pro Max anti-patterns).

8. **Don't mix sets/reps/weight notation.** The format is `Sets × Reps @ Weight RPE`. Example: `4 × 8 @ 80kg RPE 7`. Don't reinvent this.

9. **Don't surface AI provider names as design elements.** "Open in Claude" is fine as a button label, but don't theme the app around any specific provider — Spotter is provider-agnostic.

10. **Don't add motion to data displays.** Numbers should appear, not animate. Animation is for transitions and reveals, not for "look at this number." (Bypass: streaming AI text effects are fine because they communicate generation in progress.)

---

## Workflow examples

### Example 1: Building a new component (e.g., a smart-prompt suggestion card)

1. Auto-loaded: this skill provides project context, design tokens, composition rules
2. Invoke `/impeccable shape` to plan the visual structure
3. Build using shadcn `Card` as the base primitive, customized with Spotter tokens
4. Component API uses compound pattern (`<SmartPromptCard>...</SmartPromptCard>`)
5. Mark the AI-generated suggestion with `<AIBadge variant="suggested" />`
6. Add to `/_design` test page in both EN and AR
7. Invoke `/impeccable critique` for review
8. Run AccessLint contrast check on color combinations
9. Run `npx impeccable detect` locally before commit
10. Submit PR; CI runs the detect again as a gate

### Example 2: Fixing a microcopy issue (e.g., an empty state feels cold)

1. Auto-loaded: this skill loads project context, brand voice
2. Invoke `/impeccable clarify` (Impeccable's UX writing command) to improve the copy
3. Apply Spotter voice: warm but not chatty; direct but not robotic; technical terms (RPE, sets, kg) stay precise
4. Update both `en.json` and `ar.json` translations
5. Verify no anti-pattern triggered (no emoji as functional element, etc.)

### Example 3: Reviewing existing UI (e.g., the daily workout view feels generic)

1. Auto-loaded
2. Invoke `/impeccable audit` for technical quality (a11y, perf, responsive)
3. Invoke `/impeccable critique` for UX review
4. Run AccessLint full scan
5. Cross-reference findings with this skill's anti-patterns and composition rules
6. Apply fixes following the rules above

---

## Voice and tone (UX writing rules)

Spotter's voice is **the voice of a knowledgeable friend who lifts**. Not a coach barking orders. Not a chatbot trying to be helpful. Not an app trying to be cool.

- **Empty states:** invitational, not empty. "No sessions logged yet — your first one starts your history" — not "No data."
- **Errors:** human, not technical. "We couldn't load that image. Try a different URL?" — not "ERR: 404 IMG_LOAD_FAIL."
- **Confirmations:** brief, confident. "Saved." — not "Your changes have been successfully saved to your local browser storage."
- **AI-generated content disclaimers:** clear and present, not buried. "AI suggestion, based on your last 4 sessions." — visible, not in a tooltip.
- **Bilingual:** translations are not literal — they're cultural. The Arabic copy should feel native, not like translated English. Use Modern Standard Arabic for written instructions; common gym terminology where natural.

---

## When this skill conflicts with another skill

If guidance from this skill conflicts with Impeccable, AccessLint, or composition-patterns:

- **Constitution principles always win.** No design choice can violate the constitution.
- **Security rules always win.** No visual choice justifies opening an XSS vector or weakening CSP.
- **Accessibility wins over aesthetics.** A 4.5:1 contrast minimum is non-negotiable; Impeccable's "use tinted neutrals" must respect this.
- **For taste-level conflicts, Impeccable wins.** Impeccable has deep design knowledge; this skill encodes project specifics. If Impeccable says "use this typography pairing" and this skill says "use Bebas Neue + DM Sans," follow this skill (project-specific) — but if Impeccable suggests a _better_ pairing during P0.5's `/impeccable teach`, update this skill to match.

This skill is meant to evolve. When `DESIGN.md` is refined in P0.5, update this skill's token reference section to match. When new domain primitives are added, document them in the composition rules section.

---

## Quick reference: where to find what

| Need                                       | Where to look                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Token values (colors, typography, spacing) | `tailwind.config.ts`, `src/styles/tokens.css`                                  |
| Full design system rationale               | `DESIGN.md` at repo root                                                       |
| Project principles                         | `constitution.md` at repo root                                                 |
| Phase road map                             | `plan.md` at repo root                                                         |
| Component primitives                       | `src/components/ui/` (shadcn-derived) and `src/components/` (Spotter-specific) |
| i18n strings                               | `src/i18n/en.json`, `src/i18n/ar.json`                                         |
| Design test page                           | `/_design` route (development only)                                            |

---

## End of skill

If something Spotter-specific isn't covered here, it probably belongs in `DESIGN.md`. If it's a generic design rule, it probably belongs in Impeccable or composition-patterns. This skill stays small on purpose.
