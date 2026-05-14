import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleNotch,
} from '@phosphor-icons/react';
import { FormProvider, type FieldPath } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PersistenceBanner } from '@/components/ui/persistence-banner';
import { Progress } from '@/components/ui/progress';
import { profileRepository } from '@/data/repositories/profile-repository';
import type { Profile } from '@/domain/profile';
import { usePersistenceStore } from '@/stores/persistence-store';
import { useProfileStore } from '@/stores/profile-store';
import { useToastStore } from '@/stores/toast-store';
import { cn } from '@/lib/utils';

import { saveErrorDescriptionKey, saveErrorTitleKey } from './save-error-keys';

import { StepBodyGoal } from './steps/step-body-goal';
import { StepEquipmentLimitations } from './steps/step-equipment-limitations';
import { StepExperienceSchedule } from './steps/step-experience-schedule';
import { StepIdentity } from './steps/step-identity';
import { StepLanguageCoach } from './steps/step-language-coach';
import { StepReview } from './steps/step-review';
import { useProfileForm } from './use-profile-form';

const TOTAL_STEPS = 6;

/**
 * Field paths validated when the user advances past each step. Optional
 * fields (e.g. goal, equipment.access) are listed because `trigger`
 * resolves them as valid when undefined — the cost is zero and it keeps
 * the map exhaustive against the contract i18n keys.
 *
 * Step 6 (Review) has no fields of its own to gate; submission runs the
 * full schema via `form.handleSubmit`.
 */
const STEP_FIELDS: Record<number, FieldPath<Profile>[]> = {
  1: ['identity.name', 'identity.age', 'identity.sex'],
  2: ['body.heightCm', 'body.bodyweightKg', 'goal'],
  3: ['experience.level', 'schedule.preferredDays'],
  4: ['equipment.access', 'equipment.notes', 'injuries'],
  5: ['language.preferred', 'language.units', 'coachPersonality'],
  6: ['additionalContext'],
};

/**
 * Wizard — the six-step profile setup shell.
 *
 * Owns: step state, navigation, progress indicator, persistence banner
 * placement, and the `FormProvider` that scopes a single
 * `react-hook-form` instance across every step. Steps consume that form
 * via `useFormContext()`; they don't receive it as a prop.
 *
 * Navigation contract:
 * - **Next** runs `form.trigger(STEP_FIELDS[step])`. Only step-scoped
 *   fields are validated, so a user can step past optional fields they
 *   haven't filled. On failure, react-hook-form populates `errors` and
 *   the active step renders its own error states.
 * - **Back** is unconditional — never validates. Lets a user revise an
 *   earlier step even if the current one is invalid.
 * - **Finish** runs `form.handleSubmit`, which triggers the full Zod
 *   schema. T033 wires the success path to the repository save; for now
 *   the placeholder logs and stays on step 6.
 *
 * Persistence banner:
 * - Renders only when storage is degraded AND the user has not yet
 *   acknowledged it. Per T022 contract — the banner is a one-shot heads
 *   up inside the wizard, distinct from how the same component renders
 *   on standalone surfaces where it stays persistently visible.
 *
 * Step rendering:
 * - Steps 1–6 are wired in via the `Steps` map. Steps not yet
 *   implemented render a placeholder card so the shell is verifiable
 *   end-to-end (progress + nav + banner + form context) before each
 *   step component lands in T024–T029.
 */
