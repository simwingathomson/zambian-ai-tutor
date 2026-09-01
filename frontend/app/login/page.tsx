import { AuthForm } from "../../components/AuthForm";
import { PageShell } from "../../components/PageShell";

export default function LoginPage() {
  return (
    <PageShell>
      <section className="px-4 py-12">
        <AuthForm mode="login" />
      </section>
    </PageShell>
  );
}
