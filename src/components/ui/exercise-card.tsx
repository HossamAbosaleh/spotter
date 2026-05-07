import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Dumbbell, Plus, RefreshCw } from 'lucide-react';

import { AIBadge } from '@/components/ui/ai-badge';
import { Button } from '@/components/ui/button';
import { MetaPill } from '@/components/ui/meta-pill';
import { WorkingWeightDisplay } from '@/components/ui/working-weight-display';
import type {
  Exercise,
  LiveSet,
  PlannedSet,
  SummarySet,
} from '@/domain/exercise';
import {
  formatRPE,
  formatRest,
  formatSetsReps,
  formatWeight,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { isSafeImageUrl } from '@/utils/security';

// =============================================================================
// Root
// =============================================================================

type ExerciseCardRootProps = React.ComponentPropsWithoutRef<'article'>;

function ExerciseCardRoot({
  className,
  children,
  ...props
}: ExerciseCardRootProps) {
  return (
    <article
      data-slot="exercise-card"
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-micro ease-standard',
        className
      )}
      {...props}
    >
      {children}
    </article>
  );
}

// =============================================================================
// Image
// =============================================================================

type ExerciseCardImageProps = {
  src?: string | undefined;
  alt: string;
  className?: string;
};

function ExerciseCardImage({ src, alt, className }: ExerciseCardImageProps) {
  const safe = isSafeImageUrl(src);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof src === 'string' &&
      src.length > 0 &&
      !safe &&
      import.meta.env.DEV
    ) {
      // Constitution P5: surface unsafe-URL rejections in dev so they don't
      // get silently absorbed. Production stays quiet.
      console.warn(
        `[ExerciseCard.Image] rejected unsafe src; rendering placeholder. src="${src}"`
      );
    }
  }, [src, safe]);

  if (!safe || errored) {
    return <ExerciseCardImagePlaceholder alt={alt} className={className} />;
  }

  return (
    <div
      data-slot="exercise-card-image"
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-md bg-bg-elevated',
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="size-full object-cover"
      />
    </div>
  );
}

function ExerciseCardImagePlaceholder({
  alt,
  className,
}: {
  alt: string;
  className?: string | undefined;
}) {
  return (
    <div
      data-slot="exercise-card-image-placeholder"
      role="img"
      aria-label={alt}
      className={cn(
        'flex aspect-video w-full items-center justify-center rounded-md bg-bg-elevated text-text-dim',
        className
      )}
    >
      <Dumbbell aria-hidden="true" className="size-8" />
    </div>
  );
}

// =============================================================================
// Header (Name + Muscle + optional inline AIBadge)
// =============================================================================

type ExerciseCardHeaderProps = React.ComponentPropsWithoutRef<'header'>;

function ExerciseCardHeader({
  className,
  children,
  ...props
}: ExerciseCardHeaderProps) {
  return (
    <header
      data-slot="exercise-card-header"
      className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1', className)}
      {...props}
    >
      {children}
    </header>
  );
}

