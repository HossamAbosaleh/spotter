/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { Toast as ToastPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

/**
 * Toast — Spotter-customized shadcn primitive built on Radix Toast.
 *
 * Customizations from upstream shadcn Toast:
 * - Viewport positioning is mobile-first: full-width docked at the
 *   bottom edge (with iOS safe-area padding via
 *   `pb-[max(1rem,env(safe-area-inset-bottom))]`), graduating to a
 *   bottom-right max-width on `sm:` and up. The wizard is phone-first;
 *   a centered desktop toast that stretches across a 2k monitor reads
 *   wrong.
 * - Default toast surface: `bg-bg-elevated` (= `#1c1c1f`) with
 *   `border-border`. Sits one elevation step above where Cards live —
 *   toasts are transient overlays, not part of the page surface.
 * - Destructive variant: `bg-destructive` (= `#e35b4d`) with
 *   `text-destructive-foreground` (canvas-dark). Spec FR-023 requires
 *   a non-color signal for destructive state; consumers should pair
 *   the destructive toast with an icon in the toast body.
 * - Action button: tokenized to match the project's secondary button
 *   pattern (`min-h-9` keeps the toast compact rather than the wizard
 *   button's `min-h-11`; toasts are transient and the action is rarely
 *   the primary interaction).
 * - Close button: 32×32 hit area, `top-2 end-2` positioning works in
 *   both LTR and RTL via the logical `end-*` property.
 * - Motion: slide-up animation on open per DESIGN.md; opacity fade on
 *   close (no slide-down keyframe defined yet — could land in a future
 *   tokens.css update if the motion feels asymmetric in practice).
 * - Touch targets: close button is 32×32; on mobile the toast itself
 *   is full-width and dismissible by swipe (Radix `swipeDirection`
 *   handled at consumer's `<ToastProvider swipeDirection="right">`
 *   declaration; default is `right` which feels natural for LTR but
 *   may want to flip to `down` for the bottom-docked viewport).
 *
 * Exports:
 * - `ToastProvider` — wrap the app once near the root.
 * - `ToastViewport` — render once inside the provider.
 * - `Toast` — the toast container; takes `variant` for default vs
 *   destructive.
 * - `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose` —
 *   sub-components.
 * - `toastVariants` — exported for consumers that want to style their
 *   own toast surfaces consistently.
 */

const ToastProvider = ToastPrimitive.Provider;

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 outline-none',
        'pb-[max(1rem,env(safe-area-inset-bottom))]',
        'sm:bottom-4 sm:end-4 sm:start-auto sm:top-auto sm:max-w-md sm:flex-col',
        className
      )}
      {...props}
    />
  );
}

const toastVariants = cva(
  cn(
    'group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-md border p-4 pe-8 shadow-elevated',
    'transition-[transform,opacity] duration-emphasized ease-emphasized',
    'data-[state=open]:animate-slide-up data-[state=closed]:opacity-0',
    'data-[swipe=cancel]:translate-x-0',
    'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none'
  ),
  {
    variants: {
      variant: {
        default: 'bg-bg-elevated border-border text-text-primary',
        destructive:
          'bg-destructive border-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Toast({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> &
  VariantProps<typeof toastVariants>) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant ?? 'default'}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        'inline-flex min-h-9 shrink-0 items-center justify-center rounded-sm border border-border-hover bg-transparent px-3 text-body-sm font-medium',
        'transition-colors duration-micro ease-standard',
        'hover:bg-bg-surface',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'group-[.bg-destructive]:border-destructive-foreground/40 group-[.bg-destructive]:hover:bg-destructive-foreground/10',
        className
      )}
      {...props}
    />
  );
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  // No explicit text color — inherits from the Toast root's variant:
  // text-text-primary on default, text-destructive-foreground on
  // destructive. opacity-70 → 100% on hover provides the affordance.
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      toast-close=""
      className={cn(
        'absolute end-2 top-2 inline-flex size-8 items-center justify-center rounded-sm opacity-70',
        'transition-opacity duration-micro ease-standard',
        'hover:opacity-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    >
      <X className="size-4" />
    </ToastPrimitive.Close>
  );
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-body-sm font-medium', className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  // Color depends on the Toast root's variant. On default, override the
  // inherited text-text-primary with text-text-muted for visual hierarchy
  // against the title. On destructive, do NOT override — inherit
  // text-destructive-foreground so the description stays readable on the
  // red surface (the previous text-text-muted hardcode failed contrast).
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn(
        'text-body-sm group-data-[variant=default]:text-text-muted',
        className
      )}
      {...props}
    />
  );
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants,
};
