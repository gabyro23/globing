import { createCountryCard } from './countryCard.js';

export function createCountryList(container) {
  const list = document.createElement('div');
  list.className = 'country-list';
  container.innerHTML = '';
  container.appendChild(list);

  const countEl = document.createElement('p');
  countEl.className = 'country-list__count';
  container.insertBefore(countEl, list);

  return {
    render(countries, { selectionColors, onToggle }) {
      countEl.textContent = `${countries.length} país${countries.length === 1 ? '' : 'es'}`;
      list.innerHTML = '';
      if (countries.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'country-list__empty';
        empty.textContent = 'No hay países que coincidan con los filtros.';
        list.appendChild(empty);
        return;
      }
      const fragment = document.createDocumentFragment();
      for (const country of countries) {
        fragment.appendChild(createCountryCard(country, { color: selectionColors.get(country.alpha3), onToggle }));
      }
      list.appendChild(fragment);
    },
  };
}
