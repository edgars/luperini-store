"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { couponPartners } from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import type { ActionResult } from "@/types";

const partnerSchema = z.object({
  name: z.string().min(2, "Informe o nome do parceiro"),
  handle: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

function parsePartnerForm(formData: FormData) {
  return partnerSchema.safeParse({
    name: formData.get("name"),
    handle: formData.get("handle") || undefined,
    email: formData.get("email") || undefined,
    notes: formData.get("notes") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCouponPartnerAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parsePartnerForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await db.insert(couponPartners).values({
      name: parsed.data.name.trim(),
      handle: parsed.data.handle?.trim() || null,
      email: parsed.data.email?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
      isActive: parsed.data.isActive,
    });
  } catch {
    return { success: false, error: "Não foi possível criar o parceiro." };
  }

  revalidatePath("/admin/cupons");
  revalidatePath("/admin/cupons/parceiros");
  return { success: true };
}

export async function updateCouponPartnerAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parsePartnerForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await db
      .update(couponPartners)
      .set({
        name: parsed.data.name.trim(),
        handle: parsed.data.handle?.trim() || null,
        email: parsed.data.email?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(couponPartners.id, id));
  } catch {
    return { success: false, error: "Não foi possível atualizar o parceiro." };
  }

  revalidatePath("/admin/cupons");
  revalidatePath("/admin/cupons/parceiros");
  return { success: true };
}

export async function deleteCouponPartnerAction(id: string): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  try {
    await db.delete(couponPartners).where(eq(couponPartners.id, id));
  } catch {
    return {
      success: false,
      error: "Não foi possível excluir. Verifique cupons vinculados.",
    };
  }

  revalidatePath("/admin/cupons");
  revalidatePath("/admin/cupons/parceiros");
  return { success: true };
}

export async function createCouponPartnerQuickAction(input: {
  name: string;
  handle?: string;
}): Promise<ActionResult<{ id: string; name: string }>> {
  const denied = await assertAdminAction();
  if (denied) {
    return denied as ActionResult<{ id: string; name: string }>;
  }

  if (input.name.trim().length < 2) {
    return { success: false, error: "Informe o nome do parceiro." };
  }

  try {
    const [created] = await db
      .insert(couponPartners)
      .values({
        name: input.name.trim(),
        handle: input.handle?.trim() || null,
      })
      .returning({ id: couponPartners.id, name: couponPartners.name });

    revalidatePath("/admin/cupons");
    revalidatePath("/admin/cupons/parceiros");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Não foi possível criar o parceiro." };
  }
}
