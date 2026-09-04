"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../../../components/PageShell";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { apiRequest, Subject, Topic } from "../../../lib/api";

export default function SubjectDetailPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <ProtectedPage>{() => <SubjectDetailContent />}</ProtectedPage>
      </section>
    </PageShell>
  );
}

function SubjectDetailContent() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = useMemo(() => Number(params.subjectId), [params.subjectId]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    apiRequest<Subject[]>("/api/subjects").then((items) => setSubject(items.find((item) => item.id === subjectId) ?? null));
    apiRequest<Topic[]>(`/api/topics?subject_id=${subjectId}`).then(setTopics);
  }, [subjectId]);

  return (
    <>
      <Link className="text-sm font-semibold text-leaf" href="/subjects">
        Back to subjects
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{subject?.name ?? "Subject"}</h1>
      <p className="mt-2 text-ink/65">Select a topic to continue your learning path.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {topics.map((topic) => (
          <Link key={topic.id} className="rounded bg-white p-6 shadow-soft hover:outline hover:outline-2 hover:outline-leaf" href={`/topics/${topic.id}`}>
            <h2 className="text-xl font-bold">{topic.name}</h2>
            <p className="mt-3 text-ink/65">Open subtopics and lesson placeholders.</p>
          </Link>
        ))}
      </div>
      {!topics.length ? <p className="mt-8 rounded bg-white p-6 text-ink/70 shadow-soft">No topics have been added for this subject yet.</p> : null}
    </>
  );
}
