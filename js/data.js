const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export function alpha2ToFlagEmoji(alpha2) {
  if (!alpha2 || alpha2.length !== 2) return '';
  const codePoints = [...alpha2.toUpperCase()].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export async function loadCountries() {
  const res = await fetch('data/countries.json');
  if (!res.ok) throw new Error(`No se pudo cargar data/countries.json (${res.status})`);
  const rows = await res.json();
  return rows.map((c) => ({ ...c, flag: alpha2ToFlagEmoji(c.alpha2) }));
}

export async function loadWorldTopology() {
  const res = await fetch(WORLD_ATLAS_URL);
  if (!res.ok) throw new Error(`No se pudo cargar el mapa mundial (${res.status})`);
  return res.json();
}
