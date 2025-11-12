"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import tr from "./locales/tr/common.json";
import de from "./locales/de/common.json";

// Initialize once in client. Prevent re-init in HMR.
if (!i18n.isInitialized) {
	i18n
		.use(initReactI18next)
		.init({
			lng: "tr",
			fallbackLng: "tr",
			supportedLngs: ["tr", "de"],
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


