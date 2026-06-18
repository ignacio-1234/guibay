"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Sparkles,
  Settings,
  Menu,
  X,
} from "lucide-react";

type User = {
  name?: string | null;
  email?: string | null;
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: Globe, label: "Mis sitios" },
  { href: "/upgrade", icon: Sparkles, label: "Planes" },
];

export function DashboardSidebar({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setIsOpen(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-primary/[0.09] flex-shrink-0">
        <Link
          href="/dashboard"
          className="text-xl font-black text-primary"
          onClick={close}
        >
          Guibay
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary"
                  : "text-gray-600 hover:bg-primary/[0.05] hover:text-gray-900"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-primary/[0.09] flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name ?? "Usuario"}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <Link
          href="/settings/profile"
          onClick={close}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-primary/[0.05] hover:text-gray-700 transition-colors mt-1"
        >
          <Settings className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          Configuración
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — uses bg-surface token (purple-tinted neutral) to separate from main content bg-surface-muted */}
      <aside
        className={`
          w-64 bg-surface border-r border-primary/[0.09] flex flex-col flex-shrink-0
          fixed lg:static inset-y-0 left-0 z-50
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Menú lateral"
      >
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-primary/[0.09] z-30 flex items-center px-4 gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-primary/[0.07] transition-colors"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
        <Link href="/dashboard" className="text-base font-black text-primary">
          Guibay
        </Link>
      </div>
    </>
  );
}
