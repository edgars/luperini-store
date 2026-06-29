import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

const labels: Record<Product["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  draft: "Rascunho",
};

const variants: Record<
  Product["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
  draft: "outline",
};

export function ProductStatusBadge({
  status,
}: {
  status: Product["status"];
}) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
