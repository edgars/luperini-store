import Link from "next/link";

import {
  CategoryForm,
  DeleteCategoryButton,
} from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const items = await db.select().from(categories).orderBy(categories.name);
  const parentMap = new Map(items.map((item) => [item.id, item.name]));

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Categorias"
        description="Organize os produtos em categorias e subcategorias."
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
                  <TableHead>Pai</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Nenhuma categoria cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        {category.parentId
                          ? (parentMap.get(category.parentId) ?? "—")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DeleteCategoryButton id={category.id} />
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
            <CardTitle>Nova categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm categories={items} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
