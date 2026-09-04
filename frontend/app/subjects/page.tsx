"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell } from "../../components/PageShell";
import { ProtectedPage } from "../../components/ProtectedPage";
import { apiRequest, authHeaders, StudentProfile } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function SubjectsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <ProtectedPage>{() => <SubjectsContent />}</ProtectedPage>
      </section>
    </PageShell>
  );
}

function SubjectsContent() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    apiRequest<StudentProfile>("/api/student/profile", { headers: authHeaders(token) })
      .then(setProfile)
      .catch(() => setMessage("Set up your grade and subjects from the dashboard first."));
  }, []);

  return (
    <>
      <p className="text-sm font-semibold uppercase text-leaf">My subjects</p>
      <h1 className="mt-2 text-3xl font-bold">Choose a subject</h1>
      <p className="mt-2 text-ink/65">
        {profile ? `${profile.grade.name} learning path` : "Your selected subjects will appear here."}
      </p>

      {message ? (
        <div className="mt-8 rounded bg-white p-6 shadow-soft">
          <p className="text-ink/70">{message}</p>
          <Link className="mt-5 inline-flex rounded bg-leaf px-4 py-3 font-semibold text-white" href="/dashboard">
            Open dashboard
          </Link>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {profile?.selected_subjects.map((subject) => (
          <Link key={subject.id} className="rounded bg-white p-6 shadow-soft hover:outline hover:outline-2 hover:outline-leaf" href={`/subjects/${subject.id}`}>
            <h2 className="text-xl font-bold">{subject.name}</h2>
            <p className="mt-3 text-ink/65">Open topics and lessons for this subject.</p>
          </Link>
        ))}
      </div>
    </>
  );
}
