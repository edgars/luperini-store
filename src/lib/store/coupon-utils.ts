import type { Coupon } from "@/types";

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function formatCouponCode(code: string) {
  return normalizeCouponCode(code);
}

export function calculateCouponDiscount(
  coupon: Pick<Coupon, "type" | "value">,
  subtotalCents: number,
) {
  if (subtotalCents <= 0) return 0;

  if (coupon.type === "percentage") {
    return Math.min(
      Math.round((subtotalCents * coupon.value) / 100),
      subtotalCents,
    );
  }

  return Math.min(coupon.value, subtotalCents);
}

export function formatCouponValue(coupon: Pick<Coupon, "type" | "value">) {
  if (coupon.type === "percentage") {
    return `${coupon.value}%`;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(coupon.value / 100);
}

export type CouponValidationResult =
  | {
      valid: true;
      coupon: Coupon;
      discountCents: number;
    }
  | {
      valid: false;
      error: string;
    };

export function validateCouponForOrder(
  coupon: Coupon,
  subtotalCents: number,
  now = new Date(),
): CouponValidationResult {
  const normalizedInput = normalizeCouponCode(coupon.code);

  if (!coupon.isActive) {
    return { valid: false, error: "Este cupom não está ativo." };
  }

  if (coupon.validFrom && now < coupon.validFrom) {
    return { valid: false, error: "Este cupom ainda não está vigente." };
  }

  if (coupon.validUntil && now > coupon.validUntil) {
    return { valid: false, error: "Este cupom expirou." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Este cupom atingiu o limite de usos." };
  }

  if (
    coupon.minOrderValue !== null &&
    subtotalCents < coupon.minOrderValue
  ) {
    return {
      valid: false,
      error: "Valor mínimo do pedido não atingido para este cupom.",
    };
  }

  return {
    valid: true,
    coupon: { ...coupon, code: normalizedInput },
    discountCents: calculateCouponDiscount(coupon, subtotalCents),
  };
}

export function getCouponStatus(
  coupon: Pick<
    Coupon,
    "isActive" | "validFrom" | "validUntil" | "maxUses" | "usedCount"
  >,
  now = new Date(),
) {
  if (!coupon.isActive) return "inactive" as const;
  if (coupon.validFrom && now < coupon.validFrom) return "scheduled" as const;
  if (coupon.validUntil && now > coupon.validUntil) return "expired" as const;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return "exhausted" as const;
  }
  return "active" as const;
}

export const COUPON_STATUS_LABELS = {
  active: "Ativo",
  scheduled: "Agendado",
  expired: "Expirado",
  exhausted: "Esgotado",
  inactive: "Inativo",
} as const;
