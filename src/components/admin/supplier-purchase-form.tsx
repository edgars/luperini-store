"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createSupplierPurchaseAction } from "@/app/(admin)/admin/fornecedores/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult, Product } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

type SupplierPurchaseFormProps = {
  supplierId: string;
  products: Product[];
};

export function SupplierPurchaseForm({
  supplierId,
  products,
}: SupplierPurchaseFormProps) {
  const action = createSupplierPurchaseAction.bind(null, supplierId);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Compra registrada.");
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productId">
          Produto <span className="text-destructive">*</span>
        </Label>
        <select
          id="productId"
          name="productId"
          required
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Selecione</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Quantidade <span className="text-destructive">*</span>
          </Label>
          <Input id="quantity" name="quantity" type="number" min={1} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitCost">
            Custo unitário <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unitCost"
            name="unitCost"
            inputMode="decimal"
            placeholder="0,00"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchasedAt">Data da compra</Label>
        <Input id="purchasedAt" name="purchasedAt" type="date" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Registrar compra"}
      </Button>
    </form>
  );
}
