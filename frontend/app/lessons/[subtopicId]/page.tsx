"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../../../components/PageShell";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { apiRequest, Subtopic } from "../../../lib/api";

export default function LessonPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <ProtectedPage>{() => <LessonContent />}</ProtectedPage>
      </section>
    </PageShell>
  );
}

function LessonContent() {
  const params = useParams<{ subtopicId: string }>();
  const subtopicId = useMemo(() => Number(params.subtopicId), [params.subtopicId]);
  const [subtopic, setSubtopic] = useState<Subtopic | null>(null);

  useEffect(() => {
    apiRequest<Subtopic[]>("/api/subtopics").then((items) => setSubtopic(items.find((item) => item.id === subtopicId) ?? null));
  }, [subtopicId]);

  return (
    <>
      <Link className="text-sm font-semibold text-leaf" href={subtopic ? `/topics/${subtopic.topic_id}` : "/subjects"}>
        Back to topic
      </Link>
      <article className="mt-6 rounded bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase text-copper">Lesson</p>
        <h1 className="mt-2 text-3xl font-bold">{subtopic?.name ?? "Subtopic lesson"}</h1>
        <div className="mt-6 grid gap-4">
          <section className="rounded border border-ink/10 p-5">
            <h2 className="text-xl font-bold">Overview</h2>
            <p className="mt-3 leading-7 text-ink/70">
              Lesson content for this subtopic will be added from authorised curriculum material in a later phase.
            </p>
          </section>
          <section className="rounded border border-ink/10 p-5">
            <h2 className="text-xl font-bold">Practice</h2>
            <p className="mt-3 leading-7 text-ink/70">
              Practice questions, quizzes, explanations, and progress tracking will connect here after the question engine is built.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
