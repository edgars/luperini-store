"use client";

import { useMemo, useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createSupplierQuickAction } from "@/app/(admin)/admin/fornecedores/actions";
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
import type { Supplier } from "@/types";

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

type SupplierSelectFieldProps = {
  name?: string;
  label?: string;
  suppliers: Supplier[];
  defaultValue?: string | null;
  disabled?: boolean;
  allowCreate?: boolean;
  optional?: boolean;
  emptyLabel?: string;
};

export function SupplierSelectField({
  name = "supplierId",
  label = "Fornecedor",
  suppliers: initialSuppliers,
  defaultValue = "",
  disabled = false,
  allowCreate = true,
  optional = false,
  emptyLabel = "Selecione um fornecedor",
}: SupplierSelectFieldProps) {
  const [items, setItems] = useState(
    initialSuppliers.filter((supplier) => supplier.isActive),
  );
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [pending, startTransition] = useTransition();

  const options = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [items],
  );

  function handleCreate() {
    if (newName.trim().length < 2) {
      toast.error("Informe o nome do fornecedor.");
      return;
    }

    startTransition(async () => {
      const result = await createSupplierQuickAction({
        name: newName.trim(),
        phone: newPhone.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const created: Supplier = {
        id: result.data.id,
        name: result.data.name,
        contactName: null,
        email: null,
        phone: newPhone.trim() || null,
        document: null,
        notes: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setItems((current) => [...current, created]);
      setSelectedId(created.id);
      setNewName("");
      setNewPhone("");
      setDialogOpen(false);
      toast.success(`Fornecedor "${created.name}" criado.`);
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
          disabled={disabled}
          required={!disabled && !optional}
          onChange={(event) => setSelectedId(event.target.value)}
          className={cn(selectClassName, allowCreate && "min-w-0 flex-1")}
        >
          <option value="">{emptyLabel}</option>
          {options.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>

        {allowCreate && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            <PlusIcon />
            Novo
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo fornecedor</DialogTitle>
            <DialogDescription>
              Cadastre um fornecedor sem sair desta tela.
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
                placeholder="Ex: Atacado Moda SP"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${name}-quick-phone`}>Telefone</Label>
              <Input
                id={`${name}-quick-phone`}
                value={newPhone}
                onChange={(event) => setNewPhone(event.target.value)}
                placeholder="(11) 99999-9999"
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
              {pending ? "Criando..." : "Criar fornecedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
