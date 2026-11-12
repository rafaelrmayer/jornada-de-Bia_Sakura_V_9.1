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
