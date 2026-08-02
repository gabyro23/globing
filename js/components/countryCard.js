import { formatArea, formatAreaCompact, formatPopulation, formatPopulationCompact } from '../format.js';
import { makeDraggable } from '../dnd.js';

export function createCountryCard(country, { selected, onToggle }) {
  const card = document.createElement('article');
  card.className = 'country-card' + (selected ? ' is-selected' : '');
  card.dataset.alpha3 = country.alpha3;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-pressed', String(!!selected));
  card.title = 'Arrastrá a "Comparar" o hacé click para agregar';
  card.style.setProperty('--chip-color', country.color);

  card.innerHTML = `
    <span class="country-card__flag" aria-hidden="true">${country.flag}</span>
    <div class="country-card__body">
      <h3 class="country-card__name">${country.name}</h3>
      <dl class="country-card__stats">
        <div><dt>Población</dt><dd title="${formatPopulation(country.population)}">${formatPopulationCompact(country.population)}</dd></div>
        <div><dt>Superficie</dt><dd title="${formatArea(country.area)}">${formatAreaCompact(country.area)}</dd></div>
      </dl>
    </div>
    <span class="country-card__check" aria-hidden="true">✓</span>
  `;

  makeDraggable(card, country.alpha3);
  card.addEventListener('click', () => onToggle(country.alpha3));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(country.alpha3);
    }
  });

  return card;
}
