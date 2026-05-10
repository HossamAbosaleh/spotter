import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ExerciseCard } from '@/components/ui/exercise-card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PersistenceBanner } from '@/components/ui/persistence-banner';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import type { Exercise, LiveSet, SummarySet } from '@/domain/exercise';
import { setLanguage, type Language } from '@/i18n';

/*
 * /_design — development-only showcase route.
 *
 * Renders every variant of every primitive currently in src/components/ui.
 * Mounted only when import.meta.env.DEV is true (see App.tsx).
 *
 * Contract:
 * - Cycles each component through every reasonable state.
 * - Provides a language toggle so EN and AR can be eyeballed in one tab.
 *   All copy goes through `design.*` i18n keys; sample exercise data
 *   (Bench Press, Romanian Deadlift, etc.) is intentionally NOT
 *   translated — it lives in JS literals on the Exercise type. Making
 *   the showcase exercise data bilingual is its own task that touches
 *   `domain/exercise.ts`.
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
  cols = 3,
}: {
  title: string;
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}) {
  const gridClass =
    cols === 1
      ? 'grid grid-cols-1 gap-4'
      : cols === 2
        ? 'grid grid-cols-1 gap-4 lg:grid-cols-2'
        : 'grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3';
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-h2 text-text-primary">{title}</h2>
      <div className={gridClass}>{children}</div>
    </section>
  );
}

function Stack({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
        {label}
      </p>
      {children}
    </div>
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

/* ----------------------------- Form demo ----------------------------- */

type DemoFormValues = {
  name: string;
  goal: 'strength' | 'hypertrophy' | 'fat-loss';
  experience: 'novice' | 'intermediate' | 'advanced';
};

