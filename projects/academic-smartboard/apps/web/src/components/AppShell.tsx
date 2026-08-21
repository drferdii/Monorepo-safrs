"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "../lib/auth.tsx";
import { cn } from "../lib/cn.ts";
import { filterByRole, NAV_ITEMS } from "../lib/nav.ts";

// next.config.ts sets trailingSlash: true, so usePathname() returns
// "/master/murid/" while NAV_ITEMS hrefs are written without the trailing
// slash. Strip it before comparing so the active nav state actually fires.
function stripTrailingSlash(value: string): string {
  if (value.length > 1 && value.endsWith("/")) {
    return value.slice(0, -1);
  }
  return value;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const items = filterByRole(NAV_ITEMS, user.role);
  const normalizedPathname = stripTrailingSlash(pathname ?? "/");

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className="hidden w-[var(--layout-rail-width)] shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-background-surface)] md:block"
        aria-label="Navigasi utama"
      >
        <div className="px-[var(--space-4)] py-[var(--space-5)]">
          <span className="text-[length:var(--font-size-title-section)] font-[var(--font-weight-semibold)] uppercase tracking-[var(--letter-spacing-label)] text-[var(--color-text-secondary)]">
            Sentra Smartboard
          </span>
        </div>
        <nav className="flex flex-col gap-[var(--space-1)] px-[var(--space-2)]">
          {items.map((item) => {
            const active = normalizedPathname === stripTrailingSlash(item.href);
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[var(--target-min)] items-center rounded-[var(--radius-control)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-standard)] hover:bg-[var(--color-background-canvas)]",
                  active &&
                    "bg-[var(--color-background-canvas)] font-[var(--font-weight-medium)] text-[var(--color-accent-text)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[var(--target-min)] items-center justify-end border-b border-[var(--color-border-subtle)] bg-[var(--color-background-canvas)] px-[var(--space-4)] py-[var(--space-2)]">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex min-h-[var(--target-min)] items-center gap-[var(--space-2)] rounded-[var(--radius-control)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                {user.name}
                <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-[var(--z-drawer)] min-w-40 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] bg-[var(--color-background-canvas)] p-[var(--space-1)] shadow-[var(--elevation-overlay)]"
              >
                <DropdownMenu.Item
                  onSelect={() => {
                    void handleLogout();
                  }}
                  className="flex min-h-[var(--target-min)] cursor-pointer items-center gap-[var(--space-2)] rounded-[var(--radius-control)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none data-[highlighted]:bg-[var(--color-background-surface)]"
                >
                  <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
                  Keluar
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>

        <main className="flex-1 px-[var(--space-4)] py-[var(--space-5)]">
          {children}
        </main>
      </div>
    </div>
  );
}
