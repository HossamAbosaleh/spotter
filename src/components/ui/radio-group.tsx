import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { Circle } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

/**
 * RadioGroup — Spotter-customized shadcn primitive built on Radix
 * RadioGroup.
 *
 * Customizations from upstream shadcn RadioGroup:
 * - Root layout: `grid gap-3` (column by default). Wizard radios stack
 *   vertically; consumers can override with `grid-flow-col` for
 *   horizontal layouts.
 * - Item visual: `size-5` (20px). Larger than upstream `size-4` for
 *   legibility on phones. See touch-target note below.
 * - Idle border: `border-border-hover` (= `#3a3a3e`). One step lighter
 *   than the default border so the radio reads as interactive without
 *   any hover/focus.
 * - Checked state: lime border + lime filled `Circle` indicator. Uses
 *   Phosphor `Circle` with `weight="fill"` to render a clean dot
 *   (cleaner than a CSS-only filled-circle indicator at small sizes).
 * - Focus ring matches `<Button>` / `<Input>`.
 *
 * **Touch target note**: the radio visual is 20px; the constitution
 * requires ≥44×44 hitboxes. Consumers should wrap each Item + Label
 * pair in a `<label>` with `min-h-11 cursor-pointer` so the whole row
 * is tappable. The native `<label>` already routes clicks to the
 * radio item; no extra wiring needed.
 *
 *     <label className="flex min-h-11 items-center gap-3 cursor-pointer">
 *       <RadioGroupItem value="male" id="r-male" />
 *       <Label htmlFor="r-male">Male</Label>
 *     </label>
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'aspect-square size-5 rounded-full border border-border-hover bg-transparent text-accent-primary',
        'outline-none transition-colors duration-micro ease-standard',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-accent-primary',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <Circle className="size-2.5 text-accent-primary" weight="fill" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
