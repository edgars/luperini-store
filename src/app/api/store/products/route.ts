import { NextResponse } from "next/server";

import {
  getStoreProducts,
  parseStoreProductsQuery,
} from "@/lib/store/get-store-products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseStoreProductsQuery({
    q: searchParams.get("q") ?? undefined,
    categoria: searchParams.get("categoria") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    temporada: searchParams.get("temporada") ?? undefined,
    tags: searchParams.get("tags") ?? undefined,
    preco_min: searchParams.get("preco_min") ?? undefined,
    preco_max: searchParams.get("preco_max") ?? undefined,
  });

  const { products, total } = await getStoreProducts(query);

  return NextResponse.json({ products, total });
}
