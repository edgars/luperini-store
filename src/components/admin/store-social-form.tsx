"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { saveSocialConfigAction } from "@/app/(admin)/admin/configuracoes/redes-sociais/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SocialSettingsValue } from "@/lib/store/social-config";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

type StoreSocialFormProps = {
  settings: SocialSettingsValue;
};

export function StoreSocialForm({ settings }: StoreSocialFormProps) {
  const [state, formAction, pending] = useActionState(
    saveSocialConfigAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) toast.success("Redes sociais salvas.");
    else if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            name="instagram"
            required
            defaultValue={settings.instagram}
            placeholder="https://www.instagram.com/store.luperini/"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktok">TikTok</Label>
          <Input
            id="tiktok"
            name="tiktok"
            required
            defaultValue={settings.tiktok}
            placeholder="# ou URL do perfil"
          />
          <p className="text-xs text-muted-foreground">
            Use <code>#</code> enquanto o link não estiver definido.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shopee">Shopee</Label>
          <Input
            id="shopee"
            name="shopee"
            required
            defaultValue={settings.shopee}
            placeholder="# ou URL da loja"
          />
          <p className="text-xs text-muted-foreground">
            Use <code>#</code> enquanto o link não estiver definido.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar redes sociais"}
      </Button>
    </form>
  );
}
