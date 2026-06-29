"use client";

import { useState } from "react";

import { SupplierSelectField } from "@/components/admin/supplier-select-field";
import { Label } from "@/components/ui/label";
import type { Supplier } from "@/types";

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

type PurchaseSourceFieldProps = {
  suppliers: Supplier[];
  defaultSource?: "supplier" | "in_house";
  defaultSupplierId?: string | null;
};

export function PurchaseSourceField({
  suppliers,
  defaultSource = "in_house",
  defaultSupplierId,
}: PurchaseSourceFieldProps) {
  const [source, setSource] = useState<"supplier" | "in_house">(defaultSource);

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="space-y-2">
        <Label htmlFor="purchaseSource">
          Origem da compra <span className="text-destructive">*</span>
        </Label>
        <select
          id="purchaseSource"
          name="purchaseSource"
          value={source}
          onChange={(event) =>
            setSource(event.target.value as "supplier" | "in_house")
          }
          className={selectClassName}
        >
          <option value="in_house">Fabricação própria</option>
          <option value="supplier">Fornecedor</option>
        </select>
      </div>

      {source === "supplier" ? (
        <SupplierSelectField
          suppliers={suppliers}
          defaultValue={defaultSupplierId}
        />
      ) : (
        <input type="hidden" name="supplierId" value="" />
      )}

      <p className="text-sm text-muted-foreground">
        {source === "supplier"
          ? "Vincule o produto ao fornecedor para acompanhar compras e desempenho."
          : "Produto produzido internamente, sem fornecedor externo."}
      </p>
    </div>
  );
}
