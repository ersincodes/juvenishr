"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LoginPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t("auth.invalidCredentials"));
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/asset/cc-bg.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-15"
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4"
        aria-label={t("auth.login") + " form"}>
        <div className="flex justify-center">
          <Image
            src="/asset/Juv-text.jpg"
            alt={t("logo.alt")}
            width={500}
            height={96}
            priority
            className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-40 w-auto object-contain"
          />
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {t("auth.login")}
          </h1>
          <LanguageSwitcher />
        </div>
        {error ? (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        ) : null}
        <label className="block">
          <span className="text-sm text-zinc-700">{t("auth.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
            required
            aria-label={t("auth.email")}
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-700">{t("auth.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
            required
            aria-label={t("auth.password")}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-60"
          aria-label={t("auth.login")}>
          {loading ? t("auth.loading") : t("auth.login")}
        </button>
        <p className="text-sm text-zinc-600">
          {t("auth.noAccount")}{" "}
          <a
            href="/signup"
            className="text-zinc-900 underline"
            aria-label={t("auth.signup")}>
            {t("auth.signup")}
          </a>
        </p>
      </form>
    </main>
  );
};

export default LoginPage;
