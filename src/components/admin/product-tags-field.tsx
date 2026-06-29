"use client";

import Link from "next/link";
import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";

import {
  createProductTagAction,
  deleteProductTagAction,
} from "@/app/(admin)/admin/produtos/tags/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult, ProductTag } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

export function ProductTagForm() {
  const [state, formAction, pending] = useActionState(
    createProductTagAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Tag criada.");
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tag-name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input id="tag-name" name="name" required placeholder="Ex: Casual" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tag-slug">Slug</Label>
        <Input id="tag-slug" name="slug" placeholder="gerado-automaticamente" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar tag"}
      </Button>
    </form>
  );
}

export function DeleteProductTagButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir tag?</AlertDialogTitle>
          <AlertDialogDescription>
            Produtos vinculados perderão esta tag.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteProductTagAction(id);
                if (result.success) toast.success("Tag excluída.");
                else toast.error(result.error);
              })
            }
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type ProductTagsFieldProps = {
  tags: ProductTag[];
  defaultTagIds?: string[];
};

export function ProductTagsField({ tags, defaultTagIds = [] }: ProductTagsFieldProps) {
  if (tags.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground md:col-span-2">
        Nenhuma tag cadastrada.{" "}
        <Link href="/admin/produtos/tags" className="underline">
          Criar tags
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <Label>Tags</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <label
            key={tag.id}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              type="checkbox"
              name="tagIds"
              value={tag.id}
              defaultChecked={defaultTagIds.includes(tag.id)}
              className="h-3.5 w-3.5 rounded border-input"
            />
            {tag.name}
          </label>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Tags ajudam na busca e filtros da loja.
      </p>
    </div>
  );
}
