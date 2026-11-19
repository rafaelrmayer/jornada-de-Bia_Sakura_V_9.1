/* Cartões de comunicação: integração externa opcional, sem histórico persistente. */
(function (root) {
  'use strict';
  const PHRASES = ['Quero comer.', 'Quero jogar Zelda: Ocarina of Time.', 'Quero descansar.', 'Quero desenhar.', 'Quero ouvir uma história.'];
  const ICONS = ['🍽️', '🎮', '🛋️', '🎨', '📖'];
  const FIXED = ['Quero outra coisa.', 'Não quero agora.'];
  function endpoint(value,model='cards-demo') {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Use um endereço HTTPS sem credenciais, parâmetros ou fragmentos.');
    if(!['cards-demo','cards-rf-demo'].includes(model))throw new Error('Modelo incompatível.');
    return url.href.replace(/\/$/, '') + (model==='cards-rf-demo'?'/v1/cards/random-forest/suggestions':'/v1/cards/suggestions');
  }
  function validate(data,model='cards-demo') {
    if (data?.model !== model || data.experimental !== true || data.synthetic_data !== true ||
        !Array.isArray(data.cards) || data.cards.length !== 5 ||
        new Set(data.cards.map(c => c?.id)).size !== 5 ||
        !data.cards.every(c => Number.isInteger(c?.id) && c.id >= 0 && c.id < 5 && PHRASES[c.id] === c.phrase) ||
        JSON.stringify(data.fixed_options) !== JSON.stringify(FIXED)) throw new Error('Resposta incompatível.');
    if(model==='cards-rf-demo'&&(data.version!=='1.0.0'||data.score_kind!=='tree_vote_fraction'||!data.cards.every(c=>Number.isFinite(c.score)&&c.score>=0&&c.score<=1)))throw new Error('Resposta RF incompatível.');
    return data.cards.map(c => c.id);
  }
  async function request(base, period, last, fetcher = root.fetch.bind(root), timeout = 5000, signal,model='cards-demo') {
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    signal?.addEventListener('abort', abort, {once:true});
    const timer = setTimeout(abort, timeout);
    try {
      const response = await fetcher(endpoint(base,model), {
        method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({period, last_activity: last}), signal: controller.signal
      });
      if (!response.ok) throw new Error('API indisponível.');
      return validate(await response.json(),model);
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
  }
  function validateOrder(order) {
    if (!Array.isArray(order) || order.length !== 5 || new Set(order).size !== 5 || !order.every(id=>Number.isInteger(id)&&id>=0&&id<5)) throw new Error('Ordem local incompatível.');
    return order;
  }
  async function resolveOrder({base, period, last, remote, online=true, local, fetcher, timeout=5000, signal,model='cards-demo'}) {
    if (signal?.aborted) throw new Error('Atualização cancelada.');
    if (remote && base && online) {
      try {
        const order = await request(base, ['manha','tarde','noite'][period], last, fetcher, timeout, signal,model);
        if (signal?.aborted) throw new Error('Atualização cancelada.');
        return {order, source:'remote'};
      } catch (error) { if (signal?.aborted) throw error; }
    }
    return {order:validateOrder(local()), source:'local'};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {endpoint, validate, request, resolveOrder};
  if (!root.document) return;
  const el = id => document.getElementById(id);
  const grid = el('neuralCards');
  if (!grid) return;
  let last = null, order = [0, 1, 2, 3, 4], revision = 0, activeRequest = null;
  const key = 'bia-card-api-url';
  const modeKey = 'bia-card-suggestion-mode';
  const status = text => { el('neuralCardsStatus').textContent = text; };
  function speak(phrase) {
    if (typeof root.speakText === 'function') root.speakText(phrase);
    el('neuralCardsChoice').textContent = 'Você escolheu: ' + phrase;
  }
  function cancelUpdate() {
    revision++;
    activeRequest?.abort(); activeRequest=null;
    el('neuralCardsSuggest').disabled=false;
  }
  function choose(button, phrase, id) {
    if(activeRequest){cancelUpdate();status('Escolha mantida. Você pode atualizar os cartões quando quiser.');}
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
    el('neuralCardsMode').value = ['remote','rf-remote'].includes(localStorage.getItem(modeKey))?localStorage.getItem(modeKey):'local';
  } catch {}
  el('neuralApiForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (!root.SecurityService?.isUnlocked?.()) {
      el('neuralApiConfigStatus').textContent = 'Desbloqueie a administração para configurar a conexão.'; return;
    }
    if (!await root.JBExperimentAccess?.authorize?.()) {
      el('neuralApiConfigStatus').textContent = 'Configuração disponível somente para a conta administradora autorizada.'; return;
    }
    const value = el('neuralApiUrl').value.trim();
    try {
      const mode = el('neuralCardsMode').value;
      if (['remote','rf-remote'].includes(mode))endpoint(value,mode==='rf-remote'?'cards-rf-demo':'cards-demo');
      localStorage.setItem(modeKey, mode);
      if (value) localStorage.setItem(key, value); else localStorage.removeItem(key);
      cancelUpdate();
      order = [0, 1, 2, 3, 4]; render();
      el('neuralApiConfigStatus').textContent = mode === 'local' ? 'Sugestões locais ativadas. Nenhum contexto é enviado à API.' : 'API selecionada. A conexão só ocorre ao solicitar sugestões.';
      status('Cartões disponíveis.');
    } catch (error) { el('neuralApiConfigStatus').textContent = error.message; }
  });
  el('neuralCardsSuggest').addEventListener('click', async () => {
    if(!await root.JBExperimentAccess?.authorize?.())return;
    let base, mode='local';
    try { base=localStorage.getItem(key); mode=localStorage.getItem(modeKey)||'local'; } catch {}
    cancelUpdate();
    const current=revision;
    const controller=new AbortController();activeRequest=controller;
    const hour=new Date().getHours();const period=hour<12?0:hour<18?1:2;
    const snapshotLast=last;
    el('neuralCardsSuggest').disabled=true;
    status(mode!=='local'?'Atualizando cartões…':'Processando neste aparelho…');
    try {
      const result=await resolveOrder({base,period,last:snapshotLast,remote:mode!=='local',model:mode==='rf-remote'?'cards-rf-demo':'cards-demo',online:root.navigator?.onLine!==false,signal:controller.signal,
        local:()=>{
          if(JSON.stringify(root.BiaCardModel?.phrases)!==JSON.stringify(PHRASES))throw new Error('Cartões incompatíveis.');
          return root.BiaCardInference.order(root.BiaCardModel,period,snapshotLast);
        }});
      if(current!==revision)return;
      order=result.order;render();
      el('neuralCardsStatus').dataset.source=result.source;
      status(result.source==='remote'?'Cartões atualizados pelo servidor.':mode!=='local'?'API indisponível. Usando a ordenação local existente.':'Cartões atualizados neste aparelho.');
    } catch {
      if(current===revision){el('neuralCardsStatus').dataset.source='preserved';status('Cartões mantidos. Você pode continuar escolhendo.');}
    } finally {
      if(current===revision){activeRequest=null;el('neuralCardsSuggest').disabled=false;}
    }
  });
  document.addEventListener('bia:admin-access-changed',()=>{if(!root.SecurityService?.isUnlocked?.())cancelUpdate();});
  document.addEventListener('bia:pagechange',()=>{if(activeRequest)cancelUpdate();});
  render();
})(typeof window === 'undefined' ? globalThis : window);
