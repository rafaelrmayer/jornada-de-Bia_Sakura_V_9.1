/* Busca explícita e imagens locais; nunca consulta o catálogo ao abrir o app. */
(function(root){
'use strict';
const API='https://api.arasaac.org/v1/pictograms/pt/search/',STATIC='https://static.arasaac.org/pictograms/',LIMIT=180000;
const validId=id=>Number.isSafeInteger(id)&&id>0&&id<10000000;
function imageUrl(id){if(!validId(id))throw Error('Pictograma inválido.');return STATIC+id+'/'+id+'_300.png';}
function normalize(data){if(!Array.isArray(data))throw Error('Catálogo indisponível.');const seen=new Set();return data.filter(x=>validId(x?._id)&&!seen.has(x._id)&&seen.add(x._id)).slice(0,12).map(x=>({id:x._id,label:String((Array.isArray(x.keywords)?x.keywords:[]).find(k=>typeof k?.keyword==='string')?.keyword||'Pictograma').slice(0,80)}));}
function validPicture(value){return value&&validId(value.id)&&typeof value.image==='string'&&value.image.length<=LIMIT*1.4&&/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/=]+$/.test(value.image)?{id:value.id,image:value.image,license:'CC BY-NC-SA 4.0',author:'Sergio Palao',source:'ARASAAC / Governo de Aragão',sourceUrl:'https://arasaac.org/pictograms/'+value.id}:null;}
async function search(query,signal,fetcher=root.fetch.bind(root)){
 query=query.trim();if(query.length<2||query.length>60)throw Error('Digite entre 2 e 60 caracteres.');
 const r=await fetcher(API+encodeURIComponent(query),{signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
 if(r.status===404)return [];if(!r.ok)throw Error('Não foi possível consultar o ARASAAC.');return normalize(await r.json());
}
async function download(id,signal,fetcher=root.fetch.bind(root)){
 const r=await fetcher(imageUrl(id),{signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
 if(!r.ok||!/^image\/png(?:;|$)/i.test(r.headers.get('content-type')||'')||Number(r.headers.get('content-length'))>LIMIT)throw Error('Imagem indisponível.');
 const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length>LIMIT||[137,80,78,71,13,10,26,10].some((n,i)=>bytes[i]!==n))throw Error('Imagem inválida ou grande demais.');
 let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
 return {id,image:'data:image/png;base64,'+btoa(binary),license:'CC BY-NC-SA 4.0'};
}
const exported={imageUrl,normalize,validPicture,search,download};if(typeof module!=='undefined')module.exports=exported;
if(!root.document)return;
const $=id=>document.getElementById(id),host=$('arasaacPicker');if(!host)return;
// Fora do main: telas com contexto de empilhamento próprio não podem cobrir o modal.
document.body.appendChild($('symbolModal'));
$('symbolModal').setAttribute('role','dialog');$('symbolModal').setAttribute('aria-modal','true');$('symbolModal').setAttribute('aria-labelledby','symbolModalTitle');
let selected=null,controller=null,revision=0,preparing=false;
const allowed=()=>root.SecurityService?.isUnlocked?.()&&$('symbolModal').classList.contains('active');
function cancel(){preparing=false;revision++;controller?.abort();controller=null;}
function preview(){const box=$('arasaacSelected');box.replaceChildren();if(selected){const img=document.createElement('img');img.src=selected.image;img.alt='Pictograma selecionado';box.append(img,document.createTextNode('Imagem escolhida. Será guardada ao salvar o símbolo.'));}else box.textContent='Sem pictograma selecionado. Você pode usar um emoji.';}
root.JBArasaac={...exported,reset(value){cancel();selected=validPicture(value);$('arasaacResults').replaceChildren();$('arasaacQuery').value='';$('arasaacStatus').textContent='';preview();},getSelected:()=>validPicture(selected),isPreparing:()=>preparing};
$('arasaacSearch').onclick=async()=>{
 if(!allowed())return;cancel();const current=revision,c=new AbortController();controller=c;const timer=setTimeout(()=>c.abort(),10000);
 $('arasaacStatus').textContent='Buscando pictogramas…';$('arasaacResults').replaceChildren();
 try{const items=await search($('arasaacQuery').value,c.signal);if(current!==revision||!allowed())return;
 $('arasaacStatus').textContent=items.length?'Escolha uma imagem.':'Nenhum pictograma encontrado. Tente outra palavra.';
 for(const item of items){const b=document.createElement('button');b.type='button';const img=document.createElement('img');img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';img.src=imageUrl(item.id);img.alt='';b.append(img,document.createTextNode(item.label));b.onclick=async()=>{
  if(!allowed())return;cancel();preparing=true;const current=revision,c=new AbortController();controller=c;const timer=setTimeout(()=>c.abort(),10000);$('arasaacStatus').textContent='Preparando imagem para usar offline…';
  try{const picture=await download(item.id,c.signal);if(current!==revision||!allowed())return;selected=picture;preview();$('arasaacStatus').textContent='Pictograma pronto. Preencha o nome e salve o símbolo.';}
  catch{if(current===revision)$('arasaacStatus').textContent='Não foi possível guardar a imagem. O símbolo atual foi preservado.';}
  finally{clearTimeout(timer);if(current===revision)preparing=false;}
 };$('arasaacResults').append(b);}
 }catch(error){if(current===revision)$('arasaacStatus').textContent=error.name==='AbortError'?'Busca interrompida. Tente novamente.':error.message;}
 finally{clearTimeout(timer)}
};
$('arasaacRemove').onclick=()=>{cancel();selected=null;preview();};
$('arasaacQuery').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();$('arasaacSearch').click();}};
document.addEventListener('bia:admin-access-changed',()=>{if(!root.SecurityService?.isUnlocked?.()){root.JBArasaac.reset();$('symbolModal').classList.remove('active');}});
new MutationObserver(()=>{if(!$('symbolModal').classList.contains('active'))cancel();}).observe($('symbolModal'),{attributes:true,attributeFilter:['class']});
document.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||!$('symbolModal').classList.contains('active'))return;
 const nodes=[...$('symbolModal').querySelectorAll('button,input,select,a[href],textarea')].filter(n=>!n.disabled&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1);
 if(!first)return;
 if(!$('symbolModal').contains(document.activeElement)||(event.shiftKey&&document.activeElement===first)||(!event.shiftKey&&document.activeElement===last)){event.preventDefault();(event.shiftKey?last:first).focus();}
});
preview();
})(typeof window==='undefined'?globalThis:window);
