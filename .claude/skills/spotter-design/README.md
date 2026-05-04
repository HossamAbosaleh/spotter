# Spotter Design Skill — Integration Guide

This folder contains the `spotter-design` skill — a project-specific Claude skill that provides Spotter's design rules, tokens, and composition patterns to Claude Code.

## How it fits

This skill is **the integration layer** between three generic design tools and the Spotter project. It does not replace those tools — it tells Claude how to use them in a way that produces work aligned with Spotter's identity.

```
┌─────────────────────────────────────────────────────────────┐
│  spotter-design (this skill)                                 │
│  • Project context + tokens + composition rules              │
│  • Coordinates the generic tools below                       │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌────────┐         ┌─────────┐       ┌──────────────────┐
   │Impeccable│       │AccessLint│      │composition-patterns│
   │(visual  │       │(WCAG +  │       │(component API     │
   │ taste)  │       │contrast)│       │ patterns)         │
   └─────────┘       └─────────┘       └──────────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                  ┌─────────────────┐
                  │ shadcn/ui base  │
                  │ (the foundation │
                  │  we extend)     │
                  └─────────────────┘
```

## Installation

This skill is installed alongside the others Spotter uses. From the repo root:

```bash
# This skill (project-specific, lives in the repo)
# Already at .claude/skills/spotter-design/

# Generic skills (installed into your local Claude Code)
# 1. Impeccable
git clone https://github.com/pbakaus/impeccable.git /tmp/impeccable
cp -r /tmp/impeccable/dist/claude-code/.claude/skills/impeccable ~/.claude/skills/

# 2. AccessLint
/plugin marketplace add accesslint/claude-marketplace
/plugin install accesslint@accesslint

# 3. Vercel composition-patterns
git clone https://github.com/vercel-labs/agent-skills.git /tmp/vercel-skills
cp -r /tmp/vercel-skills/skills/composition-patterns ~/.claude/skills/
```

After installation, restart Claude Code and verify all four skills load: `spotter-design` (auto-triggers on Spotter UI), `impeccable` (manual via `/impeccable *` commands), `accesslint` (auto + manual), `composition-patterns` (auto on React component work).

## Triggering

`spotter-design` is configured to auto-trigger on any UI work in this project. You don't need to invoke it explicitly. It loads alongside whatever other skill activates.

You **can** invoke it explicitly if you want — say "use the spotter-design skill to..." or `/spotter-design` if Claude Code's `/skills` resolves the alias.

## Updating

When the design system evolves:

1. Update `DESIGN.md` at the repo root first (it's the source of truth)
2. Then update `.claude/skills/spotter-design/SKILL.md` to keep its token summary aligned
3. Document the change in CHANGELOG.md under the version that ships the change

## Security note

Per the security guidance in the source articles you read, every skill installed should be reviewed before activation:

- **spotter-design** — written by you (transparent, in your repo, no external scripts)
- **Impeccable** — Apache 2.0 license, Paul Bakaus (read SKILL.md before activating, verify CLI install via `npx impeccable detect --help`)
- **AccessLint** — MIT license, accesslint org (read SKILL.md, check the bundled MCP server)
- **composition-patterns** — Vercel-Labs official (high trust, MIT license, large org)

Run `npm audit` after each skill installs new dependencies.

## When to update

This skill needs updating when:

- A new Spotter-specific component primitive is added
- Design tokens change in `tailwind.config.ts`
- A new anti-pattern is discovered in code review
- The constitution amends a principle
- A new external skill joins the stack

Don't update for general design taste improvements — those go into Impeccable's commands or the broader DESIGN.md.
