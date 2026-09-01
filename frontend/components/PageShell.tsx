import { Header } from "./Header";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fbfaf5]">
      <Header />
      {children}
    </main>
  );
}
