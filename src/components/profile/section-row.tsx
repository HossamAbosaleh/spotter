import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PencilSimple } from '@phosphor-icons/react';

/**
 * Renders one row inside the wizard Review / /profile section list:
 * a stacked title + summary with a pencil affordance on the right.
 *
 * The row supports three navigation modes (mutually exclusive):
 *   - `onClick` → renders as <button>; used by the wizard Review
 *     step to jump within the in-memory wizard (`onJumpToStep`).
 *   - `href`    → renders as <Link>; used by /profile to deep-link
 *     into the wizard at a specific step via the URL ?step=N param.
 *   - neither   → renders as a disabled <button>; communicates
 *     "this row exists but isn't editable right now."
 *
 * Lives in its own file because section-formatters.tsx exports pure
 * functions, and mixing component + non-component exports breaks
 * react-refresh's only-export-components rule. Same trade-off as
 * save-error-keys.ts.
 */
type Props = {
  title: string;
  summary: ReactNode;
  ariaLabel: string;
  isLast: boolean;
  onClick?: () => void;
  href?: string;
};

const baseClass =
  'group flex w-full flex-col items-stretch gap-1 py-3 text-start outline-none transition-colors duration-micro ease-standard' +
  ' rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function SectionRow({
  title,
  summary,
  ariaLabel,
  isLast,
  onClick,
  href,
}: Props) {
  if (onClick && href) {
    // Programmer error: callers must pick one navigation mode.
    // The row's affordance contract is a single tap → one
    // destination; supporting both would create ambiguity at the
    // call site.
    throw new Error('SectionRow accepts either onClick or href, not both.');
  }

  const className = baseClass + (isLast ? '' : ' border-b border-border');
  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-text-primary">{title}</span>
        <PencilSimple
          className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-text-primary"
          aria-hidden
        />
      </div>
      <div className="text-body-sm text-text-muted">{summary}</div>
    </>
  );

  if (href) {
    return (
      <Link to={href} aria-label={ariaLabel} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={ariaLabel}
      className={className}
    >
      {inner}
    </button>
  );
}
