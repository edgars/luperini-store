import Link from "next/link";
import { asc } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  DeleteProductTagButton,
  ProductTagForm,
} from "@/components/admin/product-tags-field";
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
import { productTags } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AdminProductTagsPage() {
  await requireAdmin();
  const items = await db.select().from(productTags).orderBy(asc(productTags.name));

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Tags de produtos"
        description="Organize o catálogo com tags para busca e filtros na loja."
        actions={
          <Link
            href="/admin/produtos"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Voltar aos produtos
          </Link>
        }
      />

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      Nenhuma tag cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell>{tag.slug}</TableCell>
                      <TableCell>
                        <DeleteProductTagButton id={tag.id} />
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
            <CardTitle>Nova tag</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductTagForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
