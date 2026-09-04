"use client";

import { Database, FileStack, Users } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { PageShell } from "../../components/PageShell";
import { ProtectedPage } from "../../components/ProtectedPage";
import { apiRequest, authHeaders, Grade, Subject, Subtopic, Topic } from "../../lib/api";
import { getToken } from "../../lib/auth";

const areas = [
  { title: "Learners", detail: "Manage student accounts and roles.", icon: Users },
  { title: "Curriculum data", detail: "Maintain grades, subjects, topics, and subtopics.", icon: Database },
  { title: "Materials", detail: "Future workspace for authorised uploads.", icon: FileStack }
];

export default function AdminPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <ProtectedPage adminOnly>{() => <AdminContent />}</ProtectedPage>
      </section>
    </PageShell>
  );
}

function AdminContent() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiRequest<Grade[]>("/api/grades")
      .then((loadedGrades) => {
        setGrades(loadedGrades);
        setGradeId(loadedGrades[0]?.id ? String(loadedGrades[0].id) : "");
      })
      .catch(() => setMessage("Could not load grades."));
  }, []);

  useEffect(() => {
    if (!gradeId) return;
    apiRequest<Subject[]>(`/api/subjects?grade_id=${gradeId}`)
      .then((loadedSubjects) => {
        setSubjects(loadedSubjects);
        setSubjectId(loadedSubjects[0]?.id ? String(loadedSubjects[0].id) : "");
      })
      .catch(() => setSubjects([]));
  }, [gradeId]);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setTopicId("");
      return;
    }
    apiRequest<Topic[]>(`/api/topics?subject_id=${subjectId}`)
      .then((loadedTopics) => {
        setTopics(loadedTopics);
        setTopicId(loadedTopics[0]?.id ? String(loadedTopics[0].id) : "");
      })
      .catch(() => setTopics([]));
  }, [subjectId]);

  useEffect(() => {
    if (!topicId) {
      setSubtopics([]);
      return;
    }
    apiRequest<Subtopic[]>(`/api/subtopics?topic_id=${topicId}`)
      .then(setSubtopics)
      .catch(() => setSubtopics([]));
  }, [topicId]);

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      setMessage("Log in as an admin before adding curriculum data.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const created = await apiRequest<Subject>("/api/admin/subjects", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ grade_id: Number(gradeId), name: String(form.get("name")) })
    });
    setSubjects((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
    setSubjectId(String(created.id));
    setMessage("Subject added.");
    event.currentTarget.reset();
  }

  async function createTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token || !subjectId) {
      setMessage("Choose a subject and log in as an admin before adding topics.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const created = await apiRequest<Topic>("/api/admin/topics", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ subject_id: Number(subjectId), name: String(form.get("name")) })
    });
    setTopics((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
    setTopicId(String(created.id));
    setMessage("Topic added.");
    event.currentTarget.reset();
  }

  async function createSubtopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token || !topicId) {
      setMessage("Choose a topic and log in as an admin before adding subtopics.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const created = await apiRequest<Subtopic>("/api/admin/subtopics", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ topic_id: Number(topicId), name: String(form.get("name")) })
    });
    setSubtopics((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
    setMessage("Subtopic added.");
    event.currentTarget.reset();
  }

  return (
    <>
        <p className="text-sm font-semibold uppercase text-copper">Admin</p>
        <h1 className="mt-2 text-3xl font-bold">Platform management</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {areas.map((area) => {
            const Icon = area.icon;
            return (
              <article key={area.title} className="rounded bg-white p-6 shadow-soft">
                <Icon className="text-leaf" size={24} aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold">{area.title}</h2>
                <p className="mt-3 leading-7 text-ink/70">{area.detail}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-8 rounded bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold">Curriculum subjects</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={createSubject}>
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
            <label className="block text-sm font-medium text-ink/80">
              Subject name
              <input className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf" name="name" required />
            </label>
            <button className="self-end rounded bg-leaf px-4 py-3 font-semibold text-white" type="submit">
              Add subject
            </button>
          </form>
          {message ? <p className="mt-4 text-sm font-medium text-leaf">{message}</p> : null}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                className={`rounded border p-4 text-left font-medium ${
                  subjectId === String(subject.id) ? "border-leaf bg-sky" : "border-ink/10"
                }`}
                type="button"
                onClick={() => setSubjectId(String(subject.id))}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold">Topics</h2>
            <form className="mt-5 grid gap-4" onSubmit={createTopic}>
              <label className="block text-sm font-medium text-ink/80">
                Subject
                <select
                  className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf"
                  value={subjectId}
                  onChange={(event) => setSubjectId(event.target.value)}
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-ink/80">
                Topic name
                <input className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf" name="name" required />
              </label>
              <button className="rounded bg-leaf px-4 py-3 font-semibold text-white" type="submit">
                Add topic
              </button>
            </form>
            <div className="mt-5 grid gap-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  className={`rounded border p-4 text-left font-medium ${
                    topicId === String(topic.id) ? "border-leaf bg-sky" : "border-ink/10"
                  }`}
                  type="button"
                  onClick={() => setTopicId(String(topic.id))}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold">Subtopics</h2>
            <form className="mt-5 grid gap-4" onSubmit={createSubtopic}>
              <label className="block text-sm font-medium text-ink/80">
                Topic
                <select
                  className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf"
                  value={topicId}
                  onChange={(event) => setTopicId(event.target.value)}
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-ink/80">
                Subtopic name
                <input className="mt-2 w-full rounded border border-ink/15 px-3 py-3 outline-leaf" name="name" required />
              </label>
              <button className="rounded bg-leaf px-4 py-3 font-semibold text-white" type="submit">
                Add subtopic
              </button>
            </form>
            <div className="mt-5 grid gap-3">
              {subtopics.map((subtopic) => (
                <div key={subtopic.id} className="rounded border border-ink/10 p-4 font-medium">
                  {subtopic.name}
                </div>
              ))}
            </div>
          </div>
        </div>
    </>
  );
}
