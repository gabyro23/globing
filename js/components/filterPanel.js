const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nombre (A-Z)' },
  { value: 'population-desc', label: 'Población (mayor a menor)' },
  { value: 'population-asc', label: 'Población (menor a mayor)' },
  { value: 'area-desc', label: 'Superficie (mayor a menor)' },
  { value: 'area-asc', label: 'Superficie (menor a mayor)' },
];

export function createFilterPanel(container, { regions, filters, onChange }) {
  container.innerHTML = `
    <div class="filter-panel">
      <div class="filter-field filter-field--search">
        <label for="filter-search">Buscar país</label>
        <input id="filter-search" type="search" placeholder="Ej: Argentina, Japón..." autocomplete="off" />
      </div>

      <fieldset class="filter-field filter-field--regions">
        <legend>Región</legend>
        <div class="filter-regions" id="filter-regions"></div>
      </fieldset>

      <div class="filter-field">
        <label for="filter-sort">Ordenar por</label>
        <select id="filter-sort">
          ${SORT_OPTIONS.map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}
        </select>
      </div>

      <button type="button" class="filter-reset" id="filter-reset">Limpiar filtros</button>
    </div>
  `;

  const searchInput = container.querySelector('#filter-search');
  const regionsBox = container.querySelector('#filter-regions');
  const sortSelect = container.querySelector('#filter-sort');
  const resetButton = container.querySelector('#filter-reset');

  regionsBox.innerHTML = regions
    .map(
      (region) => `
      <label class="filter-region-chip">
        <input type="checkbox" value="${region}" checked />
        <span>${region}</span>
      </label>`
    )
    .join('');

  searchInput.value = filters.search;
  sortSelect.value = filters.sort;

  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => onChange({ search: searchInput.value.trim() }), 150);
  });

  regionsBox.addEventListener('change', () => {
    const checked = [...regionsBox.querySelectorAll('input:checked')].map((i) => i.value);
    onChange({ regions: checked });
  });

  sortSelect.addEventListener('change', () => onChange({ sort: sortSelect.value }));

  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    sortSelect.value = 'name-asc';
    regionsBox.querySelectorAll('input').forEach((i) => (i.checked = true));
    onChange({ search: '', sort: 'name-asc', regions: [...regions] });
  });
}
