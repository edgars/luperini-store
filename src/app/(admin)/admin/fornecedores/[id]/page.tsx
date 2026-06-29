import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PurchaseContactForm } from "@/components/admin/purchase-contact-form";
import {
  DeleteSupplierButton,
  SupplierForm,
} from "@/components/admin/supplier-form";
import { SupplierPurchaseForm } from "@/components/admin/supplier-purchase-form";
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
import { products, purchaseContacts, supplierPurchases, suppliers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSupplierDetailStats } from "@/lib/admin/supplier-stats";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminSupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);

  if (!supplier) {
    return (
      <div className="w-full space-y-6">
        <AdminPageHeader title="Fornecedor não encontrado" />
        <Link
          href="/admin/fornecedores"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar
        </Link>
      </div>
    );
  }

  const [stats, linkedProducts, purchases, supplierProducts, contacts, allSuppliers] =
    await Promise.all([
      getSupplierDetailStats(id),
      db
        .select({
          id: products.id,
          name: products.name,
          salePrice: products.salePrice,
          margin: products.margin,
          status: products.status,
        })
        .from(products)
        .where(eq(products.supplierId, id))
        .orderBy(products.name),
      db
        .select({
          id: supplierPurchases.id,
          quantity: supplierPurchases.quantity,
          unitCost: supplierPurchases.unitCost,
          totalCost: supplierPurchases.totalCost,
          purchasedAt: supplierPurchases.purchasedAt,
          notes: supplierPurchases.notes,
          productName: products.name,
        })
        .from(supplierPurchases)
        .innerJoin(products, eq(products.id, supplierPurchases.productId))
        .where(eq(supplierPurchases.supplierId, id))
        .orderBy(desc(supplierPurchases.purchasedAt)),
      db
        .select()
        .from(products)
        .where(eq(products.supplierId, id))
        .orderBy(products.name),
      db
        .select()
        .from(purchaseContacts)
        .where(eq(purchaseContacts.supplierId, id))
        .orderBy(purchaseContacts.name),
      db.select().from(suppliers).orderBy(suppliers.name),
    ]);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title={supplier.name}
        description="Detalhes, produtos vinculados e histórico de compras."
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/fornecedores"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Voltar
            </Link>
            <DeleteSupplierButton id={id} />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Produtos</p>
            <p className="text-2xl font-semibold">{stats.productCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Compras</p>
            <p className="text-2xl font-semibold">{stats.purchaseCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Volume comprado</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(stats.totalPurchased)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Margem média</p>
            <p className="text-2xl font-semibold">
              {stats.averageMargin !== null ? `${stats.averageMargin}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos deste fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Nenhum produto vinculado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    linkedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Link
                            href={`/admin/produtos/${product.id}`}
                            className="hover:underline"
                          >
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(product.salePrice)}
                        </TableCell>
                        <TableCell>{product.margin}%</TableCell>
                        <TableCell>{product.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contatos de compras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Nenhum contato vinculado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Link
                            href={`/admin/contatos/${contact.id}`}
                            className="hover:underline"
                          >
                            {contact.name}
                          </Link>
                        </TableCell>
                        <TableCell>{contact.role ?? "—"}</TableCell>
                        <TableCell>{contact.phone ?? "—"}</TableCell>
                        <TableCell>
                          {contact.isActive ? "Ativo" : "Inativo"}
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
              <CardTitle>Histórico de compras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Nenhuma compra registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{formatDate(purchase.purchasedAt)}</TableCell>
                        <TableCell>{purchase.productName}</TableCell>
                        <TableCell>{purchase.quantity}</TableCell>
                        <TableCell>
                          {formatCurrency(purchase.totalCost)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplierForm supplier={supplier} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Novo contato</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseContactForm
                suppliers={allSuppliers}
                defaultSupplierId={id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registrar compra</CardTitle>
            </CardHeader>
            <CardContent>
              {supplierProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Vincule produtos a este fornecedor antes de registrar compras.
                </p>
              ) : (
                <SupplierPurchaseForm
                  supplierId={id}
                  products={supplierProducts}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
