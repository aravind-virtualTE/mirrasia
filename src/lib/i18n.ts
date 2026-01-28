// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../assets/translations/en/en.json';
import en1 from '../assets/translations/en/en1.json';
import ko from '../assets/translations/ko/ko.json';
import ko1 from '../assets/translations/ko/ko1.json';
import zhTW from '../assets/translations/zhTW/zh-TW.json';
import zhTW1 from '../assets/translations/zhTW/zhTW1.json';



const resources = {
  en: {
    common: en,
    incorporation: en1,
  },
  ko: {
    common: ko,
    incorporation: ko1,
  },
  zhTW: {
    common: zhTW,
    incorporation: zhTW1,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    supportedLngs: ['en', 'ko', 'zhTW'],
    fallbackLng: 'en',
    ns: ["common", "incorporation",],
    defaultNS: "common",
    fallbackNS: ["incorporation"],
    nonExplicitSupportedLngs: true,
    load: 'currentOnly',
    interpolation: {escapeValue: false,},
  });

export default i18n;
