/* Área do adulto: registros explícitos, sem inferência de espontaneidade. */
(function(root){
 'use strict';
 const lib=root.JBWordPractice,KEY='jb_word_goals_v2',LEGACY='jb_word_goals_v1';
 const $=id=>document.getElementById(id);if(!$('wgRoot'))return;
 let state=lib.empty(),listeners=[],readFailed=false;
 try{const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY);if(raw)state=lib.normalize(JSON.parse(raw));}catch{readFailed=true;}
 function status(text){$('wgStatus').textContent=text;}
 const allowed=()=>!!root.SecurityService?.isUnlocked?.();
 const id=()=>root.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
 function save(change,automatic=false){
  if(!automatic&&!allowed()){status('Desbloqueie a administração em Apoio para registrar ou alterar o acompanhamento.');return false;}
  if(readFailed){status('Os dados existentes não puderam ser lidos. Eles foram preservados; exporte um backup antes de tentar corrigir o arquivo.');return false;}
  try{const next=JSON.parse(JSON.stringify(state));change(next);const serialized=JSON.stringify(next);if(serialized.length>200000)throw Error('O acompanhamento atingiu o limite local. Exporte um backup e revise os registros antes de continuar.');localStorage.setItem(KEY,serialized);state=next;render();listeners.forEach(fn=>fn());return true;}catch(error){status(error.message||'Não foi possível salvar neste aparelho.');return false;}
 }
 function make(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
 function button(text,fn,cls='wg-btn'){const b=make('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;}
 function select(label,labels,defaultValue){const wrap=make('label',label),input=document.createElement('select');for(const [value,text] of Object.entries(labels)){const option=make('option',text);option.value=value;input.append(option);}input.value=defaultValue;wrap.append(input);return {wrap,input};}
 function render(){
  const host=$('wgRoot');host.replaceChildren();
  if(!allowed()){host.append(make('p','Bem-vinda ao Jardim da Bia! Para acompanhar expressões e registrar observações, desbloqueie a administração em Apoio.'),button('Ir para Apoio',()=>document.querySelector('.visual-bottom-nav [data-page="settings"]').click()));return;}
  const gardenLabel=make('label',undefined,'wg-garden-switch'),garden=document.createElement('input');garden.type='checkbox';garden.checked=state.garden;garden.addEventListener('change',()=>{save(next=>next.garden=garden.checked);});gardenLabel.append(garden,document.createTextNode(' Mostrar o jardim de expressões (opcional)'));host.append(gardenLabel);
  const captureLabel=make('label',undefined,'wg-garden-switch'),capture=document.createElement('input');capture.type='checkbox';capture.checked=state.capture;capture.addEventListener('change',()=>save(next=>next.capture=capture.checked));captureLabel.append(capture,document.createTextNode(' Registrar acionamentos de fala das expressões em prática neste aparelho'));host.append(captureLabel,make('p','Opcional. Só identifica a expressão exata acionada no app; não identifica quem tocou, se o áudio foi ouvido, o contexto ou o apoio recebido. O adulto revisa cada acionamento no Jardim.','wg-hint'));
  if(state.garden){
   const box=make('section',undefined,'wg-garden');box.append(make('h3','Jardim da Bia'),make('p','Cinco espaços para expressões. A flor se abre quando a fono marca “Consolidada”. Essa avaliação é manual, sem pontuação.'));
   const flowers=make('div',undefined,'wg-flowers');const current=state.goals.filter(g=>g.active);
   for(let i=0;i<5;i++){const goal=current[i],flower=make('div',undefined,'wg-flower'+(!goal?' wg-flower-empty':''));const icon=make('span',goal?.review==='consolidated'?'🌸':'🌷','wg-flower-icon');icon.setAttribute('aria-hidden','true');flower.append(icon,make('strong',goal?.word||'Espaço livre'),make('small',goal?(goal.review==='consolidated'?'Consolidada pela fono':goal.review==='review'?'Revisar com a fono':'Em acompanhamento'):'Sem expressão'));flowers.append(flower);}
   box.append(flowers);
   const completed=state.goals.filter(g=>!g.active&&g.review==='consolidated');
   if(completed.length){box.append(make('h4','Flores que permanecem no Jardim'));const collection=make('div',undefined,'wg-flowers wg-flower-collection');for(const goal of completed)collection.append(make('div','🌸 '+goal.word,'wg-flower'));box.append(collection);}
   host.append(box);
  }
  const active=state.goals.filter(g=>g.active);host.append(make('p',active.length+' expressões em acompanhamento. Você pode manter até cinco por vez.','wg-hint'));
  if(!active.length)host.append(make('p','Ainda não há expressões em prática. Adicione uma palavra ou frase escolhida com a Bia e a fono.'));
  for(const goal of active){
   const card=make('article',undefined,'wg-card'+(goal.review==='review'?' wg-review-needed':''));card.append(make('h3',goal.word));
   if(goal.review==='review')card.append(make('p','Revisar com a fono','wg-review-badge'));
   if(goal.review==='consolidated')card.append(make('p','Consolidada — avaliação manual da fono','wg-review-badge'));
   const days=lib.recentDays(goal),timeline=make('div',undefined,'wg-days');timeline.setAttribute('role','list');timeline.setAttribute('aria-label','Observações nos últimos cinco dias');
   for(const day of days){const item=make('div',undefined,'wg-day');item.setAttribute('role','listitem');const description=day.date+': '+(day.support.length?day.support.map(k=>lib.SUPPORT[k]).join(', '):'Sem registro');item.setAttribute('aria-label',description);const dot=make('span',undefined,'wg-day-dot');dot.setAttribute('aria-hidden','true');for(const support of day.support)dot.append(make('span',undefined,'wg-day-mark wg-support-'+support));item.append(dot,make('small',day.date.slice(8)+'/'+day.date.slice(5,7)));item.title=description;timeline.append(item);}card.append(timeline);
   const dayDetails=make('details');dayDetails.append(make('summary','Ver apoio registrado por dia'));for(const day of days)dayDetails.append(make('p',day.date+': '+(day.support.length?day.support.map(k=>lib.SUPPORT[k]).join(', '):'Sem registro')));card.append(dayDetails);
   card.append(make('p','Bolinhas: registros por dia, com todos os tipos de apoio. Vazio significa sem registro. Abra “Ver apoio registrado por dia” para consultar os detalhes.','wg-hint'));
   const tags=make('div',undefined,'wg-tags');for(const key of Object.keys(lib.CONTEXT).filter(k=>days.some(d=>d.contexts.includes(k))))tags.append(make('span',lib.CONTEXT[key],'wg-tag'));card.append(tags);
   const review=select('Avaliação da fono (manual)',{tracking:'Em acompanhamento',review:'Revisar com a fono',consolidated:'Consolidada pela fono'},goal.review||'tracking');review.input.addEventListener('change',()=>{if(save(next=>next.goals.find(g=>g.id===goal.id).review=review.input.value))status('Avaliação manual salva. Nenhum critério automático foi aplicado.');});card.append(review.wrap);
   const summary=lib.aggregate(state,lib.week(lib.day(Date.now()))).words.find(w=>w.id===goal.id);card.append(make('p',(summary?.days||0)+' dias com registros nesta semana · '+(summary?.total||0)+' observações.','wg-hint'));
   const form=make('form',undefined,'wg-log-form');form.dataset.goalId=goal.id;
   const support=select('Apoio observado',lib.SUPPORT,'unspecified'),context=select('Contexto informado',lib.CONTEXT,'unspecified'),purpose=select('Função comunicativa informada',lib.PURPOSE,'unspecified');
   const dateLabel=make('label','Quando ocorreu'),date=document.createElement('input');date.type='datetime-local';const now=new Date();date.value=lib.day(now.getTime())+'T'+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');date.required=true;dateLabel.append(date);form.append(support.wrap,context.wrap,purpose.wrap,dateLabel);
   const submit=make('button','Registrar observação','wg-btn');submit.type='submit';form.append(submit);form.addEventListener('submit',event=>{event.preventDefault();if(save(next=>lib.record(next,goal.id,{ts:new Date(date.value).getTime(),support:support.input.value,context:context.input.value,purpose:purpose.input.value,logId:id()})))status('Observação registrada neste aparelho. Não foi enviada aos modelos de IA.');});card.append(form);
   const quick=make('div',undefined,'wg-actions wg-quick');
   for(const [value,label] of Object.entries(lib.SUPPORT))quick.append(button(label,()=>{support.input.value=value;form.requestSubmit();}));
   if(goal.taps?.length){
    const pending=make('section',undefined,'wg-pending');pending.append(make('h4','Acionamentos no aplicativo para revisar'),make('p','Eles não entram nas observações até a revisão. Use o apoio, o contexto e a função preenchidos acima.'));
    for(const tap of goal.taps){const row=make('div',undefined,'wg-pending-row');row.append(make('p',new Date(tap.ts).toLocaleString('pt-BR')),button('Confirmar este acionamento',()=>{if(save(next=>lib.confirmTap(next,goal.id,tap.id,{support:support.input.value,context:context.input.value,purpose:purpose.input.value,logId:id()})))status('Acionamento revisado. Foi criada uma única observação, com o apoio informado pelo adulto.');}),button('Descartar acionamento',()=>save(next=>{const g=next.goals.find(g=>g.id===goal.id);g.taps=g.taps.filter(t=>t.id!==tap.id);})));pending.append(row);}card.append(pending);
   }
   card.append(make('p','Registro rápido: usa a data, o contexto e a função preenchidos acima.','wg-hint'),quick);
   const actions=make('div',undefined,'wg-actions');const undo=button('Desfazer último registro',()=>{if(confirm('Excluir o registro mais recente desta expressão?'))if(save(next=>{next.goals.find(g=>g.id===goal.id).logs.pop();}))status('Último registro removido.');});undo.disabled=!goal.logs.length;
   actions.append(button('Concluir com a fono e manter no vocabulário',()=>{
    if(!allowed())return;
    if(goal.taps?.length){status('Revise ou descarte os acionamentos pendentes antes de concluir.');return;}
    if(!confirm('A fono confirmou a consolidação desta expressão? Ela ficará em Minha Comunicação, a flor permanecerá no Jardim e um espaço será liberado.'))return;
    if(!root.JBCommunication?.addGardenWord(goal.word)){status('Não foi possível salvar no vocabulário. O acompanhamento foi preservado.');return;}
    if(save(next=>{const g=next.goals.find(g=>g.id===goal.id);g.review='consolidated';g.active=false;}))status('Flor aberta e preservada no Jardim! Expressão disponível em Minha Comunicação. Você pode acompanhar uma nova expressão.');
   }),undo,button('Pausar acompanhamento',()=>{if(save(next=>next.goals.find(g=>g.id===goal.id).active=false))status('Expressão pausada. Os registros continuam no resumo; os cartões de comunicação não foram alterados.');}));card.append(actions);host.append(card);
  }
  const add=make('form',undefined,'wg-add');add.id='wgAddForm';const label=make('label','Nova palavra ou expressão'),input=document.createElement('input');input.id='wgNewWord';input.maxLength=80;input.required=true;label.htmlFor=input.id;add.append(label,input);const submit=make('button','Adicionar expressão','wg-btn');submit.type='submit';add.append(submit);add.addEventListener('submit',event=>{event.preventDefault();if(save(next=>lib.add(next,input.value,id())))status('Expressão adicionada. Nenhum cartão foi movido ou alterado.');});host.append(add);
  const paused=state.goals.filter(g=>!g.active);if(paused.length){const details=document.createElement('details');details.append(make('summary','Expressões pausadas ('+paused.length+')'));for(const goal of paused){const row=make('div',undefined,'wg-paused');row.append(make('strong',goal.word),button('Retomar',()=>{if(save(next=>{if(next.goals.filter(g=>g.active).length>=5)throw Error('Pause uma expressão antes de retomar outra.');next.goals.find(g=>g.id===goal.id).active=true;}))status('Acompanhamento retomado.');}),button('Excluir expressão e registros',()=>{if(confirm('Apagar esta expressão e todos os seus registros de acompanhamento? Os cartões de comunicação não serão alterados.'))save(next=>next.goals=next.goals.filter(g=>g.id!==goal.id));}));details.append(row);}host.append(details);}
 }
 root.JBWordGoals={getState:()=>JSON.parse(JSON.stringify(state)),onChange:fn=>listeners.push(fn),saveNotes:(key,text)=>save(next=>next.notes[key]=String(text).slice(0,1000)),allowed};
 document.addEventListener('bia:communication-activated',event=>{
  if(readFailed||!state.capture||!state.goals.some(g=>g.active&&lib.phraseKey(g.word)===lib.phraseKey(event.detail?.text)))return;
  save(next=>{lib.capture(next,event.detail.text,id());},true);
 });
 document.addEventListener('bia:pagechange',event=>{if(event.detail?.page==='word-goals'){render();listeners.forEach(fn=>fn());}});
 document.addEventListener('jornadaBia:sessionExpired',render);render();if(readFailed)status('Dados anteriores não puderam ser lidos; o arquivo local foi preservado.');
})(window);