export function Wizard() {
  const { t } = useTranslation();
  const form = useProfileForm();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(1);

  const persistenceStatus = usePersistenceStore((s) => s.status.status);
  const bannerAcknowledged = usePersistenceStore((s) => s.bannerAcknowledged);
  const showBanner = persistenceStatus !== 'available' && !bannerAcknowledged;

  const setProfile = useProfileStore((s) => s.setProfile);
  const enqueueToast = useToastStore((s) => s.enqueue);

  const isSubmitting = form.formState.isSubmitting;

  const isFirstStep = activeStep === 1;
  const isLastStep = activeStep === TOTAL_STEPS;
  const progressPercent = (activeStep / TOTAL_STEPS) * 100;

  async function handleNext() {
    // T024–T029: once a step's real FormField components land in
    // STEP_COMPONENTS, validation gates the advance. While the step is
    // still a placeholder there are no FormField/FormMessage slots to
    // surface errors into, and defaultProfile() intentionally fails the
    // schema (e.g. name: '' < min(1)) — so triggering would silently
    // block Next with no user feedback. Skip until the real step lands.
    const stepHasRealFields = activeStep in STEP_COMPONENTS;
    if (stepHasRealFields) {
      const ok = await form.trigger(STEP_FIELDS[activeStep] ?? []);
      if (!ok) return;
    }
    setActiveStep((step) => Math.min(TOTAL_STEPS, step + 1));
  }

  function handleBack() {
    setActiveStep((step) => Math.max(1, step - 1));
  }

  const handleFinish = form.handleSubmit(async (data) => {
    // Capture edit-vs-create *before* save: after a successful save
    // useProfileStore.profile is non-null, which would always read
    // as "edit" and break the success-toast copy.
    const wasEditing = useProfileStore.getState().profile !== null;

    const result = await profileRepository.save(data);

    if (result.ok) {
      // Re-fetch the persisted record so the in-memory store mirrors
      // the canonical row (with id/schemaVersion/createdAt/updatedAt
      // stamped by the repository). Falling back to `data` keeps the
      // store reasonable if the immediate re-read somehow fails.
      const refreshed = await profileRepository.get();
      const next =
        refreshed.ok && refreshed.value ? refreshed.value : (data as Profile);
      setProfile(next);

      enqueueToast({
        variant: 'default',
        title: wasEditing
          ? t('wizard.toast.updated.title')
          : t('wizard.toast.saved.title'),
        durationMs: 4000,
      });

      navigate('/profile');
      return;
    }

    enqueueToast({
      variant: 'destructive',
      title: t(saveErrorTitleKey(result.error)),
      description: t(saveErrorDescriptionKey(result.error)),
      durationMs: 6000,
    });
  });

  const StepComponent = STEP_COMPONENTS[activeStep] ?? StepPlaceholder;

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          // Block implicit submits from non-Finish buttons. Without this,
          // pressing Enter inside any input on steps 1–5 would submit the
          // form against the full schema and surface confusing errors.
          if (!isLastStep) {
            event.preventDefault();
          }
        }}
        className="flex w-full flex-col gap-6"
      >
        {showBanner ? <PersistenceBanner /> : null}

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <p
              data-slot="wizard-step-label"
              className="font-mono text-caption uppercase tracking-widest text-text-muted"
            >
              {t('wizard.shell.stepLabel', {
                n: activeStep,
                total: TOTAL_STEPS,
              })}
            </p>
            <p
              data-slot="wizard-step-name"
              className="text-body-sm text-text-muted"
            >
              {t(`wizard.shell.progress.${activeStep}.label`)}
            </p>
          </div>
          <Progress
            value={progressPercent}
            aria-label={t('wizard.shell.stepLabel', {
              n: activeStep,
              total: TOTAL_STEPS,
            })}
          />
        </div>

        <Card>
          <StepComponent
            activeStep={activeStep}
            {...(isSubmitting ? {} : { onJumpToStep: setActiveStep })}
          />
          <CardFooter
            className={cn(
              'mt-2 gap-3',
              // Back lives at inline-start, Next/Finish at inline-end.
              'justify-between'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={isFirstStep || isSubmitting}
              data-slot="wizard-back"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              {t('wizard.shell.back')}
            </Button>
            {isLastStep ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleFinish()}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                data-slot="wizard-finish"
              >
                {isSubmitting ? (
                  <CircleNotch
                    className="size-4 animate-spin"
                    aria-hidden
                    weight="bold"
                  />
                ) : (
                  <Check className="size-4" aria-hidden />
                )}
                {isSubmitting
                  ? t('wizard.shell.savingIndicator')
                  : t('wizard.review.confirmCta')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleNext()}
                data-slot="wizard-next"
              >
                {t('wizard.shell.next')}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}

type StepProps = {
  activeStep: number;
  /**
   * Wizard shell hook for step components that need to jump to another
   * step (e.g. the Review step's "edit this section" affordance).
   * Optional because most steps don't need it — they only consume the
   * shared form via useFormContext and let the shell's Back/Next/Finish
   * drive navigation.
   */
  onJumpToStep?: (step: number) => void;
};

/**
 * Placeholder rendered for steps that haven't been implemented yet.
 * Lets the shell be exercised end-to-end before T024–T029 land. Each
 * step component will replace its entry in `STEP_COMPONENTS` below as
 * it ships.
 */
function StepPlaceholder({ activeStep }: StepProps): ReactNode {
  const { t } = useTranslation();
  return (
    <>
      <CardHeader>
        <CardTitle>{t(`wizard.shell.progress.${activeStep}.label`)}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body-sm text-text-muted">
          Step {activeStep} placeholder. The real step component lands in T0
          {23 + activeStep}.
        </p>
      </CardContent>
    </>
  );
}

const STEP_COMPONENTS: Record<number, (props: StepProps) => ReactNode> = {
  1: StepIdentity,
  2: StepBodyGoal,
  3: StepExperienceSchedule,
  4: StepEquipmentLimitations,
  5: StepLanguageCoach,
  6: StepReview,
};
