import { zodResolver } from '@hookform/resolvers/zod';
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

const demoFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.'),
  goal: z.enum(['strength', 'hypertrophy', 'fat-loss']),
  experience: z.enum(['novice', 'intermediate', 'advanced']),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

function DemoForm() {
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="What should we call you?" {...field} />
              </FormControl>
              <FormDescription>
                Try submitting with this empty to see the validation styling.
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
              <FormLabel>Goal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a goal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                  <SelectItem value="fat-loss">Fat loss</SelectItem>
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
              <FormLabel>Experience level</FormLabel>
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
                        <Label htmlFor={`exp-${value}`} className="capitalize">
                          {value}
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
          Submit (showcase only)
        </Button>
      </form>
    </Form>
  );
}

/* --------------------------- Toast preview --------------------------- */

function ToastPreview() {
  // Single ToastProvider scoped to this section. The toast is rendered
  // permanently open via the controlled `open` prop so the visual stays
  // visible on the page without any auto-dismiss timer.
  return (
    <ToastProvider duration={1_000_000}>
      <div className="flex flex-col gap-2">
        <p className="text-body-sm text-text-muted">
          The viewport portals to <code>document.body</code>; the toast renders
          at the bottom of the page (or bottom-right on `sm:` and up).
        </p>
        <Toast
          open
          onOpenChange={() => {
            /* showcase — controlled, never closes */
          }}
        >
          <div className="flex flex-col gap-1">
            <ToastTitle>Saved.</ToastTitle>
            <ToastDescription>
              Default toast variant — neutral elevated surface.
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
            <ToastTitle>Couldn't save.</ToastTitle>
            <ToastDescription>
              Destructive variant — pair with an icon at the call site.
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
  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
              /_design · dev-only
            </p>
            <h1 className="mt-2 font-display text-display-md text-text-primary">
              Spotter primitives — P0.5 + P1
            </h1>
          </div>
          <LanguageToggle />
        </header>

        {/* ============================ P1 primitives ============================ */}

        <Section title="Input" cols={2}>
          <Stack label="default">
            <Input placeholder="Type something" />
          </Stack>
          <Stack label="with value">
            <Input defaultValue="Hossam" />
          </Stack>
          <Stack label="numeric (inputMode=decimal)">
            <Input inputMode="decimal" placeholder="80" />
          </Stack>
          <Stack label="disabled">
            <Input disabled defaultValue="locked" />
          </Stack>
          <Stack label="aria-invalid">
            <Input aria-invalid defaultValue="invalid value" />
          </Stack>
          <Stack label="with label peer">
            <Label htmlFor="d-name">Display name</Label>
            <Input id="d-name" placeholder="What should we call you?" />
          </Stack>
        </Section>

        <Section title="Card" cols={2}>
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>
                A short description, quieter than the title.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-text-primary">
                Card content lives here. Sub-components own horizontal padding
                so embedded forms can draw their own gutters.
              </p>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button variant="primary" size="sm">
                Confirm
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Header only</CardTitle>
              <CardDescription>
                Cards can omit any sub-component.
              </CardDescription>
            </CardHeader>
          </Card>
        </Section>

        <Section title="Progress" cols={1}>
          <div className="flex flex-col gap-4">
            {[0, 17, 50, 83, 100].map((value) => (
              <Stack key={value} label={`${value}%`}>
                <Progress value={value} />
              </Stack>
            ))}
          </div>
        </Section>

        <Section title="Checkbox (with touch-target wrapper)" cols={2}>
          <Stack label="default + label wrapper">
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-default" />
              <Label htmlFor="cb-default">Monday</Label>
            </label>
          </Stack>
          <Stack label="checked">
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-checked" defaultChecked />
              <Label htmlFor="cb-checked">Tuesday</Label>
            </label>
          </Stack>
          <Stack label="disabled">
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-disabled" disabled />
              <Label htmlFor="cb-disabled">Disabled</Label>
            </label>
          </Stack>
          <Stack label="aria-invalid">
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <Checkbox id="cb-invalid" aria-invalid />
              <Label htmlFor="cb-invalid">Invalid</Label>
            </label>
          </Stack>
        </Section>

        <Section title="RadioGroup (with touch-target wrapper)" cols={2}>
          <Stack label="default">
            <RadioGroup defaultValue="strength">
              {(['strength', 'hypertrophy', 'fat-loss'] as const).map((v) => (
                <label
                  key={v}
                  className="flex min-h-11 cursor-pointer items-center gap-3"
                >
                  <RadioGroupItem value={v} id={`rg-d-${v}`} />
                  <Label htmlFor={`rg-d-${v}`} className="capitalize">
                    {v.replace('-', ' ')}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          </Stack>
          <Stack label="disabled">
            <RadioGroup defaultValue="strength" disabled>
              {(['strength', 'hypertrophy'] as const).map((v) => (
                <label
                  key={v}
                  className="flex min-h-11 cursor-pointer items-center gap-3"
                >
                  <RadioGroupItem value={v} id={`rg-dis-${v}`} />
                  <Label htmlFor={`rg-dis-${v}`} className="capitalize">
                    {v.replace('-', ' ')}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          </Stack>
        </Section>

        <Section title="Slider" cols={1}>
          <div className="flex flex-col gap-6">
            <Stack label="default (single thumb)">
              <Slider defaultValue={[40]} />
            </Stack>
            <Stack label="range (two thumbs)">
              <Slider defaultValue={[20, 80]} />
            </Stack>
            <Stack label="disabled">
              <Slider defaultValue={[60]} disabled />
            </Stack>
          </div>
        </Section>

        <Section title="Select" cols={2}>
          <Stack label="default">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pick an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="fat-loss">Fat loss</SelectItem>
                <SelectItem value="recomposition">Recomposition</SelectItem>
                <SelectItem value="general-fitness">General fitness</SelectItem>
              </SelectContent>
            </Select>
          </Stack>
          <Stack label="disabled">
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Disabled" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">X</SelectItem>
              </SelectContent>
            </Select>
          </Stack>
        </Section>

        <Section title="Toast" cols={1}>
          <ToastPreview />
        </Section>

        <Section title="PersistenceBanner" cols={1}>
          <p className="text-body-sm text-text-muted">
            Renders only when the persistence store reports a degraded status;
            on this page the store is in its default `available` state, so the
            banner element below is the styling preview rendered by the
            component itself once a degraded reason is set. To preview live,
            simulate degraded mode in the React DevTools store.
          </p>
          <PersistenceBanner />
        </Section>

        <Section title="Form (react-hook-form integration)" cols={1}>
          <Card>
            <CardHeader>
              <CardTitle>Demo form</CardTitle>
              <CardDescription>
                Input + Select + RadioGroup wired through the Form primitive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoForm />
            </CardContent>
          </Card>
        </Section>

        {/* ============================ P0.5 primitives ============================ */}

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
