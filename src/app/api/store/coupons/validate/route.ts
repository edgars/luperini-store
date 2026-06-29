import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import {
  formatCouponCode,
  normalizeCouponCode,
  validateCouponForOrder,
} from "@/lib/store/coupon-utils";

const bodySchema = z.object({
  code: z.string().min(1, "Informe o cupom"),
  subtotalCents: z.number().int().min(0),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const code = normalizeCouponCode(parsed.data.code);

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);

  if (!coupon) {
    return NextResponse.json(
      { error: "Cupom não encontrado." },
      { status: 404 },
    );
  }

  const result = validateCouponForOrder(coupon, parsed.data.subtotalCents);

  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({
    code: formatCouponCode(result.coupon.code),
    couponId: result.coupon.id,
    type: result.coupon.type,
    value: result.coupon.value,
    minOrderValue: result.coupon.minOrderValue,
    discountCents: result.discountCents,
  });
}
