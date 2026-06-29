import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreTypographyForm } from "@/components/admin/store-typography-form";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { getTypographySettings } from "@/lib/store/get-store-settings";
import { cn } from "@/lib/utils";

export default async function AdminStoreTypographyConfigPage() {
  await requireAdmin();
  const settings = await getTypographySettings();

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Tipografia"
        description="Fontes da loja — geral ou por elemento, com esquemas reutilizáveis."
        actions={
          <Link
            href="/admin/configuracoes"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Voltar
          </Link>
        }
      />

      <StoreTypographyForm settings={settings} />
    </div>
  );
}
