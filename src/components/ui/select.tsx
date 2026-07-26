import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { CaretDown, CaretUp, Check } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

/**
 * Select — Spotter-customized shadcn primitive built on Radix Select.
 *
 * Customizations from upstream shadcn Select:
 * - Trigger matches `<Input>` exactly: `min-h-11`, transparent bg with
 *   `border-input`, lime focus ring, body-text typography. The dropdown
 *   IS a form field and should look like one.
 * - Content (popover) sits on `bg-bg-elevated` (= `#1c1c1f`) — one
 *   elevation step above where Cards live, matching the popover token
 *   in the design system.
 * - Items use lime check icon (Phosphor `Check`) as the indicator. Item
 *   typography is body text on text-primary; focused item gets a
 *   `bg-bg-surface` highlight (one step below elevated, so the
 *   highlighted item lifts subtly OFF the popover, not above it).
 * - Trigger caret: Phosphor `CaretDown`, opacity 60% so it reads as
 *   secondary affordance to the value text.
 * - Motion: open/close animations via `data-[state=open]:animate-fade-in`.
 * - Touch target: `min-h-11` on trigger; `py-2` on items keeps each
 *   option ≥40px (close to 44px without forcing a lot of vertical
 *   slack inside long dropdowns).
 */

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // Layout & sizing — matches Input's min-h-11 + padding.
        'flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2',
        // Typography.
        'text-body text-text-primary data-[placeholder]:text-text-muted',
        // Motion.
        'outline-none transition-[color,box-shadow,border-color] duration-micro ease-standard',
        // Focus ring — matches Input.
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Invalid.
        'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40',
        // Disabled.
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        // Caret sizing.
        '[&_svg]:size-4 [&_svg]:shrink-0',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDown className="opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-bg-elevated text-text-primary shadow-elevated',
          'data-[state=open]:animate-fade-in',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        'px-2 py-1.5 font-mono text-caption uppercase tracking-widest text-text-muted',
        className
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Layout — pl-8 reserves space for the check indicator.
        'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-2 pe-2 ps-8 text-body text-text-primary outline-none',
        // Hover / focus.
        'focus:bg-bg-surface',
        // Motion.
        'transition-colors duration-micro ease-standard',
        // Disabled.
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        // Indicator icon sizing.
        '[&_svg]:size-4 [&_svg]:shrink-0',
        className
      )}
      {...props}
    >
      <span className="absolute start-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-accent-primary" weight="bold" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('-mx-1 my-1 h-px bg-border-muted', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1 text-text-muted',
        className
      )}
      {...props}
    >
      <CaretUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1 text-text-muted',
        className
      )}
      {...props}
    >
      <CaretDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
