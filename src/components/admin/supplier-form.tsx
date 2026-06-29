"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";

import {
  createSupplierAction,
  deleteSupplierAction,
  updateSupplierAction,
} from "@/app/(admin)/admin/fornecedores/actions";
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
import type { ActionResult, Supplier } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

type SupplierFormProps = {
  supplier?: Supplier;
  onSuccess?: () => void;
  layout?: "vertical" | "horizontal";
};

export function SupplierForm({
  supplier,
  onSuccess,
  layout = "vertical",
}: SupplierFormProps) {
  const action = supplier
    ? updateSupplierAction.bind(null, supplier.id)
    : createSupplierAction;

  const [state, formAction, pending] = useActionState(action, initialState);
  const onSuccessRef = useRef(onSuccess);
  const handledSuccessRef = useRef(false);

  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (state.success) {
      if (!handledSuccessRef.current) {
        handledSuccessRef.current = true;
        toast.success(
          supplier ? "Fornecedor atualizado." : "Fornecedor criado.",
        );
        onSuccessRef.current?.();
      }
      return;
    }

    handledSuccessRef.current = false;

    if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, supplier]);

  const horizontal = layout === "horizontal" && !supplier;

  return (
    <form
      action={formAction}
      className={horizontal ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4" : "space-y-4"}
    >
      <div className={horizontal ? "space-y-2 xl:col-span-2" : "space-y-2"}>
        <Label htmlFor={`name-${supplier?.id ?? "new"}`}>
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`name-${supplier?.id ?? "new"}`}
          name="name"
          required
          defaultValue={supplier?.name}
        />
      </div>

      <div className={horizontal ? "space-y-2" : "space-y-2"}>
        <Label htmlFor={`contactName-${supplier?.id ?? "new"}`}>
          Contato
        </Label>
        <Input
          id={`contactName-${supplier?.id ?? "new"}`}
          name="contactName"
          defaultValue={supplier?.contactName ?? ""}
        />
      </div>

      <div className={horizontal ? "space-y-2" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-2">
          <Label htmlFor={`email-${supplier?.id ?? "new"}`}>E-mail</Label>
          <Input
            id={`email-${supplier?.id ?? "new"}`}
            name="email"
            type="email"
            defaultValue={supplier?.email ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`phone-${supplier?.id ?? "new"}`}>Telefone</Label>
          <Input
            id={`phone-${supplier?.id ?? "new"}`}
            name="phone"
            defaultValue={supplier?.phone ?? ""}
          />
        </div>
      </div>

      <div className={horizontal ? "space-y-2" : "space-y-2"}>
        <Label htmlFor={`document-${supplier?.id ?? "new"}`}>
          CNPJ / CPF
        </Label>
        <Input
          id={`document-${supplier?.id ?? "new"}`}
          name="document"
          defaultValue={supplier?.document ?? ""}
        />
      </div>

      <div
        className={
          horizontal
            ? "space-y-2 md:col-span-2 xl:col-span-4"
            : "space-y-2"
        }
      >
        <Label htmlFor={`notes-${supplier?.id ?? "new"}`}>Observações</Label>
        <Textarea
          id={`notes-${supplier?.id ?? "new"}`}
          name="notes"
          rows={horizontal ? 2 : 3}
          defaultValue={supplier?.notes ?? ""}
        />
      </div>

      <div
        className={
          horizontal
            ? "flex flex-col justify-between gap-4 rounded-lg border p-4 md:col-span-2 xl:col-span-3 xl:flex-row xl:items-center"
            : "flex items-start gap-3 rounded-lg border p-4"
        }
      >
        <div className="flex items-start gap-3">
          <input
            id={`isActive-${supplier?.id ?? "new"}`}
            name="isActive"
            type="checkbox"
            defaultChecked={supplier?.isActive ?? true}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <div className="space-y-1">
            <Label htmlFor={`isActive-${supplier?.id ?? "new"}`}>Ativo</Label>
            <p className="text-sm text-muted-foreground">
              Fornecedores inativos não aparecem na seleção de produtos.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className={horizontal ? "shrink-0 xl:self-end" : undefined}
        >
          {pending ? "Salvando..." : supplier ? "Salvar" : "Criar fornecedor"}
        </Button>
      </div>
    </form>
  );
}

export function DeleteSupplierButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Produtos vinculados impedem a
            exclusão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteSupplierAction(id);
                if (result.success) {
                  toast.success("Fornecedor excluído.");
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
