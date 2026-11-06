/* Sakura V9: atividades sem rede e sem alterar o assistente. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
// Carimbos sobre o mesmo canvas, mantendo o desenho livre e exportação existentes.
const canvas=$('biaCanvas'),ctx=canvas?.getContext('2d');
if(canvas&&ctx){
  canvas.addEventListener('pointerdown',e=>{
    const tool=$('biaArtTool')?.value;
    if(!tool||tool==='pencil')return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.stopImmediatePropagation();
    const box=canvas.getBoundingClientRect(),x=(e.clientX-box.left)*canvas.width/box.width,y=(e.clientY-box.top)*canvas.height/box.height;
    const stamps={flower:'🌸',butterfly:'🦋',star:'⭐',heart:'💗'};
    ctx.save();ctx.font='46px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(stamps[tool],x,y);ctx.restore();
  },true);
  canvas.addEventListener('pointermove',e=>{if($('biaArtTool')?.value!=='pencil')e.stopImmediatePropagation();},true);
  $('biaArtApplyBackground')?.addEventListener('click',()=>{
    const color=$('biaArtBackground').value;
    if(!confirm('Aplicar o fundo vai substituir o desenho atual. Continuar?'))return;
    ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);
  });
}
// Jardim: apenas notas originais disparadas por interação direta, com limite de volume.
let audio=null,oscillators=new Set();
function silence(){for(const osc of oscillators){try{osc.stop();}catch(_){}}oscillators.clear();if($('biaGardenStatus'))$('biaGardenStatus').textContent='Jardim silencioso.';}
function play(freq,label){
  const volume=Number($('biaGardenVolume')?.value||0)/100;
  if(volume<=0){$('biaGardenStatus').textContent='Volume em zero.';return;}
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)throw Error('Áudio não disponível');
    if(!audio)audio=new AC();
    if(audio.state==='suspended')audio.resume().catch(()=>{});
    const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
    osc.type='sine';osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.0001,t);gain.gain.linearRampToValueAtTime(Math.max(.0001,volume*.28),t+.035);gain.gain.exponentialRampToValueAtTime(.0001,t+.65);
    osc.connect(gain).connect(audio.destination);oscillators.add(osc);
    osc.onended=()=>{oscillators.delete(osc);osc.disconnect();gain.disconnect();};
    osc.start(t);osc.stop(t+.68);
    $('biaGardenStatus').textContent='Você tocou: '+label+'.';
  }catch(_){$('biaGardenStatus').textContent='Áudio indisponível neste navegador.';}
}
document.querySelectorAll('[data-garden-note]').forEach(b=>b.addEventListener('click',()=>play(Number(b.dataset.gardenNote),b.innerText.trim())));
$('biaGardenStop')?.addEventListener('click',silence);
document.addEventListener('visibilitychange',()=>{if(document.hidden)silence();});
document.addEventListener('bia:activity-selected',e=>{if(e.detail.tab!=='garden')silence();});
// Associação de formas e cores: apresentação sem avaliação, pontos ou limite de tempo.
const examples=[
  {label:'Círculo rosa',shape:'●',color:'#C34C76'},
  {label:'Quadrado azul',shape:'■',color:'#2565A4'},
  {label:'Triângulo verde',shape:'▲',color:'#337A52'},
  {label:'Estrela amarela',shape:'★',color:'#916500'},
  {label:'Coração vermelho',shape:'♥',color:'#B33E48'}
];
let index=0;
function render(){
  const target=examples[index],holder=$('biaColorsTarget'),choices=$('biaColorsChoices');
  if(!holder||!choices)return;
  holder.replaceChildren();choices.replaceChildren();
  const title=document.createElement('strong');title.textContent='Encontre: '+target.label;
  const figure=document.createElement('span');figure.className='bia-colors-figure';figure.textContent=target.shape;figure.style.color=target.color;
  holder.append(title,figure);
  const opts=[target,examples[(index+1)%examples.length],examples[(index+2)%examples.length]];
  // deterministically rotate positions to avoid always putting the answer first.
  opts.push(...opts.splice(0,index%3));
  opts.forEach(item=>{
    const b=document.createElement('button');b.type='button';b.className='bia-colors-choice';b.setAttribute('aria-label',item.label);
    const shape=document.createElement('span');shape.className='bia-colors-figure';shape.textContent=item.shape;shape.style.color=item.color;
    const name=document.createElement('span');name.textContent=item.label;b.append(shape,name);
    b.addEventListener('click',()=>{$('biaColorsStatus').textContent=item===target?'Você encontrou a figura!':'Pode tentar outra figura, no seu tempo.';});
    choices.append(b);
  });
  $('biaColorsStatus').textContent='Escolha a figura igual à apresentada.';
}
$('biaColorsNext')?.addEventListener('click',()=>{index=(index+1)%examples.length;render();});render();
})();
