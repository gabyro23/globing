const numberFormatter = new Intl.NumberFormat('es', { maximumFractionDigits: 0 });
const compactFormatter = new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 });

export function formatNumber(value) {
  return numberFormatter.format(value);
}

export function formatCompact(value) {
  return compactFormatter.format(value);
}

export function formatArea(km2) {
  return `${formatNumber(km2)} km²`;
}

export function formatPopulation(people) {
  return `${formatNumber(people)} hab.`;
}
