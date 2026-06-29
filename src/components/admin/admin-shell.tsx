"use client";

import { useEffect, useState } from "react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminFont } from "@/lib/fonts/admin-font";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((previous) => {
      const next = !previous;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    <div
      className={cn(
        adminFont.variable,
        adminFont.className,
        "admin-theme flex min-h-screen w-full gap-2 bg-muted/50 p-2 md:gap-3 md:p-3",
      )}
    >
      <div
        className={cn(
          "hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <AdminSidebar
          collapsed={collapsed}
          className="sticky top-3 h-[calc(100vh-1.5rem)] rounded-2xl border shadow-sm"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-[calc(100vh-1rem)] flex-1 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm md:min-h-[calc(100vh-1.5rem)]">
          <AdminHeader
            collapsed={collapsed}
            onToggleSidebar={toggleCollapsed}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          className={cn(
            adminFont.variable,
            adminFont.className,
            "admin-theme fixed inset-y-0 left-0 h-full max-h-none w-64 max-w-none translate-x-0 translate-y-0 rounded-none border-r p-0 sm:max-w-xs",
          )}
        >
          <DialogTitle className="sr-only">Menu admin</DialogTitle>
          <AdminSidebar
            className="h-full w-full border-0"
            onNavigate={() => setMobileOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
