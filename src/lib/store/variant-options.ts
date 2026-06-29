import type { StoreProductVariant } from "@/lib/store/get-product-by-slug";

const ATTRIBUTE_LABELS: Record<string, string> = {
  tamanho: "Tamanho",
  cor: "Cor",
};

export function formatAttributeLabel(key: string) {
  return ATTRIBUTE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function getAttributeGroups(
  variants: StoreProductVariant[],
): Record<string, string[]> {
  const groups: Record<string, Set<string>> = {};

  for (const variant of variants) {
    if (!variant.attributes) continue;
    for (const [key, value] of Object.entries(variant.attributes)) {
      if (!groups[key]) groups[key] = new Set();
      groups[key].add(value);
    }
  }

  return Object.fromEntries(
    Object.entries(groups).map(([key, values]) => [key, [...values].sort()]),
  );
}

export function getInitialSelections(
  variants: StoreProductVariant[],
): Record<string, string> {
  const groups = getAttributeGroups(variants);
  const selections: Record<string, string> = {};

  for (const [key, values] of Object.entries(groups)) {
    if (values[0]) selections[key] = values[0];
  }

  return selections;
}

export function findVariantBySelections(
  variants: StoreProductVariant[],
  selections: Record<string, string>,
): StoreProductVariant | undefined {
  const keys = Object.keys(selections);
  if (keys.length === 0) return variants[0];

  return variants.find((variant) => {
    if (!variant.attributes) return false;
    return keys.every((key) => variant.attributes?.[key] === selections[key]);
  });
}

export function hasAttributeOptions(variants: StoreProductVariant[]) {
  return Object.keys(getAttributeGroups(variants)).length > 0;
}

export function hasMultipleNamedVariants(variants: StoreProductVariant[]) {
  return (
    variants.length > 1 &&
    variants.some((variant) => variant.name.trim().toLowerCase() !== "padrão")
  );
}
