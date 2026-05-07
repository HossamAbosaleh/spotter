import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ExerciseCard } from '@/components/ui/exercise-card';
import type { Exercise, LiveSet, SummarySet } from '@/domain/exercise';
import { setLanguage, type Language } from '@/i18n';

/*
 * /_design — development-only showcase route.
 *
 * Renders every variant of every primitive added in P0.5 step 4. Mounted
 * only when import.meta.env.DEV is true (see App.tsx).
 *
 * Contract:
 * - Cycles each component through every reasonable state.
 * - Provides a language toggle so EN and AR can be eyeballed in one tab.
 * - No real data, no network, no analytics.
 *
 * NOT a styleguide doc — this is a manual QA surface. The DESIGN.md file
 * is the authoritative reference.
 */

const benchPress: Exercise = {
  id: 'bench-press',
  name: 'Bench Press',
  muscleGroup: 'Chest',
  imageUrl:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=960&q=70',
};

const exerciseWithoutImage: Exercise = {
  id: 'romanian-deadlift',
  name: 'Romanian Deadlift',
  muscleGroup: 'Hamstrings',
};

const dailyLiveSets: LiveSet[] = [
  { status: 'logged', weight: 80, unit: 'kg', reps: 8, rpe: 7 },
  { status: 'current', targetWeight: 80, targetReps: 8, unit: 'kg' },
  { status: 'pending', targetWeight: 80, targetReps: 8, unit: 'kg' },
  { status: 'pending', targetWeight: 80, targetReps: 8, unit: 'kg' },
];

const summaryLoggedSets: SummarySet[] = [
  { status: 'logged', weight: 80, unit: 'kg', reps: 8, rpe: 7 },
  { status: 'logged', weight: 80, unit: 'kg', reps: 8, rpe: 7 },
  { status: 'logged', weight: 80, unit: 'kg', reps: 7, rpe: 8 },
  { status: 'skipped' },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-h2 text-text-primary">{title}</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const next: Language = i18n.language?.startsWith('ar') ? 'en' : 'ar';
  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => setLanguage(next)}
      aria-label={t('language.switchTo')}
    >
      {t('language.switchTo')}
    </Button>
  );
}

export default function DesignShowcase() {
  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
              /_design · dev-only
            </p>
            <h1 className="mt-2 font-display text-display-md text-text-primary">
              Spotter primitives — P0.5
            </h1>
          </div>
          <LanguageToggle />
        </header>

        <Section title="ExerciseCard.Library">
          <ExerciseCard.Library exercise={benchPress} />
          <ExerciseCard.Library
            exercise={benchPress}
            isInPlan
            onToggleInPlan={() => {}}
          />
          <ExerciseCard.Library exercise={exerciseWithoutImage} />
        </Section>

        <Section title="ExerciseCard.Library — preview (plan import)">
          <ExerciseCard.Library
            exercise={benchPress}
            preview
            aiSuggested
            onConfirm={() => {}}
            onSwap={() => {}}
          />
        </Section>

        <Section title="ExerciseCard.Daily">
          <ExerciseCard.Daily
            exercise={benchPress}
            plan={{
              sets: 4,
              targetReps: 8,
              targetWeight: 80,
              unit: 'kg',
              restSeconds: 90,
              rpeTarget: 7,
            }}
            liveSets={dailyLiveSets}
          />
          <ExerciseCard.Daily
            exercise={benchPress}
            plan={{
              sets: 4,
              targetReps: 8,
              targetWeight: 80,
              unit: 'kg',
              restSeconds: 90,
              rpeTarget: 7,
            }}
            liveSets={dailyLiveSets}
            aiCalibrated
            aiCalibratedSessionCount={4}
          />
          <ExerciseCard.Daily
            exercise={benchPress}
            plan={{
              sets: 4,
              targetReps: 8,
              targetWeight: 80,
              unit: 'kg',
              restSeconds: 90,
              rpeTarget: 7,
            }}
            liveSets={dailyLiveSets}
            workingWeightCalibrated={false}
          />
          <ExerciseCard.Daily
            exercise={benchPress}
            plan={{
              sets: 4,
              targetReps: 8,
              targetWeight: 80,
              unit: 'kg',
              restSeconds: 90,
              rpeTarget: 7,
            }}
            liveSets={dailyLiveSets}
            aiSuggested
            aiCalibrated
            aiCalibratedSessionCount={4}
          />
        </Section>

        <Section title="ExerciseCard.Summary">
          <ExerciseCard.Summary
            exercise={benchPress}
            plan={{ sets: 4, targetReps: 8 }}
            loggedSets={summaryLoggedSets}
          />
        </Section>
      </div>
    </main>
  );
}
