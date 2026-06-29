import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  RETURNING_RATE_DATA,
  REVENUE_CHART_DATA,
  SALES_BY_LOCATION,
} from "@/lib/admin/get-dashboard-stats";
import { formatCurrency } from "@/lib/utils";

export function DashboardChartsRow() {
  const maxRevenue = Math.max(
    ...REVENUE_CHART_DATA.flatMap((item) => [item.desktop, item.mobile]),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Receita total</CardTitle>
          <CardDescription>
            Receita dos últimos 28 dias por canal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Desktop
              </p>
              <p className="text-2xl font-semibold">24.828</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Mobile
              </p>
              <p className="text-2xl font-semibold">25.010</p>
            </div>
          </div>

          <div className="flex h-56 items-end gap-3">
            {REVENUE_CHART_DATA.map((item) => (
              <div
                key={item.month}
                className="flex flex-1 items-end justify-center gap-1"
              >
                <div
                  className="w-full max-w-5 rounded-t-sm bg-foreground/80"
                  style={{ height: `${(item.desktop / maxRevenue) * 100}%` }}
                />
                <div
                  className="w-full max-w-5 rounded-t-sm bg-muted-foreground/35"
                  style={{ height: `${(item.mobile / maxRevenue) * 100}%` }}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-6 gap-3 text-center text-xs text-muted-foreground">
            {REVENUE_CHART_DATA.map((item) => (
              <span key={item.month}>{item.month}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Taxa de retorno</CardTitle>
            <CardDescription>Clientes recorrentes</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-3xl font-semibold">{formatCurrency(4237900)}</p>
            <Badge variant="secondary" className="rounded-md text-emerald-700">
              +2,5%
            </Badge>
          </div>

          <div className="relative h-48">
            <svg viewBox="0 0 400 160" className="h-full w-full">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeWidth="2"
                points={RETURNING_RATE_DATA.map(
                  (item, index) =>
                    `${(index / (RETURNING_RATE_DATA.length - 1)) * 380 + 10},${160 - item.previous * 1.4}`,
                ).join(" ")}
              />
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                points={RETURNING_RATE_DATA.map(
                  (item, index) =>
                    `${(index / (RETURNING_RATE_DATA.length - 1)) * 380 + 10},${160 - item.current * 1.4}`,
                ).join(" ")}
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardInsightsRow() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Vendas por região</CardTitle>
          <CardDescription>Participação por país</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {SALES_BY_LOCATION.map((item) => (
            <div key={item.country} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.country}</span>
                <span className="text-muted-foreground">{item.value}%</span>
              </div>
              <Progress value={item.value} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitas por origem</CardTitle>
          <CardDescription>Tráfego da loja</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-4">
          <div className="relative flex size-44 items-center justify-center rounded-full bg-[conic-gradient(var(--foreground)_0_35%,color-mix(in_srgb,var(--foreground)_70%,transparent)_35%_60%,color-mix(in_srgb,var(--foreground)_35%,transparent)_60%_100%)]">
            <div className="flex size-28 flex-col items-center justify-center rounded-full bg-card text-center">
              <span className="text-2xl font-semibold">10,2K</span>
              <span className="text-xs text-muted-foreground">visitas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avaliações</CardTitle>
          <CardDescription>Satisfação dos clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-3xl font-semibold">4,5</p>
            <p className="text-sm text-muted-foreground">de 5 estrelas</p>
          </div>
          {[
            { stars: 5, value: 72, color: "bg-emerald-500" },
            { stars: 4, value: 18, color: "bg-lime-400" },
            { stars: 3, value: 6, color: "bg-yellow-400" },
            { stars: 2, value: 3, color: "bg-orange-400" },
            { stars: 1, value: 1, color: "bg-red-500" },
          ].map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-sm">
              <span className="w-3">{item.stars}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
