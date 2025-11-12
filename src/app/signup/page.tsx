"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to sign up");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.replace("/login"), 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4"
        aria-label="Signup form">
        <h1 className="text-2xl font-semibold text-zinc-900">Sign up</h1>
        {error ? (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        ) : null}
        {success ? (
          <div role="status" className="text-sm text-green-700">
            Account created. Redirecting to login…
          </div>
        ) : null}
        <label className="block">
          <span className="text-sm text-zinc-700">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
            aria-label="Full name"
          />
        </label>
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
            minLength={8}
            aria-label="Password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-60"
          aria-label="Create account">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-zinc-900 underline"
            aria-label="Go to login">
            Login
          </a>
        </p>
      </form>
    </main>
  );
};

export default SignupPage;
