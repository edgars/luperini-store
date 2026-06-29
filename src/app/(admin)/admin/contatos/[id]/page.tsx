import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  DeletePurchaseContactButton,
  PurchaseContactForm,
} from "@/components/admin/purchase-contact-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { purchaseContacts, suppliers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AdminPurchaseContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [contact] = await db
    .select()
    .from(purchaseContacts)
    .where(eq(purchaseContacts.id, id))
    .limit(1);

  if (!contact) {
    return (
      <div className="w-full space-y-6">
        <AdminPageHeader title="Contato não encontrado" />
        <Link
          href="/admin/contatos"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar
        </Link>
      </div>
    );
  }

  const supplierList = await db
    .select()
    .from(suppliers)
    .orderBy(asc(suppliers.name));

  const linkedSupplier = contact.supplierId
    ? supplierList.find((item) => item.id === contact.supplierId)
    : null;

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title={contact.name}
        description={
          linkedSupplier
            ? `Contato vinculado a ${linkedSupplier.name}.`
            : "Contato independente, sem fornecedor vinculado."
        }
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/contatos"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Voltar
            </Link>
            <DeletePurchaseContactButton id={id} />
          </div>
        }
      />

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {contact.role && (
              <p>
                <span className="text-muted-foreground">Cargo:</span>{" "}
                {contact.role}
              </p>
            )}
            {contact.email && (
              <p>
                <span className="text-muted-foreground">E-mail:</span>{" "}
                <a href={`mailto:${contact.email}`} className="hover:underline">
                  {contact.email}
                </a>
              </p>
            )}
            {contact.phone && (
              <p>
                <span className="text-muted-foreground">Telefone:</span>{" "}
                {contact.phone}
              </p>
            )}
            {linkedSupplier && (
              <p>
                <span className="text-muted-foreground">Fornecedor:</span>{" "}
                <Link
                  href={`/admin/fornecedores/${linkedSupplier.id}`}
                  className="hover:underline"
                >
                  {linkedSupplier.name}
                </Link>
              </p>
            )}
            {contact.notes && (
              <p>
                <span className="text-muted-foreground">Observações:</span>{" "}
                {contact.notes}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              {contact.isActive ? "Ativo" : "Inativo"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editar contato</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseContactForm contact={contact} suppliers={supplierList} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
