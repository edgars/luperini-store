import Link from "next/link";

import { HomeConfigEditor } from "@/components/admin/home-config-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getHomePageSettingsForAdmin } from "@/lib/store/get-home-config";
import { cn } from "@/lib/utils";

export default async function AdminHomeConfigPage() {
  await requireAdmin();

  const [settings, allCategories] = await Promise.all([
    getHomePageSettingsForAdmin(),
    db.select().from(categories).orderBy(categories.name),
  ]);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Configurar Home"
        description="Menu principal, textos do hero e imagem de destaque."
        actions={
          <Link
            href="/admin/configuracoes"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Voltar
          </Link>
        }
      />

      <HomeConfigEditor
        initialSettings={settings}
        categories={allCategories}
      />
    </div>
  );
}
