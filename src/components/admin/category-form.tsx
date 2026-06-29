"use client";

import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/(admin)/admin/categorias/actions";
import { CategorySelectField } from "@/components/admin/category-select-field";
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
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult, Category } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

type CategoryFormProps = {
  categories: Category[];
  category?: Category;
  onSuccess?: () => void;
};

export function CategoryForm({
  categories,
  category,
  onSuccess,
}: CategoryFormProps) {
  const action = category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(
        category ? "Categoria atualizada." : "Categoria criada.",
      );
      onSuccess?.();
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, category, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`name-${category?.id ?? "new"}`}>
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`name-${category?.id ?? "new"}`}
          name="name"
          required
          defaultValue={category?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`slug-${category?.id ?? "new"}`}>Slug</Label>
        <Input
          id={`slug-${category?.id ?? "new"}`}
          name="slug"
          defaultValue={category?.slug}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`description-${category?.id ?? "new"}`}>
          Descrição
        </Label>
        <Textarea
          id={`description-${category?.id ?? "new"}`}
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
        />
      </div>

      <CategorySelectField
        name="parentId"
        label="Categoria pai"
        categories={categories}
        defaultValue={category?.parentId}
        excludeId={category?.id}
        emptyLabel="Nenhuma"
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : category ? "Salvar" : "Criar categoria"}
      </Button>
    </form>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Produtos vinculados podem impedir a
            exclusão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteCategoryAction(id);
                if (result.success) {
                  toast.success("Categoria excluída.");
                } else {
                  toast.error(result.error);
                }
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
