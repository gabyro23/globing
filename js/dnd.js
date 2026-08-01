// Shared drag-and-drop contract between the country list, the map and the compare zone.
export const DND_MIME = 'application/x-country-alpha3';

export function makeDraggable(el, alpha3) {
  el.draggable = true;
  el.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData(DND_MIME, alpha3);
    event.dataTransfer.setData('text/plain', alpha3);
    event.dataTransfer.effectAllowed = 'copyMove';
    el.classList.add('is-dragging');
  });
  el.addEventListener('dragend', () => el.classList.remove('is-dragging'));
}

export function readDraggedAlpha3(event) {
  return event.dataTransfer.getData(DND_MIME) || event.dataTransfer.getData('text/plain');
}
