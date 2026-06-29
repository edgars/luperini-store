"use client";

import NextImage from "next/image";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAspectRatioWarning,
  PRODUCT_IMAGE_SPECS,
  validateProductImageSize,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

type PendingPreview = {
  id: string;
  url: string;
  name: string;
  file: File;
};

type ProductGalleryImagesFieldProps = {
  existingImages?: ProductImage[];
  onDeleteImage?: (imageId: string) => Promise<{ success: boolean; error?: string }>;
};

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = document.createElement("img");

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };

    image.src = url;
  });
}

export function ProductGalleryImagesField({
  existingImages = [],
  onDeleteImage,
}: ProductGalleryImagesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryImages, setGalleryImages] = useState(existingImages);
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const spec = PRODUCT_IMAGE_SPECS.gallery;

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    for (const preview of pendingPreviews) {
      dataTransfer.items.add(preview.file);
    }
    input.files = dataTransfer.files;
  }, [pendingPreviews]);

  useEffect(() => {
    return () => {
      for (const preview of pendingPreviews) {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      }
    };
  }, [pendingPreviews]);

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setIsReading(true);

    try {
      const nextPreviews: PendingPreview[] = [];

      for (const file of files) {
        const validationError = validateProductImageSize(file.size);
        if (validationError) {
          toast.error(`${file.name}: ${validationError}`);
          continue;
        }

        try {
          const { width, height } = await readImageDimensions(file);
          const warning = getAspectRatioWarning(width, height, "gallery");
          if (warning) {
            toast.warning(`${file.name}: ${warning}`);
          }
        } catch {
          toast.error(`Não foi possível analisar ${file.name}.`);
          continue;
        }

        nextPreviews.push({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          url: URL.createObjectURL(file),
          name: file.name,
          file,
        });
      }

      if (nextPreviews.length > 0) {
        setPendingPreviews((current) => [...current, ...nextPreviews]);
      }
    } finally {
      setIsReading(false);
    }
  }

  function removePendingPreview(id: string) {
    setPendingPreviews((current) => {
      const preview = current.find((item) => item.id === id);
      if (preview?.url.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function handleDeleteExisting(imageId: string) {
    if (!onDeleteImage) return;

    setDeletingId(imageId);
    startTransition(async () => {
      const result = await onDeleteImage(imageId);
      if (result.success) {
        setGalleryImages((current) => current.filter((image) => image.id !== imageId));
        toast.success("Imagem removida.");
      } else {
        toast.error(result.error ?? "Não foi possível remover a imagem.");
      }
      setDeletingId(null);
    });
  }

  const hasImages = galleryImages.length > 0 || pendingPreviews.length > 0;

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="space-y-2">
        <Label htmlFor="galleryImagesPicker">Fotos adicionais</Label>
        <p className="text-xs text-muted-foreground">
          Adicione quantas fotos quiser. No site, elas aparecem em slider ao passar
          o mouse no produto e na página de detalhes com zoom. Até 4 MB cada ·{" "}
          {spec.label} recomendado · WebP
        </p>
        <Input
          id="galleryImagesPicker"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={isReading || isPending}
          onChange={handleFilesChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          name="galleryImages"
          multiple
          hidden
          readOnly
          tabIndex={-1}
          aria-hidden
        />
      </div>

      {hasImages && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg border"
            >
              <NextImage
                src={image.url}
                alt={image.alt ?? "Foto do produto"}
                fill
                sizes="160px"
                className="object-cover"
              />
              {onDeleteImage && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  disabled={deletingId === image.id || isPending}
                  onClick={() => handleDeleteExisting(image.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}

          {pendingPreviews.map((preview) => (
            <div
              key={preview.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-dashed border-primary/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.name}
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removePendingPreview(preview.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <span className="absolute bottom-2 left-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Nova
              </span>
            </div>
          ))}
        </div>
      )}

      {!hasImages && (
        <p className={cn("text-sm text-muted-foreground")}>
          Nenhuma foto adicional ainda. Use o campo acima para adicionar.
        </p>
      )}
    </div>
  );
}
