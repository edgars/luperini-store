import { Card, CardContent } from "@/components/ui/card";
import type { CouponAnalyticsSummary } from "@/lib/admin/coupon-stats";
import { formatCurrency } from "@/lib/utils";

type CouponAnalyticsCardsProps = {
  summary: CouponAnalyticsSummary;
};

export function CouponAnalyticsCards({ summary }: CouponAnalyticsCardsProps) {
  const cards = [
    {
      label: "Cupons cadastrados",
      value: summary.totalCoupons.toLocaleString("pt-BR"),
    },
    {
      label: "Cupons ativos",
      value: summary.activeCoupons.toLocaleString("pt-BR"),
    },
    {
      label: "Usos em pedidos",
      value: summary.totalUses.toLocaleString("pt-BR"),
    },
    {
      label: "Desconto concedido",
      value: formatCurrency(summary.totalDiscountGiven),
    },
    {
      label: "Parceiros",
      value: summary.partnerCount.toLocaleString("pt-BR"),
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
