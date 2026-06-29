import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreGeneralForm } from "@/components/admin/store-general-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getGeneralSettings } from "@/lib/store/get-store-settings";
import { cn } from "@/lib/utils";

export default async function AdminStoreGeneralConfigPage() {
  await requireAdmin();
  const settings = await getGeneralSettings();

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Dados da loja"
        description="Nome, contatos e informações exibidas ao cliente."
        actions={
          <Link
            href="/admin/configuracoes"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Voltar
          </Link>
        }
      />

      <Card className="w-full">
        <CardContent className="pt-6">
          <StoreGeneralForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
