// Base palette for the map mosaic. Each country keeps this color everywhere
// it appears (map, list cards, compare chips, bar charts) — selecting a
// country never recolors it, it just gets highlighted (see mapView.js).
export const MAP_BASE_COLORS = ['#C1666B', '#96C4C0', '#6FB7B3', '#96C4C0', '#DCCAAF', '#D4B483', '#CB8D77', '#C67A71'];
export const MAX_COMPARE = 5;

export function assignCountryColors(countries) {
  countries.forEach((country, index) => {
    country.color = MAP_BASE_COLORS[index % MAP_BASE_COLORS.length];
  });
}
