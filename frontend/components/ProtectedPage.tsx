"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, authHeaders, User } from "../lib/api";
import { getToken } from "../lib/auth";

type ProtectedPageProps = {
  adminOnly?: boolean;
  children: (user: User) => React.ReactNode;
};

export function ProtectedPage({ adminOnly = false, children }: ProtectedPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    apiRequest<User>("/api/auth/me", { headers: authHeaders(token) })
      .then((currentUser) => {
        setUser(currentUser);
        setStatus(adminOnly && currentUser.role !== "admin" ? "denied" : "allowed");
      })
      .catch(() => router.replace("/login"));
  }, [adminOnly, router]);

  if (status === "checking") {
    return <p className="rounded bg-white p-6 shadow-soft">Checking your session...</p>;
  }

  if (status === "denied") {
    return (
      <div className="rounded bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="mt-3 text-ink/70">This area is only available to administrator accounts.</p>
        <Link className="mt-5 inline-flex rounded bg-leaf px-4 py-3 font-semibold text-white" href="/dashboard">
          Return to dashboard
        </Link>
      </div>
    );
  }

  return user ? children(user) : null;
}
