/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

// Variants follow DESIGN.md §4.3.
// `default` is intentionally `secondary` semantics (neutral elevated surface).
// `primary` is the lime CTA — used once per screen. Making it explicit
// prevents shadcn primitives from accidentally rendering screaming-lime
// buttons whenever they omit a variant prop.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-colors duration-micro ease-standard outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Neutral default: elevated surface + subtle border. Most buttons.
        default:
          'bg-secondary text-secondary-foreground border-border hover:bg-muted aria-expanded:bg-muted',
        // The CTA. One per screen.
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85',
        // In-card secondary actions, nav items.
        ghost:
          'bg-transparent text-foreground hover:bg-secondary aria-expanded:bg-secondary',
        // Delete confirmations only.
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
      },
      size: {
        // sm 32px — compact toolbar.
        sm: 'h-8 px-3 text-body-sm',
        // md 40px visual / 44px hitbox via min-h-11. Default.
        default: 'min-h-11 px-4 py-2 text-body-sm',
        // lg 48px — hero CTA.
        lg: 'h-12 px-6 text-body',
        // Square icon buttons. Touch target meets 44px on `icon`.
        'icon-sm': "size-8 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-11 [&_svg:not([class*='size-'])]:size-5",
        'icon-lg': "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
