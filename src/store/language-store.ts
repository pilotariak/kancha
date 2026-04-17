import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import i18n from "@/i18n";

export type SupportedLanguage = "en" | "fr" | "es" | "eu";

interface LanguageState {
  language: SupportedLanguage | null;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (lang) => {
        void i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: "kancha-language",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          void i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
