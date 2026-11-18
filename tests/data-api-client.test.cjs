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
test('troca de senha usa token sem família e não expõe senha em erros',async()=>{
 let captured;
 const client=m.createClient(async(url,init)=>{captured={url,init};return {ok:false,status:400,json:async()=>({detail:'segredo'})};});
 await assert.rejects(client.changePassword('segredo-atual','segredo-novo1','token'),e=>e.status===400&&e.message.includes('senha atual')&&!e.message.includes('segredo'));
 assert.equal(captured.url,m.BASE+'/v1/auth/change-password');
 assert.equal(captured.init.headers['X-Family-ID'],undefined);
 assert.equal(captured.init.headers.Authorization,'Bearer token');
 assert.deepEqual(JSON.parse(captured.init.body),{current_password:'segredo-atual',new_password:'segredo-novo1'});
});
test('troca de senha recusa backend sem contrato correspondente',async()=>{
 const client=m.createClient(async()=>({ok:true,json:async()=>({paths:{}})}));
 await assert.rejects(client.compatiblePassword(),/atualização/);
});
test('recuperação usa POST sem token ou segredo na URL e mantém erros genéricos',async()=>{
 let captured;
 const client=m.createClient(async(url,init)=>{captured={url,init};return {ok:false,status:400,json:async()=>({detail:'sensitive-code'})};});
 await assert.rejects(client.recoveryConfirm('test@example.com','sensitive-code','sensitive-password1'),e=>e.status===400&&!e.message.includes('sensitive'));
 assert.equal(captured.url,m.BASE+'/v1/auth/password-recovery/confirm');
 assert.equal(captured.init.headers.Authorization,undefined);
 assert.deepEqual(JSON.parse(captured.init.body),{email:'test@example.com',code:'sensitive-code',new_password:'sensitive-password1'});
});
test('recuperação indisponível não informa uma ativação inexistente',async()=>{
 const client=m.createClient(async()=>({ok:true,json:async()=>({enabled:false})}));
 assert.equal(await client.recoveryStatus(),false);
});
test('permissão de consulta nunca habilita escrita na conta',()=>{
 assert.equal(m.canWrite({role:'viewer'}),false);assert.equal(m.canWrite({role:'member'}),true);
 assert.equal(m.canWrite({role:'owner'}),true);assert.equal(m.canWrite(null),false);
 assert.throws(()=>m.validateFamilies([{id:family,name:'Teste',role:'unknown'}]));
});
test('revogar acesso aceita resposta 204 sem tentar interpretar JSON vazio',async()=>{
 let seen;
 const client=m.createClient(async(url,init)=>{seen={url,init};return {ok:true,status:204,json:()=>{throw Error('empty');}};});
 assert.equal(await client.memberRevoke(cardId,'token',family),null);
 assert.equal(seen.init.method,'DELETE');assert.equal(seen.init.headers['X-Family-ID'],family);
});
test('aceitar convite não usa a família atual nem expõe código no caminho',async()=>{
 let seen;
 const client=m.createClient(async(url,init)=>{seen={url,init};return {ok:true,json:async()=>({id:family,name:'Família',role:'viewer'})};});
 await client.inviteAccept('secret-code','token');
 assert.equal(seen.url,m.BASE+'/v1/family-invitations/accept');
 assert.equal(seen.init.headers['X-Family-ID'],undefined);
 assert.deepEqual(JSON.parse(seen.init.body),{code:'secret-code'});
});
test('histórico valida ordem, autor, ação e cursor antes de apresentar a página',()=>{
 const event={id:4,card_id:cardId,actor_id:clientId,actor_email:'actor@example.com',action:'card.created',recorded_at:'2026-11-17T12:00:00Z',card_label:'Identificação atual'};
 assert.equal(m.validateHistory({events:[event],next_before_id:4}).events.length,1);
 assert.throws(()=>m.validateHistory({events:[event,event],next_before_id:null}));
 assert.throws(()=>m.validateHistory({events:[{...event,action:'unknown'}],next_before_id:null}));
 assert.throws(()=>m.validateHistory({events:[event],next_before_id:5}));
 assert.throws(()=>m.validateHistory({events:[],next_before_id:4}));
});
test('histórico pagina por consulta com token e família sem alterar cartões',async()=>{
 let seen;
 const client=m.createClient(async(url,init)=>{seen={url,init};return {ok:true,json:async()=>({events:[],next_before_id:null})};});
 await client.history('token',family,123);
 assert.equal(seen.url,m.BASE+'/v1/card-history?before_id=123');
 assert.equal(seen.init.method,'GET');
 assert.equal(seen.init.headers['X-Family-ID'],family);
 await assert.rejects(client.history('token',family,-1),/Página/);
 const stale=m.createClient(async()=>({ok:true,json:async()=>({events:[{id:4,card_id:cardId,actor_id:null,actor_email:null,action:'card.created',recorded_at:'2026-11-17T12:00:00Z',card_label:null}],next_before_id:null})}));
 await assert.rejects(stale.history('token',family,4),/incompatível/);
});


test('política nova aceita limites e preserva login de senha antiga',async()=>{
 for(const value of ['abc123','a1'+'x'.repeat(18),'Ação12!'])assert.doesNotThrow(()=>m.validateNewPassword(value));
 for(const value of ['abc12','abcdef','123456','a1'+'x'.repeat(19)])assert.throws(()=>m.validateNewPassword(value),e=>e.status===422);
 let calls=0;
 const client=m.createClient(async()=>{calls++;return {ok:true,json:async()=>({access_token:'fake-token',expires_in:900})};});
 await assert.rejects(client.register('test@example.com','abcdef','Teste'),e=>e.status===422);
 await assert.rejects(client.changePassword('antiga','123456','token'),e=>e.status===422);
 await assert.rejects(client.recoveryConfirm('test@example.com','000042','abcdef'),e=>e.status===422);
 assert.equal(calls,0);
 await client.login('test@example.com','senha-antiga-muito-longa-sem-numero');
 assert.equal(calls,1);
});

test('conexão Google usa corpo POST e mantém identidade somente na resposta',async()=>{
 const seen=[];
 const client=m.createClient(async(url,init)=>{seen.push({url,init});return {ok:true,json:async()=>({access_token:'fake-token',email:'test@gmail.com',expires_in:900})};});
 const result=await client.googleLogin('fictitious-google-token','fictitious-challenge');
 assert.equal(result.email,'test@gmail.com');
 assert.equal(seen[0].url,m.BASE+'/v1/auth/google/login');
 assert.equal(seen[0].init.method,'POST');
 assert.deepEqual(JSON.parse(seen[0].init.body),{credential:'fictitious-google-token',challenge:'fictitious-challenge'});
 assert.equal(seen[0].init.credentials,'omit');
 assert(!seen[0].url.includes('fictitious'));
});
test('Google não configurado e vinculação pendente têm mensagens claras',async()=>{
 const disabled=m.createClient(async()=>({ok:true,json:async()=>({enabled:false,client_id:null})}));
 await assert.rejects(disabled.googleConfig(),/ainda está sendo configurado/);
 const collision=m.createClient(async()=>({ok:false,status:409}));
 await assert.rejects(collision.googleLogin('fake','fake'),e=>e.status===409&&e.message.includes('vinculação'));
});
