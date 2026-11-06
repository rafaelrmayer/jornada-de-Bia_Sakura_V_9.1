/* Painel de Emoções - Jornada de Bia Sakura */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'jornadaBiaEmotionHistoryV1';
  const emotions = {
    feliz:'Estou feliz', triste:'Estou triste', bravo:'Estou bravo(a)',
    medo:'Estou com medo', cansado:'Estou cansado(a)', tranquilo:'Estou tranquilo(a)',
    dor:'Estou sentindo dor', ansioso:'Estou ansioso(a)'
  };
  let selected = null, intensity = 2;
  const readHistory = () => { try { const v=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(v)?v.slice(0,30):[]; } catch(_){return [];} };
  const writeHistory = list => { try { localStorage.setItem(KEY,JSON.stringify(list.slice(0,30))); } catch(_){} };
  function speak(text){
    if(typeof window.speakText==='function'){ window.speakText(text); return; }
    if('speechSynthesis' in window){ try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';window.speechSynthesis.speak(u);}catch(_){} }
  }
  function renderHistory(){
    const host=$('emotionHistory'); if(!host)return;
    const items=readHistory();
    host.innerHTML=items.length?items.map(x=>`<span class="emotion-history-item">${String(x.phrase).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))} · ${new Date(x.at).toLocaleDateString('pt-BR')}</span>`).join(''):'<p class="emotion-empty">Suas escolhas registradas aparecerão aqui.</p>';
  }
  function choose(button){
    selected=button.dataset.emotion;
    $('emotionSelectedTitle').textContent=emotions[selected]||button.dataset.phrase;
    $('emotionDetail').hidden=false;
    document.querySelectorAll('.emotion-card').forEach(b=>b.classList.toggle('is-selected',b===button));
    $('emotionDetail').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const grid=$('emotionGrid'); if(!grid)return;
    grid.addEventListener('click',e=>{const b=e.target.closest('[data-emotion]');if(b)choose(b);});
    document.querySelectorAll('[data-intensity]').forEach(b=>b.addEventListener('click',()=>{
      intensity=Number(b.dataset.intensity)||2;
      document.querySelectorAll('[data-intensity]').forEach(x=>x.classList.toggle('selected',x===b));
    }));
    $('emotionSpeak')?.addEventListener('click',()=>{if(selected)speak(emotions[selected]);});
    $('emotionSave')?.addEventListener('click',()=>{
      if(!selected)return;
      const list=readHistory();list.unshift({emotion:selected,phrase:emotions[selected],intensity,at:Date.now()});writeHistory(list);renderHistory();
      if(typeof window.showToast==='function')window.showToast('Escolha registrada com carinho');
    });
    $('emotionClear')?.addEventListener('click',()=>{$('emotionDetail').hidden=true;selected=null;document.querySelectorAll('.emotion-card').forEach(b=>b.classList.remove('is-selected'));});
    $('emotionHistoryClear')?.addEventListener('click',()=>{if(confirm('Deseja limpar o histórico de emoções deste dispositivo?')){writeHistory([]);renderHistory();}});
    renderHistory();
  });
})();