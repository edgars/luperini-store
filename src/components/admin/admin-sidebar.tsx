import Image from "next/image";
import Link from "next/link";
import { LogOut, Store } from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  className,
  collapsed = false,
  onNavigate,
}: {
  className?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Luperini Store";

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
        collapsed ? "w-[4.5rem]" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link
          href="/admin"
          className={cn(
            "flex items-center transition-opacity hover:opacity-80",
            collapsed && "justify-center",
          )}
          title={storeName}
        >
          {collapsed ? (
            <Store className="size-5 shrink-0" />
          ) : (
            <Image
              src="/logo-preta.svg"
              alt={storeName}
              width={488}
              height={208}
              priority
              className="h-8 w-auto"
            />
          )}
        </Link>
      </div>

      <AdminSidebarNav collapsed={collapsed} onNavigate={onNavigate} />

      <div
        className={cn(
          "mt-auto shrink-0 space-y-2 border-t p-3",
          collapsed && "px-2",
        )}
      >
        {collapsed ? (
          <>
            <Link
              href="/"
              title="Voltar à loja"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "mx-auto flex",
              )}
            >
              <Store className="size-4" />
            </Link>
            <form action={signOutAction}>
              <Button
                variant="outline"
                size="icon-sm"
                className="mx-auto flex"
                type="submit"
                title="Sair"
              >
                <LogOut className="size-4" />
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full justify-start",
              )}
            >
              Voltar à loja
            </Link>
            <form action={signOutAction}>
              <Button variant="outline" size="sm" className="w-full" type="submit">
                Sair
              </Button>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}
