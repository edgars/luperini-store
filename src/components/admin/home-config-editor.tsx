"use client";

import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { saveHomeConfigAction } from "@/app/(admin)/admin/configuracoes/home/actions";
import {
  HeroSlidesEditor,
  type EditableHeroSlide,
} from "@/components/admin/hero-slides-editor";
import { HomePreview } from "@/components/store/home-preview";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultHomeNavLinks,
  MAX_HOME_NAV_ITEMS,
  type HeroMode,
  type HomePageSettingsValue,
} from "@/lib/store/home-config";
import type { ActionResult, Category } from "@/types";
import { cn } from "@/lib/utils";

const initialState: ActionResult = { success: false, error: "" };

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

type HomeConfigEditorProps = {
  initialSettings: HomePageSettingsValue;
  categories: Category[];
};

export function HomeConfigEditor({
  initialSettings,
  categories,
}: HomeConfigEditorProps) {
  const [state, formAction, pending] = useActionState(
    saveHomeConfigAction,
    initialState,
  );
  const router = useRouter();

  const [navCategoryIds, setNavCategoryIds] = useState(
    initialSettings.navCategoryIds,
  );
  const [hero, setHero] = useState(initialSettings.hero);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pickerValue, setPickerValue] = useState("");
  const [heroMode, setHeroMode] = useState<HeroMode>(
    initialSettings.hero.mode ?? "split",
  );
  const [slides, setSlides] = useState<EditableHeroSlide[]>(
    () =>
      (initialSettings.hero.slides ?? []).map((slide) => ({ ...slide })) as EditableHeroSlide[],
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const previewConfig = useMemo(() => {
    const resolvedNavLinks =
      navCategoryIds.length === 0
        ? [...defaultHomeNavLinks]
        : navCategoryIds
            .map((categoryId) => categoryMap.get(categoryId))
            .filter((category): category is Category => Boolean(category))
            .map((category) => ({
              label: category.name,
              href: `/produtos?categoria=${category.slug}`,
            }));

    return {
      navLinks:
        resolvedNavLinks.length > 0
          ? resolvedNavLinks
          : [...defaultHomeNavLinks],
      hero: {
        ...hero,
        mode: heroMode,
        imageUrl: imagePreview ?? hero.imageUrl,
        slides: slides.map((slide) => ({
          id: slide.id,
          imageUrl: slide.previewUrl || slide.imageUrl,
          title: slide.title ?? "",
          subtitle: slide.subtitle ?? "",
          ctaLabel: slide.ctaLabel ?? "",
          ctaHref: slide.ctaHref ?? "",
        })),
      },
    };
  }, [navCategoryIds, categoryMap, hero, imagePreview, heroMode, slides]);

  useEffect(() => {
    if (state.success) {
      toast.success("Home atualizada com sucesso.");
      setImagePreview(null);
      router.refresh();
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function addCategory() {
    if (!pickerValue || navCategoryIds.includes(pickerValue)) return;
    if (navCategoryIds.length >= MAX_HOME_NAV_ITEMS) {
      toast.error(`Máximo de ${MAX_HOME_NAV_ITEMS} categorias no menu.`);
      return;
    }
    setNavCategoryIds((current) => [...current, pickerValue]);
    setPickerValue("");
  }

  function removeCategory(categoryId: string) {
    setNavCategoryIds((current) =>
      current.filter((item) => item !== categoryId),
    );
  }

  function moveCategory(categoryId: string, direction: "up" | "down") {
    setNavCategoryIds((current) => {
      const index = current.indexOf(categoryId);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function handleHeroImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
  }

  const availableCategories = categories.filter(
    (category) => !navCategoryIds.includes(category.id),
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <form action={formAction} className="space-y-8">
        <input
          type="hidden"
          name="navCategoryIds"
          value={JSON.stringify(navCategoryIds)}
          readOnly
        />
        <input type="hidden" name="heroImageUrl" value={hero.imageUrl} readOnly />
        <input type="hidden" name="heroMode" value={heroMode} readOnly />
        <input
          type="hidden"
          name="heroSlides"
          value={JSON.stringify(
            slides.map((slide) => ({
              id: slide.id,
              imageUrl: slide.imageUrl ?? "",
              title: slide.title ?? "",
              subtitle: slide.subtitle ?? "",
              ctaLabel: slide.ctaLabel ?? "",
              ctaHref: slide.ctaHref ?? "",
              fileFieldName: slide.fileFieldName ?? null,
            })),
          )}
          readOnly
        />

        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Menu principal</h2>
            <p className="text-sm text-muted-foreground">
              Categorias exibidas no topo da loja (máx. {MAX_HOME_NAV_ITEMS}).
            </p>
          </div>

          {navCategoryIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria selecionada. O menu padrão será usado na loja.
            </p>
          ) : (
            <ul className="space-y-2">
              {navCategoryIds.map((categoryId, index) => {
                const category = categoryMap.get(categoryId);
                if (!category) return null;

                return (
                  <li
                    key={categoryId}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <span className="w-5 text-xs text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {category.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => moveCategory(categoryId, "up")}
                      disabled={index === 0}
                      aria-label="Mover para cima"
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => moveCategory(categoryId, "down")}
                      disabled={index === navCategoryIds.length - 1}
                      aria-label="Mover para baixo"
                    >
                      <ChevronDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeCategory(categoryId)}
                      aria-label="Remover"
                    >
                      <X />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex gap-2">
            <select
              value={pickerValue}
              onChange={(event) => setPickerValue(event.target.value)}
              className={selectClassName}
            >
              <option value="">Adicionar categoria…</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={addCategory}
              disabled={!pickerValue}
            >
              <Plus />
              Adicionar
            </Button>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Modo do hero</h2>
            <p className="text-sm text-muted-foreground">
              Escolha o formato do bloco principal da home.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={heroMode === "split" ? "default" : "outline"}
              onClick={() => setHeroMode("split")}
            >
              Padrão — texto + imagem
            </Button>
            <Button
              type="button"
              variant={heroMode === "slider" ? "default" : "outline"}
              onClick={() => setHeroMode("slider")}
            >
              Carrossel de imagens (banner)
            </Button>
          </div>
        </section>

        {heroMode === "slider" ? (
          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h2 className="text-lg font-semibold">Slides do carrossel</h2>
              <p className="text-sm text-muted-foreground">
                Imagens de tela cheia com título, subtítulo e botão opcional.
                Autoplay a cada 6 segundos e navegação por setas/pontos.
              </p>
            </div>
            <HeroSlidesEditor slides={slides} onChange={setSlides} />
          </section>
        ) : null}

        <section className={cn("space-y-4 rounded-xl border p-5", heroMode === "slider" && "opacity-70")}>
          <div>
            <h2 className="text-lg font-semibold">Hero — texto e botão</h2>
            <p className="text-sm text-muted-foreground">
              {heroMode === "slider"
                ? "Usado apenas no modo padrão. Mantido caso queira voltar."
                : "Conteúdo do bloco principal à esquerda da home."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="heroEyebrow">Rótulo superior</Label>
              <Input
                id="heroEyebrow"
                name="heroEyebrow"
                value={hero.eyebrow}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    eyebrow: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroTitle">Título</Label>
              <Input
                id="heroTitle"
                name="heroTitle"
                value={hero.title}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroTitleAccent">Destaque do título</Label>
              <Input
                id="heroTitleAccent"
                name="heroTitleAccent"
                value={hero.titleAccent}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    titleAccent: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="heroDescription">Descrição</Label>
              <Textarea
                id="heroDescription"
                name="heroDescription"
                rows={4}
                value={hero.description}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroCtaLabel">Texto do botão</Label>
              <Input
                id="heroCtaLabel"
                name="heroCtaLabel"
                value={hero.ctaLabel}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    ctaLabel: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroCtaHref">Link do botão</Label>
              <Input
                id="heroCtaHref"
                name="heroCtaHref"
                value={hero.ctaHref}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    ctaHref: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </section>

        <section className={cn("space-y-4 rounded-xl border p-5", heroMode === "slider" && "opacity-70")}>
          <div>
            <h2 className="text-lg font-semibold">Hero — imagem (modo padrão)</h2>
            <p className="text-sm text-muted-foreground">
              Imagem exibida à direita no modo padrão. Até 4 MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImage">Nova imagem</Label>
            <Input
              id="heroImage"
              name="heroImage"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleHeroImageChange}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar home"}
          </Button>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Abrir loja
          </Link>
        </div>
      </form>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Pré-visualização</h2>
            <p className="text-sm text-muted-foreground">
              Atualiza em tempo real antes de salvar.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border shadow-sm">
            <div className="border-b bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">Preview · Home</p>
            </div>
            <HomePreview config={previewConfig} preview className="max-h-[720px] overflow-y-auto" />
          </div>
        </div>
      </aside>
    </div>
  );
}
