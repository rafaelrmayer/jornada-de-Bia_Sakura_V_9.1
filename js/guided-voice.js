/* Exploração local opcional. Só a confirmação encaminha a ação original. */
(function(root){
 'use strict';
 const KEY='bia-guided-voice-v1';
 const defaults={enabled:false,focus:false,rate:0.9,volume:0.8,voice:''};
 function normalize(value){
  const v=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const bounded=(n,min,max,fallback)=>typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
  return {enabled:v.enabled===true,focus:v.focus===true,rate:bounded(v.rate,0.5,1.5,defaults.rate),
   volume:bounded(v.volume,0,1,defaults.volume),voice:typeof v.voice==='string'&&v.voice.length<=200?v.voice:''};
 }
 const localVoices=voices=>Array.from(voices||[]).filter(v=>v.localService===true);
 function chooseVoice(voices,uri){
  const local=localVoices(voices);
  return local.find(v=>v.voiceURI===uri)||local.find(v=>/^pt[-_]br$/i.test(v.lang))||local.find(v=>/^pt/i.test(v.lang))||local[0]||null;
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={KEY,normalize,localVoices,chooseVoice};
 if(!root.document)return;
 const doc=root.document,$=id=>doc.getElementById(id);
 if(!$('guidedVoiceEnabled'))return;
 let prefs=normalize(),pending=null,forwarding=null,owned=null,timer=null,suppressFocus=false;
 try{prefs=normalize(JSON.parse(root.localStorage.getItem(KEY)||'null'));}catch{}
 const panel=$('guidedVoicePanel'),selection=$('guidedVoiceSelection'),status=$('guidedVoiceStatus');
 const synth=root.speechSynthesis;
 function sayStatus(text){if(status.textContent!==text)status.textContent=text;const note=$('guidedVoicePanelStatus');if(note.textContent!==text)note.textContent=text;}
 function voices(){try{return synth?localVoices(synth.getVoices()):[];}catch{return [];}}
 function stopPreview(){
  if(timer!==null){root.clearTimeout(timer);timer=null;}
  if(owned){owned.onend=null;owned.onerror=null;owned=null;try{synth.cancel();}catch{}}
 }
 function page(){return doc.querySelector('.page-section.active');}
 function available(element){
  return !!element&&element.isConnected&&!element.disabled&&element.getAttribute('aria-disabled')!=='true'&&
   !element.closest('[hidden], [aria-hidden="true"]')&&element.getClientRects().length>0&&element.closest('.page-section')===page();
 }
 function action(element){
  if(!element?.closest)return null;
  const node=element.closest('#myCommPhraseList [data-speak], #myCommMostUsedGrid [data-speak], #neuralCards .neural-card, #neuralCardsFixed .neural-card, #symbolsGrid .symbol-card, #homeQuickSymbolsGrid .home-quick-symbol-card, #quickPhrasesGrid .quick-phrase-btn, #predictiveList .predictive-item, .bia-maybe-choice, #mostUsedGrid .most-used-card, #suggestionsList .suggestion-item, #adaptiveChoices .adaptive-choice, #hereBtn');
  if(!available(node))return null;
  let label='',verb='Comunicar';
  if(node.hasAttribute('data-speak'))label=node.closest('.my-comm-item')?.querySelector('.my-comm-item-text strong')?.textContent;
  else if(node.classList.contains('symbol-card')||node.classList.contains('home-quick-symbol-card')){label=node.querySelector('.label')?.textContent;verb='Usar símbolo';}
  else if(node.classList.contains('most-used-card')){label=node.querySelector('.label')?.textContent;verb='Usar símbolo';}
  else if(node.classList.contains('suggestion-item')||node.classList.contains('adaptive-choice')){label=node.dataset.guidedLabel;verb='Usar sugestão';}
  else if(node.id==='hereBtn')label='Eu estou aqui.';
  else if(node.classList.contains('quick-phrase-btn'))label=node.dataset.phrase;
  else if(node.classList.contains('predictive-item'))label=node.querySelector('.pi-body strong')?.textContent;
  else if(node.classList.contains('bia-maybe-choice')){label=node.dataset.guidedLabel;verb='Usar sugestão';}
  else label=node.querySelector('.friendly-card-label')?.textContent||node.textContent;
  label=String(label||'').trim();
  return label?{node,label,verb}:null;
 }
 function focusWithoutPreview(node){
  if(!available(node))return;
  suppressFocus=true;try{node.focus({preventScroll:true});}finally{suppressFocus=false;}
 }
 function clearChoice(restore=false){
  const previous=pending;pending=null;previous?.node.classList.remove('guided-voice-selected');
  $('guidedVoiceActions').hidden=true;$('guidedVoicePanelStatus').textContent='';selection.textContent='Escolha um cartão ou frase para explorar.';
  if(restore&&previous)focusWithoutPreview(previous.node);
 }
 function readLabel(label){
  const wasOwned=!!owned;stopPreview();
  if(root.JBVoiceActivity?.isSpeaking?.()||(synth?.speaking&&!wasOwned)){sayStatus('Aguarde a comunicação terminar antes de ouvir a prévia.');return;}
  const voice=chooseVoice(voices(),prefs.voice);
  if(!synth||!root.SpeechSynthesisUtterance||!voice){sayStatus('Nenhuma voz local disponível. Confira as vozes instaladas no aparelho. A confirmação visual continua disponível.');return;}
  if(prefs.volume===0){sayStatus('O volume da voz guiada está em zero.');return;}
  try{
   const utterance=new root.SpeechSynthesisUtterance(label);
   utterance.voice=voice;utterance.lang=voice.lang||'pt-BR';utterance.rate=prefs.rate;utterance.volume=prefs.volume;utterance.pitch=1;owned=utterance;
   utterance.onend=()=>{if(owned===utterance)owned=null;};
   utterance.onerror=event=>{if(owned!==utterance)return;owned=null;if(!['canceled','interrupted'].includes(event.error))sayStatus('A prévia não iniciou. Tente Ouvir nome novamente e confira a voz do aparelho.');};
   synth.speak(utterance);
  }catch{owned=null;sayStatus('Não foi possível iniciar a voz local neste navegador.');}
 }
 function scheduleLabel(label){
  stopPreview();timer=root.setTimeout(()=>{timer=null;if(prefs.enabled&&prefs.focus&&!doc.hidden)readLabel(label);},180);
 }
 function selectChoice(item,keyboard){
  stopPreview();clearChoice();pending=item;item.node.classList.add('guided-voice-selected');
  selection.textContent=item.verb+': '+item.label;$('guidedVoiceActions').hidden=false;
  sayStatus('Você pode ouvir, confirmar ou cancelar.');
  if(keyboard){$('guidedVoiceConfirm').focus({preventScroll:false});}
  if(prefs.focus)scheduleLabel(item.label);
 }
 function mount(){
  stopPreview();clearChoice();
  const current=page(),supported=['page-home','page-cards','page-my-communication'].includes(current?.id);
  panel.hidden=!prefs.enabled||!supported;
  if(!panel.hidden)current.prepend(panel);
 }
 function syncSettings(){
  $('guidedVoiceEnabled').checked=prefs.enabled;$('guidedVoiceFocus').checked=prefs.focus;
  $('guidedVoiceRate').value=String(prefs.rate);$('guidedVoiceRateValue').textContent=prefs.rate.toFixed(1)+'×';
  $('guidedVoiceVolume').value=String(Math.round(prefs.volume*100));$('guidedVoiceVolumeValue').textContent=Math.round(prefs.volume*100)+'%';
  selection.setAttribute('aria-live',prefs.focus?'off':'polite');
 }
 function refreshVoices(){
  const select=$('guidedVoiceVoice');select.replaceChildren();
  const automatic=doc.createElement('option');automatic.value='';automatic.textContent='Voz local automática';select.append(automatic);
  for(const voice of voices()){const option=doc.createElement('option');option.value=voice.voiceURI;option.textContent=voice.name+' — '+voice.lang;select.append(option);}
  select.value=voices().some(v=>v.voiceURI===prefs.voice)?prefs.voice:'';
  const usable=!!synth&&!!root.SpeechSynthesisUtterance&&voices().length>0;
  select.disabled=!usable;$('guidedVoiceListen').disabled=!usable;
  $('guidedVoicePanelAvailability').hidden=usable;$('guidedVoicePanelAvailability').textContent=usable?'':'A prévia não tem voz local disponível. A confirmação visual continua funcionando.';
  $('guidedVoiceAvailability').textContent=usable?'A prévia usa somente vozes identificadas pelo navegador como locais.':'Nenhuma voz local foi disponibilizada. Você pode usar a confirmação visual e conferir as vozes do aparelho.';
 }
 function save(next){
  prefs=normalize(next);stopPreview();clearChoice();syncSettings();mount();refreshVoices();
  try{root.localStorage.setItem(KEY,JSON.stringify(prefs));sayStatus('Preferências de voz guiada salvas neste aparelho.');}
  catch{sayStatus('Preferências aplicadas nesta sessão. Não foi possível salvá-las neste aparelho.');}
 }
 $('guidedVoiceEnabled').onchange=event=>save({...prefs,enabled:event.target.checked});
 $('guidedVoiceFocus').onchange=event=>save({...prefs,focus:event.target.checked});
 $('guidedVoiceRate').oninput=event=>save({...prefs,rate:Number(event.target.value)});
 $('guidedVoiceVolume').oninput=event=>save({...prefs,volume:Number(event.target.value)/100});
 $('guidedVoiceVoice').onchange=event=>save({...prefs,voice:event.target.value});
 $('guidedVoiceReset').onclick=()=>save(defaults);
 $('guidedVoiceDisable').onclick=()=>save({...prefs,enabled:false});
 $('guidedVoiceListen').onclick=()=>{if(pending&&action(pending.node)?.label===pending.label)readLabel(pending.label);else{stopPreview();clearChoice();sayStatus('Selecione novamente um cartão ou frase.');}};
 $('guidedVoiceStop').onclick=()=>{stopPreview();sayStatus('Prévia interrompida.');};
 $('guidedVoiceCancel').onclick=()=>{stopPreview();clearChoice(true);sayStatus('Escolha cancelada.');};
 $('guidedVoiceConfirm').onclick=()=>{
  const item=pending,current=item&&action(item.node);
  if(!item||!current||current.node!==item.node||current.label!==item.label){stopPreview();clearChoice();sayStatus('A escolha mudou. Selecione novamente um cartão ou frase.');return;}
  stopPreview();clearChoice();focusWithoutPreview(item.node);
  if(action(item.node)?.label!==item.label){sayStatus('A escolha mudou. Selecione novamente um cartão ou frase.');return;}
  forwarding=item.node;try{item.node.click();}finally{forwarding=null;}
 };
 root.addEventListener('click',event=>{
  if(!prefs.enabled)return;
  const item=action(event.target);
  if(item&&forwarding===item.node)return;
  if(item){event.preventDefault();event.stopImmediatePropagation();selectChoice(item,event.detail===0);}
  else if(!panel.contains(event.target)){stopPreview();clearChoice();}
 },true);
 root.addEventListener('keydown',event=>{
  if(!prefs.enabled)return;
  if(event.key==='Escape'&&pending){event.preventDefault();event.stopImmediatePropagation();stopPreview();clearChoice(true);return;}
  if(!['Enter',' '].includes(event.key))return;
  const item=action(event.target);if(!item)return;
  event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)selectChoice(item,true);
 },true);
 doc.addEventListener('focusin',event=>{
  if(suppressFocus||!prefs.enabled||panel.contains(event.target))return;
  if(event.target.matches('input, textarea, select, [contenteditable="true"]')){stopPreview();clearChoice();return;}
  const item=action(event.target);
  if(pending&&(!item||item.node!==pending.node))clearChoice();
  const navigation=event.target.closest('.visual-bottom-nav button[data-page]');
  if(prefs.focus){if(item)scheduleLabel(item.label);else if(navigation)scheduleLabel(navigation.querySelector('small')?.textContent||navigation.getAttribute('aria-label')||'Navegação');}
 });
 doc.addEventListener('bia:pagechange',mount);
 doc.addEventListener('bia:speech-starting',()=>{stopPreview();clearChoice();});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){stopPreview();clearChoice();}});
 root.addEventListener('pagehide',()=>{stopPreview();clearChoice();});
 synth?.addEventListener?.('voiceschanged',refreshVoices);
 syncSettings();mount();refreshVoices();
})(typeof window==='undefined'?globalThis:window);
