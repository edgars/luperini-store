import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PurchaseContactForm } from "@/components/admin/purchase-contact-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { purchaseContacts, suppliers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AdminPurchaseContactsPage() {
  await requireAdmin();

  const [items, supplierList] = await Promise.all([
    db
      .select({
        id: purchaseContacts.id,
        name: purchaseContacts.name,
        role: purchaseContacts.role,
        email: purchaseContacts.email,
        phone: purchaseContacts.phone,
        isActive: purchaseContacts.isActive,
        supplierId: purchaseContacts.supplierId,
        supplierName: suppliers.name,
      })
      .from(purchaseContacts)
      .leftJoin(suppliers, eq(suppliers.id, purchaseContacts.supplierId))
      .orderBy(asc(purchaseContacts.name)),
    db.select().from(suppliers).orderBy(asc(suppliers.name)),
  ]);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Contatos de compras"
        description="Pessoas com quem você interage para compras. Podem ou não estar vinculadas a um fornecedor."
        actions={
          <Link
            href="/admin/fornecedores"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Fornecedores
          </Link>
        }
      />

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Nenhum contato cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/admin/contatos/${item.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.role && (
                          <p className="text-xs text-muted-foreground">
                            {item.role}
                          </p>
                        )}
                        {item.email && (
                          <p className="text-xs text-muted-foreground">
                            {item.email}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.supplierId ? (
                          <Link
                            href={`/admin/fornecedores/${item.supplierId}`}
                            className="hover:underline"
                          >
                            {item.supplierName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{item.phone ?? "—"}</TableCell>
                      <TableCell>
                        {item.isActive ? "Ativo" : "Inativo"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo contato</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseContactForm suppliers={supplierList} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
