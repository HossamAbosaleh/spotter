import i18n from 'i18next';
import { z } from 'zod';

/**
 * Global Zod error map that routes validation messages through i18n so
 * they render in the active language (EN/AR).
 *
 * Zod's built-in messages are English-only. Without this map an Arabic
 * (RTL) user who leaves a required field empty or enters an out-of-range
 * age/height/weight sees an English error inside an otherwise Arabic form
 * — the bilingual-first-class violation flagged as T052/T053 finding #2.
 *
 * The map returns fully-translated strings (not i18n keys) via the shared
 * i18next singleton, so `FormMessage` needs no change. Messages regenerate
 * on every revalidation, so a mid-session language switch surfaces
 * localized errors on the next interaction.
 */
export const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const t = (key: string, opts?: Record<string, unknown>): string =>
    i18n.t(key, { ns: 'common', ...opts });

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      // Missing values and NaN numbers (empty numeric inputs) land here.
      return { message: t('validation.required') };

    case z.ZodIssueCode.too_small: {
      const min = Number(issue.minimum);
      if (issue.type === 'string')
        return {
          message:
            min <= 1
              ? t('validation.required')
              : t('validation.stringMin', { min }),
        };
      if (issue.type === 'array')
        return { message: t('validation.arrayMin', { min }) };
      return { message: t('validation.numberMin', { min }) };
    }

    case z.ZodIssueCode.too_big: {
      const max = Number(issue.maximum);
      if (issue.type === 'string')
        return { message: t('validation.stringMax', { max }) };
      if (issue.type === 'array')
        return { message: t('validation.arrayMax', { max }) };
      return { message: t('validation.numberMax', { max }) };
    }

    case z.ZodIssueCode.invalid_enum_value:
      return { message: t('validation.select') };

    default:
      return { message: ctx.defaultError };
  }
};

/**
 * Installs the error map as Zod's global default. Called once from
 * `src/i18n/index.ts` after i18next initialization so the singleton is
 * ready by the time any schema parses.
 */
export function installZodErrorMap(): void {
  z.setErrorMap(zodErrorMap);
}
