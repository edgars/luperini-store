"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  toggleProductFeaturedAction,
  toggleProductStatusAction,
} from "@/app/(admin)/admin/produtos/actions";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MAX_FEATURED_PRODUCTS } from "@/lib/store/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/types";

export type ProductListItem = {
  id: string;
  name: string;
  status: Product["status"];
  isFeatured: boolean;
  purchaseSource: "supplier" | "in_house";
  supplierId: string | null;
  supplierName: string | null;
  salePrice: number;
  margin: number;
  createdAt: Date;
  categoryName: string | null;
};

type ProductsTableProps = {
  items: ProductListItem[];
  featuredCount: number;
};

function ProductStatusToggle({
  productId,
  initialActive,
}: {
  productId: string;
  initialActive: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [pending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    const previous = active;
    setActive(checked);

    startTransition(async () => {
      const result = await toggleProductStatusAction(productId, checked);
      if (!result.success) {
        setActive(previous);
        toast.error(result.error ?? "Não foi possível atualizar o status.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={active}
        onCheckedChange={handleChange}
        disabled={pending}
        aria-label={active ? "Produto ativo" : "Produto em rascunho"}
      />
      <span className="text-xs text-muted-foreground">
        {active ? "Ativo" : "Rascunho"}
      </span>
    </div>
  );
}

function ProductFeaturedToggle({
  productId,
  initialFeatured,
  featuredLimitReached,
}: {
  productId: string;
  initialFeatured: boolean;
  featuredLimitReached: boolean;
}) {
  const router = useRouter();
  const [featured, setFeatured] = useState(initialFeatured);
  const [pending, startTransition] = useTransition();

  const disabled = pending || (featuredLimitReached && !featured);

  function handleChange(checked: boolean) {
    const previous = featured;
    setFeatured(checked);

    startTransition(async () => {
      const result = await toggleProductFeaturedAction(productId, checked);
      if (!result.success) {
        setFeatured(previous);
        toast.error(result.error ?? "Não foi possível atualizar o destaque.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={featured}
        onCheckedChange={handleChange}
        disabled={disabled}
        aria-label={featured ? "Produto em destaque" : "Produto fora do destaque"}
      />
      <span className="text-xs text-muted-foreground">
        {featured ? "Em destaque" : "—"}
      </span>
    </div>
  );
}

export function ProductsTable({ items, featuredCount }: ProductsTableProps) {
  const featuredLimitReached = featuredCount >= MAX_FEATURED_PRODUCTS;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Margem</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Destaque</TableHead>
          <TableHead>Criado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link
                href={`/admin/produtos/${item.id}`}
                className="font-medium hover:underline"
              >
                {item.name}
              </Link>
            </TableCell>
            <TableCell>{item.categoryName ?? "—"}</TableCell>
            <TableCell>
              {item.purchaseSource === "supplier" && item.supplierId ? (
                <Link
                  href={`/admin/fornecedores/${item.supplierId}`}
                  className="text-primary hover:underline"
                >
                  {item.supplierName ?? "Fornecedor"}
                </Link>
              ) : (
                "Fabricação própria"
              )}
            </TableCell>
            <TableCell>{formatCurrency(item.salePrice)}</TableCell>
            <TableCell
              className={item.margin < 20 ? "text-destructive" : undefined}
            >
              {item.margin}%
            </TableCell>
            <TableCell>
              <ProductStatusToggle
                key={`status-${item.id}-${item.status}`}
                productId={item.id}
                initialActive={item.status === "active"}
              />
            </TableCell>
            <TableCell>
              <ProductFeaturedToggle
                key={`featured-${item.id}-${item.isFeatured}`}
                productId={item.id}
                initialFeatured={item.isFeatured}
                featuredLimitReached={featuredLimitReached}
              />
            </TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
