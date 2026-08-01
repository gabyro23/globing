import { formatArea, formatPopulation } from '../format.js';
import { DND_MIME, makeDraggable } from '../dnd.js';

const MAX_COMPARE = 6;
const BAR_COLORS = ['#44a1a4', '#ff9a00', '#325e6a', '#224248', '#7fc4c6', '#ffbb52'];

function renderBarGroup(title, unitFormatter, countries) {
  const max = Math.max(...countries.map((c) => c.value), 1);
  const rows = countries
    .map(
      (c, i) => `
      <div class="compare-bar-row">
        <span class="compare-bar-row__label">${c.flag} ${c.name}</span>
        <div class="compare-bar-row__track">
          <div class="compare-bar-row__fill" style="width:${(c.value / max) * 100}%; background:${BAR_COLORS[i % BAR_COLORS.length]}"></div>
        </div>
        <span class="compare-bar-row__value">${unitFormatter(c.value)}</span>
      </div>`
    )
    .join('');
  return `<section class="compare-bars"><h3>${title}</h3>${rows}</section>`;
}

export function createCompareZone(container, { onDropAlpha3, onRemove, onReorder }) {
  container.innerHTML = `
    <div class="compare-zone">
      <div class="compare-zone__dropbox" id="compare-dropbox">
        <p class="compare-zone__hint">Arrastrá países acá (o hacé click en el mapa / la lista) para compararlos — hasta ${MAX_COMPARE}.</p>
        <div class="compare-zone__chips" id="compare-chips"></div>
      </div>
      <div class="compare-zone__charts" id="compare-charts"></div>
    </div>
  `;

  const dropbox = container.querySelector('#compare-dropbox');
  const chipsEl = container.querySelector('#compare-chips');
  const chartsEl = container.querySelector('#compare-charts');

  dropbox.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropbox.classList.add('is-dragover');
  });
  dropbox.addEventListener('dragleave', () => dropbox.classList.remove('is-dragover'));
  dropbox.addEventListener('drop', (event) => {
    event.preventDefault();
    dropbox.classList.remove('is-dragover');
    const alpha3 = event.dataTransfer.getData(DND_MIME) || event.dataTransfer.getData('text/plain');
    if (alpha3) onDropAlpha3(alpha3);
  });

  function render(selectedCountries) {
    if (selectedCountries.length >= MAX_COMPARE) {
      dropbox.classList.add('is-full');
    } else {
      dropbox.classList.remove('is-full');
    }

    chipsEl.innerHTML = '';
    selectedCountries.forEach((country, index) => {
      const chip = document.createElement('div');
      chip.className = 'compare-chip';
      chip.dataset.alpha3 = country.alpha3;
      chip.innerHTML = `
        <span>${country.flag} ${country.name}</span>
        <button type="button" class="compare-chip__remove" aria-label="Quitar ${country.name}">×</button>
      `;
      makeDraggable(chip, country.alpha3);
      chip.addEventListener('dragover', (event) => {
        event.preventDefault();
        const rect = chip.getBoundingClientRect();
        const before = event.clientX - rect.left < rect.width / 2;
        chip.classList.toggle('drop-before', before);
        chip.classList.toggle('drop-after', !before);
      });
      chip.addEventListener('dragleave', () => chip.classList.remove('drop-before', 'drop-after'));
      chip.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const draggedAlpha3 = event.dataTransfer.getData(DND_MIME) || event.dataTransfer.getData('text/plain');
        const before = chip.classList.contains('drop-before');
        chip.classList.remove('drop-before', 'drop-after');
        if (!draggedAlpha3) return;
        if (draggedAlpha3 === country.alpha3) return;
        onReorder(draggedAlpha3, index, before);
      });
      chip.querySelector('.compare-chip__remove').addEventListener('click', () => onRemove(country.alpha3));
      chipsEl.appendChild(chip);
    });

    if (selectedCountries.length === 0) {
      chartsEl.innerHTML = '<p class="compare-zone__empty">Todavía no elegiste países para comparar.</p>';
      return;
    }

    const population = selectedCountries.map((c) => ({ flag: c.flag, name: c.name, value: c.population }));
    const area = selectedCountries.map((c) => ({ flag: c.flag, name: c.name, value: c.area }));

    chartsEl.innerHTML =
      renderBarGroup('Población', formatPopulation, [...population].sort((a, b) => b.value - a.value)) +
      renderBarGroup('Superficie', formatArea, [...area].sort((a, b) => b.value - a.value));
  }

  return { render };
}
