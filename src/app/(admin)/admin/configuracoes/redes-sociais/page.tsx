import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreSocialForm } from "@/components/admin/store-social-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getSocialSettings } from "@/lib/store/get-store-settings";
import { cn } from "@/lib/utils";

export default async function AdminStoreSocialConfigPage() {
  await requireAdmin();
  const settings = await getSocialSettings();

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Redes sociais"
        description="Links exibidos no site — Instagram, TikTok e Shopee."
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
          <StoreSocialForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
