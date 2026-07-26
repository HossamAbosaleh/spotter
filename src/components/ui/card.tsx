import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Card — Spotter-customized shadcn primitive.
 *
 * Customizations from upstream shadcn Card:
 * - Surface: `bg-bg-surface` (= #161618). The card lifts one elevation
 *   step above `bg-bg-canvas` (the page) and below `bg-bg-elevated`
 *   (popovers / dialogs / select content). Border carries the line
 *   between surface and canvas.
 * - Radius: `rounded-lg` (16px) per DESIGN.md radius scale. Cards use
 *   the larger of the two interior radii; buttons / inputs use `rounded-md`.
 * - Default vertical padding `py-6` with sub-components owning their own
 *   horizontal `px-6`. Lets `<CardContent>` lay out edge-to-edge content
 *   when needed (e.g., an embedded form that draws its own gutters).
 * - Title typography: `font-display text-h2 leading-none tracking-tight`
 *   — Bebas Neue at 1.25rem with tight tracking. Athletic identity hook.
 * - Description typography: `text-body-sm text-text-muted` — quieter,
 *   subordinate to the title.
 *
 * Compose with explicit sub-components (CardHeader / CardTitle /
 * CardDescription / CardContent / CardFooter) per the project's
 * composition rules — no boolean prop proliferation.
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-border bg-bg-surface py-6 text-text-primary',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1 px-6', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-display text-h2 leading-none tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-body-sm text-text-muted', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
