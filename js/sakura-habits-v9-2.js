/* Sakura V9.2: sugestões locais por recorrência, sem inferir necessidades. */
(()=>{'use strict';
const KEY='bia_sakura_activity_habits_v92', PREF='bia_sakura_activity_preferences_v92';
const $=id=>document.getElementById(id);
const names={draw:'desenhar',game:'jogar',sounds:'ouvir sons',garden:'explorar o Jardim Musical',colors:'explorar formas e cores'};
const labels={draw:'🎨 Desenhar',game:'🧩 Jogo visual',sounds:'🎶 Sons e música',garden:'🌸 Jardim Musical',colors:'🎨 Formas e Cores'};
const defaults={suggestions:true,notifications:false};
function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'?v:fallback;}catch{return fallback;}}
let prefs={...defaults,...read(PREF,{})};
let events=read(KEY,[]);if(!Array.isArray(events))events=[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(events.slice(-250)));}catch{}};
const savePrefs=()=>{try{localStorage.setItem(PREF,JSON.stringify(prefs));}catch{}};
function slot(date){return Math.floor((date.getHours()*60+date.getMinutes())/60);}
function candidates(){
 const now=new Date(),hour=slot(now),today=now.toDateString();
 const counts=new Map();
 for(const ev of events){if(!names[ev.tab]||!Number.isFinite(ev.time))continue;
  const d=new Date(ev.time),days=(now-d)/86400000;
  if(days<0||days>30||d.toDateString()===today||Math.abs(slot(d)-hour)>1)continue;
  const k=ev.tab,old=counts.get(k)||new Set();old.add(d.toDateString());counts.set(k,old);
 }
 return [...counts].filter(([,days])=>days.size>=3).sort((a,b)=>b[1].size-a[1].size).slice(0,1).map(([tab,days])=>({tab,days:days.size}));
}
function record(tab){if(!names[tab])return;
 const now=Date.now(),last=events[events.length-1];
 if(last&&last.tab===tab&&now-last.time<30*60*1000)return;
 events.push({tab,time:now});events=events.filter(e=>now-e.time<=31*86400000).slice(-250);save();render();
}
function openActivity(tab){const nav=document.querySelector('[data-page="activities"]');nav?.click();
 const btn=document.querySelector('[data-bia-activity="'+tab+'"]');if(btn)btn.click();
}
let dismissed='';
function render(){const section=$('biaHabitSuggestion'),title=$('biaHabitTitle'),stats=$('biaHabitStats');if(!section)return;
 const suggestion=prefs.suggestions?candidates()[0]:null;
 const stamp=new Date().toDateString()+'-'+new Date().getHours()+'-'+(suggestion?.tab||'');
 section.hidden=!suggestion||dismissed===stamp;
 if(suggestion){title.textContent=labels[suggestion.tab]+'?';$('biaHabitDescription').textContent='Você escolheu esta atividade em '+suggestion.days+' dias, perto deste horário. É só uma sugestão.';
 $('biaHabitOpen').onclick=()=>openActivity(suggestion.tab);
 $('biaHabitDismiss').onclick=()=>{dismissed=stamp;render();};}
 if(stats)stats.textContent=events.length+' escolhas de atividades registradas neste navegador. Uma sugestão exige escolhas em pelo menos 3 dias diferentes nos últimos 30 dias, em horários próximos.';
}
function notificationSupported(){return 'Notification' in window&&window.isSecureContext;}
function updateStatus(message){const node=$('biaHabitNotificationStatus');if(node)node.textContent=message;}
async function testNotification(){
 if(!prefs.notifications){updateStatus('Ative as notificações primeiro.');return;}
 if(!notificationSupported()){updateStatus('Notificações indisponíveis aqui. Use uma página HTTPS ou localhost em navegador compatível.');return;}
 if(Notification.permission!=='granted'){updateStatus('Permissão não concedida.');return;}
 try{new Notification('Jornada de Bia',{body:'🌸 Notificação de teste. Nenhuma atividade foi iniciada automaticamente.',tag:'bia-habit-test'});updateStatus('Notificação de teste solicitada ao navegador.');}
 catch{updateStatus('Não foi possível mostrar a notificação neste dispositivo.');}
}
async function changeNotification(enabled){
 if(!enabled){prefs.notifications=false;savePrefs();updateStatus('Notificações desativadas.');return;}
 if(!notificationSupported()){prefs.notifications=false;$('biaHabitNotify').checked=false;updateStatus('É necessário HTTPS ou localhost e suporte do navegador.');return;}
 try{const permission=await Notification.requestPermission();prefs.notifications=permission==='granted';$('biaHabitNotify').checked=prefs.notifications;savePrefs();updateStatus(prefs.notifications?'Permissão concedida. Use o botão de teste. Avisos com o app fechado ainda não estão disponíveis.':'Permissão não concedida.');}
 catch{prefs.notifications=false;$('biaHabitNotify').checked=false;updateStatus('Não foi possível solicitar a permissão.');}
}
function init(){
 $('biaHabitSuggestions')?.addEventListener('change',e=>{prefs.suggestions=e.target.checked;savePrefs();render();});
 $('biaHabitNotify')?.addEventListener('change',e=>changeNotification(e.target.checked));
 $('biaHabitTest')?.addEventListener('click',testNotification);
 $('biaHabitClear')?.addEventListener('click',()=>{if(!confirm('Apagar somente o histórico local de atividades usado para sugestões?'))return;events=[];save();render();updateStatus('Histórico de atividades apagado.');});
 if($('biaHabitSuggestions'))$('biaHabitSuggestions').checked=prefs.suggestions;
 if($('biaHabitNotify'))$('biaHabitNotify').checked=prefs.notifications;
 document.addEventListener('bia:activity-selected',e=>record(e.detail?.tab));
 document.querySelectorAll('[data-garden-note],[data-bia-sound]').forEach(el=>el.addEventListener('click',()=>record(el.hasAttribute('data-garden-note')?'garden':'sounds')));
 render();setInterval(render,60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
