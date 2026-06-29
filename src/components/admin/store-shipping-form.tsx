"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { saveShippingConfigAction } from "@/app/(admin)/admin/configuracoes/envio/actions";
import {
  CepAddressFields,
  type AddressFormValues,
} from "@/components/admin/cep-address-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SHIPPING_MODE_LABELS,
  type ShippingSettingsValue,
} from "@/lib/store/shipping-config";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

function centsToReaisInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

type StoreShippingFormProps = {
  settings: ShippingSettingsValue;
};

export function StoreShippingForm({ settings }: StoreShippingFormProps) {
  const [state, formAction, pending] = useActionState(
    saveShippingConfigAction,
    initialState,
  );

  const [origin, setOrigin] = useState<AddressFormValues>({
    label: settings.origin.label,
    zipCode: settings.origin.zipCode,
    street: settings.origin.street,
    number: settings.origin.number,
    complement: settings.origin.complement ?? "",
    neighborhood: settings.origin.neighborhood,
    city: settings.origin.city,
    state: settings.origin.state,
  });

  useEffect(() => {
    if (state.success) toast.success("Configurações de envio salvas.");
    else if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="originLabel" value={origin.label} />
      <input type="hidden" name="originZipCode" value={origin.zipCode} />
      <input type="hidden" name="originStreet" value={origin.street} />
      <input type="hidden" name="originNumber" value={origin.number} />
      <input type="hidden" name="originComplement" value={origin.complement} />
      <input type="hidden" name="originNeighborhood" value={origin.neighborhood} />
      <input type="hidden" name="originCity" value={origin.city} />
      <input type="hidden" name="originState" value={origin.state} />

      <CepAddressFields
        prefix="origin"
        values={origin}
        onChange={setOrigin}
        labelTitle="Endereço de origem (envio)"
      />

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-medium">Regras de frete</h3>
          <p className="text-sm text-muted-foreground">
            Usado no checkout. Melhor Envio exige token configurado nas
            integrações.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingMode">Modo de cálculo</Label>
          <select
            id="shippingMode"
            name="shippingMode"
            defaultValue={settings.rules.mode}
            className={selectClassName}
          >
            {Object.entries(SHIPPING_MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fixedCost">Frete fixo (R$)</Label>
            <Input
              id="fixedCost"
              name="fixedCost"
              inputMode="decimal"
              defaultValue={centsToReaisInput(settings.rules.fixedCostCents)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="freeShippingMinimum">
              Frete grátis acima de (R$)
            </Label>
            <Input
              id="freeShippingMinimum"
              name="freeShippingMinimum"
              inputMode="decimal"
              defaultValue={centsToReaisInput(
                settings.rules.freeShippingMinimumCents,
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDeliveryDaysMin">Prazo mínimo (dias)</Label>
            <Input
              id="estimatedDeliveryDaysMin"
              name="estimatedDeliveryDaysMin"
              type="number"
              min={0}
              defaultValue={settings.rules.estimatedDeliveryDaysMin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDeliveryDaysMax">Prazo máximo (dias)</Label>
            <Input
              id="estimatedDeliveryDaysMax"
              name="estimatedDeliveryDaysMax"
              type="number"
              min={0}
              defaultValue={settings.rules.estimatedDeliveryDaysMax}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-medium">Embalagem padrão</h3>
          <p className="text-sm text-muted-foreground">
            Usado na cotação Melhor Envio quando o produto não informar medidas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="packageWeightGrams">Peso (g)</Label>
            <Input
              id="packageWeightGrams"
              name="packageWeightGrams"
              type="number"
              min={1}
              defaultValue={settings.defaultPackage.weightGrams}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageHeightCm">Altura (cm)</Label>
            <Input
              id="packageHeightCm"
              name="packageHeightCm"
              type="number"
              min={1}
              defaultValue={settings.defaultPackage.heightCm}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageWidthCm">Largura (cm)</Label>
            <Input
              id="packageWidthCm"
              name="packageWidthCm"
              type="number"
              min={1}
              defaultValue={settings.defaultPackage.widthCm}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageLengthCm">Comprimento (cm)</Label>
            <Input
              id="packageLengthCm"
              name="packageLengthCm"
              type="number"
              min={1}
              defaultValue={settings.defaultPackage.lengthCm}
            />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  );
}
