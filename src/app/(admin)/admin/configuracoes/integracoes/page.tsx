import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreIntegrationsForm } from "@/components/admin/store-integrations-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import {
  getIntegrationEnvStatuses,
} from "@/lib/store/integrations-config";
import { getIntegrationsSettings } from "@/lib/store/get-store-settings";
import { cn } from "@/lib/utils";

export default async function AdminStoreIntegrationsConfigPage() {
  await requireAdmin();
  const settings = await getIntegrationsSettings();
  const envStatuses = getIntegrationEnvStatuses(settings);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Integrações"
        description="Ative serviços externos. Tokens e chaves secretas ficam nas variáveis de ambiente."
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
          <StoreIntegrationsForm
            settings={settings}
            envStatuses={envStatuses}
          />
        </CardContent>
      </Card>
    </div>
  );
}
