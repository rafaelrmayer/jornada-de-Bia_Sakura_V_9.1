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
let state;
try { state = JSON.parse(localStorage.getItem(KEY)); } catch { /* Use a rotina inicial. */ }
if (!Array.isArray(state?.items)) state = {date: dayKey(new Date()), items: defaults};
if (!Array.isArray(state.completions)) state.completions = [];

let period = currentPeriod(), edit = false, suggestion;
const dismissed = new Set();

function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch { window.showToast?.('Não foi possível salvar a rotina neste aparelho.'); }
}

function checkDay() {
    const now = new Date(), date = dayKey(now);
    if (state.date === date) return false;
    state.date = date;
    for (const item of state.items) item.done = false;
    state.priorityId = null;
    state.pausedId = null;
    state.completions = recentCompletions(state.completions, now);
    dismissed.clear();
    save();
    return true;
}

function pending(items) {
    const remaining = items.filter(item => !item.done);
    const first = remaining.find(item => item.id === state.priorityId);
    return first ? [first, ...remaining.filter(item => item !== first)] : remaining;
}

function say(text) { window.speakText?.(text); }

function complete(item) {
    checkDay();
    item.done = !item.done;
    state.completions = state.completions.filter(event => event?.id !== item.id || event.date !== state.date);
    if (item.done && state.learnTimes) {
        const now = new Date();
        state.completions.push({id: item.id, date: state.date, minute: minuteOf(now)});
        state.completions = recentCompletions(state.completions, now);
    }
    if (item.id === state.priorityId) state.priorityId = null;
    if (item.id === state.pausedId) state.pausedId = null;
    save();
    render();
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
    checkDay();
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
    $('biaRoutineFinishNow').onclick = () => {
        if (!now) return;
        complete(now);
        if ($('biaRoutineFinishNow').disabled) tabs.children[periods.indexOf(period)].focus();
    };
    $('biaRoutinePause').textContent = paused ? '▶ Retomar' : '⏸ Pausa';
    $('biaRoutinePause').onclick = () => {
        if (now) { state.pausedId = paused ? null : now.id; save(); render(); }
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
        if (!item.done) actions.append(btn('Adiar', () => {
            state.items.splice(state.items.indexOf(item),1);
            state.items.push(item);
            if (state.priorityId === item.id) state.priorityId = null;
            if (state.pausedId === item.id) state.pausedId = null;
            save(); render('A ordem da rotina mudou.');
        }));
        if (edit && admin()) {
            const up = btn('↑', () => move(item,-1)), down = btn('↓', () => move(item,1));
            up.setAttribute('aria-label','Subir '+item.name);
            down.setAttribute('aria-label','Descer '+item.name);
            actions.append(up, down, btn('Excluir', () => {
                if (!admin() || !confirm('Excluir atividade?')) return;
                state.items = state.items.filter(x => x !== item);
                state.completions = state.completions.filter(event => event?.id !== item.id);
                save(); render();
            }));
        }
        card.append(icon,info,actions); list.append(card);
    }
    renderSuggestion();
}

function move(item,direction) {
    if (!admin()) return;
    const items = state.items.filter(x => x.period === period);
    const other = items[items.indexOf(item)+direction];
    if (!other) return;
    const a = state.items.indexOf(item), b = state.items.indexOf(other);
    [state.items[a],state.items[b]] = [state.items[b],state.items[a]];
    save(); render();
}

$('biaRoutineManage').onclick = async () => {
    if (!admin() && !(await window.requestGuardianUnlock?.())) return;
    edit = !edit;
    render();
};
$('biaRoutineAdd').onclick = () => {
    if (!admin()) { edit=false; render(); return; }
    const name = $('biaRoutineName').value.trim();
    if (!name) { $('biaRoutineFeedback').textContent='Informe o nome da atividade.'; return; }
    state.items.push({id: 'task'+Date.now(),period,name:name.slice(0,60),icon:$('biaRoutineIcon').value,time:$('biaRoutineTime').value,done:false});
    $('biaRoutineName').value=''; $('biaRoutineTime').value=''; save(); render();
};
$('biaRoutineLearn').onchange = event => {
    if (!admin()) { render(); return; }
    state.learnTimes = event.target.checked;
    save(); renderSuggestion();
};
$('biaRoutineUseSuggestion').onclick = () => {
    if (!suggestion || !admin()) return;
    state.priorityId = suggestion.item.id;
    state.pausedId = null;
    dismissed.add(suggestion.item.id);
    save(); render('A ordem da rotina mudou para hoje.');
    $('biaRoutineNow').focus();
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
    if (event.detail?.page === 'routine') { period = currentPeriod(); render(); }
});
document.addEventListener('bia:admin-access-changed', () => render());
setInterval(() => {
    if (!$('page-routine').classList.contains('active')) return;
    if (checkDay()) { period = currentPeriod(); render(); }
    else renderSuggestion();
},60000);
render();
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
