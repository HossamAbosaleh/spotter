/**
 * Landing page.
 *
 * Phase P0 placeholder. Will be replaced in P1 with the real landing page
 * (one-sentence value prop, "Try it" CTA, "View on GitHub" link, privacy
 * line). For now: confirms the stack runs end-to-end.
 */
function Landing() {
  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-16 text-text-primary">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
          v0.1.0 · Phase P0 · Foundation
        </p>
        <h1 className="mt-4 font-display text-display-lg leading-none text-text-primary">
          SPOTTER
        </h1>
        <p className="mt-2 font-display text-h1 text-accent-primary">
          Your gym, your data, your AI coach.
        </p>
        <p className="mt-8 text-body text-text-muted">
          This is the Phase P0 foundation build. The stack is up: React + Vite +
          TypeScript + Tailwind, deployed on Vercel as a static site.
        </p>
        <p className="mt-4 text-body text-text-muted">
          Next phase:{' '}
          <span className="text-text-primary">
            P0.5 — Design System Foundation
          </span>
          . Run{' '}
          <code className="rounded-sm bg-bg-elevated px-1.5 py-0.5 font-mono text-mono text-accent-primary">
            /impeccable teach
          </code>{' '}
          to begin.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4 text-body-sm text-text-dim">
          <span className="rounded-pill border border-border px-3 py-1">
            No server
          </span>
          <span className="rounded-pill border border-border px-3 py-1">
            Free forever
          </span>
          <span className="rounded-pill border border-border px-3 py-1">
            Open source · MIT
          </span>
          <span className="rounded-pill border border-border px-3 py-1">
            All data local
          </span>
        </div>
      </div>
    </main>
  );
}

export default Landing;
