const{test}=require('node:test'),assert=require('node:assert/strict');
const{stableCategory,favorites,staticPicture}=require('../js/pictogram-board.js');
test('ordem por categoria não depende de uso e acrescenta novos ao final',()=>{
 const a={id:'a',category:'comer'},b={id:'b',category:'comer',custom:true},c={id:'c',category:'comer',custom:true};const data=[a,b,c];
 assert.deepEqual(stableCategory(data,'comer').map(s=>s.id),['a','b','c']);b.count=100;assert.deepEqual(stableCategory([...data,{id:'d',category:'comer'}],'comer').map(s=>s.id),['a','b','c','d']);assert.equal(data.length,3);assert.equal(stableCategory(Array.from({length:20},(_,i)=>({id:String(i),category:'comer'})),'comer').length,20);
});
test('favoritos seguem seleção explícita, ignoram duplicados e símbolos removidos',()=>{
 const symbols=[{id:'a'},{id:'b'},{id:'c'}];assert.deepEqual(favorites(symbols,['b','a','b','removed']).map(s=>s.id),['b','a']);
});
test('pictogramas locais só correspondem ao rótulo padrão, sem trocar imagens de personalizados',()=>{
 assert.equal(staticPicture({id:'agua',label:'Beber água'}),'assets/arasaac/2276.png');assert.equal(staticPicture({id:'agua',label:'Suco'}),null);assert.equal(staticPicture({id:'custom',label:'Beber água'}),null);
});
