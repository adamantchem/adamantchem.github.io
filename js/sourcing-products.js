/* Progressive enhancement: all category text and enquiries exist in the HTML. */
(() => {
  'use strict';
  const root = document.querySelector('.sourcing-explorer');
  if (!root) return;
  const cards = Array.from(root.querySelectorAll('.product-card'));
  const links = Array.from(root.querySelectorAll('[data-category-link]'));
  const selector = root.querySelector('#category-select');
  const allButton = root.querySelector('.explore-all');
  const status = root.querySelector('#category-status');
  const valid = new Set(cards.map(card => card.dataset.category));
  const products = new Map(cards.flatMap(card => Array.from(card.querySelectorAll('.sourcing-product'), product => [product.id, { product, category: card.dataset.category }])));
  let expanded = false;
  root.classList.add('explorer-ready');
  root.querySelector('.mobile-category-control').hidden = false;

  function applySelection(category, moveFocus = false) {
    if (!valid.has(category)) category = 'all';
    root.classList.toggle('category-selected', category !== 'all');
    cards.forEach(card => {
      card.hidden = category === 'all' ? !expanded && !card.hasAttribute('data-featured') : card.dataset.category !== category;
      const details = card.querySelector('details');
      if (category !== 'all') details.open = !card.hidden;
      else details.open = false;
    });
    links.forEach(link => {
      if (link.dataset.categoryLink === category) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    selector.value = category;
    allButton.hidden = category !== 'all' || expanded;
    root.querySelectorAll('[data-product-select]').forEach(control => { control.value = products.has(location.hash.slice(1)) ? location.hash.slice(1) : ''; });
    const selected = cards.find(card => card.dataset.category === category);
    status.textContent = selected ? 'Showing ' + selected.querySelector('.product-category').textContent + ': ' + selected.querySelectorAll('.sourcing-product').length + ' illustrated products with materials, customisation options and sample-review details.' : (expanded ? 'Showing all 15 product categories.' : 'Showing four featured collections. Choose any of 15 categories or explore all.');
    if (moveFocus && selected) {
      const heading = selected.querySelector('h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      selected.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
  function focusProduct(product) {
    const heading = product.querySelector('h3');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    product.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  function fromHash() {
    const hash = location.hash.slice(1);
    const target = products.get(hash);
    if (target) {
      applySelection(target.category);
      focusProduct(target.product);
      return;
    }
    if (hash === 'collection-grid') expanded = true;
    const category = hash.startsWith('brief-') ? hash.slice(6) : hash;
    applySelection(valid.has(category) ? category : 'all', valid.has(category));
    if (hash.startsWith('brief-') && valid.has(category)) document.getElementById(hash).open = true;
  }
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const category = link.dataset.categoryLink;
    if (category === 'all') expanded = true;
    history.pushState(null, '', category === 'all' ? '#collection-grid' : '#' + category);
    applySelection(category, category !== 'all');
    if (category === 'all') document.getElementById('collection-grid').scrollIntoView({block: 'start', behavior: 'instant'});
  }));
  root.querySelectorAll('[data-product-link]').forEach(link => link.addEventListener('click', event => {
    const target = products.get(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    applySelection(target.category);
    focusProduct(target.product);
  }));
  root.querySelectorAll('[data-product-select]').forEach(control => control.addEventListener('change', () => {
    const target = products.get(control.value);
    if (!target) return;
    history.pushState(null, '', '#' + control.value);
    applySelection(target.category);
    focusProduct(target.product);
  }));
  selector.addEventListener('change', () => {
    if (selector.value === 'all') expanded = true;
    history.pushState(null, '', selector.value === 'all' ? '#collection-grid' : '#' + selector.value);
    applySelection(selector.value, true);
  });
  allButton.addEventListener('click', () => {
    expanded = true;
    applySelection('all');
    const next = cards.find(card => !card.hasAttribute('data-featured'));
    const heading = next.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    next.scrollIntoView({block: 'start', behavior: 'instant'});
  });
  root.querySelectorAll('[data-discuss]').forEach(link => link.addEventListener('click', () => {
    const details = document.getElementById('brief-' + link.dataset.discuss);
    details.open = true;
  }));
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('popstate', fromHash);
  fromHash();
})();
