#!/usr/bin/env node
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!databaseUrl || !supabaseUrl || !secretKey) {
  console.error("Missing DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const BUCKET = "product-images";

const storageHeaders = {
  apikey: secretKey,
  Authorization: `Bearer ${secretKey}`,
};

const DISPLAY_SPECS = {
  cover: { width: 800, height: 800 },
  gallery: { width: 1200, height: 800 },
  thumbnail: { width: 400, height: 400 },
};

async function processBuffers(buffer, type) {
  const sharp = (await import("sharp")).default;
  const spec = DISPLAY_SPECS[type] ?? DISPLAY_SPECS.cover;
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width ?? 0;
  const originalHeight = metadata.height ?? 0;

  const originalBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
  const displayBuffer = await sharp(buffer)
    .resize({
      width: spec.width,
      height: spec.height,
      fit: "inside",
      withoutEnlargement: true,
    })
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
  };
}

function getStoragePathFromUrl(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  if (!url.includes(marker)) return null;
  return url.split(marker)[1] ?? null;
}

function getPublicUrl(path) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function uploadBuffer(path, buffer) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      ...storageHeaders,
      "Content-Type": "image/webp",
      "x-upsert": "false",
    },
    body: buffer,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload ${path}: ${response.status} ${body}`);
  }

  return getPublicUrl(path);
}

async function removeObject(path) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: storageHeaders,
  });

  if (!response.ok && response.status !== 404) {
    const body = await response.text();
    throw new Error(`Delete ${path}: ${response.status} ${body}`);
  }
}

const sql = postgres(databaseUrl, { prepare: false });

const images = await sql`
  select id, product_id, url, original_url, type
  from product_images
  where original_url is null
`;

if (images.length === 0) {
  console.log("Nenhuma imagem pendente de migração.");
  await sql.end();
  process.exit(0);
}

for (const image of images) {
  console.log(`Migrando imagem ${image.id} (${image.type})...`);

  const response = await fetch(image.url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar ${image.url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const type = image.type ?? "cover";
  const processed = await processBuffers(buffer, type);
  const timestamp = Date.now();
  const productId = image.product_id;
  const originalPath = `${productId}/${type}-original-${timestamp}.webp`;
  const displayPath = `${productId}/${type}-display-${timestamp}.webp`;

  const originalUrl = await uploadBuffer(originalPath, processed.originalBuffer);
  let displayUrl;

  try {
    displayUrl = await uploadBuffer(displayPath, processed.displayBuffer);
  } catch (error) {
    await removeObject(originalPath);
    throw error;
  }

  await sql`
    update product_images
    set
      url = ${displayUrl},
      original_url = ${originalUrl},
      width = ${processed.width},
      height = ${processed.height},
      original_width = ${processed.originalWidth},
      original_height = ${processed.originalHeight}
    where id = ${image.id}
  `;

  const oldPath = getStoragePathFromUrl(image.url);
  if (oldPath && oldPath !== originalPath && oldPath !== displayPath) {
    await removeObject(oldPath);
  }

  console.log(
    `  original: ${processed.originalWidth}×${processed.originalHeight} → ${originalUrl}`,
  );
  console.log(`  display:  ${processed.width}×${processed.height} → ${displayUrl}`);
}

await sql.end();
console.log(`Migração concluída: ${images.length} imagem(ns).`);
