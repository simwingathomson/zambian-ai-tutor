"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiRequest, TokenResponse } from "../lib/api";
import { saveSession } from "../lib/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);

    try {
      const payload = isRegister
        ? {
            email: String(form.get("email")),
            full_name: String(form.get("full_name")),
            password: String(form.get("password"))
          }
        : {
            email: String(form.get("email")),
            password: String(form.get("password"))
          };
      const session = await apiRequest<TokenResponse>(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      saveSession(session);
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mx-auto w-full max-w-md rounded bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-leaf">
          {isRegister ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {isRegister ? "Start your exam preparation" : "Log in to continue"}
        </h1>
      </div>
      {isRegister ? (
        <label className="mb-4 block text-sm font-medium text-ink/80">
          Full name
          <input
            className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf"
            name="full_name"
            type="text"
            required
          />
        </label>
      ) : null}
      <label className="mb-4 block text-sm font-medium text-ink/80">
        Email
        <input className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf" name="email" type="email" required />
      </label>
      <label className="mb-4 block text-sm font-medium text-ink/80">
        Password
        <input
          className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf"
          name="password"
          type="password"
          minLength={8}
          required
        />
      </label>
      {error ? <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded bg-leaf px-4 py-3 font-semibold text-white disabled:opacity-65" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Please wait" : isRegister ? "Create account" : "Log in"}
      </button>
      <p className="mt-5 text-center text-sm text-ink/65">
        {isRegister ? "Already registered?" : "New to Zambian AI Tutor?"}{" "}
        <Link className="font-semibold text-leaf" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
