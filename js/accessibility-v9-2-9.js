/* Jornada de Bia Sakura V9.2.9 — controles locais de acessibilidade. */
(() => {
  'use strict';
  const prefix = 'bia-a11y-v929-';
  const choices = {Large:'large', Contrast:'contrast', Touch:'touch', Calm:'calm', Confirm:'confirm'};
  const message = document.getElementById('biaA11yMessage');
  const announce = text => { if (message) message.textContent = text; };
  const read = key => { try { return localStorage.getItem(prefix + key) === 'true'; } catch { return false; } };
  const save = (key,value) => { try { localStorage.setItem(prefix + key, String(value)); } catch { announce('Não foi possível salvar a preferência neste aparelho.'); } };
  const apply = (key,value) => { document.documentElement.classList.toggle('bia-a11y-' + choices[key], value); };
  for (const key of Object.keys(choices)) {
    const input = document.getElementById('biaA11y' + key);
    if (!input) continue;
    input.checked = read(key); apply(key,input.checked);
    input.addEventListener('change', () => { apply(key,input.checked); save(key,input.checked); announce(input.checked ? 'Preferência ativada.' : 'Preferência desativada.'); });
  }
  document.getElementById('biaA11yReset')?.addEventListener('click', () => {
    for (const key of Object.keys(choices)) {
      const input = document.getElementById('biaA11y' + key);
      if (input) input.checked = false;
      apply(key,false); save(key,false);
    }
    announce('Preferências de acessibilidade restauradas.');
  });
  // Confirmação não invasiva: anuncia mudanças da frase sem substituir a fala escolhida.
  const phrase = document.getElementById('phrasePreviewText');
  if (phrase) {
    const notice = document.createElement('p'); notice.id = 'biaA11yPhraseNotice';
    notice.setAttribute('role','status'); notice.setAttribute('aria-live','polite');
    notice.hidden = !read('Confirm'); phrase.parentElement?.appendChild(notice);
    document.getElementById('biaA11yConfirm')?.addEventListener('change', event => {
      notice.hidden = !event.target.checked;
      if (event.target.checked) notice.textContent = 'Frase atual: ' + (phrase.textContent.trim() || 'vazia');
    });
    let old = phrase.textContent.trim();
    new MutationObserver(() => {
      const current = phrase.textContent.trim();
      if (current === old) return; old = current;
      if (read('Confirm')) notice.textContent = 'Frase atual: ' + (current || 'vazia');
    }).observe(phrase,{childList:true,subtree:true,characterData:true});
  }
})();
