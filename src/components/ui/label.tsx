import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Label — Spotter-customized shadcn primitive built on Radix Label.
 *
 * Customizations from upstream shadcn Label:
 * - Typography: `text-body-sm font-medium leading-none text-text-primary`.
 *   Spotter form labels are 13px (body-sm) for density; identity comes
 *   from weight, not size.
 * - Disabled handling: peer-disabled and group-data-[disabled=true]
 *   selectors fade the label in step with the input it labels. Matches
 *   shadcn upstream patterns so peers (`<input class="peer">`) work
 *   without special wiring.
 * - Spacing: `gap-2` between label text and any inline icon/asterisk.
 *
 * Touch target intentionally NOT enforced here — the label is decorative
 * affordance for the input it controls. Tap targets are owned by the
 * input itself (`min-h-11` on Input/Select/etc.).
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex select-none items-center gap-2 text-body-sm font-medium leading-none text-text-primary',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Label };
