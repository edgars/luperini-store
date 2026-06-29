"use client";

import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";

import {
  createPurchaseContactAction,
  deletePurchaseContactAction,
  updatePurchaseContactAction,
} from "@/app/(admin)/admin/contatos/actions";
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
import { SupplierSelectField } from "@/components/admin/supplier-select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult, PurchaseContact, Supplier } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

type PurchaseContactFormProps = {
  contact?: PurchaseContact;
  suppliers: Supplier[];
  defaultSupplierId?: string | null;
  onSuccess?: () => void;
};

export function PurchaseContactForm({
  contact,
  suppliers,
  defaultSupplierId,
  onSuccess,
}: PurchaseContactFormProps) {
  const action = contact
    ? updatePurchaseContactAction.bind(null, contact.id)
    : createPurchaseContactAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(contact ? "Contato atualizado." : "Contato criado.");
      onSuccess?.();
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, contact, onSuccess]);

  const formId = contact?.id ?? "new";

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`name-${formId}`}>
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`name-${formId}`}
          name="name"
          required
          defaultValue={contact?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`role-${formId}`}>Cargo / função</Label>
        <Input
          id={`role-${formId}`}
          name="role"
          placeholder="Ex: Representante comercial"
          defaultValue={contact?.role ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`email-${formId}`}>E-mail</Label>
          <Input
            id={`email-${formId}`}
            name="email"
            type="email"
            defaultValue={contact?.email ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`phone-${formId}`}>Telefone</Label>
          <Input
            id={`phone-${formId}`}
            name="phone"
            defaultValue={contact?.phone ?? ""}
          />
        </div>
      </div>

      <SupplierSelectField
        name="supplierId"
        label="Fornecedor (opcional)"
        suppliers={suppliers}
        defaultValue={contact?.supplierId ?? defaultSupplierId ?? ""}
        optional
        allowCreate={false}
      />

      <div className="space-y-2">
        <Label htmlFor={`notes-${formId}`}>Observações</Label>
        <Textarea
          id={`notes-${formId}`}
          name="notes"
          rows={3}
          defaultValue={contact?.notes ?? ""}
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border p-4">
        <input
          id={`isActive-${formId}`}
          name="isActive"
          type="checkbox"
          defaultChecked={contact?.isActive ?? true}
          className="mt-1 h-4 w-4 rounded border-input"
        />
        <div className="space-y-1">
          <Label htmlFor={`isActive-${formId}`}>Ativo</Label>
          <p className="text-sm text-muted-foreground">
            Contatos inativos permanecem no histórico, mas ficam destacados como
            inativos na listagem.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : contact ? "Salvar" : "Criar contato"}
      </Button>
    </form>
  );
}

export function DeletePurchaseContactButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deletePurchaseContactAction(id);
                if (result.success) {
                  toast.success("Contato excluído.");
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
