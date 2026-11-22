import type { SupportedLanguage } from "@/store/language-store";

/** The interface languages, in the order of the language picker. */
export const LANGUAGES: readonly SupportedLanguage[] = ["en", "fr", "es", "eu"];

/**
 * The supported language for a language tag: its primary subtag ("fr-FR" is "fr"), or English,
 * the fallback language, when Kancha has no translation for it.
 */
export function resolveLanguage(tag: string | null | undefined): SupportedLanguage {
  const code = tag?.split(/[-_]/)[0]?.toLowerCase();
  return LANGUAGES.find((language) => language === code) ?? "en";
}

export interface LanguageNames {
  /** The language's name in that language: "Euskara". */
  name: string;
  /** Its name in the interface language, or null when that is the same name. */
  localized: string | null;
  /** The screen reader label: the visible names, without the middle dot. */
  label: string;
}

/**
 * The names a language option shows: its own name first, then its name in the interface
 * language ("Euskara · Basque"), once only when both are the same ("English" in English).
 */
export function languageNames(name: string, localized: string): LanguageNames {
  const other = localized.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase()
    ? null
    : localized;
  return { name, localized: other, label: other ? `${name}, ${other}` : name };
}
