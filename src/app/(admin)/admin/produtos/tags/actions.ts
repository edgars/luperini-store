"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { productTagAssignments, productTags } from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";

const tagSchema = z.object({
  name: z.string().min(2, "Informe o nome da tag"),
  slug: z.string().min(2).optional(),
});

export async function createProductTagAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = tagSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);

  try {
    await db.insert(productTags).values({
      name: parsed.data.name.trim(),
      slug,
    });
  } catch {
    return { success: false, error: "Não foi possível criar a tag." };
  }

  revalidatePath("/admin/produtos/tags");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { success: true };
}

export async function deleteProductTagAction(id: string): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  try {
    await db.delete(productTags).where(eq(productTags.id, id));
  } catch {
    return { success: false, error: "Não foi possível excluir a tag." };
  }

  revalidatePath("/admin/produtos/tags");
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { success: true };
}

export async function getProductTagIds(productId: string) {
  const rows = await db
    .select({ tagId: productTagAssignments.tagId })
    .from(productTagAssignments)
    .where(eq(productTagAssignments.productId, productId));

  return rows.map((row) => row.tagId);
}

export async function syncProductTags(productId: string, tagIds: string[]) {
  await db
    .delete(productTagAssignments)
    .where(eq(productTagAssignments.productId, productId));

  if (tagIds.length === 0) return;

  await db.insert(productTagAssignments).values(
    tagIds.map((tagId) => ({
      productId,
      tagId,
    })),
  );
}
