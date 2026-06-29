import Link from "next/link";
import { ArrowUpRight, Download, PartyPopper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DashboardStatsCardsProps {
  revenueTotal: number;
  orderCount: number;
  userCount: number;
}

export function DashboardStatsCards({
  revenueTotal,
  orderCount,
  userCount,
}: DashboardStatsCardsProps) {
  const cards = [
    {
      title: "Receita total",
      value: formatCurrency(revenueTotal),
      change: "+6,1%",
      positive: true,
      href: "/admin/financeiro",
    },
    {
      title: "Pedidos",
      value: orderCount.toLocaleString("pt-BR"),
      change: "+12,4%",
      positive: true,
      href: "/admin/pedidos",
    },
    {
      title: "Clientes",
      value: userCount.toLocaleString("pt-BR"),
      change: "+19,2%",
      positive: true,
      href: "/admin/clientes",
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <PartyPopper className="size-4" />
            Destaque do mês
          </CardDescription>
          <CardTitle className="text-xl">Parabéns, Luperini!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Melhor desempenho de vendas do mês
          </p>
          <p className="text-3xl font-semibold tracking-tight">
            {formatCurrency(revenueTotal || 1523189)}
          </p>
          <Badge variant="secondary" className="rounded-md">
            +65% vs. mês anterior
          </Badge>
        </CardContent>
        <CardFooter>
          <Link
            href="/admin/pedidos"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Ver vendas
          </Link>
        </CardFooter>
      </Card>

      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="secondary"
              className={cn(
                "rounded-md",
                card.positive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-destructive",
              )}
            >
              {card.change}
            </Badge>
          </CardContent>
          <CardFooter>
            <Link
              href={card.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Ver mais
              <ArrowUpRight className="size-4" />
            </Link>
          </CardFooter>
        </Card>
      ))}

    </div>
  );
}

export function DashboardPageActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm">
        02 Jun 2026 – 29 Jun 2026
      </Button>
      <Button size="sm">
        <Download className="size-4" />
        Download
      </Button>
    </div>
  );
}
