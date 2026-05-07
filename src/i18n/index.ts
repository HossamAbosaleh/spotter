import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ar from './ar.json';

export type Language = 'en' | 'ar';

const STORAGE_KEY = 'spotter.lang';

function detectLanguage(): Language {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
  }
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language?.toLowerCase() ?? '';
    if (nav.startsWith('ar')) return 'ar';
  }
  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    ar: { common: ar },
  },
  defaultNS: 'common',
  ns: ['common'],
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(lang: Language): void {
  void i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode, blocked) — language change still
    // applies for this session, just won't persist.
  }
}

export function getLanguage(): Language {
  return i18n.language?.startsWith('ar') ? 'ar' : 'en';
}

export default i18n;
