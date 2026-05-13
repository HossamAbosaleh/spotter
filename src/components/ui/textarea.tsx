import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Textarea — Spotter-customized shadcn-style primitive for multi-line
 * text. Mirrors `<Input>`'s customizations one-for-one; only the
 * element type and a few size/resize tokens differ.
 *
 * Customizations:
 * - Element: `<textarea>` (not `<input>`).
 * - Hitbox: `min-h-24` (96px ≈ 4 lines). Comfortable for a sentence or
 *   two; users can drag taller via `resize-y` when they want to write
 *   more. Single-line `min-h-11` (44px) from Input would feel cramped
 *   for free-text fields where the user is invited to elaborate.
 * - Resize: `resize-y` only — horizontal resize would break the card
 *   layout. Some browsers default to `resize: both`; this locks it.
 * - Background stays transparent: the field's affordance is the border
 *   (`border-input`), same as Input. Reads as "type here" on any of
 *   Spotter's three dark surfaces without committing to an elevation
 *   that fights its parent.
 * - Caret uses `accent-primary` (lime), matching Input.
 * - Selection uses the lime token via shadcn's `primary` bridge:
 *   `bg-primary text-primary-foreground` — lime-on-dark.
 * - Focus ring matches `<Button>` / `<Input>` for cross-primitive
 *   consistency: `ring-2 ring-ring ring-offset-2 ring-offset-background`.
 * - Motion: `duration-micro ease-standard` per DESIGN.md §3.6.
 * - Aria-invalid: paired with FormMessage / icon per FR-023, never
 *   color-only.
 *
 * Touch target: the rendered textarea itself is ≥96px tall, so the
 * entire visible field is the tap area. No consumer wrapper required
 * (unlike Checkbox / RadioGroup, which need a `min-h-11 <label>`
 * wrapper because their visual is ~20px).
 *
 * No `inputMode`: textareas don't surface virtual-keyboard hints the
 * way `<input>` does.
 *
 * Differences from Input — at a glance:
 * | Property   | Input        | Textarea     |
 * | ---------- | ------------ | ------------ |
 * | Element    | input        | textarea     |
 * | Min height | min-h-11     | min-h-24     |
 * | Resize     | n/a          | resize-y     |
 * | inputMode  | passed thru  | omitted      |
 * | Everything else (border, caret, selection, focus, motion, invalid) is identical. |
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Layout & sizing — 4-line default, vertical resize only.
        'flex min-h-24 w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-3 py-2',
        // Typography — body text, primary on dark, muted placeholder.
        'text-body text-text-primary caret-accent-primary placeholder:text-text-muted',
        // Selection styling.
        'selection:bg-primary selection:text-primary-foreground',
        // Motion — animate color, border, and the focus ring shadow.
        'outline-none transition-[color,box-shadow,border-color] duration-micro ease-standard',
        // Focus ring — matches Input / Button.
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

export { Textarea };
