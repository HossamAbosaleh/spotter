import { Warning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { usePersistenceStore } from '@/stores/persistence-store';
import { cn } from '@/lib/utils';

/**
 * PersistenceBanner — warns the user when their answers won't persist.
 *
 * Reads from `usePersistenceStore`. Renders nothing when storage is
 * available (the happy path); renders a destructive-toned banner with
 * a reason-specific i18n message and an "I understand" acknowledgement
 * button when storage is degraded.
 *
 * Per spec FR-004 / SC-007: the banner exists to ensure no user reaches
 * a state where the app falsely claims their profile was saved. The
 * banner mounts in the wizard shell (T022) above the form content; the
 * wizard's Next button consumes `bannerAcknowledged` to gate progression
 * past step 1 in degraded mode.
 *
 * Customization decisions:
 *
 * - **Icon**: Phosphor `Warning` (triangle). Semantically reads as
 *   "pay attention" without implying catastrophic failure. `CloudSlash`
 *   was considered but rejected — Spotter is local-first, so a cloud
 *   metaphor would mis-frame the problem (the issue is local storage,
 *   not cloud connectivity).
 *
 * - **Surface**: `bg-destructive/10` with `border-destructive/30` and
 *   `text-text-primary`. A faint destructive tint signals risk without
 *   the banner reading as "everything is on fire." The button picks up
 *   the full destructive token. Contrast on the body text passes AA
 *   because the surface lightness is dominated by the canvas, not the
 *   tint.
 *
 * - **Position / layout**: `w-full rounded-md p-4`. The banner is
 *   placed inline by its consumer (wizard shell), so layout
 *   responsibilities (max-width, top placement) belong to the parent.
 *
 * - **Logical properties**: gap and padding use direction-neutral
 *   utilities; the icon-then-text-then-button order flips automatically
 *   under `dir="rtl"` because the row is `flex` (no `flex-row-reverse`
 *   needed).
 *
 * - **Accessibility**: `role="alert"` + `aria-live="polite"` so screen
 *   readers announce the banner the first time it renders without
 *   interrupting in-progress speech. The icon carries `aria-hidden`
 *   because the message text already conveys the meaning.
 *
 * - **Acknowledge button**: uses our `<Button variant="destructive">`,
 *   which is already `min-h-11` per the Button size defaults. The
 *   button does NOT hide the banner on click (acknowledgement is
 *   purely a state flag the wizard reads); the banner stays visible
 *   as a persistent reminder while in degraded mode.
 *
 * - **Render gates**: returns `null` when status is `'available'`. There
 *   is no separate `'unknown'` state in the store — the initial default
 *   is `'available'` until the probe completes, so the banner doesn't
 *   flash during first paint.
 */

const REASON_TO_KEY = {
  'private-mode': 'persistence.banner.private',
  disabled: 'persistence.banner.disabled',
  'quota-exceeded': 'persistence.banner.quota',
  unknown: 'persistence.banner.unknown',
} as const;

function PersistenceBanner({ className }: { className?: string }) {
  const { t } = useTranslation();
  const status = usePersistenceStore((s) => s.status);
  const acknowledgeBanner = usePersistenceStore((s) => s.acknowledgeBanner);
  const bannerAcknowledged = usePersistenceStore((s) => s.bannerAcknowledged);

  if (status.status === 'available') {
    return null;
  }

  const messageKey = REASON_TO_KEY[status.reason];

  return (
    <div
      data-slot="persistence-banner"
      data-reason={status.reason}
      data-acknowledged={bannerAcknowledged ? 'true' : 'false'}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex w-full items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-text-primary',
        className
      )}
    >
      <Warning
        aria-hidden
        className="mt-0.5 size-5 shrink-0 text-destructive"
        weight="fill"
      />
      <div className="flex flex-1 flex-col gap-3">
        <p className="text-body-sm leading-relaxed">{t(messageKey)}</p>
        {!bannerAcknowledged ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={acknowledgeBanner}
            data-slot="persistence-banner-acknowledge"
          >
            {t('persistence.banner.acknowledge')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { PersistenceBanner };
