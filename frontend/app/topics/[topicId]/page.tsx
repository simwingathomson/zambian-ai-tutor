"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../../../components/PageShell";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { apiRequest, Subtopic, Topic } from "../../../lib/api";

export default function TopicDetailPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <ProtectedPage>{() => <TopicDetailContent />}</ProtectedPage>
      </section>
    </PageShell>
  );
}

function TopicDetailContent() {
  const params = useParams<{ topicId: string }>();
  const topicId = useMemo(() => Number(params.topicId), [params.topicId]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  useEffect(() => {
    apiRequest<Topic[]>("/api/topics").then((items) => setTopic(items.find((item) => item.id === topicId) ?? null));
    apiRequest<Subtopic[]>(`/api/subtopics?topic_id=${topicId}`).then(setSubtopics);
  }, [topicId]);

  return (
    <>
      <Link className="text-sm font-semibold text-leaf" href={topic ? `/subjects/${topic.subject_id}` : "/subjects"}>
        Back to subject
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{topic?.name ?? "Topic"}</h1>
      <p className="mt-2 text-ink/65">Choose a subtopic to open the lesson workspace.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {subtopics.map((subtopic) => (
          <Link key={subtopic.id} className="rounded bg-white p-6 shadow-soft hover:outline hover:outline-2 hover:outline-leaf" href={`/lessons/${subtopic.id}`}>
            <h2 className="text-xl font-bold">{subtopic.name}</h2>
            <p className="mt-3 text-ink/65">Open lesson notes and future practice.</p>
          </Link>
        ))}
      </div>
      {!subtopics.length ? <p className="mt-8 rounded bg-white p-6 text-ink/70 shadow-soft">No subtopics have been added for this topic yet.</p> : null}
    </>
  );
}
