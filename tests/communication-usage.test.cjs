const {test}=require('node:test'),assert=require('node:assert/strict');
const {mostUsed}=require('../js/communication-usage.js');
test('atalhos usam escolhas locais reais sem alterar ordem original',()=>{
 const phrases=[{id:'1',text:'Água'},{id:'2',text:'Descansar'},{id:'3',text:'Brincar'}];
 const before=JSON.stringify(phrases);
 assert.deepEqual(mostUsed(phrases,{'Água':2,'Descansar':5,'Inexistente':999}).map(p=>p.id),['2','1']);
 assert.equal(JSON.stringify(phrases),before);
});
test('não inventa atalhos sem uso nem reapresenta frases removidas',()=>{
 assert.deepEqual(mostUsed([{id:'1',text:'Nova'}],{}),[]);
 assert.deepEqual(mostUsed([],{'Água':20}),[]);
 assert.deepEqual(mostUsed([{id:'x',text:'Água',deletedAt:'2026-01-01'}],{'Água':20}),[]);
});
test('filtra contagens inválidas, limita a seis e não duplica texto',()=>{
 const phrases=Array.from({length:10},(_,i)=>({id:String(i),text:'Frase '+i}));
 const usage=Object.fromEntries(phrases.map((p,i)=>[p.text,10-i]));
 assert.equal(mostUsed(phrases,usage).length,6);
 assert.deepEqual(mostUsed([{id:'1',text:'x'},{id:'2',text:'x'},{id:'3',text:'y'}],{x:1,y:1}).map(p=>p.id),['1','3']);
 for(const value of [NaN,Infinity,-1,'5',0,1.5])assert.deepEqual(mostUsed([{id:'1',text:'x'}],{x:value}),[]);
});
