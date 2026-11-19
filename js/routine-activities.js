/* Jornada de Bia — módulos locais, sem dependências externas */
(()=>{'use strict';
const $ = id => document.getElementById(id);
const KEY = 'bia-routine-sakura-v1';
const periods = ['Manhã', 'Tarde', 'Noite'];
const dayKey = date => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
const minuteOf = date => date.getHours() * 60 + date.getMinutes();
const timeLabel = minute => String(Math.floor(minute/60)).padStart(2,'0') + ':' + String(minute%60).padStart(2,'0');
const currentPeriod = () => periods[new Date().getHours() < 12 ? 0 : new Date().getHours() < 18 ? 1 : 2];
const admin = () => !!window.SecurityService?.isUnlocked?.();
const make = (tag, text) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; return e; };
const btn = (text, fn) => { const b = make('button', text); b.type = 'button'; b.onclick = fn; return b; };

function recentCompletions(events, now) {
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    return events.filter(event => event
        && typeof event.id === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(event.date)
        && event.date >= dayKey(cutoff) && event.date <= dayKey(now)
        && Number.isInteger(event.minute) && event.minute >= 0 && event.minute < 1440).slice(-300);
}

function recurringSuggestion(items, events, now, dismissed) {
    const history = recentCompletions(events, now).filter(event => event.date !== dayKey(now));
    const currentMinute = minuteOf(now);
    const candidates = [];
    for (const item of items) {
        if (item.done || dismissed.has(item.id)) continue;
        const days = new Map(history.filter(event => event.id === item.id && Math.abs(event.minute - currentMinute) <= 45)
            .map(event => [event.date, event.minute]));
        const minutes = [...days.values()].sort((a,b) => a-b);
        if (minutes.length < 3) continue;
        const median = minutes[Math.floor(minutes.length / 2)];
        const close = minutes.filter(minute => Math.abs(minute - median) <= 25);
        if (close.length < 3) continue;
        const minute = close[Math.floor(close.length / 2)];
        if (Math.abs(minute - currentMinute) <= 30) candidates.push({item, minute, days: close.length});
    }
    return candidates.sort((a,b) => b.days - a.days || Math.abs(a.minute - currentMinute) - Math.abs(b.minute - currentMinute))[0];
}

const defaults = [
    ['Manhã','🌞','Acordar'], ['Manhã','🍽️','Tomar café'], ['Manhã','🪥','Escovar os dentes'],
    ['Tarde','🎨','Brincar'], ['Noite','🛏️','Descansar']
].map(([period,icon,name],i) => ({id:'sample'+i,period,icon,name,time:'',done:false}));
let state, savedRaw, readFailed=false;
function normalize(raw) {
    const value=raw===null?{date:dayKey(new Date()),items:defaults}:JSON.parse(raw);
    if(!value||!Array.isArray(value.items)||value.items.some(item=>!item||typeof item.id!=='string'||typeof item.name!=='string'||!periods.includes(item.period)))throw Error('Rotina inválida');
    if(!Array.isArray(value.completions))value.completions=[];
    if(typeof value.learnTimes!=='boolean')value.learnTimes=true;
    return value;
}
try { savedRaw=localStorage.getItem(KEY);state=normalize(savedRaw); }
catch { readFailed=true;state=normalize(null); }
let period = currentPeriod(), edit = false, suggestion;
const dismissed = new Set();
let routineWriting=false;
const feedback=message=>{$('biaRoutineSaveStatus').textContent=message;};
function resetDay(next) {
    const now=new Date(),date=dayKey(now);
    if(next.date===date)return;
    next.date=date;next.items.forEach(item=>item.done=false);
    next.priorityId=null;next.pausedId=null;
    next.completions=recentCompletions(next.completions,now);
}
async function commit(change,{restricted=false,notice='Rotina salva neste aparelho.'}={}) {
    if(routineWriting)return false;
    routineWriting=true;
    const write=()=>{
        if(restricted&&!admin())return false;
        if(readFailed){feedback('Não foi possível ler a rotina. Nenhuma alteração foi salva. Reabra o aplicativo e confira o armazenamento.');return false;}
        try {
            const current=localStorage.getItem(KEY);
            if(current!==savedRaw){
                state=normalize(current);savedRaw=current;
                feedback('A rotina mudou em outra aba. A versão atual foi carregada. Confira e tente novamente; o texto digitado foi mantido.');
                render();return false;
            }
            const next=JSON.parse(JSON.stringify(state)),newDay=next.date!==dayKey(new Date());resetDay(next);change(next);
            const encoded=JSON.stringify(next);
            localStorage.setItem(KEY,encoded);
            state=next;savedRaw=encoded;if(newDay)dismissed.clear();feedback(notice);render();return true;
        }catch{feedback('Não foi possível salvar a rotina neste aparelho. Nada foi alterado; o texto digitado foi mantido.');render();return false;}
    };
    try {
        // Serializa gravações entre abas em navegadores com Web Locks.
        return await (navigator.locks?.request?navigator.locks.request('bia-routine-write',write):write());
    }catch{feedback('Não foi possível salvar a rotina. Tente novamente.');return false;}
    finally{routineWriting=false;}
}
function checkDay() {
    if(state.date===dayKey(new Date()))return;
    return commit(()=>{}, {notice:'Rotina preparada para hoje.'});
}

function pending(items) {
    const remaining = items.filter(item => !item.done);
    const first = remaining.find(item => item.id === state.priorityId);
    return first ? [first, ...remaining.filter(item => item !== first)] : remaining;
}

function say(text) { window.speakText?.(text); }

async function complete(item) {
    await commit(next=>{
        const target=next.items.find(entry=>entry.id===item.id);if(!target)return;
        target.done=!target.done;
        next.completions=next.completions.filter(event=>event?.id!==target.id||event.date!==next.date);
        if(target.done&&next.learnTimes){const now=new Date();next.completions.push({id:target.id,date:next.date,minute:minuteOf(now)});next.completions=recentCompletions(next.completions,now);}
        if(next.priorityId===target.id)next.priorityId=null;
        if(next.pausedId===target.id)next.pausedId=null;
    });
}

function renderSuggestion() {
    const panel = $('biaRoutineSuggestion');
    const items = state.items.filter(item => item.period === period);
    suggestion = state.learnTimes ? recurringSuggestion(items, state.completions, new Date(), dismissed) : null;
    panel.hidden = !suggestion;
    if (!suggestion) return;
    $('biaRoutineSuggestionText').textContent = itemSuggestionText(suggestion);
    $('biaRoutineUseSuggestion').hidden = !admin() || pending(items)[0] === suggestion.item;
}

function itemSuggestionText({item, minute, days}) {
    return `${item.icon} ${item.name} por volta de ${timeLabel(minute)}. Alguém marcou a atividade concluída perto desse horário em ${days} dias.`;
}

function render(notice = '') {
    const tabs = $('biaRoutinePeriods'), list = $('biaRoutineList');
    tabs.replaceChildren(); list.replaceChildren();
    for (const name of periods) {
        const button = btn(name, () => { period=name; render(); tabs.children[periods.indexOf(name)].focus(); });
        button.setAttribute('aria-pressed', String(name === period));
        tabs.append(button);
    }
    if (edit && !admin()) edit = false;
    $('biaRoutineEditor').hidden = !edit;
    $('biaRoutineManage').textContent = edit ? 'Fechar organização' : '🔐 Organizar atividades';
    $('biaRoutineLearn').checked = !!state.learnTimes;

    const items = state.items.filter(item => item.period === period);
    const [now, next] = pending(items);
    for (const [slot, item] of [['Now',now],['Later',next]]) {
        const slotButton = $('biaRoutine'+slot);
        const icon = make('span', item?.icon || '—');
        icon.className = 'bia-routine-slot-icon';
        icon.setAttribute('aria-hidden', 'true');
        slotButton.replaceChildren(icon, make('span', item?.name || 'Sem atividade'));
        slotButton.disabled = !item;
        slotButton.onclick = () => { if (item) say(item.name); };
    }
    const paused = !!now && state.pausedId === now.id;
    $('biaRoutineNext').textContent = paused ? 'Em pausa. A atividade continua aqui.' : !now ? 'Sem atividades pendentes neste período.' : notice;
    $('biaRoutineFinishNow').disabled = !now;
    $('biaRoutineFinishNow').onclick = async () => {
        if (!now) return;
        await complete(now);
        if ($('biaRoutineFinishNow').disabled) tabs.children[periods.indexOf(period)].focus();
    };
    $('biaRoutinePause').textContent = paused ? '▶ Retomar' : '⏸ Pausa';
    $('biaRoutinePause').onclick = async () => {
        if (now) await commit(next=>{next.pausedId=paused?null:now.id;});
        if (!paused) say('Preciso de uma pausa.');
    };

    if (!items.length) list.append(make('p','Nenhuma atividade neste período.'));
    for (const item of items) {
        const card = make('div');
        card.className = 'bia-routine-card' + (item.done ? ' done' : '');
        const icon = make('span',item.icon);
        icon.className = 'bia-icon';
        icon.setAttribute('aria-hidden','true');
        const info = make('div');
        info.className = 'bia-info';
        info.append(make('strong',item.name));
        if (item.time) info.append(make('p','Horário opcional: '+item.time));
        const actions = make('div');
        actions.className = 'bia-actions';
        actions.append(btn(item.done ? '↩ Desmarcar' : '✓ Concluído', () => complete(item)));
        if (!item.done) actions.append(btn('Adiar', () => commit(next=>{
            const index=next.items.findIndex(entry=>entry.id===item.id);if(index<0)return;
            next.items.push(...next.items.splice(index,1));
            if(next.priorityId===item.id)next.priorityId=null;
            if(next.pausedId===item.id)next.pausedId=null;
        },{notice:'A ordem da rotina mudou.'})));
        if (edit && admin()) {
            const up = btn('↑', () => move(item,-1)), down = btn('↓', () => move(item,1));
            up.setAttribute('aria-label','Subir '+item.name);
            down.setAttribute('aria-label','Descer '+item.name);
            actions.append(up, down, btn('Excluir', () => {
                if (!admin() || !confirm('Excluir atividade?')) return;
                commit(next=>{next.items=next.items.filter(x=>x.id!==item.id);next.completions=next.completions.filter(event=>event?.id!==item.id);},{restricted:true});
            }));
        }
        card.append(icon,info,actions); list.append(card);
    }
    renderSuggestion();
}

function move(item,direction) {
    return commit(next=>{
        const items=next.items.filter(x=>x.period===period),index=items.findIndex(x=>x.id===item.id),other=items[index+direction];
        if(index<0||!other)return;
        const a=next.items.findIndex(x=>x.id===item.id),b=next.items.findIndex(x=>x.id===other.id);
        [next.items[a],next.items[b]]=[next.items[b],next.items[a]];
    },{restricted:true});
}

$('biaRoutineManage').onclick = async () => {
    if (!admin() && !(await window.requestGuardianUnlock?.())) return;
    edit = !edit;
    render();
};
$('biaRoutineAdd').onclick = async () => {
    if(!admin()){edit=false;render();return;}
    const name=$('biaRoutineName').value.trim(),time=$('biaRoutineTime').value,icon=$('biaRoutineIcon').value,taskPeriod=period;
    if(!name){feedback('Informe o nome da atividade.');return;}
    if(await commit(next=>next.items.push({id:crypto.randomUUID(),period:taskPeriod,name:name.slice(0,60),icon,time,done:false}),{restricted:true})){
        if($('biaRoutineName').value.trim()===name)$('biaRoutineName').value='';
        if($('biaRoutineTime').value===time)$('biaRoutineTime').value='';
    }
};
$('biaRoutineLearn').onchange = event => {
    const enabled=event.target.checked;
    commit(next=>{next.learnTimes=enabled;},{restricted:true}).then(()=>render());
};
$('biaRoutineUseSuggestion').onclick = async () => {
    if(!suggestion||!admin())return;
    const id=suggestion.item.id;
    if(await commit(next=>{next.priorityId=id;next.pausedId=null;},{restricted:true,notice:'A ordem da rotina mudou para hoje.'})){dismissed.add(id);render();$('biaRoutineNow').focus();}
};
$('biaRoutineDismissSuggestion').onclick = () => {
    if (!suggestion) return;
    dismissed.add(suggestion.item.id);
    renderSuggestion();
    $('biaRoutineNow').focus();
};
$('biaRoutineHelp').onclick = () => say('Preciso de ajuda.');
$('biaRoutineRefuse').onclick = () => say('Não quero.');
document.addEventListener('bia:pagechange', event => {
    if (event.detail?.page === 'routine') { period = currentPeriod(); render();checkDay(); }
});
document.addEventListener('bia:admin-access-changed', () => render());
setInterval(() => {
    if (!$('page-routine').classList.contains('active')) return;
    if(state.date!==dayKey(new Date())){period=currentPeriod();checkDay();}
    else renderSuggestion();
},60000);
render();checkDay();
// Desenho livre: toque, mouse, exportação PNG.
const canvas=$('biaCanvas'),ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);let drawing=false,last;
const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];};
canvas.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);};
canvas.onpointermove=e=>{if(!drawing)return;const p=point(e);ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(...p);ctx.strokeStyle=$('biaDrawColor').value;ctx.lineWidth=+$('biaDrawSize').value;ctx.lineCap='round';ctx.stroke();last=p;};
['pointerup','pointercancel','lostpointercapture'].forEach(n=>canvas.addEventListener(n,()=>drawing=false));
$('biaDrawClear').onclick=()=>{if(confirm('Apagar o desenho?')){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}};
$('biaDrawSave').onclick=()=>{const a=make('a');a.download='desenho-bia.png';a.href=canvas.toDataURL('image/png');a.click();};
// Jogo de pares, sem tempo limite.
let deck=[],open=[],matched=0,busy=false,flipTimer=null;
function game(){if(flipTimer)clearTimeout(flipTimer);const values=['🌸','⭐','🐱','🌈'];deck=[...values,...values].map(v=>({v,up:false,found:false}));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}open=[];matched=0;busy=false;renderGame();}
function renderGame(){const grid=$('biaGameGrid');grid.replaceChildren();deck.forEach((c,i)=>{const b=btn(c.up||c.found?c.v:'❔',()=>flip(i));b.disabled=busy||c.found;b.setAttribute('aria-label',c.found?'Par encontrado':c.up?'Figura '+c.v:'Revelar carta '+(i+1));if(c.found)b.className='matched';grid.append(b);});$('biaGameStatus').textContent=matched===4?'Todos os pares encontrados!':'Pares encontrados: '+matched+' de 4.';}
function flip(i){const c=deck[i];if(busy||c.up||c.found)return;c.up=true;open.push(i);renderGame();if(open.length===2){const [a,b]=open;if(deck[a].v===deck[b].v){deck[a].found=deck[b].found=true;matched++;open=[];renderGame();}else{busy=true;flipTimer=setTimeout(()=>{deck[a].up=deck[b].up=false;open=[];busy=false;renderGame();},1000);}}}
$('biaGameRestart').onclick=game;game();
// Sons sintetizados localmente, iniciados apenas por toque.
let audio=null,source=null,gain=null,interval=null;
function stop(){if(interval){clearInterval(interval);interval=null;}if(source){try{source.stop();}catch{}source.disconnect();source=null;}if(gain){gain.disconnect();gain=null;}$('biaSoundStatus').textContent='Nenhum som em reprodução.';}
const volume=()=>Number($('biaSoundVolume').value)/100;
function note(f){const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0001,volume()*.3),t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+.4);o.connect(g).connect(audio.destination);o.start();o.stop(t+.42);}
async function play(kind){stop();try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error();audio??=new AC();await audio.resume();if(kind==='melody'){const seq=[392,440,523.25,440,349.23,392,329.63,392];let i=0;note(seq[i++]);interval=setInterval(()=>note(seq[i++%seq.length]),550);}else{const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type=kind==='rain'?'lowpass':'bandpass';filter.frequency.value=kind==='rain'?800:260;gain=audio.createGain();gain.gain.value=volume()*.55;source.connect(filter).connect(gain).connect(audio.destination);source.start();}$('biaSoundStatus').textContent=kind==='rain'?'Chuva suave tocando.':kind==='wind'?'Brisa tocando.':'Melodia original tocando.';}catch{$('biaSoundStatus').textContent='Áudio indisponível neste aparelho.';}}
document.querySelectorAll('[data-bia-sound]').forEach(b=>b.onclick=()=>play(b.dataset.biaSound));$('biaSoundStop').onclick=stop;$('biaSoundVolume').oninput=()=>{if(gain)gain.gain.value=volume()*.55;};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
document.querySelectorAll('[data-bia-activity]').forEach(b=>b.onclick=()=>{const tab=b.dataset.biaActivity;['draw','game','sounds','garden','colors'].forEach(x=>$(x==='draw'?'biaDraw':x==='game'?'biaGame':x==='sounds'?'biaSounds':x==='garden'?'biaGarden':'biaColors').hidden=x!==tab);document.querySelectorAll('[data-bia-activity]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(tab!=='sounds')stop();document.dispatchEvent(new CustomEvent('bia:activity-selected',{detail:{tab}}));});document.querySelector('[data-bia-activity="draw"]').setAttribute('aria-pressed','true');
})();
