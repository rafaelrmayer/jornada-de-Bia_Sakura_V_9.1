/* Cartões de comunicação: integração externa opcional, sem histórico persistente. */
(function (root) {
  'use strict';
  const PHRASES = ['Quero comer.', 'Quero jogar Zelda: Ocarina of Time.', 'Quero descansar.', 'Quero desenhar.', 'Quero ouvir uma história.'];
  const FIXED = ['Quero outra coisa.', 'Não quero agora.'];
  function endpoint(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Use um endereço HTTPS sem credenciais, parâmetros ou fragmentos.');
    return url.href.replace(/\/$/, '') + '/v1/cards/suggestions';
  }
  function validate(data) {
    if (data?.model !== 'cards-demo' || data.experimental !== true || data.synthetic_data !== true ||
        !Array.isArray(data.cards) || data.cards.length !== 5 ||
        new Set(data.cards.map(c => c?.id)).size !== 5 ||
        !data.cards.every(c => Number.isInteger(c?.id) && c.id >= 0 && c.id < 5 && PHRASES[c.id] === c.phrase) ||
        JSON.stringify(data.fixed_options) !== JSON.stringify(FIXED)) throw new Error('Resposta incompatível.');
    return data.cards.map(c => c.id);
  }
  async function request(base, period, last, fetcher = root.fetch.bind(root), timeout = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetcher(endpoint(base), {
        method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({period, last_activity: last}), signal: controller.signal
      });
      if (!response.ok) throw new Error('API indisponível.');
      return validate(await response.json());
    } finally { clearTimeout(timer); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {endpoint, validate, request};
  if (!root.document) return;
  const el = id => document.getElementById(id);
  const grid = el('neuralCards');
  if (!grid) return;
  let last = null, order = [0, 1, 2, 3, 4], revision = 0;
  const key = 'bia-card-api-url';
  const modeKey = 'bia-card-suggestion-mode';
  const status = text => { el('neuralCardsStatus').textContent = text; };
  function speak(phrase) {
    if (typeof root.speakText === 'function') root.speakText(phrase);
    el('neuralCardsChoice').textContent = 'Você escolheu: ' + phrase;
    el('homeModelCardsChoice').textContent = 'Você escolheu: ' + phrase;
  }
  function clearHome() {
    el('homeModelCards').hidden = true;
    el('cardSuggestionNotice').hidden = true;
  }
  function publishHome() {
    const homeGrid = el('homeModelCardsGrid');
    homeGrid.replaceChildren();
    for (const id of order) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'neural-card';
      button.textContent = PHRASES[id]; button.dataset.homeCardId = String(id);
      button.addEventListener('click', () => { last = id; speak(PHRASES[id]); });
      homeGrid.appendChild(button);
    }
    const fixed = el('homeModelCardsFixed');
    fixed.replaceChildren();
    for (const phrase of FIXED) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'neural-card'; button.textContent = phrase;
      button.addEventListener('click', () => { last = null; speak(phrase); });
      fixed.appendChild(button);
    }
    el('homeModelCardsChoice').textContent = '';
    el('homeModelCards').hidden = false;
    el('cardSuggestionNotice').hidden = false;
  }
  el('homeModelCardsHide').addEventListener('click', () => {
    clearHome();
    document.querySelector('#page-home .intent-btn')?.focus();
  });
  el('cardSuggestionDismiss').addEventListener('click', () => {
    el('cardSuggestionNotice').hidden = true;
    el('neuralCardsSuggest').focus();
  });
  el('cardSuggestionOpen').addEventListener('click', () => {
    el('cardSuggestionNotice').hidden = true;
    if (typeof root.showPage === 'function') root.showPage('home');
    setTimeout(() => {
      el('homeModelCards').scrollIntoView({block: 'start'});
      el('homeModelCardsGrid').querySelector('button')?.focus();
    }, 0);
  });
  function render() {
    grid.replaceChildren();
    for (const id of order) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'neural-card';
      button.textContent = PHRASES[id]; button.dataset.cardId = String(id);
      button.addEventListener('click', () => { last = id; speak(PHRASES[id]); });
      grid.appendChild(button);
    }
  }
  FIXED.forEach(phrase => {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'neural-card'; button.textContent = phrase;
    button.addEventListener('click', () => { last = null; speak(phrase); });
    el('neuralCardsFixed').appendChild(button);
  });
  try {
    el('neuralApiUrl').value = localStorage.getItem(key) || '';
    el('neuralCardsMode').value = localStorage.getItem(modeKey) === 'remote' ? 'remote' : 'local';
  } catch {}
  el('neuralApiForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!root.SecurityService?.isUnlocked?.()) {
      el('neuralApiConfigStatus').textContent = 'Desbloqueie a administração para configurar a conexão.'; return;
    }
    const value = el('neuralApiUrl').value.trim();
    try {
      const mode = el('neuralCardsMode').value;
      if (mode === 'remote') endpoint(value);
      localStorage.setItem(modeKey, mode);
      if (value) localStorage.setItem(key, value); else localStorage.removeItem(key);
      revision++;
      clearHome();
      order = [0, 1, 2, 3, 4]; render();
      el('neuralApiConfigStatus').textContent = mode === 'local' ? 'Sugestões locais ativadas. Nenhum contexto é enviado à API.' : 'API selecionada. A conexão só ocorre ao solicitar sugestões.';
      status('Cartões em ordem padrão.');
    } catch (error) { el('neuralApiConfigStatus').textContent = error.message; }
  });
  el('neuralCardsSuggest').addEventListener('click', async () => {
    let base, mode = 'local';
    try { base = localStorage.getItem(key); mode = localStorage.getItem(modeKey) || 'local'; } catch {}
    const hour = new Date().getHours();
    const period = hour < 12 ? 0 : hour < 18 ? 1 : 2;
    if (mode !== 'remote') {
      try {
        if (JSON.stringify(root.BiaCardModel?.phrases) !== JSON.stringify(PHRASES)) throw new Error('Cartões incompatíveis.');
        order = root.BiaCardInference.order(root.BiaCardModel, period, last);
        render();
        publishHome();
        status('Sugestões calculadas neste aparelho com dados fictícios. Você escolhe o que comunicar.');
      } catch { status('Sugestões locais indisponíveis. Todos os cartões continuam disponíveis.'); }
      return;
    }
    if (!base) { status('Cartões disponíveis em ordem padrão. A conexão pode ser configurada em Configurações.'); return; }
    const current = ++revision;
    el('neuralCardsSuggest').disabled = true;
    status('Buscando sugestões de demonstração…');
    try {
      const next = await request(base, hour < 12 ? 'manha' : hour < 18 ? 'tarde' : 'noite', last);
      if (current !== revision) return;
      order = next; render(); publishHome();
      status('Ordem sugerida por modelo com dados fictícios. Você escolhe o que comunicar.');
    } catch {
      if (current === revision) status('Não foi possível obter sugestões. Todos os cartões continuam disponíveis.');
    } finally { el('neuralCardsSuggest').disabled = false; }
  });
  render();
})(typeof window === 'undefined' ? globalThis : window);
