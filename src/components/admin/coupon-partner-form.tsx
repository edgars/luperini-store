"use client";

import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";

import {
  createCouponPartnerAction,
  deleteCouponPartnerAction,
  updateCouponPartnerAction,
} from "@/app/(admin)/admin/cupons/parceiros/actions";
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
import type { ActionResult, CouponPartner } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

export function CouponPartnerForm({ partner }: { partner?: CouponPartner }) {
  const action = partner
    ? updateCouponPartnerAction.bind(null, partner.id)
    : createCouponPartnerAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(partner ? "Parceiro atualizado." : "Parceiro criado.");
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, partner]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`partner-name-${partner?.id ?? "new"}`}>
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`partner-name-${partner?.id ?? "new"}`}
          name="name"
          required
          defaultValue={partner?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`partner-handle-${partner?.id ?? "new"}`}>
          Instagram / @
        </Label>
        <Input
          id={`partner-handle-${partner?.id ?? "new"}`}
          name="handle"
          defaultValue={partner?.handle ?? ""}
          placeholder="usuario"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`partner-email-${partner?.id ?? "new"}`}>E-mail</Label>
        <Input
          id={`partner-email-${partner?.id ?? "new"}`}
          name="email"
          type="email"
          defaultValue={partner?.email ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`partner-notes-${partner?.id ?? "new"}`}>Observações</Label>
        <Textarea
          id={`partner-notes-${partner?.id ?? "new"}`}
          name="notes"
          rows={3}
          defaultValue={partner?.notes ?? ""}
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border p-4">
        <input
          id={`partner-active-${partner?.id ?? "new"}`}
          name="isActive"
          type="checkbox"
          defaultChecked={partner?.isActive ?? true}
          className="mt-1 h-4 w-4 rounded border-input"
        />
        <div className="space-y-1">
          <Label htmlFor={`partner-active-${partner?.id ?? "new"}`}>Ativo</Label>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : partner ? "Salvar" : "Criar parceiro"}
      </Button>
    </form>
  );
}

export function DeleteCouponPartnerButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir parceiro?</AlertDialogTitle>
          <AlertDialogDescription>
            Cupons vinculados ficarão sem parceiro associado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteCouponPartnerAction(id);
                if (result.success) toast.success("Parceiro excluído.");
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
