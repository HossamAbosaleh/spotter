import type { ReactNode } from 'react';
import { PencilSimple } from '@phosphor-icons/react';

/**
 * Renders one row inside the wizard Review / /profile section list:
 * a stacked title + summary with a pencil affordance on the right.
 *
 * `onClick` controls editability — pass `undefined` for read-only
 * rows (which also disables the underlying <button> so the cursor
 * and focus ring don't suggest interactivity).
 *
 * Lives in its own file because section-formatters.tsx exports pure
 * functions, and mixing component + non-component exports breaks
 * react-refresh's only-export-components rule. Same trade-off as
 * save-error-keys.ts.
 */
export function SectionRow({
  title,
  summary,
  ariaLabel,
  onClick,
  isLast,
}: {
  title: string;
  summary: ReactNode;
  ariaLabel: string;
  onClick: (() => void) | undefined;
  isLast: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={ariaLabel}
      className={
        'group flex w-full flex-col items-stretch gap-1 py-3 text-start outline-none transition-colors duration-micro ease-standard' +
        ' rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background' +
        (isLast ? '' : ' border-b border-border')
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-text-primary">{title}</span>
        <PencilSimple
          className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-text-primary"
          aria-hidden
        />
      </div>
      <div className="text-body-sm text-text-muted">{summary}</div>
    </button>
  );
}
