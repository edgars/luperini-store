"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAspectRatioWarning,
  PRODUCT_IMAGE_SPECS,
  validateProductImageSize,
  type ProductImageType,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";

type ProductImageUploadFieldProps = {
  name?: string;
  type?: ProductImageType;
  label?: string;
  existingUrl?: string | null;
  existingAlt?: string;
};

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

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

export function ProductImageUploadField({
  name = "coverImage",
  type = "cover",
  label = "Imagem de capa",
  existingUrl,
  existingAlt,
}: ProductImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [aspectWarning, setAspectWarning] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  const spec = PRODUCT_IMAGE_SPECS[type];

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName(null);
      setFileSize(null);
      setDimensions(null);
      setSizeError(null);
      setAspectWarning(null);
      setPreviewUrl(existingUrl ?? null);
      return;
    }

    const validationError = validateProductImageSize(file.size);
    setSizeError(validationError);
    setFileName(file.name);
    setFileSize(file.size);

    if (validationError) {
      setDimensions(null);
      setAspectWarning(null);
      setPreviewUrl(existingUrl ?? null);
      toast.error(validationError);
      event.target.value = "";
      return;
    }

    setIsReading(true);

    try {
      const { width, height } = await readImageDimensions(file);
      const warning = getAspectRatioWarning(width, height, type);

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(URL.createObjectURL(file));
      setDimensions({ width, height });
      setAspectWarning(warning);

      if (warning) {
        toast.warning(warning);
      }
    } catch {
      setDimensions(null);
      setAspectWarning(null);
      setPreviewUrl(existingUrl ?? null);
      toast.error("Não foi possível analisar a imagem selecionada.");
      event.target.value = "";
    } finally {
      setIsReading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <p className="text-xs text-muted-foreground">
          Até 4 MB · original em alta resolução + versão de exibição até {spec.label} ·
          WebP
        </p>
        <Input
          id={name}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={isReading}
          onChange={handleFileChange}
        />
      </div>

      {fileName && !sizeError && (
        <p className="text-sm text-muted-foreground">
          Arquivo: {fileName}
          {fileSize !== null && ` · ${(fileSize / (1024 * 1024)).toFixed(2)} MB`}
          {dimensions && ` · ${dimensions.width}×${dimensions.height} px`}
        </p>
      )}

      {sizeError && (
        <p className="text-sm text-destructive">{sizeError}</p>
      )}

      {aspectWarning && !sizeError && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {aspectWarning}
        </p>
      )}

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={existingAlt ?? "Pré-visualização da imagem"}
          className={cn(
            "rounded-lg border object-cover",
            type === "gallery" ? "h-32 w-48" : "h-32 w-32",
          )}
        />
      )}

    </div>
  );
}
