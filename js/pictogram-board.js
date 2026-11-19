/* Prancha pessoal estável: escolhas explícitas, sem reordenação por uso ou IA. */
(function(root){
'use strict';
const fixed={agua:['Beber água',2276],banheiro:['Banheiro',15814],brincar:['Brincar',6537],musica:['Música',2746],feliz:['Feliz',9907],triste:['Triste',35545],cansado:['Cansado',35537]};
function stableCategory(symbols,category){return symbols.filter(s=>s.category===category);}
function favorites(symbols,ids){const seen=new Set();return ids.map(id=>symbols.find(s=>String(s.id)===String(id))).filter(s=>s&&!seen.has(s.id)&&seen.add(s.id));}
function staticPicture(symbol){const match=fixed[symbol?.id];return match&&symbol.label===match[0]?'assets/arasaac/'+match[1]+'.png':null;}
const api={stableCategory,favorites,staticPicture};if(typeof module!=='undefined')module.exports=api;
if(!root.document)return;
const $=id=>document.getElementById(id),bridge=root.JBPictogramBridge;if(!$('pictogramBoard')||!bridge)return;
let category=null,signature='';
function visual(symbol){const box=document.createElement('span');box.className='pictogram-picture';box.setAttribute('aria-hidden','true');const image=root.JBArasaac?.validPicture(symbol.pictogram)?.image||staticPicture(symbol)||(symbol.id==='board-quero'?'assets/arasaac/5441.png':null);
 if(image){const img=document.createElement('img');img.src=image;img.alt='';box.append(img);}else box.textContent=symbol.emoji||'🔣';return box;}
function card(symbol){const b=document.createElement('button');b.type='button';b.className='pictogram-card';b.dataset.pictogramId=symbol.id;b.setAttribute('aria-label','Adicionar símbolo '+symbol.label);const label=document.createElement('span');label.className='label';label.textContent=symbol.label;b.append(visual(symbol),label);b.onclick=()=>bridge.add(symbol.id);return b;}
function renderMessage(){$('pictogramStatus').textContent='';const state=bridge.snapshot(),list=$('pictogramSequence');list.replaceChildren();for(const symbol of state.selected){const li=document.createElement('li'),label=document.createElement('span');label.textContent=symbol.label;li.append(visual(symbol),label);list.append(li);}
 $('pictogramSentence').textContent=state.text||'Toque nos cartões para montar sua mensagem.';
 for(const id of ['pictogramSpeak','pictogramUndo','pictogramClear','pictogramSave'])$(id).disabled=!state.selected.length;
}
function refresh(){const state=bridge.snapshot(),ids=root.JBCommunication?.favoriteSymbolIds?.()||[],next=JSON.stringify([state.symbols,state.categories,ids]);if(next===signature)return;signature=next;
 const active=document.activeElement?.closest('[data-pictogram-id]')?.dataset.pictogramId;
 const favorite=favorites(state.symbols,ids);$('pictogramFavorites').replaceChildren(...favorite.map(card));$('pictogramFavoritesEmpty').hidden=!!favorite.length;
 if(!state.categories.some(c=>c.id===category))category=state.categories[0]?.id;
 const tabs=$('pictogramCategories');tabs.replaceChildren();for(const item of state.categories){const b=document.createElement('button');b.type='button';b.textContent=item.label;b.dataset.pictogramCategory=item.id;b.setAttribute('aria-pressed',String(item.id===category));b.onclick=()=>{category=item.id;signature='';refresh();$('pictogramCategories').querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});};tabs.append(b);}
 $('pictogramCards').replaceChildren(...stableCategory(state.symbols,category).map(card));
 if(active)[...document.querySelectorAll('#pictogramBoard [data-pictogram-id]')].find(b=>b.dataset.pictogramId===active)?.focus({preventScroll:true});
}
const starters=[{id:'board-eu',label:'Eu',emoji:'🙋'},{id:'board-quero',label:'Quero',emoji:'💬',boardImage:'assets/arasaac/5441.png'},{id:'modifier-more',label:'Mais',emoji:'➕'},{id:'modifier-no',label:'Não',emoji:'❌'},{id:'modifier-now',label:'Agora',emoji:'⏱️'}];
$('pictogramStarters').replaceChildren(...starters.map(card));
$('pictogramOpenReady').onclick=()=>{const title=$('myCommPhraseTitle');title.setAttribute('tabindex','-1');title.scrollIntoView({block:'start'});title.focus({preventScroll:true});};
$('pictogramSpeak').onclick=()=>bridge.speak();
$('pictogramUndo').onclick=()=>{bridge.undo();if(!bridge.snapshot().selected.length)$('pictogramStarters').querySelector('button')?.focus();};
$('pictogramClear').onclick=()=>{bridge.clear();$('pictogramStarters').querySelector('button')?.focus();};
$('pictogramSave').onclick=()=>{try{const outcome=root.JBCommunication.saveComposedPhrase(bridge.snapshot().text);$('pictogramStatus').textContent=outcome.added?'Frase guardada em Minhas frases para usar com um toque.':'Essa frase já está em Minhas frases. Nenhuma cópia foi criada.';}catch(error){$('pictogramStatus').textContent=error.message;}};
$('pictogramManageFavorites').onclick=()=>{const summary=$('myCommFavoritesTitle');summary.parentElement.open=true;summary.scrollIntoView({block:'start'});summary.focus();};
root.JBPictogramBoard={refresh};
document.addEventListener('bia:composition-changed',renderMessage);document.addEventListener('bia:personal-content-changed',refresh);document.addEventListener('bia:pagechange',event=>{if(event.detail?.page==='my-communication'){refresh();renderMessage();}});
refresh();renderMessage();
})(typeof window==='undefined'?globalThis:window);
