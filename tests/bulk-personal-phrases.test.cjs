const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');const start=source.indexOf("    el('myCommClearAll')?.addEventListener");const handler=source.slice(start,source.indexOf("    document.addEventListener('click',e=>{",start));
function setup({unlocked=true,accept=true,writable=true}={}){
 let click;const writes=[];const nodes={myCommClearAll:{addEventListener:(type,fn)=>click=fn},myCommClearStatus:{},myCommPhraseForm:{hidden:false},myCommAddPhrase:{focus(){}}};
 const data={phrases:[{id:'1',text:'Quero dormir.',category:'Rotina'},{id:'2',text:'Quero brincar.',category:'Atividades'}],categories:['Rotina','Atividades'],favoriteSymbols:['9']};
 const ctx=vm.createContext({STORE_KEY:"myCommunicationData",data,editingId:null,activeCategory:'Atividades',el:id=>nodes[id],window:{SecurityService:{isUnlocked:()=>unlocked}},confirm:()=>accept,StorageService:{setItem:(k,v)=>{writes.push([k,v]);return writable;}},render(){},contextBrain:{stats:{preservar:true}}});
 vm.runInContext(handler,ctx);return {click,ctx,writes,nodes};
}
test('exclusão em massa exige desbloqueio e confirmação',()=>{for(const options of [{unlocked:false},{accept:false}]){const t=setup(options);t.click();assert.equal(t.writes.length,0);assert.equal(t.ctx.data.phrases.length,2);}});
test('apaga todas as frases apesar do filtro e preserva categorias, favoritos e aprendizado',()=>{const t=setup();t.click();assert.equal(t.writes.length,1);assert.equal(t.writes[0][0],'myCommunicationData');const saved=JSON.parse(t.writes[0][1]);assert.deepEqual(saved,{phrases:[],categories:['Rotina','Atividades'],favoriteSymbols:['9']});assert.equal(t.ctx.data.phrases.length,0);assert.equal(t.ctx.contextBrain.stats.preservar,true);assert.equal(t.nodes.myCommPhraseForm.hidden,true);});
test('falha de persistência não limpa a lista em memória nem anuncia sucesso',()=>{const t=setup({writable:false});t.click();assert.equal(t.ctx.data.phrases.length,2);assert.ok(t.nodes.myCommClearStatus.textContent.includes('Não foi possível'));});
