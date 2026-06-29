"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { saveIntegrationsConfigAction } from "@/app/(admin)/admin/configuracoes/integracoes/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { IntegrationEnvStatus } from "@/lib/store/integrations-config";
import type { IntegrationsSettingsValue } from "@/lib/store/integrations-config";
import type { ActionResult } from "@/types";
import { cn } from "@/lib/utils";

const initialState: ActionResult = { success: false, error: "" };

type StoreIntegrationsFormProps = {
  settings: IntegrationsSettingsValue;
  envStatuses: IntegrationEnvStatus[];
};

function ToggleRow({
  id,
  name,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-input"
      />
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function StoreIntegrationsForm({
  settings,
  envStatuses,
}: StoreIntegrationsFormProps) {
  const [state, formAction, pending] = useActionState(
    saveIntegrationsConfigAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) toast.success("Integrações atualizadas.");
    else if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="font-medium">Serviços</h3>
          <p className="text-sm text-muted-foreground">
            Ative o que deseja usar. Chaves secretas ficam nas variáveis de
            ambiente (Vercel / .env.local), nunca nesta tela.
          </p>
        </div>

        <ToggleRow
          id="viaCepEnabled"
          name="viaCepEnabled"
          label="ViaCEP"
          description="Preenchimento automático de endereço por CEP no checkout e admin."
          defaultChecked={settings.viaCep.enabled}
        />

        <ToggleRow
          id="melhorEnvioEnabled"
          name="melhorEnvioEnabled"
          label="Melhor Envio"
          description="Cotação e emissão de etiquetas via API."
          defaultChecked={settings.melhorEnvio.enabled}
        />

        <ToggleRow
          id="melhorEnvioSandbox"
          name="melhorEnvioSandbox"
          label="Melhor Envio — ambiente sandbox"
          description="Use tokens de homologação enquanto testa a integração."
          defaultChecked={settings.melhorEnvio.useSandbox}
        />

        <ToggleRow
          id="mercadoPagoEnabled"
          name="mercadoPagoEnabled"
          label="Mercado Pago"
          description="Pagamentos com Pix, cartão e boleto."
          defaultChecked={settings.mercadoPago.enabled}
        />

        <ToggleRow
          id="stripeEnabled"
          name="stripeEnabled"
          label="Stripe"
          description="Pagamentos internacionais (opcional)."
          defaultChecked={settings.stripe.enabled}
        />

        <ToggleRow
          id="resendEnabled"
          name="resendEnabled"
          label="Resend"
          description="E-mails transacionais (pedido confirmado, envio, etc.)."
          defaultChecked={settings.resend.enabled}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Variáveis de ambiente</h3>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Integração</th>
                <th className="px-4 py-2 text-left font-medium">Variáveis</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {envStatuses.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {item.envKeys.length > 0
                      ? item.envKeys.join(", ")
                      : "Nenhuma (público)"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        item.configured
                          ? "bg-emerald-100 text-emerald-800"
                          : item.requiredWhenEnabled
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800",
                      )}
                    >
                      {item.configured
                        ? "Configurado"
                        : item.requiredWhenEnabled
                          ? "Obrigatório — faltando"
                          : "Opcional — faltando"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar integrações"}
      </Button>
    </form>
  );
}
