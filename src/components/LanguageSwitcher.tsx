"use client";

import { useEffect, useState } from "react";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

const SUPPORTED = [
  { code: "tr", labelKey: "lang.tr" },
  { code: "de", labelKey: "lang.de" },
];

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState<string>(i18n.language || "tr");

  useEffect(() => {
    const handle = () => setCurrent(i18n.language || "tr");
    i18n.on("languageChanged", handle);
    return () => {
      i18n.off("languageChanged", handle);
    };
  }, []);

  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng).catch(() => {});
    try {
      localStorage.setItem("app:lng", lng);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("app:lng");
      if (saved && saved !== i18n.language) {
        i18n.changeLanguage(saved).catch(() => {});
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <label htmlFor="lang" className="sr-only">
        {t("lang.switch")}
      </label>
      <select
        id="lang"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        aria-label={t("lang.switch")}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-zinc-900">
        {SUPPORTED.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {t(opt.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
