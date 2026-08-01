"use client";

import { ChevronDown, ChevronUp, ImagePlus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createHeroSlideId,
  MAX_HERO_SLIDES,
  type HeroSlide,
} from "@/lib/store/home-config";
import { cn } from "@/lib/utils";

export type EditableHeroSlide = HeroSlide & {
  previewUrl?: string;
  fileFieldName?: string;
};

type HeroSlidesEditorProps = {
  slides: EditableHeroSlide[];
  onChange: (slides: EditableHeroSlide[]) => void;
};

/** File inputs kept outside React state — refs are read by the FormData at submit. */
type SlideFileRef = {
  slideId: string;
  fieldName: string;
  file: File;
};

export function HeroSlidesEditor({ slides, onChange }: HeroSlidesEditorProps) {
  const [pendingFiles, setPendingFiles] = useState<SlideFileRef[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const objectUrls = useMemo(
    () => pendingFiles.map((entry) => URL.createObjectURL(entry.file)),
    [pendingFiles],
  );

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  function updateSlide(id: string, partial: Partial<EditableHeroSlide>) {
    onChange(
      slides.map((slide) => (slide.id === id ? { ...slide, ...partial } : slide)),
    );
  }

  function removeSlide(id: string) {
    onChange(slides.filter((slide) => slide.id !== id));
    setPendingFiles((current) => current.filter((entry) => entry.slideId !== id));
  }

  function moveSlide(id: string, direction: "up" | "down") {
    const index = slides.findIndex((slide) => slide.id === id);
    if (index === -1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function handleAddClick() {
    if (slides.length >= MAX_HERO_SLIDES) {
      toast.error(`Máximo de ${MAX_HERO_SLIDES} slides.`);
      return;
    }
    fileInputRef.current?.click();
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const remaining = MAX_HERO_SLIDES - slides.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${MAX_HERO_SLIDES} slides.`);
      return;
    }

    const selected = files.slice(0, remaining);
    const newSlides: EditableHeroSlide[] = [];
    const newFiles: SlideFileRef[] = [];

    for (const file of selected) {
      const id = createHeroSlideId();
      const fieldName = `heroSlideFile-${id}`;
      newSlides.push({
        id,
        imageUrl: "",
        title: "",
        subtitle: "",
        ctaLabel: "",
        ctaHref: "",
        previewUrl: URL.createObjectURL(file),
        fileFieldName: fieldName,
      });
      newFiles.push({ slideId: id, fieldName, file });
    }

    onChange([...slides, ...newSlides]);
    setPendingFiles((current) => [...current, ...newFiles]);
  }

  function replaceSlideImage(id: string, file: File) {
    const fieldName = `heroSlideFile-${id}`;
    setPendingFiles((current) => {
      const filtered = current.filter((entry) => entry.slideId !== id);
      return [...filtered, { slideId: id, fieldName, file }];
    });
    updateSlide(id, {
      previewUrl: URL.createObjectURL(file),
      fileFieldName: fieldName,
    });
  }

  // Sync hidden inputs for pending files into the DOM inside the form via effect.
  const pendingFilesMapRef = useRef<Map<string, File>>(new Map());
  useEffect(() => {
    const map = new Map<string, File>();
    for (const entry of pendingFiles) {
      map.set(entry.fieldName, entry.file);
    }
    pendingFilesMapRef.current = map;
  }, [pendingFiles]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {slides.length}/{MAX_HERO_SLIDES} slides no carrossel.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddClick}
          disabled={slides.length >= MAX_HERO_SLIDES}
        >
          <ImagePlus />
          Adicionar slide(s)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {slides.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhum slide ainda. Clique em <strong>Adicionar slide(s)</strong> para
          selecionar imagens (você pode escolher várias de uma vez).
        </div>
      ) : (
        <ul className="space-y-4">
          {slides.map((slide, index) => {
            const previewSrc = slide.previewUrl || slide.imageUrl;
            return (
              <li
                key={slide.id}
                className="grid gap-4 rounded-lg border p-4 md:grid-cols-[140px_1fr]"
              >
                <div className="space-y-2">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted">
                    {previewSrc ? (
                      <Image
                        src={previewSrc}
                        alt={slide.title || `Slide ${index + 1}`}
                        fill
                        unoptimized={previewSrc.startsWith("blob:")}
                        sizes="140px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-accent",
                    )}
                  >
                    <Plus className="size-3" />
                    Trocar
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) replaceSlideImage(slide.id, file);
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Slide {index + 1}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => moveSlide(slide.id, "up")}
                        disabled={index === 0}
                        aria-label="Mover para cima"
                      >
                        <ChevronUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => moveSlide(slide.id, "down")}
                        disabled={index === slides.length - 1}
                        aria-label="Mover para baixo"
                      >
                        <ChevronDown />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeSlide(slide.id)}
                        aria-label="Remover slide"
                      >
                        <X />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={`slide-title-${slide.id}`}>
                        Título (overlay)
                      </Label>
                      <Input
                        id={`slide-title-${slide.id}`}
                        value={slide.title ?? ""}
                        onChange={(event) =>
                          updateSlide(slide.id, { title: event.target.value })
                        }
                        placeholder="Ex.: BRASIL"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={`slide-subtitle-${slide.id}`}>
                        Subtítulo
                      </Label>
                      <Input
                        id={`slide-subtitle-${slide.id}`}
                        value={slide.subtitle ?? ""}
                        onChange={(event) =>
                          updateSlide(slide.id, {
                            subtitle: event.target.value,
                          })
                        }
                        placeholder="Ex.: Rumo ao xexa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`slide-cta-label-${slide.id}`}>
                        Texto do botão
                      </Label>
                      <Input
                        id={`slide-cta-label-${slide.id}`}
                        value={slide.ctaLabel ?? ""}
                        onChange={(event) =>
                          updateSlide(slide.id, {
                            ctaLabel: event.target.value,
                          })
                        }
                        placeholder="Ver coleção"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`slide-cta-href-${slide.id}`}>
                        Link do botão
                      </Label>
                      <Input
                        id={`slide-cta-href-${slide.id}`}
                        value={slide.ctaHref ?? ""}
                        onChange={(event) =>
                          updateSlide(slide.id, {
                            ctaHref: event.target.value,
                          })
                        }
                        placeholder="/produtos?colecao=..."
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <FormFilesInjector pendingFiles={pendingFiles} />
    </div>
  );
}

/**
 * Injects one hidden `<input type="file">` per pending slide file using DataTransfer
 * so the enclosing form submits the actual File instances under the expected names.
 */
function FormFilesInjector({ pendingFiles }: { pendingFiles: SlideFileRef[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    for (const entry of pendingFiles) {
      const input = document.createElement("input");
      input.type = "file";
      input.name = entry.fieldName;
      input.hidden = true;
      input.tabIndex = -1;

      try {
        const dt = new DataTransfer();
        dt.items.add(entry.file);
        input.files = dt.files;
      } catch {
        // DataTransfer might be unavailable in exotic environments.
      }

      container.appendChild(input);
    }
  }, [pendingFiles]);

  return <div ref={containerRef} aria-hidden />;
}
