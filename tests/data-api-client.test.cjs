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
test('compara apenas vínculos da família e não recria cartões excluídos',()=>{
 const remote=[{id:cardId,category_id:category.id,client_id:clientId,text:'Conta',updated_at:'2026-11-17T12:00:00Z'}];
 const phrases=[{id:'same',text:'Conta',category:'Geral',cloudSources:[{family,id:cardId}]},
 {id:'different',text:'Aparelho',category:'Geral',cloudIds:{[family]:clientId}},
 {id:'other',text:'Outra família',cloudSources:[{family:'other',id:cardId}]},
 {id:'deleted',text:'Excluído',cloudSources:[{family,id:'deleted'}]}];
 const result=m.planEdits(phrases,[category],remote,family);
 assert.deepEqual(result.map(x=>x.phrase.id),['different']);
 assert.equal(result[0].localCategory.id,category.id);
});
test('edição envia versão consultada e não aceita sobrescrita concorrente',async()=>{
 let sent;
 const client=m.createClient(async(url,init)=>{sent=JSON.parse(init.body);return {ok:false,status:409};});
 await assert.rejects(client.edit({id:cardId,updated_at:'2026-11-17T12:00:00Z'},{text:'Nova'},'token',family),e=>e.status===409);
 assert.deepEqual(sent,{text:'Nova',expected_updated_at:'2026-11-17T12:00:00Z'});
 await assert.rejects(client.edit({id:cardId},{text:'Nova'},'token',family),/Versão/);
});
test('envio de categorias elimina repetidas, vazias e equivalentes do catálogo',()=>{
 assert.deepEqual(m.missingCategories(['Geral',' Escola ','escola','', '   ', 'x'.repeat(121), 'Terapia'],[category]),['Escola','Terapia']);
});
test('frases com categoria equivalente usam identificador do catálogo',()=>{
 const plan=m.planUpload([{id:'1',text:'Mochila',category:' geral '}],[category],[],family);
 assert.equal(plan.planned[0].category_id,category.id);
});
test('categorias são criadas na família selecionada, sem envio de frase',async()=>{
 let captured;
 const client=m.createClient(async(url,init)=>{captured={url,init};return {ok:true,json:async()=>({...category,name:'Escola',family_id:family})};});
 await client.createCategory('Escola','token',family);
 assert.equal(captured.url,m.BASE+'/v1/family-categories');
 assert.equal(captured.init.headers['X-Family-ID'],family);
 assert.deepEqual(JSON.parse(captured.init.body),{name:'Escola'});
});
test('lixeira exige versão e mantém token e família somente nos cabeçalhos',async()=>{
 let captured;
 const card={id:cardId,text:'Ajuda',category_id:category.id,updated_at:'2026-11-17T12:00:00Z'};
 const client=m.createClient(async(url,init)=>{captured={url,init};return {ok:true,json:async()=>({...card,deleted_at:'2026-11-17T12:01:00Z'})};});
 await client.changeTrash(card,false,'token',family);
 assert.equal(captured.url,m.BASE+'/v1/cards/'+cardId+'/archive');
 assert.deepEqual(JSON.parse(captured.init.body),{expected_updated_at:card.updated_at});
 assert.equal(captured.init.headers['X-Family-ID'],family);
 await client.changeTrash(card,true,'token',family);
 assert.equal(captured.url,m.BASE+'/v1/cards/'+cardId+'/restore');
 await assert.rejects(client.changeTrash({id:cardId},true,'token',family),/Versão/);
});
test('recusa servidor sem suporte à lixeira',async()=>{
 const client=m.createClient(async()=>({ok:true,json:async()=>({paths:{}})}));
 await assert.rejects(client.compatibleTrash(),/atualização/);
});
