export const PRODUCT_SEASONS = [
  { value: "spring", label: "Primavera" },
  { value: "summer", label: "Verão" },
  { value: "autumn", label: "Outono" },
  { value: "winter", label: "Inverno" },
  { value: "all_season", label: "Atemporal" },
] as const;

export type ProductSeason = (typeof PRODUCT_SEASONS)[number]["value"];

export function getSeasonLabel(season: ProductSeason) {
  return PRODUCT_SEASONS.find((item) => item.value === season)?.label ?? season;
}
