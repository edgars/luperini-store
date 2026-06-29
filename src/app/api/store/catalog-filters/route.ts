import { NextResponse } from "next/server";

import { getStoreCatalogFilters } from "@/lib/store/get-store-products";

export async function GET() {
  const filters = await getStoreCatalogFilters();
  return NextResponse.json(filters);
}
