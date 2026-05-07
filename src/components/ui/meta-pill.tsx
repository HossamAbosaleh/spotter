import * as React from 'react';

import { cn } from '@/lib/utils';

/*
 * MetaPill — exercise metadata chip (sets×reps, weight, rest, RPE).
 *
 * Spec: DESIGN.md §4.3.
 *   bg-bg-elevated, border border-border-muted,
 *   text-text-muted, font-mono text-mono-sm,
 *   px-3 py-1, radius-pill
 *
 * Multiple pills are laid out by the parent (Meta slot of ExerciseCard)
 * with `gap-2`.
 *
 * Numerals are forced to LTR + tabular so columns align in both languages
 * (DESIGN.md §5.2 RTL implementation).
 *
 * Format helpers in src/lib/format.ts produce the strings; this primitive
 * only handles surface and typography.
 */
type MetaPillProps = {
  children: React.ReactNode;
  className?: string;
};

export function MetaPill({ children, className }: MetaPillProps) {
  return (
    <span
      dir="ltr"
      data-slot="meta-pill"
      className={cn(
        'inline-flex items-center rounded-pill border border-border-muted bg-bg-elevated px-3 py-1 font-mono text-mono-sm tabular-nums text-text-muted',
        className
      )}
    >
      {children}
    </span>
  );
}
