"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import i18n from "@/i18n";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  // Keep <html lang="..."> in sync with current language
  useEffect(() => {
    const syncHtmlLang = (lng?: string) => {
      if (typeof document === "undefined") return;
      const lang = lng || i18n.language || "tr";
      document.documentElement.setAttribute("lang", lang);
    };
    syncHtmlLang();
    const handler = (lng: string) => syncHtmlLang(lng);
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
