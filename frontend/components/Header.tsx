import Link from "next/link";
import { BookOpen, GraduationCap, LayoutDashboard, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: GraduationCap },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
];

export function Header() {
  return (
    <header className="border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded bg-leaf text-white">
            <BookOpen size={20} aria-hidden="true" />
          </span>
          <span>Zambian AI Tutor</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/75 sm:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-2 hover:text-leaf">
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 text-sm font-semibold text-ink/75 hover:text-leaf">
            Log in
          </Link>
          <Link href="/register" className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
