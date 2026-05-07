import type { CSSProperties } from 'react';

/*
 * /_palette — temporary, dev-only accent palette comparison.
 *
 * Renders 5 candidate accent palettes side-by-side using scoped CSS
 * variable overrides. Real tokens in tailwind.config.ts and globals.css
 * are NOT modified — this route is fully self-contained.
 *
 * Constraints:
 * - Dark-mode only (uses existing bg.canvas / bg.surface / bg.elevated).
 * - AIBadge ai.indicator stays stable; we override only primary/secondary.
 * - Deleting this file + its route entry reverts cleanly to current state.
 *
 * Once a winner is picked, the real swap is a separate commit that
 * updates tailwind.config.ts, globals.css, and DESIGN.md §3.1.
 */

type Candidate = {
  letter: string;
  name: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  contrast: string;
};

const CANDIDATES: Candidate[] = [
  {
    letter: 'A',
    name: 'Cyan + Amber — tool/terminal vibe',
    primary: '#67e8f9',
    primaryForeground: '#0d0d0f',
    secondary: '#fbbf24',
    contrast: '14.6:1 (cyan/dark)',
  },
  {
    letter: 'B',
    name: 'Sky + Rose — modern sport tech',
    primary: '#38bdf8',
    primaryForeground: '#0d0d0f',
    secondary: '#fb7185',
    contrast: '9.2:1 (sky/dark)',
  },
  {
    letter: 'C',
    name: 'Emerald + Slate — minimal/professional',
    primary: '#34d399',
    primaryForeground: '#0d0d0f',
    secondary: '#94a3b8',
    contrast: '10.8:1 (emerald/dark)',
  },
  {
    letter: 'D',
    name: 'Teal + Coral — engineered tool, balanced',
    primary: '#14b8a6',
    primaryForeground: '#f0f0f0',
    secondary: '#fb7185',
    contrast: '4.5:1 (teal/light) — borderline pass',
  },
  {
    letter: 'E',
    name: 'Lime + Orange — current (control)',
    primary: '#e8ff47',
    primaryForeground: '#0d0d0f',
    secondary: '#ff6b35',
    contrast: '17.2:1 (lime/dark) — current',
  },
];

function paletteVars(c: Candidate): CSSProperties {
  return {
    ['--palette-primary' as string]: c.primary,
    ['--palette-primary-foreground' as string]: c.primaryForeground,
    ['--palette-secondary' as string]: c.secondary,
  } as CSSProperties;
}

function PrimaryButtonMock() {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center justify-center rounded-md bg-[var(--palette-primary)] px-3 text-body-sm font-medium text-[var(--palette-primary-foreground)]"
    >
      Use this
    </button>
  );
}

function SmallPrimaryButtonMock() {
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center justify-center rounded-md bg-[var(--palette-primary)] px-2.5 text-caption font-medium text-[var(--palette-primary-foreground)]"
    >
      Start
    </button>
  );
}

function WorkingWeights() {
  return (
    <div className="flex items-end gap-8">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
          Calibrated
        </p>
        <span className="font-mono text-mono-xl text-[var(--palette-primary)]">
          80kg
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
          Uncalibrated
        </p>
        <span className="inline-flex items-center gap-2 font-mono text-mono-xl text-text-muted">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--palette-secondary)]"
          />
          80kg
        </span>
      </div>
    </div>
  );
}

function SurfaceMockCard({
  surfaceClass,
  label,
}: {
  surfaceClass: string;
  label: string;
}) {
  return (
    <div
      className={`flex flex-1 flex-col gap-3 rounded-md border border-border p-3 ${surfaceClass}`}
    >
      <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <SmallPrimaryButtonMock />
    </div>
  );
}

function SurfaceTrio() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <SurfaceMockCard surfaceClass="bg-bg-canvas" label="bg.canvas" />
      <SurfaceMockCard surfaceClass="bg-bg-surface" label="bg.surface" />
      <SurfaceMockCard surfaceClass="bg-bg-elevated" label="bg.elevated" />
    </div>
  );
}

function SecondaryBadgeMock() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-[var(--palette-secondary)] px-2.5 py-1 font-mono text-mono-sm font-medium uppercase tracking-wider text-bg-canvas">
      Calibrate
    </span>
  );
}

function AIBadgeMock() {
  // Mirrors the real AIBadge cyan-teal — intentionally stable across
  // candidates so the comparison isolates primary/secondary changes.
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-ai-indicator/30 bg-ai-indicator/10 px-2.5 py-1 font-mono text-mono-sm font-medium uppercase tracking-wider text-ai-indicator">
      AI
    </span>
  );
}

function CandidateSection({ candidate }: { candidate: Candidate }) {
  return (
    <section
      className="flex flex-col gap-6 border-t border-border-muted py-12 first:border-t-0 first:pt-0"
      style={paletteVars(candidate)}
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-display-md text-text-primary">
            {candidate.letter}
          </span>
          <h2 className="font-display text-h2 text-text-primary">
            {candidate.name}
          </h2>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-body-sm text-text-muted">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: candidate.primary }}
            />
            <span>primary {candidate.primary}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-sm border border-border"
              style={{ background: candidate.primaryForeground }}
            />
            <span>primary-foreground {candidate.primaryForeground}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: candidate.secondary }}
            />
            <span>secondary {candidate.secondary}</span>
          </div>
          <span>contrast {candidate.contrast}</span>
        </dl>
      </header>

      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            1 · Primary CTA
          </p>
          <div className="flex items-center gap-3">
            <PrimaryButtonMock />
            <AIBadgeMock />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            2 · Working weight
          </p>
          <WorkingWeights />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            3 · Accent across surface elevations
          </p>
          <SurfaceTrio />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            4 · Secondary accent
          </p>
          <div className="flex items-center gap-3">
            <SecondaryBadgeMock />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PaletteComparison() {
  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-4xl flex-col">
        <header className="mb-6">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            /_palette · dev-only · non-destructive
          </p>
          <h1 className="mt-2 font-display text-display-md text-text-primary">
            Accent palette comparison
          </h1>
          <p className="mt-3 max-w-2xl text-body text-text-muted">
            Five candidate accents rendered against the existing dark surfaces.
            Real tokens are unchanged; each section overrides only{' '}
            <code className="font-mono">--palette-primary</code>,{' '}
            <code className="font-mono">--palette-primary-foreground</code>, and{' '}
            <code className="font-mono">--palette-secondary</code>. AIBadge
            cyan-teal is held constant as a reference.
          </p>
        </header>

        {CANDIDATES.map((c) => (
          <CandidateSection key={c.letter} candidate={c} />
        ))}
      </div>
    </main>
  );
}
