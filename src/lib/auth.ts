import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/middleware";
import type { UserRole } from "@/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuth(redirectTo = "/auth/login") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth("/auth/login?redirect=/admin");

  if (!isAdmin(user)) {
    redirect("/");
  }

  return user;
}

export function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
}): UserRole {
  const role = user.app_metadata?.role;
  return role === "admin" ? "admin" : "customer";
}
