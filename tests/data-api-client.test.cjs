const {test}=require('node:test'),assert=require('node:assert/strict');
const m=require('../js/data-api-client.js');
const category={id:'00000000-0000-4000-8000-000000000001',name:'Geral'};
const family='00000000-0000-4000-8000-000000000002',cardId='00000000-0000-4000-8000-000000000003',clientId='00000000-0000-4000-8000-000000000004';
test('planeja apenas novas cópias e preserva alterações, exclusões remotas e categorias locais',()=>{
 const remote=[{id:cardId,category_id:category.id,client_id:clientId,text:'Original'}];
 const phrases=[{id:'1',text:'Original',category:'Geral'},{id:'2',text:'Editada',category:'Geral',cloudIds:{[family]:clientId}},{id:'3',text:'Nova',category:'Geral'},{id:'4',text:'Custom',category:'Minha categoria'},{id:'5',text:'Não recriar',category:'Geral',cloudSources:[{family,id:'deleted'}]}];
 const plan=m.planUpload(phrases,[category],remote,family);
 assert.deepEqual(plan.planned.map(p=>p.id),['3']);assert.deepEqual(plan.counts,{existing:1,changed:2,unsupported:1});
});
test('referências de outra família não bloqueiam cópia explicitamente solicitada',()=>{
 const plan=m.planUpload([{id:'1',text:'Nova',category:'Geral',cloudSources:[{family:'other',id:cardId}]}],[category],[],family);
 assert.equal(plan.planned.length,1);
});
test('valida cartão e família antes de importar dados',()=>{
 assert.throws(()=>m.validateCards([{id:cardId,category_id:category.id,text:''}]));
 assert.throws(()=>m.validateFamilies([{id:'invalid',name:'Família'}]));
 assert.equal(m.validateCards([{id:cardId,category_id:category.id,text:'ajuda'}]).length,1);
});
test('requisição omite cookies e não transmite senha nas mensagens de erro',async()=>{
 let captured;
 const client=m.createClient(async(url,init)=>{captured={url,init};return {ok:false,status:422,json:async()=>({detail:'senha-secreta'})};});
 await assert.rejects(client.login('teste@example.com','senha-secreta'),e=>e.status===422&&!e.message.includes('senha-secreta'));
 assert.equal(captured.init.credentials,'omit');assert.equal(captured.init.referrerPolicy,'no-referrer');assert.equal(captured.url,m.BASE+'/v1/auth/login');
});
test('recusa backend sem descoberta de famílias e identificador repetível',async()=>{
 const client=m.createClient(async()=>({ok:true,json:async()=>({paths:{},components:{schemas:{}}})}));
 await assert.rejects(client.compatible(),/atualização/);
});
