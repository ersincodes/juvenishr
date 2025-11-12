"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LoginPage = () => {
  const router = useRouter();
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
      setError("Invalid credentials");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4"
        aria-label="Login form">
        <div className="flex justify-center">
          <Image
            src="/asset/Juv.jpeg"
            alt="Juvenis HR logo"
            width={160}
            height={48}
            priority
            className="h-12 w-auto"
          />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
        {error ? (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        ) : null}
        <label className="block">
          <span className="text-sm text-zinc-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
            required
            aria-label="Email address"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
            required
            aria-label="Password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-60"
          aria-label="Login">
          {loading ? "Loading..." : "Login"}
        </button>
        <p className="text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-zinc-900 underline"
            aria-label="Go to signup">
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
};

export default LoginPage;
