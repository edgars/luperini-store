"use client";

import { useMemo, useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createCouponPartnerQuickAction } from "@/app/(admin)/admin/cupons/parceiros/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CouponPartner } from "@/types";

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

type CouponPartnerSelectFieldProps = {
  partners: CouponPartner[];
  defaultValue?: string | null;
  allowCreate?: boolean;
};

export function CouponPartnerSelectField({
  partners: initialPartners,
  defaultValue = "",
  allowCreate = true,
}: CouponPartnerSelectFieldProps) {
  const [items, setItems] = useState(
    initialPartners.filter((partner) => partner.isActive),
  );
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [pending, startTransition] = useTransition();

  const options = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [items],
  );

  function handleCreate() {
    if (newName.trim().length < 2) {
      toast.error("Informe o nome do parceiro.");
      return;
    }

    startTransition(async () => {
      const result = await createCouponPartnerQuickAction({
        name: newName.trim(),
        handle: newHandle.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const created: CouponPartner = {
        id: result.data.id,
        name: result.data.name,
        handle: newHandle.trim() || null,
        email: null,
        notes: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setItems((current) => [...current, created]);
      setSelectedId(created.id);
      setNewName("");
      setNewHandle("");
      setDialogOpen(false);
      toast.success(`Parceiro "${created.name}" criado.`);
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="partnerId">Parceiro / influenciador</Label>
      <div className="flex gap-2">
        <select
          id="partnerId"
          name="partnerId"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className={cn(selectClassName, allowCreate && "min-w-0 flex-1")}
        >
          <option value="">Sem parceiro vinculado</option>
          {options.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
              {partner.handle ? ` (@${partner.handle.replace(/^@/, "")})` : ""}
            </option>
          ))}
        </select>

        {allowCreate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            <PlusIcon />
            Novo
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo parceiro</DialogTitle>
            <DialogDescription>
              Cadastre um influenciador ou parceiro sem sair desta tela.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-partner-name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quick-partner-name"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-partner-handle">Instagram / @</Label>
              <Input
                id="quick-partner-handle"
                value={newHandle}
                onChange={(event) => setNewHandle(event.target.value)}
                placeholder="mariasilva"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreate} disabled={pending}>
              {pending ? "Criando..." : "Criar parceiro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
