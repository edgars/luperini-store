"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatZipCode } from "@/lib/store/shipping-config";

export type AddressFormValues = {
  label: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type CepAddressFieldsProps = {
  prefix: string;
  values: AddressFormValues;
  onChange: (values: AddressFormValues) => void;
  labelTitle?: string;
};

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

export function CepAddressFields({
  prefix,
  values,
  onChange,
  labelTitle = "Endereço",
}: CepAddressFieldsProps) {
  const [pending, startTransition] = useTransition();

  function updateField<K extends keyof AddressFormValues>(
    field: K,
    value: AddressFormValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  function lookupCep() {
    const digits = values.zipCode.replace(/\D/g, "");
    if (digits.length !== 8) {
      toast.error("Informe um CEP válido.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/cep/${digits}`);
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error ?? "CEP não encontrado.");
          return;
        }

        onChange({
          ...values,
          zipCode: data.zipCode,
          street: data.street || values.street,
          complement: data.complement || values.complement,
          neighborhood: data.neighborhood || values.neighborhood,
          city: data.city || values.city,
          state: data.state || values.state,
        });
        toast.success("Endereço preenchido pelo CEP.");
      } catch {
        toast.error("Não foi possível consultar o CEP.");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="text-sm font-medium">{labelTitle}</p>

      <div className="space-y-2">
        <Label htmlFor={`${prefix}-label`}>Rótulo</Label>
        <Input
          id={`${prefix}-label`}
          name={`${prefix}Label`}
          value={values.label}
          onChange={(event) => updateField("label", event.target.value)}
          placeholder="Ex: Luperini — Centro de envio"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}-zipCode`}>
            CEP <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${prefix}-zipCode`}
            name={`${prefix}ZipCode`}
            value={values.zipCode}
            onChange={(event) =>
              updateField("zipCode", formatZipCode(event.target.value))
            }
            placeholder="00000-000"
            required
          />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="outline" disabled={pending} onClick={lookupCep}>
            {pending ? "Buscando..." : "Buscar CEP"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${prefix}-street`}>Rua</Label>
          <Input
            id={`${prefix}-street`}
            name={`${prefix}Street`}
            value={values.street}
            onChange={(event) => updateField("street", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-number`}>Número</Label>
          <Input
            id={`${prefix}-number`}
            name={`${prefix}Number`}
            value={values.number}
            onChange={(event) => updateField("number", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-complement`}>Complemento</Label>
          <Input
            id={`${prefix}-complement`}
            name={`${prefix}Complement`}
            value={values.complement}
            onChange={(event) => updateField("complement", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-neighborhood`}>Bairro</Label>
          <Input
            id={`${prefix}-neighborhood`}
            name={`${prefix}Neighborhood`}
            value={values.neighborhood}
            onChange={(event) => updateField("neighborhood", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-city`}>Cidade</Label>
          <Input
            id={`${prefix}-city`}
            name={`${prefix}City`}
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${prefix}-state`}>Estado</Label>
          <select
            id={`${prefix}-state`}
            name={`${prefix}State`}
            value={values.state}
            onChange={(event) => updateField("state", event.target.value)}
            className={selectClassName}
            required
          >
            <option value="">UF</option>
            {BRAZILIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
