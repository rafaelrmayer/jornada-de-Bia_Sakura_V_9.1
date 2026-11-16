/* Jornada de Bia — Resumo semanal para a fono (lê JBWordGoals.getState()).
 * Troque getData() quando os registros vierem do servidor. */
(function () {
  'use strict';
  var NOTE_KEY = 'jb_word_summary_note_v1';
  var DAYS = 7;
  var CTX = { home: '🏠 Casa', school: '🏫 Escola', outing: '🌳 Passeio' };

  function getData() { return window.JBWordGoals ? window.JBWordGoals.getState() : { goals: [] }; }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function fmt(ts) { return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }

  function aggregate() {
    var since = Date.now() - DAYS * 86400000, st = getData(), out = { since: since, total: 0, alone: 0, help: 0, ctx: {}, words: [], conquered: [] };
    st.goals.forEach(function (g) {
      var a = 0, h = 0;
      g.logs.forEach(function (l) {
        if (l.ts < since) return;
        if (l.mode === 'alone') { a++; out.ctx[l.ctx] = (out.ctx[l.ctx] || 0) + 1; } else h++;
      });
      if (g.conquered && g.conqueredAt >= since) out.conquered.push(g.word);
      if (a + h > 0 || !g.conquered) out.words.push({ word: g.word, alone: a, help: h, conquered: !!g.conquered });
      out.alone += a; out.help += h;
    });
    out.total = out.alone + out.help;
    return out;
  }

  function note() { try { return localStorage.getItem(NOTE_KEY) || ''; } catch (e) { return ''; } }

  function asText(d) {
    var L = ['Resumo da semana — Bia (' + fmt(d.since) + ' a ' + fmt(Date.now()) + ')',
      'Usos: ' + d.total + ' (sozinha: ' + d.alone + ', com ajuda: ' + d.help + ')'];
    d.words.forEach(function (w) { L.push('• ' + w.word + ': ' + w.alone + ' sozinha, ' + w.help + ' com ajuda' + (w.conquered ? ' 🌸' : '')); });
    var c = Object.keys(d.ctx).map(function (k) { return (CTX[k] || k).replace(/^\S+\s/, '') + ' ' + d.ctx[k]; });
    if (c.length) L.push('Onde usou sozinha: ' + c.join(', '));
    if (d.conquered.length) L.push('Conquistadas: ' + d.conquered.join(', '));
    if (note().trim()) L.push('Observações: ' + note().trim());
    return L.join('\n');
  }

  function render() {
    var root = document.getElementById('wgSummary');
    if (!root) return;
    var d = aggregate();
    root.textContent = '';
    root.appendChild(el('h3', null, '📋 Resumo da semana'));
    root.appendChild(el('p', 'wg-hint', fmt(d.since) + ' a ' + fmt(Date.now())));

    var nums = el('div', 'ws-nums');
    [['Total', d.total], ['Sozinha', d.alone], ['Com ajuda', d.help]].forEach(function (x) {
      var b = el('div', 'ws-num'); b.appendChild(el('strong', null, String(x[1]))); b.appendChild(el('small', null, x[0])); nums.appendChild(b);
    });
    root.appendChild(nums);

    if (!d.total) root.appendChild(el('p', 'wg-hint', 'Ainda não há registros nesta semana.'));
    var max = Math.max.apply(null, d.words.map(function (w) { return w.alone + w.help; }).concat([1]));
    d.words.forEach(function (w) {
      var row = el('div', 'ws-row');
      row.appendChild(el('span', 'ws-word', w.word + (w.conquered ? ' 🌸' : '')));
      var bar = el('div', 'ws-bar'); bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', w.alone + ' sozinha, ' + w.help + ' com ajuda');
      var a = el('span', 'ws-a'); a.style.width = (w.alone / max * 100) + '%';
      var h = el('span', 'ws-h'); h.style.width = (w.help / max * 100) + '%';
      bar.appendChild(a); bar.appendChild(h); row.appendChild(bar);
      row.appendChild(el('small', null, w.alone + ' / ' + w.help));
      root.appendChild(row);
    });
    if (d.total) root.appendChild(el('p', 'wg-hint', 'Verde escuro: sozinha · verde claro: com ajuda'));

    var ck = Object.keys(d.ctx);
    if (ck.length) {
      root.appendChild(el('h4', null, 'Onde usou sozinha'));
      var t = el('div', 'wg-tags'); ck.forEach(function (k) { t.appendChild(el('span', 'wg-tag', (CTX[k] || k) + ' · ' + d.ctx[k])); }); root.appendChild(t);
    }

    var lab = el('label', 'ws-note', 'Observações para a fono ');
    var ta = el('textarea'); ta.rows = 4; ta.maxLength = 600; ta.value = note();
    ta.addEventListener('input', function () { try { localStorage.setItem(NOTE_KEY, ta.value); } catch (e) {} });
    lab.appendChild(ta); root.appendChild(lab);

    var acts = el('div', 'wg-actions ws-noprint');
    var wa = el('button', 'wg-btn', '💬 WhatsApp'); wa.type = 'button';
    wa.addEventListener('click', function () { window.open('https://wa.me/?text=' + encodeURIComponent(asText(aggregate())), '_blank', 'noopener'); });
    var pdf = el('button', 'wg-btn', '📄 PDF / Imprimir'); pdf.type = 'button';
    pdf.addEventListener('click', function () {
      document.body.classList.add('wg-printing');
      var done = function () { document.body.classList.remove('wg-printing'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done); window.print();
    });
    acts.appendChild(wa); acts.appendChild(pdf); root.appendChild(acts);
  }

  function init() {
    var btn = document.getElementById('wgSummaryToggle'), root = document.getElementById('wgSummary');
    if (!btn || !root) return;
    btn.addEventListener('click', function () {
      var open = root.hidden; root.hidden = !open; btn.setAttribute('aria-expanded', open);
      if (open) render();
    });
    if (window.JBWordGoals) window.JBWordGoals.onChange(function () { if (!root.hidden) render(); });
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
