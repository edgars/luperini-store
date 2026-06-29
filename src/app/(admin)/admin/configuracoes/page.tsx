import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Configurações"
        description="Preferências gerais da loja e integrações."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Página inicial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Menu de categorias, textos do hero, botão de ação e imagem
              principal — com pré-visualização antes de salvar.
            </p>
            <Link
              href="/admin/configuracoes/home"
              className={cn(buttonVariants())}
            >
              Configurar home
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
