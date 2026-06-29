import { createClient } from "@/lib/supabase/server";
import {
  getAspectRatioWarning,
  getDisplayResizeOptions,
  isAllowedImageMimeType,
  type ProductImageType,
  validateProductImageSize,
} from "@/lib/product-images";

const BUCKET = "product-images";

export type ProcessedProductImage = {
  url: string;
  originalUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  aspectWarning: string | null;
};

type ImageBuffers = {
  originalBuffer: Buffer;
  displayBuffer: Buffer;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  aspectWarning: string | null;
};

export async function processImageBuffers(
  buffer: Buffer,
  type: ProductImageType,
): Promise<ImageBuffers> {
  const sharp = (await import("sharp")).default;
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width ?? 0;
  const originalHeight = metadata.height ?? 0;
  const aspectWarning = getAspectRatioWarning(originalWidth, originalHeight, type);

  const originalBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
  const displayBuffer = await sharp(buffer)
    .resize(getDisplayResizeOptions(type))
    .webp({ quality: 85 })
    .toBuffer();

  const outputMeta = await sharp(displayBuffer).metadata();

  return {
    originalBuffer,
    displayBuffer,
    width: outputMeta.width ?? originalWidth,
    height: outputMeta.height ?? originalHeight,
    originalWidth,
    originalHeight,
    aspectWarning,
  };
}

async function uploadBuffer(path: string, buffer: Buffer) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function uploadProductImage(
  productId: string,
  file: File,
  type: ProductImageType,
): Promise<ProcessedProductImage> {
  const sizeError = validateProductImageSize(file.size);
  if (sizeError) {
    throw new Error(sizeError);
  }

  if (!isAllowedImageMimeType(file.type)) {
    throw new Error("Formato não suportado. Use JPG, PNG, WebP ou GIF.");
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const processed = await processImageBuffers(rawBuffer, type);
  const timestamp = Date.now();
  const originalPath = `${productId}/${type}-original-${timestamp}.webp`;
  const displayPath = `${productId}/${type}-display-${timestamp}.webp`;

  const [originalUrl, url] = await Promise.all([
    uploadBuffer(originalPath, processed.originalBuffer),
    uploadBuffer(displayPath, processed.displayBuffer),
  ]);

  return {
    url,
    originalUrl,
    width: processed.width,
    height: processed.height,
    originalWidth: processed.originalWidth,
    originalHeight: processed.originalHeight,
    aspectWarning: processed.aspectWarning,
  };
}

export async function removeStorageObject(path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}

export function getStoragePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;

  if (!url.includes(marker)) return null;

  return url.split(marker)[1] ?? null;
}

export async function removeProductImageFiles(image: {
  url: string;
  originalUrl?: string | null;
}) {
  const paths = [image.url, image.originalUrl]
    .map((url) => (url ? getStoragePathFromUrl(url) : null))
    .filter((path): path is string => Boolean(path));

  await Promise.all(paths.map((path) => removeStorageObject(path).catch(() => undefined)));
}
