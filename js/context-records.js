/* Memória contextual local: cada frase mantém sua própria contagem. */
(function (global) {
  'use strict';
  function trainingRecords(records) {
    const result = Object.create(null);
    for (const [key, row] of Object.entries(records || {})) {
      if (!row || typeof row !== 'object' || typeof row.text !== 'string' || !row.text.trim()) continue;
      const current = row.recordVersion === 2 && typeof row.contextKey === 'string';
      const count = current && Number.isFinite(row.count) && row.count > 0 ? Math.floor(row.count) : 1;
      result[key] = {...row, text: row.text.trim(), contextKey: current ? row.contextKey : key,
        count: Math.max(1, count)};
    }
    return result;
  }
  function record(records, contextKey, seq, phrase, now = Date.now()) {
    const text = String(phrase || '').trim();
    if (!text) return false;
    const base = contextKey + '|' + seq;
    // JSON preserva separadores e textos arbitrários sem colidir com chaves antigas.
    const key = 'v2:' + JSON.stringify([base, text]);
    const previous = records[key];
    const count = previous?.recordVersion === 2 && Number.isFinite(previous.count) && previous.count > 0 ? Math.floor(previous.count) : 0;
    records[key] = {recordVersion: 2, contextKey: base, text, seq, count: count + 1, lastUsed: now};
    return true;
  }
  function signature(records) {
    return JSON.stringify(Object.entries(trainingRecords(records)).sort(([a],[b])=>a.localeCompare(b)));
  }
  function summary(records) {
    const rows = Object.values(trainingRecords(records));
    return {
      rows: rows.length,
      verifiedChoices: rows.filter(r=>r.recordVersion===2).reduce((sum,r)=>sum+r.count,0),
      legacyRows: rows.filter(r=>r.recordVersion!==2).length,
      classes: new Set(rows.map(r=>r.text)).size
    };
  }
  global.JornadaContextRecords = {record, trainingRecords, signature, summary};
})(window);
