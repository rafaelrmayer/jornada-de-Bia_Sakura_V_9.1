/* Jornada de Bia Sakura V9.2.8 — reforços não invasivos para tecnologias assistivas. */
(() => {
  'use strict';
  const describe = (el) => (el.getAttribute('aria-label') || el.innerText || el.textContent || '').trim();
  const syncNav = () => {
    document.querySelectorAll('.nav-item[data-page]').forEach(button => {
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  };
  // Mantém o estado da navegação disponível aos leitores de tela.
  syncNav();
  const nav = document.querySelector('.nav-menu');
  if (nav) new MutationObserver(syncNav).observe(nav, {subtree:true,attributes:true,attributeFilter:['class']});
  const bottom = document.querySelector('.visual-bottom-nav');
  if (bottom) new MutationObserver(syncNav).observe(bottom, {subtree:true,attributes:true,attributeFilter:['class']});
  // Botões sem nome acessível são sinalizados durante o desenvolvimento,
  // mas nunca recebem nomes genéricos que poderiam esconder o problema.
  document.querySelectorAll('button').forEach(button => {
    if (!describe(button) && !button.getAttribute('title')) {
      button.dataset.a11yReview = 'missing-name';
    }
  });
  // Mensagens de construção de frases são anunciadas de forma discreta.
  const phrase = document.getElementById('phrasePreviewText');
  if (phrase) {
    const status = document.createElement('div');
    status.id = 'a11yPhraseStatus';
    status.className = 'visually-hidden-accessible';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    phrase.parentElement?.appendChild(status);
    let previous = phrase.textContent.trim();
    new MutationObserver(() => {
      const current = phrase.textContent.trim();
      if (current !== previous) {
        previous = current;
        status.textContent = current ? 'Frase atual: ' + current : 'Frase vazia';
      }
    }).observe(phrase, {childList:true,subtree:true,characterData:true});
  }
})();
