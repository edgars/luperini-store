"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { saveTypographyConfigAction } from "@/app/(admin)/admin/configuracoes/tipografia/actions";
import { TypographyPreviewPanel } from "@/components/admin/typography-preview-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTypographyPreset,
  getStoreFontLabel,
  storeFontOptions,
  typographyElementLabels,
  typographyElements,
  type StoreFontId,
  type TypographyApplyMode,
  type TypographyElementsValue,
  type TypographyPreset,
  type TypographySettingsValue,
} from "@/lib/store/typography-config";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false, error: "" };

type StoreTypographyFormProps = {
  settings: TypographySettingsValue;
};

function FontSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: StoreFontId;
  onChange: (value: StoreFontId) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as StoreFontId)}
      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
    >
      {storeFontOptions.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
          {option.description ? ` — ${option.description}` : ""}
        </option>
      ))}
    </select>
  );
}

export function StoreTypographyForm({ settings }: StoreTypographyFormProps) {
  const [applyMode, setApplyMode] = useState<TypographyApplyMode>(
    settings.applyMode,
  );
  const [uniformFont, setUniformFont] = useState<StoreFontId>(
    settings.uniformFont,
  );
  const [elements, setElements] = useState<TypographyElementsValue>({
    ...settings.elements,
  });
  const [presets, setPresets] = useState<TypographyPreset[]>([
    ...settings.presets,
  ]);
  const [presetName, setPresetName] = useState("");
  const jsonRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState(
    saveTypographyConfigAction,
    initialState,
  );

  const currentPayload = useMemo(
    (): TypographySettingsValue => ({
      applyMode,
      uniformFont,
      elements,
      presets,
    }),
    [applyMode, uniformFont, elements, presets],
  );

  useEffect(() => {
    if (jsonRef.current) {
      jsonRef.current.value = JSON.stringify(currentPayload);
    }
  }, [currentPayload]);

  useEffect(() => {
    if (state.success) toast.success("Tipografia salva.");
    else if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  function syncJsonField() {
    if (jsonRef.current) {
      jsonRef.current.value = JSON.stringify(currentPayload);
    }
  }

  function updateElement(element: keyof TypographyElementsValue, font: StoreFontId) {
    setElements((previous) => ({ ...previous, [element]: font }));
  }

  function handleSavePreset() {
    const name = presetName.trim();
    if (!name) {
      toast.error("Informe um nome para o esquema.");
      return;
    }

    const duplicate = presets.some(
      (preset) => preset.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      toast.error("Já existe um esquema com esse nome.");
      return;
    }

    setPresets((previous) => [
      ...previous,
      createTypographyPreset(name, {
        applyMode,
        uniformFont,
        elements,
      }),
    ]);
    setPresetName("");
    toast.success("Esquema adicionado. Salve a tipografia para persistir.");
  }

  function applyPreset(preset: TypographyPreset) {
    setApplyMode(preset.applyMode);
    setUniformFont(preset.uniformFont);
    setElements({ ...preset.elements });
    toast.message(`Esquema “${preset.name}” aplicado ao editor.`);
  }

  function removePreset(id: string) {
    setPresets((previous) => previous.filter((preset) => preset.id !== id));
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        action={formAction}
        className="space-y-8"
        onSubmit={() => syncJsonField()}
      >
        <input ref={jsonRef} type="hidden" name="typographyJson" defaultValue="" />

      <section className="space-y-4">
        <div>
          <h3 className="font-medium">Modo de aplicação</h3>
          <p className="text-sm text-muted-foreground">
            Escolha uma fonte para todo o site ou configure cada tipo de
            elemento.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={applyMode === "uniform" ? "default" : "outline"}
            onClick={() => setApplyMode("uniform")}
          >
            Geral — todo o texto
          </Button>
          <Button
            type="button"
            variant={applyMode === "by_element" ? "default" : "outline"}
            onClick={() => setApplyMode("by_element")}
          >
            Por elemento (H1, H2, H3…)
          </Button>
        </div>
      </section>

      {applyMode === "uniform" ? (
        <section className="space-y-2">
          <Label htmlFor="uniformFont">Fonte geral</Label>
          <FontSelect
            id="uniformFont"
            value={uniformFont}
            onChange={setUniformFont}
          />
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {typographyElements.map((element) => (
            <div key={element} className="space-y-2">
              <Label htmlFor={`font-${element}`}>
                {typographyElementLabels[element]}
              </Label>
              <FontSelect
                id={`font-${element}`}
                value={elements[element]}
                onChange={(font) => updateElement(element, font)}
              />
            </div>
          ))}
        </section>
      )}

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h3 className="font-medium">Esquemas salvos</h3>
          <p className="text-sm text-muted-foreground">
            Salve combinações com nome para reaplicar depois.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="presetName">Nome do esquema</Label>
            <Input
              id="presetName"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="Ex.: Elegante serif, Minimal sans…"
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleSavePreset}>
            Salvar esquema
          </Button>
        </div>

        {presets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum esquema salvo ainda.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {presets.map((preset) => (
              <li
                key={preset.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {preset.applyMode === "uniform"
                      ? `Geral: ${getStoreFontLabel(preset.uniformFont)}`
                      : typographyElements
                          .map(
                            (element) =>
                              `${element.toUpperCase()}: ${getStoreFontLabel(preset.elements[element])}`,
                          )
                          .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                  >
                    Aplicar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePreset(preset.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button
        type="submit"
        disabled={pending}
        onClick={() => syncJsonField()}
      >
        {pending ? "Salvando..." : "Salvar tipografia da loja"}
      </Button>
      </form>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <TypographyPreviewPanel settings={currentPayload} />
      </aside>
    </div>
  );
}
