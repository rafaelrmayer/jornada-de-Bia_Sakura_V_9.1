/* Reserva espaço para a navegação fixa e para o aviso opcional de instalação. */
(() => {
  'use strict';
  const nav = document.querySelector('.visual-bottom-nav');
  const banner = document.getElementById('installBanner');
  function update() {
    document.documentElement.style.setProperty('--bia-bottom-nav-height', (nav?.getBoundingClientRect().height || 0) + 'px');
    document.documentElement.style.setProperty('--bia-install-banner-height', (banner?.getBoundingClientRect().height || 0) + 'px');
  }
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(update);
    if (nav) observer.observe(nav);
    if (banner) observer.observe(banner);
  }
  window.addEventListener('resize', update);
  update();
})();
