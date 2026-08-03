// Falls back to a text wordmark if assets/logo.svg hasn't been added yet.
export function initSiteHeader() {
  const logo = document.querySelector('.site-header__logo');
  if (!logo) return;

  const fallbackToWordmark = () => {
    const wordmark = document.createElement('span');
    wordmark.className = 'site-header__wordmark';
    wordmark.textContent = 'globeing';
    logo.replaceWith(wordmark);
  };

  // The <img> starts fetching as soon as the HTML parses, so by the time this
  // module runs the error may have already fired — check the loaded state too.
  if (logo.complete && logo.naturalWidth === 0) {
    fallbackToWordmark();
  } else {
    logo.addEventListener('error', fallbackToWordmark, { once: true });
  }
}
