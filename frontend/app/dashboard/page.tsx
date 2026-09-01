"use client";

import { BookOpenCheck, CalendarDays, LineChart, Target } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { PageShell } from "../../components/PageShell";
import { apiRequest, authHeaders, Grade, StudentProfile, Subject } from "../../lib/api";
import { getStoredUser, getToken } from "../../lib/auth";

const metrics = [
  { label: "Readiness", value: "Not assessed", icon: Target },
  { label: "Practice sets", value: "0", icon: BookOpenCheck },
  { label: "Study plan", value: "Pending", icon: CalendarDays },
  { label: "Progress trend", value: "Pending", icon: LineChart }
];

export default function DashboardPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [message, setMessage] = useState("");
  const [gradeId, setGradeId] = useState("");
  const user = typeof window !== "undefined" ? getStoredUser() : null;

  useEffect(() => {
    async function load() {
      const token = getToken();
      const loadedGrades = await apiRequest<Grade[]>("/api/grades");
      setGrades(loadedGrades);
      const initialGradeId = loadedGrades[0]?.id ? String(loadedGrades[0].id) : "";
      setGradeId(initialGradeId);

      if (token) {
        try {
          const loadedProfile = await apiRequest<StudentProfile>("/api/student/profile", {
            headers: authHeaders(token)
          });
          setProfile(loadedProfile);
          setGradeId(String(loadedProfile.grade.id));
        } catch {
          setProfile(null);
        }
      }
    }

    load().catch(() => setMessage("Could not load dashboard data."));
  }, []);

  useEffect(() => {
    if (!gradeId) return;
    apiRequest<Subject[]>(`/api/subjects?grade_id=${gradeId}`)
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, [gradeId]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setMessage("Log in before saving your profile.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const subjectIds = form.getAll("subject_ids").map((value) => Number(value));
    const saved = await apiRequest<StudentProfile>("/api/student/profile", {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ grade_id: Number(gradeId), subject_ids: subjectIds })
    });
    setProfile(saved);
    setMessage("Profile saved.");
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-leaf">Student dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Preparation overview</h1>
          <p className="mt-2 text-ink/65">{user ? `Signed in as ${user.full_name}` : "Sign in to save your setup."}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className="rounded bg-white p-5 shadow-soft">
                <Icon className="text-copper" size={22} aria-hidden="true" />
                <p className="mt-5 text-sm text-ink/60">{metric.label}</p>
                <p className="mt-1 text-xl font-bold">{metric.value}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-8 rounded bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold">Student profile</h2>
          <form className="mt-5 grid gap-5" onSubmit={saveProfile}>
            <label className="block text-sm font-medium text-ink/80">
              Grade
              <select
                className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf"
                value={gradeId}
                onChange={(event) => setGradeId(event.target.value)}
              >
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium text-ink/80">Subjects</legend>
              {subjects.length ? (
                subjects.map((subject) => (
                  <label key={subject.id} className="flex items-center gap-3 rounded border border-ink/10 p-3">
                    <input
                      type="checkbox"
                      name="subject_ids"
                      value={subject.id}
                      defaultChecked={profile?.selected_subjects.some((item) => item.id === subject.id)}
                    />
                    <span>{subject.name}</span>
                  </label>
                ))
              ) : (
                <p className="rounded border border-ink/10 p-4 text-sm text-ink/65">
                  No subjects have been added for this grade yet.
                </p>
              )}
            </fieldset>
            {message ? <p className="text-sm font-medium text-leaf">{message}</p> : null}
            <button className="w-full rounded bg-leaf px-4 py-3 font-semibold text-white sm:w-fit" type="submit">
              Save profile
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
