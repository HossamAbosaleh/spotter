import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Syncs <html lang> and <html dir> to the active i18next language.
// Mounted once at the App root.
export function useDirection(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [i18n.language]);
}
