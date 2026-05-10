/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { Slot } from 'radix-ui';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Form — Spotter-customized shadcn primitive built on `react-hook-form`.
 *
 * This is the project's THE pattern for forms (constitution-locked):
 * `react-hook-form` + Zod resolver, exposed through this primitive set.
 * The wizard composes from `<Form>` + `<FormField>` + `<FormItem>` +
 * `<FormLabel>` + `<FormControl>` + `<FormDescription>` + `<FormMessage>`.
 *
 * Customizations from upstream shadcn Form:
 * - `<FormItem>` uses `grid gap-2` for vertical stacking with consistent
 *   12px gaps. Wizard inputs read top-down.
 * - `<FormLabel>` switches its text to `text-destructive` when the field
 *   has a validation error (via `data-error` attribute + selector). Pairs
 *   with `<FormMessage>` to satisfy FR-023 "color is never the sole signal"
 *   — the message text + the destructive border on the input + the
 *   destructive label all reinforce the error state.
 * - `<FormControl>` uses Radix `Slot` to forward aria-attributes
 *   (`aria-describedby`, `aria-invalid`, the form-item id) to whatever
 *   input primitive the field renders. The field input doesn't need to
 *   know about the Form context.
 * - `<FormDescription>` is `text-text-muted text-body-sm` — quiet helper
 *   text below the input.
 * - `<FormMessage>` renders `text-destructive text-body-sm`. Empty
 *   message + no children → renders nothing (no empty `<p>` left in the
 *   tree). The message text is the validation message string from
 *   react-hook-form / Zod.
 *
 * Exports the `useFormField()` hook alongside the components — required
 * because `<FormLabel>`, `<FormControl>`, `<FormDescription>`, and
 * `<FormMessage>` need to read the FormField + FormItem context to wire
 * up aria-* attributes correctly. The hook is the file's only
 * non-component export, hence the eslint-disable header.
 */

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn('grid gap-2', className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-body-sm text-text-muted', className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-body-sm text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
