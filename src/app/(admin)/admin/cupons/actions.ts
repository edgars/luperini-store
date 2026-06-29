"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import { parseReaisToCents } from "@/lib/prices";
import { normalizeCouponCode } from "@/lib/store/coupon-utils";
import type { ActionResult } from "@/types";

const couponSchema = z.object({
  code: z
    .string()
    .min(2, "Informe o código do cupom")
    .max(32, "Código muito longo")
    .regex(/^[A-Za-z0-9_-]+$/, "Use apenas letras, números, _ ou -"),
  type: z.enum(["percentage", "fixed"]),
  value: z.string().min(1, "Informe o valor do desconto"),
  minOrderValue: z.string().optional(),
  maxUses: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  partnerId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional(),
  isActive: z.boolean(),
});

function parseOptionalDate(value?: string) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseOptionalInt(value?: string) {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

function parseCouponValue(
  type: "percentage" | "fixed",
  rawValue: string,
): { value: number } | { error: string } {
  if (type === "percentage") {
    const parsed = Number(rawValue.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) {
      return { error: "Informe um percentual entre 1 e 100." };
    }
    return { value: Math.round(parsed) };
  }

  const cents = parseReaisToCents(rawValue);
  if (cents === null || cents <= 0) {
    return { error: "Informe um valor fixo válido." };
  }
  return { value: cents };
}

function parseCouponForm(formData: FormData) {
  return couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minOrderValue: formData.get("minOrderValue") || undefined,
    maxUses: formData.get("maxUses") || undefined,
    validFrom: formData.get("validFrom") || undefined,
    validUntil: formData.get("validUntil") || undefined,
    partnerId: formData.get("partnerId") || undefined,
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCouponAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const valueResult = parseCouponValue(parsed.data.type, parsed.data.value);
  if ("error" in valueResult) {
    return { success: false, error: valueResult.error };
  }

  const minOrderRaw = parsed.data.minOrderValue?.trim();
  const minOrderValue = minOrderRaw
    ? parseReaisToCents(minOrderRaw)
    : null;

  if (minOrderRaw && (minOrderValue === null || minOrderValue <= 0)) {
    return { success: false, error: "Valor mínimo do pedido inválido." };
  }

  const validFrom = parseOptionalDate(parsed.data.validFrom);
  const validUntil = parseOptionalDate(parsed.data.validUntil);

  if (validFrom && validUntil && validUntil < validFrom) {
    return {
      success: false,
      error: "A data final deve ser posterior à data inicial.",
    };
  }

  let couponId: string;

  try {
    const [created] = await db
      .insert(coupons)
      .values({
        code: normalizeCouponCode(parsed.data.code),
        type: parsed.data.type,
        value: valueResult.value,
        minOrderValue,
        maxUses: parseOptionalInt(parsed.data.maxUses),
        validFrom,
        validUntil,
        partnerId: parsed.data.partnerId || null,
        description: parsed.data.description?.trim() || null,
        isActive: parsed.data.isActive,
      })
      .returning({ id: coupons.id });

    couponId = created.id;
  } catch {
    return {
      success: false,
      error: "Não foi possível criar o cupom. Verifique se o código já existe.",
    };
  }

  revalidatePath("/admin/cupons");
  revalidatePath("/admin");
  redirect(`/admin/cupons/${couponId}`);
}

export async function updateCouponAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const valueResult = parseCouponValue(parsed.data.type, parsed.data.value);
  if ("error" in valueResult) {
    return { success: false, error: valueResult.error };
  }

  const minOrderRaw = parsed.data.minOrderValue?.trim();
  const minOrderValue = minOrderRaw
    ? parseReaisToCents(minOrderRaw)
    : null;

  if (minOrderRaw && (minOrderValue === null || minOrderValue <= 0)) {
    return { success: false, error: "Valor mínimo do pedido inválido." };
  }

  const validFrom = parseOptionalDate(parsed.data.validFrom);
  const validUntil = parseOptionalDate(parsed.data.validUntil);

  if (validFrom && validUntil && validUntil < validFrom) {
    return {
      success: false,
      error: "A data final deve ser posterior à data inicial.",
    };
  }

  try {
    await db
      .update(coupons)
      .set({
        code: normalizeCouponCode(parsed.data.code),
        type: parsed.data.type,
        value: valueResult.value,
        minOrderValue,
        maxUses: parseOptionalInt(parsed.data.maxUses),
        validFrom,
        validUntil,
        partnerId: parsed.data.partnerId || null,
        description: parsed.data.description?.trim() || null,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, id));
  } catch {
    return {
      success: false,
      error: "Não foi possível atualizar o cupom. Verifique se o código já existe.",
    };
  }

  revalidatePath("/admin/cupons");
  revalidatePath(`/admin/cupons/${id}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  try {
    await db.delete(coupons).where(eq(coupons.id, id));
  } catch {
    return {
      success: false,
      error: "Não foi possível excluir o cupom.",
    };
  }

  revalidatePath("/admin/cupons");
  revalidatePath("/admin");
  return { success: true };
}
