import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreShippingForm } from "@/components/admin/store-shipping-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getShippingSettings } from "@/lib/store/get-store-settings";
import { cn } from "@/lib/utils";

export default async function AdminStoreShippingConfigPage() {
  await requireAdmin();
  const settings = await getShippingSettings();

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Envio e frete"
        description="CEP de origem, endereço de expedição, regras de frete e embalagem padrão."
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
          <StoreShippingForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
