/* Observações manuais de comunicação; independente dos modelos de IA. */
(function(root){
 'use strict';
 const SUPPORT={independent:'Sem incentivo observado',prompted:'Após incentivo',supported:'Com apoio',unspecified:'Não informado'};
 const CONTEXT={home:'Casa',school:'Escola',outing:'Passeio',unspecified:'Não informado'};
 const PURPOSE={request:'Pedir',refuse:'Recusar',comment:'Comentar',attention:'Chamar atenção',other:'Outra função',unspecified:'Não informado'};
 const has=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
 function empty(){return {version:2,goals:[],notes:{},garden:true,capture:false};}
 function normalize(value){
  if(!value||typeof value!=='object'||!Array.isArray(value.goals))throw Error('Formato do acompanhamento inválido.');
  const state=empty();state.garden=value.garden!==false;state.capture=value.capture===true;
  state.goals=value.goals.map((g,i)=>{
   if(typeof g.word!=='string'||!g.word.trim()||!Array.isArray(g.logs))throw Error('Expressão ou registros inválidos.');
   return {id:typeof g.id==='string'?g.id:'legacy-'+i,word:g.word.trim().slice(0,80),active:g.active!==false&&!g.conquered,review:['review','consolidated'].includes(g.review)?g.review:'tracking',taps:Array.isArray(g.taps)?g.taps.filter(t=>typeof t.id==='string'&&Number.isFinite(t.ts)).slice(-50):[],logs:g.logs.map((l,j)=>{
    if((!Number.isFinite(l.ts)||!Number.isFinite(new Date(l.ts).getTime())))throw Error('Data de registro inválida.');
    return {id:typeof l.id==='string'?l.id:'legacy-'+i+'-'+j,ts:l.ts,support:has(SUPPORT,l.support)?l.support:'unspecified',context:has(CONTEXT,l.context||l.ctx)?(l.context||l.ctx):'unspecified',purpose:has(PURPOSE,l.purpose)?l.purpose:'unspecified'};
   })};
  });
  if(new Set(state.goals.map(g=>g.id)).size!==state.goals.length)throw Error('Identificadores duplicados.');
  for(const [date,note] of Object.entries(value.notes||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&typeof note==='string')state.notes[date]=note.slice(0,1000);
  return state;
 }
 function day(ts){const d=new Date(ts);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 function week(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Escolha uma data válida.');
  const [y,m,d]=date.split('-').map(Number),start=new Date(y,m-1,d);
  if(day(start.getTime())!==date)throw Error('Data inválida.');
  start.setDate(start.getDate()-(start.getDay()+6)%7);const end=new Date(start);end.setDate(end.getDate()+7);
  return {key:day(start.getTime()),start:start.getTime(),end:end.getTime()};
 }
 function add(state,word,id){
  const text=String(word||'').trim();if(!text||text.length>80)throw Error('Informe uma expressão com até 80 caracteres.');
  if(state.goals.some(g=>g.word.toLocaleLowerCase('pt-BR')===text.toLocaleLowerCase('pt-BR')))throw Error('Essa expressão já está cadastrada, inclusive entre as pausadas.');
  if(state.goals.filter(g=>g.active).length>=5)throw Error('Acompanhe até cinco expressões por vez. Pause uma antes de adicionar outra.');
  state.goals.push({id,word:text,active:true,logs:[]});
 }
 function record(state,id,{ts,support='unspecified',context='unspecified',purpose='unspecified',logId},now=Date.now()){
  const goal=state.goals.find(g=>g.id===id);if(!goal||!goal.active)throw Error('Expressão não está em acompanhamento.');
  if(!Number.isFinite(ts)||!Number.isFinite(new Date(ts).getTime())||ts>now)throw Error('Informe uma data válida, sem registros futuros.');
  if(!has(SUPPORT,support)||!has(CONTEXT,context)||!has(PURPOSE,purpose))throw Error('Informação de registro inválida.');
  if(goal.logs.length>=500)throw Error('Limite de 500 registros nesta expressão. Exporte os dados antes de revisar o acompanhamento.');
  goal.logs.push({id:logId,ts,support,context,purpose});goal.logs.sort((a,b)=>a.ts-b.ts);
 }
 function phraseKey(text){return String(text||'').normalize('NFC').trim().toLocaleLowerCase('pt-BR').replace(/[.!?]+$/,'').trim();}
 function capture(state,text,tapId,now=Date.now()){
  if(!state.capture)return false;
  const goal=state.goals.find(g=>g.active&&phraseKey(g.word)===phraseKey(text));
  if(!goal)return false;
  if(!Array.isArray(goal.taps))goal.taps=[];
  if(goal.taps.length>=50)return false;
  goal.taps.push({id:tapId,ts:now});return true;
 }
 function confirmTap(state,goalId,tapId,fields,now=Date.now()){
  const goal=state.goals.find(g=>g.id===goalId),tap=goal?.taps?.find(t=>t.id===tapId);
  if(!tap)throw Error('Toque já revisado ou indisponível.');
  record(state,goalId,{...fields,ts:tap.ts},now);
  goal.taps=goal.taps.filter(t=>t.id!==tapId);
 }
 function recentDays(goal,now=Date.now()){
  const today=new Date(now);today.setHours(0,0,0,0);
  return Array.from({length:5},(_,i)=>{
   const start=new Date(today);start.setDate(start.getDate()-4+i);const end=new Date(start);end.setDate(end.getDate()+1);
   const logs=goal.logs.filter(l=>l.ts>=start.getTime()&&l.ts<end.getTime()&&l.ts<=now);
   return {date:day(start.getTime()),support:Object.keys(SUPPORT).filter(k=>logs.some(l=>l.support===k)),contexts:Object.keys(CONTEXT).filter(k=>logs.some(l=>l.context===k))};
  });
 }
 function aggregate(state,range,now=Date.now()){
  const counts=labels=>Object.fromEntries(Object.keys(labels).map(k=>[k,0]));
  const out={total:0,support:counts(SUPPORT),contexts:counts(CONTEXT),purposes:counts(PURPOSE),words:[]};
  for(const g of state.goals){const logs=g.logs.filter(l=>l.ts>=range.start&&l.ts<range.end&&l.ts<=now);const supports=counts(SUPPORT);logs.forEach(l=>{supports[l.support]++;out.support[l.support]++;out.contexts[l.context]++;out.purposes[l.purpose]++;});out.total+=logs.length;if(g.active||logs.length)out.words.push({id:g.id,word:g.word,active:g.active,total:logs.length,days:new Set(logs.map(l=>day(l.ts))).size,support:supports});}
  return out;
 }
 const api={SUPPORT,CONTEXT,PURPOSE,empty,normalize,day,week,add,record,phraseKey,capture,confirmTap,recentDays,aggregate};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JBWordPractice=api;
})(typeof window==='undefined'?globalThis:window);
