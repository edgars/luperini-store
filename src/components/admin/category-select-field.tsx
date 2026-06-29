"use client";

import { useMemo, useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createCategoryQuickAction } from "@/app/(admin)/admin/categorias/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

type CategorySelectFieldProps = {
  name: string;
  label: string;
  categories: Category[];
  defaultValue?: string | null;
  excludeId?: string;
  emptyLabel?: string;
  allowCreate?: boolean;
};

export function CategorySelectField({
  name,
  label,
  categories: initialCategories,
  defaultValue = "",
  excludeId,
  emptyLabel = "Sem categoria",
  allowCreate = true,
}: CategorySelectFieldProps) {
  const [items, setItems] = useState(initialCategories);
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [pending, startTransition] = useTransition();

  const options = useMemo(
    () => items.filter((category) => category.id !== excludeId),
    [items, excludeId],
  );

  function handleCreate() {
    if (newName.trim().length < 2) {
      toast.error("Informe o nome da categoria.");
      return;
    }

    startTransition(async () => {
      const result = await createCategoryQuickAction({
        name: newName.trim(),
        slug: newSlug.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const created: Category = {
        id: result.data.id,
        name: result.data.name,
        slug: result.data.slug,
        description: null,
        imageUrl: null,
        parentId: null,
      };

      setItems((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
      setSelectedId(created.id);
      setNewName("");
      setNewSlug("");
      setDialogOpen(false);
      toast.success(`Categoria "${created.name}" criada.`);
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex gap-2">
        <select
          id={name}
          name={name}
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className={cn(selectClassName, allowCreate && "min-w-0 flex-1")}
        >
          <option value="">{emptyLabel}</option>
          {options.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {allowCreate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            <PlusIcon />
            Nova
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>
              Cadastre uma categoria sem sair desta tela. Ela já ficará
              selecionada no formulário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${name}-quick-name`}>
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${name}-quick-name`}
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ex: Camisetas"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${name}-quick-slug`}>Slug</Label>
              <Input
                id={`${name}-quick-slug`}
                value={newSlug}
                onChange={(event) => setNewSlug(event.target.value)}
                placeholder="gerado-automaticamente"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreate} disabled={pending}>
              {pending ? "Criando..." : "Criar categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
