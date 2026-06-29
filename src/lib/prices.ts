export function parseReaisToCents(value: string): number | null {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");

  if (!normalized) return null;

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) return null;

  return Math.round(amount * 100);
}

export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function calculateMarginPercent(
  salePriceCents: number,
  costPriceCents: number,
): number {
  if (salePriceCents <= 0) return 0;
  return Math.round(
    ((salePriceCents - costPriceCents) / salePriceCents) * 100,
  );
}
