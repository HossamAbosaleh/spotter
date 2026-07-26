import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  readCompletenessAcknowledged,
  writeCompletenessAcknowledged,
} from '@/data/wizard-draft';
import { profileCompleteness } from '@/domain/profile';
import { useProfileStore } from '@/stores/profile-store';

/**
 * CompletenessIndicator — quiet post-setup nudge surface (T045 + T047).
 *
 * Reads the current profile from the store and renders a small
 * Card-styled summary of `profileCompleteness()`:
 *   - title + percent on one row
 *   - Progress bar
 *   - invitation copy
 *   - inline list of missing-field labels
 *   - "Got it" dismiss button (ghost) at bottom-inline-end
 *
 * Returns `null` in three cases:
 *   - No profile in the store (defensive; Profile.tsx already gates)
 *   - `percent === 100` (T045's complete-state policy)
 *   - The acknowledged flag is set in localStorage (T047)
 *
 * The acknowledged flag is cleared inside the wizard save handler
 * (T046's branch in wizard.tsx), so the indicator can re-surface on
 * the next save with whatever the new percent is.
 *
 * Field labels come from `profile.completeness.missingFields.*`. The
 * `preferredDays` key was added alongside the three optional-field
 * labels so the recommended-missing field renders with the same
 * namespace as the optional-missing fields. See the T045 commit
 * message for the small spec deviation.
 */
export function CompletenessIndicator() {
  const { t } = useTranslation();
  const profile = useProfileStore((s) => s.profile);
  const [acknowledged, setAcknowledged] = useState(() =>
    readCompletenessAcknowledged()
  );

  if (!profile) return null;

  const { percent, recommendedMissing, optionalMissing } =
    profileCompleteness(profile);

  if (percent === 100) return null;
  if (acknowledged) return null;

  const missing = [...recommendedMissing, ...optionalMissing];

  function handleAcknowledge() {
    writeCompletenessAcknowledged();
    setAcknowledged(true);
  }

  return (
    <Card data-slot="completeness-indicator">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-body font-medium text-text-primary">
            {t('profile.completeness.title')}
          </h2>
          <span
            className="font-mono text-caption tabular-nums text-text-muted"
            aria-hidden="true"
          >
            {t('profile.completeness.percent', { percent })}
          </span>
        </div>
        <Progress
          value={percent}
          aria-label={`${t('profile.completeness.title')} ${t('profile.completeness.percent', { percent })}`}
        />
        <p className="text-body-sm text-text-muted">
          {t('profile.completeness.invitation')}
        </p>
        {missing.length > 0 ? (
          <ul
            className="flex flex-wrap gap-x-3 gap-y-1 text-body-sm text-text-muted"
            aria-label={t('profile.completeness.invitation')}
          >
            {missing.map((field) => (
              <li
                key={field}
                className="before:me-1.5 before:text-text-dim before:content-['◦']"
              >
                {t(`profile.completeness.missingFields.${field}`)}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleAcknowledge}
            data-slot="completeness-acknowledge"
          >
            {t('profile.completeness.acknowledge')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
