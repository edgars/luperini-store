import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/supabase/middleware";
import type { ActionResult } from "@/types";

export async function assertAdminAction(): Promise<ActionResult | null> {
  const user = await getCurrentUser();

  if (!user || !isAdmin(user)) {
    return { success: false, error: "Acesso negado." };
  }

  return null;
}
