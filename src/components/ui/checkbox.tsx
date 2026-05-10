import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Check } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

/**
 * Checkbox — Spotter-customized shadcn primitive built on Radix Checkbox.
 *
 * Customizations from upstream shadcn Checkbox:
 * - Visual size: `size-5` (20px). Larger than upstream `size-4` so the
 *   tick is legible on phones and the affordance reads as "this is
 *   tappable." See touch-target note below.
 * - Idle border: `border-border-hover` (= `#3a3a3e`). One step lighter
 *   than the default border so the checkbox reads as interactive
 *   without a hover/focus.
 * - Checked state: lime fill + canvas-dark check icon, mirroring the
 *   primary-button color identity. `data-[state=checked]` selectors
 *   from Radix.
 * - Indicator icon: Phosphor `Check` weighted bold for legibility at
 *   14px (`size-3.5`).
 * - Focus ring matches `<Button>` / `<Input>`.
 *
 * **Touch target note**: the checkbox visual is 20px; the constitution
 * requires ≥44×44 hitboxes for primary tap targets. Consumers should
 * wrap each Checkbox + Label pair in a `<label>` with `min-h-11
 * cursor-pointer` so the whole row is tappable. The native `<label>`
 * already routes clicks to the checkbox; no extra wiring needed.
 *
 *     <label className="flex min-h-11 items-center gap-3 cursor-pointer">
 *       <Checkbox id="mon" />
 *       <Label htmlFor="mon">Monday</Label>
 *     </label>
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-5 shrink-0 rounded-sm border border-border-hover bg-transparent',
        'outline-none transition-colors duration-micro ease-standard',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-accent-primary data-[state=checked]:bg-accent-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3.5" weight="bold" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
