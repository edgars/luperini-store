"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_GROUPS, isAdminNavActive } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

export function AdminSidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex flex-1 flex-col overflow-y-auto py-4",
        collapsed ? "gap-2 px-2" : "gap-6 px-3",
      )}
    >
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1">
          {!collapsed ? (
            <p className="px-2 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
          ) : null}

          {group.items.map((item) => {
            const active = isAdminNavActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors",
                  collapsed
                    ? "justify-center rounded-xl p-2.5"
                    : "gap-3 rounded-xl px-2 py-2",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
