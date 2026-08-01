import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';
import { formatArea, formatPopulation } from '../format.js';

const METRIC_LABEL = { population: 'Población', area: 'Superficie' };

export function createMapView(container, { world, countries, metric, selectedAlpha3, onToggleCountry, onDropAlpha3 }) {
  const normalizeId = (id) => String(Number(id));
  const byId = new Map(countries.map((c) => [normalizeId(c.id), c]));
  const land = topojson.feature(world, world.objects.countries).features.filter((f) => byId.has(normalizeId(f.id)));
  const countryOf = (feature) => byId.get(normalizeId(feature.id));

  const width = 960;
  const height = 520;
  const projection = d3.geoNaturalEarth1().fitSize([width - 16, height - 16], { type: 'FeatureCollection', features: land });
  const path = d3.geoPath(projection);

  container.innerHTML = '';
  const wrapper = d3.select(container).append('div').attr('class', 'map-view');

  const tooltip = wrapper.append('div').attr('class', 'map-tooltip').attr('hidden', true);

  const svg = wrapper
    .append('svg')
    .attr('class', 'map-view__svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Mapa mundial interactivo de países');

  const zoomLayer = svg.append('g');

  zoomLayer
    .append('rect')
    .attr('class', 'map-view__ocean')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height);

  const tealInterpolator = d3.interpolateRgb('#d7f0ea', '#0f4a44');
  let colorScale = () => '#cbd5e1';
  function updateColorScale() {
    const values = countries.map((c) => c[metric]).filter((v) => v != null);
    colorScale = d3.scaleSequentialLog(tealInterpolator).domain([d3.min(values), d3.max(values)]);
  }
  updateColorScale();

  const countryPaths = zoomLayer
    .selectAll('path.country')
    .data(land, (d) => d.id)
    .join('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', (d) => colorScale(countryOf(d)[metric] ?? 0))
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => countryOf(d).name)
    .on('click', (event, d) => onToggleCountry(countryOf(d).alpha3))
    .on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggleCountry(countryOf(d).alpha3);
      }
    })
    .on('mousemove', (event, d) => {
      const c = countryOf(d);
      const [x, y] = d3.pointer(event, container);
      tooltip
        .attr('hidden', null)
        .style('left', `${x + 14}px`)
        .style('top', `${y + 10}px`)
        .html(`<strong>${c.flag} ${c.name}</strong><br>${formatPopulation(c.population)}<br>${formatArea(c.area)}`);
    })
    .on('mouseleave', () => tooltip.attr('hidden', true));

  function refreshSelection() {
    countryPaths.classed('is-selected', (d) => selectedAlpha3.has(countryOf(d).alpha3));
  }
  refreshSelection();

  // Zoom & pan
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', (event) => zoomLayer.attr('transform', event.transform));
  svg.call(zoom);

  // Native HTML5 drag-and-drop: the map itself is also a drop target,
  // so a card from the country list can be dropped straight onto it.
  container.addEventListener('dragover', (event) => event.preventDefault());
  container.addEventListener('drop', (event) => {
    event.preventDefault();
    onDropAlpha3?.(event);
  });

  const legend = wrapper.append('div').attr('class', 'map-legend');
  legend.append('span').attr('class', 'map-legend__label').text(`${METRIC_LABEL[metric]} (escala logarítmica)`);
  const gradientId = 'map-legend-gradient';
  const legendSvg = legend.append('svg').attr('width', 160).attr('height', 14);
  const defs = legendSvg.append('defs');
  const gradient = defs.append('linearGradient').attr('id', gradientId);
  gradient
    .selectAll('stop')
    .data(d3.range(0, 1.01, 0.1))
    .join('stop')
    .attr('offset', (d) => `${d * 100}%`)
    .attr('stop-color', (d) => tealInterpolator(d));
  legendSvg.append('rect').attr('width', 160).attr('height', 14).attr('fill', `url(#${gradientId})`).attr('rx', 3);
  legend.append('span').attr('class', 'map-legend__hint').text('menor → mayor');

  return {
    setMetric(nextMetric) {
      metric = nextMetric;
      updateColorScale();
      countryPaths.transition().duration(300).attr('fill', (d) => colorScale(countryOf(d)[metric] ?? 0));
      legend.select('.map-legend__label').text(`${METRIC_LABEL[metric]} (escala logarítmica)`);
    },
    setSelection(nextSelected) {
      selectedAlpha3 = nextSelected;
      refreshSelection();
    },
    setFilteredAlpha3(alpha3Set) {
      countryPaths.classed('is-dimmed', (d) => alpha3Set && !alpha3Set.has(countryOf(d).alpha3));
    },
  };
}