function DemoForm() {
  const { t } = useTranslation();

  // Schema lives inside the component so the validation error message
  // can come through `t()`. Memoized on `t` so we don't recreate the
  // schema on every render (which would invalidate rhf's resolver).
  const demoFormSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t('design.form.nameError')),
        goal: z.enum(['strength', 'hypertrophy', 'fat-loss']),
        experience: z.enum(['novice', 'intermediate', 'advanced']),
      }),
    [t]
  );

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      goal: 'strength',
      experience: 'intermediate',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {
          /* showcase only — never submits */
        })}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('design.form.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('design.form.namePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('design.form.nameDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('design.form.goal')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('design.form.goalPlaceholder')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="strength">
                    {t('design.form.goalOptions.strength')}
                  </SelectItem>
                  <SelectItem value="hypertrophy">
                    {t('design.form.goalOptions.hypertrophy')}
                  </SelectItem>
                  <SelectItem value="fat-loss">
                    {t('design.form.goalOptions.fatLoss')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('design.form.experience')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {(['novice', 'intermediate', 'advanced'] as const).map(
                    (value) => (
                      <label
                        key={value}
                        className="flex min-h-11 cursor-pointer items-center gap-3"
                      >
                        <RadioGroupItem value={value} id={`exp-${value}`} />
                        <Label htmlFor={`exp-${value}`}>
                          {t(`design.form.experienceOptions.${value}`)}
                        </Label>
                      </label>
                    )
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="primary" className="self-start">
          {t('design.form.submit')}
        </Button>
      </form>
    </Form>
  );
}

/* --------------------------- Toast preview --------------------------- */

function ToastPreview() {
  const { t } = useTranslation();

  // Single ToastProvider scoped to this section. The toast is rendered
  // permanently open via the controlled `open` prop so the visual stays
  // visible on the page without any auto-dismiss timer.
  return (
    <ToastProvider duration={1_000_000}>
      <div className="flex flex-col gap-2">
        <p className="text-body-sm text-text-muted">{t('design.toast.note')}</p>
        <Toast
          open
          onOpenChange={() => {
            /* showcase — controlled, never closes */
          }}
        >
          <div className="flex flex-col gap-1">
            <ToastTitle>{t('design.toast.saved')}</ToastTitle>
            <ToastDescription>
              {t('design.toast.savedDescription')}
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <Toast
          variant="destructive"
          open
          onOpenChange={() => {
            /* showcase — controlled, never closes */
          }}
        >
          <div className="flex flex-col gap-1">
            <ToastTitle>{t('design.toast.failed')}</ToastTitle>
            <ToastDescription>
              {t('design.toast.failedDescription')}
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function DesignShowcase() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
              {t('design.header.subhead')}
            </p>
            <h1 className="mt-2 font-display text-display-md text-text-primary">
              {t('design.header.title')}
            </h1>
          </div>
          <LanguageToggle />
        </header>

        {/* ============================ P1 primitives ============================ */}

        <Section title={t('design.sections.input')} cols={2}>
          <Stack label={t('design.labels.default')}>
            <Input placeholder={t('design.input.typeSomething')} />
          </Stack>
          <Stack label={t('design.labels.withValue')}>
            <Input defaultValue={t('design.input.sampleName')} />
          </Stack>
          <Stack label={t('design.labels.numeric')}>
            <Input inputMode="decimal" placeholder="80" />
          </Stack>
          <Stack label={t('design.labels.disabled')}>
            <Input disabled defaultValue={t('design.input.locked')} />
          </Stack>
          <Stack label={t('design.labels.ariaInvalid')}>
            <Input aria-invalid defaultValue={t('design.input.invalidValue')} />
          </Stack>
          <Stack label={t('design.labels.withLabelPeer')}>
            <Label htmlFor="d-name">{t('design.input.displayName')}</Label>
            <Input
              id="d-name"
              placeholder={t('design.input.placeholderName')}
            />
          </Stack>
        </Section>

        <Section title={t('design.sections.card')} cols={2}>
          <Card>
            <CardHeader>
              <CardTitle>{t('design.card.title')}</CardTitle>
              <CardDescription>{t('design.card.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-text-primary">
                {t('design.card.content')}
              </p>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost" size="sm">
                {t('design.card.cancel')}
              </Button>
              <Button variant="primary" size="sm">
                {t('design.card.confirm')}
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('design.card.headerOnlyTitle')}</CardTitle>
              <CardDescription>
                {t('design.card.headerOnlyDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Section>

        <Section title={t('design.sections.progress')} cols={1}>
          <div className="flex flex-col gap-4">
            {[0, 17, 50, 83, 100].map((value) => (
              <Stack key={value} label={`${value}%`}>
                <Progress value={value} />
              </Stack>
            ))}
          </div>
        </Section>

        <Section title={t('design.sections.checkbox')} cols={2}>
          <Stack label={t('design.labels.defaultWithLabel')}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-default" />
              <Label htmlFor="cb-default">{t('design.checkbox.monday')}</Label>
            </label>
          </Stack>
          <Stack label={t('design.labels.checked')}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-checked" defaultChecked />
              <Label htmlFor="cb-checked">{t('design.checkbox.tuesday')}</Label>
            </label>
          </Stack>
          <Stack label={t('design.labels.disabled')}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-disabled" disabled />
              <Label htmlFor="cb-disabled">
                {t('design.checkbox.disabledLabel')}
              </Label>
            </label>
          </Stack>
          <Stack label={t('design.labels.ariaInvalid')}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-invalid" aria-invalid />
              <Label htmlFor="cb-invalid">
                {t('design.checkbox.invalidLabel')}
              </Label>
            </label>
          </Stack>
        </Section>

        <Section title={t('design.sections.radioGroup')} cols={2}>
          <Stack label={t('design.labels.default')}>
            <RadioGroup defaultValue="strength">
              {(['strength', 'hypertrophy', 'fat-loss'] as const).map((v) => (
                <label
                  key={v}
                  className="flex min-h-11 cursor-pointer items-center gap-3"
                >
                  <RadioGroupItem value={v} id={`rg-d-${v}`} />
                  <Label htmlFor={`rg-d-${v}`}>
                    {t(
                      `design.form.goalOptions.${v === 'fat-loss' ? 'fatLoss' : v}`
                    )}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          </Stack>
          <Stack label={t('design.labels.disabled')}>
            <RadioGroup defaultValue="strength" disabled>
              {(['strength', 'hypertrophy'] as const).map((v) => (
                <label
                  key={v}
                  className="flex min-h-11 cursor-pointer items-center gap-3"
                >
                  <RadioGroupItem value={v} id={`rg-dis-${v}`} />
                  <Label htmlFor={`rg-dis-${v}`}>
                    {t(`design.form.goalOptions.${v}`)}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          </Stack>
        </Section>

        <Section title={t('design.sections.slider')} cols={1}>
          <div className="flex flex-col gap-6">
            <Stack label={t('design.labels.sliderSingle')}>
              <Slider defaultValue={[40]} />
            </Stack>
            <Stack label={t('design.labels.sliderRange')}>
              <Slider defaultValue={[20, 80]} />
            </Stack>
            <Stack label={t('design.labels.disabled')}>
              <Slider defaultValue={[60]} disabled />
            </Stack>
          </div>
        </Section>

        <Section title={t('design.sections.select')} cols={2}>
          <Stack label={t('design.labels.default')}>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t('design.select.pickOption')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">
                  {t('design.select.strength')}
                </SelectItem>
                <SelectItem value="hypertrophy">
                  {t('design.select.hypertrophy')}
                </SelectItem>
                <SelectItem value="fat-loss">
                  {t('design.select.fatLoss')}
                </SelectItem>
                <SelectItem value="recomposition">
                  {t('design.select.recomposition')}
                </SelectItem>
                <SelectItem value="general-fitness">
                  {t('design.select.generalFitness')}
                </SelectItem>
              </SelectContent>
            </Select>
          </Stack>
          <Stack label={t('design.labels.disabled')}>
            <Select disabled>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('design.select.disabledPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">{t('design.select.x')}</SelectItem>
              </SelectContent>
            </Select>
          </Stack>
        </Section>

        <Section title={t('design.sections.toast')} cols={1}>
          <ToastPreview />
        </Section>

        <Section title={t('design.sections.persistenceBanner')} cols={1}>
          <p className="text-body-sm text-text-muted">
            {t('design.persistence.note')}
          </p>
          <PersistenceBanner />
        </Section>

        <Section title={t('design.sections.form')} cols={1}>
          <Card>
            <CardHeader>
              <CardTitle>{t('design.form.cardTitle')}</CardTitle>
              <CardDescription>
                {t('design.form.cardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoForm />
            </CardContent>
          </Card>
        </Section>

        {/* ============================ P0.5 primitives ============================ */}

        <Section title={t('design.sections.exerciseLibrary')}>
          <ExerciseCard.Library exercise={benchPress} />
          <ExerciseCard.Library
            exercise={benchPress}
            isInPlan
            onToggleInPlan={() => {}}
          />
          <ExerciseCard.Library exercise={exerciseWithoutImage} />
        </Section>

        <Section title={t('design.sections.exerciseLibraryPreview')}>
          <ExerciseCard.Library
            exercise={benchPress}
            preview
            aiSuggested
            onConfirm={() => {}}
            onSwap={() => {}}
          />
        </Section>

        <Section title={t('design.sections.exerciseDaily')}>
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

        <Section title={t('design.sections.exerciseSummary')}>
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
