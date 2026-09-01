import { AuthForm } from "../../components/AuthForm";
import { PageShell } from "../../components/PageShell";

export default function RegisterPage() {
  return (
    <PageShell>
      <section className="px-4 py-12">
        <AuthForm mode="register" />
      </section>
    </PageShell>
  );
}
