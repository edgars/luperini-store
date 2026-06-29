"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createCouponAction,
  updateCouponAction,
} from "@/app/(admin)/admin/cupons/actions";
import { CouponPartnerSelectField } from "@/components/admin/coupon-partner-select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCouponCode } from "@/lib/store/coupon-utils";
import type { ActionResult, Coupon, CouponPartner } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

function toDateTimeLocal(value?: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function centsToReaisInput(cents: number | null | undefined) {
  if (cents === null || cents === undefined || cents <= 0) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

type CouponFormProps = {
  partners: CouponPartner[];
  initialData?: Coupon;
};

export function CouponForm({ partners, initialData }: CouponFormProps) {
  const action = initialData
    ? updateCouponAction.bind(null, initialData.id)
    : createCouponAction;

  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<"percentage" | "fixed">(
    initialData?.type ?? "percentage",
  );
  const [code, setCode] = useState(initialData?.code ?? "");

  useEffect(() => {
    if (state.success) {
      toast.success(initialData ? "Cupom atualizado." : "Cupom criado.");
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, initialData]);

  const valueDefault =
    initialData?.type === "percentage"
      ? String(initialData.value)
      : centsToReaisInput(initialData?.value);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="code">
            Código <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            name="code"
            required
            value={code}
            onChange={(event) => setCode(formatCouponCode(event.target.value))}
            placeholder="BF30"
            className="uppercase"
          />
          <p className="text-xs text-muted-foreground">
            Exibido em maiúsculas. Aceita minúsculas na loja (bf30 = BF30).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">
            Tipo <span className="text-destructive">*</span>
          </Label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as "percentage" | "fixed")
            }
            className={selectClassName}
          >
            <option value="percentage">Percentual (%)</option>
            <option value="fixed">Valor fixo (R$)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">
            Desconto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="value"
            name="value"
            required
            defaultValue={valueDefault}
            placeholder={type === "percentage" ? "30" : "50,00"}
          />
        </div>

        <CouponPartnerSelectField
          partners={partners}
          defaultValue={initialData?.partnerId}
        />

        <div className="space-y-2">
          <Label htmlFor="minOrderValue">Pedido mínimo (R$)</Label>
          <Input
            id="minOrderValue"
            name="minOrderValue"
            inputMode="decimal"
            defaultValue={centsToReaisInput(initialData?.minOrderValue)}
            placeholder="Opcional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxUses">Limite de usos</Label>
          <Input
            id="maxUses"
            name="maxUses"
            type="number"
            min={1}
            defaultValue={initialData?.maxUses ?? ""}
            placeholder="Ilimitado"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validFrom">Válido a partir de</Label>
          <Input
            id="validFrom"
            name="validFrom"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initialData?.validFrom)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">Válido até</Label>
          <Input
            id="validUntil"
            name="validUntil"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initialData?.validUntil)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição interna</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description ?? ""}
            placeholder="Ex: Black Friday — parceria @maria"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={initialData?.isActive ?? true}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <div className="space-y-1">
              <Label htmlFor="isActive">Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Cupons inativos não podem ser aplicados no checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : initialData ? "Salvar cupom" : "Criar cupom"}
      </Button>
    </form>
  );
}
