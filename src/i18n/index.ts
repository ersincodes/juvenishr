"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import tr from "./locales/tr/common.json";
import de from "./locales/de/common.json";

const SUPPORTED = ["tr", "de"] as const;

// Initialize once in client. Prevent re-init in HMR.
if (!i18n.isInitialized) {
  const initialLang = "tr";
  i18n
    .use(initReactI18next)
    .init({
      lng: initialLang,
      fallbackLng: "tr",
      supportedLngs: SUPPORTED as unknown as string[],
      resources: {
        tr: { translation: tr },
        de: { translation: de },
      },
      returnEmptyString: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    })
    .catch(() => {
      // noop
    });
}

export default i18n;
