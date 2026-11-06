/* Jornada de Bia Sakura V1.4 — proteção de sessão por inatividade.
 * Complementa o bloqueio local; não substitui autenticação validada no servidor.
 */
(() => {
  'use strict';
  const SESSION_KEY = 'jornadaBia:guardianSessionAt';
  const TIMEOUT_MS = 10 * 60 * 1000;
  let timer = null;

  const now = () => Date.now();
  const isUnlocked = () => window.SecurityService?.isUnlocked?.() === true;
  const clearTimer = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  };

  function lock() {
    clearTimer();
    try { window.SecurityService?.setSessionUnlocked?.(false); } catch (_) {}
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
    if (typeof window.setGuardianMode === 'function') window.setGuardianMode(false);
    document.dispatchEvent(new CustomEvent('jornadaBia:sessionExpired'));
  }

  function schedule() {
    clearTimer();
    if (!isUnlocked()) {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
      return;
    }
    const stamp = Number(sessionStorage.getItem(SESSION_KEY) || 0);
    if (!Number.isFinite(stamp) || stamp <= 0) {
      sessionStorage.setItem(SESSION_KEY, String(now()));
      timer = window.setTimeout(schedule, TIMEOUT_MS + 50);
      return;
    }
    const remaining = TIMEOUT_MS - (now() - stamp);
    if (remaining <= 0) { lock(); return; }
    timer = window.setTimeout(() => {
      const latest = Number(sessionStorage.getItem(SESSION_KEY) || 0);
      if (!latest || now() - latest >= TIMEOUT_MS) lock();
      else schedule();
    }, Math.max(250, remaining + 50));
  }

  function touch() {
    if (!isUnlocked()) {
      clearTimer();
      try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
      return;
    }
    try { sessionStorage.setItem(SESSION_KEY, String(now())); } catch (_) {}
    schedule();
  }

  // pointerdown cobre mouse/toque; keydown cobre navegação por teclado.
  ['pointerdown', 'keydown', 'click', 'touchstart'].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      if (isUnlocked()) touch();
    }, { passive: true, capture: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (!isUnlocked()) {
      clearTimer();
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    const stamp = Number(sessionStorage.getItem(SESSION_KEY) || 0);
    if (!stamp || now() - stamp >= TIMEOUT_MS) lock();
    else schedule();
  });

  window.addEventListener('pageshow', () => {
    if (isUnlocked()) {
      const stamp = Number(sessionStorage.getItem(SESSION_KEY) || 0);
      if (stamp && now() - stamp >= TIMEOUT_MS) lock();
      else touch();
    }
  });

  window.JornadaBiaSecurity = Object.freeze({ touch, lock, schedule, timeoutMs: TIMEOUT_MS });
  if (isUnlocked()) {
    const stamp = Number(sessionStorage.getItem(SESSION_KEY) || 0);
    if (stamp && now() - stamp >= TIMEOUT_MS) lock();
    else touch();
  }
})();
