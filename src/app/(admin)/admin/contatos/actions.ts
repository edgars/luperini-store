"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { purchaseContacts } from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import type { ActionResult } from "@/types";

const contactSchema = z.object({
  name: z.string().min(2, "Informe o nome do contato"),
  role: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  isActive: z.boolean(),
});

function parseContactForm(formData: FormData) {
  return contactSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

function revalidateContactPaths(supplierId?: string | null) {
  revalidatePath("/admin/contatos");
  revalidatePath("/admin/fornecedores");
  if (supplierId) {
    revalidatePath(`/admin/fornecedores/${supplierId}`);
  }
}

export async function createPurchaseContactAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supplierId = parsed.data.supplierId?.trim() || null;

  try {
    await db.insert(purchaseContacts).values({
      name: parsed.data.name.trim(),
      role: parsed.data.role?.trim() || null,
      email: parsed.data.email?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
      supplierId,
      isActive: parsed.data.isActive,
    });
  } catch {
    return { success: false, error: "Não foi possível criar o contato." };
  }

  revalidateContactPaths(supplierId);
  return { success: true };
}

export async function updatePurchaseContactAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supplierId = parsed.data.supplierId?.trim() || null;

  try {
    await db
      .update(purchaseContacts)
      .set({
        name: parsed.data.name.trim(),
        role: parsed.data.role?.trim() || null,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        supplierId,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(purchaseContacts.id, id));
  } catch {
    return { success: false, error: "Não foi possível atualizar o contato." };
  }

  revalidateContactPaths(supplierId);
  revalidatePath(`/admin/contatos/${id}`);
  return { success: true };
}

export async function deletePurchaseContactAction(
  id: string,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const [contact] = await db
    .select({ supplierId: purchaseContacts.supplierId })
    .from(purchaseContacts)
    .where(eq(purchaseContacts.id, id))
    .limit(1);

  try {
    await db.delete(purchaseContacts).where(eq(purchaseContacts.id, id));
  } catch {
    return { success: false, error: "Não foi possível excluir o contato." };
  }

  revalidateContactPaths(contact?.supplierId);
  revalidatePath(`/admin/contatos/${id}`);
  return { success: true };
}
