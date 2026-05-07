import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

/*
 * AIBadge — provenance mark for AI-touched values and surfaces.
 *
 * Spec: DESIGN.md §4.3.
 *   ● AI · {provenance}
 *
 * Anatomy:
 *   - Disc: 6px filled circle in `ai.indicator` (low-chroma cyan)
 *   - Label: "AI" in mono small uppercase tracking-wide, in ai.indicator
 *   - Provenance text (optional): in body small, text.muted
 *
 * No icon, no sparkle, no gradient. The cyan disc is the entire signal.
 *
 * When `children` is omitted, the badge collapses to `● AI`.
 *
 * The "AI" label is NOT translated (recognized abbreviation; fits the
 * 4-char badge in both EN and AR). Provenance text is.
 */
type AIBadgeProps = {
  children?: React.ReactNode;
  className?: string;
};

export function AIBadge({ children, className }: AIBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      data-slot="ai-badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border border-ai-indicator/40 bg-bg-elevated px-2 py-0.5',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="block size-1.5 rounded-pill bg-ai-indicator"
      />
      <span className="font-mono text-mono-sm uppercase tracking-wide text-ai-indicator">
        {t('aiBadge.label')}
      </span>
      {children ? (
        <>
          <span aria-hidden="true" className="text-text-dim">
            ·
          </span>
          <span className="text-body-sm text-text-muted">{children}</span>
        </>
      ) : null}
    </span>
  );
}
