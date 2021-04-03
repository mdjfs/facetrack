/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "./en/translation.json";
import translationEs from "./es/translation.json";

const resources = {
  en: {
    translation: translationEn,
  },
  es: {
    translation: translationEs,
  },
} as const;

i18n.use(initReactI18next).init({
  lng: "en",
  resources,
});

export default i18n;
export { resources, i18n };
