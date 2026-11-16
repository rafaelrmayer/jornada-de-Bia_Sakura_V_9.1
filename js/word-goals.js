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
 function save(change){
  if(!allowed()){status('Desbloqueie a administração em Apoio para registrar ou alterar o acompanhamento.');return false;}
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
  if(state.garden){const box=make('section',undefined,'wg-garden');box.append(make('h3','Jardim da Bia'),make('p','Cada flor representa uma expressão em acompanhamento, sem prêmio ou classificação por tipo de apoio.'));const flowers=make('div',undefined,'wg-flowers');state.goals.filter(g=>g.active).forEach(g=>{const flower=make('span','🌷 '+g.word,'wg-flower');flowers.append(flower);});box.append(flowers);host.append(box);}
  const active=state.goals.filter(g=>g.active);host.append(make('p',active.length+' expressões em acompanhamento. Você pode manter até cinco por vez.','wg-hint'));
  if(!active.length)host.append(make('p','Ainda não há expressões em prática. Adicione uma palavra ou frase escolhida com a Bia e a fono.'));
  for(const goal of active){
   const card=make('article',undefined,'wg-card');card.append(make('h3',goal.word));
   const summary=lib.aggregate(state,lib.week(lib.day(Date.now()))).words.find(w=>w.id===goal.id);card.append(make('p',(summary?.days||0)+' dias com registros nesta semana · '+(summary?.total||0)+' observações.','wg-hint'));
   const form=make('form',undefined,'wg-log-form');form.dataset.goalId=goal.id;
   const support=select('Apoio observado',lib.SUPPORT,'unspecified'),context=select('Contexto informado',lib.CONTEXT,'unspecified'),purpose=select('Função comunicativa informada',lib.PURPOSE,'unspecified');
   const dateLabel=make('label','Quando ocorreu'),date=document.createElement('input');date.type='datetime-local';const now=new Date();date.value=lib.day(now.getTime())+'T'+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');date.required=true;dateLabel.append(date);form.append(support.wrap,context.wrap,purpose.wrap,dateLabel);
   const submit=make('button','Registrar observação','wg-btn');submit.type='submit';form.append(submit);form.addEventListener('submit',event=>{event.preventDefault();if(save(next=>lib.record(next,goal.id,{ts:new Date(date.value).getTime(),support:support.input.value,context:context.input.value,purpose:purpose.input.value,logId:id()})))status('Observação registrada neste aparelho. Não foi enviada aos modelos de IA.');});card.append(form);
   const actions=make('div',undefined,'wg-actions');const undo=button('Desfazer último registro',()=>{if(confirm('Excluir o registro mais recente desta expressão?'))if(save(next=>{next.goals.find(g=>g.id===goal.id).logs.pop();}))status('Último registro removido.');});undo.disabled=!goal.logs.length;
   actions.append(undo,button('Pausar acompanhamento',()=>{if(save(next=>next.goals.find(g=>g.id===goal.id).active=false))status('Expressão pausada. Os registros continuam no resumo; os cartões de comunicação não foram alterados.');}));card.append(actions);host.append(card);
  }
  const add=make('form',undefined,'wg-add');add.id='wgAddForm';const label=make('label','Nova palavra ou expressão'),input=document.createElement('input');input.id='wgNewWord';input.maxLength=80;input.required=true;label.htmlFor=input.id;add.append(label,input);const submit=make('button','Adicionar expressão','wg-btn');submit.type='submit';add.append(submit);add.addEventListener('submit',event=>{event.preventDefault();if(save(next=>lib.add(next,input.value,id())))status('Expressão adicionada. Nenhum cartão foi movido ou alterado.');});host.append(add);
  const paused=state.goals.filter(g=>!g.active);if(paused.length){const details=document.createElement('details');details.append(make('summary','Expressões pausadas ('+paused.length+')'));for(const goal of paused){const row=make('div',undefined,'wg-paused');row.append(make('strong',goal.word),button('Retomar',()=>{if(save(next=>{if(next.goals.filter(g=>g.active).length>=5)throw Error('Pause uma expressão antes de retomar outra.');next.goals.find(g=>g.id===goal.id).active=true;}))status('Acompanhamento retomado.');}),button('Excluir expressão e registros',()=>{if(confirm('Apagar esta expressão e todos os seus registros de acompanhamento? Os cartões de comunicação não serão alterados.'))save(next=>next.goals=next.goals.filter(g=>g.id!==goal.id));}));details.append(row);}host.append(details);}
 }
 root.JBWordGoals={getState:()=>JSON.parse(JSON.stringify(state)),onChange:fn=>listeners.push(fn),saveNotes:(key,text)=>save(next=>next.notes[key]=String(text).slice(0,1000)),allowed};
 document.addEventListener('bia:pagechange',event=>{if(event.detail?.page==='word-goals'){render();listeners.forEach(fn=>fn());}});
 document.addEventListener('jornadaBia:sessionExpired',render);render();if(readFailed)status('Dados anteriores não puderam ser lidos; o arquivo local foi preservado.');
})(window);
