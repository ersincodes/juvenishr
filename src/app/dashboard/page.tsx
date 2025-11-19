"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import DashboardContent from "@/components/DashboardContent";
import InterviewsContent from "@/components/InterviewsContent";

type Tab = "dashboard" | "interviews";

const DashboardPage = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());

  // Load saved visible columns
  useEffect(() => {
    const loadPrefs = async () => {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/users/${session.user.id}/settings`);
      if (!res.ok) return;
      const json = await res.json();
      const saved: string[] = json?.settings?.visibleColumns ?? [];
      if (saved.length) setVisibleColumns(new Set(saved));
    };
    loadPrefs();
  }, [session?.user?.id]);

  // Persist visible columns
  useEffect(() => {
    const persist = async () => {
      if (!session?.user?.id) return;
      if (visibleColumns.size === 0) return; // Don't persist empty initially
      const body = { visibleColumns: Array.from(visibleColumns) };
      await fetch(`/api/users/${session.user.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    };
    persist();
  }, [visibleColumns, session?.user?.id]);

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            aria-label={t("dashboard.title")}
            className="flex items-center">
            <Image
              src="/asset/Juv.jpeg"
              alt={t("logo.alt")}
              width={140}
              height={42}
              className="h-10 w-auto"
              priority
            />
          </a>
          <h1 className="text-lg font-semibold">{t("dashboard.title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600">
            {session?.user?.name ?? ""}
          </span>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
            aria-label={t("auth.logout")}>
            {t("auth.logout")}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Tabs */}
        <div className="flex border-b border-zinc-200">
           <button
             onClick={() => setActiveTab("dashboard")}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
               activeTab === "dashboard"
                 ? "border-zinc-900 text-zinc-900"
                 : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
             }`}
           >
             {t("dashboard.tabs.dashboard")}
           </button>
           <button
             onClick={() => setActiveTab("interviews")}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
               activeTab === "interviews"
                 ? "border-zinc-900 text-zinc-900"
                 : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
             }`}
           >
             {t("dashboard.tabs.interviews")}
           </button>
        </div>

        {activeTab === "dashboard" ? (
          <DashboardContent
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        ) : (
          <InterviewsContent
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        )}
      </div>
    </main>
  );
};

export default DashboardPage;
