import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Input — Spotter-customized shadcn primitive.
 *
 * Customizations from the upstream shadcn Input:
 * - Hitbox: `min-h-11` (44px) per FR-022 / constitution mobile-first.
 *   Upstream ships `h-9` (36px), too small for thumb input.
 * - Background stays transparent: the input's affordance is the border
 *   (`border-input` → `#2a2a2e`). On any of the three Spotter dark
 *   surfaces (canvas, surface, elevated) this reads as "field you can
 *   type in" without committing to an elevation that fights its parent.
 * - Caret uses `accent-primary` (lime) — a quiet instrument-grade
 *   signature touch, consistent with the rest of the lime focus identity.
 * - Selection uses the lime token via the shadcn `primary` bridge:
 *   `bg-primary text-primary-foreground` → lime-on-dark.
 * - Focus ring matches `<Button>`: `ring-2 ring-ring ring-offset-2
 *   ring-offset-background` for consistency across the design system.
 * - Motion: `duration-micro ease-standard` per DESIGN.md §3.6.
 * - Aria-invalid: paired with icon/label per FR-023, never color-only.
 * - File-input styling omitted (no file inputs in P1; lands with image
 *   upload, if and when that arrives).
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & sizing — 44px hitbox via min-h-11.
        'flex min-h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2',
        // Typography — body text, primary on dark, muted placeholder.
        'text-body text-text-primary caret-accent-primary placeholder:text-text-muted',
        // Selection styling.
        'selection:bg-primary selection:text-primary-foreground',
        // Motion — animate color, border, and the focus ring shadow.
        'outline-none transition-[color,box-shadow,border-color] duration-micro ease-standard',
        // Focus ring — matches Button.
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Invalid state. Paired with FormMessage / icon for non-color signal.
        'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40',
        // Disabled.
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Input };
