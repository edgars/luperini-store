"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  SupplierLinkedProduct,
  SupplierListItem,
} from "@/lib/admin/supplier-stats";
import { cn, formatCurrency } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  active: "Ativo",
  draft: "Rascunho",
  inactive: "Inativo",
};

type SuppliersMasterDetailProps = {
  items: SupplierListItem[];
  productsBySupplier: Record<string, SupplierLinkedProduct[]>;
};

export function SuppliersMasterDetail({
  items,
  productsBySupplier,
}: SuppliersMasterDetailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpanded(supplierId: string) {
    setExpandedId((current) => (current === supplierId ? null : supplierId));
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">Nenhum fornecedor cadastrado.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Fornecedor</TableHead>
          <TableHead>Produtos</TableHead>
          <TableHead>Compras</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Margem média</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          const supplierProducts = productsBySupplier[item.id] ?? [];
          const canExpand = item.productCount > 0;

          return (
            <Fragment key={item.id}>
              <TableRow>
                <TableCell className="py-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="size-7"
                    disabled={!canExpand}
                    onClick={() => toggleExpanded(item.id)}
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? `Ocultar produtos de ${item.name}`
                        : `Mostrar produtos de ${item.name}`
                    }
                  >
                    {isExpanded ? (
                      <Minus className="size-3.5" />
                    ) : (
                      <Plus className="size-3.5" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/fornecedores/${item.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.phone && (
                    <p className="text-xs text-muted-foreground">{item.phone}</p>
                  )}
                </TableCell>
                <TableCell>{item.productCount}</TableCell>
                <TableCell>{item.purchaseCount}</TableCell>
                <TableCell>{formatCurrency(item.totalPurchased)}</TableCell>
                <TableCell>
                  {item.averageMargin !== null
                    ? `${item.averageMargin}%`
                    : "—"}
                </TableCell>
                <TableCell>{item.isActive ? "Ativo" : "Inativo"}</TableCell>
              </TableRow>

              {isExpanded ? (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={7} className="p-0">
                    <div className="border-t border-border/60 px-4 py-4 sm:px-6">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Produtos comprados · {item.name}
                      </p>
                      {supplierProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum produto vinculado a este fornecedor.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border bg-background">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Margem</TableHead>
                                <TableHead>Compras</TableHead>
                                <TableHead>Volume</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {supplierProducts.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell>
                                    <Link
                                      href={`/admin/produtos/${product.id}`}
                                      className="font-medium hover:underline"
                                    >
                                      {product.name}
                                    </Link>
                                  </TableCell>
                                  <TableCell>
                                    {formatCurrency(product.salePrice)}
                                  </TableCell>
                                  <TableCell
                                    className={cn(
                                      product.margin < 20 &&
                                        "text-destructive",
                                    )}
                                  >
                                    {product.margin}%
                                  </TableCell>
                                  <TableCell>{product.purchaseCount}</TableCell>
                                  <TableCell>
                                    {formatCurrency(product.totalPurchased)}
                                  </TableCell>
                                  <TableCell>
                                    {statusLabels[product.status] ??
                                      product.status}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
