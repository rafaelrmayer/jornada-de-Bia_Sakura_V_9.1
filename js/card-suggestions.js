/* Cartões de comunicação: integração externa opcional, sem histórico persistente. */
(function (root) {
  'use strict';
  const PHRASES = ['Quero comer.', 'Quero jogar Zelda: Ocarina of Time.', 'Quero descansar.', 'Quero desenhar.', 'Quero ouvir uma história.'];
  const ICONS = ['🍽️', '🎮', '🛋️', '🎨', '📖'];
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
  }
  function choose(button, phrase, id) {
    last = id;
    document.querySelectorAll('#neuralCards button, #neuralCardsFixed button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    speak(phrase);
  }
  function render() {
    grid.replaceChildren();
    for (const id of order) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'neural-card';
      const icon = document.createElement('span');
      icon.className = 'friendly-card-icon'; icon.textContent = ICONS[id]; icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.className = 'friendly-card-label'; label.textContent = PHRASES[id];
      button.append(icon, label); button.dataset.cardId = String(id);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => choose(button, PHRASES[id], id));
      grid.appendChild(button);
    }
  }
  FIXED.forEach(phrase => {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'neural-card'; button.textContent = phrase;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => choose(button, phrase, null));
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
      order = [0, 1, 2, 3, 4]; render();
      el('neuralApiConfigStatus').textContent = mode === 'local' ? 'Sugestões locais ativadas. Nenhum contexto é enviado à API.' : 'API selecionada. A conexão só ocorre ao solicitar sugestões.';
      status('Cartões disponíveis.');
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
        status('Cartões atualizados.');
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
      order = next; render();
      status('Cartões atualizados.');
    } catch {
      if (current === revision) status('Não foi possível obter sugestões. Todos os cartões continuam disponíveis.');
    } finally { el('neuralCardsSuggest').disabled = false; }
  });
  document.addEventListener('bia:pagechange', event => {
    if (event.detail?.page !== 'cards') return;
    let mode = 'local';
    try { mode = localStorage.getItem(modeKey) || 'local'; } catch {}
    // Entrar na página nunca inicia envio automático para um serviço externo.
    if (mode !== 'remote') el('neuralCardsSuggest').click();
  });
  render();
})(typeof window === 'undefined' ? globalThis : window);
