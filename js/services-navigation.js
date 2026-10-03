/* Ordinary links plus a disclosure button, not an application-style ARIA menu. */
(function () {
  'use strict';
  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  function setPixels(name, value) {
    var pixels = Math.ceil(value) + 'px';
    if (root.style.getPropertyValue(name) !== pixels) root.style.setProperty(name, pixels);
  }
  function syncHeader() {
    if (!header) return; // Do not alter the legacy homepage/contact affix behavior.
    var bounds = header.getBoundingClientRect();
    var list = header.querySelector('.services-submenu');
    var menuHeight = 0;
    if (list && !list.hidden && getComputedStyle(list).position === 'static') {
      var style = getComputedStyle(list);
      menuHeight = list.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }
    var baseHeight = Math.max(0, bounds.height - menuHeight);
    // At extreme zoom/short heights, let the header scroll rather than cover the page.
    var pinned = baseHeight <= window.innerHeight * 0.6;
    root.classList.toggle('services-header-ready', pinned);
    setPixels('--service-header-base', baseHeight);
    setPixels('--service-header-offset', pinned ? bounds.height : 0);
    var row = header.querySelector('.services-nav-row');
    setPixels('--service-menu-top', row ? row.getBoundingClientRect().bottom - bounds.top : baseHeight);
  }
  document.querySelectorAll('.services-nav-item').forEach(function (item) {
    var button = item.querySelector('.services-nav-toggle');
    var list = item.querySelector('.services-submenu');
    if (!button || !list) return;
    function setOpen(open, returnFocus) {
      list.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Hide services menu' : 'Show services menu');
      if (returnFocus) button.focus();
      syncHeader();
    }
    setOpen(false);
    item.classList.add('services-nav-ready');
    button.hidden = false;
    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });
    item.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !list.hidden) {
        event.preventDefault();
        setOpen(false, true);
      }
      if (event.target === button && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        setOpen(true);
        var links = list.querySelectorAll('a');
        var link = links[event.key === 'ArrowDown' ? 0 : links.length - 1];
        if (link) link.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (!item.contains(event.target)) setOpen(false);
    });
    item.addEventListener('focusout', function (event) {
      if (!item.contains(event.relatedTarget)) setOpen(false);
    });
    item.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    var previousWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth !== previousWidth) {
        var focusInMenu = list.contains(document.activeElement);
        setOpen(false, focusInMenu);
        previousWidth = window.innerWidth;
      }
      syncHeader();
    });
  });
  syncHeader();
  if (header && typeof ResizeObserver !== 'undefined') new ResizeObserver(syncHeader).observe(header);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeader);
  window.addEventListener('load', syncHeader);
}());
