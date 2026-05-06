# Product

## Register

product

> Override per task: switch to **brand** for landing-page, marketing, or campaign surfaces. The default tracker app, settings, prompt screens, daily view, and library are all **product**.

## Users

Lifters who already use AI tools (Claude, ChatGPT, Gemini) and want them to coach their training, but find the manual setup and daily reporting too painful to sustain. They train seriously enough to care about RPE, top sets, working weights — not casual gym-goers. They want their data on their device, not on someone else's server. Bilingual EN/AR users are first-class, not an afterthought.

The core context: phone in hand, between sets, in a gym. Logging a set takes <5 seconds or it doesn't happen.

## Product Purpose

Spotter is the bridge between a lifter and their AI coach. It removes the 30+ minutes of manual setup that articles like "Turn Claude into the Ultimate Personal Trainer" require — generating structured prompts from profile data, ingesting AI-returned plans into a real tracker, and producing session reports the user pastes back to keep the coaching loop alive.

Success = a user actually sustains AI-coached training because the human-side workflow stopped being painful.

## Brand Personality

**Three words:** precise, athletic, engineered.

The voice of a knowledgeable friend who lifts and happens to be deep into AI tools. Technical without being pedantic. Confident without being arrogant. Numbers are exact (`4 × 8 @ 80kg RPE 7`). Copy is human (`Saved.` not `Your changes have been successfully persisted.`). AI is transparent — when it touched something, it says so.

The product should feel like an engineered tool, not a consumer fitness app. Closer to Linear's settings panel and Whoop's daily metrics than a Nike training video.

## Anti-references

Spotter explicitly should not look or feel like:

- **Strong / Hevy / Jefit** — generic fitness-app commodity. Bright primary buttons over stock illustrations, gamification badges, busy nav, "Start Workout" hero in primary blue. Reads as another tracker among hundreds.
- **Purple-blue AI gradient slop** — ChatGPT-clone aesthetic. Sparkle icons, glassmorphic AI badges, the default "we use AI" visual language. Spotter uses AI; it does not advertise it through aesthetic clichés.
- **Nike Training Club / Apple Fitness+** — consumer-warm, brand-led, cinematic photography, motivational typography, lifestyle imagery. Spotter is data-led, not brand-led.
- **Crypto / SaaS dashboards** — chart-glut. Donut charts, gradient sparklines, the hero-metric template, identical KPI grids. Spotter shows the next set, not a portfolio.

## Design Principles

1. **Honesty over decoration.** Every element earns its place. Decoration is purposeful or absent. No icon for the sake of icons, no animation for the sake of animation.
2. **Data is precise; presentation is human.** The numbers never round for aesthetics; the copy around them never hides behind jargon. `4 × 8 @ 80kg` lives next to `Saved.`
3. **The user owns their data, visibly.** Privacy is a design feature, not a footer line. Export and delete are one tap away. The product looks and feels like the user is in control because they are.
4. **AI is transparent, not magical.** AI-generated content is marked. Suggestions show what they're based on. No hidden generation, no unmarked influence.
5. **Instrument, not appliance.** Spotter is a tool a lifter reaches for during a set. Tool-quality precision beats consumer warmth. Closer to Linear or Raycast than Strong or Hevy.

## Accessibility & Inclusion

- **WCAG 2.1 AA** as a non-negotiable baseline. Color contrast 4.5:1 for normal text, 3:1 for large text.
- **Bilingual EN/AR with full RTL.** Logical properties (`ms-*`, `pe-*`) only — never directional. Every screen verified in both directions before merge. Arabic copy is native, not translated.
- **Mobile-first, thumb-first.** Touch targets ≥44×44px. Forms big and tappable. Modals respect the keyboard.
- **No color-only state differentiation.** Every color-coded state also carries an icon, label, or shape change.
- **`prefers-reduced-motion` respected.** Animations either skip or shorten to <100ms.
- **Keyboard accessible.** Visible focus indicators on every focusable element. ARIA labels on icon-only buttons. Errors announced via `aria-live`.
- **AccessLint runs as a CI gate.** Issues block merge.
