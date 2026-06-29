export const MAX_PRODUCT_IMAGE_BYTES = 4 * 1024 * 1024;

export type ProductImageType = "cover" | "gallery" | "thumbnail";

type ImageSpec = {
  width: number;
  height: number;
  label: string;
  ratio: number;
  ratioLabel: string;
};

export const PRODUCT_IMAGE_SPECS: Record<ProductImageType, ImageSpec> = {
  cover: {
    width: 800,
    height: 800,
    label: "800×800 px",
    ratio: 1,
    ratioLabel: "quadrado (1:1)",
  },
  gallery: {
    width: 1200,
    height: 800,
    label: "1200×800 px",
    ratio: 1.5,
    ratioLabel: "horizontal (3:2)",
  },
  thumbnail: {
    width: 400,
    height: 400,
    label: "400×400 px",
    ratio: 1,
    ratioLabel: "quadrado (1:1)",
  },
};

const ASPECT_TOLERANCE = 0.12;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateProductImageSize(size: number): string | null {
  if (size <= 0) return "Selecione uma imagem válida.";
  if (size > MAX_PRODUCT_IMAGE_BYTES) {
    return `A imagem deve ter no máximo 4 MB. Tamanho atual: ${formatFileSize(size)}.`;
  }
  return null;
}

export function getAspectRatioWarning(
  width: number,
  height: number,
  type: ProductImageType,
): string | null {
  if (width <= 0 || height <= 0) return null;

  const spec = PRODUCT_IMAGE_SPECS[type];
  const ratio = width / height;
  const delta = Math.abs(ratio - spec.ratio) / spec.ratio;

  if (delta <= ASPECT_TOLERANCE) return null;

  return `Proporção fora do ideal para ${type === "cover" ? "capa" : type}. Recomendado: ${spec.label} (${spec.ratioLabel}). Dimensões atuais: ${width}×${height} px.`;
}

export function isAllowedImageMimeType(type: string): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type);
}

/** Redimensiona para caber no spec do tipo, sem crop — mantém aspect ratio. */
export function getDisplayResizeOptions(type: ProductImageType) {
  const spec = PRODUCT_IMAGE_SPECS[type];
  return {
    width: spec.width,
    height: spec.height,
    fit: "inside" as const,
    withoutEnlargement: true,
  };
}
