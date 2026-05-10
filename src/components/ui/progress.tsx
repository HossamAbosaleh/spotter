import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Progress — Spotter-customized shadcn primitive built on Radix Progress.
 *
 * Customizations from upstream shadcn Progress:
 * - Track color: `bg-bg-elevated`. Lifts the track above the page canvas
 *   so the unfilled portion reads as "data area," not "missing pixels."
 * - Indicator color: `bg-accent-primary` (lime). The fill IS the data.
 * - Bilingual / RTL: indicator uses `start-0` (logical inset-inline-start)
 *   plus `width: ${value}%` on the inline style, so the bar fills from
 *   the inline-start in both LTR and AR-RTL. Upstream shadcn translates
 *   the indicator with `translateX(-${100 - value}%)`, which is
 *   direction-aware in CSS but inverts visually when used inside an
 *   `dir="rtl"` ancestor without explicit handling. The width-based
 *   approach is unambiguous in both directions.
 * - Motion: `duration-emphasized ease-emphasized` (300ms, the deeper
 *   curve). Wizard step transitions are state changes worth noticing,
 *   not micro-interactions.
 * - Height: `h-2` (8px) for inline indicators (e.g., wizard step bar);
 *   override per consumer if a chunkier bar is wanted.
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-bg-elevated',
        className
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="absolute inset-y-0 start-0 bg-accent-primary transition-[width] duration-emphasized ease-emphasized"
        style={{ width: `${clamped}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
