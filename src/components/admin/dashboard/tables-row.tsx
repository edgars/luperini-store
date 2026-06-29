import Link from "next/link";
import { Download, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

type RecentOrder = {
  id: string;
  orderNumber: string;
  guestName: string | null;
  total: number;
  status: string;
  createdAt: Date;
};

type TopProduct = {
  productName: string;
  sold: number;
  sales: number;
};

const ORDER_STATUS_LABELS: Record<string, { label: string; className: string }> =
  {
    pending_payment: {
      label: "Aguardando",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    paid: {
      label: "Pago",
      className: "border-orange-200 bg-orange-50 text-orange-700",
    },
    preparing: {
      label: "Preparando",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    shipped: {
      label: "Enviado",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    delivered: {
      label: "Entregue",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    cancelled: {
      label: "Cancelado",
      className: "border-red-200 bg-red-500 text-white",
    },
    refunded: {
      label: "Reembolsado",
      className: "border-red-200 bg-red-500 text-white",
    },
  };

interface DashboardTablesProps {
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export function DashboardTables({
  recentOrders,
  topProducts,
}: DashboardTablesProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Pedidos recentes</CardTitle>
            <CardDescription>Últimas vendas registradas</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Filtrar pedidos..." />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Nenhum pedido registrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => {
                  const status =
                    ORDER_STATUS_LABELS[order.status] ??
                    ORDER_STATUS_LABELS.pending_payment;

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.guestName ?? "Cliente"}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={status.className}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Mostrando {recentOrders.length} de {recentOrders.length} entradas
            </span>
            <span>{formatDate(new Date())}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Produtos mais vendidos</CardTitle>
            <CardDescription>Desempenho do catálogo</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Filtrar produtos..." />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Vendidos</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Sem vendas registradas ainda.
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((product) => (
                  <TableRow key={product.productName}>
                    <TableCell className="font-medium">
                      <Link
                        href="/admin/produtos"
                        className="hover:underline"
                      >
                        {product.productName}
                      </Link>
                    </TableCell>
                    <TableCell>{product.sold}</TableCell>
                    <TableCell>{formatCurrency(product.sales)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="text-sm text-muted-foreground">
            0 de {topProducts.length} linha(s) selecionada(s).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
