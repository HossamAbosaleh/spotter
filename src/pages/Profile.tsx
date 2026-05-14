import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeleteProfileDialog } from '@/components/profile/delete-profile-dialog';
import {
  formatBodyGoal,
  formatEquipmentLimitations,
  formatExperienceSchedule,
  formatIdentity,
  formatLanguageCoach,
} from '@/components/profile/section-formatters';
import { SectionRow } from '@/components/profile/section-row';
import { useProfileStore } from '@/stores/profile-store';

/**
 * Post-setup profile view (T031).
 *
 * Two render states driven by `useProfileStore.profile`:
 *
 *   - `null` → empty-state Card with "Get started" CTA pointing at
 *     /setup (create mode). Keeps /profile as a stable URL even
 *     when no profile is saved.
 *
 *   - `Profile` → single Card with 5 section rows mirroring the
 *     wizard's Step 6 Review summary. Each row is a Link that
 *     deep-links into /setup?step=N, satisfying SC-008's "find
 *     and edit any previously entered field in three taps or
 *     fewer" requirement (tap the pencil → land on the step →
 *     edit the field).
 *
 * Footer in the populated state pairs the destructive Start fresh
 * trigger (left) with a primary Edit profile CTA (right). The
 * Edit profile path lands on /setup without a step param — the
 * wizard opens at step 1 with values pre-filled (edit mode).
 */
const SECTIONS = [
  { step: 1, titleKey: 'wizard.review.sections.identity' },
  { step: 2, titleKey: 'wizard.review.sections.bodyGoal' },
  { step: 3, titleKey: 'wizard.review.sections.experienceSchedule' },
  { step: 4, titleKey: 'wizard.review.sections.equipmentLimitations' },
  { step: 5, titleKey: 'wizard.review.sections.languageCoach' },
] as const;

export default function Profile() {
  const { t, i18n } = useTranslation();
  const profile = useProfileStore((s) => s.profile);

  if (!profile) {
    return (
      <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.empty.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-text-muted">
                {t('profile.empty.body')}
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button asChild variant="primary">
                <Link to="/setup">{t('profile.empty.cta')}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  const summaries: Record<number, ReturnType<typeof formatIdentity>> = {
    1: formatIdentity(profile, t),
    2: formatBodyGoal(profile, t),
    3: formatExperienceSchedule(profile, t, i18n.language),
    4: '',
    5: formatLanguageCoach(profile, t),
  };
  // Step 4 returns ReactNode (notes/injuries stack), not string —
  // assigned separately to keep TypeScript happy with the mixed
  // return-type map.
  const equipmentSummary = formatEquipmentLimitations(profile, t);

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            /profile
          </p>
          <h1 className="font-display text-display-md text-text-primary">
            {t('profile.title')}
          </h1>
          <p className="text-body text-text-muted">{t('profile.subtitle')}</p>
        </header>

        <Card>
          <CardContent className="flex flex-col">
            {SECTIONS.map(({ step, titleKey }, idx) => {
              const sectionTitle = t(titleKey);
              return (
                <SectionRow
                  key={step}
                  title={sectionTitle}
                  summary={step === 4 ? equipmentSummary : summaries[step]}
                  ariaLabel={t('profile.editSection', {
                    section: sectionTitle,
                  })}
                  href={`/setup?step=${step}`}
                  isLast={idx === SECTIONS.length - 1}
                />
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <DeleteProfileDialog />
          <Button asChild variant="primary">
            <Link to="/setup" data-slot="profile-edit-cta">
              {t('profile.edit')}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
