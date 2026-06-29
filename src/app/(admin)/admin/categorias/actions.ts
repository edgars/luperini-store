"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";

const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria"),
  slug: z.string().min(2, "Informe o slug").optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().or(z.literal("")),
});

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    parentId: formData.get("parentId") || undefined,
  });
}

export async function createCategoryAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);

  try {
    await db.insert(categories).values({
      name: parsed.data.name.trim(),
      slug,
      description: parsed.data.description?.trim() || null,
      parentId: parsed.data.parentId || null,
    });
  } catch {
    return { success: false, error: "Não foi possível criar a categoria." };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  return { success: true };
}

const quickCategorySchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria"),
  slug: z.string().min(2).optional(),
  parentId: z.string().uuid().optional().or(z.literal("")).or(z.null()),
});

export async function createCategoryQuickAction(input: {
  name: string;
  slug?: string;
  parentId?: string | null;
}): Promise<
  ActionResult<{ id: string; name: string; slug: string }>
> {
  const denied = await assertAdminAction();
  if (denied) {
    return denied as ActionResult<{ id: string; name: string; slug: string }>;
  }

  const parsed = quickCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);

  try {
    const [category] = await db
      .insert(categories)
      .values({
        name: parsed.data.name.trim(),
        slug,
        parentId: parsed.data.parentId || null,
      })
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      });

    revalidatePath("/admin/categorias");
    revalidatePath("/admin/produtos");

    return { success: true, data: category };
  } catch {
    return { success: false, error: "Não foi possível criar a categoria." };
  }
}

export async function updateCategoryAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);

  try {
    await db
      .update(categories)
      .set({
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        parentId: parsed.data.parentId || null,
      })
      .where(eq(categories.id, id));
  } catch {
    return { success: false, error: "Não foi possível atualizar a categoria." };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch {
    return {
      success: false,
      error: "Não foi possível excluir. Verifique se há produtos vinculados.",
    };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  return { success: true };
}
