import Link from "next/link";
import { BarChart3, BookMarked, Brain, ClipboardCheck, GraduationCap, PenTool } from "lucide-react";
import { PageShell } from "../components/PageShell";

const features = [
  { title: "Grade 7 support", icon: GraduationCap },
  { title: "Grade 9 support", icon: BookMarked },
  { title: "Grade 12 support", icon: ClipboardCheck },
  { title: "AI tutoring", icon: Brain },
  { title: "Practice questions", icon: PenTool },
  { title: "Performance analysis", icon: BarChart3 }
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="bg-sky">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase text-copper">Zambian AI Tutor</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Your AI-powered Zambian examination tutor.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/75">
              A focused preparation platform for Grade 7, Grade 9, and Grade 12 learners who want structured practice,
              clear explanations, and progress insight.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="rounded bg-leaf px-5 py-3 text-center font-semibold text-white" href="/register">
                Start learning
              </Link>
              <Link className="rounded border border-ink/20 px-5 py-3 text-center font-semibold" href="/login">
                Log in
              </Link>
            </div>
          </div>
          <div className="rounded bg-white p-6 shadow-soft">
            <div className="grid gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-center gap-4 rounded border border-ink/10 p-4">
                    <span className="grid h-11 w-11 place-items-center rounded bg-maize/35 text-ink">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <span className="font-semibold">{feature.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {["Examination preparation", "Step-by-step learning", "Readiness analytics"].map((title) => (
            <article key={title} className="rounded bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 leading-7 text-ink/70">
                Built as a careful foundation for authorised learning materials, practice workflows, and personalised
                study guidance in future phases.
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
