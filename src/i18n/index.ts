import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import eu from "./locales/eu.json";
import fr from "./locales/fr.json";

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    eu: { translation: eu },
  },
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// The static web HTML is rendered at build time, where the browser language is
// unknown, so it is always English. The root layout gives this English
// instance to the screens while React hydrates that HTML, then switches to i18n.
export const hydrationI18n = i18n.cloneInstance({ lng: "en" });

export default i18n;
