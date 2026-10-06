export function formatPrice(priceCents: number): string {
  return `Q${(priceCents / 100).toFixed(2)}`;
}
