const eur = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return eur.format(value);
}
