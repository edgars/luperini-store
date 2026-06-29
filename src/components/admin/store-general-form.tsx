"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { saveGeneralConfigAction } from "@/app/(admin)/admin/configuracoes/loja/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GeneralSettingsValue } from "@/lib/store/general-config";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

type StoreGeneralFormProps = {
  settings: GeneralSettingsValue;
};

export function StoreGeneralForm({ settings }: StoreGeneralFormProps) {
  const [state, formAction, pending] = useActionState(
    saveGeneralConfigAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) toast.success("Configurações da loja salvas.");
    else if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="storeName">
            Nome da loja <span className="text-destructive">*</span>
          </Label>
          <Input
            id="storeName"
            name="storeName"
            required
            defaultValue={settings.storeName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalName">Razão social</Label>
          <Input
            id="legalName"
            name="legalName"
            defaultValue={settings.legalName ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">CNPJ / CPF</Label>
          <Input
            id="document"
            name="document"
            defaultValue={settings.document ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">
            E-mail principal <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            defaultValue={settings.contactEmail}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportEmail">E-mail de suporte</Label>
          <Input
            id="supportEmail"
            name="supportEmail"
            type="email"
            defaultValue={settings.supportEmail ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Telefone</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            defaultValue={settings.contactPhone ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={settings.whatsapp ?? ""}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  );
}
