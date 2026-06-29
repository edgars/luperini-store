import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    title: "Dados da loja",
    description:
      "Nome, e-mails, telefone e WhatsApp usados no site e comunicações.",
    href: "/admin/configuracoes/loja",
  },
  {
    title: "Redes sociais",
    description:
      "Instagram, TikTok e Shopee exibidos no rodapé e no site.",
    href: "/admin/configuracoes/redes-sociais",
  },
  {
    title: "Tipografia",
    description:
      "Fontes da loja — geral ou por H1, H2, H3, parágrafo e botões, com esquemas salvos.",
    href: "/admin/configuracoes/tipografia",
  },
  {
    title: "Envio e frete",
    description:
      "CEP e endereço de origem, frete fixo ou grátis, prazos e dimensões padrão da embalagem.",
    href: "/admin/configuracoes/envio",
  },
  {
    title: "Integrações",
    description:
      "Melhor Envio, Mercado Pago, Stripe, Resend e ViaCEP — com status das variáveis de ambiente.",
    href: "/admin/configuracoes/integracoes",
  },
  {
    title: "Página inicial",
    description:
      "Menu de categorias, textos do hero, botão de ação e imagem principal — com pré-visualização.",
    href: "/admin/configuracoes/home",
  },
] as const;

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Configurações"
        description="Preferências da loja, envio e integrações."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {settingsSections.map((section) => (
          <Card key={section.href}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
              <Link href={section.href} className={cn(buttonVariants())}>
                Configurar
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
