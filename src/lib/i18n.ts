// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../assets/translations/en.json';
import ko from '../assets/translations/ko.json';
import zhTW from '../assets/translations/zh-TW.json';

// const mergeTranslations = (base: Record<string, any>, ...sources: Record<string, any>[]) => {
//   return sources.reduce((acc, source) => ({
//     ...acc,
//     ...source,
//   }), base);
// };

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  zhTW: { translation: zhTW }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