function ExerciseCardName({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3
      data-slot="exercise-card-name"
      className={cn(
        'font-display text-h2 leading-none text-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function ExerciseCardMuscle({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="exercise-card-muscle"
      className={cn('text-body-sm text-text-muted', className)}
      {...props}
    >
      {children}
    </span>
  );
}

// =============================================================================
// Meta (row of MetaPills)
// =============================================================================

function ExerciseCardMeta({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="exercise-card-meta"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Body (generic content slot)
// =============================================================================

function ExerciseCardBody({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="exercise-card-body"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Actions (bottom row)
// =============================================================================

function ExerciseCardActions({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="exercise-card-actions"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// =============================================================================
// SetRow (private; shared by LiveSetList and LoggedSetList)
// =============================================================================

type SetRowProps = {
  index: number;
  current?: boolean;
  skipped?: boolean;
  weight: string; // already-formatted display string
  reps: string; // already-formatted display string
  rpe?: string | undefined; // already-formatted; absent when not applicable
};

function SetRow({
  index,
  current = false,
  skipped = false,
  weight,
  reps,
  rpe,
}: SetRowProps) {
  const { t } = useTranslation();
  return (
    <li
      data-slot="exercise-card-set-row"
      data-current={current || undefined}
      data-skipped={skipped || undefined}
      aria-current={current ? 'step' : undefined}
      className={cn(
        'flex items-center justify-between rounded-md px-2 py-1.5 font-mono text-mono tabular-nums',
        current && 'bg-bg-elevated text-text-primary',
        !current && !skipped && 'text-text-muted',
        skipped && 'text-text-dim'
      )}
    >
      <span className="text-text-muted">
        {t('exerciseCard.setLabel', { n: index })}
      </span>
      <span className="flex items-center gap-3" dir="ltr">
        <span>{weight}</span>
        <span className="text-text-dim">×</span>
        <span>{reps}</span>
        {rpe ? <span className="text-text-muted">{rpe}</span> : null}
      </span>
    </li>
  );
}

// =============================================================================
// LiveSetList (Daily only)
// =============================================================================

type ExerciseCardLiveSetListProps = {
  sets: LiveSet[];
  className?: string;
};

function ExerciseCardLiveSetList({
  sets,
  className,
}: ExerciseCardLiveSetListProps) {
  const { t } = useTranslation();
  return (
    <ol
      data-slot="exercise-card-live-set-list"
      className={cn('flex flex-col gap-1', className)}
    >
      {sets.map((set, i) => {
        const index = i + 1;
        if (set.status === 'logged') {
          return (
            <SetRow
              key={i}
              index={index}
              weight={formatWeight(set.weight, set.unit)}
              reps={`${set.reps}`}
              rpe={set.rpe !== undefined ? formatRPE(set.rpe) : undefined}
            />
          );
        }
        if (set.status === 'skipped') {
          return (
            <SetRow
              key={i}
              index={index}
              skipped
              weight="—"
              reps="—"
              {...{ 'aria-label': t('exerciseCard.summary.skipped') }}
            />
          );
        }
        // current | pending — show targets
        return (
          <SetRow
            key={i}
            index={index}
            current={set.status === 'current'}
            weight={formatWeight(set.targetWeight, set.unit)}
            reps={`${set.targetReps}`}
          />
        );
      })}
    </ol>
  );
}

// =============================================================================
// LoggedSetList (Summary only)
// =============================================================================

type ExerciseCardLoggedSetListProps = {
  sets: SummarySet[];
  className?: string;
};

function ExerciseCardLoggedSetList({
  sets,
  className,
}: ExerciseCardLoggedSetListProps) {
  const { t } = useTranslation();
  return (
    <ol
      data-slot="exercise-card-logged-set-list"
      className={cn('flex flex-col gap-1', className)}
    >
      {sets.map((set, i) => {
        const index = i + 1;
        if (set.status === 'logged') {
          return (
            <SetRow
              key={i}
              index={index}
              weight={formatWeight(set.weight, set.unit)}
              reps={`${set.reps}`}
              rpe={set.rpe !== undefined ? formatRPE(set.rpe) : undefined}
            />
          );
        }
        return (
          <SetRow
            key={i}
            index={index}
            skipped
            weight="—"
            reps="—"
            {...{ 'aria-label': t('exerciseCard.summary.skipped') }}
          />
        );
      })}
    </ol>
  );
}

// =============================================================================
// Variants
// =============================================================================

// ----- Library --------------------------------------------------------------

type ExerciseCardLibraryProps = {
  exercise: Exercise;
  isInPlan?: boolean;
  onToggleInPlan?: (next: boolean) => void;
  /*
   * When set, the card represents an AI-suggested exercise (plan import
   * preview). Adds an inline AIBadge in the header.
   */
  aiSuggested?: boolean;
  /*
   * Plan-import-preview mode swaps the toggle for Confirm/Swap actions.
   */
  preview?: boolean;
  onConfirm?: () => void;
  onSwap?: () => void;
  className?: string;
};

function ExerciseCardLibrary({
  exercise,
  isInPlan = false,
  onToggleInPlan,
  aiSuggested = false,
  preview = false,
  onConfirm,
  onSwap,
  className,
}: ExerciseCardLibraryProps) {
  const { t } = useTranslation();

  return (
    <ExerciseCardRoot
      className={cn('hover:border-hover focus-within:border-hover', className)}
    >
      <ExerciseCardImage src={exercise.imageUrl} alt={exercise.name} />
      <ExerciseCardHeader>
        <ExerciseCardName>{exercise.name}</ExerciseCardName>
        <ExerciseCardMuscle>{exercise.muscleGroup}</ExerciseCardMuscle>
        {aiSuggested ? (
          <AIBadge>{t('exerciseCard.ai.suggested')}</AIBadge>
        ) : null}
      </ExerciseCardHeader>
      <ExerciseCardActions className="justify-end">
        {preview ? (
          <>
            <Button variant="ghost" size="sm" onClick={onSwap}>
              <RefreshCw aria-hidden="true" />
              {t('exerciseCard.preview.swap')}
            </Button>
            <Button variant="primary" size="sm" onClick={onConfirm}>
              <Check aria-hidden="true" />
              {t('exerciseCard.preview.confirm')}
            </Button>
          </>
        ) : (
          <Button
            variant={isInPlan ? 'default' : 'ghost'}
            size="sm"
            aria-pressed={isInPlan}
            aria-label={
              isInPlan
                ? t('exerciseCard.library.inPlan')
                : t('exerciseCard.library.addToPlan')
            }
            onClick={() => onToggleInPlan?.(!isInPlan)}
          >
            {isInPlan ? (
              <Check aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            <span>
              {isInPlan
                ? t('exerciseCard.library.inPlan')
                : t('exerciseCard.library.addToPlan')}
            </span>
          </Button>
        )}
      </ExerciseCardActions>
    </ExerciseCardRoot>
  );
}

// ----- Daily ----------------------------------------------------------------

type ExerciseCardDailyProps = {
  exercise: Exercise;
  /*
   * Planned target for this exercise this session — used to populate the
   * Meta row (sets×reps, rest, RPE target) and the WorkingWeight hero.
   */
  plan: PlannedSet & { restSeconds: number; rpeTarget?: number; sets: number };
  workingWeightCalibrated?: boolean;
  /*
   * Set-by-set state for the live set list.
   */
  liveSets: LiveSet[];
  /*
   * Card-level AI suggested (e.g. AI picked this exercise). Suppressed when
   * value-level AI is set on the working weight (collision rule, brief §13).
   */
  aiSuggested?: boolean;
  /*
   * Value-level AI: the working weight was AI-calibrated. Renders an
   * AIBadge inline next to the WorkingWeightDisplay, with provenance
   * such as "based on your last 4 sessions".
   */
  aiCalibrated?: boolean;
  aiCalibratedSessionCount?: number;
  onLogSet?: () => void;
  onStartRest?: () => void;
  className?: string;
};

function ExerciseCardDaily({
  exercise,
  plan,
  workingWeightCalibrated = true,
  liveSets,
  aiSuggested = false,
  aiCalibrated = false,
  aiCalibratedSessionCount,
  onLogSet,
  onStartRest,
  className,
}: ExerciseCardDailyProps) {
  const { t } = useTranslation();

  // Collision rule (brief §13): value-level AI badge wins; suppress card-level.
  const showCardAIBadge = aiSuggested && !aiCalibrated;

  return (
    <ExerciseCardRoot className={className}>
      <ExerciseCardHeader>
        <ExerciseCardName>{exercise.name}</ExerciseCardName>
        <ExerciseCardMuscle>{exercise.muscleGroup}</ExerciseCardMuscle>
        {showCardAIBadge ? (
          <AIBadge>{t('exerciseCard.ai.suggested')}</AIBadge>
        ) : null}
      </ExerciseCardHeader>

      <ExerciseCardMeta>
        {/* Daily intentionally omits the weight pill — the WorkingWeight
            hero below already carries it. (Brief §12, deferred Q3, resolved.) */}
        <MetaPill>{formatSetsReps(plan.sets, plan.targetReps)}</MetaPill>
        <MetaPill>{formatRest(plan.restSeconds)}</MetaPill>
        {plan.rpeTarget !== undefined ? (
          <MetaPill>{formatRPE(plan.rpeTarget)}</MetaPill>
        ) : null}
      </ExerciseCardMeta>

      <ExerciseCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <WorkingWeightDisplay
            weight={plan.targetWeight}
            unit={plan.unit}
            calibrated={workingWeightCalibrated}
          />
          {aiCalibrated ? (
            <AIBadge>
              {t('exerciseCard.ai.calibrated', {
                count: aiCalibratedSessionCount ?? 0,
              })}
            </AIBadge>
          ) : null}
        </div>
        <ExerciseCardLiveSetList sets={liveSets} />
      </ExerciseCardBody>

      <ExerciseCardActions>
        <Button variant="primary" size="default" onClick={onLogSet}>
          {t('exerciseCard.daily.logSet')}
        </Button>
        <Button variant="default" size="default" onClick={onStartRest}>
          {t('exerciseCard.daily.rest')}
          <span className="font-mono text-mono-sm tabular-nums" dir="ltr">
            {formatRest(plan.restSeconds)}
          </span>
        </Button>
      </ExerciseCardActions>
    </ExerciseCardRoot>
  );
}

// ----- Summary --------------------------------------------------------------

type ExerciseCardSummaryProps = {
  exercise: Exercise;
  plan: { sets: number; targetReps: number };
  loggedSets: SummarySet[];
  className?: string;
};

function ExerciseCardSummary({
  exercise,
  plan,
  loggedSets,
  className,
}: ExerciseCardSummaryProps) {
  return (
    <ExerciseCardRoot className={className}>
      <ExerciseCardHeader>
        <ExerciseCardName>{exercise.name}</ExerciseCardName>
        <ExerciseCardMuscle>{exercise.muscleGroup}</ExerciseCardMuscle>
      </ExerciseCardHeader>

      <ExerciseCardMeta>
        <MetaPill>{formatSetsReps(plan.sets, plan.targetReps)}</MetaPill>
      </ExerciseCardMeta>

      <ExerciseCardBody>
        <ExerciseCardLoggedSetList sets={loggedSets} />
      </ExerciseCardBody>
    </ExerciseCardRoot>
  );
}

// =============================================================================
// Compound assembly
// =============================================================================

type ExerciseCardComponent = typeof ExerciseCardRoot & {
  Image: typeof ExerciseCardImage;
  Header: typeof ExerciseCardHeader;
  Name: typeof ExerciseCardName;
  Muscle: typeof ExerciseCardMuscle;
  Meta: typeof ExerciseCardMeta;
  Body: typeof ExerciseCardBody;
  Actions: typeof ExerciseCardActions;
  LiveSetList: typeof ExerciseCardLiveSetList;
  LoggedSetList: typeof ExerciseCardLoggedSetList;
  Library: typeof ExerciseCardLibrary;
  Daily: typeof ExerciseCardDaily;
  Summary: typeof ExerciseCardSummary;
};

const ExerciseCard = ExerciseCardRoot as ExerciseCardComponent;

ExerciseCard.Image = ExerciseCardImage;
ExerciseCard.Header = ExerciseCardHeader;
ExerciseCard.Name = ExerciseCardName;
ExerciseCard.Muscle = ExerciseCardMuscle;
ExerciseCard.Meta = ExerciseCardMeta;
ExerciseCard.Body = ExerciseCardBody;
ExerciseCard.Actions = ExerciseCardActions;
ExerciseCard.LiveSetList = ExerciseCardLiveSetList;
ExerciseCard.LoggedSetList = ExerciseCardLoggedSetList;
ExerciseCard.Library = ExerciseCardLibrary;
ExerciseCard.Daily = ExerciseCardDaily;
ExerciseCard.Summary = ExerciseCardSummary;

export { ExerciseCard };
