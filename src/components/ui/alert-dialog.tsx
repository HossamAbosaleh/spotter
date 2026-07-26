import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * AlertDialog — Spotter-customized Radix AlertDialog primitive.
 *
 * Why AlertDialog (not Dialog) for destructive confirmations:
 * - Default behaviour does NOT dismiss on overlay click — a destructive
 *   confirm should require an explicit Cancel or Confirm decision.
 *   `Esc` still dismisses (matches Radix's accessibility contract).
 * - Forces a description AND a title via aria-labelledby /
 *   aria-describedby — keeps screen-reader UX consistent.
 *
 * Surface tokens follow the Toast convention since dialogs sit one
 * elevation step above Cards (transient overlays, not page surface):
 * - Content: `bg-bg-elevated` with `border-border`
 * - Overlay: black scrim at 60% to give visual weight to the dialog
 *
 * Animation: slide-up + opacity on open; fade-out on close. Matches
 * Toast's authored timing tokens (`duration-emphasized ease-emphasized`).
 *
 * Composition: explicit sub-components per the project's composition
 * rules — no boolean prop proliferation. Consumers wire their own
 * action buttons (typically `Button` primitive) inside the footer
 * rather than the dialog rendering them.
 */

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/60',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md rounded-lg border border-border bg-bg-elevated p-6 shadow-elevated',
          'flex flex-col gap-4',
          'transition-[transform,opacity] duration-emphasized ease-emphasized',
          'data-[state=open]:animate-slide-up data-[state=closed]:opacity-0',
          'focus-visible:outline-none',
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-start', className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  // Stacks vertically on narrow viewports (mobile-first); aligns to
  // inline-end horizontally from `sm:` up. Matches the Toast viewport's
  // breakpoint philosophy.
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        'font-display text-h2 leading-none tracking-tight text-text-primary',
        className
      )}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-body text-text-muted', className)}
      {...props}
    />
  );
}

// Action / Cancel are passthroughs — consumers wire their own Button
// primitive inside (via asChild) so destructive vs default vs ghost
// styling stays tokenized at the Button level.
const AlertDialogAction = AlertDialogPrimitive.Action;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
