const {test} = require('node:test');
const assert = require('node:assert/strict');
const {endpoint, validate, request} = require('../js/card-suggestions.js');
const phrases = ['Quero comer.', 'Quero jogar Zelda: Ocarina of Time.', 'Quero descansar.', 'Quero desenhar.', 'Quero ouvir uma história.'];
const payload = () => ({model:'cards-demo', experimental:true, synthetic_data:true,
  cards:[1,4,2,0,3].map(id=>({id,phrase:phrases[id]})),fixed_options:['Quero outra coisa.','Não quero agora.']});
test('preserva ordem, conjunto completo e contrato da demonstração',()=>assert.deepEqual(validate(payload()),[1,4,2,0,3]));
test('rejeita resposta incompleta, duplicada, desconhecida ou com texto alterado',()=>{
  for (const change of [d=>d.cards.pop(),d=>d.cards[1]=d.cards[0],d=>d.cards[0]={id:99},d=>d.cards[0].phrase='outra',d=>d.fixed_options=[],d=>d.synthetic_data=false]) {
    const d=payload();change(d);assert.throws(()=>validate(d));
  }
});
test('aceita somente endereço HTTPS sem segredos ou parâmetros',()=>{
  assert.equal(endpoint('https://api.example/'),'https://api.example/v1/cards/suggestions');
  for(const url of ['http://api.example','javascript:alert(1)','https://user:pass@api.example','https://api.example/?token=x']) assert.throws(()=>endpoint(url));
});
test('envia só contexto mínimo, sem credenciais',async()=>{
  let options;
  const order=await request('https://api.example','tarde',1,async(url,opts)=>{options=opts;return {ok:true,json:async()=>payload()};});
  assert.deepEqual(order,[1,4,2,0,3]);
  assert.deepEqual(JSON.parse(options.body),{period:'tarde',last_activity:1});
  assert.equal(options.credentials,'omit');
});
test('propaga falhas e cancela após limite',async()=>{
  await assert.rejects(request('https://api.example','tarde',null,async()=>({ok:false})));
  await assert.rejects(request('https://api.example','tarde',null,async(url,opts)=>new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(new Error('timeout')))),10));
});
const {resolveOrder}=require('../js/card-suggestions.js');
const local=()=>[0,1,2,3,4];
test('API válida tem prioridade e não executa modelo local',async()=>{
 const result=await resolveOrder({remote:true,base:'https://api.example',period:1,last:1,local:()=>{throw Error('não deve executar');},fetcher:async()=>({ok:true,json:async()=>payload()})});assert.equal(result.source,'remote');assert.deepEqual(result.order,[1,4,2,0,3]);
});
test('sem internet ou endereço usa local sem pedido de rede',async()=>{
 for(const options of [{online:false,base:'https://api.example'},{online:true,base:''}]){
 const result=await resolveOrder({...options,remote:true,period:1,last:null,local,fetcher:()=>{throw Error('sem pedido');}});assert.equal(result.source,'local');assert.deepEqual(result.order,local());}
});
test('erro HTTP, rede e resposta incompatível recuperam modelo local',async()=>{
 for(const fetcher of [async()=>({ok:false}),async()=>{throw Error('rede');},async()=>({ok:true,json:async()=>({cards:[]})})]){
 const result=await resolveOrder({remote:true,base:'https://api.example',period:1,last:null,local,fetcher});assert.equal(result.source,'local');}
});
test('timeout recupera local, mas cancelamento explícito não inicia recuperação',async()=>{
 const fetcher=async(url,opts)=>new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(new Error('abort'))));
 const result=await resolveOrder({remote:true,base:'https://api.example',period:1,last:null,local,fetcher,timeout:10});assert.equal(result.source,'local');
 const controller=new AbortController();const pending=resolveOrder({remote:true,base:'https://api.example',period:1,last:null,local:()=>{throw Error('não recuperar cancelado');},fetcher,signal:controller.signal});controller.abort();await assert.rejects(pending);
});
test('falha de ambos propaga erro para preservar cartões já exibidos',async()=>{
 await assert.rejects(resolveOrder({remote:true,base:'https://api.example',period:1,last:null,local:()=>{throw Error('modelo ausente');},fetcher:async()=>({ok:false})}));
 await assert.rejects(resolveOrder({remote:false,period:1,last:null,local:()=>[1,1,2,3,4]}));
});
