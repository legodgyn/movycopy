"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Zap, FileText, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const items = [
  {
    name: "Copy rápida",
    href: "/copy-rapida",
    icon: Zap,
  },
  {
    name: "Copy completa",
    href: "/copy-completa",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-white/10 bg-gradient-to-b from-[#0f0c29] via-[#1b0f3a] to-[#0a0a1a] p-4">
      {/* Topo */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
          Painel
        </div>

        {/* LOGO */}
        <div className="mt-6 flex items-center justify-center">
          <Image
            src="/logo.png" // coloca sua logo aqui
            alt="Logo"
            width={200}
            height={80}
            className="h-auto w-auto max-h-20 object-contain"
            priority
          />
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/30"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Aparência
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Alterne entre claro e escuro.
          </p>
        </div>

        {/* Toggle tema */}
        <ThemeToggle />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}