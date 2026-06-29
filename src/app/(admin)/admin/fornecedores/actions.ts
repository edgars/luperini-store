"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { products, supplierPurchases, suppliers } from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import { parseReaisToCents } from "@/lib/prices";
import type { ActionResult } from "@/types";

const supplierSchema = z.object({
  name: z.string().min(2, "Informe o nome do fornecedor"),
  contactName: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

function parseSupplierForm(formData: FormData) {
  return supplierSchema.safeParse({
    name: formData.get("name"),
    contactName: formData.get("contactName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    document: formData.get("document") || undefined,
    notes: formData.get("notes") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createSupplierAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseSupplierForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await db.insert(suppliers).values({
      name: parsed.data.name.trim(),
      contactName: parsed.data.contactName?.trim() || null,
      email: parsed.data.email?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      document: parsed.data.document?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
      isActive: parsed.data.isActive,
    });
  } catch {
    return { success: false, error: "Não foi possível criar o fornecedor." };
  }

  revalidatePath("/admin/fornecedores");
  revalidatePath("/admin/produtos");
  return { success: true };
}

export async function updateSupplierAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseSupplierForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await db
      .update(suppliers)
      .set({
        name: parsed.data.name.trim(),
        contactName: parsed.data.contactName?.trim() || null,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        document: parsed.data.document?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, id));
  } catch {
    return { success: false, error: "Não foi possível atualizar o fornecedor." };
  }

  revalidatePath("/admin/fornecedores");
  revalidatePath(`/admin/fornecedores/${id}`);
  revalidatePath("/admin/produtos");
  return { success: true };
}

const quickSupplierSchema = z.object({
  name: z.string().min(2, "Informe o nome do fornecedor"),
  phone: z.string().optional(),
  contactName: z.string().optional(),
});

export async function createSupplierQuickAction(input: {
  name: string;
  phone?: string;
  contactName?: string;
}): Promise<ActionResult<{ id: string; name: string }>> {
  const denied = await assertAdminAction();
  if (denied) {
    return denied as ActionResult<{ id: string; name: string }>;
  }

  const parsed = quickSupplierSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const [created] = await db
      .insert(suppliers)
      .values({
        name: parsed.data.name.trim(),
        phone: parsed.data.phone?.trim() || null,
        contactName: parsed.data.contactName?.trim() || null,
      })
      .returning({ id: suppliers.id, name: suppliers.name });

    revalidatePath("/admin/fornecedores");
    revalidatePath("/admin/produtos");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Não foi possível criar o fornecedor." };
  }
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const [linkedProduct] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.supplierId, id))
    .limit(1);

  if (linkedProduct) {
    return {
      success: false,
      error: "Existem produtos vinculados a este fornecedor.",
    };
  }

  try {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  } catch {
    return { success: false, error: "Não foi possível excluir o fornecedor." };
  }

  revalidatePath("/admin/fornecedores");
  return { success: true };
}

const purchaseSchema = z.object({
  productId: z.string().uuid("Selecione um produto"),
  quantity: z.coerce.number().int().min(1, "Informe a quantidade"),
  unitCost: z.string().min(1, "Informe o custo unitário"),
  purchasedAt: z.string().optional(),
  notes: z.string().optional(),
});

export async function createSupplierPurchaseAction(
  supplierId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = purchaseSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
    purchasedAt: formData.get("purchasedAt") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const unitCost = parseReaisToCents(parsed.data.unitCost);
  if (unitCost === null || unitCost <= 0) {
    return { success: false, error: "Custo unitário inválido." };
  }

  const totalCost = unitCost * parsed.data.quantity;

  try {
    await db.insert(supplierPurchases).values({
      supplierId,
      productId: parsed.data.productId,
      source: "supplier",
      quantity: parsed.data.quantity,
      unitCost,
      totalCost,
      purchasedAt: parsed.data.purchasedAt
        ? new Date(parsed.data.purchasedAt)
        : new Date(),
      notes: parsed.data.notes?.trim() || null,
    });
  } catch {
    return { success: false, error: "Não foi possível registrar a compra." };
  }

  revalidatePath(`/admin/fornecedores/${supplierId}`);
  revalidatePath("/admin/fornecedores");
  return { success: true };
}
