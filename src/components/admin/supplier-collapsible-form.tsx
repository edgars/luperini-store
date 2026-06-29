"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { SupplierForm } from "@/components/admin/supplier-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function SupplierCollapsibleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSuccess = useCallback(() => {
    router.refresh();
    setOpen(false);
    setFormKey((current) => current + 1);
  }, [router]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible w-full"
    >
      <Card>
        <CardHeader className="pb-0">
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-between rounded-lg py-1 text-left transition-colors",
              "hover:text-foreground/80",
            )}
          >
            <CardTitle className="text-base">Novo fornecedor</CardTitle>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-open/collapsible:rotate-180"
              aria-hidden
            />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-4">
            <SupplierForm
              key={formKey}
              layout="horizontal"
              onSuccess={handleSuccess}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
