# How to add a new language

Kancha uses Expo's i18n support. This guide adds a new locale end-to-end.

## 1. Locate the translations directory

```bash
ls src/i18n/
```

Each locale has its own file (e.g. `en.ts`, `fr.ts`, `eu.ts`).

## 2. Create the locale file

Copy an existing locale as a template:

```bash
cp src/i18n/en.ts src/i18n/<locale>.ts
```

Translate every string value. Do not rename keys.

## 3. Register the locale

In `src/i18n/index.ts`, import and register the new locale:

```ts
import <locale> from './<locale>';

const resources = {
  // existing locales …
  <locale>: { translation: <locale> },
};
```

## 4. Add the language to the picker

In the language picker component, add an entry for the new locale with its display name and flag (if used).

## 5. Verify

Run the app and switch to the new language from Settings → Language. Check all screens for untranslated strings (they fall back to the key name).
